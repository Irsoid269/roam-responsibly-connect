import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CalendarCheck,
  Users,
  MapPin,
  Building2,
  TrendingUp,
  DollarSign,
  Leaf,
  Activity,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface DashboardStats {
  totalReservations: number;
  totalUsers: number;
  totalDestinations: number;
  totalCoworkings: number;
  totalRevenue: number;
  totalCarbonSaved: number;
  pendingReservations: number;
  confirmedReservations: number;
}

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
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [
          reservationsResult,
          profilesResult,
          destinationsResult,
          coworkingsResult,
        ] = await Promise.all([
          supabase.from("reservations").select("*"),
          supabase.from("profiles").select("id, total_carbon_saved"),
          supabase.from("destinations").select("id"),
          supabase.from("coworking_spaces").select("id"),
        ]);

        const reservations = reservationsResult.data || [];
        const profiles = profilesResult.data || [];
        const destinations = destinationsResult.data || [];
        const coworkings = coworkingsResult.data || [];

        const totalRevenue = reservations.reduce(
          (sum, r) => sum + (Number(r.total_price) || 0),
          0
        );
        const totalCarbonSaved = profiles.reduce(
          (sum, p) => sum + (Number(p.total_carbon_saved) || 0),
          0
        );
        const pendingReservations = reservations.filter(
          (r) => r.status === "pending"
        ).length;
        const confirmedReservations = reservations.filter(
          (r) => r.status === "confirmed"
        ).length;

        setStats({
          totalReservations: reservations.length,
          totalUsers: profiles.length,
          totalDestinations: destinations.length,
          totalCoworkings: coworkings.length,
          totalRevenue,
          totalCarbonSaved,
          pendingReservations,
          confirmedReservations,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      title: "Réservations totales",
      value: stats.totalReservations,
      icon: CalendarCheck,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Utilisateurs",
      value: stats.totalUsers,
      icon: Users,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      title: "Destinations",
      value: stats.totalDestinations,
      icon: MapPin,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
    {
      title: "Coworkings",
      value: stats.totalCoworkings,
      icon: Building2,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
    },
    {
      title: "Revenus totaux",
      value: `${stats.totalRevenue.toLocaleString()} €`,
      icon: DollarSign,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
    },
    {
      title: "CO₂ économisé",
      value: `${stats.totalCarbonSaved.toLocaleString()} kg`,
      icon: Leaf,
      color: "text-teal-500",
      bgColor: "bg-teal-500/10",
    },
    {
      title: "En attente",
      value: stats.pendingReservations,
      icon: Activity,
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
    },
    {
      title: "Confirmées",
      value: stats.confirmedReservations,
      icon: TrendingUp,
      color: "text-cyan-500",
      bgColor: "bg-cyan-500/10",
    },
  ];

  return (
    <AdminLayout title="Tableau de bord">
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-muted rounded w-24"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-16"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat) => (
            <Card key={stat.title} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Quick Actions */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-4">Actions rapides</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
            <a href="/admin/reservations" className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <CalendarCheck className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="font-medium">Gérer les réservations</p>
                <p className="text-sm text-muted-foreground">
                  {stats.pendingReservations} en attente
                </p>
              </div>
            </a>
          </Card>
          <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
            <a href="/admin/users" className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <Users className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="font-medium">Gérer les utilisateurs</p>
                <p className="text-sm text-muted-foreground">
                  {stats.totalUsers} inscrits
                </p>
              </div>
            </a>
          </Card>
          <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
            <a href="/admin/destinations" className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <MapPin className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="font-medium">Gérer les destinations</p>
                <p className="text-sm text-muted-foreground">
                  {stats.totalDestinations} destinations
                </p>
              </div>
            </a>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
