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
import { Checkbox } from "@/components/ui/checkbox";
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
import { MoreHorizontal, Plus, Pencil, Trash2, Clock, Leaf } from "lucide-react";
import { toast } from "sonner";

interface Activity {
  id: string;
  name: string;
  destination_id: string;
  category: string | null;
  description: string | null;
  image_url: string | null;
  price: number | null;
  duration_hours: number | null;
  carbon_impact: number | null;
  eco_certified: boolean | null;
}

interface Destination {
  id: string;
  name: string;
  city: string;
}

const categoryLabels: Record<string, string> = {
  nature: "Nature",
  culture: "Culture",
  adventure: "Aventure",
  relaxation: "Détente",
  gastronomy: "Gastronomie",
  sports: "Sports",
  water: "Nautique",
};

const categoryIcons: Record<string, string> = {
  nature: "🌿",
  culture: "🏛️",
  adventure: "🎯",
  relaxation: "🧘",
  gastronomy: "🍽️",
  sports: "⚽",
  water: "🌊",
};

const AdminActivities = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [currentActivity, setCurrentActivity] = useState<Activity | null>(null);
  const [formData, setFormData] = useState<Partial<Activity>>({});

  const fetchData = async () => {
    try {
      const [activitiesResult, destinationsResult] = await Promise.all([
        supabase.from("activities").select("*").order("name"),
        supabase.from("destinations").select("id, name, city").order("name"),
      ]);

      if (activitiesResult.error) throw activitiesResult.error;
      if (destinationsResult.error) throw destinationsResult.error;

      setActivities(activitiesResult.data || []);
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

  const openEditDialog = (activity?: Activity) => {
    if (activity) {
      setCurrentActivity(activity);
      setFormData(activity);
    } else {
      setCurrentActivity(null);
      setFormData({
        name: "",
        destination_id: destinations[0]?.id || "",
        category: "nature",
        description: "",
        image_url: "",
        price: 0,
        duration_hours: 2,
        carbon_impact: 0,
        eco_certified: false,
      });
    }
    setEditDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (currentActivity) {
        const { error } = await supabase
          .from("activities")
          .update(formData)
          .eq("id", currentActivity.id);

        if (error) throw error;
        toast.success("Activité mise à jour");
      } else {
        const { error } = await supabase.from("activities").insert([formData as any]);

        if (error) throw error;
        toast.success("Activité créée");
      }

      setEditDialogOpen(false);
      fetchData();
    } catch (error) {
      console.error("Error saving activity:", error);
      toast.error("Erreur lors de la sauvegarde");
    }
  };

  const handleDelete = async () => {
    if (!currentActivity) return;

    try {
      const { error } = await supabase
        .from("activities")
        .delete()
        .eq("id", currentActivity.id);

      if (error) throw error;

      toast.success("Activité supprimée");
      setDeleteDialogOpen(false);
      setCurrentActivity(null);
      fetchData();
    } catch (error) {
      console.error("Error deleting activity:", error);
      toast.error("Erreur lors de la suppression");
    }
  };

  const getCarbonBadgeColor = (carbonImpact: number | null) => {
    if (!carbonImpact || carbonImpact === 0) return "bg-eco-a";
    if (carbonImpact < 5) return "bg-eco-b";
    if (carbonImpact < 10) return "bg-eco-c";
    if (carbonImpact < 20) return "bg-eco-d";
    return "bg-eco-e";
  };

  return (
    <AdminLayout title="Gestion des activités">
      <div className="mb-4">
        <Button onClick={() => openEditDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Ajouter une activité
        </Button>
      </div>

      <div className="bg-background rounded-lg border">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto"></div>
          </div>
        ) : activities.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            Aucune activité trouvée
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Catégorie</TableHead>
                <TableHead>Destination</TableHead>
                <TableHead>Durée</TableHead>
                <TableHead>Prix</TableHead>
                <TableHead>CO₂</TableHead>
                <TableHead>Éco</TableHead>
                <TableHead className="w-[70px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activities.map((activity) => (
                <TableRow key={activity.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <span className="text-xl">
                        {categoryIcons[activity.category || "nature"] || "🎯"}
                      </span>
                      <p className="font-medium">{activity.name}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {categoryLabels[activity.category || "nature"] ||
                        activity.category}
                    </Badge>
                  </TableCell>
                  <TableCell>{getDestinationName(activity.destination_id)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      {activity.duration_hours}h
                    </div>
                  </TableCell>
                  <TableCell>{activity.price} €</TableCell>
                  <TableCell>
                    <Badge
                      className={`${getCarbonBadgeColor(activity.carbon_impact)} text-primary-foreground`}
                    >
                      <Leaf className="h-3 w-3 mr-1" />
                      {activity.carbon_impact || 0}kg
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {activity.eco_certified ? (
                      <Badge className="bg-success text-success-foreground">✓ Certifié</Badge>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditDialog(activity)}>
                          <Pencil className="h-4 w-4 mr-2" />
                          Modifier
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => {
                            setCurrentActivity(activity);
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
              {currentActivity ? "Modifier l'activité" : "Nouvelle activité"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nom</label>
              <Input
                value={formData.name || ""}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nom de l'activité"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Catégorie</label>
              <Select
                value={formData.category || "nature"}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nature">🌿 Nature</SelectItem>
                  <SelectItem value="culture">🏛️ Culture</SelectItem>
                  <SelectItem value="adventure">🎯 Aventure</SelectItem>
                  <SelectItem value="relaxation">🧘 Détente</SelectItem>
                  <SelectItem value="gastronomy">🍽️ Gastronomie</SelectItem>
                  <SelectItem value="sports">⚽ Sports</SelectItem>
                  <SelectItem value="water">🌊 Nautique</SelectItem>
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
              <label className="text-sm font-medium">Durée (heures)</label>
              <Input
                type="number"
                min="0.5"
                step="0.5"
                value={formData.duration_hours || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    duration_hours: parseFloat(e.target.value),
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Prix (€)</label>
              <Input
                type="number"
                value={formData.price || ""}
                onChange={(e) =>
                  setFormData({ ...formData, price: parseFloat(e.target.value) })
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Impact carbone (kg CO₂)</label>
              <Input
                type="number"
                value={formData.carbon_impact || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    carbon_impact: parseFloat(e.target.value),
                  })
                }
                placeholder="0 pour activités neutres"
              />
            </div>
            <div className="col-span-2 flex items-center space-x-2">
              <Checkbox
                id="eco_certified"
                checked={formData.eco_certified || false}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, eco_certified: checked as boolean })
                }
              />
              <label
                htmlFor="eco_certified"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Certifié éco-responsable
              </label>
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
                placeholder="Description de l'activité..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleSave}>
              {currentActivity ? "Mettre à jour" : "Créer"}
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
              Êtes-vous sûr de vouloir supprimer l'activité "{currentActivity?.name}" ?
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

export default AdminActivities;
