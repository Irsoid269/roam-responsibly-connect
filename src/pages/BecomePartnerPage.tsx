import { useState } from "react";
import { motion } from "framer-motion";
import { Building, Laptop, Leaf, Users, Check, ArrowRight, Star, Loader2 } from "lucide-react";
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
import { useAuth } from "@/hooks/useAuth";
import { useSubmitPartnerApplication, useCatalogCounts } from "@/hooks/useCatalogQueries";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

const partnerTypeIcons = [Building, Laptop, Leaf];

const BecomePartnerPage = () => {
  const { t } = useTranslation("becomePartner");
  const { user } = useAuth();

  const partnerTypes = partnerTypeIcons.map((icon, i) => ({
    icon,
    title: t(`types.${i}.title`),
    description: t(`types.${i}.description`),
    benefits: t(`types.${i}.benefits`, { returnObjects: true }) as string[],
  }));

  const requirements = t("requirements", { returnObjects: true }) as string[];
  const { data: counts } = useCatalogCounts();
  const submit = useSubmitPartnerApplication();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState(user?.email || "");
  const [companyName, setCompanyName] = useState("");
  const [partnerType, setPartnerType] = useState("accommodation");
  const [website, setWebsite] = useState("");
  const [message, setMessage] = useState("");

  const liveStats = [
    { value: `${counts?.travelers ?? "—"}+`, label: t("stats.travelers") },
    { value: `${counts?.destinations ?? "—"}`, label: t("stats.destinations") },
    { value: `${counts?.coworkings ?? "—"}`, label: t("stats.coworkings") },
    { value: t("stats.ecoValue"), label: t("stats.ecoLabel") },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !companyName.trim()) {
      toast.error(t("toasts.fillRequired"));
      return;
    }
    try {
      await submit.mutateAsync({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        companyName: companyName.trim(),
        partnerType,
        website: website.trim() || undefined,
        message: message.trim() || undefined,
        userId: user?.id,
      });
      toast.success(t("toasts.success"));
      setMessage("");
      setCompanyName("");
      setWebsite("");
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : t("toasts.error")
      );
    }
  };

  return (
    <main className="page-main">
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
                {t("eyebrow")}
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                {t("title")}
              </h1>
              <p className="text-lg text-primary-foreground/80 mb-8">
                {t("description")}
              </p>
              <div className="flex justify-center gap-4">
                {liveStats.map((stat, index) => (
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
                {t("typesTitle")}
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                {t("typesDescription")}
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
                  {t("requirementsTitle")}
                </h2>
                <p className="text-muted-foreground mb-6">
                  {t("requirementsDescription")}
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
                    <CardTitle>{t("form.title")}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {t("form.subtitle")}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-1 block">{t("form.firstName")}</label>
                        <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1 block">{t("form.lastName")}</label>
                        <Input value={lastName} onChange={(e) => setLastName(e.target.value)} required />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">{t("form.email")}</label>
                      <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">{t("form.companyName")}</label>
                      <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} required />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">{t("form.website")}</label>
                      <Input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://" />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">{t("form.partnerType")}</label>
                      <Select value={partnerType} onValueChange={setPartnerType}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="accommodation">{t("form.types.accommodation")}</SelectItem>
                          <SelectItem value="coworking">{t("form.types.coworking")}</SelectItem>
                          <SelectItem value="activity">{t("form.types.activity")}</SelectItem>
                          <SelectItem value="mobility">{t("form.types.mobility")}</SelectItem>
                          <SelectItem value="other">{t("form.types.other")}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">{t("form.message")}</label>
                      <Textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder={t("form.messagePlaceholder")}
                        rows={4}
                      />
                    </div>
                    <Button type="submit" className="w-full" size="lg" disabled={submit.isPending}>
                      {submit.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          {t("form.submit")}
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>
                    </form>
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
                {t("testimonial.quote")}
              </blockquote>
              <div>
                <p className="font-semibold text-foreground">{t("testimonial.author")}</p>
                <p className="text-sm text-muted-foreground">{t("testimonial.role")}</p>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
  );
};

export default BecomePartnerPage;
