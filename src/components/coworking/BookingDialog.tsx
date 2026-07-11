import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { format, differenceInCalendarDays, startOfDay } from "date-fns";
import { fr } from "date-fns/locale";
import { Calendar, MapPin, Wifi, Clock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { ecoScoreBadge } from "@/lib/eco-score";
import { persistBooking } from "@/lib/persist-booking";
import { printAmaniInvoice } from "@/lib/print-invoice";
import { queryKeys } from "@/hooks/useCatalogQueries";
import BookingConfirmation, {
  type BookingConfirmationData,
} from "@/components/branding/BookingConfirmation";

interface CoworkingSpace {
  id: string;
  name: string;
  description: string | null;
  address: string | null;
  image_url: string | null;
  carbon_score: string | null;
  rating: number | null;
  price_per_day: number | null;
  price_per_hour: number | null;
  price_per_month: number | null;
  wifi_speed: number | null;
  amenities: string[] | null;
  opening_hours: string | null;
  destination_id: string;
}

interface BookingDialogProps {
  coworking: CoworkingSpace | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialFrom?: Date;
  initialTo?: Date;
}

const defaultImage =
  "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800";

function carbonPerDay(score: string | null): number {
  const map: Record<string, number> = { A: 1.5, B: 2.5, C: 4, D: 6, E: 8 };
  return map[(score || "B").toUpperCase()] ?? 2.5;
}

const BookingDialog = ({
  coworking,
  open,
  onOpenChange,
  initialFrom,
  initialTo,
}: BookingDialogProps) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({ from: initialFrom, to: initialTo });
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [confirmation, setConfirmation] = useState<BookingConfirmationData | null>(
    null
  );

  useEffect(() => {
    if (!open) {
      setDateRange({ from: initialFrom, to: initialTo });
      setCalendarOpen(false);
      setLoading(false);
      setConfirmation(null);
    } else {
      setDateRange({ from: initialFrom, to: initialTo });
    }
  }, [open, initialFrom, initialTo]);

  if (!coworking) return null;

  const checkIn = dateRange.from;
  const checkOut = dateRange.to ?? dateRange.from;
  const numberOfDays =
    checkIn && checkOut
      ? Math.max(1, differenceInCalendarDays(checkOut, checkIn) + 1)
      : 0;
  const pricePerDay = Number(coworking.price_per_day || 0);
  const totalPrice = numberOfDays * pricePerDay;
  const canSubmit = Boolean(checkIn) && !loading;

  const handleBooking = async () => {
    if (!user) {
      toast.error("Veuillez vous connecter pour réserver");
      onOpenChange(false);
      navigate("/login");
      return;
    }

    if (!checkIn || !checkOut) {
      toast.error("Choisissez au moins une date de réservation");
      setCalendarOpen(true);
      return;
    }

    if (pricePerDay <= 0) {
      toast.error("Tarif non disponible pour cet espace");
      return;
    }

    setLoading(true);

    try {
      const result = await persistBooking({
        userId: user.id,
        destinationId: coworking.destination_id || null,
        checkIn: format(checkIn, "yyyy-MM-dd"),
        checkOut: format(checkOut, "yyyy-MM-dd"),
        guestName:
          user.user_metadata?.full_name ||
          user.email?.split("@")[0] ||
          "Voyageur",
        guestEmail: user.email || "",
        destinationLabel: coworking.name,
        items: [
          {
            id: coworking.id,
            type: "coworking",
            name: coworking.name,
            price: pricePerDay,
            quantity: numberOfDays,
            carbonImpact: carbonPerDay(coworking.carbon_score),
          },
        ],
      });

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.reservations(user.id) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.profile(user.id) }),
      ]);

      setConfirmation(result.confirmation);
      toast.success(`Réservation confirmée · ${result.confirmation.reference}`);
    } catch (error) {
      console.error("Error creating booking:", error);
      toast.error(
        error instanceof Error ? error.message : "Erreur lors de la réservation"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadInvoice = () => {
    if (!confirmation) return;
    const result = printAmaniInvoice(confirmation);
    if (!result.ok) {
      toast.error(result.reason);
      return;
    }
    toast.success(
      result.mode === "print"
        ? "Facture ouverte — utilisez Imprimer / Enregistrer en PDF"
        : "Facture téléchargée (fichier HTML)"
    );
  };

  const formatDateRange = () => {
    if (dateRange.from && dateRange.to) {
      return `${format(dateRange.from, "d MMM", { locale: fr })} – ${format(dateRange.to, "d MMM yyyy", { locale: fr })}`;
    }
    if (dateRange.from) {
      return `${format(dateRange.from, "d MMM yyyy", { locale: fr })} (1 jour)`;
    }
    return "Choisir les dates";
  };

  const today = startOfDay(new Date());

  if (confirmation) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-xl p-0 border-border overflow-hidden">
          <BookingConfirmation
            data={confirmation}
            onDownloadInvoice={handleDownloadInvoice}
            onClose={() => {
              onOpenChange(false);
              navigate("/profile");
            }}
          />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl font-medium">
            Réserver cet espace
          </DialogTitle>
          <DialogDescription>
            Choisissez une ou plusieurs dates pour réserver {coworking.name}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex gap-4 p-4 bg-muted/50 rounded-xl">
            <img
              src={coworking.image_url || defaultImage}
              alt={coworking.name}
              className="w-20 h-20 rounded-lg object-cover shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="font-semibold truncate">{coworking.name}</h4>
                <span
                  className={cn(
                    "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0",
                    ecoScoreBadge(coworking.carbon_score || "B")
                  )}
                >
                  {coworking.carbon_score || "B"}
                </span>
              </div>
              <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                <MapPin className="w-3 h-3 shrink-0" />
                <span className="truncate">
                  {coworking.address || "Adresse non spécifiée"}
                </span>
              </p>
              <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                {coworking.wifi_speed != null && (
                  <span className="flex items-center gap-1">
                    <Wifi className="w-3 h-3" />
                    {coworking.wifi_speed} Mbps
                  </span>
                )}
                {coworking.opening_hours && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {coworking.opening_hours}
                  </span>
                )}
              </div>
              {pricePerDay > 0 && (
                <p className="text-sm font-medium text-foreground mt-2">
                  {pricePerDay}€{" "}
                  <span className="text-muted-foreground font-normal">/ jour</span>
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              Dates de réservation
            </label>
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal h-11",
                    !dateRange.from && "text-muted-foreground"
                  )}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {formatDateRange()}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 z-[80]" align="start">
                <CalendarComponent
                  mode="range"
                  selected={{ from: dateRange.from, to: dateRange.to }}
                  onSelect={(range) => {
                    setDateRange({ from: range?.from, to: range?.to });
                    if (range?.from && range?.to) setCalendarOpen(false);
                  }}
                  numberOfMonths={1}
                  disabled={(date) => startOfDay(date) < today}
                  locale={fr}
                  initialFocus
                />
                <div className="border-t p-3 flex justify-between items-center gap-2">
                  <p className="text-xs text-muted-foreground">
                    Un jour suffit — ou une plage.
                  </p>
                  <Button
                    type="button"
                    size="sm"
                    disabled={!dateRange.from}
                    onClick={() => {
                      if (dateRange.from && !dateRange.to) {
                        setDateRange({ from: dateRange.from, to: dateRange.from });
                      }
                      setCalendarOpen(false);
                    }}
                  >
                    Valider
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {numberOfDays > 0 && (
            <div className="p-4 bg-primary/5 border border-primary/10 rounded-xl space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {pricePerDay}€ × {numberOfDays} jour{numberOfDays > 1 ? "s" : ""}
                </span>
                <span>{totalPrice}€</span>
              </div>
              <div className="flex justify-between font-semibold pt-2 border-t border-primary/10">
                <span>Total estimé*</span>
                <span className="text-primary">{totalPrice}€</span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                * Compensation carbone ajoutée à la confirmation.
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Annuler
          </Button>
          <Button type="button" onClick={handleBooking} disabled={!canSubmit}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Réservation…
              </>
            ) : !dateRange.from ? (
              "Choisir une date"
            ) : (
              "Confirmer la réservation"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BookingDialog;
