import { motion } from "framer-motion";
import { MapPin, Briefcase, Bike, TreePine, Sparkles } from "lucide-react";

const steps = [
  {
    icon: MapPin,
    title: "Choisissez votre île",
    description: "Explorez les îles des Comores et trouvez l'endroit parfait pour votre prochain séjour de travail.",
    color: "bg-secondary",
    iconColor: "text-secondary-foreground",
  },
  {
    icon: Briefcase,
    title: "Composez votre séjour",
    description: "Hébergement, espace coworking, mobilité douce, activités locales — tout dans un seul panier.",
    color: "bg-primary",
    iconColor: "text-primary-foreground",
  },
  {
    icon: TreePine,
    title: "Mesurez votre impact",
    description: "Consultez votre empreinte carbone estimée et comparez les options pour voyager plus responsable.",
    color: "bg-carbon",
    iconColor: "text-carbon-foreground",
  },
  {
    icon: Sparkles,
    title: "Profitez & partagez",
    description: "Vivez votre expérience, rencontrez la communauté, et partagez vos découvertes.",
    color: "bg-accent",
    iconColor: "text-accent-foreground",
  },
];

const HowItWorksSection = () => {
  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-primary font-medium text-sm uppercase tracking-wider"
          >
            Comment ça marche
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-4xl font-bold text-foreground mt-2 mb-4"
          >
            Votre séjour en 4 étapes
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground text-lg"
          >
            De la recherche à la réservation, tout est pensé pour simplifier 
            l'organisation de votre comworkation aux Comores.
          </motion.p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-10 left-[calc(50%+2rem)] w-[calc(100%-4rem)] h-0.5 bg-border" />
                )}

                <div className="text-center">
                  {/* Step Number */}
                  <div className="relative inline-flex mb-6">
                    <div className={`w-20 h-20 rounded-2xl ${step.color} flex items-center justify-center shadow-soft`}>
                      <Icon className={`w-8 h-8 ${step.iconColor}`} />
                    </div>
                    <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-foreground text-background text-sm font-bold flex items-center justify-center shadow-md">
                      {index + 1}
                    </span>
                  </div>

                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
