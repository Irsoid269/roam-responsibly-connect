import { motion } from "framer-motion";
import { Leaf, Heart, Globe, Users, Target, TrendingUp, Award, TreePine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Link } from "react-router-dom";

const values = [
  {
    icon: Leaf,
    title: "Durabilité",
    description: "Chaque décision est guidée par son impact environnemental. Nous privilégions systématiquement les solutions les plus écologiques.",
  },
  {
    icon: Heart,
    title: "Authenticité",
    description: "Nous favorisons les expériences locales authentiques et le soutien aux communautés qui nous accueillent.",
  },
  {
    icon: Users,
    title: "Communauté",
    description: "Nous croyons en la force du collectif. Ensemble, nous avons un impact bien plus grand.",
  },
  {
    icon: Target,
    title: "Transparence",
    description: "Nos méthodes de calcul sont ouvertes, nos partenaires sont vérifiés, nos actions sont traçables.",
  },
];

const milestones = [
  { year: "2024", event: "Création de Coworkation", description: "Lancement de la plateforme avec 5 destinations pilotes" },
  { year: "2024", event: "Premier partenariat carbone", description: "Collaboration avec une ONG de reforestation au Brésil" },
  { year: "2025", event: "1000 voyageurs", description: "Cap symbolique franchi avec une communauté engagée" },
  { year: "2025", event: "Certification B Corp", description: "Reconnaissance de notre engagement social et environnemental" },
  { year: "2026", event: "Expansion internationale", description: "Ouverture de 50 nouvelles destinations sur 4 continents" },
];

const team = [
  {
    name: "Antoine Durand",
    role: "CEO & Co-fondateur",
    bio: "Ancien consultant McKinsey, passionné de voyage responsable",
  },
  {
    name: "Léa Martin",
    role: "CTO & Co-fondatrice",
    bio: "Ex-ingénieure Google, spécialiste des technologies durables",
  },
  {
    name: "Pierre Leclerc",
    role: "Head of Impact",
    bio: "Docteur en sciences environnementales, expert carbone",
  },
  {
    name: "Julie Rousseau",
    role: "Head of Community",
    bio: "10 ans d'expérience en community building",
  },
];

const MissionPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-16">
        {/* Hero */}
        <section className="bg-gradient-to-b from-primary to-primary/80 text-primary-foreground py-20">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center max-w-3xl mx-auto"
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                Réinventer le voyage
                <br />
                <span className="text-primary-glow">pour la planète</span>
              </h1>
              <p className="text-xl text-primary-foreground/80 leading-relaxed">
                Notre mission : permettre à chacun de travailler et voyager librement, 
                tout en contribuant positivement à l'environnement et aux communautés locales.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-12 -mt-8">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
              {[
                { value: "45 tonnes", label: "CO₂ compensé", icon: TreePine },
                { value: "2,850+", label: "Voyageurs", icon: Users },
                { value: "35+", label: "Destinations", icon: Globe },
                { value: "12", label: "Projets soutenus", icon: Award },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                >
                  <Card className="text-center">
                    <CardContent className="pt-6">
                      <stat.icon className="w-8 h-8 mx-auto mb-2 text-primary" />
                      <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold text-foreground mb-4">Nos valeurs</h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Ces principes guident chacune de nos décisions et façonnent l'expérience que nous offrons.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="h-full text-center card-hover">
                    <CardContent className="pt-6">
                      <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                        <value.icon className="w-7 h-7 text-primary" />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">{value.title}</h3>
                      <p className="text-sm text-muted-foreground">{value.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Timeline */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold text-foreground mb-4">Notre histoire</h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                De l'idée à la réalité, voici les étapes clés de notre aventure.
              </p>
            </motion.div>

            <div className="max-w-3xl mx-auto">
              {milestones.map((milestone, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex gap-4 mb-8"
                >
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                      {milestone.year}
                    </div>
                    {index < milestones.length - 1 && (
                      <div className="w-0.5 flex-1 bg-border mt-2" />
                    )}
                  </div>
                  <div className="pt-2 pb-4">
                    <h3 className="font-semibold text-foreground mb-1">{milestone.event}</h3>
                    <p className="text-sm text-muted-foreground">{milestone.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold text-foreground mb-4">L'équipe</h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Des passionnés engagés pour construire le voyage de demain.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
              {team.map((member, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="text-center card-hover">
                    <CardContent className="pt-6">
                      <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl font-bold text-primary">
                          {member.name.split(" ").map(n => n[0]).join("")}
                        </span>
                      </div>
                      <h3 className="font-semibold text-foreground">{member.name}</h3>
                      <p className="text-sm text-primary mb-2">{member.role}</p>
                      <p className="text-xs text-muted-foreground">{member.bio}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
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
              <Globe className="w-12 h-12 mx-auto mb-4 opacity-80" />
              <h2 className="text-3xl font-bold mb-4">
                Rejoignez le mouvement
              </h2>
              <p className="text-lg opacity-80 mb-8 max-w-xl mx-auto">
                Ensemble, redéfinissons ce que signifie voyager de manière responsable.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/destinations">
                  <Button size="lg" variant="secondary">
                    Explorer les destinations
                  </Button>
                </Link>
                <Link to="/community">
                  <Button size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                    Rejoindre la communauté
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default MissionPage;
