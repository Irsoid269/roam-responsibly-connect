import { motion } from "framer-motion";
import { Leaf, TrendingDown, Heart, Trees, Award, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const impactStats = [
  { value: "45,000", label: "Tonnes CO₂ mesurées", icon: Leaf },
  { value: "12,500", label: "Tonnes compensées", icon: TrendingDown },
  { value: "€85,000", label: "Dons aux associations", icon: Heart },
  { value: "8,400", label: "Arbres plantés", icon: Trees },
];

const CarbonImpactSection = () => {
  return (
    <section className="py-16 md:py-24 bg-carbon text-carbon-foreground relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-carbon-foreground/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-carbon-foreground/20 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-carbon-foreground/10 text-sm font-medium mb-6"
            >
              <Award className="w-4 h-4" />
              Notre engagement climat
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight"
            >
              Voyagez en conscience,
              <br />
              <span className="text-carbon-saved">compensez avec impact</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-lg text-carbon-foreground/80 mb-8 leading-relaxed"
            >
              Chaque séjour génère une empreinte carbone. Nous la calculons automatiquement 
              et vous proposons des moyens concrets de la réduire ou de la compenser — 
              par des dons à des associations ou des actions terrain.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap gap-4"
            >
              <Button 
                variant="secondary" 
                size="lg" 
                className="bg-carbon-foreground text-carbon hover:bg-carbon-foreground/90"
              >
                Calculer mon impact
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="border-carbon-foreground/30 text-carbon-foreground hover:bg-carbon-foreground/10"
              >
                Découvrir nos partenaires
              </Button>
            </motion.div>
          </div>

          {/* Right - Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            {impactStats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-carbon-foreground/10 backdrop-blur-sm rounded-2xl p-6 text-center hover:bg-carbon-foreground/15 transition-colors"
                >
                  <div className="w-12 h-12 rounded-xl bg-carbon-foreground/10 flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-6 h-6" />
                  </div>
                  <p className="text-2xl md:text-3xl font-bold mb-1">{stat.value}</p>
                  <p className="text-sm text-carbon-foreground/70">{stat.label}</p>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Carbon Score Visual */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-16 bg-carbon-foreground/10 backdrop-blur-sm rounded-2xl p-6 md:p-8"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-semibold mb-2">Score carbone de votre dernier séjour</h3>
              <p className="text-carbon-foreground/70">Lisbonne, 15 jours - Janvier 2025</p>
            </div>

            <div className="flex items-center gap-8">
              {/* Carbon Breakdown */}
              <div className="flex-1 grid grid-cols-4 gap-3">
                {[
                  { label: "Transport", value: 45, color: "bg-secondary" },
                  { label: "Hébergement", value: 25, color: "bg-primary-glow" },
                  { label: "Mobilité", value: 15, color: "bg-accent" },
                  { label: "Activités", value: 15, color: "bg-carbon-offset" },
                ].map((item, idx) => (
                  <div key={idx} className="text-center">
                    <div className="h-20 flex items-end justify-center mb-2">
                      <div 
                        className={`w-8 ${item.color} rounded-t-lg transition-all`}
                        style={{ height: `${item.value}%` }}
                      />
                    </div>
                    <p className="text-xs text-carbon-foreground/60">{item.label}</p>
                    <p className="text-sm font-medium">{item.value}%</p>
                  </div>
                ))}
              </div>

              {/* Total Score */}
              <div className="text-center px-6 py-4 bg-carbon-saved/20 rounded-xl">
                <p className="text-4xl font-bold text-carbon-saved">B+</p>
                <p className="text-sm text-carbon-foreground/70 mt-1">Score global</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CarbonImpactSection;
