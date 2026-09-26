import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Flag, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import {
  useCreateReport,
  type ReportReason,
  type ReportTargetType,
} from "@/hooks/useCatalogQueries";
import ImageUpload from "@/components/admin/ImageUpload";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ReportButtonProps {
  targetType: ReportTargetType;
  targetId: string;
  compact?: boolean;
  className?: string;
}

const ReportDialog = ({ targetType, targetId, compact, className }: ReportButtonProps) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<ReportReason | "">("");
  const [comment, setComment] = useState("");
  const [evidenceUrl, setEvidenceUrl] = useState<string | null>(null);
  const createReport = useCreateReport();

  const reasonLabels: Record<ReportReason, string> = {
    spam: t("report.reasons.spam"),
    abus: t("report.reasons.abus"),
    contenu_inapproprie: t("report.reasons.contenu_inapproprie"),
    fausse_information: t("report.reasons.fausse_information"),
    autre: t("report.reasons.autre"),
  };

  const handleOpen = () => {
    if (!user) {
      toast.info(t("report.loginRequired"));
      navigate("/login");
      return;
    }
    setOpen(true);
  };

  const handleSubmit = async () => {
    if (!reason || !user) return;
    try {
      await createReport.mutateAsync({
        reporterUserId: user.id,
        targetType,
        targetId,
        reason,
        comment: comment.trim() || undefined,
        evidenceUrl,
      });
      toast.success(t("report.success"));
      setOpen(false);
      setReason("");
      setComment("");
      setEvidenceUrl(null);
    } catch (e) {
      const message = e instanceof Error ? e.message : "";
      if (message.includes("duplicate key") || message.includes("reports_reporter_user_id")) {
        toast.error(t("report.duplicate"));
      } else {
        toast.error(t("report.error"));
      }
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className={cn(
          "flex items-center gap-1.5 text-muted-foreground hover:text-destructive transition-colors",
          compact ? "text-xs" : "text-sm",
          className
        )}
        aria-label={t("report.title")}
      >
        <Flag className={compact ? "w-3.5 h-3.5" : "w-4 h-4"} />
        {!compact && <span className="hidden sm:inline">{t("report.button")}</span>}
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{t("report.title")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Select value={reason} onValueChange={(v) => setReason(v as ReportReason)}>
              <SelectTrigger>
                <SelectValue placeholder={t("report.reasonPlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(reasonLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Textarea
              placeholder={t("report.detailsPlaceholder")}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              maxLength={500}
            />
            <div className="space-y-1.5">
              <p className="text-xs text-muted-foreground">{t("report.evidenceLabel")}</p>
              <ImageUpload value={evidenceUrl} onChange={setEvidenceUrl} folder="reports" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              {t("report.cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={handleSubmit}
              disabled={!reason || createReport.isPending}
              className="gap-2"
            >
              {createReport.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Flag className="w-4 h-4" />
              )}
              {t("report.button")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ReportDialog;
