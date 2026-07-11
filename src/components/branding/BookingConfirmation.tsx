import { CheckCircle2, Leaf, Mail, Download, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import amaniSymbol from "@/assets/amani-symbol-gold.jpg";

export interface BookingLineItem {
  name: string;
  type: string;
  quantity: number;
  unitPrice: number;
  carbonImpact: number;
}

export interface BookingConfirmationData {
  reference: string;
  guestName: string;
  guestEmail: string;
  checkIn: string;
  checkOut: string;
  destination?: string;
  items: BookingLineItem[];
  subtotal: number;
  carbonOffset: number;
  total: number;
  totalCarbon: number;
}

interface BookingConfirmationProps {
  data: BookingConfirmationData;
  onDownloadInvoice?: () => void;
  onClose?: () => void;
}

/** Confirmation visuelle de réservation — marque Amani Resorts. */
const BookingConfirmation = ({
  data,
  onDownloadInvoice,
  onClose,
}: BookingConfirmationProps) => {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-elevated">
      <div className="bg-gradient-to-r from-primary to-primary-glow px-6 py-8 text-primary-foreground">
        <div className="flex items-center gap-3 mb-6">
          <img
            src={amaniSymbol}
            alt="Amani Resorts"
            className="h-12 w-12 rounded-full object-cover ring-2 ring-accent/60"
          />
          <div>
            <p className="font-display text-2xl leading-none">
              AMANI<span className="text-accent"> Resorts</span>
            </p>
            <p className="mt-1 text-xs tracking-luxury text-primary-foreground/70">
              Éco-luxe aux Comores
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <CheckCircle2 className="mt-0.5 h-6 w-6 text-accent shrink-0" />
          <div>
            <h2 className="font-display text-2xl md:text-3xl">Réservation confirmée</h2>
            <p className="mt-1 text-sm text-primary-foreground/80">
              Réf. {data.reference} · Un email a été préparé pour {data.guestEmail}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6 p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg bg-muted/50 p-4">
            <p className="text-xs uppercase tracking-luxury text-muted-foreground">Voyageur</p>
            <p className="mt-1 font-medium text-foreground">{data.guestName}</p>
            <p className="text-sm text-muted-foreground">{data.guestEmail}</p>
          </div>
          <div className="rounded-lg bg-muted/50 p-4">
            <p className="text-xs uppercase tracking-luxury text-muted-foreground">Séjour</p>
            <p className="mt-1 font-medium text-foreground">
              {data.checkIn || "—"} → {data.checkOut || "—"}
            </p>
            {data.destination && (
              <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="h-3.5 w-3.5 text-accent" />
                {data.destination}
              </p>
            )}
          </div>
        </div>

        <div>
          <p className="mb-3 text-sm font-medium text-foreground">Services réservés</p>
          <ul className="space-y-2">
            {data.items.map((item, i) => (
              <li
                key={`${item.name}-${i}`}
                className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5"
              >
                <div>
                  <p className="text-sm font-medium">{item.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.type} · ×{item.quantity}
                  </p>
                </div>
                <span className="text-sm font-medium">
                  {(item.unitPrice * item.quantity).toFixed(2)} €
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-accent/30 bg-accent/5 p-4">
          <div className="flex items-center gap-2 text-accent">
            <Leaf className="h-4 w-4" />
            <span className="text-sm font-medium">Impact carbone</span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {data.totalCarbon.toFixed(1)} kg CO₂e estimés · compensation{" "}
            {data.carbonOffset.toFixed(2)} €
          </p>
        </div>

        <Separator />

        <div className="space-y-1 text-sm">
          <div className="flex justify-between text-muted-foreground">
            <span>Sous-total</span>
            <span>{data.subtotal.toFixed(2)} €</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Compensation carbone</span>
            <span>{data.carbonOffset.toFixed(2)} €</span>
          </div>
          <div className="flex justify-between pt-2 text-lg font-semibold text-foreground">
            <span>Total</span>
            <span>{data.total.toFixed(2)} €</span>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          {onDownloadInvoice && (
            <Button onClick={onDownloadInvoice} className="flex-1 gap-2">
              <Download className="h-4 w-4" />
              Facture (PDF / impression)
            </Button>
          )}
          <Button variant="outline" className="flex-1 gap-2" asChild>
            <a href={`mailto:${data.guestEmail}?subject=${encodeURIComponent(`Confirmation Amani Resorts — ${data.reference}`)}`}>
              <Mail className="h-4 w-4" />
              Ouvrir l'email
            </a>
          </Button>
          {onClose && (
            <Button variant="ghost" onClick={onClose} className="sm:w-auto">
              Fermer
            </Button>
          )}
        </div>

        <p className="text-center text-xs text-muted-foreground">
          Amani Resorts · hello@amaniresorts.com · Comores
        </p>
      </div>
    </div>
  );
};

export default BookingConfirmation;
