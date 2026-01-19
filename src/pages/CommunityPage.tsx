import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Users, Leaf, MapPin, Star, TreePine, Globe, 
  MessageCircle, Heart, Award, TrendingUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

// Mock data for community members
const mockMembers = [
  {
    id: "1",
    name: "Sophie Martin",
    avatar: "",
    location: "Paris → Lisbonne",
    carbonSaved: 245,
    tripsCount: 8,
    badge: "Eco Pioneer",
  },
  {
    id: "2",
    name: "Thomas Dubois",
    avatar: "",
    location: "Lyon → Bali",
    carbonSaved: 180,
    tripsCount: 5,
    badge: "Carbon Saver",
  },
  {
    id: "3",
    name: "Marie Chen",
    avatar: "",
    location: "Marseille → Barcelone",
    carbonSaved: 320,
    tripsCount: 12,
    badge: "Planet Hero",
  },
  {
    id: "4",
    name: "Lucas Bernard",
    avatar: "",
    location: "Bordeaux → Le Cap",
    carbonSaved: 150,
    tripsCount: 4,
    badge: "Explorer",
  },
];

const mockReviews = [
  {
    id: "1",
    author: "Sophie Martin",
    destination: "Lisbonne",
    rating: 5,
    comment: "Incroyable expérience de coworkation ! Les espaces de travail sont top et la communauté super accueillante.",
    date: "Il y a 2 jours",
  },
  {
    id: "2",
    author: "Thomas Dubois",
    destination: "Bali",
    rating: 4,
    comment: "Ubud est parfait pour travailler en remote. WiFi stable et cadre inspirant.",
    date: "Il y a 1 semaine",
  },
  {
    id: "3",
    author: "Marie Chen",
    destination: "Barcelone",
    rating: 5,
    comment: "Le meilleur équilibre entre vie professionnelle et découverte culturelle !",
    date: "Il y a 2 semaines",
  },
];

const communityStats = [
  { icon: Users, label: "Membres actifs", value: "2,450+", color: "text-primary" },
  { icon: TreePine, label: "CO₂ économisé", value: "45 tonnes", color: "text-carbon" },
  { icon: Globe, label: "Pays visités", value: "35+", color: "text-accent" },
  { icon: Star, label: "Note moyenne", value: "4.8/5", color: "text-warning" },
];

const CommunityPage = () => {
  const [activeTab, setActiveTab] = useState("members");

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-16">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-primary-light to-background py-12 md:py-20">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center max-w-3xl mx-auto"
            >
              <Badge variant="outline" className="mb-4 bg-carbon-light text-carbon border-carbon/20">
                <Leaf className="w-3 h-3 mr-1" />
                Communauté engagée
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                Notre communauté de voyageurs responsables
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                Rejoignez des milliers de nomades digitaux qui choisissent de voyager 
                en réduisant leur impact environnemental.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg">
                  <Users className="w-4 h-4 mr-2" />
                  Rejoindre la communauté
                </Button>
                <Button size="lg" variant="outline">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Accéder au forum
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6"
            >
              {communityStats.map((stat, index) => (
                <Card key={index} className="text-center">
                  <CardContent className="pt-6">
                    <stat.icon className={`w-10 h-10 mx-auto mb-3 ${stat.color}`} />
                    <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
                  </CardContent>
                </Card>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full md:w-auto justify-start mb-8">
                <TabsTrigger value="members" className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Membres
                </TabsTrigger>
                <TabsTrigger value="reviews" className="flex items-center gap-2">
                  <Star className="w-4 h-4" />
                  Avis
                </TabsTrigger>
                <TabsTrigger value="leaderboard" className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Classement
                </TabsTrigger>
              </TabsList>

              <TabsContent value="members">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {mockMembers.map((member, index) => (
                    <motion.div
                      key={member.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="text-center card-hover">
                        <CardContent className="pt-6">
                          <Avatar className="w-20 h-20 mx-auto mb-4">
                            <AvatarImage src={member.avatar} />
                            <AvatarFallback className="text-xl bg-primary text-primary-foreground">
                              {member.name.split(" ").map((n) => n[0]).join("")}
                            </AvatarFallback>
                          </Avatar>
                          <h3 className="font-semibold text-foreground">{member.name}</h3>
                          <p className="text-sm text-muted-foreground flex items-center justify-center gap-1 mt-1">
                            <MapPin className="w-3 h-3" />
                            {member.location}
                          </p>
                          
                          <Badge variant="secondary" className="mt-3 bg-carbon-light text-carbon">
                            <Award className="w-3 h-3 mr-1" />
                            {member.badge}
                          </Badge>

                          <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t">
                            <div>
                              <p className="text-lg font-bold text-carbon">{member.carbonSaved} kg</p>
                              <p className="text-xs text-muted-foreground">CO₂ économisé</p>
                            </div>
                            <div>
                              <p className="text-lg font-bold text-primary">{member.tripsCount}</p>
                              <p className="text-xs text-muted-foreground">Voyages</p>
                            </div>
                          </div>

                          <Button variant="outline" size="sm" className="w-full mt-4">
                            Voir le profil
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="reviews">
                <div className="space-y-4 max-w-3xl mx-auto">
                  {mockReviews.map((review, index) => (
                    <motion.div
                      key={review.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card>
                        <CardContent className="pt-6">
                          <div className="flex items-start gap-4">
                            <Avatar>
                              <AvatarFallback className="bg-primary text-primary-foreground">
                                {review.author.split(" ").map((n) => n[0]).join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <div>
                                  <h4 className="font-medium text-foreground">{review.author}</h4>
                                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                                    <MapPin className="w-3 h-3" />
                                    {review.destination} • {review.date}
                                  </p>
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
                              <p className="mt-3 text-muted-foreground">{review.comment}</p>
                              <div className="flex items-center gap-4 mt-4">
                                <button className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
                                  <Heart className="w-4 h-4" />
                                  12
                                </button>
                                <button className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
                                  <MessageCircle className="w-4 h-4" />
                                  Répondre
                                </button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="leaderboard">
                <Card className="max-w-2xl mx-auto">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-primary" />
                      Top éco-voyageurs du mois
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {mockMembers
                        .sort((a, b) => b.carbonSaved - a.carbonSaved)
                        .map((member, index) => (
                          <motion.div
                            key={member.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-center gap-4 p-4 rounded-lg hover:bg-muted transition-colors"
                          >
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                              index === 0 ? "bg-warning text-warning-foreground" :
                              index === 1 ? "bg-muted-foreground/30 text-foreground" :
                              index === 2 ? "bg-secondary text-secondary-foreground" :
                              "bg-muted text-muted-foreground"
                            }`}>
                              {index + 1}
                            </div>
                            <Avatar>
                              <AvatarFallback className="bg-primary text-primary-foreground">
                                {member.name.split(" ").map((n) => n[0]).join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <p className="font-medium text-foreground">{member.name}</p>
                              <p className="text-sm text-muted-foreground">{member.badge}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-carbon flex items-center gap-1">
                                <Leaf className="w-4 h-4" />
                                {member.carbonSaved} kg
                              </p>
                              <p className="text-xs text-muted-foreground">CO₂ économisé</p>
                            </div>
                          </motion.div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-r from-primary to-accent">
          <div className="container mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Leaf className="w-12 h-12 mx-auto mb-4 text-primary-foreground opacity-80" />
              <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
                Ensemble, réduisons notre empreinte
              </h2>
              <p className="text-lg text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
                Chaque voyage compte. Rejoignez notre communauté et contribuez à un tourisme plus durable.
              </p>
              <Button size="lg" variant="secondary">
                Créer mon compte
              </Button>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default CommunityPage;
