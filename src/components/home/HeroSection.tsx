import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  Search, MapPin, Calendar, Users, ChevronDown, Leaf, Loader2,
  Utensils, Mountain, Waves, Compass, Sparkles, Laptop,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import heroImage from "@/assets/hero-coworking.jpg";
import { useHeroDestinations, useCatalogCounts, useUniverses, useCoworkings } from "@/hooks/useCatalogQueries";

type HeroDestination = {
  id: string;
  name: string;
  city?: string;
  country: string;
};

type Universe = {
  id: string;
  name: string;
  color: string | null;
};

type HeroCoworkingSpace = {
  id: string;
  name: string;
  address: string | null;
  destination_id: string | null;
};

// Mêmes 4 "univers" que la page Activités (table `universes`) — icônes
// assignées localement, la donnée source n'en fournit pas.
const universeIcons: Record<string, typeof Sparkles> = {
  "gastronomie-savoir-faire": Utensils,
  "decouverte-terrestre": Mountain,
  "mer-faune-marine": Waves,
  "evasion-immersion": Compass,
};

const HeroSection = () => {
  const { t } = useTranslation("home");
  const navigate = useNavigate();
  const { data: destinations = [], isLoading: destLoading } = useHeroDestinations();
  const { data: counts } = useCatalogCounts();
  const { data: universes = [], isLoading: universesLoading } = useUniverses();
  const { data: coworkingSpaces = [], isLoading: coworkingsLoading } = useCoworkings();

  const [activeTab, setActiveTab] = useState<"sejour" | "coworking" | "experience">("sejour");
  const [selectedDestination, setSelectedDestination] = useState<HeroDestination | null>(null);
  const [selectedUniverse, setSelectedUniverse] = useState<Universe | null>(null);
  const [selectedCoworkingSpace, setSelectedCoworkingSpace] = useState<HeroCoworkingSpace | null>(null);
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  });
  const [travelers, setTravelers] = useState(2);
  const [destinationOpen, setDestinationOpen] = useState(false);
  const [travelersOpen, setTravelersOpen] = useState(false);

  const handleSearch = () => {
    const params = new URLSearchParams();

    if (selectedDestination) {
      params.set("destination", selectedDestination.id);
    }
    if (activeTab === "experience" && selectedUniverse) {
      params.set("universe", selectedUniverse.id);
    }
    if (dateRange.from) {
      params.set("from", dateRange.from.toISOString());
    }
    if (dateRange.to) {
      params.set("to", dateRange.to.toISOString());
    }
    params.set("travelers", travelers.toString());
    params.set("type", activeTab);

    // Séjour + destination choisie → composer directement le panier avec les dates
    if (activeTab === "sejour" && selectedDestination) {
      navigate(`/booking/${selectedDestination.id}?${params.toString()}`);
      return;
    }

    // Coworking + espace choisi → composer directement le panier de sa destination
    if (activeTab === "coworking" && selectedCoworkingSpace?.destination_id) {
      navigate(`/booking/${selectedCoworkingSpace.destination_id}?${params.toString()}`);
      return;
    }

    if (activeTab === "coworking") {
      navigate(`/coworkings?${params.toString()}`);
    } else if (activeTab === "experience") {
      navigate(`/activities?${params.toString()}`);
    } else {
      navigate(`/destinations?${params.toString()}`);
    }
  };

  const formatDateRange = () => {
    if (dateRange.from && dateRange.to) {
      return `${format(dateRange.from, "d MMM", { locale: fr })} - ${format(dateRange.to, "d MMM", { locale: fr })}`;
    }
    if (dateRange.from) {
      return format(dateRange.from, "d MMM", { locale: fr });
    }
    return t("hero.datesPlaceholder");
  };

  return (
    <section className="relative min-h-[90vh] flex items-center">
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt="Espace de coworking avec vue océan"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-foreground/40 via-foreground/20 to-foreground/60" />
      </div>

      <div className="relative z-10 container mx-auto px-4 pt-24 pb-16">
        <div className="max-w-4xl mx-auto text-center mb-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 backdrop-blur-sm text-primary-foreground text-sm font-medium mb-6">
              <Leaf className="w-4 h-4" />
              {t("hero.badge")}
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-6 leading-tight"
          >
            {t("hero.titleLine1")}
            <br />
            <span className="text-primary-glow">Amani</span> {t("hero.titleSuffix")}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-primary-foreground/80 mb-8 max-w-2xl mx-auto"
          >
            {t("hero.subtitle")}
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="max-w-4xl mx-auto"
        >
          <div className="glass-strong rounded-2xl p-2 shadow-elevated">
            <div className="flex gap-1 mb-2 p-1">
              {[
                { id: "sejour", label: t("hero.tabs.stay") },
                { id: "coworking", label: t("hero.tabs.coworking") },
                { id: "experience", label: t("hero.tabs.experience") },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-2 p-2">
              {activeTab === "experience" ? (
                <Popover open={destinationOpen} onOpenChange={setDestinationOpen}>
                  <PopoverTrigger asChild>
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors cursor-pointer group">
                      <Sparkles className="w-5 h-5 text-primary shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground">{t("hero.universeLabel")}</p>
                        <p className="text-sm font-medium text-foreground truncate">
                          {selectedUniverse ? selectedUniverse.name : t("hero.universePlaceholder")}
                        </p>
                      </div>
                      <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                    </div>
                  </PopoverTrigger>
                  <PopoverContent className="w-72 p-2" align="start">
                    {universesLoading ? (
                      <div className="flex justify-center py-6">
                        <Loader2 className="w-5 h-5 animate-spin text-primary" />
                      </div>
                    ) : (
                      <div className="space-y-1 max-h-64 overflow-y-auto">
                        <button
                          onClick={() => {
                            setSelectedUniverse(null);
                            setDestinationOpen(false);
                          }}
                          className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                            selectedUniverse === null ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                          }`}
                        >
                          <Sparkles className="w-4 h-4 shrink-0" />
                          <p className="font-medium">{t("hero.allUniverses")}</p>
                        </button>
                        {universes.map((universe) => {
                          const Icon = universeIcons[universe.id] || Sparkles;
                          return (
                            <button
                              key={universe.id}
                              onClick={() => {
                                setSelectedUniverse(universe);
                                setDestinationOpen(false);
                              }}
                              className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                                selectedUniverse?.id === universe.id
                                  ? "bg-primary text-primary-foreground"
                                  : "hover:bg-muted"
                              }`}
                            >
                              <Icon className="w-4 h-4 shrink-0" />
                              <p className="font-medium">{universe.name}</p>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </PopoverContent>
                </Popover>
              ) : activeTab === "coworking" ? (
                <Popover open={destinationOpen} onOpenChange={setDestinationOpen}>
                  <PopoverTrigger asChild>
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors cursor-pointer group">
                      <Laptop className="w-5 h-5 text-primary shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground">{t("hero.coworkingLabel")}</p>
                        <p className="text-sm font-medium text-foreground truncate">
                          {selectedCoworkingSpace ? selectedCoworkingSpace.name : t("hero.coworkingPlaceholder")}
                        </p>
                      </div>
                      <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                    </div>
                  </PopoverTrigger>
                  <PopoverContent className="w-72 p-2" align="start">
                    {coworkingsLoading ? (
                      <div className="flex justify-center py-6">
                        <Loader2 className="w-5 h-5 animate-spin text-primary" />
                      </div>
                    ) : coworkingSpaces.length === 0 ? (
                      <p className="p-3 text-sm text-muted-foreground text-center">
                        {t("hero.noCoworkings")}
                      </p>
                    ) : (
                      <div className="space-y-1 max-h-64 overflow-y-auto">
                        {coworkingSpaces.map((space) => (
                          <button
                            key={space.id}
                            onClick={() => {
                              setSelectedCoworkingSpace(space);
                              setDestinationOpen(false);
                            }}
                            className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                              selectedCoworkingSpace?.id === space.id
                                ? "bg-primary text-primary-foreground"
                                : "hover:bg-muted"
                            }`}
                          >
                            <Laptop className="w-4 h-4 shrink-0" />
                            <div>
                              <p className="font-medium">{space.name}</p>
                              {space.address && (
                                <p
                                  className={`text-xs ${
                                    selectedCoworkingSpace?.id === space.id
                                      ? "text-primary-foreground/80"
                                      : "text-muted-foreground"
                                  }`}
                                >
                                  {space.address}
                                </p>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </PopoverContent>
                </Popover>
              ) : (
                <Popover open={destinationOpen} onOpenChange={setDestinationOpen}>
                  <PopoverTrigger asChild>
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors cursor-pointer group">
                      <MapPin className="w-5 h-5 text-primary shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground">{t("hero.destinationLabel")}</p>
                        <p className="text-sm font-medium text-foreground truncate">
                          {selectedDestination
                            ? `${selectedDestination.name}, ${selectedDestination.country}`
                            : t("hero.destinationPlaceholder")}
                        </p>
                      </div>
                      <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                    </div>
                  </PopoverTrigger>
                  <PopoverContent className="w-72 p-2" align="start">
                    {destLoading ? (
                      <div className="flex justify-center py-6">
                        <Loader2 className="w-5 h-5 animate-spin text-primary" />
                      </div>
                    ) : destinations.length === 0 ? (
                      <p className="p-3 text-sm text-muted-foreground text-center">
                        {t("hero.noDestinations")}
                      </p>
                    ) : (
                      <div className="space-y-1 max-h-64 overflow-y-auto">
                        {destinations.map((dest) => (
                          <button
                            key={dest.id}
                            onClick={() => {
                              setSelectedDestination(dest);
                              setDestinationOpen(false);
                            }}
                            className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                              selectedDestination?.id === dest.id
                                ? "bg-primary text-primary-foreground"
                                : "hover:bg-muted"
                            }`}
                          >
                            <MapPin className="w-4 h-4 shrink-0" />
                            <div>
                              <p className="font-medium">{dest.name}</p>
                              <p
                                className={`text-xs ${
                                  selectedDestination?.id === dest.id
                                    ? "text-primary-foreground/80"
                                    : "text-muted-foreground"
                                }`}
                              >
                                {dest.city ? `${dest.city} · ` : ""}
                                {dest.country}
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </PopoverContent>
                </Popover>
              )}

              <Popover>
                <PopoverTrigger asChild>
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors cursor-pointer group">
                    <Calendar className="w-5 h-5 text-primary shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground">{t("hero.datesLabel")}</p>
                      <p className="text-sm font-medium text-foreground truncate">
                        {formatDateRange()}
                      </p>
                    </div>
                    <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </div>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="range"
                    selected={{ from: dateRange.from, to: dateRange.to }}
                    onSelect={(range) => setDateRange({ from: range?.from, to: range?.to })}
                    numberOfMonths={2}
                    disabled={(date) => date < new Date()}
                    locale={fr}
                  />
                </PopoverContent>
              </Popover>

              <Popover open={travelersOpen} onOpenChange={setTravelersOpen}>
                <PopoverTrigger asChild>
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors cursor-pointer group">
                    <Users className="w-5 h-5 text-primary shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground">
                        {activeTab === "coworking" ? t("hero.positionsLabel") : t("hero.travelersLabel")}
                      </p>
                      <p className="text-sm font-medium text-foreground truncate">
                        {activeTab === "coworking"
                          ? t("hero.position", { count: travelers })
                          : t("hero.traveler", { count: travelers })}
                      </p>
                    </div>
                    <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </div>
                </PopoverTrigger>
                <PopoverContent className="w-48 p-3" align="start">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {activeTab === "coworking" ? t("hero.positionsLabel") : t("hero.travelersLabel")}
                    </span>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setTravelers(Math.max(1, travelers - 1))}
                        className="w-8 h-8 rounded-full bg-muted hover:bg-muted-foreground/20 flex items-center justify-center transition-colors"
                        disabled={travelers <= 1}
                      >
                        -
                      </button>
                      <span className="w-6 text-center font-medium">{travelers}</span>
                      <button
                        onClick={() => setTravelers(Math.min(10, travelers + 1))}
                        className="w-8 h-8 rounded-full bg-muted hover:bg-muted-foreground/20 flex items-center justify-center transition-colors"
                        disabled={travelers >= 10}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>

              <Button
                variant="hero"
                size="lg"
                className="h-full min-h-[72px]"
                onClick={handleSearch}
              >
                <Search className="w-5 h-5" />
                <span>{activeTab === "experience" ? t("hero.explore") : t("hero.search")}</span>
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10 mt-8 text-primary-foreground/80">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-primary-foreground">
                {counts?.destinations ?? "—"}
              </span>
              <span className="text-sm">{t("hero.stats.destinations")}</span>
            </div>
            <div className="hidden md:block w-px h-6 bg-primary-foreground/20" />
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-primary-foreground">
                {counts?.coworkings ?? "—"}
              </span>
              <span className="text-sm">{t("hero.stats.coworkings")}</span>
            </div>
            <div className="hidden md:block w-px h-6 bg-primary-foreground/20" />
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-primary-foreground">
                {counts?.travelers ?? "—"}
              </span>
              <span className="text-sm">{t("hero.stats.travelers")}</span>
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
      >
        <div className="animate-bounce-gentle">
          <div className="w-6 h-10 rounded-full border-2 border-primary-foreground/30 flex items-start justify-center p-2">
            <div className="w-1.5 h-2.5 bg-primary-foreground/50 rounded-full" />
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
