import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, MapPin, Phone, Send, Loader2 } from "lucide-react";
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
import PageHero from "@/components/layout/PageHero";
import { useAuth } from "@/hooks/useAuth";
import { useSubmitContactMessage } from "@/hooks/useCatalogQueries";
import { toast } from "sonner";

const contactMethods = [
  {
    icon: Mail,
    title: "Email",
    description: "Réponse sous 24h ouvrées",
    value: "hello@amaniresorts.com",
    action: "mailto:hello@amaniresorts.com",
  },
  {
    icon: Phone,
    title: "Téléphone",
    description: "Lun-Ven, 9h-18h (EAT)",
    value: "+269 773 00 00",
    action: "tel:+2697730000",
  },
  {
    icon: MapPin,
    title: "Siège",
    description: "Grande Comore",
    value: "Moroni, Comores",
    action: "/destinations",
  },
];

const ContactPage = () => {
  const { user } = useAuth();
  const submit = useSubmitContactMessage();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState(user?.email || "");
  const [subject, setSubject] = useState("general");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !message.trim()) {
      toast.error("Remplissez tous les champs obligatoires");
      return;
    }
    try {
      await submit.mutateAsync({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        subject,
        message: message.trim(),
        userId: user?.id,
      });
      toast.success("Message envoyé — nous vous répondrons sous 24h");
      setMessage("");
      setSubject("general");
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Envoi impossible — appliquez la migration contact_messages"
      );
    }
  };

  return (
    <main className="page-main">
      <PageHero
        title="Contactez-nous"
        description="Une question, une suggestion ou un partenariat ? Notre équipe Amani est là."
      />

      <section className="py-10">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-14">
            {contactMethods.map((method, index) => (
              <motion.div
                key={method.title}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
              >
                <a href={method.action}>
                  <Card className="text-center card-hover h-full">
                    <CardContent className="pt-6">
                      <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                        <method.icon className="w-6 h-6 text-primary" />
                      </div>
                      <h3 className="font-semibold mb-1">{method.title}</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        {method.description}
                      </p>
                      <p className="text-primary font-medium text-sm">{method.value}</p>
                    </CardContent>
                  </Card>
                </a>
              </motion.div>
            ))}
          </div>

          <div className="max-w-xl mx-auto">
            <h2 className="font-display text-2xl font-medium mb-6 text-center">
              Envoyez-nous un message
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Prénom</label>
                  <Input
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Nom</label>
                  <Input
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Email</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Sujet</label>
                <Select value={subject} onValueChange={setSubject}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">Question générale</SelectItem>
                    <SelectItem value="booking">Réservation</SelectItem>
                    <SelectItem value="partnership">Partenariat</SelectItem>
                    <SelectItem value="press">Presse</SelectItem>
                    <SelectItem value="support">Support</SelectItem>
                    <SelectItem value="other">Autre</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Message</label>
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={5}
                  required
                />
              </div>
              <Button type="submit" size="lg" className="w-full" disabled={submit.isPending}>
                {submit.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                Envoyer
              </Button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
};

export default ContactPage;
