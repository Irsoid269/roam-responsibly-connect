import { motion } from "framer-motion";
import { Calendar, MapPin, Users, Clock, Video, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useEvents } from "@/hooks/useCatalogQueries";
import { format, isPast } from "date-fns";
import { fr } from "date-fns/locale";

const typeColors: Record<string, string> = {
  "En personne": "bg-primary text-primary-foreground",
  Webinaire: "bg-accent text-accent-foreground",
  Retraite: "bg-secondary text-secondary-foreground",
  Atelier: "bg-success text-success-foreground",
};

const EventsPage = () => {
  const { data: events = [], isLoading, isError } = useEvents();

  const upcoming = events.filter((e) => !isPast(new Date(e.starts_at)));
  const past = events.filter((e) => isPast(new Date(e.starts_at)));

  return (
    <main className="page-main">
      <section className="bg-gradient-to-b from-accent-light to-background py-12">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <Badge variant="outline" className="mb-4 bg-accent/10 border-accent/20">
              <Calendar className="w-3 h-3 mr-1" />
              Événements à venir
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Événements
            </h1>
            <p className="text-lg text-muted-foreground">
              Rencontrez la communauté, participez à nos ateliers et retraites pour
              enrichir votre séjour Amani aux Comores.
            </p>
          </motion.div>
        </div>
      </section>

      {isLoading ? (
        <div className="flex justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : isError ? (
        <div className="text-center py-24 text-muted-foreground">
          Impossible de charger les événements. Appliquez la migration{" "}
          <code className="text-sm">blog_events_cms</code>.
        </div>
      ) : (
        <>
          <section className="py-12">
            <div className="container mx-auto px-4">
              <h2 className="text-2xl font-bold text-foreground mb-8">
                Prochains événements
              </h2>
              {upcoming.length === 0 ? (
                <p className="text-muted-foreground text-center py-12">
                  Aucun événement à venir pour le moment.
                </p>
              ) : (
                <div className="grid md:grid-cols-2 gap-6">
                  {upcoming.map((event, index) => (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className="overflow-hidden h-full card-hover">
                        <div className="aspect-[16/9] overflow-hidden relative">
                          <img
                            src={
                              event.image_url ||
                              "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800"
                            }
                            alt={event.title}
                            className="w-full h-full object-cover"
                          />
                          <Badge
                            className={`absolute top-3 left-3 ${
                              typeColors[event.event_type] || "bg-muted"
                            }`}
                          >
                            {event.is_online ? (
                              <Video className="w-3 h-3 mr-1" />
                            ) : null}
                            {event.event_type}
                          </Badge>
                        </div>
                        <CardContent className="p-5 space-y-3">
                          <h3 className="text-xl font-semibold">{event.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {event.description}
                          </p>
                          <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {format(new Date(event.starts_at), "d MMMM yyyy", {
                                locale: fr,
                              })}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {format(new Date(event.starts_at), "HH:mm", {
                                locale: fr,
                              })}
                            </span>
                            {event.location && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                {event.location}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              {event.attendees_count} inscrits
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {past.length > 0 && (
            <section className="pb-16">
              <div className="container mx-auto px-4">
                <h2 className="text-2xl font-bold text-foreground mb-8">
                  Événements passés
                </h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {past.map((event) => (
                    <Card key={event.id} className="overflow-hidden opacity-90">
                      <div className="aspect-video overflow-hidden">
                        <img
                          src={
                            event.image_url ||
                            "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=400"
                          }
                          alt={event.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-medium">{event.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {format(new Date(event.starts_at), "MMMM yyyy", {
                            locale: fr,
                          })}{" "}
                          · {event.attendees_count} participants
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

export default EventsPage;
