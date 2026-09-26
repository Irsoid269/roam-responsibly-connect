import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Search, Leaf, Clock,
  Camera, Mountain, Utensils, Waves, Compass, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useActivities, useUniverses } from "@/hooks/useCatalogQueries";
import {
  parseBookingSearchParams,
  withBookingDates,
} from "@/lib/search-booking-params";

// Les 4 "univers" du cahier des charges (table `universes`) — icônes assignées
// localement car la donnée source n'en fournit pas.
const universeIcons: Record<string, typeof Camera> = {
  "gastronomie-savoir-faire": Utensils,
  "decouverte-terrestre": Mountain,
  "mer-faune-marine": Waves,
  "evasion-immersion": Compass,
};

const ActivitiesPage = () => {
  const { t } = useTranslation("activities");
  const [searchParams] = useSearchParams();
  const bookingParams = parseBookingSearchParams(searchParams);
  const destinationId = bookingParams.destination;
  const { data: activities = [], isLoading: loading } = useActivities(destinationId);
  const { data: universes = [] } = useUniverses();
  const [searchQuery, setSearchQuery] = useState("");
  const [universeFilter, setUniverseFilter] = useState<string | null>(
    searchParams.get("universe")
  );

  const universesById = Object.fromEntries(universes.map((u) => [u.id, u]));

  const filteredActivities = activities.filter((activity) => {
    const matchesSearch = activity.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesUniverse = !universeFilter || activity.universe_id === universeFilter;
    return matchesSearch && matchesUniverse;
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
                {t("eyebrow")}
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                {t("title")}
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                {t("description")}
              </p>

              <div className="relative max-w-xl mx-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder={t("searchPlaceholder")}
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
                variant={universeFilter === null ? "default" : "outline"}
                size="sm"
                onClick={() => setUniverseFilter(null)}
              >
                {t("all")}
              </Button>
              {universes.map((universe) => {
                const Icon = universeIcons[universe.id] || Camera;
                return (
                  <Button
                    key={universe.id}
                    variant={universeFilter === universe.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setUniverseFilter(universe.id)}
                  >
                    <Icon className="w-4 h-4 mr-1" />
                    {universe.name}
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
                <span className="font-medium text-foreground">{filteredActivities.length}</span> {t("availableActivities")}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredActivities.map((activity, index) => {
                const universe = activity.universe_id ? universesById[activity.universe_id] : undefined;
                const CategoryIcon = universe ? universeIcons[universe.id] || Camera : Camera;
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
                            {t("ecoCertified")}
                          </Badge>
                        )}

                        {universe && (
                          <Badge className="absolute top-3 left-3 bg-background/90 text-foreground">
                            <CategoryIcon className="w-3 h-3 mr-1" />
                            {universe.name}
                          </Badge>
                        )}
                      </div>

                      <CardContent className="p-4">
                        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors mb-2">
                          {activity.name}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4">{activity.description}</p>

                        <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {activity.duration_hours != null ? `${activity.duration_hours}h` : t("durationPending")}
                          </div>
                          <div className="flex items-center gap-1 text-carbon">
                            <Leaf className="w-4 h-4" />
                            {activity.carbon_impact === 0 ? t("neutral") : `${activity.carbon_impact} kg CO₂`}
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-border">
                          <span className="text-lg font-bold text-foreground">
                            {activity.price != null ? `${activity.price}€` : t("onRequest")}
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
                              {t("book")}
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
                <h3 className="text-lg font-medium text-foreground">{t("noResults.title")}</h3>
                <p className="text-muted-foreground mt-1">{t("noResults.description")}</p>
              </div>
            )}
          </div>
        </section>
      </main>
  );
};

export default ActivitiesPage;
