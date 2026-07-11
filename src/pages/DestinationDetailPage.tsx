import { useState } from "react";
import { useParams, Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Star, Wifi, Leaf, MapPin, ArrowLeft, Calendar, Users, 
  Building2, Home, Compass, Clock, ChevronRight,
  Heart, Share2, Check, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ecoScoreBadge } from "@/lib/eco-score";
import {
  useDestination,
  useCoworkings,
  useAccommodations,
  useActivities,
} from "@/hooks/useCatalogQueries";
import {
  parseBookingSearchParams,
  toDateInputValue,
  withBookingDates,
} from "@/lib/search-booking-params";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

// Fallback image
import destinationMoroni from "@/assets/destination-moroni.jpg";

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

interface CoworkingSpace {
  id: string;
  name: string;
  address: string | null;
  price_per_day: number | null;
  rating: number | null;
  amenities: string[] | null;
  carbon_score: string | null;
}

interface Accommodation {
  id: string;
  name: string;
  type: string | null;
  price_per_night: number | null;
  rating: number | null;
  carbon_score: string | null;
}

interface Activity {
  id: string;
  name: string;
  price: number | null;
  duration_hours: number | null;
  category: string | null;
  eco_certified: boolean | null;
}

const DestinationDetailPage = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const bookingParams = parseBookingSearchParams(searchParams);
  const { data: destination, isLoading: destLoading } = useDestination(id);
  const { data: coworkings = [], isLoading: cwLoading } = useCoworkings(id);
  const { data: accommodations = [], isLoading: acLoading } = useAccommodations(id);
  const { data: activities = [], isLoading: actLoading } = useActivities(id);
  const [selectedTab, setSelectedTab] = useState("coworkings");

  const loading = destLoading || cwLoading || acLoading || actLoading;
  const bookingPath = withBookingDates(`/booking/${id}`, bookingParams);
  const travelersCount = Number(bookingParams.travelers) || 1;

  const datesLabel = (() => {
    const from = toDateInputValue(bookingParams.from);
    const to = toDateInputValue(bookingParams.to);
    if (from && to) {
      try {
        return `${format(new Date(from), "d MMM", { locale: fr })} – ${format(new Date(to), "d MMM", { locale: fr })}`;
      } catch {
        return `${from} – ${to}`;
      }
    }
    if (from) return from;
    return "Dates flexibles";
  })();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!destination) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p>Destination non trouvée</p>
      </div>
    );
  }

  const typeLabels: Record<string, string> = {
    hotel: "Hôtel",
    apartment: "Appartement",
    coliving: "Coliving",
    hostel: "Auberge",
    "eco-lodge": "Éco-lodge",
  };

  const categoryLabels: Record<string, string> = {
    culture: "Culture",
    nature: "Nature",
    sport: "Sport",
    wellness: "Bien-être",
    gastronomy: "Gastronomie",
    "eco-tour": "Éco-tour",
  };

  return (
    <main className="pb-16 md:pb-20">
        {/* Hero Image — full-bleed under fixed header */}
        <div className="relative h-[55vh] md:h-[65vh]">
          <img
            src={destination.image_url || destinationMoroni}
            alt={destination.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/20 to-transparent" />
          
          {/* Back Button */}
          <Link
            to="/destinations"
            className="absolute top-24 left-4 md:left-8 flex items-center gap-2 text-primary-foreground hover:opacity-80 transition-opacity"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Retour</span>
          </Link>

          {/* Actions */}
          <div className="absolute top-24 right-4 md:right-8 flex gap-2">
            <Button variant="secondary" size="icon" className="rounded-full">
              <Heart className="w-5 h-5" />
            </Button>
            <Button variant="secondary" size="icon" className="rounded-full">
              <Share2 className="w-5 h-5" />
            </Button>
          </div>

          {/* Destination Info */}
          <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8">
            <div className="container mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                    ecoScoreBadge(destination.carbon_score || "B")
                  }`}>
                    Score Carbone {destination.carbon_score}
                  </span>
                  {destination.highlight && (
                    <Badge variant="secondary">{destination.highlight}</Badge>
                  )}
                </div>
                <h1 className="font-display text-4xl md:text-5xl font-medium text-primary-foreground mb-2">
                  {destination.name}
                </h1>
                <p className="text-lg text-primary-foreground/80 flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  {destination.city}, {destination.country}
                </p>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Quick Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <Star className="w-6 h-6 mx-auto mb-2 text-warning" />
                      <p className="text-2xl font-bold">{destination.rating}</p>
                      <p className="text-sm text-muted-foreground">Note moyenne</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <Building2 className="w-6 h-6 mx-auto mb-2 text-primary" />
                      <p className="text-2xl font-bold">{destination.coworking_count}</p>
                      <p className="text-sm text-muted-foreground">Coworkings</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <Wifi className="w-6 h-6 mx-auto mb-2 text-accent" />
                      <p className="text-2xl font-bold">{destination.wifi_speed} Mbps</p>
                      <p className="text-sm text-muted-foreground">WiFi moyen</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <Leaf className="w-6 h-6 mx-auto mb-2 text-carbon" />
                      <p className="text-2xl font-bold">{destination.avg_price_per_day}€</p>
                      <p className="text-sm text-muted-foreground">Par jour</p>
                    </CardContent>
                  </Card>
                </div>
              </motion.div>

              {/* Description */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>À propos de {destination.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">
                      {destination.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Tabs for Services */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Tabs value={selectedTab} onValueChange={setSelectedTab}>
                  <TabsList className="w-full grid grid-cols-3">
                    <TabsTrigger value="coworkings" className="flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      Coworkings
                    </TabsTrigger>
                    <TabsTrigger value="accommodations" className="flex items-center gap-2">
                      <Home className="w-4 h-4" />
                      Hébergements
                    </TabsTrigger>
                    <TabsTrigger value="activities" className="flex items-center gap-2">
                      <Compass className="w-4 h-4" />
                      Activités
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="coworkings" className="mt-6 space-y-4">
                    {coworkings.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-8">
                        Aucun coworking pour cette destination.
                      </p>
                    )}
                    {coworkings.map((space) => (
                      <Card key={space.id} className="cursor-pointer card-hover">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3">
                                <h4 className="font-semibold text-foreground">{space.name}</h4>
                                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                  ecoScoreBadge(space.carbon_score || "B")
                                }`}>
                                  {space.carbon_score}
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                                <MapPin className="w-3 h-3" />
                                {space.address}
                              </p>
                              <div className="flex items-center gap-2 mt-2">
                                <div className="flex items-center gap-1">
                                  <Star className="w-4 h-4 text-warning fill-warning" />
                                  <span className="text-sm">{space.rating}</span>
                                </div>
                                {space.amenities?.slice(0, 3).map((amenity) => (
                                  <Badge key={amenity} variant="outline" className="text-xs">
                                    {amenity}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold text-foreground">{space.price_per_day}€</p>
                              <p className="text-sm text-muted-foreground">/jour</p>
                              <Button size="sm" className="mt-2" asChild>
                                <Link to={bookingPath}>Réserver</Link>
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </TabsContent>

                  <TabsContent value="accommodations" className="mt-6 space-y-4">
                    {accommodations.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-8">
                        Aucun hébergement pour cette destination.
                      </p>
                    )}
                    {accommodations.map((accom) => (
                      <Card key={accom.id} className="cursor-pointer card-hover">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3">
                                <h4 className="font-semibold text-foreground">{accom.name}</h4>
                                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                  ecoScoreBadge(accom.carbon_score || "B")
                                }`}>
                                  {accom.carbon_score}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="secondary">
                                  {typeLabels[accom.type || "hotel"] || accom.type}
                                </Badge>
                                <div className="flex items-center gap-1">
                                  <Star className="w-4 h-4 text-warning fill-warning" />
                                  <span className="text-sm">{accom.rating}</span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold text-foreground">{accom.price_per_night}€</p>
                              <p className="text-sm text-muted-foreground">/nuit</p>
                              <Button size="sm" className="mt-2" asChild>
                                <Link to={bookingPath}>Réserver</Link>
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </TabsContent>

                  <TabsContent value="activities" className="mt-6 space-y-4">
                    {activities.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-8">
                        Aucune activité pour cette destination.
                      </p>
                    )}
                    {activities.map((activity) => (
                      <Card key={activity.id} className="cursor-pointer card-hover">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3">
                                <h4 className="font-semibold text-foreground">{activity.name}</h4>
                                {activity.eco_certified && (
                                  <Badge className="bg-carbon text-carbon-foreground">
                                    <Leaf className="w-3 h-3 mr-1" />
                                    Éco-certifié
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                                <Badge variant="outline">
                                  {categoryLabels[activity.category || "culture"] || activity.category}
                                </Badge>
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {activity.duration_hours}h
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold text-foreground">{activity.price}€</p>
                              <Button size="sm" className="mt-2" asChild>
                                <Link to={bookingPath}>Réserver</Link>
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </TabsContent>
                </Tabs>
              </motion.div>
            </div>

            {/* Sidebar - Booking Card */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="sticky top-24"
              >
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Planifier mon séjour</span>
                      <span className="text-2xl font-bold text-primary">
                        {destination.avg_price_per_day}€
                        <span className="text-sm font-normal text-muted-foreground">/jour</span>
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-3 border rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">Dates</p>
                      <p className="font-medium flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {datesLabel}
                      </p>
                    </div>

                    <div className="p-3 border rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">Voyageurs</p>
                      <p className="font-medium flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {travelersCount} voyageur{travelersCount > 1 ? "s" : ""}
                      </p>
                    </div>

                    <Button className="w-full" size="lg" asChild>
                      <Link to={bookingPath}>
                        Composer mon séjour
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </Link>
                    </Button>

                    <div className="pt-4 border-t space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Check className="w-4 h-4 text-success" />
                        Annulation flexible
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Check className="w-4 h-4 text-success" />
                        Paiement sécurisé
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Check className="w-4 h-4 text-carbon" />
                        Compensation carbone incluse
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </main>
  );
};

export default DestinationDetailPage;
