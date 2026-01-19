import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  User, Mail, Leaf, MapPin, Calendar, Settings, LogOut, 
  TreePine, Plane, Building2, Bike, Camera
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  carbon_preference: string | null;
  total_carbon_saved: number;
  trips_count: number;
}

const ProfilePage = () => {
  const { user, signOut, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
      return;
    }

    if (user) {
      fetchProfile();
    }
  }, [user, authLoading, navigate]);

  const fetchProfile = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!error && data) {
      setProfile(data);
    }
    setLoading(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const carbonStats = [
    { icon: TreePine, label: "CO₂ économisé", value: `${profile?.total_carbon_saved || 0} kg`, color: "text-success" },
    { icon: Plane, label: "Voyages", value: profile?.trips_count || 0, color: "text-primary" },
    { icon: Building2, label: "Coworkings visités", value: 12, color: "text-accent" },
    { icon: Bike, label: "Mobilité douce", value: "85%", color: "text-carbon" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Profile Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Card className="overflow-hidden">
              <div className="h-32 bg-gradient-to-r from-primary to-accent" />
              <CardContent className="relative pt-0 pb-6">
                <div className="flex flex-col md:flex-row md:items-end gap-4 -mt-16 md:-mt-12">
                  <div className="relative">
                    <Avatar className="w-32 h-32 border-4 border-background shadow-lg">
                      <AvatarImage src={profile?.avatar_url || ""} />
                      <AvatarFallback className="text-3xl bg-primary text-primary-foreground">
                        {profile?.full_name?.charAt(0) || user?.email?.charAt(0)?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md hover:bg-primary/90 transition-colors">
                      <Camera className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <h1 className="text-2xl font-bold text-foreground">
                          {profile?.full_name || "Voyageur"}
                        </h1>
                        <p className="text-muted-foreground flex items-center gap-2 mt-1">
                          <Mail className="w-4 h-4" />
                          {user?.email}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Settings className="w-4 h-4 mr-2" />
                          Paramètres
                        </Button>
                        <Button variant="ghost" size="sm" onClick={handleSignOut}>
                          <LogOut className="w-4 h-4 mr-2" />
                          Déconnexion
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Carbon Badge */}
                <div className="mt-6 flex flex-wrap gap-2">
                  <Badge variant="secondary" className="bg-carbon-light text-carbon">
                    <Leaf className="w-3 h-3 mr-1" />
                    Voyageur Éco-responsable
                  </Badge>
                  <Badge variant="outline">
                    <MapPin className="w-3 h-3 mr-1" />
                    4 pays visités
                  </Badge>
                  <Badge variant="outline">
                    <Calendar className="w-3 h-3 mr-1" />
                    Membre depuis 2024
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Stats Cards */}
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

          {/* Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Tabs defaultValue="trips" className="w-full">
              <TabsList className="w-full md:w-auto">
                <TabsTrigger value="trips">Mes voyages</TabsTrigger>
                <TabsTrigger value="carbon">Impact carbone</TabsTrigger>
                <TabsTrigger value="reviews">Mes avis</TabsTrigger>
              </TabsList>

              <TabsContent value="trips" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Voyages à venir</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12 text-muted-foreground">
                      <Plane className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium">Pas de voyage prévu</p>
                      <p className="text-sm mt-1">Explorez nos destinations pour planifier votre prochain coworkation !</p>
                      <Button className="mt-4" onClick={() => navigate("/destinations")}>
                        Explorer les destinations
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="carbon" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Leaf className="w-5 h-5 text-carbon" />
                      Mon impact carbone
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="p-6 rounded-xl bg-carbon-light">
                        <p className="text-sm text-carbon font-medium">Total économisé</p>
                        <p className="text-4xl font-bold text-carbon mt-1">
                          {profile?.total_carbon_saved || 0} kg CO₂
                        </p>
                        <p className="text-sm text-muted-foreground mt-2">
                          Équivalent à {Math.round((profile?.total_carbon_saved || 0) * 5.5)} km en voiture
                        </p>
                      </div>
                      
                      <p className="text-center text-muted-foreground">
                        Effectuez des réservations pour voir votre historique d'impact carbone.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reviews" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Mes avis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12 text-muted-foreground">
                      <p className="text-lg font-medium">Aucun avis pour le moment</p>
                      <p className="text-sm mt-1">Partagez votre expérience après votre premier voyage !</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProfilePage;
