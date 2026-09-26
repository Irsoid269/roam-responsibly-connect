import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import ImageUpload from "@/components/admin/ImageUpload";
import { useAuth } from "@/hooks/useAuth";
import { useSubmitCommunityStory, useDestinations } from "@/hooks/useCatalogQueries";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface SubmitStoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SubmitStoryDialog = ({ open, onOpenChange }: SubmitStoryDialogProps) => {
  const { t } = useTranslation("community");
  const { user } = useAuth();
  const navigate = useNavigate();
  const submit = useSubmitCommunityStory();
  const { data: destinations = [] } = useDestinations();
  const [authorName, setAuthorName] = useState(
    () => user?.user_metadata?.full_name || "",
  );
  const [authorLocation, setAuthorLocation] = useState("");
  const [destination, setDestination] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [tagsInput, setTagsInput] = useState("");

  useEffect(() => {
    if (!destination && destinations.length > 0) {
      setDestination(destinations[0].name);
    }
  }, [destination, destinations]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error(t("submitStory.loginRequired"));
      onOpenChange(false);
      navigate("/login");
      return;
    }
    if (content.trim().length < 20) {
      toast.error(t("submitStory.tooShort"));
      return;
    }
    const tags = [
      ...new Set(
        tagsInput
          .split(",")
          .map((tag) => tag.trim().toLowerCase())
          .filter(Boolean)
      ),
    ].slice(0, 5);
    try {
      await submit.mutateAsync({
        userId: user.id,
        authorName: authorName.trim() || user.email?.split("@")[0] || "Voyageur",
        authorLocation: authorLocation.trim() || undefined,
        destination,
        content: content.trim(),
        imageUrl,
        tags,
      });
      toast.success(t("submitStory.success"));
      setContent("");
      setImageUrl(null);
      setTagsInput("");
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("submitStory.sendError"));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">
            {t("submitStory.title")}
          </DialogTitle>
          <DialogDescription>
            {t("submitStory.description")}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="authorName">{t("submitStory.yourName")}</Label>
            <Input
              id="authorName"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder="Marie L."
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="authorLocation">{t("submitStory.homeCity")}</Label>
            <Input
              id="authorLocation"
              value={authorLocation}
              onChange={(e) => setAuthorLocation(e.target.value)}
              placeholder="Paris"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="destination">{t("submitStory.destination")}</Label>
            <select
              id="destination"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              {destinations.map((d) => (
                <option key={d.id} value={d.name}>
                  {d.name}
                  {d.city ? ` (${d.city})` : ""}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="content">{t("submitStory.yourStory")}</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={t("submitStory.storyPlaceholder")}
              rows={5}
              required
              minLength={20}
              maxLength={1000}
            />
            <p className="text-xs text-muted-foreground">
              {t("submitStory.charCount", { count: content.length })}
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="tags">{t("submitStory.tags")}</Label>
            <Input
              id="tags"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder={t("submitStory.tagsPlaceholder")}
            />
          </div>
          <div className="space-y-2">
            <Label>{t("submitStory.photo")}</Label>
            <ImageUpload
              value={imageUrl}
              onChange={setImageUrl}
              folder="community"
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
            >
              {t("submitStory.cancel")}
            </Button>
            <Button type="submit" disabled={submit.isPending}>
              {submit.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t("submitStory.sending")}
                </>
              ) : (
                t("submitStory.submit")
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SubmitStoryDialog;
