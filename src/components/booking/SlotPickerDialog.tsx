import { useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { CalendarClock, Loader2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useUpcomingOfferSchedules, type OfferSchedule } from "@/hooks/useOfferSchedules";

interface SlotPickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  offerId: string;
  offerName: string;
  fallbackPrice: number;
  onConfirm: (schedule: OfferSchedule) => Promise<void> | void;
}

const SlotPickerDialog = ({
  open,
  onOpenChange,
  offerId,
  offerName,
  fallbackPrice,
  onConfirm,
}: SlotPickerDialogProps) => {
  const { data: schedules, isLoading } = useUpcomingOfferSchedules(offerId, open);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const selected = schedules?.find((s) => s.id === selectedId) || null;

  const handleConfirm = async () => {
    if (!selected) return;
    setSubmitting(true);
    try {
      await onConfirm(selected);
      onOpenChange(false);
      setSelectedId(null);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!submitting) {
          onOpenChange(next);
          if (!next) setSelectedId(null);
        }
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Choisir un créneau</DialogTitle>
          <DialogDescription>{offerName}</DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-10 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            Chargement des disponibilités…
          </div>
        ) : !schedules || schedules.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Aucun créneau disponible pour le moment. Contactez-nous pour organiser une date sur mesure.
          </p>
        ) : (
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {schedules.map((schedule) => {
              const remaining = schedule.capacity - schedule.booked_count;
              const full = remaining <= 0;
              const isSelected = selectedId === schedule.id;
              return (
                <button
                  key={schedule.id}
                  type="button"
                  disabled={full}
                  onClick={() => setSelectedId(schedule.id)}
                  className={cn(
                    "w-full text-left p-3 rounded-lg border transition-colors",
                    full
                      ? "opacity-50 cursor-not-allowed bg-muted/30"
                      : "hover:border-primary cursor-pointer",
                    isSelected && !full && "border-primary bg-primary/5",
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 font-medium text-sm">
                      <CalendarClock className="w-4 h-4 text-primary shrink-0" />
                      {format(new Date(schedule.start_at), "EEEE d MMMM 'à' HH:mm", { locale: fr })}
                    </span>
                    <span className="font-semibold text-sm">
                      {(schedule.price_eur ?? fallbackPrice) || 0}€
                    </span>
                  </div>
                  <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                    <Users className="w-3 h-3" />
                    {full
                      ? "Complet"
                      : `${remaining} place${remaining > 1 ? "s" : ""} restante${remaining > 1 ? "s" : ""}`}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            Annuler
          </Button>
          <Button onClick={handleConfirm} disabled={!selected || submitting}>
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Réservation…
              </>
            ) : (
              "Ajouter au panier"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SlotPickerDialog;
