import { motion } from "framer-motion";
import { Award, MapPin, Leaf, Users, Star, Instagram, Linkedin, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const ambassadors = [
  {
    id: "1",
    name: "Sophie Martin",
    title: "Digital Nomad & Consultante RSE",
    location: "Paris → Monde",
    bio: "Passionnée par le voyage responsable et l'entrepreneuriat durable. Je partage mes découvertes de destinations éco-friendly à travers le monde.",
    avatar: "",
    carbonSaved: 850,
    countries: 28,
    followers: "15K",
    specialties: ["Voyages longs", "Éco-tourisme", "Conseil RSE"],
    social: { instagram: "#", linkedin: "#", website: "#" },
  },
  {
    id: "2",
    name: "Thomas Dubois",
    title: "Développeur & Photographe nature",
    location: "Lyon → Asie du Sud-Est",
    bio: "Je combine code et photographie pour documenter les merveilles naturelles tout en travaillant en remote. Spécialiste des destinations asiatiques.",
    avatar: "",
    carbonSaved: 620,
    countries: 15,
    followers: "8K",
    specialties: ["Tech", "Photographie", "Asie"],
    social: { instagram: "#", linkedin: "#", website: "#" },
  },
  {
    id: "3",
    name: "Marie Chen",
    title: "Content Creator & Minimaliste",
    location: "Bordeaux → Amérique Latine",
    bio: "Adepte du slow travel et du minimalisme, je voyage avec un seul sac à dos en privilégiant les transports terrestres.",
    avatar: "",
    carbonSaved: 980,
    countries: 22,
    followers: "25K",
    specialties: ["Slow travel", "Minimalisme", "Amérique Latine"],
    social: { instagram: "#", linkedin: "#", website: "#" },
  },
  {
    id: "4",
    name: "Lucas Bernard",
    title: "Remote PM & Aventurier",
    location: "Toulouse → Afrique",
    bio: "Project Manager en remote qui explore le continent africain. Passionné par les initiatives locales de développement durable.",
    avatar: "",
    carbonSaved: 540,
    countries: 12,
    followers: "5K",
    specialties: ["Afrique", "Impact social", "Management"],
    social: { instagram: "#", linkedin: "#", website: "#" },
  },
];

const benefits = [
  "Accès prioritaire aux nouvelles destinations",
  "Séjours offerts dans notre réseau partenaire",
  "Badge ambassadeur vérifié sur votre profil",
  "Invitations aux événements exclusifs",
  "Commission sur les réservations recommandées",
  "Équipement et goodies Coworkation",
];

const AmbassadorsPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-16">
        {/* Hero */}
        <section className="bg-gradient-to-b from-primary-light to-background py-16">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center max-w-3xl mx-auto"
            >
              <Badge variant="outline" className="mb-4 bg-primary/10 border-primary/20">
                <Award className="w-3 h-3 mr-1" />
                Programme Ambassadeurs
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                Nos Ambassadeurs
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                Rencontrez les voyageurs passionnés qui incarnent les valeurs de Coworkation 
                et inspirent notre communauté au quotidien.
              </p>
              <Button size="lg">
                Devenir ambassadeur
              </Button>
            </motion.div>
          </div>
        </section>

        {/* Ambassadors Grid */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-8">
              {ambassadors.map((ambassador, index) => (
                <motion.div
                  key={ambassador.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="overflow-hidden card-hover">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4 mb-4">
                        <Avatar className="w-20 h-20">
                          <AvatarImage src={ambassador.avatar} />
                          <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                            {ambassador.name.split(" ").map(n => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-xl font-semibold text-foreground">
                              {ambassador.name}
                            </h3>
                            <Badge className="bg-primary/10 text-primary border-0">
                              <Award className="w-3 h-3 mr-1" />
                              Ambassadeur
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-1">{ambassador.title}</p>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {ambassador.location}
                          </p>
                        </div>
                      </div>

                      <p className="text-muted-foreground mb-4">{ambassador.bio}</p>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {ambassador.specialties.map((specialty, i) => (
                          <Badge key={i} variant="secondary">
                            {specialty}
                          </Badge>
                        ))}
                      </div>

                      <div className="grid grid-cols-3 gap-4 py-4 border-t border-b border-border mb-4">
                        <div className="text-center">
                          <p className="text-xl font-bold text-carbon flex items-center justify-center gap-1">
                            <Leaf className="w-4 h-4" />
                            {ambassador.carbonSaved}
                          </p>
                          <p className="text-xs text-muted-foreground">kg CO₂ économisé</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xl font-bold text-foreground">{ambassador.countries}</p>
                          <p className="text-xs text-muted-foreground">pays visités</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xl font-bold text-foreground">{ambassador.followers}</p>
                          <p className="text-xs text-muted-foreground">followers</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex gap-2">
                          <a href={ambassador.social.instagram} className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors">
                            <Instagram className="w-4 h-4" />
                          </a>
                          <a href={ambassador.social.linkedin} className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors">
                            <Linkedin className="w-4 h-4" />
                          </a>
                          <a href={ambassador.social.website} className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors">
                            <Globe className="w-4 h-4" />
                          </a>
                        </div>
                        <Button variant="outline" size="sm">
                          Voir le profil
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-4xl mx-auto"
            >
              <h2 className="text-3xl font-bold text-center text-foreground mb-4">
                Avantages du programme
              </h2>
              <p className="text-center text-muted-foreground mb-12 max-w-xl mx-auto">
                En devenant ambassadeur, vous bénéficiez d'avantages exclusifs tout en contribuant à promouvoir le voyage responsable.
              </p>

              <div className="grid md:grid-cols-2 gap-4">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-3 p-4 bg-background rounded-xl"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Star className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-foreground">{benefit}</span>
                  </motion.div>
                ))}
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
              <Award className="w-12 h-12 mx-auto mb-4 opacity-80" />
              <h2 className="text-3xl font-bold mb-4">
                Rejoignez le programme
              </h2>
              <p className="text-lg opacity-80 mb-8 max-w-xl mx-auto">
                Vous êtes un voyageur engagé avec une communauté active ? 
                Postulez pour devenir ambassadeur Coworkation.
              </p>
              <Button size="lg" variant="secondary">
                Postuler maintenant
              </Button>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default AmbassadorsPage;
