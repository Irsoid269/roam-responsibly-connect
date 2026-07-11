import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { useSubmitCommunityStory } from "@/hooks/useCatalogQueries";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const DESTINATIONS = [
  "Moroni, Comores",
  "Itsandra, Grande Comore",
  "Mutsamudu, Anjouan",
  "Fomboni, Mohéli",
  "Domoni, Anjouan",
  "Iconi, Grande Comore",
];

interface SubmitStoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SubmitStoryDialog = ({ open, onOpenChange }: SubmitStoryDialogProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const submit = useSubmitCommunityStory();
  const [authorName, setAuthorName] = useState(
    () => user?.user_metadata?.full_name || "",
  );
  const [authorLocation, setAuthorLocation] = useState("");
  const [destination, setDestination] = useState(DESTINATIONS[0]);
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Connectez-vous pour partager un récit");
      onOpenChange(false);
      navigate("/login");
      return;
    }
    if (content.trim().length < 20) {
      toast.error("Le récit doit contenir au moins 20 caractères");
      return;
    }
    try {
      await submit.mutateAsync({
        userId: user.id,
        authorName: authorName.trim() || user.email?.split("@")[0] || "Voyageur",
        authorLocation: authorLocation.trim() || undefined,
        destination,
        content: content.trim(),
        imageUrl,
      });
      toast.success(
        "Récit envoyé ! Il sera visible après validation par l'équipe Amani.",
      );
      setContent("");
      setImageUrl(null);
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Envoi impossible");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">
            Partager mon récit Amani
          </DialogTitle>
          <DialogDescription>
            Votre témoignage sera publié dans la section Communauté après
            approbation par un administrateur.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="authorName">Votre nom</Label>
            <Input
              id="authorName"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder="Marie L."
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="authorLocation">Ville d'origine (optionnel)</Label>
            <Input
              id="authorLocation"
              value={authorLocation}
              onChange={(e) => setAuthorLocation(e.target.value)}
              placeholder="Paris"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="destination">Destination</Label>
            <select
              id="destination"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              {DESTINATIONS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="content">Votre récit</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Racontez votre séjour Amani aux Comores…"
              rows={5}
              required
              minLength={20}
              maxLength={1000}
            />
            <p className="text-xs text-muted-foreground">
              {content.length}/1000 · min. 20 caractères
            </p>
          </div>
          <div className="space-y-2">
            <Label>Photo (optionnel)</Label>
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
              Annuler
            </Button>
            <Button type="submit" disabled={submit.isPending}>
              {submit.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Envoi…
                </>
              ) : (
                "Envoyer pour validation"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SubmitStoryDialog;
