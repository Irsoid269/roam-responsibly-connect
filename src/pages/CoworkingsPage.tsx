import { useState } from "react";
import { motion } from "framer-motion";
import { useSearchParams } from "react-router-dom";
import { 
  Search, Filter, Star, Wifi, MapPin, 
  Clock, Laptop, Loader2
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
import BookingDialog from "@/components/coworking/BookingDialog";
import { ecoScoreBadge } from "@/lib/eco-score";
import { useCoworkings } from "@/hooks/useCatalogQueries";
import PageHero from "@/components/layout/PageHero";
import { toDateFromParam } from "@/lib/search-booking-params";

const defaultImage = "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800";

type CoworkingSpace = NonNullable<ReturnType<typeof useCoworkings>["data"]>[number];

const CoworkingsPage = () => {
  const [searchParams] = useSearchParams();
  const destinationId = searchParams.get("destination") || undefined;
  const initialFrom = toDateFromParam(searchParams.get("from") || undefined);
  const initialTo = toDateFromParam(searchParams.get("to") || undefined);
  const { data: coworkings = [], isLoading: loading } = useCoworkings(destinationId);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("popular");
  const [selectedCoworking, setSelectedCoworking] = useState<CoworkingSpace | null>(null);
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);

  const filteredCoworkings = coworkings
    .filter((cw) =>
      cw.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (cw.address && cw.address.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .sort((a, b) => {
      if (sortBy === "price") return (a.price_per_day || 0) - (b.price_per_day || 0);
      return (b.rating || 0) - (a.rating || 0);
    });

  return (
    <>
    <main className="page-main">
        <PageHero
          eyebrow="Espaces vérifiés"
          title="Espaces de coworking"
          description="Trouvez l'espace de travail idéal pour votre séjour, avec WiFi rapide et impact carbone minimal."
        >
          <div className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Rechercher un espace..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 bg-background/80 backdrop-blur-sm"
              />
            </div>
            <Button size="lg" variant="outline" className="h-12">
              <Filter className="w-4 h-4 mr-2" />
              Filtres
            </Button>
          </div>
        </PageHero>

        {/* Results */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            {loading ? (
              <div className="flex justify-center items-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : coworkings.length === 0 ? (
              <div className="text-center py-16">
                <Laptop className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-medium text-foreground">Aucun espace disponible</h3>
                <p className="text-muted-foreground mt-1">Les espaces de coworking seront ajoutés prochainement</p>
              </div>
            ) : (
            <>
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
                    <div 
                      className="relative aspect-video overflow-hidden"
                      onClick={() => {
                        setSelectedCoworking(coworking);
                        setBookingDialogOpen(true);
                      }}
                    >
                      <img
                        src={coworking.image_url || defaultImage}
                        alt={coworking.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-foreground/40 via-transparent to-transparent" />
                      
                      <div className="absolute top-3 right-3">
                        <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                          ecoScoreBadge(coworking.carbon_score || "B")
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

                      <Button 
                        className="w-full mt-4"
                        onClick={() => {
                          setSelectedCoworking(coworking);
                          setBookingDialogOpen(true);
                        }}
                      >
                        Réserver
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {filteredCoworkings.length === 0 && searchQuery && (
              <div className="text-center py-16">
                <Laptop className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-medium text-foreground">Aucun espace trouvé</h3>
                <p className="text-muted-foreground mt-1">Essayez une autre recherche</p>
              </div>
            )}
            </>
            )}
          </div>
        </section>
      </main>
      <BookingDialog
        coworking={selectedCoworking}
        open={bookingDialogOpen}
        onOpenChange={setBookingDialogOpen}
        initialFrom={initialFrom}
        initialTo={initialTo}
      />
    </>
  );
};

export default CoworkingsPage;
