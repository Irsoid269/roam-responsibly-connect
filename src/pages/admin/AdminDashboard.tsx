import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { format, subMonths, startOfMonth } from "date-fns";
import { fr } from "date-fns/locale";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  CalendarCheck,
  Users,
  MapPin,
  Building2,
  TrendingUp,
  DollarSign,
  Leaf,
  Activity,
  MessageSquare,
  PenLine,
  ArrowUpRight,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { staggerContainer, staggerItem, viewportOnce } from "@/lib/motion";
import { cn } from "@/lib/utils";

interface DashboardStats {
  totalReservations: number;
  totalUsers: number;
  totalDestinations: number;
  totalCoworkings: number;
  totalRevenue: number;
  totalCarbonSaved: number;
  pendingReservations: number;
  confirmedReservations: number;
  pendingReviews: number;
  pendingStories: number;
}

interface ReservationRow {
  id: string;
  total_price: number | null;
  status: string | null;
  created_at: string | null;
}

const revenueChartConfig = {
  revenue: { label: "Revenus (€)", color: "hsl(var(--primary))" },
  bookings: { label: "Réservations", color: "hsl(var(--accent))" },
} satisfies ChartConfig;

const statusChartConfig = {
  count: { label: "Réservations", color: "hsl(var(--secondary))" },
} satisfies ChartConfig;

const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalReservations: 0,
    totalUsers: 0,
    totalDestinations: 0,
    totalCoworkings: 0,
    totalRevenue: 0,
    totalCarbonSaved: 0,
    pendingReservations: 0,
    confirmedReservations: 0,
    pendingReviews: 0,
    pendingStories: 0,
  });
  const [reservations, setReservations] = useState<ReservationRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [
          reservationsResult,
          profilesResult,
          destinationsResult,
          coworkingsResult,
          reviewsResult,
          storiesResult,
        ] = await Promise.all([
          supabase.from("reservations").select("id, total_price, status, created_at"),
          supabase.from("profiles").select("id, total_carbon_saved"),
          supabase.from("destinations").select("id"),
          supabase.from("coworking_spaces").select("id"),
          supabase.from("reviews").select("id, status"),
          supabase.from("community_stories").select("id, status"),
        ]);

        const reservationRows = (reservationsResult.data || []) as ReservationRow[];
        const profiles = profilesResult.data || [];
        const destinations = destinationsResult.data || [];
        const coworkings = coworkingsResult.data || [];
        const reviews = reviewsResult.data || [];
        const stories = storiesResult.data || [];

        setReservations(reservationRows);
        setStats({
          totalReservations: reservationRows.length,
          totalUsers: profiles.length,
          totalDestinations: destinations.length,
          totalCoworkings: coworkings.length,
          totalRevenue: reservationRows.reduce(
            (sum, r) => sum + (Number(r.total_price) || 0),
            0
          ),
          totalCarbonSaved: profiles.reduce(
            (sum, p) => sum + (Number(p.total_carbon_saved) || 0),
            0
          ),
          pendingReservations: reservationRows.filter((r) => r.status === "pending").length,
          confirmedReservations: reservationRows.filter((r) => r.status === "confirmed")
            .length,
          pendingReviews: reviews.filter((r) => r.status === "pending").length,
          pendingStories: stories.filter((s) => s.status === "pending").length,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const monthlyData = useMemo(() => {
    const months = Array.from({ length: 6 }, (_, i) => {
      const d = startOfMonth(subMonths(new Date(), 5 - i));
      return {
        key: format(d, "yyyy-MM"),
        label: format(d, "MMM", { locale: fr }),
        revenue: 0,
        bookings: 0,
      };
    });
    const byKey = Object.fromEntries(months.map((m) => [m.key, m]));
    for (const r of reservations) {
      if (!r.created_at) continue;
      const key = format(startOfMonth(new Date(r.created_at)), "yyyy-MM");
      if (byKey[key]) {
        byKey[key].bookings += 1;
        byKey[key].revenue += Number(r.total_price) || 0;
      }
    }
    return months;
  }, [reservations]);

  const statusData = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const r of reservations) {
      const s = r.status || "unknown";
      counts[s] = (counts[s] || 0) + 1;
    }
    const labels: Record<string, string> = {
      pending: "En attente",
      confirmed: "Confirmées",
      cancelled: "Annulées",
      completed: "Terminées",
    };
    return Object.entries(counts).map(([status, count]) => ({
      status: labels[status] || status,
      count,
    }));
  }, [reservations]);

  const statCards = [
    {
      title: "Réservations",
      value: stats.totalReservations,
      icon: CalendarCheck,
      color: "text-info",
      bgColor: "bg-info/10",
      href: "/admin/reservations",
    },
    {
      title: "Utilisateurs",
      value: stats.totalUsers,
      icon: Users,
      color: "text-success",
      bgColor: "bg-success/10",
      href: "/admin/users",
    },
    {
      title: "Destinations",
      value: stats.totalDestinations,
      icon: MapPin,
      color: "text-accent",
      bgColor: "bg-accent/10",
      href: "/admin/destinations",
    },
    {
      title: "Coworkings",
      value: stats.totalCoworkings,
      icon: Building2,
      color: "text-secondary-foreground",
      bgColor: "bg-secondary/40",
      href: "/admin/coworkings",
    },
    {
      title: "Revenus",
      value: `${stats.totalRevenue.toLocaleString("fr-FR")} €`,
      icon: DollarSign,
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      title: "CO₂ économisé",
      value: `${stats.totalCarbonSaved.toLocaleString("fr-FR")} kg`,
      icon: Leaf,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "En attente",
      value: stats.pendingReservations,
      icon: Activity,
      color: "text-warning",
      bgColor: "bg-warning/15",
      href: "/admin/reservations",
    },
    {
      title: "Confirmées",
      value: stats.confirmedReservations,
      icon: TrendingUp,
      color: "text-primary",
      bgColor: "bg-primary/10",
      href: "/admin/reservations",
    },
  ];

  const quickActions = [
    {
      href: "/admin/reservations",
      icon: CalendarCheck,
      title: "Réservations",
      subtitle: `${stats.pendingReservations} en attente`,
      tone: "bg-info/10 text-info",
    },
    {
      href: "/admin/reviews",
      icon: MessageSquare,
      title: "Modérer les avis",
      subtitle: `${stats.pendingReviews} à traiter`,
      tone: "bg-warning/15 text-warning",
    },
    {
      href: "/admin/community",
      icon: PenLine,
      title: "Modérer les récits",
      subtitle: `${stats.pendingStories} à valider`,
      tone: "bg-accent/10 text-accent",
    },
    {
      href: "/admin/destinations",
      icon: MapPin,
      title: "Destinations",
      subtitle: `${stats.totalDestinations} publiées`,
      tone: "bg-success/10 text-success",
    },
  ];

  return (
    <AdminLayout
      title="Tableau de bord"
      description="Vue d’ensemble de l’activité Amani Resorts — réservations, catalogue et modération."
    >
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="animate-pulse border-border/60">
              <CardHeader className="pb-2">
                <div className="h-4 bg-muted rounded w-24" />
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {statCards.map((stat) => {
            const content = (
              <>
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <div className={cn("p-2 rounded-lg", stat.bgColor)}>
                    <stat.icon className={cn("h-4 w-4", stat.color)} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="font-display text-2xl font-medium tracking-tight">
                    {stat.value}
                  </div>
                </CardContent>
              </>
            );

            return (
              <motion.div key={stat.title} variants={staggerItem}>
                {stat.href ? (
                  <Link to={stat.href}>
                    <Card className="h-full border-border/70 transition-all duration-300 hover:shadow-md hover:border-accent/30 hover:-translate-y-0.5">
                      {content}
                    </Card>
                  </Link>
                ) : (
                  <Card className="h-full border-border/70">{content}</Card>
                )}
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {!loading && (
        <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-border/70">
            <CardHeader>
              <CardTitle className="font-display text-lg font-medium">
                Activité — 6 derniers mois
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={revenueChartConfig} className="h-[220px] w-full">
                <BarChart data={monthlyData} accessibilityLayer>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} width={40} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="revenue" fill="var(--color-revenue)" radius={4} />
                  <Bar dataKey="bookings" fill="var(--color-bookings)" radius={4} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card className="border-border/70">
            <CardHeader>
              <CardTitle className="font-display text-lg font-medium">
                Répartition des statuts
              </CardTitle>
            </CardHeader>
            <CardContent>
              {statusData.length === 0 ? (
                <p className="text-sm text-muted-foreground py-12 text-center">
                  Aucune réservation pour le moment.
                </p>
              ) : (
                <ChartContainer config={statusChartConfig} className="h-[220px] w-full">
                  <BarChart data={statusData} layout="vertical" accessibilityLayer>
                    <CartesianGrid horizontal={false} />
                    <XAxis type="number" tickLine={false} axisLine={false} />
                    <YAxis
                      type="category"
                      dataKey="status"
                      tickLine={false}
                      axisLine={false}
                      width={90}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="count" fill="var(--color-count)" radius={4} />
                  </BarChart>
                </ChartContainer>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      <div className="mt-10">
        <h2 className="font-display text-xl font-medium mb-4">Actions rapides</h2>
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {quickActions.map((action) => (
            <motion.div key={action.href} variants={staggerItem}>
              <Link to={action.href}>
                <Card className="p-4 h-full border-border/70 transition-all duration-300 hover:shadow-md hover:border-accent/30 group">
                  <div className="flex items-start gap-3">
                    <div className={cn("p-2.5 rounded-xl shrink-0", action.tone)}>
                      <action.icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-foreground flex items-center gap-1">
                        {action.title}
                        <ArrowUpRight className="h-3.5 w-3.5 opacity-0 -translate-y-0.5 transition-all group-hover:opacity-100" />
                      </p>
                      <p className="text-sm text-muted-foreground mt-0.5">{action.subtitle}</p>
                    </div>
                  </div>
                </Card>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
