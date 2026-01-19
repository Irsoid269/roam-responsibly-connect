import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  Search, Filter, Star, Wifi, Leaf, MapPin, 
  SlidersHorizontal, Grid, List
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

// Mock data for initial display
import destinationLisbon from "@/assets/destination-lisbon.jpg";
import destinationBali from "@/assets/destination-bali.jpg";
import destinationBarcelona from "@/assets/destination-barcelona.jpg";
import destinationCapetown from "@/assets/destination-capetown.jpg";

interface Destination {
  id: string;
  name: string;
  country: string;
  city: string;
  description: string | null;
  image_url: string | null;
  carbon_score: string | null;
  rating: number | null;
  highlight: string | null;
  avg_price_per_day: number | null;
  wifi_speed: number | null;
  coworking_count: number | null;
}

const mockDestinations: Destination[] = [
  {
    id: "1",
    name: "Lisbonne",
    country: "Portugal",
    city: "Lisbonne",
    description: "Capitale ensoleillée avec une scène tech florissante",
    image_url: destinationLisbon,
    carbon_score: "A",
    rating: 4.9,
    highlight: "Meilleur rapport qualité-prix",
    avg_price_per_day: 45,
    wifi_speed: 100,
    coworking_count: 85,
  },
  {
    id: "2",
    name: "Ubud, Bali",
    country: "Indonésie",
    city: "Ubud",
    description: "Paradis tropical pour nomades digitaux",
    image_url: destinationBali,
    carbon_score: "B",
    rating: 4.8,
    highlight: "Communauté nomade active",
    avg_price_per_day: 35,
    wifi_speed: 50,
    coworking_count: 62,
  },
  {
    id: "3",
    name: "Barcelone",
    country: "Espagne",
    city: "Barcelone",
    description: "Art, plage et innovation au rendez-vous",
    image_url: destinationBarcelona,
    carbon_score: "A",
    rating: 4.7,
    highlight: "Plage + City life",
    avg_price_per_day: 55,
    wifi_speed: 200,
    coworking_count: 120,
  },
  {
    id: "4",
    name: "Le Cap",
    country: "Afrique du Sud",
    city: "Cape Town",
    description: "Nature spectaculaire et startups en croissance",
    image_url: destinationCapetown,
    carbon_score: "B",
    rating: 4.8,
    highlight: "Nature & aventure",
    avg_price_per_day: 40,
    wifi_speed: 80,
    coworking_count: 45,
  },
];

const carbonScoreColors: Record<string, string> = {
  A: "bg-success text-success-foreground",
  B: "bg-primary text-primary-foreground",
  C: "bg-warning text-warning-foreground",
};

const DestinationsPage = () => {
  const [destinations, setDestinations] = useState<Destination[]>(mockDestinations);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("popular");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDestinations();
  }, []);

  const fetchDestinations = async () => {
    const { data, error } = await supabase
      .from("destinations")
      .select("*")
      .order("rating", { ascending: false });

    if (!error && data && data.length > 0) {
      setDestinations(data);
    }
    setLoading(false);
  };

  const filteredDestinations = destinations.filter((dest) =>
    dest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    dest.country.toLowerCase().includes(searchQuery.toLowerCase())
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
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                Explorez nos destinations
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                Découvrez les meilleurs spots pour travailler et vivre à travers le monde, 
                sélectionnés pour leur qualité et leur impact environnemental réduit.
              </p>

              {/* Search Bar */}
              <div className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher une destination..."
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

        {/* Filters & Results */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            {/* Toolbar */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <p className="text-muted-foreground">
                <span className="font-medium text-foreground">{filteredDestinations.length}</span> destinations trouvées
              </p>
              
              <div className="flex items-center gap-3">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[180px]">
                    <SlidersHorizontal className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Trier par" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="popular">Populaire</SelectItem>
                    <SelectItem value="price-low">Prix croissant</SelectItem>
                    <SelectItem value="price-high">Prix décroissant</SelectItem>
                    <SelectItem value="carbon">Score carbone</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex border rounded-lg overflow-hidden">
                  <Button
                    variant={viewMode === "grid" ? "secondary" : "ghost"}
                    size="icon"
                    onClick={() => setViewMode("grid")}
                  >
                    <Grid className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "secondary" : "ghost"}
                    size="icon"
                    onClick={() => setViewMode("list")}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Destinations Grid */}
            <div className={
              viewMode === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                : "flex flex-col gap-4"
            }>
              {filteredDestinations.map((destination, index) => (
                <motion.div
                  key={destination.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link to={`/destinations/${destination.id}`}>
                    <Card className={`group cursor-pointer card-hover overflow-hidden ${
                      viewMode === "list" ? "flex flex-row" : ""
                    }`}>
                      {/* Image */}
                      <div className={`relative overflow-hidden ${
                        viewMode === "list" ? "w-48 h-32" : "aspect-[4/3]"
                      }`}>
                        <img
                          src={destination.image_url || destinationLisbon}
                          alt={destination.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-foreground/40 via-transparent to-transparent" />
                        
                        {/* Carbon Score Badge */}
                        <div className="absolute top-3 right-3">
                          <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                            carbonScoreColors[destination.carbon_score || "B"]
                          }`}>
                            {destination.carbon_score || "B"}
                          </span>
                        </div>

                        {destination.highlight && viewMode === "grid" && (
                          <Badge className="absolute top-3 left-3 bg-background/90 text-foreground">
                            {destination.highlight}
                          </Badge>
                        )}
                      </div>

                      {/* Content */}
                      <CardContent className={`${viewMode === "list" ? "flex-1 flex items-center" : "p-4"}`}>
                        <div className={viewMode === "list" ? "flex-1" : ""}>
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                                {destination.name}
                              </h3>
                              <p className="text-sm text-muted-foreground flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {destination.country}
                              </p>
                            </div>
                            {viewMode === "list" && (
                              <div className="text-right">
                                <span className="text-lg font-bold text-foreground">
                                  {destination.avg_price_per_day}€
                                </span>
                                <span className="text-sm text-muted-foreground">/jour</span>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 text-warning fill-warning" />
                                <span className="text-sm font-medium">{destination.rating}</span>
                              </div>
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <Wifi className="w-4 h-4" />
                                <span className="text-sm">{destination.coworking_count} espaces</span>
                              </div>
                            </div>
                            
                            {viewMode === "grid" && (
                              <div className="flex items-center gap-1 text-carbon">
                                <Leaf className="w-4 h-4" />
                                <span className="text-xs font-medium">Éco</span>
                              </div>
                            )}
                          </div>

                          {viewMode === "grid" && (
                            <div className="mt-3 pt-3 border-t border-border">
                              <div className="flex items-center justify-between">
                                <span className="text-lg font-bold text-foreground">
                                  {destination.avg_price_per_day}€
                                </span>
                                <span className="text-sm text-muted-foreground">/jour</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>

            {filteredDestinations.length === 0 && (
              <div className="text-center py-16">
                <MapPin className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-medium text-foreground">Aucune destination trouvée</h3>
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

export default DestinationsPage;
