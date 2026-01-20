import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  Search, Filter, Star, Wifi, Leaf, MapPin, 
  Coffee, Clock, Users, Laptop
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { supabase } from "@/integrations/supabase/client";

interface CoworkingSpace {
  id: string;
  name: string;
  description: string | null;
  address: string | null;
  image_url: string | null;
  carbon_score: string | null;
  rating: number | null;
  price_per_day: number | null;
  price_per_hour: number | null;
  price_per_month: number | null;
  wifi_speed: number | null;
  amenities: string[] | null;
  opening_hours: string | null;
}

const mockCoworkings: CoworkingSpace[] = [
  {
    id: "1",
    name: "Hub Créatif Lisbonne",
    description: "Espace moderne avec vue sur le Tage",
    address: "Alfama, Lisbonne",
    image_url: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800",
    carbon_score: "A",
    rating: 4.9,
    price_per_day: 25,
    price_per_hour: 5,
    price_per_month: 350,
    wifi_speed: 500,
    amenities: ["Café gratuit", "Salle de réunion", "Terrasse"],
    opening_hours: "7h - 22h",
  },
  {
    id: "2",
    name: "Bali Digital Nest",
    description: "Coworking au cœur de la jungle",
    address: "Ubud, Bali",
    image_url: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800",
    carbon_score: "A",
    rating: 4.8,
    price_per_day: 15,
    price_per_hour: 3,
    price_per_month: 200,
    wifi_speed: 100,
    amenities: ["Piscine", "Yoga", "Restaurant bio"],
    opening_hours: "6h - 23h",
  },
  {
    id: "3",
    name: "Barcelona Tech Hub",
    description: "Innovation et networking au quotidien",
    address: "El Born, Barcelone",
    image_url: "https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?w=800",
    carbon_score: "B",
    rating: 4.7,
    price_per_day: 30,
    price_per_hour: 6,
    price_per_month: 400,
    wifi_speed: 1000,
    amenities: ["Event space", "Podcast studio", "Rooftop"],
    opening_hours: "8h - 21h",
  },
  {
    id: "4",
    name: "Cape Town Creative",
    description: "Vue mer et communauté vibrante",
    address: "Sea Point, Le Cap",
    image_url: "https://images.unsplash.com/photo-1497215842964-222b430dc094?w=800",
    carbon_score: "B",
    rating: 4.6,
    price_per_day: 20,
    price_per_hour: 4,
    price_per_month: 280,
    wifi_speed: 200,
    amenities: ["Vue océan", "Café", "Parking vélo"],
    opening_hours: "7h - 20h",
  },
];

const carbonScoreColors: Record<string, string> = {
  A: "bg-success text-success-foreground",
  B: "bg-primary text-primary-foreground",
  C: "bg-warning text-warning-foreground",
};

const CoworkingsPage = () => {
  const [coworkings, setCoworkings] = useState<CoworkingSpace[]>(mockCoworkings);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("popular");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCoworkings();
  }, []);

  const fetchCoworkings = async () => {
    const { data, error } = await supabase
      .from("coworking_spaces")
      .select("*")
      .order("rating", { ascending: false });

    if (!error && data && data.length > 0) {
      setCoworkings(data);
    }
    setLoading(false);
  };

  const filteredCoworkings = coworkings.filter((cw) =>
    cw.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (cw.address && cw.address.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-16">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-primary-light to-background py-12">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center max-w-3xl mx-auto"
            >
              <Badge variant="outline" className="mb-4 bg-primary/10 border-primary/20">
                <Laptop className="w-3 h-3 mr-1" />
                Espaces vérifiés
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                Espaces de coworking
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                Trouvez l'espace de travail idéal pour votre séjour, 
                avec WiFi rapide et impact carbone minimal.
              </p>

              {/* Search Bar */}
              <div className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher un espace..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-12"
                  />
                </div>
                <Button size="lg" variant="outline" className="h-12">
                  <Filter className="w-4 h-4 mr-2" />
                  Filtres
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Results */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <p className="text-muted-foreground">
                <span className="font-medium text-foreground">{filteredCoworkings.length}</span> espaces trouvés
              </p>
              
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Trier par" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popular">Populaire</SelectItem>
                  <SelectItem value="price-low">Prix croissant</SelectItem>
                  <SelectItem value="price-high">Prix décroissant</SelectItem>
                  <SelectItem value="wifi">Vitesse WiFi</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCoworkings.map((coworking, index) => (
                <motion.div
                  key={coworking.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="group cursor-pointer card-hover overflow-hidden">
                    <div className="relative aspect-video overflow-hidden">
                      <img
                        src={coworking.image_url || "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800"}
                        alt={coworking.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-foreground/40 via-transparent to-transparent" />
                      
                      <div className="absolute top-3 right-3">
                        <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                          carbonScoreColors[coworking.carbon_score || "B"]
                        }`}>
                          {coworking.carbon_score || "B"}
                        </span>
                      </div>

                      <div className="absolute bottom-3 left-3 flex gap-2">
                        <Badge className="bg-background/90 text-foreground">
                          <Wifi className="w-3 h-3 mr-1" />
                          {coworking.wifi_speed} Mbps
                        </Badge>
                      </div>
                    </div>

                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                            {coworking.name}
                          </h3>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {coworking.address}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-warning fill-warning" />
                          <span className="text-sm font-medium">{coworking.rating}</span>
                        </div>
                      </div>

                      <p className="text-sm text-muted-foreground mb-3">{coworking.description}</p>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {coworking.amenities?.slice(0, 3).map((amenity, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {amenity}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-border">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          {coworking.opening_hours}
                        </div>
                        <div>
                          <span className="text-lg font-bold text-foreground">
                            {coworking.price_per_day}€
                          </span>
                          <span className="text-sm text-muted-foreground">/jour</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {filteredCoworkings.length === 0 && (
              <div className="text-center py-16">
                <Laptop className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-medium text-foreground">Aucun espace trouvé</h3>
                <p className="text-muted-foreground mt-1">Essayez une autre recherche</p>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default CoworkingsPage;
