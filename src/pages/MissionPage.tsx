import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  useCmsHero,
  useMissionValues,
  useMissionMilestones,
  useMissionTeam,
} from "@/hooks/useCmsContent";
import { cmsIcon } from "@/lib/cms-icons";

const MissionPage = () => {
  const { data: hero, isLoading: hLoad } = useCmsHero("mission");
  const { data: values = [], isLoading: vLoad } = useMissionValues();
  const { data: milestones = [], isLoading: mLoad } = useMissionMilestones();
  const { data: team = [], isLoading: tLoad } = useMissionTeam();
  const loading = hLoad || vLoad || mLoad || tLoad;

  if (loading) {
    return (
      <div className="page-main flex justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <main className="page-main">
      <section className="bg-gradient-to-b from-primary to-primary/80 text-primary-foreground py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              {hero?.title || "Notre mission"}
              {hero?.title_highlight && (
                <>
                  <br />
                  <span className="text-primary-glow">{hero.title_highlight}</span>
                </>
              )}
            </h1>
            {hero?.description && (
              <p className="text-xl text-primary-foreground/80 leading-relaxed">
                {hero.description}
              </p>
            )}
            {hero?.cta_label && hero?.cta_url && (
              <Button asChild size="lg" variant="secondary" className="mt-8">
                <Link to={hero.cta_url}>{hero.cta_label}</Link>
              </Button>
            )}
          </motion.div>
        </div>
      </section>

      {values.length > 0 && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Nos valeurs</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((v, i) => {
                const Icon = cmsIcon(v.icon_key);
                return (
                  <motion.div
                    key={v.id}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Card className="h-full">
                      <CardContent className="p-6">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                          <Icon className="w-6 h-6 text-primary" />
                        </div>
                        <h3 className="font-semibold text-lg mb-2">{v.title}</h3>
                        <p className="text-sm text-muted-foreground">{v.description}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {milestones.length > 0 && (
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4 max-w-3xl">
            <h2 className="text-3xl font-bold text-center mb-12">Notre parcours</h2>
            <div className="space-y-6">
              {milestones.map((m) => (
                <div key={m.id} className="flex gap-4">
                  <div className="w-16 shrink-0 font-bold text-primary">{m.year}</div>
                  <div>
                    <h3 className="font-semibold">{m.event}</h3>
                    <p className="text-sm text-muted-foreground">{m.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {team.length > 0 && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">L&apos;équipe</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {team.map((member) => (
                <Card key={member.id}>
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 rounded-full bg-primary/10 mx-auto mb-3 flex items-center justify-center text-lg font-bold text-primary">
                      {member.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)}
                    </div>
                    <h3 className="font-semibold">{member.name}</h3>
                    <p className="text-sm text-primary mb-2">{member.role}</p>
                    <p className="text-xs text-muted-foreground">{member.bio}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
};

export default MissionPage;
