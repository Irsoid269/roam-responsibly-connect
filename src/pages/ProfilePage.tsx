import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  User, Leaf, Calendar, LogOut,
  TreePine, Plane, Building2, Laptop, Home, Car, Sparkles, Clock, CheckCircle2, XCircle, Download,
  ShieldCheck, FileDown, Trash2, Loader2, Ban, Bell,
} from "lucide-react";
import { format } from "date-fns";
import { fr, enUS } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/hooks/useAuth";
import {
  useProfile,
  useUserReservations,
  useExportMyData,
  useDeleteAccount,
  useSavePushSubscription,
  useRemovePushSubscription,
  queryKeys,
} from "@/hooks/useCatalogQueries";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { buildInvoiceFromReservation, printAmaniInvoice } from "@/lib/print-invoice";
import {
  isPushConfigured,
  isPushSupported,
  subscribeToPush,
  unsubscribeFromPush,
  getCurrentPushSubscription,
} from "@/lib/push";
import { toast } from "sonner";

const ProfilePage = () => {
  const { t, i18n } = useTranslation("profile");
  const dateLocale = i18n.language === "en" ? enUS : fr;
  const { user, signOut, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: profile, isLoading: profileLoading } = useProfile(user?.id);
  const { data: reservations = [], isLoading: reservationsLoading } = useUserReservations(user?.id);
  const exportMyData = useExportMyData();
  const deleteAccount = useDeleteAccount();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const savePushSubscription = useSavePushSubscription();
  const removePushSubscription = useRemovePushSubscription();
  const [pushEnabled, setPushEnabled] = useState(false);
  const [pushLoading, setPushLoading] = useState(false);

  const handleCancelReservation = async (reservationId: string) => {
    setCancellingId(reservationId);
    try {
      const { error } = await supabase
        .from("reservations")
        .update({ status: "cancelled" })
        .eq("id", reservationId);
      if (error) throw error;
      toast.success(t("toasts.cancelSuccess"));
      if (user) queryClient.invalidateQueries({ queryKey: queryKeys.reservations(user.id) });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("toasts.cancelError"));
    } finally {
      setCancellingId(null);
    }
  };

  const handleExport = () => {
    if (!user) return;
    exportMyData.mutate(user.id, {
      onSuccess: () => toast.success(t("toasts.exportSuccess")),
      onError: () => toast.error(t("toasts.exportError")),
    });
  };

  const handleDeleteAccount = async () => {
    try {
      await deleteAccount.mutateAsync();
      toast.success(t("toasts.deleteSuccess"));
      await signOut();
      navigate("/");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("toasts.deleteError"));
    }
  };

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!isPushConfigured || !isPushSupported) return;
    getCurrentPushSubscription()
      .then((sub) => setPushEnabled(!!sub))
      .catch(() => setPushEnabled(false));
  }, []);

  const handleTogglePush = async (checked: boolean) => {
    if (!user) return;
    setPushLoading(true);
    try {
      if (checked) {
        const subscription = await subscribeToPush();
        if (!subscription) throw new Error(t("toasts.pushDenied"));
        await savePushSubscription.mutateAsync({ userId: user.id, subscription });
        setPushEnabled(true);
        toast.success(t("toasts.pushEnabled"));
      } else {
        const existing = await getCurrentPushSubscription();
        const endpoint = existing?.endpoint;
        await unsubscribeFromPush();
        if (endpoint) await removePushSubscription.mutateAsync(endpoint);
        setPushEnabled(false);
        toast.success(t("toasts.pushDisabled"));
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("toasts.actionError"));
    } finally {
      setPushLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const downloadInvoice = (r: (typeof reservations)[number]) => {
    if (!user) return;
    try {
      const data = buildInvoiceFromReservation({
        reservation: r,
        guestName: profile?.full_name || user.email?.split("@")[0] || t("guestFallback"),
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
          ? t("toasts.invoiceOpened")
          : t("toasts.invoiceDownloaded")
      );
    } catch (e) {
      console.error(e);
      toast.error(t("toasts.invoiceError"));
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
    { icon: TreePine, label: t("stats.carbonSaved"), value: `${profile?.total_carbon_saved || 0} kg`, color: "text-success" },
    { icon: Plane, label: t("stats.trips"), value: `${profile?.trips_count || reservations.length}`, color: "text-primary" },
    { icon: Leaf, label: t("stats.preference"), value: profile?.carbon_preference || "balanced", color: "text-accent" },
    { icon: Building2, label: t("stats.reservations"), value: `${reservations.length}`, color: "text-info" },
  ];

  return (
    <>
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
                  {profile?.full_name || t("defaultName")}
                </h1>
                <p className="text-muted-foreground flex items-center gap-2">
                  <User className="w-4 h-4" />
                  {user.email}
                </p>
              </div>
            </div>
            <Button variant="outline" onClick={handleSignOut} className="gap-2">
              <LogOut className="w-4 h-4" />
              {t("logout")}
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
              <TabsTrigger value="trips">{t("tabs.trips")}</TabsTrigger>
              <TabsTrigger value="carbon">{t("tabs.carbon")}</TabsTrigger>
              <TabsTrigger value="privacy">{t("tabs.privacy")}</TabsTrigger>
            </TabsList>

            <TabsContent value="trips" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t("reservations.title")}</CardTitle>
                </CardHeader>
                <CardContent>
                  {reservations.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Plane className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium">{t("reservations.empty")}</p>
                      <p className="text-sm mt-1">
                        {t("reservations.emptySubtitle")}
                      </p>
                      <Button className="mt-4" onClick={() => navigate("/destinations")}>
                        {t("reservations.exploreDestinations")}
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
                            label: t("reservations.status.pending"),
                            icon: Clock,
                            className: "bg-warning/15 text-warning border-warning/30",
                          },
                          confirmed: {
                            label: t("reservations.status.confirmed"),
                            icon: CheckCircle2,
                            className: "bg-success/15 text-success border-success/30",
                          },
                          cancelled: {
                            label: t("reservations.status.cancelled"),
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
                                  {t("reservations.reference", { ref: r.id.slice(0, 8).toUpperCase() })} ·{" "}
                                  {format(new Date(r.created_at), "d MMM yyyy", { locale: dateLocale })}
                                </p>
                                <p className="font-semibold flex items-center gap-2 mt-1">
                                  <Calendar className="w-4 h-4" />
                                  {format(new Date(r.check_in_date), "d MMM", { locale: dateLocale })} -{" "}
                                  {format(new Date(r.check_out_date), "d MMM yyyy", { locale: dateLocale })}
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
                                {(r.status === "pending" || r.status === "confirmed") &&
                                  new Date(r.check_in_date) > new Date() && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="gap-1.5 text-destructive hover:text-destructive"
                                      disabled={cancellingId === r.id}
                                      onClick={() => handleCancelReservation(r.id)}
                                    >
                                      {cancellingId === r.id ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                      ) : (
                                        <Ban className="w-4 h-4" />
                                      )}
                                      {t("reservations.cancel")}
                                    </Button>
                                  )}
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="gap-1.5"
                                  onClick={() => downloadInvoice(r)}
                                >
                                  <Download className="w-4 h-4" />
                                  {t("reservations.invoice")}
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
                  <CardTitle>{t("carbon.title")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground text-sm">
                    {t("carbon.totalOffset")}{" "}
                    <strong className="text-foreground">
                      {profile?.total_carbon_saved || 0} kg CO₂e
                    </strong>
                  </p>
                  <Button variant="carbon" onClick={() => navigate("/carbon-calculator")}>
                    {t("carbon.newEstimate")}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="privacy" className="mt-6 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-primary" />
                    {t("privacy.title")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{t("privacy.exportTitle")}</p>
                      <p className="text-sm text-muted-foreground">
                        {t("privacy.exportDescription")}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      className="gap-2 shrink-0"
                      onClick={handleExport}
                      disabled={exportMyData.isPending}
                    >
                      {exportMyData.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <FileDown className="w-4 h-4" />
                      )}
                      {t("privacy.export")}
                    </Button>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border border-destructive/30 rounded-lg">
                    <div>
                      <p className="font-medium text-destructive">{t("privacy.deleteTitle")}</p>
                      <p className="text-sm text-muted-foreground">
                        {t("privacy.deleteDescription")}
                      </p>
                    </div>
                    <Button
                      variant="destructive"
                      className="gap-2 shrink-0"
                      onClick={() => setDeleteDialogOpen(true)}
                    >
                      <Trash2 className="w-4 h-4" />
                      {t("privacy.delete")}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="w-5 h-5 text-primary" />
                    {t("push.title")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isPushConfigured && isPushSupported ? (
                    <div className="flex items-center justify-between gap-3 p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{t("push.receiveTitle")}</p>
                        <p className="text-sm text-muted-foreground">
                          {t("push.receiveDescription")}
                        </p>
                      </div>
                      {pushLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                      ) : (
                        <Switch checked={pushEnabled} onCheckedChange={handleTogglePush} />
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground p-4 border rounded-lg">
                      {isPushSupported
                        ? t("push.notConfigured")
                        : t("push.notSupported")}
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("deleteDialog.title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("deleteDialog.description")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("deleteDialog.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteAccount.isPending}
              onClick={(e) => {
                e.preventDefault();
                handleDeleteAccount();
              }}
            >
              {deleteAccount.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Trash2 className="w-4 h-4 mr-2" />
              )}
              {t("deleteDialog.confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ProfilePage;
