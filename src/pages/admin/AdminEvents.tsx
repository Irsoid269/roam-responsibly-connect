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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Pencil, Trash2, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { queryKeys, useEvents } from "@/hooks/useCatalogQueries";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

type EventRow = NonNullable<ReturnType<typeof useEvents>["data"]>[number];

const emptyForm = {
  title: "",
  description: "",
  image_url: "",
  event_type: "En personne",
  location: "",
  starts_at: "",
  is_online: false,
  attendees_count: 0,
  published: true,
};

const AdminEvents = () => {
  const queryClient = useQueryClient();
  const { data: events = [], isLoading } = useEvents(true);
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState<EventRow | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const toLocalInput = (iso: string) => {
    try {
      return new Date(iso).toISOString().slice(0, 16);
    } catch {
      return "";
    }
  };

  const openEdit = (event?: EventRow) => {
    if (event) {
      setCurrent(event);
      setForm({
        title: event.title,
        description: event.description || "",
        image_url: event.image_url || "",
        event_type: event.event_type,
        location: event.location || "",
        starts_at: toLocalInput(event.starts_at),
        is_online: event.is_online,
        attendees_count: event.attendees_count,
        published: event.published,
      });
    } else {
      setCurrent(null);
      setForm({
        ...emptyForm,
        starts_at: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 16),
      });
    }
    setOpen(true);
  };

  const save = async () => {
    if (!form.title.trim() || !form.starts_at) {
      toast.error("Titre et date de début requis");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description || null,
        image_url: form.image_url || null,
        event_type: form.event_type,
        location: form.location || null,
        starts_at: new Date(form.starts_at).toISOString(),
        is_online: form.is_online,
        attendees_count: form.attendees_count,
        published: form.published,
        updated_at: new Date().toISOString(),
      };
      if (current) {
        const { error } = await supabase.from("events").update(payload).eq("id", current.id);
        if (error) throw error;
        toast.success("Événement mis à jour");
      } else {
        const { error } = await supabase.from("events").insert(payload);
        if (error) throw error;
        toast.success("Événement créé");
      }
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: queryKeys.events });
    } catch (e) {
      console.error(e);
      toast.error("Erreur — appliquez la migration blog_events_cms");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Supprimer cet événement ?")) return;
    const { error } = await supabase.from("events").delete().eq("id", id);
    if (error) {
      toast.error("Suppression impossible");
      return;
    }
    toast.success("Événement supprimé");
    queryClient.invalidateQueries({ queryKey: queryKeys.events });
  };

  return (
    <AdminLayout
      title="Événements"
      description="Événements affichés sur /events."
      allowedRoles={["organizer"]}
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link to="/events" target="_blank" rel="noreferrer">
              <ExternalLink className="w-4 h-4 mr-2" />
              Voir /events
            </Link>
          </Button>
          <Button onClick={() => openEdit()}>
            <Plus className="w-4 h-4 mr-2" />
            Nouvel événement
          </Button>
        </div>
      }
    >
      {isLoading ? (
        <AdminLoading />
      ) : events.length === 0 ? (
        <AdminEmpty title="Aucun événement" description="Planifiez le premier événement." />
      ) : (
        <div className="rounded-xl border border-border bg-background overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Titre</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="w-[100px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.map((event) => (
                <TableRow key={event.id}>
                  <TableCell className="font-medium">{event.title}</TableCell>
                  <TableCell>{event.event_type}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(event.starts_at), "d MMM yyyy HH:mm", { locale: fr })}
                  </TableCell>
                  <TableCell>
                    <Badge variant={event.published ? "default" : "outline"}>
                      {event.published ? "Publié" : "Brouillon"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" onClick={() => openEdit(event)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => remove(event.id)}>
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
            <DialogTitle>
              {current ? "Modifier l'événement" : "Nouvel événement"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              placeholder="Titre"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
            <Select
              value={form.event_type}
              onValueChange={(event_type) => setForm({ ...form, event_type })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["En personne", "Webinaire", "Retraite", "Atelier"].map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="datetime-local"
              value={form.starts_at}
              onChange={(e) => setForm({ ...form, starts_at: e.target.value })}
            />
            <Input
              placeholder="Lieu"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
            />
            <Input
              placeholder="URL image"
              value={form.image_url}
              onChange={(e) => setForm({ ...form, image_url: e.target.value })}
            />
            <Textarea
              placeholder="Description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
            <Input
              type="number"
              min={0}
              placeholder="Inscrits"
              value={form.attendees_count}
              onChange={(e) =>
                setForm({ ...form, attendees_count: Number(e.target.value) || 0 })
              }
            />
            <div className="flex items-center justify-between">
              <span className="text-sm">En ligne</span>
              <Switch
                checked={form.is_online}
                onCheckedChange={(is_online) => setForm({ ...form, is_online })}
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

export default AdminEvents;
