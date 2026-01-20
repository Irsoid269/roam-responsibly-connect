import { motion } from "framer-motion";
import { Building, Laptop, Leaf, Users, Check, ArrowRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const partnerTypes = [
  {
    icon: Building,
    title: "Hébergements",
    description: "Hôtels, éco-lodges, coliving, appartements",
    benefits: ["Visibilité auprès de voyageurs responsables", "Badge éco-responsable vérifié", "Revenus récurrents"],
  },
  {
    icon: Laptop,
    title: "Espaces de coworking",
    description: "Coworkings, cafés travail, hubs créatifs",
    benefits: ["Accès à une communauté internationale", "Réservations garanties", "Marketing inclus"],
  },
  {
    icon: Leaf,
    title: "Activités & Expériences",
    description: "Tours, ateliers, sports, culture",
    benefits: ["Certification éco-tourisme", "Plateforme de réservation", "Avis voyageurs"],
  },
];

const requirements = [
  "Engagement environnemental démontrable",
  "Certification ou label écologique (recommandé)",
  "Politique de réduction des déchets",
  "Utilisation d'énergies renouvelables",
  "Soutien aux communautés locales",
  "Transparence sur les pratiques",
];

const stats = [
  { value: "2,850+", label: "Voyageurs actifs" },
  { value: "35+", label: "Destinations" },
  { value: "4.8/5", label: "Note moyenne" },
  { value: "89%", label: "Taux de retour" },
];

const BecomePartnerPage = () => {
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
              <Badge variant="outline" className="mb-4 bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground">
                <Users className="w-3 h-3 mr-1" />
                Rejoignez notre réseau
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Devenir partenaire
              </h1>
              <p className="text-lg text-primary-foreground/80 mb-8">
                Rejoignez une communauté de voyageurs responsables et développez votre activité 
                tout en contribuant à un tourisme plus durable.
              </p>
              <div className="flex justify-center gap-4">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center px-4">
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-sm text-primary-foreground/70">{stat.label}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Partner Types */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Types de partenariats
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Quel que soit votre secteur, nous avons une solution adaptée à vos besoins.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {partnerTypes.map((type, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="h-full card-hover">
                    <CardHeader>
                      <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                        <type.icon className="w-7 h-7 text-primary" />
                      </div>
                      <CardTitle>{type.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">{type.description}</p>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {type.benefits.map((benefit, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm">
                            <Check className="w-4 h-4 text-success" />
                            {benefit}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Requirements */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-3xl font-bold text-foreground mb-4">
                  Nos critères de sélection
                </h2>
                <p className="text-muted-foreground mb-6">
                  Pour garantir une expérience de qualité à notre communauté, 
                  nous sélectionnons nos partenaires selon des critères stricts de durabilité.
                </p>
                <ul className="space-y-3">
                  {requirements.map((req, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-4 h-4 text-primary" />
                      </div>
                      <span className="text-foreground">{req}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Postuler maintenant</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Remplissez ce formulaire et nous vous recontacterons sous 48h.
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-1 block">Prénom</label>
                        <Input placeholder="Jean" />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1 block">Nom</label>
                        <Input placeholder="Dupont" />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Email professionnel</label>
                      <Input type="email" placeholder="jean@monentreprise.com" />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Nom de l'établissement</label>
                      <Input placeholder="Eco Lodge Lisbonne" />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Type de partenariat</label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="accommodation">Hébergement</SelectItem>
                          <SelectItem value="coworking">Espace de coworking</SelectItem>
                          <SelectItem value="activity">Activité / Expérience</SelectItem>
                          <SelectItem value="mobility">Service de mobilité</SelectItem>
                          <SelectItem value="other">Autre</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Message</label>
                      <Textarea 
                        placeholder="Présentez brièvement votre établissement et vos engagements environnementaux..."
                        rows={4}
                      />
                    </div>
                    <Button className="w-full" size="lg">
                      Envoyer ma candidature
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Testimonial */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-3xl mx-auto text-center"
            >
              <div className="flex justify-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-warning fill-warning" />
                ))}
              </div>
              <blockquote className="text-xl text-foreground mb-6 italic">
                "Rejoindre Coworkation a transformé notre activité. Nous avons vu une augmentation 
                de 40% de nos réservations, avec des clients vraiment alignés avec nos valeurs."
              </blockquote>
              <div>
                <p className="font-semibold text-foreground">Maria Santos</p>
                <p className="text-sm text-muted-foreground">Fondatrice, Eco Hub Lisbonne</p>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default BecomePartnerPage;
