import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { format, differenceInDays } from "date-fns";
import { fr } from "date-fns/locale";
import { Calendar, MapPin, Wifi, Leaf, Clock, Loader2 } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

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
}

const carbonScoreColors: Record<string, string> = {
  A: "bg-success text-success-foreground",
  B: "bg-primary text-primary-foreground",
  C: "bg-warning text-warning-foreground",
};

const defaultImage = "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800";

const BookingDialog = ({ coworking, open, onOpenChange }: BookingDialogProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  });
  const [loading, setLoading] = useState(false);

  if (!coworking) return null;

  const numberOfDays = dateRange.from && dateRange.to 
    ? differenceInDays(dateRange.to, dateRange.from) + 1
    : 0;
  
  const totalPrice = numberOfDays * (coworking.price_per_day || 0);

  const handleBooking = async () => {
    if (!user) {
      toast.error("Veuillez vous connecter pour réserver");
      navigate("/login");
      return;
    }

    if (!dateRange.from || !dateRange.to) {
      toast.error("Veuillez sélectionner les dates");
      return;
    }

    setLoading(true);

    try {
      // Create reservation
      const { data: reservation, error: reservationError } = await supabase
        .from("reservations")
        .insert({
          user_id: user.id,
          destination_id: coworking.destination_id,
          check_in_date: format(dateRange.from, "yyyy-MM-dd"),
          check_out_date: format(dateRange.to, "yyyy-MM-dd"),
          total_price: totalPrice,
          status: "pending",
        })
        .select()
        .single();

      if (reservationError) throw reservationError;

      // Create reservation item for coworking
      const { error: itemError } = await supabase
        .from("reservation_items")
        .insert({
          reservation_id: reservation.id,
          item_type: "coworking",
          item_id: coworking.id,
          item_name: coworking.name,
          start_date: format(dateRange.from, "yyyy-MM-dd"),
          end_date: format(dateRange.to, "yyyy-MM-dd"),
          quantity: numberOfDays,
          unit_price: coworking.price_per_day,
          total_price: totalPrice,
        });

      if (itemError) throw itemError;

      toast.success("Réservation créée avec succès !");
      onOpenChange(false);
      setDateRange({ from: undefined, to: undefined });
      navigate("/profile");
    } catch (error) {
      console.error("Error creating booking:", error);
      toast.error("Erreur lors de la réservation");
    } finally {
      setLoading(false);
    }
  };

  const formatDateRange = () => {
    if (dateRange.from && dateRange.to) {
      return `${format(dateRange.from, "d MMM", { locale: fr })} - ${format(dateRange.to, "d MMM yyyy", { locale: fr })}`;
    }
    if (dateRange.from) {
      return format(dateRange.from, "d MMM yyyy", { locale: fr });
    }
    return "Sélectionner les dates";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Réserver cet espace</DialogTitle>
          <DialogDescription>
            Sélectionnez vos dates pour réserver {coworking.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Coworking Preview */}
          <div className="flex gap-4 p-4 bg-muted/50 rounded-lg">
            <img
              src={coworking.image_url || defaultImage}
              alt={coworking.name}
              className="w-20 h-20 rounded-lg object-cover"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h4 className="font-semibold">{coworking.name}</h4>
                <span className={cn(
                  "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold",
                  carbonScoreColors[coworking.carbon_score || "B"]
                )}>
                  {coworking.carbon_score || "B"}
                </span>
              </div>
              <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                <MapPin className="w-3 h-3" />
                {coworking.address || "Adresse non spécifiée"}
              </p>
              <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Wifi className="w-3 h-3" />
                  {coworking.wifi_speed} Mbps
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {coworking.opening_hours}
                </span>
              </div>
            </div>
          </div>

          {/* Date Selection */}
          <div>
            <label className="text-sm font-medium mb-2 block">Dates de réservation</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !dateRange.from && "text-muted-foreground"
                  )}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {formatDateRange()}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="range"
                  selected={{ from: dateRange.from, to: dateRange.to }}
                  onSelect={(range) => setDateRange({ from: range?.from, to: range?.to })}
                  numberOfMonths={2}
                  disabled={(date) => date < new Date()}
                  locale={fr}
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Price Summary */}
          {numberOfDays > 0 && (
            <div className="p-4 bg-primary/5 border border-primary/10 rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {coworking.price_per_day}€ x {numberOfDays} jour{numberOfDays > 1 ? "s" : ""}
                </span>
                <span>{totalPrice}€</span>
              </div>
              <div className="flex justify-between font-semibold pt-2 border-t border-primary/10">
                <span>Total</span>
                <span className="text-primary">{totalPrice}€</span>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button 
            onClick={handleBooking} 
            disabled={!dateRange.from || !dateRange.to || loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Réservation...
              </>
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
