import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { Star, Loader2, PenLine, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import PageHero from "@/components/layout/PageHero";
import SubmitReviewDialog from "@/components/reviews/SubmitReviewDialog";
import { useApprovedReviews, useDestinations } from "@/hooks/useCatalogQueries";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const typeLabels: Record<string, string> = {
  destination: "Destination",
  coworking: "Coworking",
  accommodation: "Hébergement",
  activity: "Activité",
};

const ReviewsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: reviews = [], isLoading } = useApprovedReviews();
  const { data: destinations = [] } = useDestinations();
  const [filter, setFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);

  const destName = (id: string) =>
    destinations.find((d) => d.id === id)?.name || id.slice(0, 8);

  const filtered = useMemo(
    () =>
      filter === "all" ? reviews : reviews.filter((r) => r.target_type === filter),
    [filter, reviews]
  );

  const avg =
    reviews.length > 0
      ? reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length
      : 0;

  const openSubmit = () => {
    if (!user) {
      toast.info("Connectez-vous pour laisser un avis");
      navigate("/login");
      return;
    }
    setDialogOpen(true);
  };

  return (
    <main className="page-main">
      <PageHero
        eyebrow="Communauté"
        title="Avis voyageurs"
        description="Retours d'expérience validés par l'équipe Amani pour préparer votre séjour aux Comores."
      >
        <div className="flex flex-wrap justify-center gap-8 text-center mb-6">
          <div>
            <p className="font-display text-3xl font-medium">
              {avg ? avg.toFixed(1) : "—"}
            </p>
            <div className="flex gap-0.5 justify-center mt-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.round(avg)
                      ? "text-warning fill-warning"
                      : "text-muted-foreground"
                  }`}
                />
              ))}
            </div>
            <p className="text-sm text-muted-foreground mt-1">Note moyenne</p>
          </div>
          <div>
            <p className="font-display text-3xl font-medium">{reviews.length}</p>
            <p className="text-sm text-muted-foreground mt-2">Avis publiés</p>
          </div>
        </div>
        <Button onClick={openSubmit} className="gap-2">
          <PenLine className="w-4 h-4" />
          Laisser un avis
        </Button>
      </PageHero>

      <section className="py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="flex justify-between items-center mb-6 gap-4">
            <p className="text-sm text-muted-foreground">
              {filtered.length} avis
            </p>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="destination">Destinations</SelectItem>
                <SelectItem value="coworking">Coworkings</SelectItem>
                <SelectItem value="accommodation">Hébergements</SelectItem>
                <SelectItem value="activity">Activités</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filtered.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="font-medium">Aucun avis publié pour le moment</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Soyez le premier — votre avis apparaîtra après validation.
                </p>
                <Button onClick={openSubmit} className="mt-4 gap-2">
                  <PenLine className="w-4 h-4" />
                  Écrire un avis
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filtered.map((review, index) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                >
                  <Card className="card-hover">
                    <CardContent className="p-5">
                      <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                        <div>
                          <Badge variant="secondary" className="mb-2">
                            {typeLabels[review.target_type] || review.target_type}
                          </Badge>
                          <p className="font-medium flex items-center gap-1.5">
                            <MapPin className="w-4 h-4 text-accent" />
                            {review.target_type === "destination"
                              ? destName(review.target_id)
                              : `${review.target_type} · ${review.target_id.slice(0, 8)}…`}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < review.rating
                                  ? "text-warning fill-warning"
                                  : "text-muted-foreground/40"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-foreground leading-relaxed">
                        {review.comment || "—"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-3">
                        {review.author_display_name
                          ? `${review.author_display_name} · `
                          : ""}
                        {formatDistanceToNow(new Date(review.created_at), {
                          addSuffix: true,
                          locale: fr,
                        })}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}

          <p className="text-center text-sm text-muted-foreground mt-10">
            Vous avez voyagé avec Amani ?{" "}
            <button
              type="button"
              onClick={openSubmit}
              className="text-primary underline underline-offset-2"
            >
              Partagez votre expérience
            </button>{" "}
            ou explorez nos{" "}
            <Link to="/destinations" className="text-primary underline underline-offset-2">
              destinations
            </Link>
            .
          </p>
        </div>
      </section>

      <SubmitReviewDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </main>
  );
};

export default ReviewsPage;
