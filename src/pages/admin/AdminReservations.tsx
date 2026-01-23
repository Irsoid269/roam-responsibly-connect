import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MoreHorizontal, Eye, CheckCircle, XCircle, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";

interface Reservation {
  id: string;
  user_id: string;
  destination_id: string | null;
  check_in_date: string;
  check_out_date: string;
  total_price: number;
  total_carbon_impact: number;
  status: string;
  created_at: string;
  profile?: {
    full_name: string | null;
  };
  destination?: {
    name: string;
    city: string;
  };
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  confirmed: "bg-green-500/10 text-green-600 border-green-500/20",
  cancelled: "bg-red-500/10 text-red-600 border-red-500/20",
  completed: "bg-blue-500/10 text-blue-600 border-blue-500/20",
};

const statusLabels: Record<string, string> = {
  pending: "En attente",
  confirmed: "Confirmée",
  cancelled: "Annulée",
  completed: "Terminée",
};

const AdminReservations = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reservationToDelete, setReservationToDelete] = useState<string | null>(null);

  const fetchReservations = async () => {
    try {
      const { data: reservationsData, error } = await supabase
        .from("reservations")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch related data
      const reservationsWithDetails = await Promise.all(
        (reservationsData || []).map(async (reservation) => {
          const [profileResult, destinationResult] = await Promise.all([
            supabase
              .from("profiles")
              .select("full_name")
              .eq("user_id", reservation.user_id)
              .single(),
            reservation.destination_id
              ? supabase
                  .from("destinations")
                  .select("name, city")
                  .eq("id", reservation.destination_id)
                  .single()
              : null,
          ]);

          return {
            ...reservation,
            profile: profileResult.data || undefined,
            destination: destinationResult?.data || undefined,
          };
        })
      );

      setReservations(reservationsWithDetails);
    } catch (error) {
      console.error("Error fetching reservations:", error);
      toast.error("Erreur lors du chargement des réservations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from("reservations")
        .update({ status })
        .eq("id", id);

      if (error) throw error;

      toast.success(`Réservation ${statusLabels[status].toLowerCase()}`);
      fetchReservations();
    } catch (error) {
      console.error("Error updating reservation:", error);
      toast.error("Erreur lors de la mise à jour");
    }
  };

  const deleteReservation = async () => {
    if (!reservationToDelete) return;

    try {
      // First delete reservation items
      await supabase
        .from("reservation_items")
        .delete()
        .eq("reservation_id", reservationToDelete);

      // Then delete the reservation
      const { error } = await supabase
        .from("reservations")
        .delete()
        .eq("id", reservationToDelete);

      if (error) throw error;

      toast.success("Réservation supprimée");
      setDeleteDialogOpen(false);
      setReservationToDelete(null);
      fetchReservations();
    } catch (error) {
      console.error("Error deleting reservation:", error);
      toast.error("Erreur lors de la suppression");
    }
  };

  return (
    <AdminLayout title="Gestion des réservations">
      <div className="bg-background rounded-lg border">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto"></div>
          </div>
        ) : reservations.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            Aucune réservation trouvée
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Destination</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead>Montant</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Créée le</TableHead>
                <TableHead className="w-[70px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reservations.map((reservation) => (
                <TableRow key={reservation.id}>
                  <TableCell className="font-medium">
                    {reservation.profile?.full_name || "Utilisateur inconnu"}
                  </TableCell>
                  <TableCell>
                    {reservation.destination
                      ? `${reservation.destination.name}, ${reservation.destination.city}`
                      : "Non spécifiée"}
                  </TableCell>
                  <TableCell>
                    {format(new Date(reservation.check_in_date), "dd MMM", {
                      locale: fr,
                    })}{" "}
                    -{" "}
                    {format(new Date(reservation.check_out_date), "dd MMM yyyy", {
                      locale: fr,
                    })}
                  </TableCell>
                  <TableCell>{reservation.total_price} €</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={statusColors[reservation.status] || ""}
                    >
                      {statusLabels[reservation.status] || reservation.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {format(new Date(reservation.created_at), "dd/MM/yyyy", {
                      locale: fr,
                    })}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => setSelectedReservation(reservation)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Voir détails
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => updateStatus(reservation.id, "confirmed")}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Confirmer
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => updateStatus(reservation.id, "cancelled")}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Annuler
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => {
                            setReservationToDelete(reservation.id);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Details Dialog */}
      <Dialog
        open={!!selectedReservation}
        onOpenChange={() => setSelectedReservation(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Détails de la réservation</DialogTitle>
          </DialogHeader>
          {selectedReservation && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Client</p>
                  <p className="font-medium">
                    {selectedReservation.profile?.full_name || "Inconnu"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Statut</p>
                  <Badge
                    variant="outline"
                    className={statusColors[selectedReservation.status]}
                  >
                    {statusLabels[selectedReservation.status]}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Destination</p>
                  <p className="font-medium">
                    {selectedReservation.destination?.name || "Non spécifiée"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Montant total</p>
                  <p className="font-medium">{selectedReservation.total_price} €</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Check-in</p>
                  <p className="font-medium">
                    {format(new Date(selectedReservation.check_in_date), "PPP", {
                      locale: fr,
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Check-out</p>
                  <p className="font-medium">
                    {format(new Date(selectedReservation.check_out_date), "PPP", {
                      locale: fr,
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Impact carbone</p>
                  <p className="font-medium">
                    {selectedReservation.total_carbon_impact} kg CO₂
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Créée le</p>
                  <p className="font-medium">
                    {format(new Date(selectedReservation.created_at), "PPP", {
                      locale: fr,
                    })}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer cette réservation ? Cette action
              est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={deleteReservation}>
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminReservations;
