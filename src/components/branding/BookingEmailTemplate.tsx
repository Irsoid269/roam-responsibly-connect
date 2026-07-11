import { buildBookingConfirmationEmail } from "@/lib/booking-email";
import type { BookingConfirmationData } from "./BookingConfirmation";

interface BookingEmailPreviewProps {
  data: BookingConfirmationData;
}

/** Prévisualisation in-app du mail de confirmation Amani Resorts. */
const BookingEmailPreview = ({ data }: BookingEmailPreviewProps) => {
  const { html } = buildBookingConfirmationEmail(data);
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-muted/30">
      <div className="border-b border-border bg-primary px-4 py-2">
        <p className="text-xs tracking-luxury text-primary-foreground/80">
          Aperçu email · Amani Resorts
        </p>
      </div>
      <iframe
        title="Aperçu email confirmation Amani"
        srcDoc={html}
        className="h-[480px] w-full bg-background"
        sandbox=""
      />
    </div>
  );
};

export default BookingEmailPreview;
