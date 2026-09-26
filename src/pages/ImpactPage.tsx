import { motion } from "framer-motion";
import { 
  Leaf, TreePine, Globe, TrendingDown, Users, Award,
  Target, Heart, Plane, Building, Bike
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";
import EcoScoreLegend from "@/components/carbon/EcoScoreLegend";
import { useTranslation } from "react-i18next";

const impactStatsIcons = [TreePine, Users, Globe, Award];
const impactStatsData = [
  { value: "45,000 kg", growth: "+23%" },
  { value: "2,850+", growth: "+45%" },
  { value: "12", growth: "+3" },
  { value: "8,500", growth: "+1,200" },
];

const compensationProjectsData = [
  {
    progress: 78,
    image: "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=800",
  },
  {
    progress: 92,
    image: "https://images.unsplash.com/photo-1559827291-72ee739d0d9a?w=800",
  },
  {
    progress: 45,
    image: "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800",
  },
];

const emissionBreakdownIcons = [Plane, Building, Bike, Heart];
const emissionBreakdownData = [
  { percentage: 65, color: "bg-eco-e" },
  { percentage: 20, color: "bg-eco-c" },
  { percentage: 10, color: "bg-eco-b" },
  { percentage: 5, color: "bg-eco-a" },
];

const ImpactPage = () => {
  const { t } = useTranslation("impact");

  const impactStats = impactStatsData.map((stat, i) => ({
    ...stat,
    icon: impactStatsIcons[i],
    label: t(`stats.${i}.label`),
  }));

  const compensationProjects = compensationProjectsData.map((project, i) => ({
    ...project,
    name: t(`projects.${i}.name`),
    location: t(`projects.${i}.location`),
    target: t(`projects.${i}.target`),
  }));

  const emissionBreakdown = emissionBreakdownData.map((item, i) => ({
    ...item,
    icon: emissionBreakdownIcons[i],
    category: t(`emissions.${i}`),
  }));

  return (
    <main className="page-main">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-carbon to-carbon/80 text-carbon-foreground py-16 md:py-24">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center max-w-3xl mx-auto"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-carbon-foreground/10 text-sm font-medium mb-6">
                <Leaf className="w-4 h-4" />
                {t("hero.eyebrow")}
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                {t("hero.titleLine1")}
                <br />
                <span className="text-carbon-saved">{t("hero.titleLine2")}</span>
              </h1>
              <p className="text-lg md:text-xl text-carbon-foreground/80 leading-relaxed mb-8">
                {t("hero.description")}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/carbon-calculator">
                  <Button size="lg" variant="secondary">
                    <Target className="w-4 h-4 mr-2" />
                    {t("hero.calculate")}
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="bg-transparent border-carbon-foreground/30 text-carbon-foreground hover:bg-carbon-foreground/10">
                  {t("hero.learnMore")}
                </Button>
              </div>
            </motion.div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mt-12">
              {impactStats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                    className="bg-carbon-foreground/10 backdrop-blur-sm rounded-xl p-4 text-center"
                  >
                    <Icon className="w-6 h-6 mx-auto mb-2 text-carbon-saved" />
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-sm text-carbon-foreground/70">{stat.label}</p>
                    <p className="text-xs text-carbon-saved mt-1">{stat.growth}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Emission Breakdown */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-4xl mx-auto"
            >
              <h2 className="text-3xl font-bold text-center mb-4">
                {t("breakdown.title")}
              </h2>
              <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
                {t("breakdown.description")}
              </p>

              <div className="grid md:grid-cols-2 gap-8">
                <Card>
                  <CardHeader>
                    <CardTitle>{t("breakdown.cardTitle")}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <EcoScoreLegend className="mb-4" />
                    {emissionBreakdown.map((item, index) => {
                      const Icon = item.icon;
                      return (
                        <div key={index} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Icon className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm font-medium">{item.category}</span>
                            </div>
                            <span className="text-sm text-muted-foreground">{item.percentage}%</span>
                          </div>
                          <Progress value={item.percentage} className={item.color} />
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>

                <Card className="bg-primary/5 border-primary/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingDown className="w-5 h-5 text-primary" />
                      {t("reduce.title")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {[0, 1, 2, 3].map((i) => (
                        <li key={i} className="flex items-start gap-3">
                          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-xs font-bold text-primary">{i + 1}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            <strong className="text-foreground">{t(`reduce.tips.${i}.strong`)}</strong>{" "}
                            {t(`reduce.tips.${i}.rest`)}
                          </p>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Compensation Projects */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold text-center mb-4">
                {t("projectsTitle")}
              </h2>
              <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
                {t("projectsDescription")}
              </p>

              <div className="grid md:grid-cols-3 gap-6">
                {compensationProjects.map((project, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="overflow-hidden card-hover">
                      <div className="relative aspect-video">
                        <img
                          src={project.image}
                          alt={project.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
                        <div className="absolute bottom-3 left-3 text-background">
                          <p className="font-semibold">{project.name}</p>
                          <p className="text-sm opacity-80">{project.location}</p>
                        </div>
                      </div>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-muted-foreground">{t("goal")}: {project.target}</span>
                          <span className="text-sm font-medium text-primary">{project.progress}%</span>
                        </div>
                        <Progress value={project.progress} className="h-2" />
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              <div className="text-center mt-8">
                <Link to="/partners">
                  <Button variant="outline">
                    {t("viewPartners")}
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-r from-primary to-accent rounded-3xl p-8 md:p-12 text-center text-primary-foreground"
            >
              <Leaf className="w-12 h-12 mx-auto mb-4 opacity-80" />
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                {t("cta.title")}
              </h2>
              <p className="text-lg opacity-80 mb-8 max-w-xl mx-auto">
                {t("cta.description")}
              </p>
              <Link to="/carbon-calculator">
                <Button size="lg" variant="secondary">
                  {t("cta.button")}
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>
      </main>
  );
};

export default ImpactPage;
