// Dispatches queued rows from public.notifications (written by DB triggers,
// cf. 20260922100000_transactional_notifications.sql) via Resend.
//
// Meant to be invoked by a scheduled job (pg_cron + pg_net) or manually by
// an admin — never by an end user, hence the service-role-only auth check
// below instead of a per-user role check.
//
// Until RESEND_API_KEY is configured, every row is marked
// 'skipped_no_provider' instead of erroring — the outbox (and the admin
// /admin/notifications view of it) works today regardless of whether a real
// provider is wired up, exactly like the Stripe skeleton before a real key
// existed.
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders } from "../_shared/cors.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const FROM_EMAIL = Deno.env.get("NOTIFICATIONS_FROM_EMAIL") ?? "Amani Resorts <notifications@amani-resorts.com>";

interface NotificationRow {
  id: string;
  recipient_email: string | null;
  type: string;
  subject: string;
  payload: Record<string, unknown>;
}

function renderEmailHtml(type: string, payload: Record<string, unknown>): string {
  switch (type) {
    case "reservation_confirmed":
      return `<p>Votre réservation du ${payload.check_in_date} au ${payload.check_out_date} est confirmée.</p>
        <p>Total : ${payload.total_price} €</p>`;
    case "payment_succeeded":
      return `<p>Nous avons bien reçu votre paiement de ${payload.amount} ${String(payload.currency ?? "eur").toUpperCase()}.</p>`;
    case "refund_processed":
      return `<p>Votre remboursement de ${payload.amount} € a été traité.</p>`;
    case "donation_confirmed":
      return `<p>Merci pour votre don de ${payload.amount} € à ${payload.ngo_name}.</p>
        ${payload.co2_offset_kg ? `<p>Compensation estimée : ${payload.co2_offset_kg} kg de CO₂.</p>` : ""}`;
    case "action_validated":
      return `<p>Votre participation à « ${payload.action_title} » a été validée. Merci pour votre engagement !</p>`;
    case "account_banned":
      return `<p>Votre compte Amani a été suspendu.</p>${payload.reason ? `<p>Motif : ${payload.reason}</p>` : ""}`;
    default:
      return `<p>${JSON.stringify(payload)}</p>`;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    const expected = `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""}`;
    if (!authHeader || authHeader !== expected) {
      return new Response(JSON.stringify({ error: "forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const { data: pending, error } = await supabase
      .from("notifications")
      .select("id, recipient_email, type, subject, payload")
      .eq("status", "pending")
      .order("created_at")
      .limit(25);
    if (error) throw error;

    let sent = 0;
    let failed = 0;
    let skipped = 0;

    for (const n of (pending ?? []) as NotificationRow[]) {
      if (!n.recipient_email) {
        await supabase
          .from("notifications")
          .update({ status: "failed", error: "no_recipient_email" })
          .eq("id", n.id);
        failed++;
        continue;
      }

      if (!RESEND_API_KEY) {
        await supabase.from("notifications").update({ status: "skipped_no_provider" }).eq("id", n.id);
        skipped++;
        continue;
      }

      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: FROM_EMAIL,
          to: n.recipient_email,
          subject: n.subject,
          html: renderEmailHtml(n.type, n.payload ?? {}),
        }),
      });

      if (res.ok) {
        await supabase
          .from("notifications")
          .update({ status: "sent", sent_at: new Date().toISOString() })
          .eq("id", n.id);
        sent++;
      } else {
        const errText = await res.text();
        await supabase
          .from("notifications")
          .update({ status: "failed", error: errText.slice(0, 500) })
          .eq("id", n.id);
        failed++;
      }
    }

    return new Response(JSON.stringify({ sent, failed, skipped }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("send-notifications error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "unknown_error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
