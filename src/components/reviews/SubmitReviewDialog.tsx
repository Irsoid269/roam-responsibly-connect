import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Star, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { useDestinations, useSubmitReview } from "@/hooks/useCatalogQueries";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const SubmitReviewDialog = ({ open, onOpenChange }: Props) => {
  const { t } = useTranslation("reviews");
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: destinations = [] } = useDestinations();
  const submit = useSubmitReview();
  const [destinationId, setDestinationId] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const handleSubmit = async () => {
    if (!user) {
      toast.info(t("loginToReview"));
      onOpenChange(false);
      navigate("/login");
      return;
    }
    if (!destinationId) {
      toast.error(t("submit.chooseDestination"));
      return;
    }
    if (comment.trim().length < 10) {
      toast.error(t("submit.tooShort"));
      return;
    }

    try {
      await submit.mutateAsync({
        userId: user.id,
        targetType: "destination",
        targetId: destinationId,
        rating,
        comment: comment.trim(),
      });
      toast.success(t("submit.success"));
      setComment("");
      setRating(5);
      setDestinationId("");
      onOpenChange(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("submit.error"));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl font-medium">
            {t("submit.title")}
          </DialogTitle>
          <DialogDescription>
            {t("submit.description")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">{t("submit.destination")}</label>
            <Select value={destinationId} onValueChange={setDestinationId}>
              <SelectTrigger>
                <SelectValue placeholder={t("submit.choosePlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                {destinations.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.name} · {d.country}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">{t("submit.rating")}</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRating(n)}
                  className="p-1"
                  aria-label={t("submit.starsLabel", { count: n })}
                >
                  <Star
                    className={cn(
                      "w-7 h-7 transition-colors",
                      n <= rating
                        ? "text-warning fill-warning"
                        : "text-muted-foreground"
                    )}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">{t("submit.yourExperience")}</label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              placeholder={t("submit.experiencePlaceholder")}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("submit.cancel")}
          </Button>
          <Button onClick={handleSubmit} disabled={submit.isPending}>
            {submit.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {t("submit.sending")}
              </>
            ) : (
              t("submit.send")
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SubmitReviewDialog;
