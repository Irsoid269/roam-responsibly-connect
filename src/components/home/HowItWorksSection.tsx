import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { MapPin, Briefcase, TreePine, Sparkles } from "lucide-react";
import { staggerContainer, staggerItem, viewportOnce } from "@/lib/motion";

const stepDefs = [
  { key: "chooseIsland", icon: MapPin, color: "bg-secondary", iconColor: "text-secondary-foreground" },
  { key: "composeStay", icon: Briefcase, color: "bg-primary", iconColor: "text-primary-foreground" },
  { key: "measureImpact", icon: TreePine, color: "bg-carbon", iconColor: "text-carbon-foreground" },
  { key: "enjoyShare", icon: Sparkles, color: "bg-accent", iconColor: "text-accent-foreground" },
] as const;

const HowItWorksSection = () => {
  const { t } = useTranslation("home");
  const steps = stepDefs.map((s) => ({
    ...s,
    title: t(`howItWorks.steps.${s.key}.title`),
    description: t(`howItWorks.steps.${s.key}.description`),
  }));

  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="text-center max-w-2xl mx-auto mb-14"
        >
          <motion.span variants={staggerItem} className="section-eyebrow">
            {t("howItWorks.eyebrow")}
          </motion.span>
          <motion.h2
            variants={staggerItem}
            className="font-display text-3xl md:text-4xl font-medium text-foreground mt-3 mb-4"
          >
            {t("howItWorks.title")}
          </motion.h2>
          <motion.p variants={staggerItem} className="text-muted-foreground text-lg leading-relaxed">
            {t("howItWorks.subtitle")}
          </motion.p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div key={step.title} variants={staggerItem} className="relative group">
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-10 left-[calc(50%+2rem)] w-[calc(100%-4rem)] h-px bg-border" />
                )}

                <div className="text-center">
                  <div className="relative inline-flex mb-6">
                    <div
                      className={`w-20 h-20 rounded-2xl ${step.color} flex items-center justify-center shadow-soft transition-transform duration-500 group-hover:scale-105`}
                    >
                      <Icon className={`w-8 h-8 ${step.iconColor}`} />
                    </div>
                    <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-foreground text-background text-sm font-bold flex items-center justify-center shadow-md">
                      {index + 1}
                    </span>
                  </div>

                  <h3 className="font-display text-xl font-medium text-foreground mb-2">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{step.description}</p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
