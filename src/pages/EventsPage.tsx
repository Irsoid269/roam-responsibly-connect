import { motion } from "framer-motion";
import { Calendar, MapPin, Users, Clock, Video, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const upcomingEvents = [
  {
    id: "1",
    title: "Meetup Coworkation Paris",
    description: "Rencontrez d'autres nomades digitaux parisiens et partagez vos expériences de coworkation.",
    date: "25 janvier 2026",
    time: "19:00",
    location: "Station F, Paris",
    type: "En personne",
    attendees: 45,
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800",
  },
  {
    id: "2",
    title: "Webinaire: Travailler depuis Bali",
    description: "Conseils pratiques pour organiser votre coworkation à Bali: visa, coût de vie, meilleurs spots.",
    date: "28 janvier 2026",
    time: "14:00",
    location: "En ligne",
    type: "Webinaire",
    attendees: 120,
    image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800",
  },
  {
    id: "3",
    title: "Retraite Coworkation Lisbonne",
    description: "Une semaine de travail et de networking dans la capitale portugaise avec la communauté Coworkation.",
    date: "15-22 février 2026",
    time: "Toute la journée",
    location: "Lisbonne, Portugal",
    type: "Retraite",
    attendees: 25,
    image: "https://images.unsplash.com/photo-1585208798174-6cedd86e019a?w=800",
  },
  {
    id: "4",
    title: "Atelier: Compensation carbone",
    description: "Apprenez à mesurer et compenser efficacement votre empreinte carbone en tant que voyageur.",
    date: "5 février 2026",
    time: "18:30",
    location: "Impact Hub, Lyon",
    type: "Atelier",
    attendees: 30,
    image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800",
  },
];

const pastEvents = [
  {
    id: "5",
    title: "Summit Nomades Digitaux 2025",
    date: "Décembre 2025",
    attendees: 500,
    image: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=400",
  },
  {
    id: "6",
    title: "Beach Cleanup Barcelone",
    date: "Novembre 2025",
    attendees: 80,
    image: "https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?w=400",
  },
  {
    id: "7",
    title: "Hackathon Green Tech",
    date: "Octobre 2025",
    attendees: 150,
    image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=400",
  },
];

const typeColors: Record<string, string> = {
  "En personne": "bg-primary text-primary-foreground",
  "Webinaire": "bg-accent text-accent-foreground",
  "Retraite": "bg-secondary text-secondary-foreground",
  "Atelier": "bg-success text-success-foreground",
};

const EventsPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-16">
        {/* Hero */}
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
                enrichir votre expérience de coworkation.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Upcoming Events */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-foreground mb-8">Prochains événements</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              {upcomingEvents.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="overflow-hidden card-hover h-full">
                    <div className="relative aspect-video overflow-hidden">
                      <img
                        src={event.image}
                        alt={event.title}
                        className="w-full h-full object-cover"
                      />
                      <Badge className={`absolute top-3 right-3 ${typeColors[event.type]}`}>
                        {event.type === "Webinaire" && <Video className="w-3 h-3 mr-1" />}
                        {event.type}
                      </Badge>
                    </div>
                    <CardContent className="p-5">
                      <h3 className="text-xl font-semibold text-foreground mb-2">
                        {event.title}
                      </h3>
                      <p className="text-muted-foreground text-sm mb-4">
                        {event.description}
                      </p>
                      
                      <div className="space-y-2 text-sm text-muted-foreground mb-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {event.date}
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          {event.time}
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          {event.location}
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          {event.attendees} participants inscrits
                        </div>
                      </div>

                      <Button className="w-full">
                        S'inscrire
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Past Events */}
        <section className="py-12 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-foreground mb-8">Événements passés</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {pastEvents.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="overflow-hidden">
                    <div className="relative aspect-video overflow-hidden">
                      <img
                        src={event.image}
                        alt={event.title}
                        className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all"
                      />
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-foreground mb-1">{event.title}</h3>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>{event.date}</span>
                        <span>{event.attendees} participants</span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl font-bold text-foreground mb-3">
              Vous organisez un événement ?
            </h2>
            <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
              Proposez votre événement à notre communauté de voyageurs responsables.
            </p>
            <Button variant="outline">
              Proposer un événement
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default EventsPage;
