import { useState } from "react";
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
} from "@/components/ui/dialog";
import { Eye } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useNotifications, type NotificationRow } from "@/hooks/useCatalogQueries";

const statusColors: Record<string, string> = {
  pending: "bg-warning/15 text-warning-foreground border-warning/30",
  sent: "bg-success/10 text-success border-success/20",
  failed: "bg-destructive/10 text-destructive border-destructive/20",
  skipped_no_provider: "bg-muted text-muted-foreground border-border",
};

const statusLabels: Record<string, string> = {
  pending: "En attente",
  sent: "Envoyé",
  failed: "Échec",
  skipped_no_provider: "Sans fournisseur",
};

const typeLabels: Record<string, string> = {
  reservation_confirmed: "Réservation confirmée",
  payment_succeeded: "Paiement réussi",
  refund_processed: "Remboursement traité",
  donation_confirmed: "Don confirmé",
  action_validated: "Participation validée",
  account_banned: "Compte banni",
};

const AdminNotifications = () => {
  const [statusFilter, setStatusFilter] = useState("all");
  const { data: notifications = [], isLoading } = useNotifications(statusFilter);
  const [selected, setSelected] = useState<NotificationRow | null>(null);

  const noProviderCount = notifications.filter((n) => n.status === "skipped_no_provider").length;

  return (
    <AdminLayout
      title="Notifications"
      description="File des notifications transactionnelles (réservations, paiements, dons, bannissements). Lecture seule — l'envoi réel se fait via l'Edge Function send-notifications, une fois RESEND_API_KEY configurée."
      allowedRoles={["support"]}
      actions={
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="pending">En attente</SelectItem>
            <SelectItem value="sent">Envoyés</SelectItem>
            <SelectItem value="failed">Échecs</SelectItem>
            <SelectItem value="skipped_no_provider">Sans fournisseur</SelectItem>
          </SelectContent>
        </Select>
      }
    >
      {noProviderCount > 0 && (
        <div className="mb-4 rounded-lg border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning-foreground">
          {noProviderCount} notification{noProviderCount > 1 ? "s" : ""} en attente d'un
          fournisseur d'email (RESEND_API_KEY non configurée) — les événements sont bien
          détectés et journalisés, mais aucun email n'est encore envoyé.
        </div>
      )}

      <div className="rounded-xl border border-border bg-background shadow-sm overflow-hidden">
        {isLoading ? (
          <AdminLoading />
        ) : notifications.length === 0 ? (
          <AdminEmpty title="Aucune notification pour l'instant" />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Destinataire</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="w-[70px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {notifications.map((n) => (
                <TableRow key={n.id}>
                  <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                    {format(new Date(n.created_at), "d MMM yyyy HH:mm:ss", { locale: fr })}
                  </TableCell>
                  <TableCell className="text-sm">{typeLabels[n.type] || n.type}</TableCell>
                  <TableCell className="text-sm">{n.recipient_email || "—"}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusColors[n.status] || ""}>
                      {statusLabels[n.status] || n.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button size="icon" variant="ghost" onClick={() => setSelected(n)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selected ? typeLabels[selected.type] || selected.type : ""}
            </DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-3 text-sm">
              <p>
                <span className="text-muted-foreground">Sujet :</span> {selected.subject}
              </p>
              <p>
                <span className="text-muted-foreground">Destinataire :</span>{" "}
                {selected.recipient_email || "—"}
              </p>
              {selected.error && (
                <p className="text-destructive">
                  <span className="text-muted-foreground">Erreur :</span> {selected.error}
                </p>
              )}
              <pre className="text-xs bg-muted/50 p-4 rounded-lg overflow-x-auto whitespace-pre-wrap">
                {JSON.stringify(selected.payload, null, 2)}
              </pre>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminNotifications;
