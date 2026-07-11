import type { BookingConfirmationData, BookingLineItem } from "@/components/branding/BookingConfirmation";

function escapeHtml(value: string) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function money(n: number) {
  const v = Number.isFinite(n) ? n : 0;
  return v.toFixed(2);
}

function formatDateFr(value: string) {
  if (!value) return "—";
  const d = new Date(value.includes("T") ? value : `${value}T12:00:00`);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function buildInvoiceHtml(
  data: BookingConfirmationData,
  invoiceNumber: string,
) {
  const dateLabel = new Date().toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const items =
    data.items?.length > 0
      ? data.items
      : ([
          {
            name: "Séjour Amani",
            type: "séjour",
            quantity: 1,
            unitPrice: data.subtotal || data.total || 0,
            carbonImpact: data.totalCarbon || 0,
          },
        ] satisfies BookingLineItem[]);

  const rows = items
    .map(
      (item) => `
      <tr>
        <td style="padding:12px 0;border-bottom:1px solid #e8e0d4">
          <strong>${escapeHtml(item.name)}</strong>
          <span style="color:#6b7280"> (${escapeHtml(item.type)})</span>
        </td>
        <td style="padding:12px 0;border-bottom:1px solid #e8e0d4">${item.quantity || 1}</td>
        <td style="padding:12px 0;border-bottom:1px solid #e8e0d4;text-align:right">${money(item.unitPrice)} €</td>
        <td style="padding:12px 0;border-bottom:1px solid #e8e0d4;text-align:right">${money(item.unitPrice * (item.quantity || 1))} €</td>
      </tr>`,
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <title>Facture ${escapeHtml(invoiceNumber)} — Amani Resorts</title>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600&family=Raleway:wght@400;500;600&display=swap" rel="stylesheet" />
  <style>
    body { font-family: Raleway, system-ui, sans-serif; color: #1e2a3a; background: #f7f3eb; margin: 0; padding: 32px; }
    h1, .brand { font-family: "Cormorant Garamond", serif; }
    @media print {
      body { padding: 16px; background: white; }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body>
  <div class="no-print" style="margin-bottom:20px;display:flex;gap:8px">
    <button onclick="window.print()" style="padding:10px 16px;border:none;border-radius:8px;background:#1e2a3a;color:#f7f3eb;font-weight:600;cursor:pointer">
      Imprimer / PDF
    </button>
  </div>
  <header style="display:flex;justify-content:space-between;align-items:flex-start;border-bottom:1px solid #e8e0d4;padding-bottom:24px;margin-bottom:32px">
    <div>
      <p class="brand" style="font-size:28px;margin:0">AMANI <span style="color:#b08948">Resorts</span></p>
      <p style="font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#6b7280;margin:4px 0 0">Éco-luxe boutique · Comores</p>
    </div>
    <div style="text-align:right;font-size:14px">
      <strong>Facture</strong><br/>
      <span style="color:#6b7280">${escapeHtml(invoiceNumber)}</span><br/>
      <span style="color:#6b7280">${escapeHtml(dateLabel)}</span>
    </div>
  </header>
  <section style="display:grid;grid-template-columns:1fr 1fr;gap:24px;font-size:14px;margin-bottom:32px">
    <div>
      <p style="font-size:11px;letter-spacing:0.15em;text-transform:uppercase;color:#6b7280">Émetteur</p>
      <p style="margin:4px 0"><strong>Amani Resorts SARL</strong></p>
      <p style="margin:0">Grande Comore, Union des Comores</p>
      <p style="margin:0">hello@amaniresorts.com</p>
    </div>
    <div>
      <p style="font-size:11px;letter-spacing:0.15em;text-transform:uppercase;color:#6b7280">Client</p>
      <p style="margin:4px 0"><strong>${escapeHtml(data.guestName)}</strong></p>
      <p style="margin:0">${escapeHtml(data.guestEmail)}</p>
      ${data.destination ? `<p style="margin:0">Destination : ${escapeHtml(data.destination)}</p>` : ""}
      <p style="margin:0">Séjour : ${escapeHtml(formatDateFr(data.checkIn))} → ${escapeHtml(formatDateFr(data.checkOut))}</p>
    </div>
  </section>
  <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:32px">
    <thead>
      <tr style="border-bottom:2px solid #1e2a3a;text-align:left">
        <th style="padding:8px 0">Désignation</th>
        <th style="padding:8px 0">Qté</th>
        <th style="padding:8px 0;text-align:right">P.U.</th>
        <th style="padding:8px 0;text-align:right">Total</th>
      </tr>
    </thead>
    <tbody>
      ${rows}
      <tr>
        <td colspan="3" style="padding:12px 0;border-bottom:1px solid #e8e0d4">
          Compensation carbone (${money(data.totalCarbon)} kg CO₂e)
        </td>
        <td style="padding:12px 0;border-bottom:1px solid #e8e0d4;text-align:right">${money(data.carbonOffset)} €</td>
      </tr>
    </tbody>
  </table>
  <div style="display:flex;justify-content:flex-end;margin-bottom:40px">
    <div style="width:240px;font-size:14px">
      <div style="display:flex;justify-content:space-between;color:#6b7280">
        <span>Sous-total</span><span>${money(data.subtotal)} €</span>
      </div>
      <div style="display:flex;justify-content:space-between;border-top:1px solid #e8e0d4;padding-top:8px;margin-top:8px;font-size:18px;font-weight:600">
        <span>Total TTC</span><span>${money(data.total)} €</span>
      </div>
    </div>
  </div>
  <footer style="border-top:1px solid #e8e0d4;padding-top:16px;text-align:center;font-size:12px;color:#6b7280">
    Merci de votre confiance — Amani Resorts. Réf. ${escapeHtml(data.reference)}.
  </footer>
</body>
</html>`;
}

export type InvoiceResult = { ok: true; mode: "download" | "print" } | { ok: false; reason: string };

/** Télécharge la facture en fichier HTML (fiable) et tente l'impression. */
export function printAmaniInvoice(
  data: BookingConfirmationData,
  invoiceNumber?: string,
): InvoiceResult {
  try {
    const number = invoiceNumber || `FAC-${data.reference}`;
    const html = buildInvoiceHtml(data, number);
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    // 1) Download always works (no popup blocker)
    const a = document.createElement("a");
    a.href = url;
    a.download = `${number.replace(/[^\w.-]+/g, "_")}-Amani-Resorts.html`;
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    a.remove();

    // 2) Best-effort print window (may be blocked)
    const win = window.open(url, "_blank", "noopener,noreferrer,width=900,height=700");
    if (win) {
      const triggerPrint = () => {
        try {
          win.focus();
          win.print();
        } catch {
          /* ignore */
        }
      };
      // Give the blob document time to load
      setTimeout(triggerPrint, 400);
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
      return { ok: true, mode: "print" };
    }

    setTimeout(() => URL.revokeObjectURL(url), 30_000);
    return { ok: true, mode: "download" };
  } catch (e) {
    return {
      ok: false,
      reason: e instanceof Error ? e.message : "Impossible de générer la facture",
    };
  }
}

/** Construit les données facture depuis une réservation profil. */
export function buildInvoiceFromReservation(input: {
  reservation: {
    id: string;
    check_in_date: string;
    check_out_date: string;
    total_price: number | null;
    total_carbon_impact: number | null;
    items: Array<{
      item_name: string;
      item_type: string;
      quantity: number | null;
      unit_price: number | null;
      total_price: number | null;
      carbon_impact: number | null;
    }>;
  };
  guestName: string;
  guestEmail: string;
  destinationLabel?: string;
}): BookingConfirmationData {
  const r = input.reservation;
  const totalCarbon = Number(r.total_carbon_impact || 0);
  const carbonOffset = Number((totalCarbon * 2).toFixed(2));
  const total = Number(r.total_price || 0);
  const items: BookingLineItem[] = (r.items || []).map((item) => {
    const qty = Math.max(1, Number(item.quantity || 1));
    const unit =
      item.unit_price != null
        ? Number(item.unit_price)
        : Number(item.total_price || 0) / qty;
    return {
      name: item.item_name || "Service Amani",
      type: item.item_type || "service",
      quantity: qty,
      unitPrice: Number.isFinite(unit) ? unit : 0,
      carbonImpact: Number(item.carbon_impact || 0),
    };
  });

  const itemsSubtotal = items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
  const subtotal =
    items.length > 0
      ? itemsSubtotal
      : Math.max(0, total - carbonOffset);

  return {
    reference: `AMN-${r.id.slice(0, 8).toUpperCase()}`,
    guestName: input.guestName,
    guestEmail: input.guestEmail,
    checkIn: r.check_in_date,
    checkOut: r.check_out_date,
    destination: input.destinationLabel || "Comores",
    items:
      items.length > 0
        ? items
        : [
            {
              name: "Séjour Amani",
              type: "séjour",
              quantity: 1,
              unitPrice: subtotal,
              carbonImpact: totalCarbon,
            },
          ],
    subtotal,
    carbonOffset,
    total: total || subtotal + carbonOffset,
    totalCarbon,
  };
}
