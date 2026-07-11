import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Search, Leaf,
  Bike, Car, Train, Ship, Footprints, Zap, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useMobility } from "@/hooks/useCatalogQueries";
import {
  parseBookingSearchParams,
  withBookingDates,
} from "@/lib/search-booking-params";

const typeIcons: Record<string, typeof Bike> = {
  "Vélo": Bike,
  "Vélo électrique": Zap,
  "Trottinette": Footprints,
  "Voiture électrique": Car,
  "Train": Train,
  "Ferry": Ship,
};

const MobilityPage = () => {
  const [searchParams] = useSearchParams();
  const bookingParams = parseBookingSearchParams(searchParams);
  const destinationId = bookingParams.destination;
  const { data: mobilityOptions = [], isLoading: loading } = useMobility(destinationId);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string | null>(null);

  const types = [...new Set(mobilityOptions.map(m => m.type).filter(Boolean))];

  const filteredOptions = mobilityOptions.filter((option) => {
    const matchesSearch = option.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = !typeFilter || option.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const getCarbonLabel = (carbonPerKm: number | null) => {
    if (carbonPerKm === null) return "N/A";
    if (carbonPerKm === 0) return "Zéro émission";
    if (carbonPerKm < 0.01) return "Très faible";
    if (carbonPerKm < 0.05) return "Faible";
    return "Modéré";
  };

  const getCarbonColor = (carbonPerKm: number | null) => {
    if (carbonPerKm === null) return "bg-muted text-muted-foreground";
    if (carbonPerKm === 0) return "bg-success text-success-foreground";
    if (carbonPerKm < 0.01) return "bg-primary text-primary-foreground";
    if (carbonPerKm < 0.05) return "bg-warning text-warning-foreground";
    return "bg-secondary text-secondary-foreground";
  };

  return (
    <main className="page-main">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-carbon-light to-background py-12">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center max-w-3xl mx-auto"
            >
              <Badge variant="outline" className="mb-4 bg-carbon/10 border-carbon/20">
                <Leaf className="w-3 h-3 mr-1" />
                Mobilité durable
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                Mobilité douce
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                Déplacez-vous de manière écologique avec nos options de mobilité 
                à faible impact carbone.
              </p>

              <div className="relative max-w-xl mx-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Rechercher..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12"
                />
              </div>
            </motion.div>
          </div>
        </section>

        {/* Types Filter */}
        <section className="py-6 border-b">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap gap-2 justify-center">
              <Button
                variant={typeFilter === null ? "default" : "outline"}
                size="sm"
                onClick={() => setTypeFilter(null)}
              >
                Tous
              </Button>
              {types.map((type) => {
                const Icon = typeIcons[type as string] || Bike;
                return (
                  <Button
                    key={type}
                    variant={typeFilter === type ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTypeFilter(type as string)}
                  >
                    <Icon className="w-4 h-4 mr-1" />
                    {type}
                  </Button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Carbon Info Banner */}
        <section className="py-6 bg-carbon/5">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-success"></span>
                Zéro émission
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-primary"></span>
                {"< 10g/km"}
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-warning"></span>
                {"< 50g/km"}
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-secondary"></span>
                {"> 50g/km"}
              </div>
            </div>
          </div>
        </section>

        {/* Results */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredOptions.map((option, index) => {
                const TypeIcon = typeIcons[option.type as string] || Bike;
                return (
                  <motion.div
                    key={option.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="group cursor-pointer card-hover overflow-hidden">
                      <div className="relative aspect-video overflow-hidden">
                        <img
                          src={option.image_url || "https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=800"}
                          alt={option.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-foreground/40 via-transparent to-transparent" />
                        
                        <Badge className={`absolute top-3 right-3 ${getCarbonColor(option.carbon_per_km)}`}>
                          <Leaf className="w-3 h-3 mr-1" />
                          {getCarbonLabel(option.carbon_per_km)}
                        </Badge>

                        <div className="absolute bottom-3 left-3 flex items-center gap-2 text-background">
                          <TypeIcon className="w-5 h-5" />
                          <span className="font-medium">{option.type}</span>
                        </div>
                      </div>

                      <CardContent className="p-4">
                        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors mb-2">
                          {option.name}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4">{option.description}</p>

                        <div className="flex items-center justify-between pt-3 border-t border-border">
                          <div className="text-right">
                            {option.price_per_hour && (
                              <span className="text-sm text-muted-foreground mr-2">
                                {option.price_per_hour}€/h
                              </span>
                            )}
                            <span className="text-lg font-bold text-foreground">
                              {option.price_per_day}€
                            </span>
                            <span className="text-sm text-muted-foreground">/jour</span>
                          </div>
                          <Button size="sm" asChild>
                            <Link
                              to={
                                option.destination_id || destinationId
                                  ? withBookingDates(
                                      `/booking/${option.destination_id || destinationId}`,
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

            {filteredOptions.length === 0 && (
              <div className="text-center py-16">
                <Bike className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-medium text-foreground">Aucune option trouvée</h3>
                <p className="text-muted-foreground mt-1">Essayez une autre recherche</p>
              </div>
            )}
          </div>
        </section>
      </main>
  );
};

export default MobilityPage;
