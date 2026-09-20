import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { Heart, MessageCircle, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import {
  useToggleStoryLike,
  useStoryComments,
  useAddStoryComment,
} from "@/hooks/useCatalogQueries";
import ReportDialog from "@/components/moderation/ReportDialog";
import { toast } from "sonner";

type StoryEngagementProps = {
  storyId: string;
  likesCount: number;
  commentsCount: number;
  likedByMe?: boolean;
  compact?: boolean;
};

const StoryEngagement = ({
  storyId,
  likesCount,
  commentsCount,
  likedByMe = false,
  compact = false,
}: StoryEngagementProps) => {
  const { t } = useTranslation("community");
  const { user } = useAuth();
  const navigate = useNavigate();
  const toggleLike = useToggleStoryLike();
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [text, setText] = useState("");
  const { data: comments = [], isLoading } = useStoryComments(
    commentsOpen ? storyId : null
  );
  const addComment = useAddStoryComment();

  const requireAuth = () => {
    if (!user) {
      toast.info(t("engagement.loginToInteract"));
      navigate("/login");
      return false;
    }
    return true;
  };

  const onLike = async () => {
    if (!requireAuth()) return;
    try {
      await toggleLike.mutateAsync({
        storyId,
        userId: user!.id,
        liked: likedByMe,
      });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("engagement.likeError"));
    }
  };

  const onComment = async () => {
    if (!requireAuth()) return;
    if (text.trim().length < 1) return;
    try {
      await addComment.mutateAsync({
        storyId,
        userId: user!.id,
        authorName:
          (user!.user_metadata?.full_name as string) ||
          user!.email?.split("@")[0] ||
          t("travelers.defaultName"),
        content: text,
      });
      setText("");
      toast.success(t("engagement.commentPosted"));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("engagement.likeError"));
    }
  };

  return (
    <>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onLike}
          disabled={toggleLike.isPending}
          className={cn(
            "flex items-center gap-1.5 transition-colors",
            likedByMe
              ? "text-destructive"
              : "text-muted-foreground hover:text-destructive",
            compact ? "text-xs" : "text-sm"
          )}
          aria-label={likedByMe ? t("engagement.removeLike") : t("engagement.like")}
        >
          <Heart
            className={cn(
              compact ? "w-3.5 h-3.5" : "w-4 h-4",
              likedByMe && "fill-current"
            )}
          />
          <span>{likesCount}</span>
          {!compact && <span className="hidden sm:inline">{t("engagement.like")}</span>}
        </button>

        <button
          type="button"
          onClick={() => setCommentsOpen(true)}
          className={cn(
            "flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors",
            compact ? "text-xs" : "text-sm"
          )}
          aria-label={t("engagement.comments")}
        >
          <MessageCircle className={compact ? "w-3.5 h-3.5" : "w-4 h-4"} />
          <span>{commentsCount}</span>
          {!compact && <span className="hidden sm:inline">{t("engagement.commentAction")}</span>}
        </button>

        <ReportDialog targetType="story" targetId={storyId} compact={compact} />
      </div>

      <Dialog open={commentsOpen} onOpenChange={setCommentsOpen}>
        <DialogContent className="max-w-md max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{t("engagement.comments")}</DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto space-y-3 min-h-[120px] max-h-[40vh] pr-1">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : comments.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                {t("engagement.noComments")}
              </p>
            ) : (
              comments.map((c) => (
                <div key={c.id} className="rounded-lg bg-muted/40 p-3">
                  <div className="flex items-baseline justify-between gap-2 mb-1">
                    <p className="text-sm font-medium">{c.author_name}</p>
                    <p className="text-[11px] text-muted-foreground shrink-0">
                      {formatDistanceToNow(new Date(c.created_at), {
                        addSuffix: true,
                        locale: fr,
                      })}
                    </p>
                  </div>
                  <p className="text-sm text-foreground/90">{c.content}</p>
                  <div className="mt-1.5 flex justify-end">
                    <ReportDialog targetType="comment" targetId={c.id} compact />
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="space-y-2 pt-2 border-t">
            <Textarea
              placeholder={
                user ? t("engagement.writeComment") : t("engagement.loginToComment")
              }
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={2}
              maxLength={500}
              disabled={!user}
            />
            <Button
              className="w-full gap-2"
              onClick={onComment}
              disabled={!user || addComment.isPending || text.trim().length < 1}
            >
              {addComment.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              {t("engagement.publish")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default StoryEngagement;
