import { motion } from "framer-motion";
import { Calendar, Clock, User, ArrowRight, Leaf, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Link } from "react-router-dom";

const blogPosts = [
  {
    id: "1",
    title: "Comment réduire son empreinte carbone en voyageant",
    excerpt: "Découvrez nos conseils pratiques pour voyager de manière plus responsable sans sacrifier le plaisir de l'aventure.",
    image: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800",
    category: "Guides",
    author: "Marie Dupont",
    date: "15 janvier 2026",
    readTime: "8 min",
    featured: true,
  },
  {
    id: "2",
    title: "Top 10 des destinations éco-responsables pour 2026",
    excerpt: "Notre sélection des meilleures destinations qui allient beauté naturelle et engagement environnemental.",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
    category: "Destinations",
    author: "Thomas Martin",
    date: "12 janvier 2026",
    readTime: "6 min",
    featured: false,
  },
  {
    id: "3",
    title: "Mon expérience de coworkation à Bali",
    excerpt: "Récit d'un mois de travail remote au cœur de la jungle indonésienne, entre productivité et découvertes.",
    image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800",
    category: "Récits",
    author: "Sophie Lemoine",
    date: "8 janvier 2026",
    readTime: "12 min",
    featured: false,
  },
  {
    id: "4",
    title: "Les meilleurs espaces de coworking à Lisbonne",
    excerpt: "Notre guide complet des espaces de travail partagé dans la capitale portugaise.",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800",
    category: "Coworking",
    author: "Pierre Durand",
    date: "5 janvier 2026",
    readTime: "5 min",
    featured: false,
  },
  {
    id: "5",
    title: "Comprendre la compensation carbone",
    excerpt: "Tout ce que vous devez savoir sur les mécanismes de compensation et comment choisir des projets fiables.",
    image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800",
    category: "Environnement",
    author: "Claire Bernard",
    date: "2 janvier 2026",
    readTime: "10 min",
    featured: false,
  },
];

const categories = ["Tous", "Guides", "Destinations", "Récits", "Coworking", "Environnement"];

const BlogPage = () => {
  const featuredPost = blogPosts.find((post) => post.featured);
  const regularPosts = blogPosts.filter((post) => !post.featured);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-16">
        {/* Hero */}
        <section className="bg-gradient-to-b from-primary-light to-background py-12">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center max-w-3xl mx-auto"
            >
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                Blog & Récits
              </h1>
              <p className="text-lg text-muted-foreground">
                Inspirez-vous des aventures de notre communauté et découvrez 
                nos conseils pour voyager de manière responsable.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Categories */}
        <section className="py-6 border-b">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap gap-2 justify-center">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={category === "Tous" ? "default" : "outline"}
                  size="sm"
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Post */}
        {featuredPost && (
          <section className="py-12">
            <div className="container mx-auto px-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="overflow-hidden card-hover">
                  <div className="grid md:grid-cols-2">
                    <div className="relative aspect-video md:aspect-auto overflow-hidden">
                      <img
                        src={featuredPost.image}
                        alt={featuredPost.title}
                        className="w-full h-full object-cover"
                      />
                      <Badge className="absolute top-4 left-4 bg-primary text-primary-foreground">
                        À la une
                      </Badge>
                    </div>
                    <CardContent className="p-6 md:p-8 flex flex-col justify-center">
                      <Badge variant="secondary" className="w-fit mb-3">
                        {featuredPost.category}
                      </Badge>
                      <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
                        {featuredPost.title}
                      </h2>
                      <p className="text-muted-foreground mb-4">{featuredPost.excerpt}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                        <span className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          {featuredPost.author}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {featuredPost.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {featuredPost.readTime}
                        </span>
                      </div>
                      <Button className="w-fit">
                        Lire l'article
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </CardContent>
                  </div>
                </Card>
              </motion.div>
            </div>
          </section>
        )}

        {/* Posts Grid */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {regularPosts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="overflow-hidden card-hover h-full flex flex-col">
                    <div className="relative aspect-video overflow-hidden">
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                      />
                      <Badge className="absolute top-3 left-3 bg-background/90 text-foreground">
                        {post.category}
                      </Badge>
                    </div>
                    <CardContent className="p-4 flex-1 flex flex-col">
                      <h3 className="font-semibold text-foreground mb-2 line-clamp-2">
                        {post.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4 flex-1 line-clamp-3">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {post.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {post.readTime}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            <div className="text-center mt-12">
              <Button variant="outline" size="lg">
                Charger plus d'articles
              </Button>
            </div>
          </div>
        </section>

        {/* Newsletter CTA */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center max-w-2xl mx-auto"
            >
              <Leaf className="w-10 h-10 mx-auto mb-4 text-primary" />
              <h2 className="text-2xl font-bold text-foreground mb-3">
                Restez inspiré
              </h2>
              <p className="text-muted-foreground mb-6">
                Recevez nos meilleurs articles et conseils directement dans votre boîte mail.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="votre@email.com"
                  className="flex-1 px-4 py-2 rounded-lg border border-border bg-background"
                />
                <Button>S'inscrire</Button>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default BlogPage;
