import CarbonCalculator from "@/components/carbon/CarbonCalculator";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Leaf, Loader2 } from "lucide-react";
import { useCmsHero, useCmsStats, useCmsInfoCards } from "@/hooks/useCmsContent";
import { cmsIcon } from "@/lib/cms-icons";

const CarbonCalculatorPage = () => {
  const { t } = useTranslation("carbonCalculator");
  const { data: hero, isLoading: hLoad } = useCmsHero("carbon");
  const { data: stats = [], isLoading: sLoad } = useCmsStats("carbon");
  const { data: cards = [], isLoading: cLoad } = useCmsInfoCards("carbon");
  const loading = hLoad || sLoad || cLoad;

  return (
    <main className="page-main">
      <section className="bg-gradient-to-b from-carbon to-carbon/80 text-carbon-foreground py-16 md:py-24">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : (
            <>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center max-w-3xl mx-auto mb-12"
              >
                {(hero?.badge_text || true) && (
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-carbon-foreground/10 text-sm font-medium mb-6">
                    <Leaf className="w-4 h-4" />
                    {hero?.badge_text || t("hero.badge")}
                  </div>
                )}
                <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-medium mb-6">
                  {hero?.title || t("hero.titleLine1")}
                  <br />
                  <span className="text-carbon-saved">
                    {hero?.title_highlight || t("hero.titleHighlight")}
                  </span>
                </h1>
                {hero?.description && (
                  <p className="text-lg md:text-xl text-carbon-foreground/80 leading-relaxed">
                    {hero.description}
                  </p>
                )}
              </motion.div>

              {stats.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
                  {stats.map((stat, index) => {
                    const Icon = cmsIcon(stat.icon_key);
                    return (
                      <motion.div
                        key={stat.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 + index * 0.05 }}
                        className="bg-carbon-foreground/10 backdrop-blur-sm rounded-xl p-4 text-center"
                      >
                        <Icon className="w-6 h-6 mx-auto mb-2 text-carbon-saved" />
                        <p className="text-2xl font-bold">{stat.value}</p>
                        <p className="text-sm text-carbon-foreground/70">{stat.label}</p>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <CarbonCalculator />
        </div>
      </section>

      {cards.length > 0 && (
        <section className="py-12 md:py-16 bg-muted/30">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="grid md:grid-cols-3 gap-6">
              {cards.map((card) => {
                const Icon = cmsIcon(card.icon_key);
                return (
                  <div
                    key={card.id}
                    className="bg-card rounded-2xl p-6 border border-border"
                  >
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{card.title}</h3>
                    <p className="text-sm text-muted-foreground">{card.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </main>
  );
};

export default CarbonCalculatorPage;
