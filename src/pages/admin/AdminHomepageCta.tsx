import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { AdminLoading } from "@/components/admin/AdminTableState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  defaultHomepageCta,
  useHomepageCta,
  useUpdateHomepageCta,
} from "@/hooks/useCatalogQueries";

const AdminHomepageCta = () => {
  const { data, isLoading } = useHomepageCta();
  const updateCta = useUpdateHomepageCta();
  const [form, setForm] = useState({
    id: null as string | null,
    ...defaultHomepageCta,
    trust_text: defaultHomepageCta.trust_items.join("\n"),
  });

  useEffect(() => {
    if (!data) return;
    setForm({
      id: "id" in data && typeof data.id === "string" ? data.id : null,
      badge_text: data.badge_text,
      title: data.title,
      description: data.description,
      primary_label: data.primary_label,
      primary_url: data.primary_url,
      secondary_label: data.secondary_label,
      secondary_url: data.secondary_url,
      trust_items: data.trust_items ?? [],
      is_active: data.is_active ?? true,
      trust_text: (data.trust_items ?? defaultHomepageCta.trust_items).join("\n"),
    });
  }, [data]);

  const handleSave = async () => {
    const trust_items = form.trust_text
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      await updateCta.mutateAsync({
        id: form.id,
        badge_text: form.badge_text.trim(),
        title: form.title.trim(),
        description: form.description.trim(),
        primary_label: form.primary_label.trim(),
        primary_url: form.primary_url.trim() || "/signup",
        secondary_label: form.secondary_label.trim(),
        secondary_url: form.secondary_url.trim() || "/destinations",
        trust_items,
        is_active: form.is_active,
      });
      toast.success("Section CTA mise à jour");
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de la sauvegarde — appliquez la migration homepage_cta");
    }
  };

  return (
    <AdminLayout
      title="CTA page d'accueil"
      description="Texte et boutons du bloc « Planifiez votre premier séjour Amani » en bas de la page d'accueil."
      actions={
        <Button onClick={handleSave} disabled={updateCta.isPending || isLoading}>
          {updateCta.isPending ? "Enregistrement…" : "Enregistrer"}
        </Button>
      }
    >
      {isLoading ? (
        <AdminLoading />
      ) : (
        <div className="max-w-2xl space-y-6 bg-background rounded-xl border border-border shadow-sm p-6">
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="text-sm font-medium">Section active</p>
              <p className="text-xs text-muted-foreground">Masquer le bloc sur l&apos;accueil</p>
            </div>
            <Switch
              checked={form.is_active}
              onCheckedChange={(checked) => setForm({ ...form, is_active: checked })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Badge</label>
            <Input
              value={form.badge_text}
              onChange={(e) => setForm({ ...form, badge_text: e.target.value })}
              placeholder="Prêt pour l'aventure ?"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Titre</label>
            <Textarea
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              rows={2}
              placeholder={"Planifiez votre premier\nséjour Amani aux Comores"}
            />
            <p className="text-xs text-muted-foreground">
              Utilisez un retour à la ligne pour couper le titre en deux lignes.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Bouton principal</label>
              <Input
                value={form.primary_label}
                onChange={(e) => setForm({ ...form, primary_label: e.target.value })}
              />
              <Input
                value={form.primary_url}
                onChange={(e) => setForm({ ...form, primary_url: e.target.value })}
                placeholder="/signup"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Bouton secondaire</label>
              <Input
                value={form.secondary_label}
                onChange={(e) => setForm({ ...form, secondary_label: e.target.value })}
              />
              <Input
                value={form.secondary_url}
                onChange={(e) => setForm({ ...form, secondary_url: e.target.value })}
                placeholder="/destinations"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Points de confiance</label>
            <Textarea
              value={form.trust_text}
              onChange={(e) => setForm({ ...form, trust_text: e.target.value })}
              rows={3}
              placeholder={"Inscription gratuite\nAnnulation flexible\nSupport 24/7"}
            />
            <p className="text-xs text-muted-foreground">Un point par ligne (sans le ✓).</p>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminHomepageCta;
