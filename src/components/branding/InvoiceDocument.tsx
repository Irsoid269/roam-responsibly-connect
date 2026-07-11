import amaniSymbol from "@/assets/amani-symbol-gold.jpg";
import type { BookingConfirmationData } from "./BookingConfirmation";

interface InvoiceDocumentProps {
  data: BookingConfirmationData;
  invoiceNumber?: string;
  issuedAt?: Date;
}

/**
 * Facture imprimable Amani Resorts (aperçu in-app).
 * Pour l'impression navigateur, utiliser printAmaniInvoice depuis @/lib/print-invoice.
 */
const InvoiceDocument = ({
  data,
  invoiceNumber,
  issuedAt = new Date(),
}: InvoiceDocumentProps) => {
  const number = invoiceNumber || `FAC-${data.reference}`;
  const dateLabel = issuedAt.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <div
      id="amani-invoice"
      className="mx-auto max-w-[210mm] bg-background p-8 text-foreground print:max-w-none print:p-0"
    >
      <header className="mb-8 flex items-start justify-between border-b border-border pb-6">
        <div className="flex items-center gap-3">
          <img
            src={amaniSymbol}
            alt="Amani Resorts"
            className="h-14 w-14 rounded-full object-cover"
          />
          <div>
            <p className="font-display text-3xl font-medium tracking-tight">
              AMANI <span className="text-accent">Resorts</span>
            </p>
            <p className="text-xs uppercase tracking-luxury text-muted-foreground">
              Éco-luxe boutique · Comores
            </p>
          </div>
        </div>
        <div className="text-right text-sm">
          <p className="font-semibold">Facture</p>
          <p className="text-muted-foreground">{number}</p>
          <p className="text-muted-foreground">{dateLabel}</p>
        </div>
      </header>

      <section className="mb-8 grid gap-6 sm:grid-cols-2 text-sm">
        <div>
          <p className="mb-1 text-xs uppercase tracking-luxury text-muted-foreground">
            Émetteur
          </p>
          <p className="font-medium">Amani Resorts SARL</p>
          <p>Grande Comore, Union des Comores</p>
          <p>hello@amaniresorts.com</p>
        </div>
        <div>
          <p className="mb-1 text-xs uppercase tracking-luxury text-muted-foreground">
            Client
          </p>
          <p className="font-medium">{data.guestName}</p>
          <p>{data.guestEmail}</p>
          {data.destination && <p>Destination : {data.destination}</p>}
          <p>
            Séjour : {data.checkIn || "—"} → {data.checkOut || "—"}
          </p>
        </div>
      </section>

      <table className="mb-8 w-full border-collapse text-sm">
        <thead>
          <tr className="border-b-2 border-primary text-left">
            <th className="py-2 font-medium">Désignation</th>
            <th className="py-2 font-medium">Qté</th>
            <th className="py-2 font-medium text-right">P.U.</th>
            <th className="py-2 font-medium text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          {data.items.map((item, i) => (
            <tr key={i} className="border-b border-border">
              <td className="py-3">
                <span className="font-medium">{item.name}</span>
                <span className="ml-2 text-muted-foreground">({item.type})</span>
              </td>
              <td className="py-3">{item.quantity}</td>
              <td className="py-3 text-right">{item.unitPrice.toFixed(2)} €</td>
              <td className="py-3 text-right">
                {(item.unitPrice * item.quantity).toFixed(2)} €
              </td>
            </tr>
          ))}
          <tr className="border-b border-border">
            <td className="py-3" colSpan={3}>
              Compensation carbone ({data.totalCarbon.toFixed(1)} kg CO₂e)
            </td>
            <td className="py-3 text-right">{data.carbonOffset.toFixed(2)} €</td>
          </tr>
        </tbody>
      </table>

      <div className="mb-10 flex justify-end">
        <div className="w-64 space-y-1 text-sm">
          <div className="flex justify-between text-muted-foreground">
            <span>Sous-total HT</span>
            <span>{data.subtotal.toFixed(2)} €</span>
          </div>
          <div className="flex justify-between border-t border-border pt-2 text-lg font-semibold">
            <span>Total TTC</span>
            <span>{data.total.toFixed(2)} €</span>
          </div>
        </div>
      </div>

      <footer className="border-t border-border pt-4 text-center text-xs text-muted-foreground">
        <p>
          Merci de votre confiance — Amani Resorts. Document généré automatiquement.
          Réf. réservation {data.reference}.
        </p>
      </footer>
    </div>
  );
};

export default InvoiceDocument;
