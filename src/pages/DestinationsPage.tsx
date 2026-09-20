import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { 
  Search, Filter, Star, Wifi, Leaf, MapPin, 
  SlidersHorizontal, Grid, List, Loader2
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
import { ecoScoreBadge } from "@/lib/eco-score";
import { useDestinations } from "@/hooks/useCatalogQueries";
import PageHero from "@/components/layout/PageHero";

const defaultImage = "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800";

const DestinationsPage = () => {
  const { t } = useTranslation("destinations");
  const [searchParams] = useSearchParams();
  const destinationId = searchParams.get("destination") || undefined;
  const from = searchParams.get("from") || undefined;
  const to = searchParams.get("to") || undefined;
  const travelers = searchParams.get("travelers") || undefined;
  const { data: destinations = [], isLoading: loading } = useDestinations();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("popular");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const detailQuery = (() => {
    const qs = new URLSearchParams();
    if (from) qs.set("from", from);
    if (to) qs.set("to", to);
    if (travelers) qs.set("travelers", travelers);
    const q = qs.toString();
    return q ? `?${q}` : "";
  })();

  const filteredDestinations = destinations
    .filter((dest) => !destinationId || dest.id === destinationId)
    .filter((dest) =>
      dest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dest.country.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "price") return (a.avg_price_per_day || 0) - (b.avg_price_per_day || 0);
      if (sortBy === "carbon") return (a.carbon_score || "Z").localeCompare(b.carbon_score || "Z");
      return (b.rating || 0) - (a.rating || 0);
    });

  return (
    <main className="page-main">
        <PageHero
          eyebrow={t("hero.eyebrow")}
          title={t("hero.title")}
          description={t("hero.description")}
        >
          <div className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder={t("searchPlaceholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 bg-background/80 backdrop-blur-sm"
              />
            </div>
            <Button size="lg" variant="outline" className="h-12">
              <Filter className="w-4 h-4 mr-2" />
              {t("filters")}
            </Button>
          </div>
        </PageHero>

        {/* Filters & Results */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            {loading ? (
              <div className="flex justify-center items-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : destinations.length === 0 ? (
              <div className="text-center py-16">
                <MapPin className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-medium text-foreground">{t("empty.title")}</h3>
                <p className="text-muted-foreground mt-1">{t("empty.subtitle")}</p>
              </div>
            ) : (
            <>
            {/* Toolbar */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <p className="text-muted-foreground">
                <span className="font-medium text-foreground">
                  {t("resultsCount", { count: filteredDestinations.length })}
                </span>
              </p>

              <div className="flex items-center gap-3">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[180px]">
                    <SlidersHorizontal className="w-4 h-4 mr-2" />
                    <SelectValue placeholder={t("sort.placeholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="popular">{t("sort.popular")}</SelectItem>
                    <SelectItem value="price-low">{t("sort.priceLow")}</SelectItem>
                    <SelectItem value="price-high">{t("sort.priceHigh")}</SelectItem>
                    <SelectItem value="carbon">{t("sort.carbon")}</SelectItem>
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
                  <Link to={`/destinations/${destination.id}${detailQuery}`}>
                    <Card className={`group cursor-pointer card-hover overflow-hidden ${
                      viewMode === "list" ? "flex flex-row" : ""
                    }`}>
                      {/* Image */}
                      <div className={`relative overflow-hidden ${
                        viewMode === "list" ? "w-48 h-32" : "aspect-[4/3]"
                      }`}>
                        <img
                          src={destination.image_url || defaultImage}
                          alt={destination.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-foreground/40 via-transparent to-transparent" />
                        
                        {/* Carbon Score Badge */}
                        <div className="absolute top-3 right-3">
                          <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                            ecoScoreBadge(destination.carbon_score || "B")
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
                                <span className="text-sm text-muted-foreground">{t("perDay")}</span>
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
                                <span className="text-sm">{destination.coworking_count} {t("spaces")}</span>
                              </div>
                            </div>

                            {viewMode === "grid" && (
                              <div className="flex items-center gap-1 text-carbon">
                                <Leaf className="w-4 h-4" />
                                <span className="text-xs font-medium">{t("eco")}</span>
                              </div>
                            )}
                          </div>

                          {viewMode === "grid" && (
                            <div className="mt-3 pt-3 border-t border-border">
                              <div className="flex items-center justify-between">
                                <span className="text-lg font-bold text-foreground">
                                  {destination.avg_price_per_day}€
                                </span>
                                <span className="text-sm text-muted-foreground">{t("perDay")}</span>
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

              {filteredDestinations.length === 0 && searchQuery && (
                <div className="text-center py-16">
                  <MapPin className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="text-lg font-medium text-foreground">{t("notFound.title")}</h3>
                  <p className="text-muted-foreground mt-1">{t("notFound.subtitle")}</p>
                </div>
              )}
            </>
            )}
          </div>
        </section>
      </main>
  );
};

export default DestinationsPage;
