import { motion } from "framer-motion";
import { TreePine, Globe, Heart, Award, ExternalLink, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Link } from "react-router-dom";

const carbonPartners = [
  {
    name: "Amazon Reforestation Initiative",
    type: "Reforestation",
    location: "Brésil",
    description: "Projet de reforestation de la forêt amazonienne avec des espèces natives et soutien aux communautés locales.",
    impact: "10,000 arbres plantés",
    progress: 78,
    image: "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=800",
    certified: true,
  },
  {
    name: "Mangrove Protection Program",
    type: "Conservation",
    location: "Indonésie",
    description: "Protection et restauration des écosystèmes de mangroves, puits de carbone essentiels.",
    impact: "500 hectares protégés",
    progress: 92,
    image: "https://images.unsplash.com/photo-1559827291-72ee739d0d9a?w=800",
    certified: true,
  },
  {
    name: "Solar Village Project",
    type: "Énergie renouvelable",
    location: "Kenya",
    description: "Installation de panneaux solaires dans des villages ruraux pour un accès à l'électricité propre.",
    impact: "25 villages équipés",
    progress: 45,
    image: "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800",
    certified: true,
  },
];

const accommodationPartners = [
  { name: "Green Hotels Portugal", location: "Portugal", certifications: ["Green Key", "EU Ecolabel"] },
  { name: "Eco Lodges Bali", location: "Indonésie", certifications: ["Green Globe", "GSTC"] },
  { name: "Sustainable Stays Barcelona", location: "Espagne", certifications: ["B Corp", "Biosphere"] },
  { name: "Cape Town Eco Residences", location: "Afrique du Sud", certifications: ["Fair Trade Tourism"] },
];

const coworkingPartners = [
  { name: "Impact Hub", locations: 100, specialty: "Innovation sociale" },
  { name: "Selina", locations: 40, specialty: "Coliving & Coworking" },
  { name: "Dojo Bali", locations: 1, specialty: "Coworking écologique" },
  { name: "Second Home", locations: 8, specialty: "Design durable" },
];

const PartnersPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-16">
        {/* Hero */}
        <section className="bg-gradient-to-b from-carbon to-carbon/80 text-carbon-foreground py-16">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center max-w-3xl mx-auto"
            >
              <Badge variant="outline" className="mb-4 bg-carbon-foreground/10 border-carbon-foreground/20 text-carbon-foreground">
                <Heart className="w-3 h-3 mr-1" />
                Partenariats vérifiés
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Nos partenaires
              </h1>
              <p className="text-lg text-carbon-foreground/80">
                Nous collaborons avec des organisations certifiées pour garantir 
                l'impact positif de vos contributions et la qualité de vos séjours.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Carbon Partners */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Projets de compensation carbone
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                100% de vos contributions carbone financent ces projets certifiés à travers le monde.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6">
              {carbonPartners.map((partner, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="overflow-hidden card-hover h-full">
                    <div className="relative aspect-video">
                      <img
                        src={partner.image}
                        alt={partner.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
                      {partner.certified && (
                        <Badge className="absolute top-3 right-3 bg-success text-success-foreground">
                          <Award className="w-3 h-3 mr-1" />
                          Certifié
                        </Badge>
                      )}
                      <Badge className="absolute top-3 left-3 bg-background/90 text-foreground">
                        {partner.type}
                      </Badge>
                    </div>
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-foreground">{partner.name}</h3>
                        <span className="text-xs text-muted-foreground">{partner.location}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">{partner.description}</p>
                      
                      <div className="mb-4">
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="text-carbon font-medium">{partner.impact}</span>
                          <span className="text-muted-foreground">{partner.progress}%</span>
                        </div>
                        <Progress value={partner.progress} className="h-2" />
                      </div>

                      <Button variant="outline" size="sm" className="w-full">
                        En savoir plus
                        <ExternalLink className="w-3 h-3 ml-2" />
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Accommodation Partners */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Hébergements partenaires
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Des établissements sélectionnés pour leur engagement environnemental.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
              {accommodationPartners.map((partner, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="h-full">
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-foreground mb-1">{partner.name}</h3>
                      <p className="text-sm text-muted-foreground mb-3">{partner.location}</p>
                      <div className="flex flex-wrap gap-1">
                        {partner.certifications.map((cert, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {cert}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Coworking Partners */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Réseaux de coworking
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Accédez à un réseau mondial d'espaces de travail partagés de qualité.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
              {coworkingPartners.map((partner, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="h-full text-center">
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-foreground mb-2">{partner.name}</h3>
                      <p className="text-2xl font-bold text-primary mb-1">{partner.locations}</p>
                      <p className="text-xs text-muted-foreground mb-2">espaces</p>
                      <Badge variant="outline" className="text-xs">
                        {partner.specialty}
                      </Badge>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Leaf className="w-12 h-12 mx-auto mb-4 text-primary" />
              <h2 className="text-2xl font-bold text-foreground mb-3">
                Devenir partenaire
              </h2>
              <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
                Vous êtes un hébergement éco-responsable, un espace de coworking ou une organisation environnementale ?
              </p>
              <Link to="/become-partner">
                <Button size="lg">
                  Rejoindre notre réseau
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

export default PartnersPage;
