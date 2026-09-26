import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowRight, Clock, Leaf, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useHomeActivities } from "@/hooks/useCatalogQueries";

const fallbackImage =
  "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800";

const ActivitiesSection = () => {
  const { t } = useTranslation("home");
  const { data: activities = [], isLoading } = useHomeActivities(4);

  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="section-eyebrow"
            >
              {t("activities.eyebrow")}
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="font-display text-3xl md:text-4xl font-medium text-foreground mt-3"
            >
              {t("activities.title")}
            </motion.h2>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <Button variant="outline" className="group" asChild>
              <Link to="/activities">
                {t("activities.viewAll")}
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </motion.div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : activities.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">{t("activities.empty")}</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {activities.map((activity, index) => (
              <motion.article
                key={activity.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group"
              >
                <Link
                  to={activity.destination_id ? `/booking/${activity.destination_id}` : "/activities"}
                  className="block"
                >
                  <div className="card-hover rounded-2xl overflow-hidden bg-card">
                    <div className="relative aspect-[4/5] overflow-hidden">
                      <img
                        src={activity.image_url || fallbackImage}
                        alt={activity.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent" />

                      <div className="absolute top-4 left-4 right-4 flex items-start justify-between gap-2">
                        {activity.category && (
                          <span className="px-3 py-1 rounded-full bg-background/90 backdrop-blur-sm text-xs font-medium text-foreground">
                            {activity.category}
                          </span>
                        )}
                        {activity.eco_certified && (
                          <Badge className="bg-success text-success-foreground shrink-0">
                            <Leaf className="w-3 h-3 mr-1" />
                            {t("activities.ecoCertified")}
                          </Badge>
                        )}
                      </div>

                      <div className="absolute bottom-4 left-4 right-4">
                        <h3 className="text-lg font-bold text-primary-foreground mb-1 line-clamp-2">
                          {activity.name}
                        </h3>
                      </div>
                    </div>

                    <div className="p-4">
                      <div className="flex items-center justify-between mb-3 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4" />
                          <span>
                            {activity.duration_hours != null
                              ? `${activity.duration_hours}h`
                              : t("activities.durationSoon")}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-lg font-bold text-foreground">
                            {activity.price != null ? `${activity.price}€` : t("activities.priceOnRequest")}
                          </span>
                        </div>
                        <span className="text-sm font-medium text-primary group-hover:underline">
                          {t("activities.book")}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default ActivitiesSection;
