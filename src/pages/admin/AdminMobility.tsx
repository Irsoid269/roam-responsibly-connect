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
import { MoreHorizontal, Plus, Pencil, Trash2, Leaf } from "lucide-react";
import { toast } from "sonner";

interface MobilityOption {
  id: string;
  name: string;
  destination_id: string;
  type: string | null;
  description: string | null;
  image_url: string | null;
  price_per_hour: number | null;
  price_per_day: number | null;
  carbon_per_km: number | null;
}

interface Destination {
  id: string;
  name: string;
  city: string;
}

const typeLabels: Record<string, string> = {
  bicycle: "Vélo",
  electric_bike: "Vélo électrique",
  scooter: "Scooter",
  car: "Voiture",
  electric_car: "Voiture électrique",
  boat: "Bateau",
};

const typeIcons: Record<string, string> = {
  bicycle: "🚲",
  electric_bike: "⚡🚲",
  scooter: "🛵",
  car: "🚗",
  electric_car: "🔋🚗",
  boat: "🚤",
};

const AdminMobility = () => {
  const [mobilityOptions, setMobilityOptions] = useState<MobilityOption[]>([]);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [currentOption, setCurrentOption] = useState<MobilityOption | null>(null);
  const [formData, setFormData] = useState<Partial<MobilityOption>>({});

  const fetchData = async () => {
    try {
      const [mobilityResult, destinationsResult] = await Promise.all([
        supabase.from("mobility_options").select("*").order("name"),
        supabase.from("destinations").select("id, name, city").order("name"),
      ]);

      if (mobilityResult.error) throw mobilityResult.error;
      if (destinationsResult.error) throw destinationsResult.error;

      setMobilityOptions(mobilityResult.data || []);
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

  const openEditDialog = (option?: MobilityOption) => {
    if (option) {
      setCurrentOption(option);
      setFormData(option);
    } else {
      setCurrentOption(null);
      setFormData({
        name: "",
        destination_id: destinations[0]?.id || "",
        type: "bicycle",
        description: "",
        image_url: "",
        price_per_hour: 0,
        price_per_day: 0,
        carbon_per_km: 0,
      });
    }
    setEditDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (currentOption) {
        const { error } = await supabase
          .from("mobility_options")
          .update(formData)
          .eq("id", currentOption.id);

        if (error) throw error;
        toast.success("Option de mobilité mise à jour");
      } else {
        const { error } = await supabase.from("mobility_options").insert([formData as any]);

        if (error) throw error;
        toast.success("Option de mobilité créée");
      }

      setEditDialogOpen(false);
      fetchData();
    } catch (error) {
      console.error("Error saving mobility option:", error);
      toast.error("Erreur lors de la sauvegarde");
    }
  };

  const handleDelete = async () => {
    if (!currentOption) return;

    try {
      const { error } = await supabase
        .from("mobility_options")
        .delete()
        .eq("id", currentOption.id);

      if (error) throw error;

      toast.success("Option de mobilité supprimée");
      setDeleteDialogOpen(false);
      setCurrentOption(null);
      fetchData();
    } catch (error) {
      console.error("Error deleting mobility option:", error);
      toast.error("Erreur lors de la suppression");
    }
  };

  const getCarbonBadgeColor = (carbonPerKm: number | null) => {
    if (!carbonPerKm || carbonPerKm === 0) return "bg-eco-a";
    if (carbonPerKm < 50) return "bg-eco-b";
    if (carbonPerKm < 100) return "bg-eco-c";
    if (carbonPerKm < 150) return "bg-eco-d";
    return "bg-eco-e";
  };

  return (
    <AdminLayout title="Gestion de la mobilité">
      <div className="mb-4">
        <Button onClick={() => openEditDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Ajouter une option
        </Button>
      </div>

      <div className="bg-background rounded-lg border">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto"></div>
          </div>
        ) : mobilityOptions.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            Aucune option de mobilité trouvée
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Destination</TableHead>
                <TableHead>Prix/heure</TableHead>
                <TableHead>Prix/jour</TableHead>
                <TableHead>CO₂/km</TableHead>
                <TableHead className="w-[70px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mobilityOptions.map((option) => (
                <TableRow key={option.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <span className="text-xl">
                        {typeIcons[option.type || "bicycle"] || "🚗"}
                      </span>
                      <p className="font-medium">{option.name}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {typeLabels[option.type || "bicycle"] || option.type}
                    </Badge>
                  </TableCell>
                  <TableCell>{getDestinationName(option.destination_id)}</TableCell>
                  <TableCell>{option.price_per_hour} €</TableCell>
                  <TableCell>{option.price_per_day} €</TableCell>
                  <TableCell>
                    <Badge
                      className={`${getCarbonBadgeColor(option.carbon_per_km)} text-primary-foreground`}
                    >
                      <Leaf className="h-3 w-3 mr-1" />
                      {option.carbon_per_km || 0}g
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
                        <DropdownMenuItem onClick={() => openEditDialog(option)}>
                          <Pencil className="h-4 w-4 mr-2" />
                          Modifier
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => {
                            setCurrentOption(option);
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
              {currentOption ? "Modifier l'option" : "Nouvelle option de mobilité"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nom</label>
              <Input
                value={formData.name || ""}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nom de l'option"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Type</label>
              <Select
                value={formData.type || "bicycle"}
                onValueChange={(value) => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bicycle">🚲 Vélo</SelectItem>
                  <SelectItem value="electric_bike">⚡ Vélo électrique</SelectItem>
                  <SelectItem value="scooter">🛵 Scooter</SelectItem>
                  <SelectItem value="car">🚗 Voiture</SelectItem>
                  <SelectItem value="electric_car">🔋 Voiture électrique</SelectItem>
                  <SelectItem value="boat">🚤 Bateau</SelectItem>
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
              <label className="text-sm font-medium">CO₂ par km (g)</label>
              <Input
                type="number"
                value={formData.carbon_per_km || ""}
                onChange={(e) =>
                  setFormData({ ...formData, carbon_per_km: parseFloat(e.target.value) })
                }
                placeholder="0 pour vélo"
              />
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
                placeholder="Description de l'option..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleSave}>
              {currentOption ? "Mettre à jour" : "Créer"}
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
              Êtes-vous sûr de vouloir supprimer l'option "{currentOption?.name}" ?
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

export default AdminMobility;
