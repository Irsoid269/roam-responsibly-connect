import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  queryKeys,
  useContactMessages,
  usePartnerApplications,
} from "@/hooks/useCatalogQueries";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const AdminInbox = () => {
  const queryClient = useQueryClient();
  const { data: messages = [], isLoading: loadingMsg } = useContactMessages();
  const { data: partners = [], isLoading: loadingPartners } = usePartnerApplications();
  const [tab, setTab] = useState("contact");

  const updateContactStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from("contact_messages")
      .update({ status })
      .eq("id", id);
    if (error) {
      toast.error("Mise à jour impossible");
      return;
    }
    toast.success("Statut mis à jour");
    queryClient.invalidateQueries({ queryKey: queryKeys.contactMessages });
  };

  const updatePartnerStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from("partner_applications")
      .update({ status })
      .eq("id", id);
    if (error) {
      toast.error("Mise à jour impossible");
      return;
    }
    toast.success("Statut mis à jour");
    queryClient.invalidateQueries({ queryKey: queryKeys.partnerApplications });
  };

  return (
    <AdminLayout
      title="Boîte de réception"
      description="Messages contact et candidatures partenaires."
    >
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="contact">
            Contact ({messages.filter((m) => m.status === "new").length} nouveaux)
          </TabsTrigger>
          <TabsTrigger value="partners">
            Partenaires ({partners.filter((p) => p.status === "pending").length} en attente)
          </TabsTrigger>
        </TabsList>

        <TabsContent value="contact" className="mt-6">
          {loadingMsg ? (
            <AdminLoading />
          ) : messages.length === 0 ? (
            <AdminEmpty
              title="Aucun message"
              description="Les envois du formulaire contact apparaîtront ici."
            />
          ) : (
            <div className="rounded-xl border border-border bg-background overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>De</TableHead>
                    <TableHead>Sujet</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {messages.map((m) => (
                    <TableRow key={m.id}>
                      <TableCell>
                        <div className="font-medium">
                          {m.first_name} {m.last_name}
                        </div>
                        <a
                          href={`mailto:${m.email}`}
                          className="text-xs text-muted-foreground hover:text-primary"
                        >
                          {m.email}
                        </a>
                      </TableCell>
                      <TableCell>{m.subject}</TableCell>
                      <TableCell className="max-w-xs">
                        <p className="text-sm line-clamp-2">{m.message}</p>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                        {format(new Date(m.created_at), "d MMM yyyy", { locale: fr })}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={m.status}
                          onValueChange={(status) => updateContactStatus(m.id, status)}
                        >
                          <SelectTrigger className="w-[120px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="new">Nouveau</SelectItem>
                            <SelectItem value="read">Lu</SelectItem>
                            <SelectItem value="archived">Archivé</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        <TabsContent value="partners" className="mt-6">
          {loadingPartners ? (
            <AdminLoading />
          ) : partners.length === 0 ? (
            <AdminEmpty
              title="Aucune candidature"
              description="Les demandes « Devenir partenaire » apparaîtront ici."
            />
          ) : (
            <div className="rounded-xl border border-border bg-background overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Entreprise</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {partners.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>
                        <div className="font-medium">{p.company_name}</div>
                        {p.website && (
                          <a
                            href={p.website}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-muted-foreground hover:text-primary"
                          >
                            {p.website}
                          </a>
                        )}
                      </TableCell>
                      <TableCell>
                        <div>
                          {p.first_name} {p.last_name}
                        </div>
                        <a
                          href={`mailto:${p.email}`}
                          className="text-xs text-muted-foreground hover:text-primary"
                        >
                          {p.email}
                        </a>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{p.partner_type}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                        {format(new Date(p.created_at), "d MMM yyyy", { locale: fr })}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={p.status}
                          onValueChange={(status) => updatePartnerStatus(p.id, status)}
                        >
                          <SelectTrigger className="w-[130px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">En attente</SelectItem>
                            <SelectItem value="contacted">Contacté</SelectItem>
                            <SelectItem value="accepted">Accepté</SelectItem>
                            <SelectItem value="rejected">Refusé</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
};

export default AdminInbox;
