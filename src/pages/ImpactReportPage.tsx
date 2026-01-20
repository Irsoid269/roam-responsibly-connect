import { motion } from "framer-motion";
import { Download, TreePine, Users, Globe, TrendingUp, Leaf, BarChart3, PieChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const keyMetrics = [
  { label: "CO₂ compensé", value: "45,280 kg", change: "+156%", icon: TreePine },
  { label: "Voyageurs actifs", value: "2,854", change: "+89%", icon: Users },
  { label: "Destinations", value: "38", change: "+15", icon: Globe },
  { label: "Projets soutenus", value: "12", change: "+4", icon: TrendingUp },
];

const carbonBreakdown = [
  { category: "Reforestation", percentage: 45, amount: "20,376 kg" },
  { category: "Énergie renouvelable", percentage: 30, amount: "13,584 kg" },
  { category: "Conservation marine", percentage: 15, amount: "6,792 kg" },
  { category: "Agriculture durable", percentage: 10, amount: "4,528 kg" },
];

const quarterlyData = [
  { quarter: "Q1 2025", travelers: 450, carbon: 8500, revenue: 125000 },
  { quarter: "Q2 2025", travelers: 680, carbon: 12200, revenue: 198000 },
  { quarter: "Q3 2025", travelers: 820, carbon: 14800, revenue: 267000 },
  { quarter: "Q4 2025", travelers: 904, carbon: 9780, revenue: 310000 },
];

const ImpactReportPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-16">
        {/* Hero */}
        <section className="bg-gradient-to-b from-primary to-primary/80 text-primary-foreground py-16">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center max-w-3xl mx-auto"
            >
              <p className="text-sm font-medium text-primary-foreground/70 mb-2">Rapport annuel</p>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Rapport d'Impact 2025
              </h1>
              <p className="text-lg text-primary-foreground/80 mb-8">
                Transparence totale sur notre impact environnemental et social. 
                Découvrez comment votre communauté contribue à un tourisme plus durable.
              </p>
              <Button size="lg" variant="secondary">
                <Download className="w-4 h-4 mr-2" />
                Télécharger le PDF complet
              </Button>
            </motion.div>
          </div>
        </section>

        {/* Key Metrics */}
        <section className="py-12 -mt-8">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
              {keyMetrics.map((metric, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + index * 0.1 }}
                >
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <metric.icon className="w-8 h-8 mx-auto mb-2 text-primary" />
                      <p className="text-2xl font-bold text-foreground">{metric.value}</p>
                      <p className="text-sm text-muted-foreground">{metric.label}</p>
                      <p className="text-xs text-success mt-1">{metric.change} vs 2024</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Carbon Breakdown */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-4xl mx-auto"
            >
              <div className="grid md:grid-cols-2 gap-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PieChart className="w-5 h-5 text-primary" />
                      Répartition des compensations
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {carbonBreakdown.map((item, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-foreground">{item.category}</span>
                          <span className="text-sm text-muted-foreground">{item.amount}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Progress value={item.percentage} className="flex-1" />
                          <span className="text-sm text-primary font-medium w-10">{item.percentage}%</span>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-primary" />
                      Évolution trimestrielle
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {quarterlyData.map((quarter, index) => (
                        <div key={index} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                          <span className="font-medium text-foreground">{quarter.quarter}</span>
                          <div className="flex items-center gap-6 text-sm">
                            <div className="text-right">
                              <p className="text-foreground font-medium">{quarter.travelers}</p>
                              <p className="text-xs text-muted-foreground">voyageurs</p>
                            </div>
                            <div className="text-right">
                              <p className="text-carbon font-medium">{quarter.carbon} kg</p>
                              <p className="text-xs text-muted-foreground">CO₂</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Highlights */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-4xl mx-auto"
            >
              <h2 className="text-3xl font-bold text-center text-foreground mb-12">
                Faits marquants 2025
              </h2>
              
              <div className="grid md:grid-cols-3 gap-6">
                <Card className="text-center">
                  <CardContent className="pt-6">
                    <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
                      <TreePine className="w-8 h-8 text-success" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-2">8,500 arbres</h3>
                    <p className="text-sm text-muted-foreground">
                      Plantés en Amazonie grâce à vos contributions carbone
                    </p>
                  </CardContent>
                </Card>

                <Card className="text-center">
                  <CardContent className="pt-6">
                    <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                      <Globe className="w-8 h-8 text-accent" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-2">15 nouvelles destinations</h3>
                    <p className="text-sm text-muted-foreground">
                      Ajoutées à notre réseau de partenaires éco-responsables
                    </p>
                  </CardContent>
                </Card>

                <Card className="text-center">
                  <CardContent className="pt-6">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <Users className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-2">98% de satisfaction</h3>
                    <p className="text-sm text-muted-foreground">
                      Taux de recommandation de notre communauté
                    </p>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Goals 2026 */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-3xl mx-auto text-center"
            >
              <h2 className="text-3xl font-bold text-foreground mb-4">Objectifs 2026</h2>
              <p className="text-muted-foreground mb-12">
                Nos engagements pour l'année à venir
              </p>

              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-4xl font-bold text-carbon mb-2">100 tonnes</p>
                    <p className="text-muted-foreground">de CO₂ compensé</p>
                    <Progress value={45} className="mt-4" />
                    <p className="text-xs text-muted-foreground mt-2">45% atteint</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-4xl font-bold text-primary mb-2">5,000</p>
                    <p className="text-muted-foreground">voyageurs actifs</p>
                    <Progress value={57} className="mt-4" />
                    <p className="text-xs text-muted-foreground mt-2">57% atteint</p>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-gradient-to-r from-primary to-accent">
          <div className="container mx-auto px-4 text-center text-primary-foreground">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Leaf className="w-12 h-12 mx-auto mb-4 opacity-80" />
              <h2 className="text-3xl font-bold mb-4">
                Contribuez à notre prochain rapport
              </h2>
              <p className="text-lg opacity-80 mb-8 max-w-xl mx-auto">
                Chaque voyage compte. Rejoignez-nous et participez à l'impact positif.
              </p>
              <Button size="lg" variant="secondary">
                <Download className="w-4 h-4 mr-2" />
                Télécharger le rapport complet
              </Button>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default ImpactReportPage;
