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
import { MoreHorizontal, Plus, Pencil, Trash2, Star, Wifi, Search, LayoutGrid } from "lucide-react";
import { toast } from "sonner";
import ImageUpload from "@/components/admin/ImageUpload";
import { Switch } from "@/components/ui/switch";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/hooks/useCatalogQueries";

interface Destination {
  id: string;
  name: string;
  city: string;
  country: string;
  description: string | null;
  image_url: string | null;
  rating: number | null;
  wifi_speed: number | null;
  coworking_count: number | null;
  avg_price_per_day: number | null;
  carbon_score: string | null;
  highlight: string | null;
  show_in_hero: boolean;
  show_on_home: boolean;
}

const AdminDestinations = () => {
  const queryClient = useQueryClient();
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [currentDestination, setCurrentDestination] = useState<Destination | null>(null);
  const [formData, setFormData] = useState<Partial<Destination>>({});

  const invalidateHero = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.destinations });
    queryClient.invalidateQueries({ queryKey: ["catalog-counts"] });
  };

  const fetchDestinations = async () => {
    try {
      const { data, error } = await supabase
        .from("destinations")
        .select("*")
        .order("name");

      if (error) throw error;
      setDestinations(data || []);
    } catch (error) {
      console.error("Error fetching destinations:", error);
      toast.error("Erreur lors du chargement des destinations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDestinations();
  }, []);

  const openEditDialog = (destination?: Destination) => {
    if (destination) {
      setCurrentDestination(destination);
      setFormData(destination);
    } else {
      setCurrentDestination(null);
      setFormData({
        name: "",
        city: "",
        country: "Comores",
        description: "",
        image_url: "",
        rating: 4.5,
        wifi_speed: 50,
        coworking_count: 0,
        avg_price_per_day: 0,
        carbon_score: "B",
        highlight: "",
        show_in_hero: true,
        show_on_home: true,
      });
    }
    setEditDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (currentDestination) {
        const { error } = await supabase
          .from("destinations")
          .update(formData)
          .eq("id", currentDestination.id);

        if (error) throw error;
        toast.success("Destination mise à jour");
      } else {
        const { error } = await supabase.from("destinations").insert([formData as any]);

        if (error) throw error;
        toast.success("Destination créée");
      }

      setEditDialogOpen(false);
      invalidateHero();
      fetchDestinations();
    } catch (error) {
      console.error("Error saving destination:", error);
      toast.error("Erreur lors de la sauvegarde");
    }
  };

  const toggleFlag = async (
    destination: Destination,
    field: "show_in_hero" | "show_on_home"
  ) => {
    const next = !(destination[field] ?? true);
    try {
      const { error } = await supabase
        .from("destinations")
        .update({ [field]: next })
        .eq("id", destination.id);
      if (error) throw error;
      setDestinations((prev) =>
        prev.map((d) => (d.id === destination.id ? { ...d, [field]: next } : d))
      );
      invalidateHero();
      const label =
        field === "show_in_hero" ? "la recherche d'accueil" : "la grille d'accueil";
      toast.success(
        next
          ? `"${destination.name}" visible dans ${label}`
          : `"${destination.name}" retirée de ${label}`
      );
    } catch (error) {
      console.error("Error toggling flag:", error);
      toast.error("Erreur lors de la mise à jour");
    }
  };

  const handleDelete = async () => {
    if (!currentDestination) return;

    try {
      const { error } = await supabase
        .from("destinations")
        .delete()
        .eq("id", currentDestination.id);

      if (error) throw error;

      toast.success("Destination supprimée");
      setDeleteDialogOpen(false);
      setCurrentDestination(null);
      invalidateHero();
      fetchDestinations();
    } catch (error) {
      console.error("Error deleting destination:", error);
      toast.error("Erreur lors de la suppression");
    }
  };

  return (
    <AdminLayout
      title="Gestion des destinations"
      description="Recherche = barre du hero. Grille = section « Où allez-vous travailler ? » (max. 4 cartes par note)."
      allowedRoles={["partner_manager"]}
      actions={
        <Button onClick={() => openEditDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Ajouter une destination
        </Button>
      }
    >
      <div className="rounded-xl border border-border bg-background shadow-sm overflow-hidden">
        {loading ? (
          <AdminLoading />
        ) : destinations.length === 0 ? (
          <AdminEmpty title="Aucune destination trouvée" />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Destination</TableHead>
                <TableHead>Pays</TableHead>
                <TableHead>Note</TableHead>
                <TableHead>WiFi</TableHead>
                <TableHead>Coworkings</TableHead>
                <TableHead>Prix/jour</TableHead>
                <TableHead>Score CO₂</TableHead>
                <TableHead>
                  <span className="inline-flex items-center gap-1" title="Barre de recherche">
                    <Search className="h-3.5 w-3.5" />
                    Recherche
                  </span>
                </TableHead>
                <TableHead>
                  <span className="inline-flex items-center gap-1" title="Grille d'accueil">
                    <LayoutGrid className="h-3.5 w-3.5" />
                    Grille
                  </span>
                </TableHead>
                <TableHead className="w-[70px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {destinations.map((destination) => (
                <TableRow key={destination.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {destination.image_url && (
                        <img
                          src={destination.image_url}
                          alt={destination.name}
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                      )}
                      <div>
                        <p className="font-medium">{destination.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {destination.city}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{destination.country}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-warning fill-warning" />
                      {destination.rating}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Wifi className="h-4 w-4 text-muted-foreground" />
                      {destination.wifi_speed} Mbps
                    </div>
                  </TableCell>
                  <TableCell>{destination.coworking_count}</TableCell>
                  <TableCell>{destination.avg_price_per_day} €</TableCell>
                  <TableCell>
                    <Badge
                      className={ecoScoreBadge(destination.carbon_score || "B")}
                    >
                      {destination.carbon_score}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={destination.show_in_hero ?? true}
                      onCheckedChange={() => toggleFlag(destination, "show_in_hero")}
                      aria-label={`Afficher ${destination.name} dans la recherche`}
                    />
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={destination.show_on_home ?? true}
                      onCheckedChange={() => toggleFlag(destination, "show_on_home")}
                      aria-label={`Afficher ${destination.name} dans la grille d'accueil`}
                    />
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
                          onClick={() => openEditDialog(destination)}
                        >
                          <Pencil className="h-4 w-4 mr-2" />
                          Modifier
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => {
                            setCurrentDestination(destination);
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
              {currentDestination ? "Modifier la destination" : "Nouvelle destination"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nom</label>
              <Input
                value={formData.name || ""}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nom de la destination"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Ville</label>
              <Input
                value={formData.city || ""}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="Ville"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Pays</label>
              <Input
                value={formData.country || ""}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                placeholder="Pays"
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
              <label className="text-sm font-medium">Nombre de coworkings</label>
              <Input
                type="number"
                value={formData.coworking_count || ""}
                onChange={(e) =>
                  setFormData({ ...formData, coworking_count: parseInt(e.target.value) })
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Prix moyen/jour (€)</label>
              <Input
                type="number"
                value={formData.avg_price_per_day || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    avg_price_per_day: parseFloat(e.target.value),
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
            <div className="col-span-2 space-y-2">
              <label className="text-sm font-medium">Image</label>
              <ImageUpload
                value={formData.image_url || null}
                onChange={(url) => setFormData({ ...formData, image_url: url })}
                folder="destinations"
              />
            </div>
            <div className="col-span-2 space-y-2">
              <label className="text-sm font-medium">Point fort</label>
              <Input
                value={formData.highlight || ""}
                onChange={(e) =>
                  setFormData({ ...formData, highlight: e.target.value })
                }
                placeholder="Ex: Plages paradisiaques"
              />
            </div>
            <div className="col-span-2 space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={formData.description || ""}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Description de la destination..."
                rows={4}
              />
            </div>
            <div className="col-span-2 flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">Recherche d&apos;accueil</p>
                <p className="text-xs text-muted-foreground">
                  Visible dans Destination / Coworking / Expériences (hero)
                </p>
              </div>
              <Switch
                checked={formData.show_in_hero ?? true}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, show_in_hero: checked })
                }
              />
            </div>
            <div className="col-span-2 flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">Grille « Où allez-vous travailler ? »</p>
                <p className="text-xs text-muted-foreground">
                  Carte mise en avant sur la page d&apos;accueil (max. 4)
                </p>
              </div>
              <Switch
                checked={formData.show_on_home ?? true}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, show_on_home: checked })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleSave}>
              {currentDestination ? "Mettre à jour" : "Créer"}
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
              Êtes-vous sûr de vouloir supprimer la destination "{currentDestination?.name}" ?
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

export default AdminDestinations;
