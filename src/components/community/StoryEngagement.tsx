import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
      toast.info("Connectez-vous pour interagir");
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
      toast.error(
        e instanceof Error
          ? e.message
          : "Impossible — appliquez la migration story_likes_comments"
      );
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
          "Voyageur Amani",
        content: text,
      });
      setText("");
      toast.success("Commentaire publié");
    } catch (e) {
      toast.error(
        e instanceof Error
          ? e.message
          : "Impossible — appliquez la migration story_likes_comments"
      );
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
          aria-label={likedByMe ? "Retirer J'adore" : "J'adore"}
        >
          <Heart
            className={cn(
              compact ? "w-3.5 h-3.5" : "w-4 h-4",
              likedByMe && "fill-current"
            )}
          />
          <span>{likesCount}</span>
          {!compact && <span className="hidden sm:inline">J&apos;adore</span>}
        </button>

        <button
          type="button"
          onClick={() => setCommentsOpen(true)}
          className={cn(
            "flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors",
            compact ? "text-xs" : "text-sm"
          )}
          aria-label="Commentaires"
        >
          <MessageCircle className={compact ? "w-3.5 h-3.5" : "w-4 h-4"} />
          <span>{commentsCount}</span>
          {!compact && <span className="hidden sm:inline">Commenter</span>}
        </button>
      </div>

      <Dialog open={commentsOpen} onOpenChange={setCommentsOpen}>
        <DialogContent className="max-w-md max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Commentaires</DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto space-y-3 min-h-[120px] max-h-[40vh] pr-1">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : comments.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Aucun commentaire — soyez le premier.
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
                </div>
              ))
            )}
          </div>

          <div className="space-y-2 pt-2 border-t">
            <Textarea
              placeholder={
                user ? "Écrire un commentaire…" : "Connectez-vous pour commenter"
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
              Publier
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default StoryEngagement;
