import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, MapPin, Calendar, Users, ChevronDown, Leaf, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import heroImage from "@/assets/hero-coworking.jpg";
import { useHeroDestinations, useCatalogCounts } from "@/hooks/useCatalogQueries";

type HeroDestination = {
  id: string;
  name: string;
  city?: string;
  country: string;
};

const HeroSection = () => {
  const navigate = useNavigate();
  const { data: destinations = [], isLoading: destLoading } = useHeroDestinations();
  const { data: counts } = useCatalogCounts();

  const [activeTab, setActiveTab] = useState<"sejour" | "coworking" | "experience">("sejour");
  const [selectedDestination, setSelectedDestination] = useState<HeroDestination | null>(null);
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
    return "Choisir les dates";
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
              Voyagez. Travaillez. Préservez.
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-6 leading-tight"
          >
            Votre prochain séjour
            <br />
            <span className="text-primary-glow">Amani</span> aux Comores vous attend
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-primary-foreground/80 mb-8 max-w-2xl mx-auto"
          >
            Combinez travail à distance, hébergement, mobilité douce et activités locales
            — tout en mesurant et réduisant votre empreinte carbone.
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
                { id: "sejour", label: "Séjour complet" },
                { id: "coworking", label: "Coworking seul" },
                { id: "experience", label: "Expériences" },
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
              <Popover open={destinationOpen} onOpenChange={setDestinationOpen}>
                <PopoverTrigger asChild>
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors cursor-pointer group">
                    <MapPin className="w-5 h-5 text-primary shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground">Destination</p>
                      <p className="text-sm font-medium text-foreground truncate">
                        {selectedDestination
                          ? `${selectedDestination.name}, ${selectedDestination.country}`
                          : "Où allez-vous ?"}
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
                      Aucune destination disponible. Ajoutez-en depuis l&apos;admin.
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

              <Popover>
                <PopoverTrigger asChild>
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors cursor-pointer group">
                    <Calendar className="w-5 h-5 text-primary shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground">Dates</p>
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
                      <p className="text-xs text-muted-foreground">Voyageurs</p>
                      <p className="text-sm font-medium text-foreground truncate">
                        {travelers} personne{travelers > 1 ? "s" : ""}
                      </p>
                    </div>
                    <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </div>
                </PopoverTrigger>
                <PopoverContent className="w-48 p-3" align="start">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Voyageurs</span>
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
                <span>Rechercher</span>
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10 mt-8 text-primary-foreground/80">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-primary-foreground">
                {counts?.destinations ?? "—"}
              </span>
              <span className="text-sm">Destinations</span>
            </div>
            <div className="hidden md:block w-px h-6 bg-primary-foreground/20" />
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-primary-foreground">
                {counts?.coworkings ?? "—"}
              </span>
              <span className="text-sm">Espaces coworking</span>
            </div>
            <div className="hidden md:block w-px h-6 bg-primary-foreground/20" />
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-primary-foreground">
                {counts?.travelers ?? "—"}
              </span>
              <span className="text-sm">Voyageurs Amani</span>
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
