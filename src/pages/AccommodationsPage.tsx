import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Search, Filter, Star, Leaf, MapPin, 
  Bed, Wifi, Coffee, UtensilsCrossed
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

interface Accommodation {
  id: string;
  name: string;
  type: string | null;
  description: string | null;
  image_url: string | null;
  carbon_score: string | null;
  rating: number | null;
  price_per_night: number | null;
  distance_to_center: string | null;
  amenities: string[] | null;
}

const mockAccommodations: Accommodation[] = [
  {
    id: "1",
    name: "Eco Lodge Lisbonne",
    type: "Éco-lodge",
    description: "Hébergement durable avec panneaux solaires et jardin bio",
    image_url: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
    carbon_score: "A",
    rating: 4.9,
    price_per_night: 85,
    distance_to_center: "2.5 km",
    amenities: ["Petit-déj bio", "WiFi", "Vélos gratuits"],
  },
  {
    id: "2",
    name: "Bamboo Villa Ubud",
    type: "Villa",
    description: "Villa traditionnelle en bambou avec vue sur les rizières",
    image_url: "https://images.unsplash.com/photo-1540541338287-41700207dee6?w=800",
    carbon_score: "A",
    rating: 4.8,
    price_per_night: 65,
    distance_to_center: "4 km",
    amenities: ["Piscine naturelle", "Yoga", "Cuisine"],
  },
  {
    id: "3",
    name: "Coliving Barcelona",
    type: "Coliving",
    description: "Appartement partagé moderne avec espaces de coworking intégrés",
    image_url: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800",
    carbon_score: "B",
    rating: 4.7,
    price_per_night: 55,
    distance_to_center: "1 km",
    amenities: ["Coworking", "Rooftop", "Communauté"],
  },
  {
    id: "4",
    name: "Ocean View B&B",
    type: "B&B",
    description: "Chambre d'hôtes avec vue mer et petit-déjeuner local",
    image_url: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800",
    carbon_score: "B",
    rating: 4.6,
    price_per_night: 75,
    distance_to_center: "3 km",
    amenities: ["Vue océan", "Petit-déj", "Terrasse"],
  },
];

const carbonScoreColors: Record<string, string> = {
  A: "bg-success text-success-foreground",
  B: "bg-primary text-primary-foreground",
  C: "bg-warning text-warning-foreground",
};

const AccommodationsPage = () => {
  const [accommodations, setAccommodations] = useState<Accommodation[]>(mockAccommodations);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAccommodations();
  }, []);

  const fetchAccommodations = async () => {
    const { data, error } = await supabase
      .from("accommodations")
      .select("*")
      .order("rating", { ascending: false });

    if (!error && data && data.length > 0) {
      setAccommodations(data);
    }
    setLoading(false);
  };

  const filteredAccommodations = accommodations.filter((acc) => {
    const matchesSearch = acc.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "all" || acc.type?.toLowerCase() === typeFilter.toLowerCase();
    return matchesSearch && matchesType;
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-16">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-secondary-light to-background py-12">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center max-w-3xl mx-auto"
            >
              <Badge variant="outline" className="mb-4 bg-secondary/10 border-secondary/20">
                <Bed className="w-3 h-3 mr-1" />
                Hébergements éco-responsables
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                Hébergements
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                Séjournez dans des hébergements sélectionnés pour leur confort et leur faible impact environnemental.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher un hébergement..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-12"
                  />
                </div>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-full sm:w-[180px] h-12">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les types</SelectItem>
                    <SelectItem value="éco-lodge">Éco-lodge</SelectItem>
                    <SelectItem value="villa">Villa</SelectItem>
                    <SelectItem value="coliving">Coliving</SelectItem>
                    <SelectItem value="b&b">B&B</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Results */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-6">
              <p className="text-muted-foreground">
                <span className="font-medium text-foreground">{filteredAccommodations.length}</span> hébergements trouvés
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAccommodations.map((accommodation, index) => (
                <motion.div
                  key={accommodation.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="group cursor-pointer card-hover overflow-hidden">
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <img
                        src={accommodation.image_url || "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800"}
                        alt={accommodation.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-foreground/40 via-transparent to-transparent" />
                      
                      <div className="absolute top-3 right-3">
                        <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                          carbonScoreColors[accommodation.carbon_score || "B"]
                        }`}>
                          {accommodation.carbon_score || "B"}
                        </span>
                      </div>

                      <Badge className="absolute top-3 left-3 bg-background/90 text-foreground">
                        {accommodation.type}
                      </Badge>
                    </div>

                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                            {accommodation.name}
                          </h3>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {accommodation.distance_to_center} du centre
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-warning fill-warning" />
                          <span className="text-sm font-medium">{accommodation.rating}</span>
                        </div>
                      </div>

                      <p className="text-sm text-muted-foreground mb-3">{accommodation.description}</p>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {accommodation.amenities?.slice(0, 3).map((amenity, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {amenity}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-border">
                        <div className="flex items-center gap-1 text-carbon">
                          <Leaf className="w-4 h-4" />
                          <span className="text-xs font-medium">Éco-certifié</span>
                        </div>
                        <div>
                          <span className="text-lg font-bold text-foreground">
                            {accommodation.price_per_night}€
                          </span>
                          <span className="text-sm text-muted-foreground">/nuit</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {filteredAccommodations.length === 0 && (
              <div className="text-center py-16">
                <Bed className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-medium text-foreground">Aucun hébergement trouvé</h3>
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

export default AccommodationsPage;
