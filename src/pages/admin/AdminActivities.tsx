import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { AdminLoading, AdminEmpty } from "@/components/admin/AdminTableState";
import { supabase } from "@/integrations/supabase/client";
import { ecoBadgeFromIntensity } from "@/lib/eco-score";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/hooks/useCatalogQueries";
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
import { Switch } from "@/components/ui/switch";
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
import { MoreHorizontal, Plus, Pencil, Trash2, Clock, Leaf, X, Wand2, CalendarClock } from "lucide-react";
import { toast } from "sonner";
import ImageUpload from "@/components/admin/ImageUpload";
import OfferSchedulesDialog from "@/components/admin/OfferSchedulesDialog";

interface ActivityOption {
  id?: string;
  name?: { fr?: string | null; en?: string | null };
  description?: { fr?: string | null; en?: string | null };
}

interface Activity {
  id: string;
  name: string;
  destination_id: string | null;
  category: string | null;
  description: string | null;
  long_description: string | null;
  image_url: string | null;
  alt_text: string | null;
  price: number | null;
  currency: string | null;
  duration_hours: number | null;
  duration_minutes: number | null;
  carbon_impact: number | null;
  eco_certified: boolean | null;
  universe_id: string | null;
  provider_id: string | null;
  catalogue_number: number | null;
  slug: string | null;
  tags: string[] | null;
  islands: string[] | null;
  locations: string[] | null;
  options: ActivityOption[] | null;
  included: string[] | null;
  excluded: string[] | null;
  meeting_point: string | null;
  minimum_age: number | null;
  physical_level: string | null;
  cancellation_policy: string | null;
  min_capacity: number | null;
  max_capacity: number | null;
  booking_enabled: boolean;
  featured: boolean;
  sort_order: number | null;
}

interface Destination {
  id: string;
  name: string;
  city: string;
}

interface Universe {
  id: string;
  code: string;
  name: string;
  color: string | null;
}

interface Provider {
  id: string;
  name: string;
}

/** Extra transient fields used only by the edit form (comma lists, options draft). */
interface ActivityFormData extends Partial<Activity> {
  tagsText?: string;
  islandsText?: string;
  locationsText?: string;
  includedText?: string;
  excludedText?: string;
  optionsDraft?: { title: string; description: string }[];
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

const physicalLevelLabels: Record<string, string> = {
  easy: "Facile",
  moderate: "Modéré",
  difficult: "Difficile",
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-+|-+$)/g, "");

const toCommaList = (arr: string[] | null | undefined) => (arr || []).join(", ");
const fromCommaList = (value: string) =>
  value
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);

const emptyFormData: ActivityFormData = {
  name: "",
  destination_id: null,
  category: null,
  description: "",
  long_description: "",
  image_url: "",
  alt_text: "",
  price: null,
  currency: null,
  duration_hours: null,
  duration_minutes: null,
  carbon_impact: 0,
  eco_certified: false,
  universe_id: null,
  provider_id: null,
  catalogue_number: null,
  slug: "",
  meeting_point: "",
  minimum_age: null,
  physical_level: null,
  cancellation_policy: "",
  min_capacity: null,
  max_capacity: null,
  booking_enabled: false,
  featured: false,
  sort_order: null,
  tagsText: "",
  islandsText: "",
  locationsText: "",
  includedText: "",
  excludedText: "",
  optionsDraft: [],
};

const AdminActivities = () => {
  const queryClient = useQueryClient();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [universes, setUniverses] = useState<Universe[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [currentActivity, setCurrentActivity] = useState<Activity | null>(null);
  const [formData, setFormData] = useState<ActivityFormData>({});
  const [schedulesActivity, setSchedulesActivity] = useState<Activity | null>(null);

  const invalidateActivities = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.activities });
  };

  const fetchData = async () => {
    try {
      const [activitiesResult, destinationsResult, universesResult, providersResult] =
        await Promise.all([
          supabase
            .from("activities")
            .select("*")
            .order("sort_order", { ascending: true, nullsFirst: false })
            .order("name"),
          supabase.from("destinations").select("id, name, city").order("name"),
          supabase.from("universes").select("id, code, name, color").order("sort_order"),
          supabase.from("providers").select("id, name").order("name"),
        ]);

      if (activitiesResult.error) throw activitiesResult.error;
      if (destinationsResult.error) throw destinationsResult.error;

      setActivities((activitiesResult.data as Activity[]) || []);
      setDestinations(destinationsResult.data || []);
      setUniverses(universesResult.data || []);
      setProviders(providersResult.data || []);
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
    return destination ? `${destination.name}, ${destination.city}` : "Destination inconnue";
  };

  const getLocationLabel = (activity: Activity) => {
    if (activity.destination_id) return getDestinationName(activity.destination_id);
    if (activity.islands?.length) return activity.islands.join(", ");
    return "—";
  };

  const getUniverse = (id: string | null) => universes.find((u) => u.id === id);
  const getProvider = (id: string | null) => providers.find((p) => p.id === id);

  const openEditDialog = (activity?: Activity) => {
    if (activity) {
      setCurrentActivity(activity);
      setFormData({
        ...activity,
        tagsText: toCommaList(activity.tags),
        islandsText: toCommaList(activity.islands),
        locationsText: toCommaList(activity.locations),
        includedText: toCommaList(activity.included),
        excludedText: toCommaList(activity.excluded),
        optionsDraft: (activity.options || []).map((o) => ({
          title: o.name?.fr || "",
          description: o.description?.fr || "",
        })),
      });
    } else {
      setCurrentActivity(null);
      setFormData({ ...emptyFormData });
    }
    setEditDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name?.trim()) {
      toast.error("Le nom de l'activité est requis");
      return;
    }

    const {
      tagsText,
      islandsText,
      locationsText,
      includedText,
      excludedText,
      optionsDraft,
      ...rest
    } = formData;

    const payload = {
      ...rest,
      destination_id: rest.destination_id || null,
      universe_id: rest.universe_id || null,
      provider_id: rest.provider_id || null,
      physical_level: rest.physical_level || null,
      currency: rest.currency || null,
      tags: fromCommaList(tagsText || ""),
      islands: fromCommaList(islandsText || ""),
      locations: fromCommaList(locationsText || ""),
      included: fromCommaList(includedText || ""),
      excluded: fromCommaList(excludedText || ""),
      options: (optionsDraft || [])
        .filter((o) => o.title.trim())
        .map((o) => ({
          id: slugify(o.title),
          name: { fr: o.title.trim(), en: null },
          description: { fr: o.description.trim() || null, en: null },
        })),
    };

    try {
      if (currentActivity) {
        const { error } = await supabase
          .from("activities")
          .update(payload as never)
          .eq("id", currentActivity.id);

        if (error) throw error;
        toast.success("Activité mise à jour");
      } else {
        const { error } = await supabase.from("activities").insert([payload as never]);

        if (error) throw error;
        toast.success("Activité créée");
      }

      setEditDialogOpen(false);
      invalidateActivities();
      fetchData();
    } catch (error) {
      console.error("Error saving activity:", error);
      toast.error("Erreur lors de la sauvegarde");
    }
  };

  const toggleBookingEnabled = async (activity: Activity) => {
    const next = !activity.booking_enabled;
    try {
      const { error } = await supabase
        .from("activities")
        .update({ booking_enabled: next })
        .eq("id", activity.id);
      if (error) throw error;
      setActivities((prev) =>
        prev.map((a) => (a.id === activity.id ? { ...a, booking_enabled: next } : a)),
      );
      invalidateActivities();
      toast.success(
        next
          ? `Réservation activée pour "${activity.name}"`
          : `Réservation désactivée pour "${activity.name}"`,
      );
    } catch (error) {
      console.error("Error toggling booking_enabled:", error);
      toast.error("Erreur lors de la mise à jour");
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
      invalidateActivities();
      fetchData();
    } catch (error) {
      console.error("Error deleting activity:", error);
      toast.error("Erreur lors de la suppression");
    }
  };

  const getCarbonBadgeColor = (carbonImpact: number | null) =>
    `${ecoBadgeFromIntensity(carbonImpact, [0, 5, 10, 20])} text-primary-foreground`;

  const addOptionRow = () => {
    setFormData((prev) => ({
      ...prev,
      optionsDraft: [...(prev.optionsDraft || []), { title: "", description: "" }],
    }));
  };

  const updateOptionRow = (index: number, field: "title" | "description", value: string) => {
    setFormData((prev) => ({
      ...prev,
      optionsDraft: (prev.optionsDraft || []).map((o, i) =>
        i === index ? { ...o, [field]: value } : o,
      ),
    }));
  };

  const removeOptionRow = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      optionsDraft: (prev.optionsDraft || []).filter((_, i) => i !== index),
    }));
  };

  return (
    <AdminLayout
      title="Gestion des activités"
      description="Expériences et activités locales proposées aux voyageurs — catalogue Coworkation Eco-Comores et créations manuelles."
      allowedRoles={["partner_manager"]}
      actions={
        <Button onClick={() => openEditDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Ajouter une activité
        </Button>
      }
    >
      <div className="rounded-xl border border-border bg-background shadow-sm overflow-hidden">
        {loading ? (
          <AdminLoading />
        ) : activities.length === 0 ? (
          <AdminEmpty title="Aucune activité trouvée" />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Univers / Catégorie</TableHead>
                <TableHead>Prestataire</TableHead>
                <TableHead>Localisation</TableHead>
                <TableHead>Durée</TableHead>
                <TableHead>Prix</TableHead>
                <TableHead>CO₂</TableHead>
                <TableHead>Réservable</TableHead>
                <TableHead className="w-[70px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activities.map((activity) => {
                const universe = getUniverse(activity.universe_id);
                const provider = getProvider(activity.provider_id);
                return (
                  <TableRow key={activity.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <span className="text-xl">
                          {categoryIcons[activity.category || ""] || "🎯"}
                        </span>
                        <div>
                          <p className="font-medium">{activity.name}</p>
                          {activity.catalogue_number != null && (
                            <p className="text-xs text-muted-foreground">
                              #{activity.catalogue_number} · {activity.slug}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {universe ? (
                        <Badge variant="outline" className="gap-1.5">
                          <span
                            className="h-2 w-2 rounded-full shrink-0"
                            style={{ backgroundColor: universe.color || "currentColor" }}
                          />
                          {universe.name}
                        </Badge>
                      ) : activity.category ? (
                        <Badge variant="outline">
                          {categoryLabels[activity.category] || activity.category}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {provider ? provider.name : <span className="text-muted-foreground">—</span>}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate" title={getLocationLabel(activity)}>
                      {getLocationLabel(activity)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        {activity.duration_hours != null
                          ? `${activity.duration_hours}h`
                          : activity.duration_minutes != null
                            ? `${Math.round(activity.duration_minutes / 60)}h`
                            : "—"}
                      </div>
                    </TableCell>
                    <TableCell>
                      {activity.price != null ? `${activity.price} ${activity.currency || "€"}` : "—"}
                    </TableCell>
                    <TableCell>
                      <Badge className={getCarbonBadgeColor(activity.carbon_impact)}>
                        <Leaf className="h-3 w-3 mr-1" />
                        {activity.carbon_impact || 0}kg
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={activity.booking_enabled}
                        onCheckedChange={() => toggleBookingEnabled(activity)}
                        aria-label={`Réservation ${activity.booking_enabled ? "activée" : "désactivée"} pour ${activity.name}`}
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
                          <DropdownMenuItem onClick={() => openEditDialog(activity)}>
                            <Pencil className="h-4 w-4 mr-2" />
                            Modifier
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setSchedulesActivity(activity)}>
                            <CalendarClock className="h-4 w-4 mr-2" />
                            Créneaux
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
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Edit/Create Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {currentActivity ? "Modifier l'activité" : "Nouvelle activité"}
            </DialogTitle>
            <DialogDescription>
              Les tarifs, capacités et point de rendez-vous doivent être confirmés avant
              d'activer la réservation.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4">
            <h4 className="col-span-2 text-sm font-semibold text-foreground">Identification</h4>

            <div className="space-y-2">
              <label className="text-sm font-medium">Nom</label>
              <Input
                value={formData.name || ""}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nom de l'activité"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Slug</label>
              <div className="flex gap-2">
                <Input
                  value={formData.slug || ""}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="mon-activite"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  title="Générer depuis le nom"
                  onClick={() =>
                    setFormData({ ...formData, slug: slugify(formData.name || "") })
                  }
                >
                  <Wand2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Univers</label>
              <Select
                value={formData.universe_id || "none"}
                onValueChange={(value) =>
                  setFormData({ ...formData, universe_id: value === "none" ? null : value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Aucun univers</SelectItem>
                  {universes.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.code} — {u.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Prestataire</label>
              <Select
                value={formData.provider_id || "none"}
                onValueChange={(value) =>
                  setFormData({ ...formData, provider_id: value === "none" ? null : value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Aucun prestataire</SelectItem>
                  {providers.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Catégorie (legacy)</label>
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
              <label className="text-sm font-medium">Destination (fiche unique)</label>
              <Select
                value={formData.destination_id || "none"}
                onValueChange={(value) =>
                  setFormData({ ...formData, destination_id: value === "none" ? null : value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une destination" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Aucune (circuit multi-lieux)</SelectItem>
                  {destinations.map((dest) => (
                    <SelectItem key={dest.id} value={dest.id}>
                      {dest.name}, {dest.city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <h4 className="col-span-2 text-sm font-semibold text-foreground pt-2 border-t border-border">
              Localisation
            </h4>
            <div className="space-y-2">
              <label className="text-sm font-medium">Îles (séparées par une virgule)</label>
              <Input
                value={formData.islandsText || ""}
                onChange={(e) => setFormData({ ...formData, islandsText: e.target.value })}
                placeholder="Ngazidja, Mohéli"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Lieux (séparés par une virgule)</label>
              <Input
                value={formData.locationsText || ""}
                onChange={(e) => setFormData({ ...formData, locationsText: e.target.value })}
                placeholder="Médina de Moroni, Iconi"
              />
            </div>

            <h4 className="col-span-2 text-sm font-semibold text-foreground pt-2 border-t border-border">
              Description
            </h4>
            <div className="col-span-2 space-y-2">
              <label className="text-sm font-medium">Description courte</label>
              <Textarea
                value={formData.description || ""}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Résumé affiché sur les cartes..."
                rows={2}
              />
            </div>
            <div className="col-span-2 space-y-2">
              <label className="text-sm font-medium">Description longue</label>
              <Textarea
                value={formData.long_description || ""}
                onChange={(e) => setFormData({ ...formData, long_description: e.target.value })}
                placeholder="Description détaillée de l'expérience..."
                rows={4}
              />
            </div>
            <div className="col-span-2 space-y-2">
              <label className="text-sm font-medium">Tags (séparés par une virgule)</label>
              <Input
                value={formData.tagsText || ""}
                onChange={(e) => setFormData({ ...formData, tagsText: e.target.value })}
                placeholder="gastronomie, culture, immersion"
              />
            </div>

            <h4 className="col-span-2 text-sm font-semibold text-foreground pt-2 border-t border-border">
              Détails pratiques
            </h4>
            <div className="space-y-2">
              <label className="text-sm font-medium">Durée (heures)</label>
              <Input
                type="number"
                min="0.5"
                step="0.5"
                value={formData.duration_hours ?? ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    duration_hours: e.target.value === "" ? null : parseFloat(e.target.value),
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Durée (minutes, circuits multi-jours)</label>
              <Input
                type="number"
                min="1"
                value={formData.duration_minutes ?? ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    duration_minutes: e.target.value === "" ? null : parseInt(e.target.value, 10),
                  })
                }
                placeholder="Ex : 4320 pour 3 jours"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Niveau physique</label>
              <Select
                value={formData.physical_level || "none"}
                onValueChange={(value) =>
                  setFormData({ ...formData, physical_level: value === "none" ? null : value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Non précisé</SelectItem>
                  <SelectItem value="easy">{physicalLevelLabels.easy}</SelectItem>
                  <SelectItem value="moderate">{physicalLevelLabels.moderate}</SelectItem>
                  <SelectItem value="difficult">{physicalLevelLabels.difficult}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Âge minimum</label>
              <Input
                type="number"
                min="0"
                value={formData.minimum_age ?? ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    minimum_age: e.target.value === "" ? null : parseInt(e.target.value, 10),
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Capacité minimale</label>
              <Input
                type="number"
                min="1"
                value={formData.min_capacity ?? ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    min_capacity: e.target.value === "" ? null : parseInt(e.target.value, 10),
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Capacité maximale</label>
              <Input
                type="number"
                min="1"
                value={formData.max_capacity ?? ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    max_capacity: e.target.value === "" ? null : parseInt(e.target.value, 10),
                  })
                }
              />
            </div>
            <div className="col-span-2 space-y-2">
              <label className="text-sm font-medium">Point de rendez-vous</label>
              <Input
                value={formData.meeting_point || ""}
                onChange={(e) => setFormData({ ...formData, meeting_point: e.target.value })}
                placeholder="Ex : Accueil du centre de coworking, Moroni"
              />
            </div>
            <div className="col-span-2 space-y-2">
              <label className="text-sm font-medium">Politique d'annulation</label>
              <Textarea
                value={formData.cancellation_policy || ""}
                onChange={(e) =>
                  setFormData({ ...formData, cancellation_policy: e.target.value })
                }
                rows={2}
              />
            </div>

            <h4 className="col-span-2 text-sm font-semibold text-foreground pt-2 border-t border-border">
              Tarification & impact
            </h4>
            <div className="space-y-2">
              <label className="text-sm font-medium">Prix</label>
              <Input
                type="number"
                value={formData.price ?? ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    price: e.target.value === "" ? null : parseFloat(e.target.value),
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Devise</label>
              <Select
                value={formData.currency || "none"}
                onValueChange={(value) =>
                  setFormData({ ...formData, currency: value === "none" ? null : value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Non précisée</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="KMF">KMF</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Impact carbone (kg CO₂)</label>
              <Input
                type="number"
                value={formData.carbon_impact ?? ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    carbon_impact: e.target.value === "" ? null : parseFloat(e.target.value),
                  })
                }
                placeholder="0 pour activités neutres"
              />
            </div>
            <div className="flex items-center space-x-2 pt-6">
              <Checkbox
                id="eco_certified"
                checked={formData.eco_certified || false}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, eco_certified: checked as boolean })
                }
              />
              <label htmlFor="eco_certified" className="text-sm font-medium">
                Certifié éco-responsable
              </label>
            </div>

            <h4 className="col-span-2 text-sm font-semibold text-foreground pt-2 border-t border-border">
              Inclus / exclus
            </h4>
            <div className="space-y-2">
              <label className="text-sm font-medium">Inclus (séparés par une virgule)</label>
              <Textarea
                value={formData.includedText || ""}
                onChange={(e) => setFormData({ ...formData, includedText: e.target.value })}
                rows={2}
                placeholder="Transport, guide, équipement"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Exclus (séparés par une virgule)</label>
              <Textarea
                value={formData.excludedText || ""}
                onChange={(e) => setFormData({ ...formData, excludedText: e.target.value })}
                rows={2}
                placeholder="Boissons, pourboires"
              />
            </div>

            <div className="col-span-2 flex items-center justify-between pt-2 border-t border-border">
              <h4 className="text-sm font-semibold text-foreground">Formules / options</h4>
              <Button type="button" variant="outline" size="sm" onClick={addOptionRow}>
                <Plus className="h-4 w-4 mr-1" />
                Ajouter une formule
              </Button>
            </div>
            {(formData.optionsDraft || []).length === 0 && (
              <p className="col-span-2 text-sm text-muted-foreground">
                Aucune formule. Utile pour les activités à plusieurs niveaux (ex : plongée
                initiation/avancé).
              </p>
            )}
            {(formData.optionsDraft || []).map((option, index) => (
              <div key={index} className="col-span-2 flex gap-2 items-start">
                <div className="flex-1 space-y-2">
                  <Input
                    value={option.title}
                    onChange={(e) => updateOptionRow(index, "title", e.target.value)}
                    placeholder="Nom de la formule"
                  />
                  <Textarea
                    value={option.description}
                    onChange={(e) => updateOptionRow(index, "description", e.target.value)}
                    placeholder="Description de la formule"
                    rows={2}
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeOptionRow(index)}
                  className="mt-1"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}

            <h4 className="col-span-2 text-sm font-semibold text-foreground pt-2 border-t border-border">
              Média
            </h4>
            <div className="col-span-2 space-y-2">
              <label className="text-sm font-medium">Image de couverture</label>
              <ImageUpload
                value={formData.image_url || null}
                onChange={(url) => setFormData({ ...formData, image_url: url })}
                folder="activities"
              />
            </div>
            <div className="col-span-2 space-y-2">
              <label className="text-sm font-medium">Texte alternatif (accessibilité)</label>
              <Input
                value={formData.alt_text || ""}
                onChange={(e) => setFormData({ ...formData, alt_text: e.target.value })}
                placeholder="Description de l'image pour les lecteurs d'écran"
              />
            </div>

            <h4 className="col-span-2 text-sm font-semibold text-foreground pt-2 border-t border-border">
              Statut
            </h4>
            <div className="space-y-2">
              <label className="text-sm font-medium">Ordre d'affichage</label>
              <Input
                type="number"
                value={formData.sort_order ?? ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    sort_order: e.target.value === "" ? null : parseInt(e.target.value, 10),
                  })
                }
              />
            </div>
            <div className="flex items-center space-x-2 pt-6">
              <Checkbox
                id="featured"
                checked={formData.featured || false}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, featured: checked as boolean })
                }
              />
              <label htmlFor="featured" className="text-sm font-medium">
                Mise en avant
              </label>
            </div>
            <div className="col-span-2 flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">Réservation activée</p>
                <p className="text-xs text-muted-foreground">
                  À activer uniquement lorsque prix, durée et capacité sont confirmés.
                </p>
              </div>
              <Switch
                checked={formData.booking_enabled || false}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, booking_enabled: checked })
                }
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

      {schedulesActivity && (
        <OfferSchedulesDialog
          open={!!schedulesActivity}
          onOpenChange={(open) => !open && setSchedulesActivity(null)}
          offerId={schedulesActivity.id}
          offerName={schedulesActivity.name}
          defaultPrice={schedulesActivity.price}
        />
      )}
    </AdminLayout>
  );
};

export default AdminActivities;
