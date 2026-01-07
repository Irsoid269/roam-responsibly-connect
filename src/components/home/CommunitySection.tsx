import { motion } from "framer-motion";
import { Heart, MessageCircle, MapPin, Calendar, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const communityPosts = [
  {
    id: 1,
    author: {
      name: "Marie L.",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
      location: "Paris",
    },
    destination: "Lisbonne, Portugal",
    date: "Il y a 2 jours",
    content: "Un mois incroyable à Lisbonne ! Le coworking Factory était parfait, super connexion et vue sur le Tage. Les pastéis de nata du quartier sont à tomber 🇵🇹",
    image: "https://images.unsplash.com/photo-1585208798174-6cedd86e019a?w=600&h=400&fit=crop",
    likes: 124,
    comments: 18,
  },
  {
    id: 2,
    author: {
      name: "Thomas R.",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
      location: "Lyon",
    },
    destination: "Ubud, Bali",
    date: "Il y a 5 jours",
    content: "Les rizières au lever du soleil depuis Hubud... Aucun open space ne peut rivaliser avec ça. Le plus dur : se concentrer sur le code ! 🌅",
    image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&h=400&fit=crop",
    likes: 89,
    comments: 12,
  },
  {
    id: 3,
    author: {
      name: "Sophie M.",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
      location: "Bordeaux",
    },
    destination: "Barcelone, Espagne",
    date: "Il y a 1 semaine",
    content: "Week-end prolongé à Barcelone avec l'équipe remote. On a mixé coworking le matin, plage l'après-midi et tapas le soir. La recette parfaite ! 🏖️",
    image: "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=600&h=400&fit=crop",
    likes: 156,
    comments: 24,
  },
];

const CommunitySection = () => {
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-primary font-medium text-sm uppercase tracking-wider"
            >
              Communauté
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-3xl md:text-4xl font-bold text-foreground mt-2"
            >
              Récits de coworkateurs
            </motion.h2>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <Button variant="outline" className="group">
              Rejoindre la communauté
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </motion.div>
        </div>

        {/* Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {communityPosts.map((post, index) => (
            <motion.article
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="card-hover rounded-2xl overflow-hidden bg-card border border-border/50"
            >
              {/* Post Image */}
              <div className="aspect-[3/2] overflow-hidden">
                <img
                  src={post.image}
                  alt={post.destination}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>

              {/* Post Content */}
              <div className="p-5">
                {/* Author */}
                <div className="flex items-center gap-3 mb-4">
                  <img
                    src={post.author.avatar}
                    alt={post.author.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{post.author.name}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {post.destination}
                      </span>
                      <span>•</span>
                      <span>{post.date}</span>
                    </div>
                  </div>
                </div>

                {/* Text */}
                <p className="text-foreground/80 text-sm leading-relaxed mb-4">
                  {post.content}
                </p>

                {/* Actions */}
                <div className="flex items-center gap-4 pt-4 border-t border-border">
                  <button className="flex items-center gap-1.5 text-muted-foreground hover:text-secondary transition-colors">
                    <Heart className="w-4 h-4" />
                    <span className="text-sm">{post.likes}</span>
                  </button>
                  <button className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors">
                    <MessageCircle className="w-4 h-4" />
                    <span className="text-sm">{post.comments}</span>
                  </button>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CommunitySection;
