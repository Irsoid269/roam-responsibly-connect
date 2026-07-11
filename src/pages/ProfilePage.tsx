import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  User, Leaf, Calendar, LogOut,
  TreePine, Plane, Building2, Laptop, Home, Car, Sparkles, Clock, CheckCircle2, XCircle, Download
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { useProfile, useUserReservations } from "@/hooks/useCatalogQueries";
import { buildInvoiceFromReservation, printAmaniInvoice } from "@/lib/print-invoice";
import { toast } from "sonner";

const ProfilePage = () => {
  const { user, signOut, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { data: profile, isLoading: profileLoading } = useProfile(user?.id);
  const { data: reservations = [], isLoading: reservationsLoading } = useUserReservations(user?.id);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [user, authLoading, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const downloadInvoice = (r: (typeof reservations)[number]) => {
    if (!user) return;
    try {
      const data = buildInvoiceFromReservation({
        reservation: r,
        guestName: profile?.full_name || user.email?.split("@")[0] || "Voyageur",
        guestEmail: user.email || "hello@amaniresorts.com",
        destinationLabel:
          r.items.find((i) => i.item_type === "coworking")?.item_name || "Comores",
      });
      const result = printAmaniInvoice(data);
      if (!result.ok) {
        toast.error(result.reason);
        return;
      }
      toast.success(
        result.mode === "print"
          ? "Facture ouverte — Imprimer ou enregistrer en PDF"
          : "Facture téléchargée sur votre appareil"
      );
    } catch (e) {
      console.error(e);
      toast.error("Impossible de générer la facture");
    }
  };

  if (authLoading || profileLoading || reservationsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (!user) return null;

  const carbonStats = [
    { icon: TreePine, label: "CO₂ compensé", value: `${profile?.total_carbon_saved || 0} kg`, color: "text-success" },
    { icon: Plane, label: "Séjours", value: `${profile?.trips_count || reservations.length}`, color: "text-primary" },
    { icon: Leaf, label: "Préférence", value: profile?.carbon_preference || "balanced", color: "text-accent" },
    { icon: Building2, label: "Réservations", value: `${reservations.length}`, color: "text-info" },
  ];

  return (
    <main className="page-main">
        <div className="container mx-auto px-4 max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8"
          >
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16">
                <AvatarImage src={profile?.avatar_url || undefined} />
                <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                  {(profile?.full_name || user.email || "A").charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="font-display text-3xl font-medium">
                  {profile?.full_name || "Voyageur Amani"}
                </h1>
                <p className="text-muted-foreground flex items-center gap-2">
                  <User className="w-4 h-4" />
                  {user.email}
                </p>
              </div>
            </div>
            <Button variant="outline" onClick={handleSignOut} className="gap-2">
              <LogOut className="w-4 h-4" />
              Déconnexion
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
          >
            {carbonStats.map((stat, index) => (
              <Card key={index}>
                <CardContent className="p-4 text-center">
                  <stat.icon className={`w-8 h-8 mx-auto mb-2 ${stat.color}`} />
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </motion.div>

          <Tabs defaultValue="trips" className="w-full">
            <TabsList>
              <TabsTrigger value="trips">Mes voyages</TabsTrigger>
              <TabsTrigger value="carbon">Impact carbone</TabsTrigger>
            </TabsList>

            <TabsContent value="trips" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Mes réservations</CardTitle>
                </CardHeader>
                <CardContent>
                  {reservations.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Plane className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium">Aucune réservation</p>
                      <p className="text-sm mt-1">
                        Explorez nos destinations pour planifier votre prochain séjour Amani !
                      </p>
                      <Button className="mt-4" onClick={() => navigate("/destinations")}>
                        Explorer les destinations
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {reservations.map((r) => {
                        const statusConfig: Record<
                          string,
                          {
                            label: string;
                            icon: typeof Clock;
                            className: string;
                          }
                        > = {
                          pending: {
                            label: "En attente",
                            icon: Clock,
                            className: "bg-warning/15 text-warning border-warning/30",
                          },
                          confirmed: {
                            label: "Confirmée",
                            icon: CheckCircle2,
                            className: "bg-success/15 text-success border-success/30",
                          },
                          cancelled: {
                            label: "Annulée",
                            icon: XCircle,
                            className: "bg-destructive/10 text-destructive border-destructive/20",
                          },
                        };
                        const cfg = statusConfig[r.status || "pending"] || statusConfig.pending;
                        const StatusIcon = cfg.icon;
                        const itemIcon = (type: string) => {
                          if (type === "coworking") return Laptop;
                          if (type === "accommodation") return Home;
                          if (type === "mobility") return Car;
                          if (type === "activity") return Sparkles;
                          return Calendar;
                        };
                        return (
                          <div
                            key={r.id}
                            className="border border-border rounded-lg p-4 hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-start justify-between gap-4 mb-3">
                              <div>
                                <p className="text-sm text-muted-foreground">
                                  Réf. AMN-{r.id.slice(0, 8).toUpperCase()} ·{" "}
                                  {format(new Date(r.created_at), "d MMM yyyy", { locale: fr })}
                                </p>
                                <p className="font-semibold flex items-center gap-2 mt-1">
                                  <Calendar className="w-4 h-4" />
                                  {format(new Date(r.check_in_date), "d MMM", { locale: fr })} -{" "}
                                  {format(new Date(r.check_out_date), "d MMM yyyy", { locale: fr })}
                                </p>
                              </div>
                              <Badge variant="outline" className={cfg.className}>
                                <StatusIcon className="w-3 h-3 mr-1" />
                                {cfg.label}
                              </Badge>
                            </div>
                            <div className="space-y-2 pt-3 border-t border-border">
                              {r.items.map((item) => {
                                const Icon = itemIcon(item.item_type);
                                return (
                                  <div
                                    key={item.id}
                                    className="flex items-center justify-between text-sm"
                                  >
                                    <span className="flex items-center gap-2 text-muted-foreground">
                                      <Icon className="w-4 h-4" />
                                      {item.item_name} × {item.quantity || 1}
                                    </span>
                                    <span>{item.total_price || 0} €</span>
                                  </div>
                                );
                              })}
                            </div>
                            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                              <div className="text-sm text-muted-foreground flex items-center gap-2">
                                <Leaf className="w-4 h-4 text-accent" />
                                {r.total_carbon_impact || 0} kg CO₂e
                              </div>
                              <div className="flex items-center gap-2">
                                <p className="font-semibold">{r.total_price || 0} €</p>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="gap-1.5"
                                  onClick={() => downloadInvoice(r)}
                                >
                                  <Download className="w-4 h-4" />
                                  Facture
                                </Button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="carbon" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Votre impact Amani</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground text-sm">
                    Total compensé :{" "}
                    <strong className="text-foreground">
                      {profile?.total_carbon_saved || 0} kg CO₂e
                    </strong>
                  </p>
                  <Button variant="carbon" onClick={() => navigate("/carbon-calculator")}>
                    Calculer une nouvelle estimation
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
  );
};

export default ProfilePage;
