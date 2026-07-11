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
  useAdminCommunityStories,
  useModerateCommunityStory,
  useAdminCreateCommunityStory,
} from "@/hooks/useCatalogQueries";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Check, X, MapPin, Plus, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";

const AdminCommunity = () => {
  const { user } = useAuth();
  const { data: stories = [], isLoading } = useAdminCommunityStories();
  const moderate = useModerateCommunityStory();
  const createStory = useAdminCreateCommunityStory();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    authorName: "",
    authorLocation: "",
    destination: "",
    content: "",
    imageUrl: "",
    status: "approved" as "approved" | "pending",
  });

  const handleModerate = async (id: string, status: "approved" | "rejected") => {
    if (!user) return;
    try {
      await moderate.mutateAsync({ id, status, moderatorId: user.id });
      toast.success(
        status === "approved"
          ? "Récit approuvé — visible sur /community"
          : "Récit rejeté"
      );
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erreur de modération");
    }
  };

  const handleCreate = async () => {
    if (!user) return;
    if (!form.authorName.trim() || !form.destination.trim() || form.content.length < 20) {
      toast.error("Auteur, destination et récit (20+ caractères) requis");
      return;
    }
    try {
      await createStory.mutateAsync({
        userId: user.id,
        authorName: form.authorName.trim(),
        authorLocation: form.authorLocation.trim() || undefined,
        destination: form.destination.trim(),
        content: form.content.trim(),
        imageUrl: form.imageUrl || null,
        status: form.status,
      });
      toast.success("Récit publié");
      setOpen(false);
      setForm({
        authorName: "",
        authorLocation: "",
        destination: "",
        content: "",
        imageUrl: "",
        status: "approved",
      });
    } catch (e) {
      toast.error(
        e instanceof Error
          ? e.message
          : "Erreur — appliquez la migration ambassadors_admin_cms"
      );
    }
  };

  const pendingCount = stories.filter((s) => s.status === "pending").length;

  return (
    <AdminLayout
      title="Communauté — Récits"
      description={`Page /community. ${pendingCount} en attente de modération. Vous pouvez aussi publier un récit éditorial.`}
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link to="/community" target="_blank" rel="noreferrer">
              <ExternalLink className="w-4 h-4 mr-2" />
              Voir /community
            </Link>
          </Button>
          <Button onClick={() => setOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Publier un récit
          </Button>
        </div>
      }
    >
      <AdminTableShell
        loading={isLoading}
        empty={!isLoading && stories.length === 0}
        emptyTitle="Aucun récit"
        emptyDescription="Publiez un récit éditorial ou attendez les soumissions voyageurs."
      >
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Date</TableHead>
              <TableHead>Auteur</TableHead>
              <TableHead>Destination</TableHead>
              <TableHead>Récit</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stories.map((story) => (
              <TableRow key={story.id}>
                <TableCell className="text-muted-foreground whitespace-nowrap">
                  {format(new Date(story.created_at), "dd/MM/yyyy HH:mm", {
                    locale: fr,
                  })}
                </TableCell>
                <TableCell>
                  <p className="font-medium">{story.author_name}</p>
                  {story.author_location && (
                    <p className="text-xs text-muted-foreground">{story.author_location}</p>
                  )}
                </TableCell>
                <TableCell>
                  <span className="inline-flex items-center gap-1 text-sm">
                    <MapPin className="h-3.5 w-3.5 text-accent" />
                    {story.destination}
                  </span>
                </TableCell>
                <TableCell className="max-w-xs">
                  <p className="text-sm line-clamp-2">{story.content}</p>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={adminStatusStyles[story.status] || adminStatusStyles.pending}
                  >
                    {story.status === "approved"
                      ? "Approuvé"
                      : story.status === "rejected"
                        ? "Rejeté"
                        : "En attente"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1"
                    disabled={moderate.isPending || story.status === "approved"}
                    onClick={() => handleModerate(story.id, "approved")}
                  >
                    <Check className="h-4 w-4" />
                    Approuver
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1 text-destructive"
                    disabled={moderate.isPending || story.status === "rejected"}
                    onClick={() => handleModerate(story.id, "rejected")}
                  >
                    <X className="h-4 w-4" />
                    Rejeter
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </AdminTableShell>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Publier un récit (éditorial)</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              placeholder="Nom de l'auteur"
              value={form.authorName}
              onChange={(e) => setForm({ ...form, authorName: e.target.value })}
            />
            <Input
              placeholder="Localisation auteur (optionnel)"
              value={form.authorLocation}
              onChange={(e) => setForm({ ...form, authorLocation: e.target.value })}
            />
            <Input
              placeholder="Destination (ex. Moroni)"
              value={form.destination}
              onChange={(e) => setForm({ ...form, destination: e.target.value })}
            />
            <Textarea
              placeholder="Récit (20–1000 caractères)"
              rows={5}
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
            />
            <Input
              placeholder="URL image (optionnel)"
              value={form.imageUrl}
              onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
            />
            <Select
              value={form.status}
              onValueChange={(status: "approved" | "pending") =>
                setForm({ ...form, status })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="approved">Publié immédiatement</SelectItem>
                <SelectItem value="pending">Brouillon / en attente</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleCreate} disabled={createStory.isPending}>
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminCommunity;
