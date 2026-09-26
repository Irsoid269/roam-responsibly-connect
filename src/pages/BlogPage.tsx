import { useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Calendar, Clock, User, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useBlogPosts } from "@/hooks/useCatalogQueries";
import { format } from "date-fns";
import { fr, enUS } from "date-fns/locale";

const BlogPage = () => {
  const { t, i18n } = useTranslation("blog");
  const dateLocale = i18n.language === "en" ? enUS : fr;
  const { data: posts = [], isLoading, isError } = useBlogPosts();
  const [category, setCategory] = useState<string | null>(null);
  const allLabel = t("all");

  const categories = [
    allLabel,
    ...Array.from(new Set(posts.map((p) => p.category).filter(Boolean))),
  ];

  const filtered = posts.filter(
    (p) => !category || category === allLabel || p.category === category
  );
  const featuredPost = filtered.find((p) => p.featured) || filtered[0];
  const regularPosts = filtered.filter((p) => p.id !== featuredPost?.id);

  return (
    <main className="page-main">
      <section className="bg-gradient-to-b from-primary-light to-background py-12">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              {t("title")}
            </h1>
            <p className="text-lg text-muted-foreground">
              {t("subtitle")}
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-6 border-b">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={
                  (category === null && cat === allLabel) || category === cat
                    ? "default"
                    : "outline"
                }
                size="sm"
                onClick={() => setCategory(cat === allLabel ? null : cat)}
              >
                {cat}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {isLoading ? (
        <div className="flex justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : isError ? (
        <div className="text-center py-24 text-muted-foreground">
          {t("loadError")}{" "}
          <code className="text-sm">blog_events_cms</code>.
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-24 text-muted-foreground">
          {t("empty")}
        </div>
      ) : (
        <>
          {featuredPost && (
            <section className="py-12">
              <div className="container mx-auto px-4">
                <Card className="overflow-hidden card-hover">
                  <div className="grid md:grid-cols-2">
                    <div className="relative aspect-video md:aspect-auto min-h-[240px] overflow-hidden">
                      <img
                        src={
                          featuredPost.image_url ||
                          "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800"
                        }
                        alt={featuredPost.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <CardContent className="p-6 md:p-8 flex flex-col justify-center">
                      <Badge className="w-fit mb-3">{featuredPost.category}</Badge>
                      <h2 className="text-2xl md:text-3xl font-bold mb-3">
                        {featuredPost.title}
                      </h2>
                      <p className="text-muted-foreground mb-4">
                        {featuredPost.excerpt}
                      </p>
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          {featuredPost.author}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {format(new Date(featuredPost.published_at), "d MMMM yyyy", {
                            locale: dateLocale,
                          })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {featuredPost.read_time_minutes} min
                        </span>
                      </div>
                    </CardContent>
                  </div>
                </Card>
              </div>
            </section>
          )}

          <section className="pb-16">
            <div className="container mx-auto px-4">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {regularPosts.map((post, index) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.04 }}
                  >
                    <Card className="overflow-hidden h-full card-hover">
                      <div className="aspect-[16/10] overflow-hidden">
                        <img
                          src={
                            post.image_url ||
                            "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800"
                          }
                          alt={post.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <CardContent className="p-4">
                        <Badge variant="secondary" className="mb-2">
                          {post.category}
                        </Badge>
                        <h3 className="font-semibold text-foreground mb-2 line-clamp-2">
                          {post.title}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                          {post.excerpt}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span>{post.author}</span>
                          <span>·</span>
                          <span>{post.read_time_minutes} min</span>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        </>
      )}
    </main>
  );
};

export default BlogPage;
