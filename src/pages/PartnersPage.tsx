import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Heart, Award, ExternalLink, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useCmsHero, usePartnerOrgs } from "@/hooks/useCmsContent";

const PartnersPage = () => {
  const { t } = useTranslation("partners");
  const { data: hero, isLoading: hLoad } = useCmsHero("partners");
  const { data: orgs = [], isLoading: oLoad } = usePartnerOrgs();
  const loading = hLoad || oLoad;

  const carbon = orgs.filter((o) => o.category === "carbon");
  const accommodations = orgs.filter((o) => o.category === "accommodation");
  const coworkings = orgs.filter((o) => o.category === "coworking");

  return (
    <main className="page-main">
      <section className="bg-gradient-to-b from-carbon to-carbon/80 text-carbon-foreground py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <Badge
              variant="outline"
              className="mb-4 bg-carbon-foreground/10 border-carbon-foreground/20 text-carbon-foreground"
            >
              <Heart className="w-3 h-3 mr-1" />
              {hero?.badge_text || t("eyebrow")}
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              {hero?.title || t("title")}
            </h1>
            {hero?.description && (
              <p className="text-lg text-carbon-foreground/80">{hero.description}</p>
            )}
            {hero?.cta_label && hero?.cta_url && (
              <Button asChild size="lg" variant="secondary" className="mt-8">
                <Link to={hero.cta_url}>{hero.cta_label}</Link>
              </Button>
            )}
          </motion.div>
        </div>
      </section>

      {loading ? (
        <div className="flex justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {carbon.length > 0 && (
            <section className="py-12">
              <div className="container mx-auto px-4">
                <h2 className="text-2xl font-bold mb-8">{t("carbonProjects")}</h2>
                <div className="grid md:grid-cols-3 gap-6">
                  {carbon.map((p, i) => (
                    <motion.div
                      key={p.id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <Card className="overflow-hidden h-full">
                        {p.image_url && (
                          <div className="aspect-video overflow-hidden">
                            <img
                              src={p.image_url}
                              alt={p.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <CardHeader>
                          <div className="flex items-center gap-2 mb-1">
                            {p.type && <Badge variant="secondary">{p.type}</Badge>}
                            {p.certified && (
                              <Badge className="bg-success/15 text-success border-0">
                                <Award className="w-3 h-3 mr-1" />
                                {t("certified")}
                              </Badge>
                            )}
                          </div>
                          <CardTitle className="text-lg">{p.name}</CardTitle>
                          {p.location && (
                            <p className="text-sm text-muted-foreground">{p.location}</p>
                          )}
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {p.description && (
                            <p className="text-sm text-muted-foreground">{p.description}</p>
                          )}
                          {p.impact_label && (
                            <p className="text-sm font-medium text-carbon">{p.impact_label}</p>
                          )}
                          {typeof p.progress === "number" && p.progress > 0 && (
                            <Progress value={p.progress} className="h-2" />
                          )}
                          {p.website_url && (
                            <a
                              href={p.website_url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center text-sm text-primary gap-1"
                            >
                              {t("website")} <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {accommodations.length > 0 && (
            <section className="py-12 bg-muted/30">
              <div className="container mx-auto px-4">
                <h2 className="text-2xl font-bold mb-6">{t("partnerAccommodations")}</h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {accommodations.map((p) => (
                    <Card key={p.id}>
                      <CardContent className="p-4">
                        <h3 className="font-medium">{p.name}</h3>
                        <p className="text-sm text-muted-foreground mb-2">{p.location}</p>
                        <div className="flex flex-wrap gap-1">
                          {(p.certifications || []).map((c) => (
                            <Badge key={c} variant="outline" className="text-xs">
                              {c}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </section>
          )}

          {coworkings.length > 0 && (
            <section className="py-12">
              <div className="container mx-auto px-4">
                <h2 className="text-2xl font-bold mb-6">{t("partnerCoworkings")}</h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {coworkings.map((p) => (
                    <Card key={p.id}>
                      <CardContent className="p-4">
                        <h3 className="font-medium">{p.name}</h3>
                        <p className="text-sm text-muted-foreground">{p.specialty}</p>
                        {p.locations_count != null && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {p.locations_count} site{p.locations_count > 1 ? "s" : ""}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </section>
          )}
        </>
      )}
    </main>
  );
};

export default PartnersPage;
