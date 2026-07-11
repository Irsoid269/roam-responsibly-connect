import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Star, Wifi, Leaf, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ecoScoreBadge } from "@/lib/eco-score";
import { useHomeDestinations } from "@/hooks/useCatalogQueries";

const fallbackImage =
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800";

const DestinationsSection = () => {
  const { data: destinations = [], isLoading } = useHomeDestinations(4);

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="section-eyebrow"
            >
              Les îles des Comores
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="font-display text-3xl md:text-4xl font-medium text-foreground mt-3"
            >
              Où allez-vous travailler ?
            </motion.h2>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <Button variant="outline" className="group" asChild>
              <Link to="/destinations">
                Voir toutes les destinations
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </motion.div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : destinations.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">
            Aucune destination mise en avant. Configurez-les depuis l&apos;admin.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {destinations.map((destination, index) => (
              <motion.article
                key={destination.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group"
              >
                <Link to={`/destinations/${destination.id}`} className="block">
                  <div className="card-hover rounded-2xl overflow-hidden bg-card">
                    <div className="relative aspect-[4/5] overflow-hidden">
                      <img
                        src={destination.image_url || fallbackImage}
                        alt={`${destination.name}, ${destination.country}`}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent" />

                      <div className="absolute top-4 left-4 right-4 flex items-start justify-between gap-2">
                        {destination.highlight && (
                          <span className="px-3 py-1 rounded-full bg-background/90 backdrop-blur-sm text-xs font-medium text-foreground">
                            {destination.highlight}
                          </span>
                        )}
                        <span
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${ecoScoreBadge(
                            destination.carbon_score || "B"
                          )}`}
                        >
                          {destination.carbon_score || "B"}
                        </span>
                      </div>

                      <div className="absolute bottom-4 left-4 right-4">
                        <h3 className="text-xl font-bold text-primary-foreground mb-1">
                          {destination.name}
                        </h3>
                        <p className="text-sm text-primary-foreground/80">
                          {destination.city ? `${destination.city} · ` : ""}
                          {destination.country}
                        </p>
                      </div>
                    </div>

                    <div className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-1.5">
                          <Star className="w-4 h-4 text-warning fill-warning" />
                          <span className="text-sm font-medium text-foreground">
                            {destination.rating ?? "—"}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Wifi className="w-4 h-4" />
                          <span className="text-sm">
                            {destination.coworking_count ?? 0} espaces
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-lg font-bold text-foreground">
                            {destination.avg_price_per_day ?? "—"}€
                          </span>
                          <span className="text-sm text-muted-foreground">/jour</span>
                        </div>
                        <div className="flex items-center gap-1 text-carbon">
                          <Leaf className="w-4 h-4" />
                          <span className="text-xs font-medium">Éco-friendly</span>
                        </div>
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

export default DestinationsSection;
