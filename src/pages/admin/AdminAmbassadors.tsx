import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import AdminLayout from "@/components/admin/AdminLayout";
import { AdminLoading, AdminEmpty } from "@/components/admin/AdminTableState";
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
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  queryKeys,
  useAmbassadors,
  useAmbassadorBenefits,
} from "@/hooks/useCatalogQueries";

type Ambassador = NonNullable<ReturnType<typeof useAmbassadors>["data"]>[number];

const emptyAmbassador = {
  name: "",
  title: "",
  location: "",
  bio: "",
  avatar_url: "",
  carbon_saved: 0,
  countries_visited: 0,
  followers_label: "0",
  specialties: "",
  instagram_url: "",
  linkedin_url: "",
  website_url: "",
  sort_order: 0,
  published: true,
};

const AdminAmbassadors = () => {
  const queryClient = useQueryClient();
  const { data: ambassadors = [], isLoading } = useAmbassadors(true);
  const { data: benefits = [], isLoading: loadingBenefits } = useAmbassadorBenefits(true);

  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState<Ambassador | null>(null);
  const [form, setForm] = useState(emptyAmbassador);
  const [saving, setSaving] = useState(false);
  const [benefitLabel, setBenefitLabel] = useState("");

  const openEdit = (row?: Ambassador) => {
    if (row) {
      setCurrent(row);
      setForm({
        name: row.name,
        title: row.title || "",
        location: row.location || "",
        bio: row.bio || "",
        avatar_url: row.avatar_url || "",
        carbon_saved: row.carbon_saved,
        countries_visited: row.countries_visited,
        followers_label: row.followers_label,
        specialties: (row.specialties || []).join(", "),
        instagram_url: row.instagram_url || "",
        linkedin_url: row.linkedin_url || "",
        website_url: row.website_url || "",
        sort_order: row.sort_order,
        published: row.published,
      });
    } else {
      setCurrent(null);
      setForm({ ...emptyAmbassador, sort_order: ambassadors.length + 1 });
    }
    setOpen(true);
  };

  const save = async () => {
    if (!form.name.trim()) {
      toast.error("Le nom est requis");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        title: form.title || null,
        location: form.location || null,
        bio: form.bio || null,
        avatar_url: form.avatar_url || null,
        carbon_saved: form.carbon_saved,
        countries_visited: form.countries_visited,
        followers_label: form.followers_label || "0",
        specialties: form.specialties
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        instagram_url: form.instagram_url || null,
        linkedin_url: form.linkedin_url || null,
        website_url: form.website_url || null,
        sort_order: form.sort_order,
        published: form.published,
        updated_at: new Date().toISOString(),
      };
      if (current) {
        const { error } = await supabase
          .from("ambassadors")
          .update(payload)
          .eq("id", current.id);
        if (error) throw error;
        toast.success("Ambassadeur mis à jour");
      } else {
        const { error } = await supabase.from("ambassadors").insert(payload);
        if (error) throw error;
        toast.success("Ambassadeur créé");
      }
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: queryKeys.ambassadors });
    } catch (e) {
      console.error(e);
      toast.error("Erreur — appliquez la migration ambassadors_admin_cms");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Supprimer cet ambassadeur ?")) return;
    const { error } = await supabase.from("ambassadors").delete().eq("id", id);
    if (error) {
      toast.error("Suppression impossible");
      return;
    }
    toast.success("Supprimé");
    queryClient.invalidateQueries({ queryKey: queryKeys.ambassadors });
  };

  const addBenefit = async () => {
    if (!benefitLabel.trim()) return;
    const { error } = await supabase.from("ambassador_benefits").insert({
      label: benefitLabel.trim(),
      sort_order: benefits.length + 1,
      published: true,
    });
    if (error) {
      toast.error("Ajout impossible");
      return;
    }
    setBenefitLabel("");
    toast.success("Avantage ajouté");
    queryClient.invalidateQueries({ queryKey: queryKeys.ambassadorBenefits });
  };

  const removeBenefit = async (id: string) => {
    const { error } = await supabase.from("ambassador_benefits").delete().eq("id", id);
    if (error) {
      toast.error("Suppression impossible");
      return;
    }
    toast.success("Avantage supprimé");
    queryClient.invalidateQueries({ queryKey: queryKeys.ambassadorBenefits });
  };

  return (
    <AdminLayout
      title="Ambassadeurs"
      description="Profils et avantages affichés sur /ambassadors."
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link to="/ambassadors" target="_blank" rel="noreferrer">
              <ExternalLink className="w-4 h-4 mr-2" />
              Voir /ambassadors
            </Link>
          </Button>
          <Button onClick={() => openEdit()}>
            <Plus className="w-4 h-4 mr-2" />
            Nouvel ambassadeur
          </Button>
        </div>
      }
    >
      <Tabs defaultValue="people">
        <TabsList>
          <TabsTrigger value="people">Profils</TabsTrigger>
          <TabsTrigger value="benefits">Avantages</TabsTrigger>
        </TabsList>

        <TabsContent value="people" className="mt-6">
          {isLoading ? (
            <AdminLoading />
          ) : ambassadors.length === 0 ? (
            <AdminEmpty
              title="Aucun ambassadeur"
              description="Ajoutez les profils visibles sur la page publique."
            />
          ) : (
            <div className="rounded-xl border border-border bg-background overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Titre</TableHead>
                    <TableHead>Ordre</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="w-[100px]" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ambassadors.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell className="font-medium">{a.name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {a.title}
                      </TableCell>
                      <TableCell>{a.sort_order}</TableCell>
                      <TableCell>
                        <Badge variant={a.published ? "default" : "outline"}>
                          {a.published ? "Publié" : "Masqué"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button size="icon" variant="ghost" onClick={() => openEdit(a)}>
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => remove(a.id)}>
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        <TabsContent value="benefits" className="mt-6 space-y-4">
          <div className="flex gap-2 max-w-xl">
            <Input
              placeholder="Nouvel avantage…"
              value={benefitLabel}
              onChange={(e) => setBenefitLabel(e.target.value)}
            />
            <Button onClick={addBenefit}>Ajouter</Button>
          </div>
          {loadingBenefits ? (
            <AdminLoading />
          ) : (
            <div className="rounded-xl border border-border bg-background overflow-hidden max-w-xl">
              <Table>
                <TableBody>
                  {benefits.map((b) => (
                    <TableRow key={b.id}>
                      <TableCell>{b.label}</TableCell>
                      <TableCell className="w-[60px]">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => removeBenefit(b.id)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {current ? "Modifier l'ambassadeur" : "Nouvel ambassadeur"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              placeholder="Nom"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <Input
              placeholder="Titre"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
            <Input
              placeholder="Localisation (ex. Paris → Moroni)"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
            />
            <Textarea
              placeholder="Bio"
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
            />
            <Input
              placeholder="URL avatar"
              value={form.avatar_url}
              onChange={(e) => setForm({ ...form, avatar_url: e.target.value })}
            />
            <Input
              placeholder="Spécialités (séparées par des virgules)"
              value={form.specialties}
              onChange={(e) => setForm({ ...form, specialties: e.target.value })}
            />
            <div className="grid grid-cols-3 gap-2">
              <Input
                type="number"
                placeholder="CO₂"
                value={form.carbon_saved}
                onChange={(e) =>
                  setForm({ ...form, carbon_saved: Number(e.target.value) || 0 })
                }
              />
              <Input
                type="number"
                placeholder="Pays"
                value={form.countries_visited}
                onChange={(e) =>
                  setForm({ ...form, countries_visited: Number(e.target.value) || 0 })
                }
              />
              <Input
                placeholder="Followers"
                value={form.followers_label}
                onChange={(e) => setForm({ ...form, followers_label: e.target.value })}
              />
            </div>
            <Input
              placeholder="Instagram URL"
              value={form.instagram_url}
              onChange={(e) => setForm({ ...form, instagram_url: e.target.value })}
            />
            <Input
              placeholder="LinkedIn URL"
              value={form.linkedin_url}
              onChange={(e) => setForm({ ...form, linkedin_url: e.target.value })}
            />
            <Input
              placeholder="Site web"
              value={form.website_url}
              onChange={(e) => setForm({ ...form, website_url: e.target.value })}
            />
            <Input
              type="number"
              placeholder="Ordre"
              value={form.sort_order}
              onChange={(e) =>
                setForm({ ...form, sort_order: Number(e.target.value) || 0 })
              }
            />
            <div className="flex items-center justify-between">
              <span className="text-sm">Publié</span>
              <Switch
                checked={form.published}
                onCheckedChange={(published) => setForm({ ...form, published })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button onClick={save} disabled={saving}>
              {saving ? "Enregistrement…" : "Enregistrer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminAmbassadors;
