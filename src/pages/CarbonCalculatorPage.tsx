import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CarbonCalculator from "@/components/carbon/CarbonCalculator";
import { motion } from "framer-motion";
import { Leaf, TrendingDown, Award, Users } from "lucide-react";

const stats = [
  { value: "45,000+", label: "Tonnes mesurées", icon: Leaf },
  { value: "12,500+", label: "Tonnes compensées", icon: TrendingDown },
  { value: "2,800+", label: "Voyageurs engagés", icon: Users },
  { value: "85+", label: "Actions réalisées", icon: Award },
];

const CarbonCalculatorPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-carbon to-carbon/80 text-carbon-foreground py-16 md:py-24">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center max-w-3xl mx-auto mb-12"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-carbon-foreground/10 text-sm font-medium mb-6">
                <Leaf className="w-4 h-4" />
                Impact environnemental
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                Calculez votre
                <br />
                <span className="text-carbon-saved">empreinte carbone</span>
              </h1>
              <p className="text-lg md:text-xl text-carbon-foreground/80 leading-relaxed">
                Estimez l'impact environnemental de votre prochain séjour en quelques clics. 
                Comprenez, réduisez et compensez vos émissions.
              </p>
            </motion.div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                    className="bg-carbon-foreground/10 backdrop-blur-sm rounded-xl p-4 text-center"
                  >
                    <Icon className="w-6 h-6 mx-auto mb-2 text-carbon-saved" />
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-sm text-carbon-foreground/70">{stat.label}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Calculator Section */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4 max-w-4xl">
            <CarbonCalculator />
          </div>
        </section>

        {/* Info Section */}
        <section className="py-12 md:py-16 bg-muted/30">
          <div className="container mx-auto px-4 max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="grid md:grid-cols-3 gap-6"
            >
              <div className="bg-card rounded-2xl p-6 border border-border">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <Leaf className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Méthodologie transparente</h3>
                <p className="text-sm text-muted-foreground">
                  Nos facteurs d'émission sont basés sur les données de l'ADEME et régulièrement mis à jour.
                </p>
              </div>
              
              <div className="bg-card rounded-2xl p-6 border border-border">
                <div className="w-12 h-12 rounded-xl bg-carbon-saved/10 flex items-center justify-center mb-4">
                  <TrendingDown className="w-6 h-6 text-carbon-saved" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Compensation certifiée</h3>
                <p className="text-sm text-muted-foreground">
                  Nos partenaires sont certifiés et vos dons sont 100% traçables avec reçu fiscal.
                </p>
              </div>
              
              <div className="bg-card rounded-2xl p-6 border border-border">
                <div className="w-12 h-12 rounded-xl bg-carbon-offset/10 flex items-center justify-center mb-4">
                  <Award className="w-6 h-6 text-carbon-offset" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Actions concrètes</h3>
                <p className="text-sm text-muted-foreground">
                  Participez à des actions terrain et gagnez des badges pour votre engagement.
                </p>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default CarbonCalculatorPage;
