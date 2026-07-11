import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useSearchParams } from "react-router-dom";
import { 
  Search, Leaf, Clock,
  Camera, Mountain, Palette, Utensils, Music, Waves, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useActivities } from "@/hooks/useCatalogQueries";
import {
  parseBookingSearchParams,
  withBookingDates,
} from "@/lib/search-booking-params";

const categoryIcons: Record<string, typeof Camera> = {
  "Photo": Camera,
  "Aventure": Mountain,
  "Art": Palette,
  "Gastronomie": Utensils,
  "Musique": Music,
  "Sports nautiques": Waves,
};

const ActivitiesPage = () => {
  const [searchParams] = useSearchParams();
  const bookingParams = parseBookingSearchParams(searchParams);
  const destinationId = bookingParams.destination;
  const { data: activities = [], isLoading: loading } = useActivities(destinationId);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);

  const categories = [...new Set(activities.map(a => a.category).filter(Boolean))];

  const filteredActivities = activities.filter((activity) => {
    const matchesSearch = activity.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !categoryFilter || activity.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <main className="page-main">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-accent-light to-background py-12">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center max-w-3xl mx-auto"
            >
              <Badge variant="outline" className="mb-4 bg-accent/10 border-accent/20">
                <Leaf className="w-3 h-3 mr-1" />
                Expériences responsables
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                Activités
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                Vivez des expériences uniques et authentiques qui respectent l'environnement 
                et soutiennent les communautés locales.
              </p>

              <div className="relative max-w-xl mx-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Rechercher une activité..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12"
                />
              </div>
            </motion.div>
          </div>
        </section>

        {/* Categories */}
        <section className="py-6 border-b">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap gap-2 justify-center">
              <Button
                variant={categoryFilter === null ? "default" : "outline"}
                size="sm"
                onClick={() => setCategoryFilter(null)}
              >
                Toutes
              </Button>
              {categories.map((category) => {
                const Icon = categoryIcons[category as string] || Camera;
                return (
                  <Button
                    key={category}
                    variant={categoryFilter === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCategoryFilter(category as string)}
                  >
                    <Icon className="w-4 h-4 mr-1" />
                    {category}
                  </Button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Results */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-6">
              <p className="text-muted-foreground">
                <span className="font-medium text-foreground">{filteredActivities.length}</span> activités disponibles
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredActivities.map((activity, index) => {
                const CategoryIcon = categoryIcons[activity.category as string] || Camera;
                return (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="group cursor-pointer card-hover overflow-hidden">
                      <div className="relative aspect-[4/3] overflow-hidden">
                        <img
                          src={activity.image_url || "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800"}
                          alt={activity.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-foreground/50 via-transparent to-transparent" />
                        
                        {activity.eco_certified && (
                          <Badge className="absolute top-3 right-3 bg-success text-success-foreground">
                            <Leaf className="w-3 h-3 mr-1" />
                            Éco-certifié
                          </Badge>
                        )}

                        <Badge className="absolute top-3 left-3 bg-background/90 text-foreground">
                          <CategoryIcon className="w-3 h-3 mr-1" />
                          {activity.category}
                        </Badge>
                      </div>

                      <CardContent className="p-4">
                        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors mb-2">
                          {activity.name}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4">{activity.description}</p>

                        <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {activity.duration_hours}h
                          </div>
                          <div className="flex items-center gap-1 text-carbon">
                            <Leaf className="w-4 h-4" />
                            {activity.carbon_impact === 0 ? "Neutre" : `${activity.carbon_impact} kg CO₂`}
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-border">
                          <span className="text-lg font-bold text-foreground">
                            {activity.price}€
                          </span>
                          <Button size="sm" asChild>
                            <Link
                              to={
                                activity.destination_id || destinationId
                                  ? withBookingDates(
                                      `/booking/${activity.destination_id || destinationId}`,
                                      bookingParams
                                    )
                                  : "/destinations"
                              }
                            >
                              Réserver
                            </Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>

            {filteredActivities.length === 0 && (
              <div className="text-center py-16">
                <Camera className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-medium text-foreground">Aucune activité trouvée</h3>
                <p className="text-muted-foreground mt-1">Essayez une autre recherche</p>
              </div>
            )}
          </div>
        </section>
      </main>
  );
};

export default ActivitiesPage;
