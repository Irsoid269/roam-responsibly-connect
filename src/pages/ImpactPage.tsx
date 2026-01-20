import { motion } from "framer-motion";
import { 
  Leaf, TreePine, Globe, TrendingDown, Users, Award,
  Target, Heart, Plane, Building, Bike
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Link } from "react-router-dom";

const impactStats = [
  { icon: TreePine, label: "CO₂ compensé", value: "45,000 kg", growth: "+23%" },
  { icon: Users, label: "Voyageurs engagés", value: "2,850+", growth: "+45%" },
  { icon: Globe, label: "Projets soutenus", value: "12", growth: "+3" },
  { icon: Award, label: "Arbres plantés", value: "8,500", growth: "+1,200" },
];

const compensationProjects = [
  {
    name: "Reforestation Amazonie",
    location: "Brésil",
    progress: 78,
    target: "10,000 arbres",
    image: "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=800",
  },
  {
    name: "Protection Mangroves",
    location: "Indonésie",
    progress: 92,
    target: "500 hectares",
    image: "https://images.unsplash.com/photo-1559827291-72ee739d0d9a?w=800",
  },
  {
    name: "Énergie Solaire Villages",
    location: "Kenya",
    progress: 45,
    target: "25 villages",
    image: "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800",
  },
];

const emissionBreakdown = [
  { category: "Transport aérien", icon: Plane, percentage: 65, color: "bg-destructive" },
  { category: "Hébergement", icon: Building, percentage: 20, color: "bg-warning" },
  { category: "Mobilité locale", icon: Bike, percentage: 10, color: "bg-primary" },
  { category: "Activités", icon: Heart, percentage: 5, color: "bg-success" },
];

const ImpactPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-16">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-carbon to-carbon/80 text-carbon-foreground py-16 md:py-24">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center max-w-3xl mx-auto"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-carbon-foreground/10 text-sm font-medium mb-6">
                <Leaf className="w-4 h-4" />
                Notre engagement
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                Notre impact
                <br />
                <span className="text-carbon-saved">environnemental</span>
              </h1>
              <p className="text-lg md:text-xl text-carbon-foreground/80 leading-relaxed mb-8">
                Ensemble, nous construisons un tourisme plus responsable. 
                Découvrez comment votre communauté contribue à un avenir durable.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/carbon-calculator">
                  <Button size="lg" variant="secondary">
                    <Target className="w-4 h-4 mr-2" />
                    Calculer mon impact
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="border-carbon-foreground/30 text-carbon-foreground hover:bg-carbon-foreground/10">
                  En savoir plus
                </Button>
              </div>
            </motion.div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mt-12">
              {impactStats.map((stat, index) => {
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
                    <p className="text-xs text-carbon-saved mt-1">{stat.growth}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Emission Breakdown */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-4xl mx-auto"
            >
              <h2 className="text-3xl font-bold text-center mb-4">
                Comprendre les émissions du voyage
              </h2>
              <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
                Voici comment se répartissent en moyenne les émissions carbone d'un séjour de coworkation.
              </p>

              <div className="grid md:grid-cols-2 gap-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Répartition des émissions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {emissionBreakdown.map((item, index) => {
                      const Icon = item.icon;
                      return (
                        <div key={index} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Icon className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm font-medium">{item.category}</span>
                            </div>
                            <span className="text-sm text-muted-foreground">{item.percentage}%</span>
                          </div>
                          <Progress value={item.percentage} className={item.color} />
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>

                <Card className="bg-primary/5 border-primary/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingDown className="w-5 h-5 text-primary" />
                      Comment réduire ?
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs font-bold text-primary">1</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          <strong className="text-foreground">Privilégiez le train</strong> pour les trajets &lt; 1000km - 
                          jusqu'à 90% d'émissions en moins
                        </p>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs font-bold text-primary">2</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          <strong className="text-foreground">Restez plus longtemps</strong> - un séjour de 3 mois 
                          émet 3x moins qu'un aller-retour mensuel
                        </p>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs font-bold text-primary">3</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          <strong className="text-foreground">Choisissez des hébergements éco-certifiés</strong> avec 
                          énergie renouvelable
                        </p>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs font-bold text-primary">4</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          <strong className="text-foreground">Mobilité douce sur place</strong> - vélo, marche, 
                          transports en commun
                        </p>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Compensation Projects */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold text-center mb-4">
                Projets de compensation
              </h2>
              <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
                Vos contributions financent des projets environnementaux certifiés à travers le monde.
              </p>

              <div className="grid md:grid-cols-3 gap-6">
                {compensationProjects.map((project, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="overflow-hidden card-hover">
                      <div className="relative aspect-video">
                        <img
                          src={project.image}
                          alt={project.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
                        <div className="absolute bottom-3 left-3 text-background">
                          <p className="font-semibold">{project.name}</p>
                          <p className="text-sm opacity-80">{project.location}</p>
                        </div>
                      </div>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-muted-foreground">Objectif: {project.target}</span>
                          <span className="text-sm font-medium text-primary">{project.progress}%</span>
                        </div>
                        <Progress value={project.progress} className="h-2" />
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              <div className="text-center mt-8">
                <Link to="/partners">
                  <Button variant="outline">
                    Voir tous nos partenaires
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-r from-primary to-accent rounded-3xl p-8 md:p-12 text-center text-primary-foreground"
            >
              <Leaf className="w-12 h-12 mx-auto mb-4 opacity-80" />
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Calculez votre empreinte
              </h2>
              <p className="text-lg opacity-80 mb-8 max-w-xl mx-auto">
                Estimez l'impact de votre prochain voyage et découvrez comment le réduire.
              </p>
              <Link to="/carbon-calculator">
                <Button size="lg" variant="secondary">
                  Accéder au calculateur
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default ImpactPage;
