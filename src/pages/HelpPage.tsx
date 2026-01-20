import { useState } from "react";
import { motion } from "framer-motion";
import { Search, HelpCircle, BookOpen, MessageCircle, Mail, Phone, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Link } from "react-router-dom";

const categories = [
  { icon: BookOpen, title: "Réservations", description: "Gérer vos réservations et paiements", count: 12 },
  { icon: HelpCircle, title: "Compte", description: "Paramètres et profil utilisateur", count: 8 },
  { icon: MessageCircle, title: "Communauté", description: "Forum, événements et networking", count: 6 },
];

const popularArticles = [
  { title: "Comment annuler ma réservation ?", category: "Réservations" },
  { title: "Comprendre le calcul carbone", category: "Impact" },
  { title: "Modifier mes informations personnelles", category: "Compte" },
  { title: "Rejoindre la communauté", category: "Communauté" },
  { title: "Devenir ambassadeur", category: "Ambassadeurs" },
  { title: "Obtenir un reçu fiscal", category: "Paiements" },
];

const faqs = [
  {
    question: "Comment fonctionne la compensation carbone ?",
    answer: "Lorsque vous réservez un séjour, nous calculons automatiquement l'empreinte carbone associée (transport, hébergement, activités). Vous pouvez ensuite choisir de compenser tout ou partie de ces émissions en finançant des projets environnementaux certifiés.",
  },
  {
    question: "Puis-je annuler ma réservation ?",
    answer: "Oui, vous pouvez annuler votre réservation depuis votre espace personnel. Les conditions d'annulation varient selon les partenaires. Consultez les conditions spécifiques lors de votre réservation pour connaître les délais et éventuels frais.",
  },
  {
    question: "Comment contacter un espace de coworking directement ?",
    answer: "Une fois votre réservation confirmée, vous recevez les coordonnées complètes de l'établissement par email. Vous pouvez également les retrouver dans votre espace personnel, section 'Mes réservations'.",
  },
  {
    question: "Les dons sont-ils déductibles des impôts ?",
    answer: "Oui, les contributions aux projets de compensation carbone donnent droit à une réduction d'impôt. Vous recevez automatiquement un reçu fiscal par email après chaque don. Le taux de déduction dépend de votre pays de résidence.",
  },
  {
    question: "Comment devenir partenaire ?",
    answer: "Si vous gérez un hébergement éco-responsable, un espace de coworking ou une activité durable, vous pouvez postuler depuis notre page 'Devenir partenaire'. Notre équipe examine chaque candidature selon nos critères de durabilité.",
  },
];

const HelpPage = () => {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-16">
        {/* Hero */}
        <section className="bg-gradient-to-b from-muted to-background py-16">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center max-w-2xl mx-auto"
            >
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                Centre d'aide
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                Comment pouvons-nous vous aider ?
              </p>
              
              <div className="relative max-w-xl mx-auto">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Rechercher dans l'aide..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-14 text-lg"
                />
              </div>
            </motion.div>
          </div>
        </section>

        {/* Categories */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {categories.map((category, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="cursor-pointer card-hover">
                    <CardContent className="pt-6">
                      <category.icon className="w-10 h-10 text-primary mb-4" />
                      <h3 className="font-semibold text-foreground mb-1">{category.title}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{category.description}</p>
                      <p className="text-xs text-primary">{category.count} articles</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Popular Articles */}
        <section className="py-12 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-foreground mb-8 text-center">
              Articles populaires
            </h2>
            <div className="grid md:grid-cols-2 gap-4 max-w-3xl mx-auto">
              {popularArticles.map((article, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div>
                        <p className="font-medium text-foreground">{article.title}</p>
                        <p className="text-xs text-muted-foreground">{article.category}</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-foreground mb-8 text-center">
              Questions fréquentes
            </h2>
            <div className="max-w-3xl mx-auto">
              <Accordion type="single" collapsible className="space-y-4">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`} className="border rounded-lg px-4">
                    <AccordionTrigger className="text-left font-medium">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
            <div className="text-center mt-8">
              <Link to="/faq">
                <Button variant="outline">
                  Voir toutes les FAQ
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Contact */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center max-w-2xl mx-auto"
            >
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Besoin d'aide supplémentaire ?
              </h2>
              <p className="text-muted-foreground mb-8">
                Notre équipe support est disponible pour répondre à toutes vos questions.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Card className="flex-1 max-w-xs">
                  <CardContent className="pt-6 text-center">
                    <Mail className="w-8 h-8 mx-auto mb-3 text-primary" />
                    <h3 className="font-semibold mb-1">Email</h3>
                    <p className="text-sm text-muted-foreground mb-3">Réponse sous 24h</p>
                    <a href="mailto:support@coworkation.com" className="text-primary hover:underline">
                      support@coworkation.com
                    </a>
                  </CardContent>
                </Card>
                
                <Card className="flex-1 max-w-xs">
                  <CardContent className="pt-6 text-center">
                    <MessageCircle className="w-8 h-8 mx-auto mb-3 text-primary" />
                    <h3 className="font-semibold mb-1">Chat</h3>
                    <p className="text-sm text-muted-foreground mb-3">Lun-Ven, 9h-18h</p>
                    <Button size="sm">
                      Démarrer un chat
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default HelpPage;
