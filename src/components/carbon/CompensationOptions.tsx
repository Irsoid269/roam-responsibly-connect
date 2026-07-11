import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Heart, 
  TreePine, 
  HandHeart, 
  CheckCircle2, 
  ArrowRight,
  Leaf,
  Globe,
  Users,
  Calendar,
  MapPin,
  Award
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import EcoScoreLegend from "@/components/carbon/EcoScoreLegend";
import { ecoScoreFromKg } from "@/lib/eco-score";

interface CompensationOptionsProps {
  totalCO2: number;
}

const CompensationOptions = ({ totalCO2 }: CompensationOptionsProps) => {
  const [selectedTab, setSelectedTab] = useState<"donation" | "action">("donation");
  const [selectedAssociation, setSelectedAssociation] = useState<number | null>(null);
  const [selectedAction, setSelectedAction] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState<number>(0);

  // Calculate suggested donation (approximately €25 per tonne of CO2)
  const suggestedAmount = Math.round((totalCO2 / 1000) * 25);
  const defaultAmount = Math.max(suggestedAmount, 5);

  const associations = [
    {
      id: 1,
      name: "Reforest'Action",
      description: "Plantation d'arbres en France et dans le monde",
      logo: "🌳",
      impact: "1 arbre planté = 25kg CO₂ absorbés/an",
      verified: true
    },
    {
      id: 2,
      name: "Sea Shepherd",
      description: "Protection des océans et de la vie marine",
      logo: "🐋",
      impact: "Protection directe des écosystèmes marins",
      verified: true
    },
    {
      id: 3,
      name: "Surfrider Foundation",
      description: "Protection du littoral et des océans",
      logo: "🌊",
      impact: "Nettoyage des plages et sensibilisation",
      verified: true
    },
    {
      id: 4,
      name: "WWF France",
      description: "Protection de la biodiversité mondiale",
      logo: "🐼",
      impact: "Conservation des espèces menacées",
      verified: true
    }
  ];

  const actions = [
    {
      id: 1,
      title: "Plantation d'arbres",
      location: "Grande Comore, Comores",
      date: "15-16 Février 2025",
      description: "Rejoignez notre groupe pour planter 200 arbres autour de Moroni et Itsandra",
      participants: 12,
      maxParticipants: 20,
      co2Impact: 50,
      image: "🌲"
    },
    {
      id: 2,
      title: "Nettoyage de plage",
      location: "Itsandra, Grande Comore",
      date: "22 Février 2025",
      description: "Journée de nettoyage de la plage avec l'association locale Comores Bleues",
      participants: 8,
      maxParticipants: 30,
      co2Impact: 15,
      image: "🏖️"
    },
    {
      id: 3,
      title: "Restauration mangrove",
      location: "Mohéli, Comores",
      date: "1-2 Mars 2025",
      description: "Plantation de mangroves dans la zone protégée de Mohéli",
      participants: 15,
      maxParticipants: 25,
      co2Impact: 80,
      image: "🌴"
    },
    {
      id: 4,
      title: "Atelier compostage",
      location: "Mutsamudu, Anjouan",
      date: "8 Mars 2025",
      description: "Apprenez à composter et créez votre composteur avec des matériaux recyclés",
      participants: 5,
      maxParticipants: 15,
      co2Impact: 20,
      image: "♻️"
    }
  ];

  const donationAmounts = [5, 10, 20, 50];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-card rounded-3xl shadow-xl border border-border overflow-hidden"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-carbon-saved/20 to-carbon-offset/20 p-6 md:p-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-carbon-saved/20 flex items-center justify-center">
            <Leaf className="w-6 h-6 text-carbon-saved" />
          </div>
          <div>
            <h3 className="font-display text-2xl font-medium">Compensez votre impact</h3>
            <p className="text-muted-foreground">Choisissez votre mode de compensation · Amani Resorts</p>
          </div>
        </div>

        <div className="mb-4">
          <EcoScoreLegend />
          <p className="mt-2 text-xs text-muted-foreground">
            Empreinte estimée : {totalCO2} kgCO₂e · Score {ecoScoreFromKg(totalCO2).grade}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 bg-background/50 rounded-xl p-1">
          <button
            onClick={() => setSelectedTab("donation")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all",
              selectedTab === "donation" 
                ? "bg-card shadow-sm text-foreground" 
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Heart className="w-4 h-4" />
            Don à une association
          </button>
          <button
            onClick={() => setSelectedTab("action")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all",
              selectedTab === "action" 
                ? "bg-card shadow-sm text-foreground" 
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <HandHeart className="w-4 h-4" />
            Action terrain
          </button>
        </div>
      </div>

      <div className="p-6 md:p-8">
        <AnimatePresence mode="wait">
          {selectedTab === "donation" ? (
            <motion.div
              key="donation"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {/* Suggested Amount */}
              <div className="bg-carbon-saved/10 rounded-xl p-4 border border-carbon-saved/20">
                <div className="flex items-center gap-2 mb-2">
                  <TreePine className="w-5 h-5 text-carbon-saved" />
                  <span className="font-medium">Compensation suggérée</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Pour compenser {totalCO2} kgCO₂e, nous vous suggérons un don de 
                  <strong className="text-foreground"> {defaultAmount}€</strong>
                </p>
              </div>

              {/* Amount Selection */}
              <div>
                <label className="text-sm font-medium mb-3 block">Montant du don</label>
                <div className="grid grid-cols-4 gap-2 mb-3">
                  {donationAmounts.map((amount) => (
                    <button
                      key={amount}
                      onClick={() => setCustomAmount(amount)}
                      className={cn(
                        "py-3 rounded-lg font-medium transition-all",
                        customAmount === amount
                          ? "bg-carbon-saved text-carbon-foreground"
                          : "bg-muted hover:bg-muted/80"
                      )}
                    >
                      {amount}€
                    </button>
                  ))}
                </div>
                <div className="relative">
                  <input
                    type="number"
                    value={customAmount || ""}
                    onChange={(e) => setCustomAmount(Number(e.target.value))}
                    placeholder="Montant personnalisé"
                    className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-carbon-saved/50"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">€</span>
                </div>
              </div>

              {/* Associations */}
              <div>
                <label className="text-sm font-medium mb-3 block">Choisir une association</label>
                <div className="grid md:grid-cols-2 gap-3">
                  {associations.map((assoc) => (
                    <button
                      key={assoc.id}
                      onClick={() => setSelectedAssociation(assoc.id)}
                      className={cn(
                        "p-4 rounded-xl border-2 text-left transition-all",
                        selectedAssociation === assoc.id
                          ? "border-carbon-saved bg-carbon-saved/5"
                          : "border-border hover:border-carbon-saved/50"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-3xl">{assoc.logo}</span>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{assoc.name}</span>
                            {assoc.verified && (
                              <CheckCircle2 className="w-4 h-4 text-carbon-saved" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{assoc.description}</p>
                          <p className="text-xs text-carbon-saved mt-2">{assoc.impact}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <Button 
                variant="carbon" 
                size="lg" 
                className="w-full gap-2"
                disabled={!selectedAssociation || customAmount <= 0}
              >
                <Heart className="w-5 h-5" />
                Faire un don de {customAmount || defaultAmount}€
                <ArrowRight className="w-4 h-4" />
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                Paiement sécurisé · Reçu fiscal Amani Resorts envoyé par email.
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="action"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {/* Info */}
              <div className="bg-carbon-offset/10 rounded-xl p-4 border border-carbon-offset/20">
                <div className="flex items-center gap-2 mb-2">
                  <HandHeart className="w-5 h-5 text-carbon-offset" />
                  <span className="font-medium">Agir concrètement</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Participez à une action terrain près de votre destination et gagnez des badges !
                </p>
              </div>

              {/* Actions List */}
              <div className="space-y-4">
                {actions.map((action) => (
                  <button
                    key={action.id}
                    onClick={() => setSelectedAction(action.id)}
                    className={cn(
                      "w-full p-4 rounded-xl border-2 text-left transition-all",
                      selectedAction === action.id
                        ? "border-carbon-offset bg-carbon-offset/5"
                        : "border-border hover:border-carbon-offset/50"
                    )}
                  >
                    <div className="flex gap-4">
                      <span className="text-4xl">{action.image}</span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold">{action.title}</h4>
                          <span className="text-xs font-medium px-2 py-1 rounded-full bg-carbon-saved/10 text-carbon-saved">
                            -{action.co2Impact} kgCO₂
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{action.description}</p>
                        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {action.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {action.date}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {action.participants}/{action.maxParticipants} participants
                          </span>
                        </div>
                        {/* Progress bar */}
                        <div className="mt-3 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-carbon-offset rounded-full"
                            style={{ width: `${(action.participants / action.maxParticipants) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* CTA */}
              <Button 
                variant="warm" 
                size="lg" 
                className="w-full gap-2"
                disabled={!selectedAction}
              >
                <HandHeart className="w-5 h-5" />
                S'inscrire à l'action
                <ArrowRight className="w-4 h-4" />
              </Button>

              {/* Badges Preview */}
              <div className="bg-muted/30 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Award className="w-5 h-5 text-primary" />
                  <span className="font-medium text-sm">Badges à débloquer</span>
                </div>
                <div className="flex gap-3">
                  {["🌱 Premier pas", "🌳 Eco-warrior", "🌍 Globetrotter vert"].map((badge, i) => (
                    <span 
                      key={i}
                      className="text-xs px-3 py-1.5 rounded-full bg-background border border-border"
                    >
                      {badge}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default CompensationOptions;
