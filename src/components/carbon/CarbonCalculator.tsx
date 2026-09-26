import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  Plane, 
  Train, 
  Car, 
  Home, 
  Bike, 
  TreePine, 
  Utensils,
  Mountain,
  Waves,
  Building2,
  Zap,
  Leaf,
  ArrowRight,
  ArrowLeft,
  Calculator,
  RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import CarbonResults from "./CarbonResults";
import CarbonEquivalents from "./CarbonEquivalents";
import CompensationOptions from "./CompensationOptions";
import { useAuth } from "@/hooks/useAuth";
import { useSaveCarbonEstimate } from "@/hooks/useCatalogQueries";
import { useActiveEmissionFactors } from "@/hooks/useEmissionFactors";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

/** Formats a kg/unit factor the way the UI has always shown it (grams below
 * 1 kg, kg above), e.g. 0.255 -> "255g CO₂/km", 21.3 -> "21.3 kgCO₂/nuit". */
function formatFactor(value: number, perUnit?: string): string {
  const suffix = perUnit ? `/${perUnit}` : "";
  if (value < 1) return `${Math.round(value * 1000)}g CO₂${suffix}`;
  return `${value} kgCO₂${suffix}`;
}

// Valeurs de repli si aucun jeu de facteurs n'est encore configuré en admin
// (Facteurs carbone) — au chargement, les valeurs actives en base prennent
// le dessus via useActiveEmissionFactors (cahier §7.7 : facteurs
// paramétrables et versionnés, plus de valeurs figées dans le code).
const DEFAULT_EMISSION_FACTORS = {
  transport: {
    plane: 0.255, // per km per person
    train: 0.014,
    car: 0.193,
    bus: 0.089,
  },
  accommodation: {
    hotel: 21.3, // per night
    apartment: 12.5,
    hostel: 8.2,
    eco_lodge: 5.4,
  },
  mobility: {
    scooter: 0.025, // per km
    bike: 0.006,
    public: 0.089,
    walking: 0,
  },
  activities: {
    restaurant: 3.5, // per meal
    museum: 0.8,
    beach: 0.2,
    hiking: 0.3,
    watersports: 4.2,
    tour: 2.8,
  },
};

type TransportMode = keyof typeof DEFAULT_EMISSION_FACTORS.transport;
type AccommodationType = keyof typeof DEFAULT_EMISSION_FACTORS.accommodation;
type MobilityType = keyof typeof DEFAULT_EMISSION_FACTORS.mobility;
type EmissionFactors = typeof DEFAULT_EMISSION_FACTORS;

interface CalculatorData {
  transport: {
    mode: TransportMode;
    distance: number;
    roundTrip: boolean;
  };
  accommodation: {
    type: AccommodationType;
    nights: number;
  };
  mobility: {
    primary: MobilityType;
    dailyKm: number;
  };
  activities: {
    restaurants: number;
    museums: number;
    outdoorActivities: number;
    watersports: number;
  };
}

const CarbonCalculator = () => {
  const { t } = useTranslation("carbonCalculator");
  const [step, setStep] = useState(1);
  const [showResults, setShowResults] = useState(false);
  const [saved, setSaved] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const saveCarbon = useSaveCarbonEstimate();
  const { data: liveFactors } = useActiveEmissionFactors();

  const EMISSION_FACTORS: EmissionFactors = useMemo(() => {
    const merged = JSON.parse(JSON.stringify(DEFAULT_EMISSION_FACTORS)) as EmissionFactors;
    if (liveFactors?.factors) {
      (Object.keys(merged) as (keyof EmissionFactors)[]).forEach((category) => {
        const liveCategory = liveFactors.factors[category];
        if (!liveCategory) return;
        Object.keys(merged[category]).forEach((key) => {
          const liveValue = liveCategory[key];
          if (typeof liveValue === "number") {
            (merged[category] as Record<string, number>)[key] = liveValue;
          }
        });
      });
    }
    return merged;
  }, [liveFactors]);

  const [data, setData] = useState<CalculatorData>({
    transport: {
      mode: "plane",
      distance: 1500,
      roundTrip: true,
    },
    accommodation: {
      type: "apartment",
      nights: 7,
    },
    mobility: {
      primary: "scooter",
      dailyKm: 15,
    },
    activities: {
      restaurants: 14,
      museums: 3,
      outdoorActivities: 4,
      watersports: 2,
    },
  });

  const carbonResults = useMemo(() => {
    const transportKm = data.transport.roundTrip ? data.transport.distance * 2 : data.transport.distance;
    const transportCO2 = transportKm * EMISSION_FACTORS.transport[data.transport.mode];
    
    const accommodationCO2 = data.accommodation.nights * EMISSION_FACTORS.accommodation[data.accommodation.type];
    
    const mobilityKm = data.mobility.dailyKm * data.accommodation.nights;
    const mobilityCO2 = mobilityKm * EMISSION_FACTORS.mobility[data.mobility.primary];
    
    const activitiesCO2 = 
      data.activities.restaurants * EMISSION_FACTORS.activities.restaurant +
      data.activities.museums * EMISSION_FACTORS.activities.museum +
      data.activities.outdoorActivities * EMISSION_FACTORS.activities.hiking +
      data.activities.watersports * EMISSION_FACTORS.activities.watersports;
    
    const total = transportCO2 + accommodationCO2 + mobilityCO2 + activitiesCO2;
    
    return {
      transport: Math.round(transportCO2),
      accommodation: Math.round(accommodationCO2),
      mobility: Math.round(mobilityCO2),
      activities: Math.round(activitiesCO2),
      total: Math.round(total),
    };
  }, [data, EMISSION_FACTORS]);

  const handleReset = () => {
    setStep(1);
    setShowResults(false);
    setSaved(false);
    setData({
      transport: { mode: "plane", distance: 1500, roundTrip: true },
      accommodation: { type: "apartment", nights: 7 },
      mobility: { primary: "scooter", dailyKm: 15 },
      activities: { restaurants: 14, museums: 3, outdoorActivities: 4, watersports: 2 },
    });
  };

  const handleSaveEstimate = async () => {
    if (!user) {
      toast.error(t("toasts.loginRequired"));
      navigate("/login");
      return;
    }
    try {
      await saveCarbon.mutateAsync({
        userId: user.id,
        transport: carbonResults.transport,
        accommodation: carbonResults.accommodation,
        mobility: carbonResults.mobility,
        activities: carbonResults.activities,
        total: carbonResults.total,
        offsetAmount: 0,
        emissionFactorSetId: liveFactors?.setId ?? null,
      });
      setSaved(true);
      toast.success(t("toasts.saved"));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("toasts.saveError"));
    }
  };

  const steps = [
    { id: 1, title: t("steps.transport"), icon: Plane },
    { id: 2, title: t("steps.accommodation"), icon: Home },
    { id: 3, title: t("steps.mobility"), icon: Bike },
    { id: 4, title: t("steps.activities"), icon: Mountain },
  ];

  if (showResults) {
    return (
      <div className="space-y-8">
        <CarbonResults
          results={carbonResults}
          onReset={handleReset}
          onSave={handleSaveEstimate}
          saving={saveCarbon.isPending}
          saved={saved}
        />
        <CarbonEquivalents totalCO2={carbonResults.total} />
        <CompensationOptions totalCO2={carbonResults.total} />
      </div>
    );
  }

  return (
    <div className="bg-card rounded-3xl shadow-xl border border-border overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-carbon to-carbon/80 text-carbon-foreground p-6 md:p-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-carbon-foreground/10 flex items-center justify-center">
            <Calculator className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">{t("title")}</h2>
            <p className="text-carbon-foreground/70">{t("subtitle")}</p>
          </div>
        </div>
        
        {/* Progress Steps */}
        <div className="flex items-center justify-between mt-6">
          {steps.map((s, index) => {
            const Icon = s.icon;
            const isActive = step === s.id;
            const isCompleted = step > s.id;
            
            return (
              <div key={s.id} className="flex items-center">
                <button
                  onClick={() => setStep(s.id)}
                  className={cn(
                    "flex flex-col items-center gap-2 transition-all",
                    isActive && "scale-110",
                    !isActive && !isCompleted && "opacity-50"
                  )}
                >
                  <div className={cn(
                    "w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center transition-colors",
                    isActive && "bg-carbon-foreground text-carbon",
                    isCompleted && "bg-carbon-saved text-carbon",
                    !isActive && !isCompleted && "bg-carbon-foreground/20"
                  )}>
                    <Icon className="w-5 h-5 md:w-6 md:h-6" />
                  </div>
                  <span className="text-xs md:text-sm font-medium hidden md:block">{s.title}</span>
                </button>
                {index < steps.length - 1 && (
                  <div className={cn(
                    "w-8 md:w-16 h-0.5 mx-2",
                    isCompleted ? "bg-carbon-saved" : "bg-carbon-foreground/20"
                  )} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="p-6 md:p-8">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <TransportStep
              data={data.transport}
              factors={EMISSION_FACTORS.transport}
              onChange={(transport) => setData({ ...data, transport })}
            />
          )}
          {step === 2 && (
            <AccommodationStep
              data={data.accommodation}
              factors={EMISSION_FACTORS.accommodation}
              onChange={(accommodation) => setData({ ...data, accommodation })}
            />
          )}
          {step === 3 && (
            <MobilityStep
              data={data.mobility}
              factors={EMISSION_FACTORS.mobility}
              onChange={(mobility) => setData({ ...data, mobility })}
            />
          )}
          {step === 4 && (
            <ActivitiesStep
              data={data.activities}
              factors={EMISSION_FACTORS.activities}
              onChange={(activities) => setData({ ...data, activities })}
            />
          )}
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
          <Button
            variant="ghost"
            onClick={() => setStep(step - 1)}
            disabled={step === 1}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            {t("previous")}
          </Button>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Leaf className="w-4 h-4 text-carbon-saved" />
            <span>{t("estimatedImpact")} <strong className="text-foreground">{carbonResults.total} kgCO₂e</strong></span>
          </div>

          {step < 4 ? (
            <Button onClick={() => setStep(step + 1)} className="gap-2">
              {t("next")}
              <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button onClick={() => setShowResults(true)} variant="carbon" className="gap-2">
              {t("seeResults")}
              <Zap className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

// Transport Step Component
const TransportStep = ({
  data,
  factors,
  onChange
}: {
  data: CalculatorData["transport"];
  factors: EmissionFactors["transport"];
  onChange: (data: CalculatorData["transport"]) => void;
}) => {
  const { t } = useTranslation("carbonCalculator");
  const transportModes = [
    { id: "plane" as const, label: t("transportModes.plane"), icon: Plane, description: `${formatFactor(factors.plane, "km")}` },
    { id: "train" as const, label: t("transportModes.train"), icon: Train, description: `${formatFactor(factors.train, "km")}` },
    { id: "car" as const, label: t("transportModes.car"), icon: Car, description: `${formatFactor(factors.car, "km")}` },
    { id: "bus" as const, label: t("transportModes.bus"), icon: Building2, description: `${formatFactor(factors.bus, "km")}` },
  ];

  return (
    <motion.div
      key="transport"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div>
        <h3 className="text-xl font-semibold mb-2">{t("transportStep.title")}</h3>
        <p className="text-muted-foreground">{t("transportStep.subtitle")}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {transportModes.map((mode) => {
          const Icon = mode.icon;
          const isSelected = data.mode === mode.id;
          
          return (
            <button
              key={mode.id}
              onClick={() => onChange({ ...data, mode: mode.id })}
              className={cn(
                "p-4 rounded-xl border-2 transition-all text-left",
                isSelected 
                  ? "border-primary bg-primary/5" 
                  : "border-border hover:border-primary/50"
              )}
            >
              <Icon className={cn(
                "w-8 h-8 mb-3",
                isSelected ? "text-primary" : "text-muted-foreground"
              )} />
              <p className="font-medium">{mode.label}</p>
              <p className="text-xs text-muted-foreground">{mode.description}</p>
            </button>
          );
        })}
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">
            {t("transportStep.distance")} : {data.distance} km
          </label>
          <Slider
            value={[data.distance]}
            onValueChange={([value]) => onChange({ ...data, distance: value })}
            min={100}
            max={10000}
            step={100}
            className="py-4"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>100 km</span>
            <span>10 000 km</span>
          </div>
        </div>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={data.roundTrip}
            onChange={(e) => onChange({ ...data, roundTrip: e.target.checked })}
            className="w-5 h-5 rounded border-border text-primary focus:ring-primary"
          />
          <span>{t("transportStep.roundTrip")}</span>
        </label>
      </div>
    </motion.div>
  );
};

// Accommodation Step Component
const AccommodationStep = ({
  data,
  factors,
  onChange
}: {
  data: CalculatorData["accommodation"];
  factors: EmissionFactors["accommodation"];
  onChange: (data: CalculatorData["accommodation"]) => void;
}) => {
  const { t } = useTranslation("carbonCalculator");
  const nightUnit = t("units.night");
  const accommodationTypes = [
    { id: "hotel" as const, label: t("accommodationTypes.hotel"), icon: Building2, description: formatFactor(factors.hotel, nightUnit) },
    { id: "apartment" as const, label: t("accommodationTypes.apartment"), icon: Home, description: formatFactor(factors.apartment, nightUnit) },
    { id: "hostel" as const, label: t("accommodationTypes.hostel"), icon: Home, description: formatFactor(factors.hostel, nightUnit) },
    { id: "eco_lodge" as const, label: t("accommodationTypes.ecoLodge"), icon: TreePine, description: formatFactor(factors.eco_lodge, nightUnit) },
  ];

  return (
    <motion.div
      key="accommodation"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div>
        <h3 className="text-xl font-semibold mb-2">{t("accommodationStep.title")}</h3>
        <p className="text-muted-foreground">{t("accommodationStep.subtitle")}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {accommodationTypes.map((type) => {
          const Icon = type.icon;
          const isSelected = data.type === type.id;
          
          return (
            <button
              key={type.id}
              onClick={() => onChange({ ...data, type: type.id })}
              className={cn(
                "p-4 rounded-xl border-2 transition-all text-left",
                isSelected 
                  ? "border-primary bg-primary/5" 
                  : "border-border hover:border-primary/50"
              )}
            >
              <Icon className={cn(
                "w-8 h-8 mb-3",
                isSelected ? "text-primary" : "text-muted-foreground"
              )} />
              <p className="font-medium">{type.label}</p>
              <p className="text-xs text-muted-foreground">{type.description}</p>
            </button>
          );
        })}
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">
          {t("accommodationStep.nights")} : {data.nights}
        </label>
        <Slider
          value={[data.nights]}
          onValueChange={([value]) => onChange({ ...data, nights: value })}
          min={1}
          max={30}
          step={1}
          className="py-4"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{t("accommodationStep.oneNight")}</span>
          <span>{t("accommodationStep.thirtyNights")}</span>
        </div>
      </div>
    </motion.div>
  );
};

// Mobility Step Component
const MobilityStep = ({
  data,
  factors,
  onChange
}: {
  data: CalculatorData["mobility"];
  factors: EmissionFactors["mobility"];
  onChange: (data: CalculatorData["mobility"]) => void;
}) => {
  const { t } = useTranslation("carbonCalculator");
  const mobilityTypes = [
    { id: "scooter" as const, label: t("mobilityTypes.scooter"), icon: Zap, description: formatFactor(factors.scooter, "km") },
    { id: "bike" as const, label: t("mobilityTypes.bike"), icon: Bike, description: formatFactor(factors.bike, "km") },
    { id: "public" as const, label: t("mobilityTypes.public"), icon: Train, description: formatFactor(factors.public, "km") },
    { id: "walking" as const, label: t("mobilityTypes.walking"), icon: Mountain, description: formatFactor(factors.walking, "km") },
  ];

  return (
    <motion.div
      key="mobility"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div>
        <h3 className="text-xl font-semibold mb-2">{t("mobilityStep.title")}</h3>
        <p className="text-muted-foreground">{t("mobilityStep.subtitle")}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {mobilityTypes.map((type) => {
          const Icon = type.icon;
          const isSelected = data.primary === type.id;
          
          return (
            <button
              key={type.id}
              onClick={() => onChange({ ...data, primary: type.id })}
              className={cn(
                "p-4 rounded-xl border-2 transition-all text-left",
                isSelected 
                  ? "border-primary bg-primary/5" 
                  : "border-border hover:border-primary/50"
              )}
            >
              <Icon className={cn(
                "w-8 h-8 mb-3",
                isSelected ? "text-primary" : "text-muted-foreground"
              )} />
              <p className="font-medium">{type.label}</p>
              <p className="text-xs text-muted-foreground">{type.description}</p>
            </button>
          );
        })}
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">
          {t("mobilityStep.dailyDistance")} : {data.dailyKm} km
        </label>
        <Slider
          value={[data.dailyKm]}
          onValueChange={([value]) => onChange({ ...data, dailyKm: value })}
          min={0}
          max={50}
          step={1}
          className="py-4"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>0 km</span>
          <span>50 km</span>
        </div>
      </div>
    </motion.div>
  );
};

// Activities Step Component
const ActivitiesStep = ({
  data,
  factors,
  onChange
}: {
  data: CalculatorData["activities"];
  factors: EmissionFactors["activities"];
  onChange: (data: CalculatorData["activities"]) => void;
}) => {
  const { t } = useTranslation("carbonCalculator");
  const activities = [
    { key: "restaurants" as const, label: t("activityTypes.restaurants"), icon: Utensils, unit: t("units.meals"), factor: formatFactor(factors.restaurant) },
    { key: "museums" as const, label: t("activityTypes.museums"), icon: Building2, unit: t("units.visits"), factor: formatFactor(factors.museum) },
    { key: "outdoorActivities" as const, label: t("activityTypes.outdoor"), icon: Mountain, unit: t("units.outings"), factor: formatFactor(factors.hiking) },
    { key: "watersports" as const, label: t("activityTypes.watersports"), icon: Waves, unit: t("units.sessions"), factor: formatFactor(factors.watersports) },
  ];

  return (
    <motion.div
      key="activities"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div>
        <h3 className="text-xl font-semibold mb-2">{t("activitiesStep.title")}</h3>
        <p className="text-muted-foreground">{t("activitiesStep.subtitle")}</p>
      </div>

      <div className="space-y-6">
        {activities.map((activity) => {
          const Icon = activity.icon;
          const value = data[activity.key];
          
          return (
            <div key={activity.key} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                    <Icon className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium">{activity.label}</p>
                    <p className="text-xs text-muted-foreground">{t("activitiesStep.perUnit", { factor: activity.factor, unit: activity.unit.slice(0, -1) })}</p>
                  </div>
                </div>
                <span className="font-semibold text-lg">{value} {activity.unit}</span>
              </div>
              <Slider
                value={[value]}
                onValueChange={([v]) => onChange({ ...data, [activity.key]: v })}
                min={0}
                max={activity.key === "restaurants" ? 30 : 15}
                step={1}
                className="py-2"
              />
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default CarbonCalculator;
