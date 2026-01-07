import { motion } from "framer-motion";
import { ArrowRight, Star, Wifi, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";
import destinationLisbon from "@/assets/destination-lisbon.jpg";
import destinationBali from "@/assets/destination-bali.jpg";
import destinationBarcelona from "@/assets/destination-barcelona.jpg";
import destinationCapetown from "@/assets/destination-capetown.jpg";

interface Destination {
  id: string;
  name: string;
  country: string;
  image: string;
  rating: number;
  coworkingSpaces: number;
  priceFrom: number;
  carbonScore: "A" | "B" | "C";
  highlight: string;
}

const destinations: Destination[] = [
  {
    id: "lisbon",
    name: "Lisbonne",
    country: "Portugal",
    image: destinationLisbon,
    rating: 4.9,
    coworkingSpaces: 85,
    priceFrom: 45,
    carbonScore: "A",
    highlight: "Meilleur rapport qualité-prix",
  },
  {
    id: "bali",
    name: "Ubud, Bali",
    country: "Indonésie",
    image: destinationBali,
    rating: 4.8,
    coworkingSpaces: 62,
    priceFrom: 35,
    carbonScore: "B",
    highlight: "Communauté nomade active",
  },
  {
    id: "barcelona",
    name: "Barcelone",
    country: "Espagne",
    image: destinationBarcelona,
    rating: 4.7,
    coworkingSpaces: 120,
    priceFrom: 55,
    carbonScore: "A",
    highlight: "Plage + City life",
  },
  {
    id: "capetown",
    name: "Le Cap",
    country: "Afrique du Sud",
    image: destinationCapetown,
    rating: 4.8,
    coworkingSpaces: 45,
    priceFrom: 40,
    carbonScore: "B",
    highlight: "Nature & aventure",
  },
];

const carbonScoreColors = {
  A: "bg-success text-success-foreground",
  B: "bg-primary text-primary-foreground",
  C: "bg-warning text-warning-foreground",
};

const DestinationsSection = () => {
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
              Destinations populaires
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-3xl md:text-4xl font-bold text-foreground mt-2"
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
            <Button variant="outline" className="group">
              Voir toutes les destinations
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </motion.div>
        </div>

        {/* Destinations Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {destinations.map((destination, index) => (
            <motion.article
              key={destination.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group cursor-pointer"
            >
              <div className="card-hover rounded-2xl overflow-hidden bg-card">
                {/* Image */}
                <div className="relative aspect-[4/5] overflow-hidden">
                  <img
                    src={destination.image}
                    alt={`${destination.name}, ${destination.country}`}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent" />
                  
                  {/* Badges */}
                  <div className="absolute top-4 left-4 right-4 flex items-start justify-between">
                    <span className="px-3 py-1 rounded-full bg-background/90 backdrop-blur-sm text-xs font-medium text-foreground">
                      {destination.highlight}
                    </span>
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${carbonScoreColors[destination.carbonScore]}`}>
                      {destination.carbonScore}
                    </span>
                  </div>

                  {/* Bottom Info */}
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-xl font-bold text-primary-foreground mb-1">
                      {destination.name}
                    </h3>
                    <p className="text-sm text-primary-foreground/80">{destination.country}</p>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1.5">
                      <Star className="w-4 h-4 text-warning fill-warning" />
                      <span className="text-sm font-medium text-foreground">{destination.rating}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Wifi className="w-4 h-4" />
                      <span className="text-sm">{destination.coworkingSpaces} espaces</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-lg font-bold text-foreground">
                        {destination.priceFrom}€
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
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DestinationsSection;
