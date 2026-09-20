import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { queryKeys, useBlogPosts } from "@/hooks/useCatalogQueries";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

type BlogPost = NonNullable<ReturnType<typeof useBlogPosts>["data"]>[number];

const emptyForm = {
  title: "",
  excerpt: "",
  content: "",
  image_url: "",
  category: "Guides",
  author: "Amani Resorts",
  read_time_minutes: 5,
  featured: false,
  published: true,
};

const AdminBlog = () => {
  const queryClient = useQueryClient();
  const { data: posts = [], isLoading } = useBlogPosts(true);
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState<BlogPost | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const openEdit = (post?: BlogPost) => {
    if (post) {
      setCurrent(post);
      setForm({
        title: post.title,
        excerpt: post.excerpt || "",
        content: post.content || "",
        image_url: post.image_url || "",
        category: post.category,
        author: post.author,
        read_time_minutes: post.read_time_minutes,
        featured: post.featured,
        published: post.published,
      });
    } else {
      setCurrent(null);
      setForm(emptyForm);
    }
    setOpen(true);
  };

  const save = async () => {
    if (!form.title.trim()) {
      toast.error("Le titre est requis");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        title: form.title.trim(),
        updated_at: new Date().toISOString(),
      };
      if (current) {
        const { error } = await supabase
          .from("blog_posts")
          .update(payload)
          .eq("id", current.id);
        if (error) throw error;
        toast.success("Article mis à jour");
      } else {
        const { error } = await supabase.from("blog_posts").insert(payload);
        if (error) throw error;
        toast.success("Article créé");
      }
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: queryKeys.blogPosts });
    } catch (e) {
      console.error(e);
      toast.error("Erreur — appliquez la migration blog_events_cms");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Supprimer cet article ?")) return;
    const { error } = await supabase.from("blog_posts").delete().eq("id", id);
    if (error) {
      toast.error("Suppression impossible");
      return;
    }
    toast.success("Article supprimé");
    queryClient.invalidateQueries({ queryKey: queryKeys.blogPosts });
  };

  return (
    <AdminLayout
        title="Blog & Récits"
      description="Articles publiés sur /blog — visibles si « Publié » est activé."
      allowedRoles={["organizer"]}
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link to="/blog" target="_blank" rel="noreferrer">
              <ExternalLink className="w-4 h-4 mr-2" />
              Voir /blog
            </Link>
          </Button>
          <Button onClick={() => openEdit()}>
            <Plus className="w-4 h-4 mr-2" />
            Nouvel article
          </Button>
        </div>
      }
    >
      {isLoading ? (
        <AdminLoading />
      ) : posts.length === 0 ? (
        <AdminEmpty title="Aucun article" description="Créez le premier article du blog." />
      ) : (
        <div className="rounded-xl border border-border bg-background overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Titre</TableHead>
                <TableHead>Catégorie</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="w-[100px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {posts.map((post) => (
                <TableRow key={post.id}>
                  <TableCell>
                    <div className="font-medium">{post.title}</div>
                    {post.featured && (
                      <Badge variant="secondary" className="mt-1">
                        À la une
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>{post.category}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {format(new Date(post.published_at), "d MMM yyyy", { locale: fr })}
                  </TableCell>
                  <TableCell>
                    <Badge variant={post.published ? "default" : "outline"}>
                      {post.published ? "Publié" : "Brouillon"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" onClick={() => openEdit(post)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => remove(post.id)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{current ? "Modifier l'article" : "Nouvel article"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              placeholder="Titre"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
            <Input
              placeholder="Catégorie"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            />
            <Input
              placeholder="Auteur"
              value={form.author}
              onChange={(e) => setForm({ ...form, author: e.target.value })}
            />
            <Input
              placeholder="URL image"
              value={form.image_url}
              onChange={(e) => setForm({ ...form, image_url: e.target.value })}
            />
            <Textarea
              placeholder="Extrait"
              value={form.excerpt}
              onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
            />
            <Textarea
              placeholder="Contenu"
              rows={5}
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
            />
            <Input
              type="number"
              min={1}
              placeholder="Temps de lecture (min)"
              value={form.read_time_minutes}
              onChange={(e) =>
                setForm({ ...form, read_time_minutes: Number(e.target.value) || 5 })
              }
            />
            <div className="flex items-center justify-between">
              <span className="text-sm">À la une</span>
              <Switch
                checked={form.featured}
                onCheckedChange={(featured) => setForm({ ...form, featured })}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Publié</span>
              <Switch
                checked={form.published}
                onCheckedChange={(published) => setForm({ ...form, published })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button onClick={save} disabled={saving}>
              {saving ? "Enregistrement…" : "Enregistrer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminBlog;
