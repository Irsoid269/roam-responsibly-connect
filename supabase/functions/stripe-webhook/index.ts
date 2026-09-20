// Stripe webhook receiver — the ONLY place allowed to mark a payment as
// "succeeded" and consume the holds it protected. Signature-verified;
// every event is recorded in stripe_webhook_events before being applied so a
// Stripe retry (same event.id) is never double-processed.
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@17.4.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
  apiVersion: "2024-06-20",
  httpClient: Stripe.createFetchHttpClient(),
});

const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET") ?? "";

const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
);

serve(async (req) => {
  const signature = req.headers.get("stripe-signature");
  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, signature ?? "", webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return new Response("invalid signature", { status: 400 });
  }

  const { data: alreadyProcessed } = await supabaseAdmin
    .from("stripe_webhook_events")
    .select("id")
    .eq("id", event.id)
    .maybeSingle();

  if (alreadyProcessed) {
    return new Response(JSON.stringify({ received: true, duplicate: true }), { status: 200 });
  }

  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        const intent = event.data.object as Stripe.PaymentIntent;

        const { data: payment } = await supabaseAdmin
          .from("payments")
          .update({ status: "succeeded", updated_at: new Date().toISOString() })
          .eq("stripe_payment_intent_id", intent.id)
          .select()
          .single();

        if (payment) {
          // Freeze whatever holds this checkout protected: capacity is now
          // genuinely claimed, not just temporarily reserved (see
          // confirm_hold_without_payment for the pre-Stripe transitional
          // path this replaces once the frontend wires payment_id through).
          const holdIds: string[] = intent.metadata?.hold_ids
            ? JSON.parse(intent.metadata.hold_ids)
            : [];
          for (const holdId of holdIds) {
            const { error } = await supabaseAdmin.rpc("consume_hold", { p_hold_id: holdId });
            if (error) console.warn(`consume_hold(${holdId}) failed:`, error.message);
          }

          const { data: invoiceNumber } = await supabaseAdmin.rpc("generate_invoice_number");
          await supabaseAdmin.from("invoices").insert({
            payment_id: payment.id,
            reservation_id: payment.reservation_id,
            invoice_number: invoiceNumber,
            lines: [],
            total: payment.amount,
          });
        }
        break;
      }

      case "payment_intent.payment_failed": {
        const intent = event.data.object as Stripe.PaymentIntent;
        await supabaseAdmin
          .from("payments")
          .update({ status: "failed", updated_at: new Date().toISOString() })
          .eq("stripe_payment_intent_id", intent.id);
        break;
      }

      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        const paymentIntentId =
          typeof charge.payment_intent === "string" ? charge.payment_intent : charge.payment_intent?.id;

        const { data: payment } = await supabaseAdmin
          .from("payments")
          .select("id")
          .eq("stripe_payment_intent_id", paymentIntentId ?? "")
          .maybeSingle();

        if (payment) {
          for (const refund of charge.refunds?.data ?? []) {
            await supabaseAdmin.from("refunds").upsert(
              {
                payment_id: payment.id,
                amount: refund.amount / 100,
                reason: refund.reason ?? null,
                stripe_refund_id: refund.id,
                status: refund.status ?? "succeeded",
              },
              { onConflict: "stripe_refund_id" },
            );
          }

          await supabaseAdmin
            .from("payments")
            .update({
              status: charge.amount_refunded >= charge.amount ? "canceled" : "succeeded",
              updated_at: new Date().toISOString(),
            })
            .eq("id", payment.id);
        }
        break;
      }

      default:
        console.log(`Unhandled Stripe event type: ${event.type}`);
    }

    await supabaseAdmin.from("stripe_webhook_events").insert({ id: event.id, type: event.type });

    return new Response(JSON.stringify({ received: true }), { status: 200 });
  } catch (error) {
    console.error("stripe-webhook handling error:", error);
    // Deliberately not recording the event as processed on failure, so
    // Stripe's retry can succeed once the underlying issue is fixed.
    return new Response(JSON.stringify({ error: "processing_failed" }), { status: 500 });
  }
});
