import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const CTASection = () => {
  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl bg-primary p-8 md:p-12 lg:p-16"
        >
          {/* Background decorations */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-primary-glow/30 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-60 h-60 bg-accent/20 rounded-full blur-3xl" />

          <div className="relative z-10 max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-foreground/10 text-primary-foreground text-sm font-medium mb-6"
            >
              <Sparkles className="w-4 h-4" />
              Prêt pour l'aventure ?
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground mb-6 leading-tight"
            >
              Planifiez votre premier
              <br />
              séjour de coworkation
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-lg text-primary-foreground/80 mb-8 max-w-xl mx-auto"
            >
              Rejoignez une communauté de plus de 12 000 professionnels qui ont choisi 
              de travailler autrement, en harmonie avec la planète.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button 
                size="xl" 
                className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 shadow-lg"
              >
                Commencer gratuitement
                <ArrowRight className="w-5 h-5" />
              </Button>
              <Button 
                variant="hero-outline" 
                size="xl"
              >
                Voir une démo
              </Button>
            </motion.div>

            {/* Trust badges */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap items-center justify-center gap-6 mt-10 text-primary-foreground/60 text-sm"
            >
              <span>✓ Inscription gratuite</span>
              <span>✓ Annulation flexible</span>
              <span>✓ Support 24/7</span>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
