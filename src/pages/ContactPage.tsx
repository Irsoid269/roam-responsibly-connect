import { motion } from "framer-motion";
import { Mail, MapPin, Phone, MessageCircle, Clock, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const contactMethods = [
  {
    icon: Mail,
    title: "Email",
    description: "Réponse sous 24h ouvrées",
    value: "hello@coworkation.com",
    action: "mailto:hello@coworkation.com",
  },
  {
    icon: Phone,
    title: "Téléphone",
    description: "Lun-Ven, 9h-18h (CET)",
    value: "+33 1 23 45 67 89",
    action: "tel:+33123456789",
  },
  {
    icon: MessageCircle,
    title: "Chat en direct",
    description: "Réponse instantanée",
    value: "Démarrer un chat",
    action: "#chat",
  },
];

const offices = [
  {
    city: "Paris",
    address: "42 rue de la Durabilité",
    zip: "75011 Paris, France",
    email: "paris@coworkation.com",
  },
  {
    city: "Lisbonne",
    address: "Rua do Coworking, 123",
    zip: "1100 Lisboa, Portugal",
    email: "lisboa@coworkation.com",
  },
];

const ContactPage = () => {
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
                Contactez-nous
              </h1>
              <p className="text-lg text-muted-foreground">
                Une question, une suggestion ou un partenariat ? 
                Notre équipe est là pour vous aider.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Contact Methods */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {contactMethods.map((method, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <a href={method.action}>
                    <Card className="text-center card-hover h-full">
                      <CardContent className="pt-6">
                        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                          <method.icon className="w-7 h-7 text-primary" />
                        </div>
                        <h3 className="font-semibold text-foreground mb-1">{method.title}</h3>
                        <p className="text-sm text-muted-foreground mb-2">{method.description}</p>
                        <p className="text-primary font-medium">{method.value}</p>
                      </CardContent>
                    </Card>
                  </a>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Form & Info */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
              {/* Form */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-2xl font-bold text-foreground mb-6">
                  Envoyez-nous un message
                </h2>
                <form className="space-y-4">
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
                    <label className="text-sm font-medium mb-1 block">Email</label>
                    <Input type="email" placeholder="jean@example.com" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Sujet</label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Choisissez un sujet..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">Question générale</SelectItem>
                        <SelectItem value="booking">Réservation</SelectItem>
                        <SelectItem value="partnership">Partenariat</SelectItem>
                        <SelectItem value="press">Presse</SelectItem>
                        <SelectItem value="support">Support technique</SelectItem>
                        <SelectItem value="other">Autre</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Message</label>
                    <Textarea 
                      placeholder="Comment pouvons-nous vous aider ?"
                      rows={5}
                    />
                  </div>
                  <Button type="submit" size="lg" className="w-full">
                    <Send className="w-4 h-4 mr-2" />
                    Envoyer le message
                  </Button>
                </form>
              </motion.div>

              {/* Info */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-2xl font-bold text-foreground mb-6">
                  Nos bureaux
                </h2>
                <div className="space-y-6">
                  {offices.map((office, index) => (
                    <Card key={index}>
                      <CardContent className="p-5">
                        <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-primary" />
                          {office.city}
                        </h3>
                        <p className="text-muted-foreground text-sm mb-1">{office.address}</p>
                        <p className="text-muted-foreground text-sm mb-2">{office.zip}</p>
                        <a href={`mailto:${office.email}`} className="text-sm text-primary hover:underline">
                          {office.email}
                        </a>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <Card className="mt-6 bg-primary/5 border-primary/20">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <Clock className="w-5 h-5 text-primary" />
                      <h3 className="font-semibold text-foreground">Horaires de support</h3>
                    </div>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p>Lundi - Vendredi: 9h00 - 18h00 (CET)</p>
                      <p>Samedi: 10h00 - 16h00 (CET)</p>
                      <p>Dimanche: Fermé</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Map placeholder */}
        <section className="py-12 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <div className="aspect-[21/9] bg-muted rounded-2xl flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <MapPin className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Carte interactive</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default ContactPage;
