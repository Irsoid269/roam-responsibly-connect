// Creates (or replays) a Stripe PaymentIntent for the authenticated user's cart.
//
// Amount is recalculated server-side from the holds' offer_schedules.price_eur
// (the only server-side price of record we have) and compared to the
// client-sent amount — a mismatch is rejected outright. This only covers
// items backed by a real hold (the Phase 1 offer_schedules/inventory_holds
// flow that BookingPage.tsx uses); items with no hold at all still have no
// server-side price of record to check against (would need a proper
// server-side cart/booking_items table per cahier §7.5) and are trusted from
// the client as before — narrower gap than the original "trust everything".
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@17.4.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders } from "../_shared/cors.ts";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
  apiVersion: "2024-06-20",
  httpClient: Stripe.createFetchHttpClient(),
});

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return jsonResponse({ error: "missing_authorization" }, 401);
    }

    // Verify the caller's identity with their own JWT (RLS-scoped client) —
    // never trust a user_id passed in the request body.
    const supabaseAuth = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } },
    );

    const { data: userData, error: userError } = await supabaseAuth.auth.getUser();
    if (userError || !userData.user) {
      return jsonResponse({ error: "unauthenticated" }, 401);
    }
    const user = userData.user;

    const body = await req.json();
    const amount = Number(body.amount);
    const currency = (body.currency || "eur").toLowerCase();
    const reservationId: string | null = body.reservationId ?? null;
    const idempotencyKey: string | undefined = body.idempotencyKey;
    const holdIds: string[] = Array.isArray(body.holdIds) ? body.holdIds : [];

    if (!amount || amount <= 0) {
      return jsonResponse({ error: "invalid_amount" }, 400);
    }
    if (!idempotencyKey) {
      // Required per cahier §7.6 — prevents double-charging on client retry.
      return jsonResponse({ error: "idempotency_key_required" }, 400);
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    if (holdIds.length > 0) {
      const { data: holds, error: holdsError } = await supabaseAdmin
        .from("inventory_holds")
        .select("id, quantity, user_id, status, offer_schedules(price_eur)")
        .in("id", holdIds);
      if (holdsError) throw holdsError;

      if (!holds || holds.length !== holdIds.length) {
        return jsonResponse({ error: "hold_not_found" }, 400);
      }
      for (const hold of holds) {
        if (hold.user_id !== user.id) {
          return jsonResponse({ error: "hold_not_owned" }, 403);
        }
        if (hold.status !== "active") {
          return jsonResponse({ error: "hold_not_active" }, 400);
        }
      }

      const serverAmount = holds.reduce((sum, hold) => {
        const priceEur = Number(
          (hold as unknown as { offer_schedules: { price_eur: number } | null }).offer_schedules
            ?.price_eur ?? 0,
        );
        return sum + priceEur * hold.quantity;
      }, 0);

      // Rounding tolerance only (cents) — anything beyond that is a real
      // mismatch, not float noise.
      if (Math.abs(serverAmount - amount) > 0.01) {
        console.error("create-payment-intent amount mismatch", { serverAmount, clientAmount: amount, holdIds });
        return jsonResponse({ error: "amount_mismatch" }, 400);
      }
    }

    // Replay-safe: if this exact checkout attempt already has a PaymentIntent,
    // hand back the same client_secret instead of creating a second charge.
    const { data: existing } = await supabaseAdmin
      .from("payments")
      .select("*")
      .eq("idempotency_key", idempotencyKey)
      .maybeSingle();

    if (existing?.stripe_payment_intent_id) {
      const intent = await stripe.paymentIntents.retrieve(existing.stripe_payment_intent_id);
      return jsonResponse({ clientSecret: intent.client_secret, paymentId: existing.id });
    }

    const amountInCents = Math.round(amount * 100);

    const paymentIntent = await stripe.paymentIntents.create(
      {
        amount: amountInCents,
        currency,
        automatic_payment_methods: { enabled: true },
        metadata: {
          user_id: user.id,
          reservation_id: reservationId ?? "",
          hold_ids: JSON.stringify(holdIds),
        },
      },
      { idempotencyKey },
    );

    const { data: payment, error: insertError } = await supabaseAdmin
      .from("payments")
      .insert({
        reservation_id: reservationId,
        user_id: user.id,
        stripe_payment_intent_id: paymentIntent.id,
        amount,
        currency,
        status: paymentIntent.status,
        idempotency_key: idempotencyKey,
      })
      .select()
      .single();

    if (insertError) throw insertError;

    return jsonResponse({ clientSecret: paymentIntent.client_secret, paymentId: payment.id });
  } catch (error) {
    console.error("create-payment-intent error:", error);
    return jsonResponse(
      { error: error instanceof Error ? error.message : "unknown_error" },
      500,
    );
  }
});
