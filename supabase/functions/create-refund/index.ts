// Admin/Finance-triggered refund (full or partial) for a succeeded payment.
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@17.4.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders } from "../_shared/cors.ts";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
  apiVersion: "2024-06-20",
  httpClient: Stripe.createFetchHttpClient(),
});

const REFUND_REASONS = ["duplicate", "fraudulent", "requested_by_customer"] as const;
type RefundReason = (typeof REFUND_REASONS)[number];

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
    if (!authHeader) return jsonResponse({ error: "missing_authorization" }, 401);

    // RLS-scoped client for identity + role check — never trust a client-sent role.
    const supabaseAuth = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } },
    );

    const { data: userData, error: userError } = await supabaseAuth.auth.getUser();
    if (userError || !userData.user) return jsonResponse({ error: "unauthenticated" }, 401);
    const user = userData.user;

    const [{ data: isAdmin, error: adminRoleError }, { data: isFinance, error: financeRoleError }] =
      await Promise.all([
        supabaseAuth.rpc("has_role", { _user_id: user.id, _role: "admin" }),
        supabaseAuth.rpc("has_role", { _user_id: user.id, _role: "finance" }),
      ]);
    if (adminRoleError || financeRoleError || !(isAdmin || isFinance)) {
      return jsonResponse({ error: "forbidden" }, 403);
    }

    const body = await req.json();
    const paymentId: string | undefined = body.paymentId;
    const amount: number | undefined = body.amount != null ? Number(body.amount) : undefined;
    const reason: RefundReason | undefined = REFUND_REASONS.includes(body.reason)
      ? body.reason
      : undefined;
    const idempotencyKey: string | undefined = body.idempotencyKey;

    if (!paymentId) return jsonResponse({ error: "payment_id_required" }, 400);
    if (!idempotencyKey) {
      // Required per cahier §7.6, same as checkout — a double-click must never
      // create two separate refunds for the same request.
      return jsonResponse({ error: "idempotency_key_required" }, 400);
    }
    if (amount != null && amount <= 0) {
      return jsonResponse({ error: "invalid_amount" }, 400);
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const { data: payment, error: paymentError } = await supabaseAdmin
      .from("payments")
      .select("*")
      .eq("id", paymentId)
      .single();

    if (paymentError || !payment) return jsonResponse({ error: "payment_not_found" }, 404);
    if (!payment.stripe_payment_intent_id) {
      return jsonResponse({ error: "no_stripe_payment_intent" }, 400);
    }
    if (payment.status !== "succeeded") {
      return jsonResponse({ error: "payment_not_succeeded" }, 400);
    }

    const refund = await stripe.refunds.create(
      {
        payment_intent: payment.stripe_payment_intent_id,
        amount: amount != null ? Math.round(amount * 100) : undefined,
        reason,
      },
      { idempotencyKey },
    );

    // Same upsert key the webhook uses (stripe_refund_id) — whichever of the
    // two (this direct call or the later charge.refunded event) arrives
    // first creates the row, the other just confirms it. No duplicates.
    const { error: insertError } = await supabaseAdmin.from("refunds").upsert(
      {
        payment_id: payment.id,
        amount: refund.amount / 100,
        reason: refund.reason ?? reason ?? null,
        stripe_refund_id: refund.id,
        status: refund.status ?? "pending",
      },
      { onConflict: "stripe_refund_id" },
    );
    if (insertError) throw insertError;

    const intent = await stripe.paymentIntents.retrieve(payment.stripe_payment_intent_id);
    const latestChargeId =
      typeof intent.latest_charge === "string" ? intent.latest_charge : intent.latest_charge?.id;
    const charge = latestChargeId ? await stripe.charges.retrieve(latestChargeId) : null;

    if (charge && charge.amount_refunded >= charge.amount) {
      await supabaseAdmin
        .from("payments")
        .update({ status: "canceled", updated_at: new Date().toISOString() })
        .eq("id", payment.id);
    }

    return jsonResponse({
      refundId: refund.id,
      status: refund.status,
      amount: refund.amount / 100,
    });
  } catch (error) {
    console.error("create-refund error:", error);
    return jsonResponse(
      { error: error instanceof Error ? error.message : "unknown_error" },
      500,
    );
  }
});
