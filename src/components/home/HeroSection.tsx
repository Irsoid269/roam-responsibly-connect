import { useState } from "react";
import { motion } from "framer-motion";
import { Search, MapPin, Calendar, Users, ChevronDown, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-coworking.jpg";

const HeroSection = () => {
  const [activeTab, setActiveTab] = useState<"sejour" | "coworking" | "experience">("sejour");

  return (
    <section className="relative min-h-[90vh] flex items-center">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt="Espace de coworking avec vue océan"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-foreground/40 via-foreground/20 to-foreground/60" />
      </div>

      {/* Content */}
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
            Votre prochain séjour de
            <br />
            <span className="text-primary-glow">coworkation</span> vous attend
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

        {/* Search Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="max-w-4xl mx-auto"
        >
          <div className="glass-strong rounded-2xl p-2 shadow-elevated">
            {/* Tabs */}
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

            {/* Search Fields */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2 p-2">
              {/* Destination */}
              <div className="relative">
                <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors cursor-pointer group">
                  <MapPin className="w-5 h-5 text-primary shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground">Destination</p>
                    <p className="text-sm font-medium text-foreground truncate">Lisbonne, Portugal</p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                </div>
              </div>

              {/* Dates */}
              <div className="relative">
                <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors cursor-pointer group">
                  <Calendar className="w-5 h-5 text-primary shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground">Dates</p>
                    <p className="text-sm font-medium text-foreground truncate">15 - 30 Jan</p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                </div>
              </div>

              {/* Voyageurs */}
              <div className="relative">
                <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors cursor-pointer group">
                  <Users className="w-5 h-5 text-primary shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground">Voyageurs</p>
                    <p className="text-sm font-medium text-foreground truncate">2 personnes</p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                </div>
              </div>

              {/* Search Button */}
              <Button variant="hero" size="lg" className="h-full min-h-[72px]">
                <Search className="w-5 h-5" />
                <span>Rechercher</span>
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10 mt-8 text-primary-foreground/80">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-primary-foreground">150+</span>
              <span className="text-sm">Destinations</span>
            </div>
            <div className="hidden md:block w-px h-6 bg-primary-foreground/20" />
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-primary-foreground">2,400+</span>
              <span className="text-sm">Espaces coworking</span>
            </div>
            <div className="hidden md:block w-px h-6 bg-primary-foreground/20" />
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-primary-foreground">12,000+</span>
              <span className="text-sm">Coworkateurs heureux</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
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
