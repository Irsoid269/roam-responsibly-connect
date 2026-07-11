import { useEffect, useState, type ReactNode } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import AdminLayout from "@/components/admin/AdminLayout";
import { AdminLoading } from "@/components/admin/AdminTableState";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ExternalLink, Plus, Trash2, Save } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  cmsKeys,
  useCmsHero,
  useUpdateCmsHero,
  useCmsStats,
  useCmsInfoCards,
  useMissionValues,
  useMissionMilestones,
  useMissionTeam,
  usePartnerOrgs,
  useImpactBreakdown,
  useImpactQuarters,
  type CmsPageKey,
} from "@/hooks/useCmsContent";
import { CMS_ICON_OPTIONS } from "@/lib/cms-icons";

function HeroEditor({ pageKey, publicPath }: { pageKey: CmsPageKey; publicPath: string }) {
  const { data, isLoading } = useCmsHero(pageKey);
  const update = useUpdateCmsHero();
  const [form, setForm] = useState({
    badge_text: "",
    title: "",
    title_highlight: "",
    description: "",
    cta_label: "",
    cta_url: "",
    pdf_url: "",
  });

  useEffect(() => {
    if (!data) return;
    setForm({
      badge_text: data.badge_text || "",
      title: data.title || "",
      title_highlight: data.title_highlight || "",
      description: data.description || "",
      cta_label: data.cta_label || "",
      cta_url: data.cta_url || "",
      pdf_url: data.pdf_url || "",
    });
  }, [data]);

  const save = async () => {
    try {
      await update.mutateAsync({
        page_key: pageKey,
        badge_text: form.badge_text || null,
        title: form.title.trim() || "Titre",
        title_highlight: form.title_highlight || null,
        description: form.description || null,
        cta_label: form.cta_label || null,
        cta_url: form.cta_url || null,
        pdf_url: form.pdf_url || null,
      });
      toast.success("En-tête enregistré");
    } catch (e) {
      console.error(e);
      toast.error("Erreur — appliquez la migration impact_mission_cms");
    }
  };

  if (isLoading) return <AdminLoading />;

  return (
    <div className="space-y-3 max-w-2xl rounded-xl border border-border bg-background p-5">
      <div className="flex justify-between items-center gap-2">
        <h3 className="font-medium">En-tête de page</h3>
        <Button variant="outline" size="sm" asChild>
          <Link to={publicPath} target="_blank" rel="noreferrer">
            <ExternalLink className="w-3.5 h-3.5 mr-1" />
            Voir
          </Link>
        </Button>
      </div>
      <Input
        placeholder="Badge"
        value={form.badge_text}
        onChange={(e) => setForm({ ...form, badge_text: e.target.value })}
      />
      <Input
        placeholder="Titre"
        value={form.title}
        onChange={(e) => setForm({ ...form, title: e.target.value })}
      />
      <Input
        placeholder="Surbrillance titre (optionnel)"
        value={form.title_highlight}
        onChange={(e) => setForm({ ...form, title_highlight: e.target.value })}
      />
      <Textarea
        placeholder="Description"
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
      />
      <div className="grid sm:grid-cols-2 gap-2">
        <Input
          placeholder="Label CTA"
          value={form.cta_label}
          onChange={(e) => setForm({ ...form, cta_label: e.target.value })}
        />
        <Input
          placeholder="URL CTA"
          value={form.cta_url}
          onChange={(e) => setForm({ ...form, cta_url: e.target.value })}
        />
      </div>
      {pageKey === "impact_report" && (
        <Input
          placeholder="URL PDF du rapport"
          value={form.pdf_url}
          onChange={(e) => setForm({ ...form, pdf_url: e.target.value })}
        />
      )}
      <Button onClick={save} disabled={update.isPending}>
        <Save className="w-4 h-4 mr-2" />
        Enregistrer l&apos;en-tête
      </Button>
    </div>
  );
}

function SimpleRowsEditor({
  title,
  rows,
  columns,
  onAdd,
  onDelete,
  renderCells,
}: {
  title: string;
  rows: { id: string }[];
  columns: string[];
  onAdd: () => void;
  onDelete: (id: string) => void;
  renderCells: (row: { id: string }) => ReactNode;
}) {
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h3 className="font-medium">{title}</h3>
        <Button size="sm" onClick={onAdd}>
          <Plus className="w-4 h-4 mr-1" />
          Ajouter
        </Button>
      </div>
      <div className="rounded-xl border border-border overflow-hidden bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((c) => (
                <TableHead key={c}>{c}</TableHead>
              ))}
              <TableHead className="w-[60px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id}>
                {renderCells(row)}
                <TableCell>
                  <Button size="icon" variant="ghost" onClick={() => onDelete(row.id)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

const AdminImpactContent = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get("tab") || "mission";
  const setTab = (value: string) => setSearchParams({ tab: value });
  const qc = useQueryClient();
  const { data: values = [] } = useMissionValues(true);
  const { data: milestones = [] } = useMissionMilestones(true);
  const { data: team = [] } = useMissionTeam(true);
  const { data: carbonStats = [] } = useCmsStats("carbon", true);
  const { data: infoCards = [] } = useCmsInfoCards("carbon", true);
  const { data: partners = [] } = usePartnerOrgs(true);
  const { data: reportStats = [] } = useCmsStats("impact_report", true);
  const { data: breakdown = [] } = useImpactBreakdown(true);
  const { data: quarters = [] } = useImpactQuarters(true);

  const invalidate = (...keys: (readonly string[])[]) => {
    keys.forEach((k) => qc.invalidateQueries({ queryKey: k }));
  };

  const addValue = async () => {
    const title = prompt("Titre de la valeur ?");
    if (!title) return;
    const { error } = await supabase.from("mission_values").insert({
      title,
      description: "",
      icon_key: "leaf",
      sort_order: values.length + 1,
    });
    if (error) toast.error(error.message);
    else {
      toast.success("Ajouté");
      invalidate(cmsKeys.missionValues);
    }
  };

  const addMilestone = async () => {
    const year = prompt("Année ?") || new Date().getFullYear().toString();
    const event = prompt("Événement ?");
    if (!event) return;
    const { error } = await supabase.from("mission_milestones").insert({
      year,
      event,
      description: "",
      sort_order: milestones.length + 1,
    });
    if (error) toast.error(error.message);
    else {
      toast.success("Ajouté");
      invalidate(cmsKeys.missionMilestones);
    }
  };

  const addTeam = async () => {
    const name = prompt("Nom ?");
    if (!name) return;
    const { error } = await supabase.from("mission_team").insert({
      name,
      role: "",
      bio: "",
      sort_order: team.length + 1,
    });
    if (error) toast.error(error.message);
    else {
      toast.success("Ajouté");
      invalidate(cmsKeys.missionTeam);
    }
  };

  const addStat = async (pageKey: CmsPageKey) => {
    const label = prompt("Libellé ?");
    const value = prompt("Valeur ?");
    if (!label || !value) return;
    const { error } = await supabase.from("cms_stat_cards").insert({
      page_key: pageKey,
      label,
      value,
      icon_key: "leaf",
      sort_order: 99,
    });
    if (error) toast.error(error.message);
    else {
      toast.success("Ajouté");
      invalidate(cmsKeys.stats(pageKey));
    }
  };

  const addInfoCard = async () => {
    const title = prompt("Titre ?");
    if (!title) return;
    const { error } = await supabase.from("cms_info_cards").insert({
      page_key: "carbon",
      title,
      description: "",
      icon_key: "leaf",
      sort_order: infoCards.length + 1,
    });
    if (error) toast.error(error.message);
    else {
      toast.success("Ajouté");
      invalidate(cmsKeys.infoCards("carbon"));
    }
  };

  const addPartner = async () => {
    const name = prompt("Nom du partenaire ?");
    if (!name) return;
    const category =
      prompt("Catégorie ? carbon | accommodation | coworking", "carbon") || "carbon";
    const { error } = await supabase.from("partner_orgs").insert({
      name,
      category,
      sort_order: partners.length + 1,
      published: true,
    });
    if (error) toast.error(error.message);
    else {
      toast.success("Ajouté");
      invalidate(cmsKeys.partners);
    }
  };

  const addBreakdown = async () => {
    const category = prompt("Catégorie ?");
    if (!category) return;
    const { error } = await supabase.from("impact_breakdown").insert({
      category,
      percentage: 0,
      amount: "0 kg",
      sort_order: breakdown.length + 1,
    });
    if (error) toast.error(error.message);
    else {
      toast.success("Ajouté");
      invalidate(cmsKeys.breakdown);
    }
  };

  const addQuarter = async () => {
    const quarter = prompt("Trimestre (ex. Q1 2026) ?");
    if (!quarter) return;
    const { error } = await supabase.from("impact_quarters").insert({
      quarter,
      travelers: 0,
      carbon: 0,
      revenue: 0,
      sort_order: quarters.length + 1,
    });
    if (error) toast.error(error.message);
    else {
      toast.success("Ajouté");
      invalidate(cmsKeys.quarters);
    }
  };

  const del = async (table: string, id: string, keys: (readonly string[])[]) => {
    if (!confirm("Supprimer ?")) return;
    const { error } = await supabase.from(table as "mission_values").delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Supprimé");
      invalidate(...keys);
    }
  };

  const patch = async (
    table: string,
    id: string,
    patch: Record<string, unknown>,
    keys: (readonly string[])[]
  ) => {
    const { error } = await supabase
      .from(table as "mission_values")
      .update(patch)
      .eq("id", id);
    if (error) toast.error(error.message);
    else invalidate(...keys);
  };

  return (
    <AdminLayout
      title="Impact & Mission"
      description="Contenu des pages Notre Mission, Calculateur Carbone, Partenaires et Rapport d'Impact."
    >
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="flex flex-wrap h-auto gap-1">
          <TabsTrigger value="mission">Notre Mission</TabsTrigger>
          <TabsTrigger value="carbon">Calculateur Carbone</TabsTrigger>
          <TabsTrigger value="partners">Partenaires</TabsTrigger>
          <TabsTrigger value="report">Rapport d&apos;Impact</TabsTrigger>
        </TabsList>

        <TabsContent value="mission" className="mt-6 space-y-8">
          <HeroEditor pageKey="mission" publicPath="/mission" />
          <SimpleRowsEditor
            title="Valeurs"
            rows={values}
            columns={["Titre", "Description", "Icône"]}
            onAdd={addValue}
            onDelete={(id) => del("mission_values", id, [cmsKeys.missionValues])}
            renderCells={(row) => {
              const v = values.find((x) => x.id === row.id)!;
              return (
                <>
                  <TableCell>
                    <Input
                      defaultValue={v.title}
                      onBlur={(e) =>
                        patch("mission_values", v.id, { title: e.target.value }, [
                          cmsKeys.missionValues,
                        ])
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      defaultValue={v.description || ""}
                      onBlur={(e) =>
                        patch(
                          "mission_values",
                          v.id,
                          { description: e.target.value },
                          [cmsKeys.missionValues]
                        )
                      }
                    />
                  </TableCell>
                  <TableCell className="w-[140px]">
                    <Select
                      defaultValue={v.icon_key}
                      onValueChange={(icon_key) =>
                        patch("mission_values", v.id, { icon_key }, [cmsKeys.missionValues])
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CMS_ICON_OPTIONS.map((o) => (
                          <SelectItem key={o.value} value={o.value}>
                            {o.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                </>
              );
            }}
          />
          <SimpleRowsEditor
            title="Jalons"
            rows={milestones}
            columns={["Année", "Événement", "Description"]}
            onAdd={addMilestone}
            onDelete={(id) => del("mission_milestones", id, [cmsKeys.missionMilestones])}
            renderCells={(row) => {
              const m = milestones.find((x) => x.id === row.id)!;
              return (
                <>
                  <TableCell className="w-[100px]">
                    <Input
                      defaultValue={m.year}
                      onBlur={(e) =>
                        patch("mission_milestones", m.id, { year: e.target.value }, [
                          cmsKeys.missionMilestones,
                        ])
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      defaultValue={m.event}
                      onBlur={(e) =>
                        patch("mission_milestones", m.id, { event: e.target.value }, [
                          cmsKeys.missionMilestones,
                        ])
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      defaultValue={m.description || ""}
                      onBlur={(e) =>
                        patch(
                          "mission_milestones",
                          m.id,
                          { description: e.target.value },
                          [cmsKeys.missionMilestones]
                        )
                      }
                    />
                  </TableCell>
                </>
              );
            }}
          />
          <SimpleRowsEditor
            title="Équipe"
            rows={team}
            columns={["Nom", "Rôle", "Bio"]}
            onAdd={addTeam}
            onDelete={(id) => del("mission_team", id, [cmsKeys.missionTeam])}
            renderCells={(row) => {
              const t = team.find((x) => x.id === row.id)!;
              return (
                <>
                  <TableCell>
                    <Input
                      defaultValue={t.name}
                      onBlur={(e) =>
                        patch("mission_team", t.id, { name: e.target.value }, [
                          cmsKeys.missionTeam,
                        ])
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      defaultValue={t.role || ""}
                      onBlur={(e) =>
                        patch("mission_team", t.id, { role: e.target.value }, [
                          cmsKeys.missionTeam,
                        ])
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      defaultValue={t.bio || ""}
                      onBlur={(e) =>
                        patch("mission_team", t.id, { bio: e.target.value }, [
                          cmsKeys.missionTeam,
                        ])
                      }
                    />
                  </TableCell>
                </>
              );
            }}
          />
        </TabsContent>

        <TabsContent value="carbon" className="mt-6 space-y-8">
          <HeroEditor pageKey="carbon" publicPath="/carbon-calculator" />
          <p className="text-sm text-muted-foreground">
            Le calculateur interactif reste fixe ; vous gérez ici les stats et les cartes
            d&apos;info.
          </p>
          <SimpleRowsEditor
            title="Statistiques hero"
            rows={carbonStats}
            columns={["Valeur", "Libellé", "Publié"]}
            onAdd={() => addStat("carbon")}
            onDelete={(id) => del("cms_stat_cards", id, [cmsKeys.stats("carbon")])}
            renderCells={(row) => {
              const s = carbonStats.find((x) => x.id === row.id)!;
              return (
                <>
                  <TableCell>
                    <Input
                      defaultValue={s.value}
                      onBlur={(e) =>
                        patch("cms_stat_cards", s.id, { value: e.target.value }, [
                          cmsKeys.stats("carbon"),
                        ])
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      defaultValue={s.label}
                      onBlur={(e) =>
                        patch("cms_stat_cards", s.id, { label: e.target.value }, [
                          cmsKeys.stats("carbon"),
                        ])
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={s.published}
                      onCheckedChange={(published) =>
                        patch("cms_stat_cards", s.id, { published }, [
                          cmsKeys.stats("carbon"),
                        ])
                      }
                    />
                  </TableCell>
                </>
              );
            }}
          />
          <SimpleRowsEditor
            title="Cartes d'information"
            rows={infoCards}
            columns={["Titre", "Description"]}
            onAdd={addInfoCard}
            onDelete={(id) => del("cms_info_cards", id, [cmsKeys.infoCards("carbon")])}
            renderCells={(row) => {
              const c = infoCards.find((x) => x.id === row.id)!;
              return (
                <>
                  <TableCell>
                    <Input
                      defaultValue={c.title}
                      onBlur={(e) =>
                        patch("cms_info_cards", c.id, { title: e.target.value }, [
                          cmsKeys.infoCards("carbon"),
                        ])
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      defaultValue={c.description || ""}
                      onBlur={(e) =>
                        patch(
                          "cms_info_cards",
                          c.id,
                          { description: e.target.value },
                          [cmsKeys.infoCards("carbon")]
                        )
                      }
                    />
                  </TableCell>
                </>
              );
            }}
          />
        </TabsContent>

        <TabsContent value="partners" className="mt-6 space-y-8">
          <HeroEditor pageKey="partners" publicPath="/partners" />
          <SimpleRowsEditor
            title="Organisations partenaires"
            rows={partners}
            columns={["Nom", "Catégorie", "Lieu", "Publié"]}
            onAdd={addPartner}
            onDelete={(id) => del("partner_orgs", id, [cmsKeys.partners])}
            renderCells={(row) => {
              const p = partners.find((x) => x.id === row.id)!;
              return (
                <>
                  <TableCell>
                    <Input
                      defaultValue={p.name}
                      onBlur={(e) =>
                        patch("partner_orgs", p.id, { name: e.target.value }, [
                          cmsKeys.partners,
                        ])
                      }
                    />
                  </TableCell>
                  <TableCell className="w-[160px]">
                    <Select
                      defaultValue={p.category}
                      onValueChange={(category) =>
                        patch("partner_orgs", p.id, { category }, [cmsKeys.partners])
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="carbon">Carbone</SelectItem>
                        <SelectItem value="accommodation">Hébergement</SelectItem>
                        <SelectItem value="coworking">Coworking</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Input
                      defaultValue={p.location || ""}
                      onBlur={(e) =>
                        patch("partner_orgs", p.id, { location: e.target.value }, [
                          cmsKeys.partners,
                        ])
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={p.published}
                      onCheckedChange={(published) =>
                        patch("partner_orgs", p.id, { published }, [cmsKeys.partners])
                      }
                    />
                  </TableCell>
                </>
              );
            }}
          />
        </TabsContent>

        <TabsContent value="report" className="mt-6 space-y-8">
          <HeroEditor pageKey="impact_report" publicPath="/impact-report" />
          <SimpleRowsEditor
            title="Métriques clés"
            rows={reportStats}
            columns={["Valeur", "Libellé", "Évolution"]}
            onAdd={() => addStat("impact_report")}
            onDelete={(id) =>
              del("cms_stat_cards", id, [cmsKeys.stats("impact_report")])
            }
            renderCells={(row) => {
              const s = reportStats.find((x) => x.id === row.id)!;
              return (
                <>
                  <TableCell>
                    <Input
                      defaultValue={s.value}
                      onBlur={(e) =>
                        patch("cms_stat_cards", s.id, { value: e.target.value }, [
                          cmsKeys.stats("impact_report"),
                        ])
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      defaultValue={s.label}
                      onBlur={(e) =>
                        patch("cms_stat_cards", s.id, { label: e.target.value }, [
                          cmsKeys.stats("impact_report"),
                        ])
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      defaultValue={s.change_label || ""}
                      onBlur={(e) =>
                        patch(
                          "cms_stat_cards",
                          s.id,
                          { change_label: e.target.value },
                          [cmsKeys.stats("impact_report")]
                        )
                      }
                    />
                  </TableCell>
                </>
              );
            }}
          />
          <SimpleRowsEditor
            title="Répartition carbone"
            rows={breakdown}
            columns={["Catégorie", "%", "Montant"]}
            onAdd={addBreakdown}
            onDelete={(id) => del("impact_breakdown", id, [cmsKeys.breakdown])}
            renderCells={(row) => {
              const b = breakdown.find((x) => x.id === row.id)!;
              return (
                <>
                  <TableCell>
                    <Input
                      defaultValue={b.category}
                      onBlur={(e) =>
                        patch("impact_breakdown", b.id, { category: e.target.value }, [
                          cmsKeys.breakdown,
                        ])
                      }
                    />
                  </TableCell>
                  <TableCell className="w-[90px]">
                    <Input
                      type="number"
                      defaultValue={b.percentage}
                      onBlur={(e) =>
                        patch(
                          "impact_breakdown",
                          b.id,
                          { percentage: Number(e.target.value) || 0 },
                          [cmsKeys.breakdown]
                        )
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      defaultValue={b.amount || ""}
                      onBlur={(e) =>
                        patch("impact_breakdown", b.id, { amount: e.target.value }, [
                          cmsKeys.breakdown,
                        ])
                      }
                    />
                  </TableCell>
                </>
              );
            }}
          />
          <SimpleRowsEditor
            title="Trimestres"
            rows={quarters}
            columns={["Trimestre", "Voyageurs", "CO₂", "Revenus"]}
            onAdd={addQuarter}
            onDelete={(id) => del("impact_quarters", id, [cmsKeys.quarters])}
            renderCells={(row) => {
              const q = quarters.find((x) => x.id === row.id)!;
              return (
                <>
                  <TableCell>
                    <Input
                      defaultValue={q.quarter}
                      onBlur={(e) =>
                        patch("impact_quarters", q.id, { quarter: e.target.value }, [
                          cmsKeys.quarters,
                        ])
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      defaultValue={q.travelers}
                      onBlur={(e) =>
                        patch(
                          "impact_quarters",
                          q.id,
                          { travelers: Number(e.target.value) || 0 },
                          [cmsKeys.quarters]
                        )
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      defaultValue={q.carbon}
                      onBlur={(e) =>
                        patch(
                          "impact_quarters",
                          q.id,
                          { carbon: Number(e.target.value) || 0 },
                          [cmsKeys.quarters]
                        )
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      defaultValue={q.revenue}
                      onBlur={(e) =>
                        patch(
                          "impact_quarters",
                          q.id,
                          { revenue: Number(e.target.value) || 0 },
                          [cmsKeys.quarters]
                        )
                      }
                    />
                  </TableCell>
                </>
              );
            }}
          />
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
};

export default AdminImpactContent;
