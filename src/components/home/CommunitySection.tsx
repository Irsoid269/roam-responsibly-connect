import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { MapPin, ArrowRight, PenLine, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { useApprovedCommunityStories, useMyStoryLikes } from "@/hooks/useCatalogQueries";
import { useAuth } from "@/hooks/useAuth";
import SubmitStoryDialog from "@/components/community/SubmitStoryDialog";
import StoryEngagement from "@/components/community/StoryEngagement";
import { toast } from "sonner";

const CommunitySection = () => {
  const { t } = useTranslation("home");
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: stories = [], isLoading } = useApprovedCommunityStories(6);
  const { data: likedIds } = useMyStoryLikes(user?.id);
  const [dialogOpen, setDialogOpen] = useState(false);

  const openSubmit = () => {
    if (!user) {
      toast.info(t("community.loginToShare"));
      navigate("/login");
      return;
    }
    setDialogOpen(true);
  };

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="section-eyebrow"
            >
              {t("community.eyebrow")}
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="font-display text-3xl md:text-4xl font-medium text-foreground mt-3"
            >
              {t("community.title")}
            </motion.h2>
            <p className="mt-2 text-sm text-muted-foreground max-w-xl">
              {t("community.subtitle")}
            </p>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap gap-3"
          >
            <Button onClick={openSubmit} className="gap-2">
              <PenLine className="w-4 h-4" />
              {t("community.shareCta")}
            </Button>
            <Button variant="outline" className="group" asChild>
              <Link to="/community">
                {t("community.viewCommunity")}
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </motion.div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : stories.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-10 text-center">
            <p className="font-medium text-foreground">{t("community.emptyTitle")}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              {t("community.emptySubtitle")}
            </p>
            <Button onClick={openSubmit} className="mt-6 gap-2">
              <PenLine className="w-4 h-4" />
              {t("community.shareCta")}
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stories.map((post, index) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="card-hover rounded-2xl overflow-hidden bg-card border border-border/50"
              >
                {post.image_url && (
                  <div className="aspect-[3/2] overflow-hidden">
                    <img
                      src={post.image_url}
                      alt={post.destination}
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                )}

                <div className="p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-medium">
                      {post.author_name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">
                        {post.author_name}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 shrink-0" />
                          {post.destination}
                        </span>
                        <span>•</span>
                        <span>
                          {formatDistanceToNow(new Date(post.created_at), {
                            addSuffix: true,
                            locale: fr,
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-foreground/80 text-sm leading-relaxed mb-4">
                    {post.content}
                  </p>

                  <div className="pt-4 border-t border-border">
                    <StoryEngagement
                      storyId={post.id}
                      likesCount={post.likes_count}
                      commentsCount={post.comments_count}
                      likedByMe={likedIds?.has(post.id) ?? false}
                    />
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </div>

      <SubmitStoryDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </section>
  );
};

export default CommunitySection;
