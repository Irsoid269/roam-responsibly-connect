import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { AdminLoading, AdminEmpty } from "@/components/admin/AdminTableState";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Ban, CheckCircle2, Loader2, ShieldOff, Trash2, XCircle } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";
import {
  useReports,
  useResolveReport,
  useBannedUsers,
  useUnbanUser,
  type ReportRow,
} from "@/hooks/useCatalogQueries";

const reasonLabels: Record<string, string> = {
  spam: "Spam / publicité",
  abus: "Abus, harcèlement",
  contenu_inapproprie: "Contenu inapproprié",
  fausse_information: "Fausse information",
  autre: "Autre",
};

const targetLabels: Record<string, string> = {
  story: "Récit",
  review: "Avis",
  comment: "Commentaire",
};

const statusColors: Record<string, string> = {
  open: "bg-warning/15 text-warning-foreground border-warning/30",
  in_review: "bg-primary/10 text-primary border-primary/20",
  actioned: "bg-success/10 text-success border-success/20",
  rejected: "bg-muted text-muted-foreground border-border",
};

const statusLabels: Record<string, string> = {
  open: "Ouvert",
  in_review: "En cours",
  actioned: "Traité",
  rejected: "Rejeté",
};

const AdminModeration = () => {
  const [tab, setTab] = useState("reports");
  const [statusFilter, setStatusFilter] = useState("open");
  const { data: reports = [], isLoading: loadingReports } = useReports(statusFilter);
  const { data: bannedUsers = [], isLoading: loadingBanned } = useBannedUsers();
  const resolveReport = useResolveReport();
  const unbanUser = useUnbanUser();

  const [actionTarget, setActionTarget] = useState<{
    report: ReportRow;
    action: "soft_delete" | "ban" | "warn" | "dismiss";
  } | null>(null);
  const [actionReason, setActionReason] = useState("");

  const confirmAction = async () => {
    if (!actionTarget) return;
    try {
      await resolveReport.mutateAsync({
        reportId: actionTarget.report.id,
        action: actionTarget.action,
        reason: actionReason.trim() || undefined,
      });
      toast.success("Signalement traité");
      setActionTarget(null);
      setActionReason("");
    } catch {
      toast.error("Action impossible");
    }
  };

  const handleUnban = async (userId: string) => {
    try {
      await unbanUser.mutateAsync({ userId });
      toast.success("Utilisateur débanni");
    } catch {
      toast.error("Action impossible");
    }
  };

  const actionLabels: Record<string, string> = {
    soft_delete: "Supprimer le contenu",
    ban: "Bannir l'auteur",
    warn: "Avertir",
    dismiss: "Rejeter le signalement",
  };

  return (
    <AdminLayout
      title="Modération & signalement"
      description="Signalements des utilisateurs sur les récits, avis et commentaires, et gestion des bannissements."
      allowedRoles={["support"]}
    >
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="reports">Signalements</TabsTrigger>
          <TabsTrigger value="banned">
            Utilisateurs bannis ({bannedUsers.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="reports" className="mt-6 space-y-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="open">Ouverts</SelectItem>
              <SelectItem value="actioned">Traités</SelectItem>
              <SelectItem value="rejected">Rejetés</SelectItem>
              <SelectItem value="all">Tous</SelectItem>
            </SelectContent>
          </Select>

          {loadingReports ? (
            <AdminLoading />
          ) : reports.length === 0 ? (
            <AdminEmpty
              title="Aucun signalement"
              description="Les signalements des utilisateurs apparaîtront ici."
            />
          ) : (
            <div className="rounded-xl border border-border bg-background overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Contenu</TableHead>
                    <TableHead>Motif</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reports.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                        {format(new Date(r.created_at), "d MMM yyyy HH:mm", { locale: fr })}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{targetLabels[r.target_type]}</Badge>
                        <span className="text-xs text-muted-foreground ml-2">
                          {r.target_id.slice(0, 8)}…
                        </span>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm">{reasonLabels[r.reason] || r.reason}</p>
                        {r.comment && (
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 max-w-xs">
                            {r.comment}
                          </p>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={statusColors[r.status]}>
                          {statusLabels[r.status]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {r.status === "open" || r.status === "in_review" ? (
                          <div className="flex justify-end gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              title="Supprimer le contenu"
                              onClick={() => setActionTarget({ report: r, action: "soft_delete" })}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              title="Bannir l'auteur"
                              onClick={() => setActionTarget({ report: r, action: "ban" })}
                            >
                              <Ban className="h-4 w-4 text-destructive" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              title="Rejeter le signalement"
                              onClick={() => setActionTarget({ report: r, action: "dismiss" })}
                            >
                              <XCircle className="h-4 w-4 text-muted-foreground" />
                            </Button>
                          </div>
                        ) : (
                          <CheckCircle2 className="h-4 w-4 text-success inline-block" />
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        <TabsContent value="banned" className="mt-6">
          {loadingBanned ? (
            <AdminLoading />
          ) : bannedUsers.length === 0 ? (
            <AdminEmpty
              title="Aucun utilisateur banni"
              description="Les comptes bannis suite à un signalement apparaîtront ici."
            />
          ) : (
            <div className="rounded-xl border border-border bg-background overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Utilisateur</TableHead>
                    <TableHead>Banni le</TableHead>
                    <TableHead>Raison</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bannedUsers.map((u) => (
                    <TableRow key={u.user_id}>
                      <TableCell className="font-medium">
                        {u.full_name || u.user_id.slice(0, 8)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {u.banned_at
                          ? format(new Date(u.banned_at), "d MMM yyyy", { locale: fr })
                          : "—"}
                      </TableCell>
                      <TableCell className="text-sm">{u.banned_reason || "—"}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-2"
                          onClick={() => handleUnban(u.user_id)}
                          disabled={unbanUser.isPending}
                        >
                          <ShieldOff className="h-4 w-4" />
                          Débannir
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

      <Dialog open={!!actionTarget} onOpenChange={(open) => !open && setActionTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {actionTarget ? actionLabels[actionTarget.action] : ""}
            </DialogTitle>
          </DialogHeader>
          <Textarea
            placeholder="Raison (facultatif, consignée dans le journal de modération)"
            value={actionReason}
            onChange={(e) => setActionReason(e.target.value)}
            rows={3}
          />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setActionTarget(null)}>
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={confirmAction}
              disabled={resolveReport.isPending}
              className="gap-2"
            >
              {resolveReport.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Confirmer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminModeration;
