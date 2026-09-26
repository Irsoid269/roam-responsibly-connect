import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Search, Star, MapPin, Bed, Loader2 } from "lucide-react";
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
import { ecoScoreBadge } from "@/lib/eco-score";
import { useAccommodations } from "@/hooks/useCatalogQueries";
import {
  parseBookingSearchParams,
  withBookingDates,
} from "@/lib/search-booking-params";

const AccommodationsPage = () => {
  const { t } = useTranslation("accommodations");
  const [searchParams] = useSearchParams();
  const bookingParams = parseBookingSearchParams(searchParams);
  const destinationId = bookingParams.destination;
  const { data: accommodations = [], isLoading: loading } = useAccommodations(destinationId);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const filteredAccommodations = accommodations.filter((acc) => {
    const matchesSearch = acc.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "all" || acc.type?.toLowerCase() === typeFilter.toLowerCase();
    return matchesSearch && matchesType;
  });

  return (
    <main className="page-main">
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
                {t("eyebrow")}
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                {t("title")}
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                {t("description")}
              </p>

              <div className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    placeholder={t("searchPlaceholder")}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-12"
                  />
                </div>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-full sm:w-[180px] h-12">
                    <SelectValue placeholder={t("type")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("allTypes")}</SelectItem>
                    <SelectItem value="éco-lodge">{t("ecoLodge")}</SelectItem>
                    <SelectItem value="villa">{t("villa")}</SelectItem>
                    <SelectItem value="coliving">{t("coliving")}</SelectItem>
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
            {loading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : (
              <>
            <div className="flex justify-between items-center mb-6">
              <p className="text-muted-foreground">
                <span className="font-medium text-foreground">{filteredAccommodations.length}</span> {t("accommodationsFound")}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAccommodations.map((accommodation, index) => {
                const destId = accommodation.destination_id || destinationId;
                const bookTo = destId
                  ? withBookingDates(`/booking/${destId}`, bookingParams)
                  : "/destinations";
                return (
                <motion.div
                  key={accommodation.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="group card-hover overflow-hidden">
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <img
                        src={accommodation.image_url || "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800"}
                        alt={accommodation.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-foreground/40 via-transparent to-transparent" />
                      
                      <div className="absolute top-3 right-3">
                        <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                          ecoScoreBadge(accommodation.carbon_score || "B")
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
                          {accommodation.distance_to_center && (
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {accommodation.distance_to_center} {t("fromCenter")}
                            </p>
                          )}
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
                        <div>
                          <span className="text-lg font-bold text-foreground">
                            {accommodation.price_per_night}€
                          </span>
                          <span className="text-sm text-muted-foreground">{t("perNight")}</span>
                        </div>
                        <Button size="sm" asChild>
                          <Link to={bookTo}>{t("book")}</Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
              })}
            </div>

            {filteredAccommodations.length === 0 && (
              <div className="text-center py-16">
                <Bed className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-medium text-foreground">{t("noResults.title")}</h3>
                <p className="text-muted-foreground mt-1">{t("noResults.description")}</p>
              </div>
            )}
              </>
            )}
          </div>
        </section>
      </main>
  );
};

export default AccommodationsPage;
