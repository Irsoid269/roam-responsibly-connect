import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { Star, Loader2, PenLine, MapPin, ShieldCheck } from "lucide-react";
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
import ReportDialog from "@/components/moderation/ReportDialog";
import { useApprovedReviews, useDestinations } from "@/hooks/useCatalogQueries";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const ReviewsPage = () => {
  const { t } = useTranslation("reviews");
  const typeLabels: Record<string, string> = {
    destination: t("types.destination"),
    coworking: t("types.coworking"),
    accommodation: t("types.accommodation"),
    activity: t("types.activity"),
  };
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
      toast.info(t("loginToReview"));
      navigate("/login");
      return;
    }
    setDialogOpen(true);
  };

  return (
    <main className="page-main">
      <PageHero
        eyebrow={t("hero.eyebrow")}
        title={t("hero.title")}
        description={t("hero.description")}
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
            <p className="text-sm text-muted-foreground mt-1">{t("avgRating")}</p>
          </div>
          <div>
            <p className="font-display text-3xl font-medium">{reviews.length}</p>
            <p className="text-sm text-muted-foreground mt-2">{t("reviewsPublished")}</p>
          </div>
        </div>
        <Button onClick={openSubmit} className="gap-2">
          <PenLine className="w-4 h-4" />
          {t("leaveReview")}
        </Button>
      </PageHero>

      <section className="py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="flex justify-between items-center mb-6 gap-4">
            <p className="text-sm text-muted-foreground">
              {t("resultsCount", { count: filtered.length })}
            </p>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={t("filterPlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("filters.all")}</SelectItem>
                <SelectItem value="destination">{t("filters.destination")}</SelectItem>
                <SelectItem value="coworking">{t("filters.coworking")}</SelectItem>
                <SelectItem value="accommodation">{t("filters.accommodation")}</SelectItem>
                <SelectItem value="activity">{t("filters.activity")}</SelectItem>
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
                <p className="font-medium">{t("empty.title")}</p>
                <p className="text-sm text-muted-foreground mt-2">
                  {t("empty.subtitle")}
                </p>
                <Button onClick={openSubmit} className="mt-4 gap-2">
                  <PenLine className="w-4 h-4" />
                  {t("empty.cta")}
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
                          <div className="flex items-center gap-1.5 mb-2">
                            <Badge variant="secondary">
                              {typeLabels[review.target_type] || review.target_type}
                            </Badge>
                            {review.verified && (
                              <Badge
                                variant="outline"
                                className="bg-success/10 text-success border-success/30 gap-1"
                                title={t("verifiedTooltip")}
                              >
                                <ShieldCheck className="w-3 h-3" />
                                {t("verified")}
                              </Badge>
                            )}
                          </div>
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
                      <div className="flex items-center justify-between mt-3">
                        <p className="text-xs text-muted-foreground">
                          {review.author_display_name
                            ? `${review.author_display_name} · `
                            : ""}
                          {formatDistanceToNow(new Date(review.created_at), {
                            addSuffix: true,
                            locale: fr,
                          })}
                        </p>
                        <ReportDialog targetType="review" targetId={review.id} compact />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}

          <p className="text-center text-sm text-muted-foreground mt-10">
            {t("footerPrompt.question")}{" "}
            <button
              type="button"
              onClick={openSubmit}
              className="text-primary underline underline-offset-2"
            >
              {t("footerPrompt.share")}
            </button>{" "}
            {t("footerPrompt.or")}{" "}
            <Link to="/destinations" className="text-primary underline underline-offset-2">
              {t("footerPrompt.destinations")}
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
