// Dispatches queued rows from public.notifications (written by DB triggers,
// cf. 20260922100000_transactional_notifications.sql) via Resend (email) and
// Web Push (browser notifications, cf. supabase/migrations/..._push_subscriptions.sql).
//
// Meant to be invoked by a scheduled job (pg_cron + pg_net) or manually by
// an admin — never by an end user, hence the service-role-only auth check
// below instead of a per-user role check.
//
// Until RESEND_API_KEY is configured, every row is marked
// 'skipped_no_provider' instead of erroring — the outbox (and the admin
// /admin/notifications view of it) works today regardless of whether a real
// provider is wired up, exactly like the Stripe skeleton before a real key
// existed. Web Push follows the same rule: without VAPID_PRIVATE_KEY set,
// that channel is silently skipped and email remains the only channel —
// `notifications.status` only ever reflects the email outcome, push is a
// best-effort side channel that never blocks or fails the row.
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import webpush from "https://esm.sh/web-push@3.6.7";
import { corsHeaders } from "../_shared/cors.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const FROM_EMAIL = Deno.env.get("NOTIFICATIONS_FROM_EMAIL") ?? "Amani Resorts <notifications@amani-resorts.com>";

// Web Push (cahier §7.10) — même principe "meilleur effort, jamais bloquant"
// que l'email : sans VAPID_PRIVATE_KEY configurée, on ignore silencieusement
// ce canal (le mail reste le canal principal).
const VAPID_PUBLIC_KEY = Deno.env.get("VAPID_PUBLIC_KEY");
const VAPID_PRIVATE_KEY = Deno.env.get("VAPID_PRIVATE_KEY");
const VAPID_SUBJECT = Deno.env.get("VAPID_SUBJECT") ?? "mailto:notifications@amani-resorts.com";
const isWebPushConfigured = Boolean(VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY);
if (isWebPushConfigured) {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY!, VAPID_PRIVATE_KEY!);
}

interface NotificationRow {
  id: string;
  user_id: string | null;
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

function renderPushPayload(
  type: string,
  payload: Record<string, unknown>,
): { title: string; body: string; url: string } {
  switch (type) {
    case "reservation_confirmed":
      return {
        title: "Réservation confirmée",
        body: `Du ${payload.check_in_date} au ${payload.check_out_date}.`,
        url: "/profile",
      };
    case "payment_succeeded":
      return {
        title: "Paiement reçu",
        body: `${payload.amount} ${String(payload.currency ?? "eur").toUpperCase()} — merci !`,
        url: "/profile",
      };
    case "refund_processed":
      return { title: "Remboursement traité", body: `${payload.amount} € vous ont été remboursés.`, url: "/profile" };
    case "donation_confirmed":
      return { title: "Merci pour votre don", body: `Don confirmé à ${payload.ngo_name}.`, url: "/profile" };
    case "action_validated":
      return {
        title: "Participation validée",
        body: `« ${payload.action_title} » a été validée.`,
        url: "/profile",
      };
    case "account_banned":
      return { title: "Compte suspendu", body: "Votre compte Amani a été suspendu.", url: "/" };
    default:
      return { title: "Amani Resorts", body: "Vous avez une nouvelle notification.", url: "/" };
  }
}

async function dispatchWebPush(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  type: string,
  payload: Record<string, unknown>,
): Promise<{ sent: number; failed: number }> {
  const { data: subs } = await supabase
    .from("push_subscriptions")
    .select("endpoint, p256dh, auth_key")
    .eq("user_id", userId);

  let sent = 0;
  let failed = 0;
  for (const sub of subs ?? []) {
    try {
      await webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth_key },
        },
        JSON.stringify(renderPushPayload(type, payload)),
      );
      sent++;
    } catch (err) {
      const statusCode = (err as { statusCode?: number }).statusCode;
      if (statusCode === 404 || statusCode === 410) {
        // Abonnement expiré/révoqué côté navigateur — on le retire.
        await supabase.from("push_subscriptions").delete().eq("endpoint", sub.endpoint);
      } else {
        console.error(`push failed for ${sub.endpoint.slice(0, 40)}…:`, err);
      }
      failed++;
    }
  }
  return { sent, failed };
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
      .select("id, user_id, recipient_email, type, subject, payload")
      .eq("status", "pending")
      .order("created_at")
      .limit(25);
    if (error) throw error;

    let sent = 0;
    let failed = 0;
    let skipped = 0;
    let pushSent = 0;
    let pushFailed = 0;

    for (const n of (pending ?? []) as NotificationRow[]) {
      if (isWebPushConfigured && n.user_id) {
        const push = await dispatchWebPush(supabase, n.user_id, n.type, n.payload ?? {});
        pushSent += push.sent;
        pushFailed += push.failed;
      }

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

    return new Response(JSON.stringify({ sent, failed, skipped, pushSent, pushFailed }), {
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
