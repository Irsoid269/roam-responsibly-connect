import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { AdminLoading, AdminEmpty } from "@/components/admin/AdminTableState";
import { supabase } from "@/integrations/supabase/client";
import { ecoScoreBadge } from "@/lib/eco-score";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MoreHorizontal, Plus, Pencil, Trash2, Star, Wifi } from "lucide-react";
import { toast } from "sonner";
import ImageUpload from "@/components/admin/ImageUpload";

interface CoworkingSpace {
  id: string;
  name: string;
  destination_id: string;
  description: string | null;
  address: string | null;
  image_url: string | null;
  rating: number | null;
  wifi_speed: number | null;
  price_per_hour: number | null;
  price_per_day: number | null;
  price_per_month: number | null;
  carbon_score: string | null;
  opening_hours: string | null;
  amenities: string[] | null;
}

interface Destination {
  id: string;
  name: string;
  city: string;
}

const AdminCoworkings = () => {
  const [coworkings, setCoworkings] = useState<CoworkingSpace[]>([]);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [currentCoworking, setCurrentCoworking] = useState<CoworkingSpace | null>(null);
  const [formData, setFormData] = useState<Partial<CoworkingSpace>>({});

  const fetchData = async () => {
    try {
      const [coworkingsResult, destinationsResult] = await Promise.all([
        supabase.from("coworking_spaces").select("*").order("name"),
        supabase.from("destinations").select("id, name, city").order("name"),
      ]);

      if (coworkingsResult.error) throw coworkingsResult.error;
      if (destinationsResult.error) throw destinationsResult.error;

      setCoworkings(coworkingsResult.data || []);
      setDestinations(destinationsResult.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getDestinationName = (destinationId: string) => {
    const destination = destinations.find((d) => d.id === destinationId);
    return destination ? `${destination.name}, ${destination.city}` : "Inconnue";
  };

  const openEditDialog = (coworking?: CoworkingSpace) => {
    if (coworking) {
      setCurrentCoworking(coworking);
      setFormData(coworking);
    } else {
      setCurrentCoworking(null);
      setFormData({
        name: "",
        destination_id: destinations[0]?.id || "",
        description: "",
        address: "",
        image_url: "",
        rating: 4.5,
        wifi_speed: 50,
        price_per_hour: 0,
        price_per_day: 0,
        price_per_month: 0,
        carbon_score: "B",
        opening_hours: "8h - 20h",
        amenities: [],
      });
    }
    setEditDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (currentCoworking) {
        const { error } = await supabase
          .from("coworking_spaces")
          .update(formData)
          .eq("id", currentCoworking.id);

        if (error) throw error;
        toast.success("Coworking mis à jour");
      } else {
        const { error } = await supabase.from("coworking_spaces").insert([formData as any]);

        if (error) throw error;
        toast.success("Coworking créé");
      }

      setEditDialogOpen(false);
      fetchData();
    } catch (error) {
      console.error("Error saving coworking:", error);
      toast.error("Erreur lors de la sauvegarde");
    }
  };

  const handleDelete = async () => {
    if (!currentCoworking) return;

    try {
      const { error } = await supabase
        .from("coworking_spaces")
        .delete()
        .eq("id", currentCoworking.id);

      if (error) throw error;

      toast.success("Coworking supprimé");
      setDeleteDialogOpen(false);
      setCurrentCoworking(null);
      fetchData();
    } catch (error) {
      console.error("Error deleting coworking:", error);
      toast.error("Erreur lors de la suppression");
    }
  };

  return (
    <AdminLayout
      title="Gestion des coworkings"
      description="Espaces de coworking liés aux destinations Amani."
      actions={
        <Button onClick={() => openEditDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Ajouter un coworking
        </Button>
      }
    >
      <div className="rounded-xl border border-border bg-background shadow-sm overflow-hidden">
        {loading ? (
          <AdminLoading />
        ) : coworkings.length === 0 ? (
          <AdminEmpty title="Aucun coworking trouvé" />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Destination</TableHead>
                <TableHead>Note</TableHead>
                <TableHead>WiFi</TableHead>
                <TableHead>Prix/jour</TableHead>
                <TableHead>Score CO₂</TableHead>
                <TableHead className="w-[70px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {coworkings.map((coworking) => (
                <TableRow key={coworking.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {coworking.image_url && (
                        <img
                          src={coworking.image_url}
                          alt={coworking.name}
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                      )}
                      <div>
                        <p className="font-medium">{coworking.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {coworking.address}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getDestinationName(coworking.destination_id)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-warning fill-warning" />
                      {coworking.rating}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Wifi className="h-4 w-4 text-muted-foreground" />
                      {coworking.wifi_speed} Mbps
                    </div>
                  </TableCell>
                  <TableCell>{coworking.price_per_day} €</TableCell>
                  <TableCell>
                    <Badge
                      className={ecoScoreBadge(coworking.carbon_score || "B")}
                    >
                      {coworking.carbon_score}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditDialog(coworking)}>
                          <Pencil className="h-4 w-4 mr-2" />
                          Modifier
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => {
                            setCurrentCoworking(coworking);
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

      {/* Edit/Create Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {currentCoworking ? "Modifier le coworking" : "Nouveau coworking"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nom</label>
              <Input
                value={formData.name || ""}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nom du coworking"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Destination</label>
              <Select
                value={formData.destination_id || ""}
                onValueChange={(value) =>
                  setFormData({ ...formData, destination_id: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une destination" />
                </SelectTrigger>
                <SelectContent>
                  {destinations.map((dest) => (
                    <SelectItem key={dest.id} value={dest.id}>
                      {dest.name}, {dest.city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2 space-y-2">
              <label className="text-sm font-medium">Adresse</label>
              <Input
                value={formData.address || ""}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Adresse complète"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Note (0-5)</label>
              <Input
                type="number"
                min="0"
                max="5"
                step="0.1"
                value={formData.rating || ""}
                onChange={(e) =>
                  setFormData({ ...formData, rating: parseFloat(e.target.value) })
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Vitesse WiFi (Mbps)</label>
              <Input
                type="number"
                value={formData.wifi_speed || ""}
                onChange={(e) =>
                  setFormData({ ...formData, wifi_speed: parseInt(e.target.value) })
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Prix/heure (€)</label>
              <Input
                type="number"
                value={formData.price_per_hour || ""}
                onChange={(e) =>
                  setFormData({ ...formData, price_per_hour: parseFloat(e.target.value) })
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Prix/jour (€)</label>
              <Input
                type="number"
                value={formData.price_per_day || ""}
                onChange={(e) =>
                  setFormData({ ...formData, price_per_day: parseFloat(e.target.value) })
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Prix/mois (€)</label>
              <Input
                type="number"
                value={formData.price_per_month || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    price_per_month: parseFloat(e.target.value),
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Score carbone</label>
              <select
                className="w-full h-10 px-3 rounded-md border bg-background"
                value={formData.carbon_score || "B"}
                onChange={(e) =>
                  setFormData({ ...formData, carbon_score: e.target.value })
                }
              >
                <option value="A">A - Excellent</option>
                <option value="B">B - Bon</option>
                <option value="C">C - Moyen</option>
                <option value="D">D - Faible</option>
                <option value="E">E - Mauvais</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Horaires d'ouverture</label>
              <Input
                value={formData.opening_hours || ""}
                onChange={(e) =>
                  setFormData({ ...formData, opening_hours: e.target.value })
                }
                placeholder="Ex: 8h - 20h"
              />
            </div>
            <div className="col-span-2 space-y-2">
              <label className="text-sm font-medium">Image</label>
              <ImageUpload
                value={formData.image_url || null}
                onChange={(url) => setFormData({ ...formData, image_url: url })}
                folder="coworkings"
              />
            </div>
            <div className="col-span-2 space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={formData.description || ""}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Description du coworking..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleSave}>
              {currentCoworking ? "Mettre à jour" : "Créer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer le coworking "{currentCoworking?.name}" ?
              Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminCoworkings;
