import { useState } from "react";
import { motion } from "framer-motion";
import { Search, HelpCircle, Leaf, CreditCard, Users, Shield, Plane, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  { id: "general", icon: HelpCircle, label: "Général" },
  { id: "carbon", icon: Leaf, label: "Carbone" },
  { id: "booking", icon: Plane, label: "Réservations" },
  { id: "payment", icon: CreditCard, label: "Paiements" },
  { id: "community", icon: Users, label: "Communauté" },
  { id: "security", icon: Shield, label: "Sécurité" },
];

const faqs = {
  general: [
    {
      question: "Qu'est-ce que Coworkation ?",
      answer: "Coworkation est une plateforme tout-en-un pour les nomades digitaux et télétravailleurs. Nous proposons des séjours combinant hébergement, espace de coworking et activités, le tout avec un focus sur l'impact environnemental et la transparence carbone.",
    },
    {
      question: "Comment fonctionne la plateforme ?",
      answer: "Vous choisissez une destination, sélectionnez votre hébergement, espace de coworking et activités souhaitées. Notre système calcule automatiquement l'empreinte carbone de votre séjour et vous propose des options de compensation. Vous réservez et payez en une seule fois.",
    },
    {
      question: "Quelles destinations sont disponibles ?",
      answer: "Nous proposons plus de 35 destinations à travers le monde, sélectionnées pour leur qualité de vie, infrastructures numériques et engagement environnemental. De Lisbonne à Bali en passant par Barcelone, découvrez notre catalogue complet sur la page Destinations.",
    },
  ],
  carbon: [
    {
      question: "Comment est calculée mon empreinte carbone ?",
      answer: "Notre calcul est basé sur la méthodologie ADEME et prend en compte : le transport (distance, mode), l'hébergement (type, certification), les activités et la mobilité sur place. Chaque facteur d'émission est régulièrement mis à jour selon les dernières données scientifiques.",
    },
    {
      question: "Qu'est-ce que la compensation carbone ?",
      answer: "La compensation carbone consiste à financer des projets qui absorbent ou évitent l'émission de CO₂ (reforestation, énergies renouvelables, etc.) pour 'neutraliser' les émissions que vous ne pouvez pas éviter. C'est un complément, pas un substitut, à la réduction de vos émissions.",
    },
    {
      question: "Comment choisissez-vous vos projets de compensation ?",
      answer: "Tous nos projets sont certifiés par des organismes reconnus (Gold Standard, VCS, etc.). Nous privilégions les projets avec co-bénéfices sociaux et environnementaux. Vous pouvez suivre l'impact de vos contributions en temps réel sur votre tableau de bord.",
    },
    {
      question: "La compensation carbone est-elle vraiment efficace ?",
      answer: "La compensation est un outil parmi d'autres. Nous encourageons d'abord la réduction (train plutôt qu'avion, séjours longs, etc.). La compensation intervient pour les émissions résiduelles. Nos projets sont audités et vous recevez des rapports d'impact trimestriels.",
    },
  ],
  booking: [
    {
      question: "Comment réserver un séjour ?",
      answer: "1) Choisissez votre destination, 2) Sélectionnez vos dates et services (hébergement, coworking, activités), 3) Vérifiez l'impact carbone et choisissez votre niveau de compensation, 4) Confirmez et payez. Vous recevez immédiatement vos confirmations par email.",
    },
    {
      question: "Puis-je modifier ma réservation ?",
      answer: "Oui, vous pouvez modifier votre réservation depuis votre espace personnel jusqu'à 7 jours avant le début du séjour (sauf conditions spécifiques de certains partenaires). Des frais peuvent s'appliquer selon les modifications.",
    },
    {
      question: "Quelle est la politique d'annulation ?",
      answer: "Les conditions d'annulation varient selon les partenaires. En général : annulation gratuite jusqu'à 14 jours avant, 50% jusqu'à 7 jours avant, et pas de remboursement après. Les détails exacts sont indiqués lors de la réservation.",
    },
    {
      question: "Puis-je réserver pour un groupe ?",
      answer: "Oui ! Nous proposons des tarifs et services spéciaux pour les groupes (teams building, retraites d'entreprise). Contactez-nous directement pour un devis personnalisé.",
    },
  ],
  payment: [
    {
      question: "Quels moyens de paiement acceptez-vous ?",
      answer: "Nous acceptons les cartes bancaires (Visa, Mastercard, American Express), PayPal et les virements bancaires pour les montants supérieurs à 1000€. Tous les paiements sont sécurisés via Stripe.",
    },
    {
      question: "Puis-je payer en plusieurs fois ?",
      answer: "Oui, pour les réservations supérieures à 500€, vous pouvez opter pour le paiement en 3x sans frais. Un acompte de 30% est requis à la réservation, le solde étant prélevé automatiquement.",
    },
    {
      question: "Les dons carbone sont-ils déductibles des impôts ?",
      answer: "Oui, vos contributions aux projets de compensation donnent droit à une réduction d'impôt (66% en France). Un reçu fiscal est automatiquement généré et envoyé par email après chaque don.",
    },
    {
      question: "Comment obtenir une facture ?",
      answer: "Toutes les factures sont disponibles dans votre espace personnel, section 'Mes paiements'. Vous pouvez les télécharger en PDF à tout moment. Pour les entreprises, vous pouvez renseigner vos informations de facturation.",
    },
  ],
  community: [
    {
      question: "Comment rejoindre la communauté ?",
      answer: "La communauté est ouverte à tous les utilisateurs inscrits. Créez votre profil, complétez vos informations et vous aurez accès au forum, aux événements et au réseau de voyageurs.",
    },
    {
      question: "Quels sont les avantages de la communauté ?",
      answer: "Accès au forum et aux groupes de discussion, invitations aux événements et meetups, possibilité de partager vos expériences, badges et reconnaissance pour votre engagement, et networking avec d'autres nomades digitaux.",
    },
    {
      question: "Comment devenir ambassadeur ?",
      answer: "Le programme ambassadeur est ouvert aux membres actifs de la communauté. Critères : minimum 3 voyages avec Coworkation, contribution régulière à la communauté, et alignement avec nos valeurs. Postulez via la page Ambassadeurs.",
    },
  ],
  security: [
    {
      question: "Mes données sont-elles sécurisées ?",
      answer: "Absolument. Nous utilisons le chiffrement SSL pour toutes les transactions, stockons vos données sur des serveurs sécurisés en Europe et respectons le RGPD. Nous ne vendons jamais vos données à des tiers.",
    },
    {
      question: "Comment supprimer mon compte ?",
      answer: "Vous pouvez demander la suppression de votre compte depuis les paramètres de votre profil ou en nous contactant. Toutes vos données seront effacées sous 30 jours, conformément au RGPD.",
    },
    {
      question: "Les partenaires sont-ils vérifiés ?",
      answer: "Oui, tous nos partenaires passent par un processus de vérification rigoureux. Nous vérifions leur existence légale, leurs certifications environnementales et recueillons les avis d'utilisateurs. Nous effectuons aussi des visites mystères régulières.",
    },
  ],
};

const FAQPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("general");

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
                Questions fréquentes
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                Trouvez rapidement les réponses à vos questions.
              </p>
              
              <div className="relative max-w-xl mx-auto">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Rechercher une question..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-14"
                />
              </div>
            </motion.div>
          </div>
        </section>

        {/* Categories */}
        <section className="py-6 border-b sticky top-20 bg-background z-10">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap gap-2 justify-center">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={activeCategory === category.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveCategory(category.id)}
                >
                  <category.icon className="w-4 h-4 mr-1" />
                  {category.label}
                </Button>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Content */}
        <section className="py-12">
          <div className="container mx-auto px-4 max-w-3xl">
            <motion.div
              key={activeCategory}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Accordion type="single" collapsible className="space-y-4">
                {faqs[activeCategory as keyof typeof faqs].map((faq, index) => (
                  <AccordionItem 
                    key={index} 
                    value={`item-${index}`}
                    className="border rounded-lg px-4 bg-card"
                  >
                    <AccordionTrigger className="text-left font-medium hover:no-underline">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </motion.div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-12 bg-muted/30">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl font-bold text-foreground mb-3">
              Vous n'avez pas trouvé votre réponse ?
            </h2>
            <p className="text-muted-foreground mb-6">
              Notre équipe support est là pour vous aider.
            </p>
            <div className="flex gap-4 justify-center">
              <Link to="/contact">
                <Button>Nous contacter</Button>
              </Link>
              <Link to="/help">
                <Button variant="outline">Centre d'aide</Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default FAQPage;
