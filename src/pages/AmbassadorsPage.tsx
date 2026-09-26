import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  Award,
  MapPin,
  Leaf,
  Star,
  Instagram,
  Linkedin,
  Globe,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  useAmbassadors,
  useAmbassadorBenefits,
} from "@/hooks/useCatalogQueries";

const AmbassadorsPage = () => {
  const { t } = useTranslation("ambassadors");
  const { data: ambassadors = [], isLoading, isError } = useAmbassadors();
  const { data: benefits = [] } = useAmbassadorBenefits();

  return (
    <main className="page-main">
      <section className="bg-gradient-to-b from-primary-light to-background py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <Badge variant="outline" className="mb-4 bg-primary/10 border-primary/20">
              <Award className="w-3 h-3 mr-1" />
              {t("eyebrow")}
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              {t("title")}
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              {t("description")}
            </p>
            <Button size="lg" asChild>
              <Link to="/become-partner">{t("becomeAmbassador")}</Link>
            </Button>
          </motion.div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : isError ? (
            <p className="text-center text-muted-foreground py-16">
              {t("loadError")}{" "}
              <code className="text-sm">ambassadors_admin_cms</code>.
            </p>
          ) : ambassadors.length === 0 ? (
            <p className="text-center text-muted-foreground py-16">
              {t("empty")}
            </p>
          ) : (
            <div className="grid md:grid-cols-2 gap-8">
              {ambassadors.map((ambassador, index) => (
                <motion.div
                  key={ambassador.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08 }}
                >
                  <Card className="overflow-hidden card-hover h-full">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4 mb-4">
                        <Avatar className="w-20 h-20">
                          <AvatarImage src={ambassador.avatar_url || undefined} />
                          <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                            {ambassador.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h3 className="text-xl font-semibold text-foreground">
                              {ambassador.name}
                            </h3>
                            <Badge className="bg-primary/10 text-primary border-0">
                              <Award className="w-3 h-3 mr-1" />
                              {t("ambassador")}
                            </Badge>
                          </div>
                          {ambassador.title && (
                            <p className="text-sm text-muted-foreground mb-1">
                              {ambassador.title}
                            </p>
                          )}
                          {ambassador.location && (
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {ambassador.location}
                            </p>
                          )}
                        </div>
                      </div>

                      {ambassador.bio && (
                        <p className="text-muted-foreground mb-4">{ambassador.bio}</p>
                      )}

                      <div className="flex flex-wrap gap-2 mb-4">
                        {(ambassador.specialties || []).map((specialty) => (
                          <Badge key={specialty} variant="secondary">
                            {specialty}
                          </Badge>
                        ))}
                      </div>

                      <div className="grid grid-cols-3 gap-4 py-4 border-t border-b border-border mb-4">
                        <div className="text-center">
                          <p className="text-xl font-bold text-carbon flex items-center justify-center gap-1">
                            <Leaf className="w-4 h-4" />
                            {ambassador.carbon_saved}
                          </p>
                          <p className="text-xs text-muted-foreground">{t("kgCO2Saved")}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xl font-bold text-foreground">
                            {ambassador.countries_visited}
                          </p>
                          <p className="text-xs text-muted-foreground">{t("countriesVisited")}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xl font-bold text-foreground">
                            {ambassador.followers_label}
                          </p>
                          <p className="text-xs text-muted-foreground">{t("followers")}</p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        {ambassador.instagram_url && (
                          <a
                            href={ambassador.instagram_url}
                            target="_blank"
                            rel="noreferrer"
                            className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
                          >
                            <Instagram className="w-4 h-4" />
                          </a>
                        )}
                        {ambassador.linkedin_url && (
                          <a
                            href={ambassador.linkedin_url}
                            target="_blank"
                            rel="noreferrer"
                            className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
                          >
                            <Linkedin className="w-4 h-4" />
                          </a>
                        )}
                        {ambassador.website_url && (
                          <a
                            href={ambassador.website_url}
                            target="_blank"
                            rel="noreferrer"
                            className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
                          >
                            <Globe className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {benefits.length > 0 && (
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-4xl mx-auto"
            >
              <h2 className="text-3xl font-bold text-center text-foreground mb-4">
                {t("benefitsTitle")}
              </h2>
              <p className="text-center text-muted-foreground mb-12 max-w-xl mx-auto">
                {t("benefitsDescription")}
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={benefit.id}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center gap-3 p-4 bg-background rounded-xl"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Star className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-foreground">{benefit.label}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>
      )}

      <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-primary to-accent rounded-3xl p-8 md:p-12 text-center text-primary-foreground"
          >
            <Award className="w-12 h-12 mx-auto mb-4 opacity-80" />
            <h2 className="text-3xl font-bold mb-4">{t("cta.title")}</h2>
            <p className="text-lg opacity-80 mb-8 max-w-xl mx-auto">
              {t("cta.description")}
            </p>
            <Button size="lg" variant="secondary" asChild>
              <Link to="/contact">{t("cta.button")}</Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </main>
  );
};

export default AmbassadorsPage;
