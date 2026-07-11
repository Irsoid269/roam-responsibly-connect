import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { AdminTableShell, adminStatusStyles } from "@/components/admin/AdminTableState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useAdminReviews,
  useModerateReview,
  useAdminCreateReview,
  useDestinations,
} from "@/hooks/useCatalogQueries";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Check, X, Star, Plus, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";

const AdminReviews = () => {
  const { user } = useAuth();
  const { data: reviews = [], isLoading } = useAdminReviews();
  const { data: destinations = [] } = useDestinations();
  const moderate = useModerateReview();
  const createReview = useAdminCreateReview();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    targetId: "",
    rating: "5",
    comment: "",
    authorDisplayName: "",
  });

  const pendingCount = reviews.filter(
    (r) => ((r as { status?: string }).status || "pending") === "pending"
  ).length;

  const handleModerate = async (id: string, status: "approved" | "rejected") => {
    if (!user) return;
    try {
      await moderate.mutateAsync({ id, status, moderatorId: user.id });
      toast.success(status === "approved" ? "Avis approuvé" : "Avis rejeté");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erreur de modération");
    }
  };

  const handleCreate = async () => {
    if (!user) return;
    if (!form.targetId || !form.comment.trim()) {
      toast.error("Destination et commentaire requis");
      return;
    }
    try {
      await createReview.mutateAsync({
        userId: user.id,
        targetType: "destination",
        targetId: form.targetId,
        rating: Number(form.rating) || 5,
        comment: form.comment.trim(),
        authorDisplayName: form.authorDisplayName.trim() || undefined,
        status: "approved",
      });
      toast.success("Avis publié sur /reviews");
      setOpen(false);
      setForm({ targetId: "", rating: "5", comment: "", authorDisplayName: "" });
    } catch (e) {
      toast.error(
        e instanceof Error
          ? e.message
          : "Erreur — appliquez la migration ambassadors_admin_cms"
      );
    }
  };

  const destName = (id: string) =>
    destinations.find((d) => d.id === id)?.name || `${id.slice(0, 8)}…`;

  return (
    <AdminLayout
      title="Avis voyageurs"
      description={`${pendingCount} en attente. Page /reviews — modérez les soumissions ou publiez un avis éditorial.`}
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link to="/reviews" target="_blank" rel="noreferrer">
              <ExternalLink className="w-4 h-4 mr-2" />
              Voir /reviews
            </Link>
          </Button>
          <Button onClick={() => setOpen(true)} disabled={destinations.length === 0}>
            <Plus className="w-4 h-4 mr-2" />
            Publier un avis
          </Button>
        </div>
      }
    >
      <AdminTableShell
        loading={isLoading}
        empty={!isLoading && reviews.length === 0}
        emptyTitle="Aucun avis"
        emptyDescription="Publiez un avis éditorial ou attendez les soumissions voyageurs."
      >
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Date</TableHead>
              <TableHead>Cible</TableHead>
              <TableHead>Note</TableHead>
              <TableHead>Commentaire</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reviews.map((review) => {
              const status = (review as { status?: string }).status || "pending";
              return (
                <TableRow key={review.id}>
                  <TableCell className="text-muted-foreground whitespace-nowrap">
                    {format(new Date(review.created_at), "dd/MM/yyyy", { locale: fr })}
                  </TableCell>
                  <TableCell>
                    <p className="text-sm font-medium capitalize">{review.target_type}</p>
                    <p className="text-xs text-muted-foreground">
                      {review.target_type === "destination"
                        ? destName(review.target_id)
                        : `${review.target_id.slice(0, 8)}…`}
                    </p>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1">
                      <Star className="h-4 w-4 text-warning fill-warning" />
                      {review.rating}
                    </span>
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <p className="text-sm line-clamp-2">{review.comment || "—"}</p>
                    {review.author_display_name && (
                      <p className="text-xs text-muted-foreground mt-1">
                        — {review.author_display_name}
                      </p>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={adminStatusStyles[status] || ""}>
                      {status === "approved"
                        ? "Approuvé"
                        : status === "rejected"
                          ? "Rejeté"
                          : "En attente"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {status !== "approved" && (
                      <div className="inline-flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-success border-success/30 hover:bg-success/10"
                          disabled={moderate.isPending}
                          onClick={() => handleModerate(review.id, "approved")}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        {status !== "rejected" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-destructive border-destructive/30 hover:bg-destructive/10"
                            disabled={moderate.isPending}
                            onClick={() => handleModerate(review.id, "rejected")}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </AdminTableShell>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Publier un avis (éditorial)</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Select
              value={form.targetId}
              onValueChange={(targetId) => setForm({ ...form, targetId })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Destination" />
              </SelectTrigger>
              <SelectContent>
                {destinations.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={form.rating}
              onValueChange={(rating) => setForm({ ...form, rating })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[5, 4, 3, 2, 1].map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {n} étoile{n > 1 ? "s" : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              placeholder="Nom affiché (ex. Marie, Paris)"
              value={form.authorDisplayName}
              onChange={(e) => setForm({ ...form, authorDisplayName: e.target.value })}
            />
            <Textarea
              placeholder="Commentaire"
              rows={4}
              value={form.comment}
              onChange={(e) => setForm({ ...form, comment: e.target.value })}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleCreate} disabled={createReview.isPending}>
              Publier
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminReviews;
