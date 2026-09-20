import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Users,
  Leaf,
  MapPin,
  Star,
  TreePine,
  MessageCircle,
  PenLine,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PageHero from "@/components/layout/PageHero";
import SubmitStoryDialog from "@/components/community/SubmitStoryDialog";
import StoryEngagement from "@/components/community/StoryEngagement";
import {
  useApprovedCommunityStories,
  useApprovedReviews,
  useCatalogCounts,
  useCommunityLeaders,
  useMyStoryLikes,
} from "@/hooks/useCatalogQueries";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const CommunityPage = () => {
  const { t } = useTranslation("community");
  const { user } = useAuth();
  const navigate = useNavigate();
  const [storyOpen, setStoryOpen] = useState(false);
  const { data: leaders = [], isLoading: leadersLoading } = useCommunityLeaders();
  const { data: stories = [], isLoading: storiesLoading } = useApprovedCommunityStories(9);
  const { data: likedIds } = useMyStoryLikes(user?.id);
  const { data: reviews = [] } = useApprovedReviews();
  const { data: counts } = useCatalogCounts();

  const stats = useMemo(() => {
    const carbon = leaders.reduce((s, p) => s + Number(p.total_carbon_saved || 0), 0);
    const avg =
      reviews.length > 0
        ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
        : 0;
    return [
      {
        icon: Users,
        label: t("stats.travelers"),
        value: String(counts?.travelers ?? leaders.length),
        color: "text-primary",
      },
      {
        icon: TreePine,
        label: t("stats.carbonOffset"),
        value: `${Math.round(carbon)} kg`,
        color: "text-carbon",
      },
      {
        icon: MapPin,
        label: t("stats.destinations"),
        value: String(counts?.destinations ?? "—"),
        color: "text-accent",
      },
      {
        icon: Star,
        label: t("stats.avgRating"),
        value: avg ? `${avg.toFixed(1)}/5` : "—",
        color: "text-warning",
      },
    ];
  }, [leaders, reviews, counts, t]);

  const openStory = () => {
    if (!user) {
      toast.info(t("stories.loginToShare"));
      navigate("/login");
      return;
    }
    setStoryOpen(true);
  };

  const badgeFor = (carbon: number, trips: number) => {
    if (carbon >= 200 || trips >= 8) return t("travelers.badges.ecoPioneer");
    if (carbon >= 100 || trips >= 4) return t("travelers.badges.carbonSaver");
    if (trips >= 1) return t("travelers.badges.explorer");
    return t("travelers.badges.newcomer");
  };

  return (
    <main className="page-main">
      <PageHero
        eyebrow={t("hero.eyebrow")}
        title={t("hero.title")}
        description={t("hero.description")}
      >
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button size="lg" onClick={openStory} className="gap-2">
            <PenLine className="w-4 h-4" />
            {t("shareStory")}
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link to="/reviews">
              <MessageCircle className="w-4 h-4 mr-2" />
              {t("viewReviews")}
            </Link>
          </Button>
        </div>
      </PageHero>

      <section className="py-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-12">
            {stats.map((stat) => (
              <Card key={stat.label} className="text-center">
                <CardContent className="pt-6 pb-5">
                  <stat.icon className={`w-6 h-6 mx-auto mb-2 ${stat.color}`} />
                  <p className="font-display text-2xl font-medium">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Tabs defaultValue="stories" className="max-w-5xl mx-auto">
            <TabsList className="mb-6">
              <TabsTrigger value="stories">{t("tabs.stories")}</TabsTrigger>
              <TabsTrigger value="members">{t("tabs.travelers")}</TabsTrigger>
              <TabsTrigger value="reviews">{t("tabs.reviews")}</TabsTrigger>
            </TabsList>

            <TabsContent value="stories">
              {storiesLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : stories.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="font-medium">{t("stories.empty")}</p>
                    <Button onClick={openStory} className="mt-4 gap-2">
                      <PenLine className="w-4 h-4" />
                      {t("stories.beFirst")}
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {stories.map((story, i) => (
                    <motion.div
                      key={story.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <Card className="h-full card-hover overflow-hidden">
                        {story.image_url && (
                          <img
                            src={story.image_url}
                            alt=""
                            className="w-full h-36 object-cover"
                          />
                        )}
                        <CardContent className="p-4">
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mb-2">
                            <MapPin className="w-3 h-3" />
                            {story.destination}
                          </p>
                          <p className="text-sm leading-relaxed line-clamp-4">
                            {story.content}
                          </p>
                          <div className="mt-4 pt-3 border-t space-y-2">
                            <p className="text-sm font-medium">{story.author_name}</p>
                            <StoryEngagement
                              storyId={story.id}
                              likesCount={story.likes_count}
                              commentsCount={story.comments_count}
                              likedByMe={likedIds?.has(story.id) ?? false}
                              compact
                            />
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="members">
              {leadersLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : leaders.length === 0 ? (
                <p className="text-center text-muted-foreground py-12">
                  {t("travelers.empty")}
                </p>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {leaders.map((member) => (
                    <Card key={member.id} className="card-hover">
                      <CardContent className="p-5 flex items-center gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={member.avatar_url || undefined} />
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            {(member.full_name || "A").charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="font-medium truncate">
                            {member.full_name || t("travelers.defaultName")}
                          </p>
                          <Badge variant="outline" className="mt-1 text-xs">
                            {badgeFor(
                              Number(member.total_carbon_saved || 0),
                              Number(member.trips_count || 0)
                            )}
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1">
                            <Leaf className="w-3 h-3 text-accent" />
                            {member.total_carbon_saved || 0} kg ·{" "}
                            {t("travelers.trip", { count: member.trips_count || 0 })}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="reviews">
              {reviews.length === 0 ? (
                <p className="text-center text-muted-foreground py-12">
                  {t("reviews.empty")}{" "}
                  <Link to="/reviews" className="text-primary underline">
                    {t("reviews.leaveFirst")}
                  </Link>
                  .
                </p>
              ) : (
                <div className="space-y-3">
                  {reviews.slice(0, 8).map((review) => (
                    <Card key={review.id}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3.5 h-3.5 ${
                                  i < review.rating
                                    ? "text-warning fill-warning"
                                    : "text-muted-foreground/30"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-xs font-normal text-muted-foreground">
                            {formatDistanceToNow(new Date(review.created_at), {
                              addSuffix: true,
                              locale: fr,
                            })}
                          </span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {review.comment}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                  <div className="text-center pt-2">
                    <Button variant="outline" asChild>
                      <Link to="/reviews">{t("reviews.viewAll")}</Link>
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </section>

      <SubmitStoryDialog open={storyOpen} onOpenChange={setStoryOpen} />
    </main>
  );
};

export default CommunityPage;
