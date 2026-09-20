import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { AdminLoading, AdminEmpty } from "@/components/admin/AdminTableState";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { MoreHorizontal, Plus, Pencil, Trash2, CalendarClock, QrCode, CheckCircle2, XCircle, Camera, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";
import QrScannerDialog from "@/components/admin/QrScannerDialog";
import { useDuplicateRegistrationSignals } from "@/hooks/useCatalogQueries";

interface ActionSession {
  id: string;
  action_id: string;
  location: string | null;
  starts_at: string;
  ends_at: string | null;
  capacity: number;
  registered_count: number;
  qr_ttl_seconds: number;
}

interface SustainableAction {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  is_active: boolean;
}

const emptyAction: Partial<SustainableAction> = {
  title: "",
  description: "",
  category: "",
  is_active: true,
};

const toLocalInputValue = (date: Date) => {
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const validateErrorMessages: Record<string, string> = {
  qr_not_found: "Code introuvable — vérifiez la saisie",
  qr_already_used: "Ce billet a déjà été validé",
  participation_not_registered: "Cette participation n'est plus valide (annulée ?)",
  session_not_started: "La session n'a pas encore commencé",
  qr_expired: "Le délai de validation est dépassé",
  forbidden: "Action réservée aux administrateurs",
  daily_validation_limit_reached: "Limite de validations quotidiennes atteinte pour ce compte — contactez un administrateur",
};

const AdminSustainableActions = () => {
  const [actions, setActions] = useState<SustainableAction[]>([]);
  const [sessions, setSessions] = useState<ActionSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [currentAction, setCurrentAction] = useState<SustainableAction | null>(null);
  const [formData, setFormData] = useState<Partial<SustainableAction>>({});
  const [sessionForms, setSessionForms] = useState<Record<string, { start: string; end: string; capacity: string }>>({});
  const [qrInput, setQrInput] = useState("");
  const [qrResult, setQrResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [validating, setValidating] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);
  const { data: duplicateSignals = [] } = useDuplicateRegistrationSignals();
  const duplicateSignalsBySession = duplicateSignals.reduce<Record<string, number>>((acc, s) => {
    acc[s.session_id] = (acc[s.session_id] ?? 0) + s.distinct_users;
    return acc;
  }, {});

  const fetchData = async () => {
    try {
      const [actionsResult, sessionsResult] = await Promise.all([
        supabase.from("sustainable_actions").select("*").order("title"),
        supabase.from("action_sessions").select("*").order("starts_at"),
      ]);
      if (actionsResult.error) throw actionsResult.error;
      if (sessionsResult.error) throw sessionsResult.error;
      setActions(actionsResult.data || []);
      setSessions(sessionsResult.data || []);
    } catch (error) {
      toast.error("Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openEditDialog = (action?: SustainableAction) => {
    if (action) {
      setCurrentAction(action);
      setFormData(action);
    } else {
      setCurrentAction(null);
      setFormData({ ...emptyAction });
    }
    setEditDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.title?.trim()) {
      toast.error("Le titre est requis");
      return;
    }
    try {
      if (currentAction) {
        const { error } = await supabase
          .from("sustainable_actions")
          .update(formData)
          .eq("id", currentAction.id);
        if (error) throw error;
        toast.success("Action mise à jour");
      } else {
        const { error } = await supabase.from("sustainable_actions").insert([formData as never]);
        if (error) throw error;
        toast.success("Action créée");
      }
      setEditDialogOpen(false);
      fetchData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur lors de la sauvegarde");
    }
  };

  const handleDelete = async () => {
    if (!currentAction) return;
    try {
      const { error } = await supabase.from("sustainable_actions").delete().eq("id", currentAction.id);
      if (error) throw error;
      toast.success("Action supprimée");
      setDeleteDialogOpen(false);
      setCurrentAction(null);
      fetchData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur lors de la suppression");
    }
  };

  const handleAddSession = async (actionId: string) => {
    const form = sessionForms[actionId];
    const start = form?.start ? new Date(form.start) : null;
    const end = form?.end ? new Date(form.end) : null;
    const capacity = parseInt(form?.capacity || "20", 10);
    if (!start || Number.isNaN(start.getTime())) {
      toast.error("Date de début requise");
      return;
    }
    try {
      const { error } = await supabase.from("action_sessions").insert({
        action_id: actionId,
        starts_at: start.toISOString(),
        ends_at: end && !Number.isNaN(end.getTime()) ? end.toISOString() : null,
        capacity,
      });
      if (error) throw error;
      toast.success("Session ajoutée");
      setSessionForms((prev) => ({ ...prev, [actionId]: { start: "", end: "", capacity: "20" } }));
      fetchData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur lors de l'ajout");
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    try {
      const { error } = await supabase.from("action_sessions").delete().eq("id", sessionId);
      if (error) throw error;
      fetchData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur lors de la suppression");
    }
  };

  const handleValidateQr = async (codeOverride?: string) => {
    const code = (codeOverride ?? qrInput).trim();
    if (!code) return;
    setValidating(true);
    setQrResult(null);
    try {
      const { data, error } = await supabase.rpc("validate_participation", {
        p_qr_code: code,
      });
      if (error) {
        const errCode = error.message as string;
        setQrResult({ ok: false, message: validateErrorMessages[errCode] || error.message });
        return;
      }
      setQrResult({ ok: true, message: "Participation validée avec succès" });
      setQrInput("");
      fetchData();
    } catch (error) {
      setQrResult({ ok: false, message: "Erreur inattendue" });
    } finally {
      setValidating(false);
    }
  };

  const handleScan = (code: string) => {
    setScannerOpen(false);
    handleValidateQr(code);
  };

  return (
    <AdminLayout
      title="Compensation carbone — Actions durables"
      description="Catalogue d'actions terrain, sessions et validation des participations par QR."
      allowedRoles={["organizer"]}
      actions={
        <Button onClick={() => openEditDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Ajouter une action
        </Button>
      }
    >
      <div className="space-y-8">
        <div className="rounded-xl border border-border bg-background shadow-sm p-4">
          <h3 className="font-medium mb-3 flex items-center gap-2">
            <QrCode className="h-4 w-4" />
            Valider un billet
          </h3>
          <div className="flex gap-2 max-w-md">
            <Input
              placeholder="Coller ou saisir le code QR"
              value={qrInput}
              onChange={(e) => setQrInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleValidateQr()}
            />
            <Button variant="outline" size="icon" onClick={() => setScannerOpen(true)} title="Scanner avec la caméra">
              <Camera className="h-4 w-4" />
            </Button>
            <Button onClick={() => handleValidateQr()} disabled={validating}>
              Valider
            </Button>
          </div>
          {qrResult && (
            <p className={`mt-2 text-sm flex items-center gap-2 ${qrResult.ok ? "text-success" : "text-destructive"}`}>
              {qrResult.ok ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
              {qrResult.message}
            </p>
          )}
        </div>

        {loading ? (
          <AdminLoading />
        ) : actions.length === 0 ? (
          <AdminEmpty title="Aucune action trouvée" />
        ) : (
          actions.map((action) => {
            const actionSessions = sessions.filter((s) => s.action_id === action.id);
            const sessionForm = sessionForms[action.id] || { start: "", end: "", capacity: "20" };
            return (
              <div key={action.id} className="rounded-xl border border-border bg-background shadow-sm overflow-hidden">
                <div className="p-4 flex items-center justify-between border-b border-border">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{action.title}</h3>
                      {action.is_active ? (
                        <Badge className="bg-success text-success-foreground">Active</Badge>
                      ) : (
                        <Badge variant="outline">Masquée</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{action.description}</p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEditDialog(action)}>
                        <Pencil className="h-4 w-4 mr-2" />
                        Modifier
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => {
                          setCurrentAction(action);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Supprimer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Début</TableHead>
                      <TableHead>Fin</TableHead>
                      <TableHead>Places</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {actionSessions.map((session) => (
                      <TableRow key={session.id}>
                        <TableCell>
                          {format(new Date(session.starts_at), "d MMM yyyy HH:mm", { locale: fr })}
                        </TableCell>
                        <TableCell>
                          {session.ends_at
                            ? format(new Date(session.ends_at), "d MMM yyyy HH:mm", { locale: fr })
                            : "—"}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <Badge variant="outline">
                              {session.registered_count}/{session.capacity}
                            </Badge>
                            {duplicateSignalsBySession[session.id] && (
                              <Badge
                                variant="outline"
                                className="bg-warning/15 text-warning-foreground border-warning/30 gap-1"
                                title={`${duplicateSignalsBySession[session.id]} inscription(s) partagent une même IP — à vérifier manuellement, pas une preuve de fraude`}
                              >
                                <AlertTriangle className="h-3 w-3" />
                                IP partagée
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-destructive h-8 w-8"
                            onClick={() => handleDeleteSession(session.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell>
                        <Input
                          type="datetime-local"
                          value={sessionForm.start}
                          onChange={(e) =>
                            setSessionForms((prev) => ({
                              ...prev,
                              [action.id]: { ...sessionForm, start: e.target.value },
                            }))
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="datetime-local"
                          value={sessionForm.end}
                          onChange={(e) =>
                            setSessionForms((prev) => ({
                              ...prev,
                              [action.id]: { ...sessionForm, end: e.target.value },
                            }))
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          className="w-20"
                          value={sessionForm.capacity}
                          onChange={(e) =>
                            setSessionForms((prev) => ({
                              ...prev,
                              [action.id]: { ...sessionForm, capacity: e.target.value },
                            }))
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Button size="icon" variant="ghost" onClick={() => handleAddSession(action.id)}>
                          <CalendarClock className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            );
          })
        )}
      </div>

      {/* Edit/Create Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{currentAction ? "Modifier l'action" : "Nouvelle action"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Titre</label>
              <Input
                value={formData.title || ""}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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
              <label className="text-sm font-medium">Catégorie</label>
              <Input
                value={formData.category || ""}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="plantation, nettoyage, sensibilisation…"
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
            <Button onClick={handleSave}>{currentAction ? "Mettre à jour" : "Créer"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer "{currentAction?.title}" ? Cette action est irréversible.
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

      <QrScannerDialog open={scannerOpen} onOpenChange={setScannerOpen} onScan={handleScan} />
    </AdminLayout>
  );
};

export default AdminSustainableActions;
