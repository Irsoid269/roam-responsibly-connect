import { useState } from "react";
import { motion } from "framer-motion";
import { Star, MapPin, Calendar, ThumbsUp, MessageCircle, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const reviews = [
  {
    id: "1",
    author: "Sophie Martin",
    avatar: "",
    destination: "Lisbonne, Portugal",
    rating: 5,
    title: "Une expérience inoubliable",
    content: "Mon séjour de coworkation à Lisbonne a dépassé toutes mes attentes. Les espaces de travail sont modernes, la communauté accueillante et la ville offre un équilibre parfait entre travail et découverte. Je recommande vivement !",
    date: "Il y a 3 jours",
    helpful: 24,
    type: "destination",
    images: ["https://images.unsplash.com/photo-1585208798174-6cedd86e019a?w=400"],
  },
  {
    id: "2",
    author: "Thomas Dubois",
    avatar: "",
    destination: "Hub Créatif, Lisbonne",
    rating: 5,
    title: "Le meilleur coworking que j'ai testé",
    content: "WiFi ultra-rapide, café excellent et vue incroyable sur le Tage. L'équipe est adorable et organise régulièrement des événements networking. C'est devenu mon QG à Lisbonne !",
    date: "Il y a 1 semaine",
    helpful: 18,
    type: "coworking",
    images: [],
  },
  {
    id: "3",
    author: "Marie Chen",
    avatar: "",
    destination: "Ubud, Bali",
    rating: 4,
    title: "Paradis tropical avec quelques défis",
    content: "Ubud est magique pour travailler et se ressourcer. Le cadre naturel est inspirant et les coworkings au milieu de la jungle sont uniques. Attention toutefois à la saison des pluies et prévoyez une bonne connexion mobile en backup.",
    date: "Il y a 2 semaines",
    helpful: 31,
    type: "destination",
    images: ["https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400"],
  },
  {
    id: "4",
    author: "Lucas Bernard",
    avatar: "",
    destination: "Eco Lodge Barcelone",
    rating: 5,
    title: "Hébergement éco-responsable au top",
    content: "Cet éco-lodge est parfait pour les nomades digitaux soucieux de l'environnement. Panneaux solaires, compost, jardin bio... Et le petit-déjeuner fait maison est un délice chaque matin !",
    date: "Il y a 3 semaines",
    helpful: 15,
    type: "accommodation",
    images: [],
  },
  {
    id: "5",
    author: "Claire Petit",
    avatar: "",
    destination: "Safari Photo, Le Cap",
    rating: 5,
    title: "Expérience unique et responsable",
    content: "Le safari photo avec le guide naturaliste était extraordinaire. On apprend énormément sur la faune locale tout en minimisant notre impact. Les photos que j'ai ramenées sont mes plus belles !",
    date: "Il y a 1 mois",
    helpful: 42,
    type: "activity",
    images: ["https://images.unsplash.com/photo-1516426122078-c23e76319801?w=400"],
  },
];

const typeLabels: Record<string, string> = {
  destination: "Destination",
  coworking: "Coworking",
  accommodation: "Hébergement",
  activity: "Activité",
};

const ReviewsPage = () => {
  const [filter, setFilter] = useState("all");

  const filteredReviews = filter === "all" 
    ? reviews 
    : reviews.filter(r => r.type === filter);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-16">
        {/* Hero */}
        <section className="bg-gradient-to-b from-warning/10 to-background py-12">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center max-w-3xl mx-auto"
            >
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                Avis voyageurs
              </h1>
              <p className="text-lg text-muted-foreground mb-6">
                Découvrez les retours d'expérience de notre communauté pour préparer au mieux votre prochaine coworkation.
              </p>
              
              {/* Stats */}
              <div className="flex justify-center gap-8 text-center">
                <div>
                  <p className="text-3xl font-bold text-foreground">4.8</p>
                  <div className="flex gap-0.5 justify-center mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-warning fill-warning" />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Note moyenne</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-foreground">2,450+</p>
                  <p className="text-sm text-muted-foreground mt-2">Avis vérifiés</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-foreground">98%</p>
                  <p className="text-sm text-muted-foreground mt-2">Recommandent</p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Filters */}
        <section className="py-6 border-b">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={filter === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter("all")}
                >
                  Tous les avis
                </Button>
                <Button
                  variant={filter === "destination" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter("destination")}
                >
                  Destinations
                </Button>
                <Button
                  variant={filter === "coworking" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter("coworking")}
                >
                  Coworkings
                </Button>
                <Button
                  variant={filter === "accommodation" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter("accommodation")}
                >
                  Hébergements
                </Button>
                <Button
                  variant={filter === "activity" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter("activity")}
                >
                  Activités
                </Button>
              </div>
              <Select defaultValue="recent">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Trier par" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Plus récents</SelectItem>
                  <SelectItem value="helpful">Plus utiles</SelectItem>
                  <SelectItem value="rating-high">Meilleures notes</SelectItem>
                  <SelectItem value="rating-low">Notes les plus basses</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </section>

        {/* Reviews */}
        <section className="py-8">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="space-y-6">
              {filteredReviews.map((review, index) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={review.avatar} />
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            {review.author.split(" ").map(n => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-semibold text-foreground">{review.author}</h3>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <MapPin className="w-3 h-3" />
                                {review.destination}
                                <Badge variant="secondary" className="text-xs">
                                  {typeLabels[review.type]}
                                </Badge>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < review.rating
                                      ? "text-warning fill-warning"
                                      : "text-muted"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>

                          <h4 className="font-medium text-foreground mb-2">{review.title}</h4>
                          <p className="text-muted-foreground mb-4">{review.content}</p>

                          {review.images.length > 0 && (
                            <div className="flex gap-2 mb-4">
                              {review.images.map((img, i) => (
                                <img
                                  key={i}
                                  src={img}
                                  alt=""
                                  className="w-24 h-24 object-cover rounded-lg"
                                />
                              ))}
                            </div>
                          )}

                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {review.date}
                            </span>
                            <div className="flex items-center gap-4">
                              <button className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
                                <ThumbsUp className="w-4 h-4" />
                                Utile ({review.helpful})
                              </button>
                              <button className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
                                <MessageCircle className="w-4 h-4" />
                                Répondre
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            <div className="text-center mt-8">
              <Button variant="outline" size="lg">
                Charger plus d'avis
              </Button>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-12 bg-muted/30">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl font-bold text-foreground mb-3">
              Partagez votre expérience
            </h2>
            <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
              Votre avis aide la communauté à découvrir les meilleures destinations et services.
            </p>
            <Button>
              Écrire un avis
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default ReviewsPage;
