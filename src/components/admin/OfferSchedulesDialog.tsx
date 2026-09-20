import { useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  useAllOfferSchedules,
  useInvalidateOfferSchedules,
} from "@/hooks/useOfferSchedules";

interface OfferSchedulesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  offerId: string;
  offerName: string;
  defaultPrice?: number | null;
}

const toLocalInputValue = (date: Date) => {
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const OfferSchedulesDialog = ({
  open,
  onOpenChange,
  offerId,
  offerName,
  defaultPrice,
}: OfferSchedulesDialogProps) => {
  const { data: schedules, isLoading } = useAllOfferSchedules(offerId);
  const invalidate = useInvalidateOfferSchedules();
  const [creating, setCreating] = useState(false);

  const now = new Date();
  const inOneHour = new Date(now.getTime() + 3600_000);
  const inTwoHours = new Date(now.getTime() + 2 * 3600_000);

  const [form, setForm] = useState({
    start: toLocalInputValue(inOneHour),
    end: toLocalInputValue(inTwoHours),
    capacity: "1",
    price: defaultPrice != null ? String(defaultPrice) : "",
  });

  const handleCreate = async () => {
    const startAt = new Date(form.start);
    const endAt = new Date(form.end);
    const capacity = parseInt(form.capacity, 10);

    if (Number.isNaN(startAt.getTime()) || Number.isNaN(endAt.getTime())) {
      toast.error("Dates invalides");
      return;
    }
    if (endAt <= startAt) {
      toast.error("La date de fin doit être après la date de début");
      return;
    }
    if (!capacity || capacity < 1) {
      toast.error("La capacité doit être d'au moins 1");
      return;
    }

    setCreating(true);
    try {
      const { error } = await supabase.from("offer_schedules").insert({
        offer_id: offerId,
        start_at: startAt.toISOString(),
        end_at: endAt.toISOString(),
        capacity,
        price_eur: form.price ? parseFloat(form.price) : null,
      });
      if (error) throw error;
      toast.success("Créneau créé");
      invalidate(offerId);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur lors de la création");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (scheduleId: string) => {
    try {
      const { error } = await supabase.from("offer_schedules").delete().eq("id", scheduleId);
      if (error) throw error;
      toast.success("Créneau supprimé");
      invalidate(offerId);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur lors de la suppression");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Créneaux — {offerName}</DialogTitle>
          <DialogDescription>
            Définissez les disponibilités réservables. Chaque créneau protège sa capacité
            contre le surbooking dès qu'un visiteur l'ajoute à son panier.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 rounded-lg border bg-muted/30">
          <div className="space-y-1 col-span-1">
            <label className="text-xs font-medium text-muted-foreground">Début</label>
            <Input
              type="datetime-local"
              value={form.start}
              onChange={(e) => setForm({ ...form, start: e.target.value })}
            />
          </div>
          <div className="space-y-1 col-span-1">
            <label className="text-xs font-medium text-muted-foreground">Fin</label>
            <Input
              type="datetime-local"
              value={form.end}
              onChange={(e) => setForm({ ...form, end: e.target.value })}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Capacité</label>
            <Input
              type="number"
              min="1"
              value={form.capacity}
              onChange={(e) => setForm({ ...form, capacity: e.target.value })}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Prix (€)</label>
            <Input
              type="number"
              placeholder={defaultPrice != null ? String(defaultPrice) : "—"}
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
            />
          </div>
          <div className="col-span-2 sm:col-span-4">
            <Button size="sm" onClick={handleCreate} disabled={creating} className="w-full sm:w-auto">
              {creating ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Plus className="w-4 h-4 mr-2" />
              )}
              Ajouter ce créneau
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
        ) : !schedules || schedules.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            Aucun créneau pour l'instant.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Début</TableHead>
                <TableHead>Fin</TableHead>
                <TableHead>Capacité</TableHead>
                <TableHead>Prix</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {schedules.map((schedule) => {
                const isPast = new Date(schedule.end_at) < now;
                return (
                  <TableRow key={schedule.id} className={isPast ? "opacity-50" : undefined}>
                    <TableCell>
                      {format(new Date(schedule.start_at), "d MMM yyyy HH:mm", { locale: fr })}
                    </TableCell>
                    <TableCell>
                      {format(new Date(schedule.end_at), "d MMM yyyy HH:mm", { locale: fr })}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {schedule.booked_count}/{schedule.capacity}
                      </Badge>
                    </TableCell>
                    <TableCell>{schedule.price_eur != null ? `${schedule.price_eur}€` : "—"}</TableCell>
                    <TableCell>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-destructive h-8 w-8"
                        onClick={() => handleDelete(schedule.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default OfferSchedulesDialog;
