import { motion } from "framer-motion";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  useCmsHero,
  useCmsStats,
  useImpactBreakdown,
  useImpactQuarters,
} from "@/hooks/useCmsContent";
import { cmsIcon } from "@/lib/cms-icons";

const ImpactReportPage = () => {
  const { data: hero, isLoading: hLoad } = useCmsHero("impact_report");
  const { data: metrics = [], isLoading: mLoad } = useCmsStats("impact_report");
  const { data: breakdown = [], isLoading: bLoad } = useImpactBreakdown();
  const { data: quarters = [], isLoading: qLoad } = useImpactQuarters();
  const loading = hLoad || mLoad || bLoad || qLoad;

  const pdfHref = hero?.pdf_url && hero.pdf_url !== "#" ? hero.pdf_url : undefined;

  return (
    <main className="page-main">
      <section className="bg-gradient-to-b from-primary to-primary/80 text-primary-foreground py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            {hero?.badge_text && (
              <p className="text-sm font-medium text-primary-foreground/70 mb-2">
                {hero.badge_text}
              </p>
            )}
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {hero?.title || "Rapport d'Impact"}
            </h1>
            {hero?.description && (
              <p className="text-lg text-primary-foreground/80 mb-8">{hero.description}</p>
            )}
            {hero?.cta_label && (
              pdfHref ? (
                <Button size="lg" variant="secondary" asChild>
                  <a href={pdfHref} target="_blank" rel="noreferrer">
                    <Download className="w-4 h-4 mr-2" />
                    {hero.cta_label}
                  </a>
                </Button>
              ) : (
                <Button size="lg" variant="secondary" disabled>
                  <Download className="w-4 h-4 mr-2" />
                  {hero.cta_label}
                </Button>
              )
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
          {metrics.length > 0 && (
            <section className="py-12 -mt-8">
              <div className="container mx-auto px-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
                  {metrics.map((metric, index) => {
                    const Icon = cmsIcon(metric.icon_key);
                    return (
                      <motion.div
                        key={metric.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 * index }}
                      >
                        <Card>
                          <CardContent className="pt-6 text-center">
                            <Icon className="w-8 h-8 mx-auto mb-2 text-primary" />
                            <p className="text-2xl font-bold text-foreground">{metric.value}</p>
                            <p className="text-sm text-muted-foreground">{metric.label}</p>
                            {metric.change_label && (
                              <p className="text-xs text-success mt-1">
                                {metric.change_label} vs année précédente
                              </p>
                            )}
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </section>
          )}

          {breakdown.length > 0 && (
            <section className="py-12">
              <div className="container mx-auto px-4 max-w-2xl">
                <h2 className="text-2xl font-bold mb-6">Répartition carbone</h2>
                <div className="space-y-4">
                  {breakdown.map((row) => (
                    <div key={row.id}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium">{row.category}</span>
                        <span className="text-muted-foreground">
                          {row.amount} · {row.percentage}%
                        </span>
                      </div>
                      <Progress value={row.percentage} className="h-2" />
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {quarters.length > 0 && (
            <section className="py-12 bg-muted/30">
              <div className="container mx-auto px-4">
                <h2 className="text-2xl font-bold mb-6">Données trimestrielles</h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {quarters.map((q) => (
                    <Card key={q.id}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">{q.quarter}</CardTitle>
                      </CardHeader>
                      <CardContent className="text-sm space-y-1 text-muted-foreground">
                        <p>
                          <span className="text-foreground font-medium">{q.travelers}</span>{" "}
                          voyageurs
                        </p>
                        <p>
                          <span className="text-foreground font-medium">{q.carbon}</span> kg
                          CO₂
                        </p>
                        <p>
                          <span className="text-foreground font-medium">
                            {q.revenue.toLocaleString("fr-FR")}€
                          </span>{" "}
                          revenus
                        </p>
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

export default ImpactReportPage;
