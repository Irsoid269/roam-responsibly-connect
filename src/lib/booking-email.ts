import type { BookingConfirmationData } from "@/components/branding/BookingConfirmation";

/**
 * Template HTML email de confirmation — styles Amani Resorts (inline pour clients mail).
 */
export function buildBookingConfirmationEmail(data: BookingConfirmationData): {
  subject: string;
  html: string;
  text: string;
} {
  const subject = `Confirmation Amani Resorts — ${data.reference}`;

  const itemRows = data.items
    .map(
      (item) => `
      <tr>
        <td style="padding:10px 12px;border-bottom:1px solid #e8e2d6;font-family:Raleway,Arial,sans-serif;font-size:14px;color:#1e293b">
          ${escapeHtml(item.name)}
          <div style="font-size:12px;color:#5c6b7a">${escapeHtml(item.type)} · ×${item.quantity}</div>
        </td>
        <td style="padding:10px 12px;border-bottom:1px solid #e8e2d6;font-family:Raleway,Arial,sans-serif;font-size:14px;color:#1e293b;text-align:right;white-space:nowrap">
          ${(item.unitPrice * item.quantity).toFixed(2)} €
        </td>
      </tr>`,
    )
    .join("");

  const html = `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width" />
<title>${escapeHtml(subject)}</title></head>
<body style="margin:0;padding:0;background:#f5f1e8">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f5f1e8;padding:32px 16px">
    <tr><td align="center">
      <table role="presentation" width="560" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border-radius:4px;overflow:hidden;border:1px solid #e8e2d6">
        <tr>
          <td style="background:#1e293b;padding:28px 32px">
            <p style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:26px;color:#f5f1e8">
              AMANI <span style="color:#b8924a">Resorts</span>
            </p>
            <p style="margin:8px 0 0;font-family:Raleway,Arial,sans-serif;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#c5cdd6">
              Éco-luxe aux Comores
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding:28px 32px">
            <h1 style="margin:0 0 8px;font-family:Georgia,'Times New Roman',serif;font-size:24px;font-weight:500;color:#1e293b">
              Réservation confirmée
            </h1>
            <p style="margin:0 0 20px;font-family:Raleway,Arial,sans-serif;font-size:14px;color:#5c6b7a;line-height:1.5">
              Bonjour ${escapeHtml(data.guestName)}, merci pour votre confiance.
              Voici le récapitulatif de votre séjour (réf. <strong style="color:#1e293b">${escapeHtml(data.reference)}</strong>).
            </p>
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f5f1e8;border-radius:4px;margin-bottom:20px">
              <tr>
                <td style="padding:16px;font-family:Raleway,Arial,sans-serif;font-size:13px;color:#5c6b7a">
                  <strong style="color:#1e293b">Séjour</strong><br/>
                  ${escapeHtml(data.checkIn || "—")} → ${escapeHtml(data.checkOut || "—")}
                  ${data.destination ? `<br/>Destination : ${escapeHtml(data.destination)}` : ""}
                </td>
              </tr>
            </table>
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #e8e2d6;border-radius:4px;overflow:hidden;margin-bottom:20px">
              ${itemRows}
              <tr>
                <td style="padding:10px 12px;font-family:Raleway,Arial,sans-serif;font-size:13px;color:#5c6b7a">
                  Compensation carbone (${data.totalCarbon.toFixed(1)} kg CO₂e)
                </td>
                <td style="padding:10px 12px;font-family:Raleway,Arial,sans-serif;font-size:13px;color:#1e293b;text-align:right">
                  ${data.carbonOffset.toFixed(2)} €
                </td>
              </tr>
              <tr>
                <td style="padding:14px 12px;font-family:Raleway,Arial,sans-serif;font-size:16px;font-weight:600;color:#1e293b;background:#f5f1e8">
                  Total
                </td>
                <td style="padding:14px 12px;font-family:Raleway,Arial,sans-serif;font-size:16px;font-weight:600;color:#1e293b;text-align:right;background:#f5f1e8">
                  ${data.total.toFixed(2)} €
                </td>
              </tr>
            </table>
            <p style="margin:0;font-family:Raleway,Arial,sans-serif;font-size:13px;color:#5c6b7a;line-height:1.6">
              Votre facture est disponible depuis votre espace personnel.
              Pour toute question : <a href="mailto:hello@amaniresorts.com" style="color:#b8924a">hello@amaniresorts.com</a>
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding:16px 32px;background:#1e293b;text-align:center">
            <p style="margin:0;font-family:Raleway,Arial,sans-serif;font-size:11px;color:#c5cdd6">
              © Amani Resorts · Union des Comores
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const text = [
    `Amani Resorts — Confirmation ${data.reference}`,
    ``,
    `Bonjour ${data.guestName},`,
    `Votre réservation est confirmée.`,
    `Séjour : ${data.checkIn || "—"} → ${data.checkOut || "—"}`,
    data.destination ? `Destination : ${data.destination}` : "",
    ``,
    ...data.items.map(
      (i) => `- ${i.name} (×${i.quantity}) : ${(i.unitPrice * i.quantity).toFixed(2)} €`,
    ),
    `Compensation carbone : ${data.carbonOffset.toFixed(2)} €`,
    `Total : ${data.total.toFixed(2)} €`,
    ``,
    `Contact : hello@amaniresorts.com`,
  ]
    .filter(Boolean)
    .join("\n");

  return { subject, html, text };
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
