import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { AdminLoading } from "@/components/admin/AdminTableState";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Trash2, Copy, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";

interface FactorSet {
  id: string;
  name: string;
  is_active: boolean;
  published_at: string | null;
  created_at: string;
}

interface Factor {
  id: string;
  set_id: string;
  category: "transport" | "accommodation" | "mobility" | "activity";
  subcategory: string;
  value: number;
  unit: string;
}

const categoryLabels: Record<Factor["category"], string> = {
  transport: "Transport principal",
  accommodation: "Hébergement",
  mobility: "Mobilité sur place",
  activity: "Activités",
};

const categories: Factor["category"][] = ["transport", "accommodation", "mobility", "activity"];

const AdminCarbonFactors = () => {
  const [sets, setSets] = useState<FactorSet[]>([]);
  const [selectedSetId, setSelectedSetId] = useState<string | null>(null);
  const [factors, setFactors] = useState<Factor[]>([]);
  const [loading, setLoading] = useState(true);
  const [newFactorInputs, setNewFactorInputs] = useState<
    Record<string, { subcategory: string; value: string; unit: string }>
  >({});

  const fetchSets = async () => {
    const { data, error } = await supabase
      .from("emission_factor_sets")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      toast.error("Erreur lors du chargement des jeux de facteurs");
      return;
    }
    setSets(data || []);
    if (data && data.length > 0 && !selectedSetId) {
      setSelectedSetId(data.find((s) => s.is_active)?.id || data[0].id);
    }
  };

  const fetchFactors = async (setId: string) => {
    const { data, error } = await supabase
      .from("emission_factors")
      .select("*")
      .eq("set_id", setId)
      .order("category")
      .order("subcategory");
    if (error) {
      toast.error("Erreur lors du chargement des facteurs");
      return;
    }
    setFactors((data as Factor[]) || []);
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      await fetchSets();
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedSetId) fetchFactors(selectedSetId);
  }, [selectedSetId]);

  const selectedSet = sets.find((s) => s.id === selectedSetId) || null;

  const handleActivate = async (setId: string) => {
    try {
      const { error: deactivateError } = await supabase
        .from("emission_factor_sets")
        .update({ is_active: false })
        .neq("id", "00000000-0000-0000-0000-000000000000");
      if (deactivateError) throw deactivateError;

      const { error: activateError } = await supabase
        .from("emission_factor_sets")
        .update({ is_active: true, published_at: new Date().toISOString() })
        .eq("id", setId);
      if (activateError) throw activateError;

      toast.success("Jeu de facteurs activé — utilisé dès maintenant par le calculateur public");
      fetchSets();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur lors de l'activation");
    }
  };

  const handleCreateSet = async () => {
    const name = prompt("Nom du nouveau jeu de facteurs (ex: \"Révision 2027\")");
    if (!name) return;
    try {
      const { data, error } = await supabase
        .from("emission_factor_sets")
        .insert({ name, is_active: false })
        .select()
        .single();
      if (error) throw error;
      toast.success("Jeu de facteurs créé (inactif)");
      await fetchSets();
      setSelectedSetId(data.id);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur lors de la création");
    }
  };

  const handleDuplicate = async () => {
    if (!selectedSet) return;
    const name = prompt("Nom de la nouvelle version", `${selectedSet.name} (copie)`);
    if (!name) return;
    try {
      const { data: newSet, error: setError } = await supabase
        .from("emission_factor_sets")
        .insert({ name, is_active: false })
        .select()
        .single();
      if (setError) throw setError;

      if (factors.length > 0) {
        const { error: factorsError } = await supabase.from("emission_factors").insert(
          factors.map((f) => ({
            set_id: newSet.id,
            category: f.category,
            subcategory: f.subcategory,
            value: f.value,
            unit: f.unit,
          })),
        );
        if (factorsError) throw factorsError;
      }

      toast.success("Nouvelle version créée à partir de celle-ci");
      await fetchSets();
      setSelectedSetId(newSet.id);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur lors de la duplication");
    }
  };

  const handleUpdateValue = async (factor: Factor, value: number) => {
    if (Number.isNaN(value)) return;
    setFactors((prev) => prev.map((f) => (f.id === factor.id ? { ...f, value } : f)));
    const { error } = await supabase
      .from("emission_factors")
      .update({ value })
      .eq("id", factor.id);
    if (error) {
      toast.error("Erreur lors de la mise à jour");
      fetchFactors(selectedSetId!);
    }
  };

  const handleDeleteFactor = async (factorId: string) => {
    try {
      const { error } = await supabase.from("emission_factors").delete().eq("id", factorId);
      if (error) throw error;
      setFactors((prev) => prev.filter((f) => f.id !== factorId));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur lors de la suppression");
    }
  };

  const handleAddFactor = async (category: Factor["category"]) => {
    if (!selectedSetId) return;
    const input = newFactorInputs[category];
    const value = parseFloat(input?.value || "");
    if (!input?.subcategory.trim() || Number.isNaN(value)) {
      toast.error("Renseignez un nom et une valeur");
      return;
    }
    try {
      const { error } = await supabase.from("emission_factors").insert({
        set_id: selectedSetId,
        category,
        subcategory: input.subcategory.trim(),
        value,
        unit: input.unit.trim() || "kg",
      });
      if (error) throw error;
      setNewFactorInputs((prev) => ({ ...prev, [category]: { subcategory: "", value: "", unit: "" } }));
      fetchFactors(selectedSetId);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur lors de l'ajout");
    }
  };

  return (
    <AdminLayout
      title="Facteurs d'émission carbone"
      description="Valeurs utilisées par le calculateur public, versionnées par jeu de facteurs. Un seul jeu est actif à la fois."
      actions={
        <Button onClick={handleCreateSet}>
          <Plus className="h-4 w-4 mr-2" />
          Nouveau jeu
        </Button>
      }
    >
      {loading ? (
        <AdminLoading />
      ) : (
        <div className="space-y-6">
          <div className="flex flex-wrap gap-2">
            {sets.map((set) => (
              <button
                key={set.id}
                onClick={() => setSelectedSetId(set.id)}
                className={`px-3 py-2 rounded-lg border text-sm text-left transition-colors ${
                  selectedSetId === set.id
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <div className="flex items-center gap-2">
                  {set.is_active && <CheckCircle2 className="h-3.5 w-3.5 text-success" />}
                  <span className="font-medium">{set.name}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {set.published_at
                    ? `Activé le ${format(new Date(set.published_at), "d MMM yyyy", { locale: fr })}`
                    : "Jamais activé"}
                </p>
              </button>
            ))}
          </div>

          {selectedSet && (
            <>
              <div className="flex items-center justify-between rounded-xl border border-border bg-background p-4">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">{selectedSet.name}</h3>
                  {selectedSet.is_active && (
                    <Badge className="bg-success text-success-foreground">Actif</Badge>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={handleDuplicate}>
                    <Copy className="h-4 w-4 mr-2" />
                    Dupliquer en nouvelle version
                  </Button>
                  {!selectedSet.is_active && (
                    <Button size="sm" onClick={() => handleActivate(selectedSet.id)}>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Activer
                    </Button>
                  )}
                </div>
              </div>

              {categories.map((category) => {
                const categoryFactors = factors.filter((f) => f.category === category);
                const input = newFactorInputs[category] || { subcategory: "", value: "", unit: "" };
                return (
                  <div key={category} className="rounded-xl border border-border bg-background overflow-hidden">
                    <div className="px-4 py-3 border-b border-border bg-muted/30">
                      <h4 className="font-medium text-sm">{categoryLabels[category]}</h4>
                    </div>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Sous-catégorie</TableHead>
                          <TableHead>Valeur</TableHead>
                          <TableHead>Unité</TableHead>
                          <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {categoryFactors.map((factor) => (
                          <TableRow key={factor.id}>
                            <TableCell className="font-medium">{factor.subcategory}</TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                step="0.001"
                                defaultValue={factor.value}
                                className="w-28"
                                onBlur={(e) => {
                                  const v = parseFloat(e.target.value);
                                  if (v !== factor.value) handleUpdateValue(factor, v);
                                }}
                              />
                            </TableCell>
                            <TableCell className="text-muted-foreground text-sm">{factor.unit}</TableCell>
                            <TableCell>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="text-destructive h-8 w-8"
                                onClick={() => handleDeleteFactor(factor.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                        <TableRow>
                          <TableCell>
                            <Input
                              placeholder="Nouvelle sous-catégorie"
                              value={input.subcategory}
                              onChange={(e) =>
                                setNewFactorInputs((prev) => ({
                                  ...prev,
                                  [category]: { ...input, subcategory: e.target.value },
                                }))
                              }
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              step="0.001"
                              placeholder="0"
                              className="w-28"
                              value={input.value}
                              onChange={(e) =>
                                setNewFactorInputs((prev) => ({
                                  ...prev,
                                  [category]: { ...input, value: e.target.value },
                                }))
                              }
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              placeholder="kg/km"
                              className="w-24"
                              value={input.unit}
                              onChange={(e) =>
                                setNewFactorInputs((prev) => ({
                                  ...prev,
                                  [category]: { ...input, unit: e.target.value },
                                }))
                              }
                            />
                          </TableCell>
                          <TableCell>
                            <Button size="icon" variant="ghost" onClick={() => handleAddFactor(category)}>
                              <Plus className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                );
              })}
            </>
          )}
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminCarbonFactors;
