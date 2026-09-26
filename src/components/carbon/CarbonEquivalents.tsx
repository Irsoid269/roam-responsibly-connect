import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  Car, 
  Smartphone, 
  TreePine, 
  Beef, 
  Tv, 
  ShowerHead,
  Lightbulb,
  Shirt
} from "lucide-react";

interface CarbonEquivalentsProps {
  totalCO2: number;
}

const CarbonEquivalents = ({ totalCO2 }: CarbonEquivalentsProps) => {
  const { t } = useTranslation("carbonCalculator");
  // Conversion factors (approximate)
  const equivalents = [
    {
      icon: Car,
      value: Math.round(totalCO2 / 0.21), // ~0.21 kg CO2 per km average car
      unit: t("equivalents.car.unit"),
      label: t("equivalents.car.label"),
      color: "bg-secondary/10 text-secondary"
    },
    {
      icon: Smartphone,
      value: Math.round(totalCO2 / 0.08), // ~0.08 kg CO2 per full charge
      unit: t("equivalents.phone.unit"),
      label: t("equivalents.phone.label"),
      color: "bg-primary/10 text-primary"
    },
    {
      icon: TreePine,
      value: Math.round(totalCO2 / 22), // A tree absorbs ~22 kg CO2/year
      unit: t("equivalents.trees.unit"),
      label: t("equivalents.trees.label"),
      color: "bg-carbon-saved/10 text-carbon-saved"
    },
    {
      icon: Beef,
      value: Math.round(totalCO2 / 27), // ~27 kg CO2 per kg of beef
      unit: t("equivalents.beef.unit"),
      label: t("equivalents.beef.label"),
      color: "bg-secondary/10 text-secondary"
    },
    {
      icon: Tv,
      value: Math.round(totalCO2 / 0.097), // ~0.097 kg CO2 per hour of streaming
      unit: t("equivalents.streaming.unit"),
      label: t("equivalents.streaming.label"),
      color: "bg-accent/10 text-accent"
    },
    {
      icon: ShowerHead,
      value: Math.round(totalCO2 / 0.42), // ~0.42 kg CO2 per 10 min shower
      unit: t("equivalents.shower.unit"),
      label: t("equivalents.shower.label"),
      color: "bg-primary-glow/10 text-primary-glow"
    },
    {
      icon: Lightbulb,
      value: Math.round(totalCO2 / 0.0045), // ~0.0045 kg CO2 per hour LED bulb
      unit: t("equivalents.bulb.unit"),
      label: t("equivalents.bulb.label"),
      color: "bg-warning/15 text-warning"
    },
    {
      icon: Shirt,
      value: Math.round(totalCO2 / 5.5), // ~5.5 kg CO2 per t-shirt
      unit: t("equivalents.tshirt.unit"),
      label: t("equivalents.tshirt.label"),
      color: "bg-carbon-offset/10 text-carbon-offset"
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-card rounded-3xl shadow-xl border border-border p-6 md:p-8"
    >
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-2">{t("equivalents.title")}</h3>
        <p className="text-muted-foreground">
          {t("equivalents.subtitle", { total: totalCO2 })}
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {equivalents.map((equiv, index) => {
          const Icon = equiv.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + index * 0.05 }}
              className="bg-muted/30 rounded-xl p-4 text-center hover:bg-muted/50 transition-colors"
            >
              <div className={`w-12 h-12 rounded-xl ${equiv.color} flex items-center justify-center mx-auto mb-3`}>
                <Icon className="w-6 h-6" />
              </div>
              <p className="text-2xl font-bold mb-1">
                {equiv.value.toLocaleString()}
              </p>
              <p className="text-sm font-medium text-foreground">{equiv.unit}</p>
              <p className="text-xs text-muted-foreground">{equiv.label}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Fun Fact */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-6 p-4 bg-carbon/10 rounded-xl border border-carbon/20"
      >
        <p className="text-sm text-center">
          💡 <span className="font-medium">{t("equivalents.funFactTitle")}</span> {t("equivalents.funFactBody")}
          <strong> {t("equivalents.funFactAverage")}</strong>. {t("equivalents.funFactMiddle")}
          <strong> {((totalCO2 / 9900) * 100).toFixed(1)}%</strong> {t("equivalents.funFactEnd")}
        </p>
      </motion.div>
    </motion.div>
  );
};

export default CarbonEquivalents;
