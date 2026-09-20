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
import { toast } from "sonner";

interface AuditEntry {
  id: string;
  actor_id: string | null;
  actor_type: string;
  entity_type: string;
  entity_id: string | null;
  action: string;
  payload: unknown;
  created_at: string;
  actor_name?: string | null;
}

const actionColors: Record<string, string> = {
  insert: "bg-success/10 text-success border-success/20",
  update: "bg-warning/15 text-warning-foreground border-warning/30",
  delete: "bg-destructive/10 text-destructive border-destructive/20",
};

const actorTypeLabels: Record<string, string> = {
  admin: "Admin",
  user: "Utilisateur",
  system: "Système",
};

const AdminAuditLog = () => {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [entityFilter, setEntityFilter] = useState<string>("all");
  const [selectedEntry, setSelectedEntry] = useState<AuditEntry | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("audit_log")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);
      if (entityFilter !== "all") query = query.eq("entity_type", entityFilter);

      const { data, error } = await query;
      if (error) throw error;

      const actorIds = [...new Set((data || []).map((e) => e.actor_id).filter(Boolean))] as string[];
      let namesById: Record<string, string> = {};
      if (actorIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, full_name")
          .in("user_id", actorIds);
        namesById = Object.fromEntries((profiles || []).map((p) => [p.user_id, p.full_name || ""]));
      }

      setEntries(
        (data || []).map((e) => ({ ...e, actor_name: e.actor_id ? namesById[e.actor_id] : null })),
      );
    } catch (error) {
      toast.error("Erreur lors du chargement du journal");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entityFilter]);

  const entityTypes = ["user_roles", "payments", "refunds", "donations", "reservations", "action_participations"];

  return (
    <AdminLayout
      title="Journal d'audit"
      description="Historique des actions sensibles (rôles, paiements, remboursements, dons, réservations, validations QR). Lecture seule."
      actions={
        <Select value={entityFilter} onValueChange={setEntityFilter}>
          <SelectTrigger className="w-[220px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les entités</SelectItem>
            {entityTypes.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      }
    >
      <div className="rounded-xl border border-border bg-background shadow-sm overflow-hidden">
        {loading ? (
          <AdminLoading />
        ) : entries.length === 0 ? (
          <AdminEmpty title="Aucun événement pour l'instant" />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Acteur</TableHead>
                <TableHead>Entité</TableHead>
                <TableHead>Action</TableHead>
                <TableHead className="w-[70px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(entry.created_at), "d MMM yyyy HH:mm:ss", { locale: fr })}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">
                      {entry.actor_name || (entry.actor_id ? entry.actor_id.slice(0, 8) : "—")}
                    </span>
                    <Badge variant="outline" className="ml-2 text-xs">
                      {actorTypeLabels[entry.actor_type] || entry.actor_type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {entry.entity_type}
                    {entry.entity_id && (
                      <span className="text-muted-foreground"> · {entry.entity_id.slice(0, 8)}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={actionColors[entry.action] || ""}>
                      {entry.action}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button size="icon" variant="ghost" onClick={() => setSelectedEntry(entry)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <Dialog open={!!selectedEntry} onOpenChange={(open) => !open && setSelectedEntry(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedEntry?.entity_type} · {selectedEntry?.action}
            </DialogTitle>
          </DialogHeader>
          <pre className="text-xs bg-muted/50 p-4 rounded-lg overflow-x-auto whitespace-pre-wrap">
            {JSON.stringify(selectedEntry?.payload, null, 2)}
          </pre>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminAuditLog;
