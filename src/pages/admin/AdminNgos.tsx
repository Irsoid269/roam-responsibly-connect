import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { AdminLoading, AdminEmpty } from "@/components/admin/AdminTableState";
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
import { MoreHorizontal, Plus, Pencil, Trash2, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";

interface Ngo {
  id: string;
  name: string;
  description: string | null;
  mission: string | null;
  logo_url: string | null;
  impact_label: string | null;
  is_active: boolean;
  sort_order: number;
}

interface Donation {
  id: string;
  amount: number;
  status: string;
  created_at: string;
  confirmed_at: string | null;
  ngo?: { name: string } | null;
  profile?: { full_name: string | null } | null;
}

const emptyNgo: Partial<Ngo> = {
  name: "",
  description: "",
  mission: "",
  logo_url: "🌳",
  impact_label: "",
  is_active: true,
  sort_order: 0,
};

const donationStatusColors: Record<string, string> = {
  pending: "bg-warning/15 text-warning-foreground border-warning/30",
  succeeded: "bg-success/10 text-success border-success/20",
  failed: "bg-destructive/10 text-destructive border-destructive/20",
  refunded: "bg-muted text-muted-foreground border-border",
};

const donationStatusLabels: Record<string, string> = {
  pending: "En attente",
  succeeded: "Confirmé",
  failed: "Échoué",
  refunded: "Remboursé",
};

const AdminNgos = () => {
  const [ngos, setNgos] = useState<Ngo[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [currentNgo, setCurrentNgo] = useState<Ngo | null>(null);
  const [formData, setFormData] = useState<Partial<Ngo>>({});

  const fetchData = async () => {
    try {
      const [ngosResult, donationsResult] = await Promise.all([
        supabase.from("ngos").select("*").order("sort_order"),
        supabase
          .from("donations")
          .select("id, amount, status, created_at, confirmed_at, ngo:ngos(name)")
          .order("created_at", { ascending: false })
          .limit(50),
      ]);

      if (ngosResult.error) throw ngosResult.error;
      setNgos(ngosResult.data || []);
      setDonations((donationsResult.data as unknown as Donation[]) || []);
    } catch (error) {
      console.error("Error fetching ngos/donations:", error);
      toast.error("Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openEditDialog = (ngo?: Ngo) => {
    if (ngo) {
      setCurrentNgo(ngo);
      setFormData(ngo);
    } else {
      setCurrentNgo(null);
      setFormData({ ...emptyNgo });
    }
    setEditDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name?.trim()) {
      toast.error("Le nom de l'association est requis");
      return;
    }
    try {
      if (currentNgo) {
        const { error } = await supabase.from("ngos").update(formData).eq("id", currentNgo.id);
        if (error) throw error;
        toast.success("Association mise à jour");
      } else {
        const { error } = await supabase.from("ngos").insert([formData as never]);
        if (error) throw error;
        toast.success("Association créée");
      }
      setEditDialogOpen(false);
      fetchData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur lors de la sauvegarde");
    }
  };

  const handleDelete = async () => {
    if (!currentNgo) return;
    try {
      const { error } = await supabase.from("ngos").delete().eq("id", currentNgo.id);
      if (error) throw error;
      toast.success("Association supprimée");
      setDeleteDialogOpen(false);
      setCurrentNgo(null);
      fetchData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur lors de la suppression");
    }
  };

  const confirmDonation = async (donationId: string) => {
    try {
      const { error } = await supabase
        .from("donations")
        .update({ status: "succeeded", confirmed_at: new Date().toISOString() })
        .eq("id", donationId);
      if (error) throw error;
      toast.success("Don confirmé");
      fetchData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur lors de la confirmation");
    }
  };

  return (
    <AdminLayout
      title="Compensation carbone — Dons"
      description="Associations partenaires pour la compensation carbone et suivi des dons."
      allowedRoles={["finance"]}
      actions={
        <Button onClick={() => openEditDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Ajouter une association
        </Button>
      }
    >
      <div className="space-y-8">
        <div className="rounded-xl border border-border bg-background shadow-sm overflow-hidden">
          {loading ? (
            <AdminLoading />
          ) : ngos.length === 0 ? (
            <AdminEmpty title="Aucune association trouvée" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Association</TableHead>
                  <TableHead>Mission</TableHead>
                  <TableHead>Impact</TableHead>
                  <TableHead>Active</TableHead>
                  <TableHead className="w-[70px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ngos.map((ngo) => (
                  <TableRow key={ngo.id}>
                    <TableCell className="font-medium">
                      <span className="mr-2">{ngo.logo_url}</span>
                      {ngo.name}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-[240px] truncate">
                      {ngo.mission || "—"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-[240px] truncate">
                      {ngo.impact_label || "—"}
                    </TableCell>
                    <TableCell>
                      {ngo.is_active ? (
                        <Badge className="bg-success text-success-foreground">Active</Badge>
                      ) : (
                        <span className="text-muted-foreground text-xs">Masquée</span>
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
                          <DropdownMenuItem onClick={() => openEditDialog(ngo)}>
                            <Pencil className="h-4 w-4 mr-2" />
                            Modifier
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => {
                              setCurrentNgo(ngo);
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

        <div>
          <h3 className="font-medium mb-3">Dons reçus (50 derniers)</h3>
          <div className="rounded-xl border border-border bg-background shadow-sm overflow-hidden">
            {donations.length === 0 ? (
              <AdminEmpty title="Aucun don pour l'instant" />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Association</TableHead>
                    <TableHead>Montant</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Créé le</TableHead>
                    <TableHead className="w-[120px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {donations.map((donation) => (
                    <TableRow key={donation.id}>
                      <TableCell>{donation.ngo?.name || "—"}</TableCell>
                      <TableCell>{donation.amount} €</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={donationStatusColors[donation.status]}>
                          {donationStatusLabels[donation.status] || donation.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {format(new Date(donation.created_at), "d MMM yyyy HH:mm", { locale: fr })}
                      </TableCell>
                      <TableCell>
                        {donation.status === "pending" && (
                          <Button size="sm" variant="outline" onClick={() => confirmDonation(donation.id)}>
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Confirmer
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      </div>

      {/* Edit/Create Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{currentNgo ? "Modifier l'association" : "Nouvelle association"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nom</label>
              <Input
                value={formData.name || ""}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Logo (emoji)</label>
              <Input
                value={formData.logo_url || ""}
                onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                placeholder="🌳"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={formData.description || ""}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Mission</label>
              <Textarea
                value={formData.mission || ""}
                onChange={(e) => setFormData({ ...formData, mission: e.target.value })}
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Impact (phrase courte)</label>
              <Input
                value={formData.impact_label || ""}
                onChange={(e) => setFormData({ ...formData, impact_label: e.target.value })}
                placeholder="1 arbre planté = 25kg CO₂ absorbés/an"
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <span className="text-sm font-medium">Visible publiquement</span>
              <Switch
                checked={formData.is_active ?? true}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleSave}>{currentNgo ? "Mettre à jour" : "Créer"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer "{currentNgo?.name}" ? Cette action est irréversible.
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

export default AdminNgos;
