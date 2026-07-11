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
import { MoreHorizontal, Plus, Pencil, Trash2, Star } from "lucide-react";
import { toast } from "sonner";

interface Accommodation {
  id: string;
  name: string;
  destination_id: string;
  type: string | null;
  description: string | null;
  image_url: string | null;
  rating: number | null;
  price_per_night: number | null;
  carbon_score: string | null;
  distance_to_center: string | null;
  amenities: string[] | null;
}

interface Destination {
  id: string;
  name: string;
  city: string;
}

const carbonScoreColors: Record<string, string> = {
  A: "bg-eco-a",
  B: "bg-eco-b",
  C: "bg-eco-c",
  D: "bg-eco-d",
  E: "bg-eco-e",
};

const typeLabels: Record<string, string> = {
  hotel: "Hôtel",
  apartment: "Appartement",
  guesthouse: "Maison d'hôtes",
  villa: "Villa",
  hostel: "Auberge",
};

const AdminAccommodations = () => {
  const [accommodations, setAccommodations] = useState<Accommodation[]>([]);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [currentAccommodation, setCurrentAccommodation] = useState<Accommodation | null>(
    null
  );
  const [formData, setFormData] = useState<Partial<Accommodation>>({});

  const fetchData = async () => {
    try {
      const [accommodationsResult, destinationsResult] = await Promise.all([
        supabase.from("accommodations").select("*").order("name"),
        supabase.from("destinations").select("id, name, city").order("name"),
      ]);

      if (accommodationsResult.error) throw accommodationsResult.error;
      if (destinationsResult.error) throw destinationsResult.error;

      setAccommodations(accommodationsResult.data || []);
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

  const openEditDialog = (accommodation?: Accommodation) => {
    if (accommodation) {
      setCurrentAccommodation(accommodation);
      setFormData(accommodation);
    } else {
      setCurrentAccommodation(null);
      setFormData({
        name: "",
        destination_id: destinations[0]?.id || "",
        type: "hotel",
        description: "",
        image_url: "",
        rating: 4.5,
        price_per_night: 0,
        carbon_score: "B",
        distance_to_center: "",
        amenities: [],
      });
    }
    setEditDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (currentAccommodation) {
        const { error } = await supabase
          .from("accommodations")
          .update(formData)
          .eq("id", currentAccommodation.id);

        if (error) throw error;
        toast.success("Hébergement mis à jour");
      } else {
        const { error } = await supabase.from("accommodations").insert([formData as any]);

        if (error) throw error;
        toast.success("Hébergement créé");
      }

      setEditDialogOpen(false);
      fetchData();
    } catch (error) {
      console.error("Error saving accommodation:", error);
      toast.error("Erreur lors de la sauvegarde");
    }
  };

  const handleDelete = async () => {
    if (!currentAccommodation) return;

    try {
      const { error } = await supabase
        .from("accommodations")
        .delete()
        .eq("id", currentAccommodation.id);

      if (error) throw error;

      toast.success("Hébergement supprimé");
      setDeleteDialogOpen(false);
      setCurrentAccommodation(null);
      fetchData();
    } catch (error) {
      console.error("Error deleting accommodation:", error);
      toast.error("Erreur lors de la suppression");
    }
  };

  return (
    <AdminLayout title="Gestion des hébergements">
      <div className="mb-4">
        <Button onClick={() => openEditDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Ajouter un hébergement
        </Button>
      </div>

      <div className="bg-background rounded-lg border">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto"></div>
          </div>
        ) : accommodations.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            Aucun hébergement trouvé
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Destination</TableHead>
                <TableHead>Note</TableHead>
                <TableHead>Prix/nuit</TableHead>
                <TableHead>Score CO₂</TableHead>
                <TableHead className="w-[70px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accommodations.map((accommodation) => (
                <TableRow key={accommodation.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {accommodation.image_url && (
                        <img
                          src={accommodation.image_url}
                          alt={accommodation.name}
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                      )}
                      <p className="font-medium">{accommodation.name}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {typeLabels[accommodation.type || "hotel"] || accommodation.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {getDestinationName(accommodation.destination_id)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-warning fill-yellow-500" />
                      {accommodation.rating}
                    </div>
                  </TableCell>
                  <TableCell>{accommodation.price_per_night} €</TableCell>
                  <TableCell>
                    <Badge
                      className={`${
                        carbonScoreColors[accommodation.carbon_score || "B"]
                      } text-white`}
                    >
                      {accommodation.carbon_score}
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
                        <DropdownMenuItem
                          onClick={() => openEditDialog(accommodation)}
                        >
                          <Pencil className="h-4 w-4 mr-2" />
                          Modifier
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => {
                            setCurrentAccommodation(accommodation);
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
              {currentAccommodation
                ? "Modifier l'hébergement"
                : "Nouvel hébergement"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nom</label>
              <Input
                value={formData.name || ""}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nom de l'hébergement"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Type</label>
              <Select
                value={formData.type || "hotel"}
                onValueChange={(value) => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hotel">Hôtel</SelectItem>
                  <SelectItem value="apartment">Appartement</SelectItem>
                  <SelectItem value="guesthouse">Maison d'hôtes</SelectItem>
                  <SelectItem value="villa">Villa</SelectItem>
                  <SelectItem value="hostel">Auberge</SelectItem>
                </SelectContent>
              </Select>
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
              <label className="text-sm font-medium">Prix/nuit (€)</label>
              <Input
                type="number"
                value={formData.price_per_night || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    price_per_night: parseFloat(e.target.value),
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Distance du centre</label>
              <Input
                value={formData.distance_to_center || ""}
                onChange={(e) =>
                  setFormData({ ...formData, distance_to_center: e.target.value })
                }
                placeholder="Ex: 500m du centre"
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
            <div className="col-span-2 space-y-2">
              <label className="text-sm font-medium">URL de l'image</label>
              <Input
                value={formData.image_url || ""}
                onChange={(e) =>
                  setFormData({ ...formData, image_url: e.target.value })
                }
                placeholder="https://..."
              />
            </div>
            <div className="col-span-2 space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={formData.description || ""}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Description de l'hébergement..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleSave}>
              {currentAccommodation ? "Mettre à jour" : "Créer"}
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
              Êtes-vous sûr de vouloir supprimer l'hébergement "
              {currentAccommodation?.name}" ? Cette action est irréversible.
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

export default AdminAccommodations;
