import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ECO_SCORE_LEGEND, ECO_SCORE_LABELS } from "@/lib/eco-score";
import { cn } from "@/lib/utils";

interface EcoScoreLegendProps {
  className?: string;
  compact?: boolean;
}

/** Légende éco-score A→E — charte Amani. */
const EcoScoreLegend = ({ className, compact }: EcoScoreLegendProps) => {
  return (
    <TooltipProvider>
      <div
        className={cn(
          "flex flex-wrap items-center gap-2",
          compact ? "justify-center" : "justify-start",
          className,
        )}
      >
        {!compact && (
          <span className="text-xs font-medium uppercase tracking-luxury text-muted-foreground mr-1">
            Éco-score
          </span>
        )}
        {ECO_SCORE_LEGEND.map((item) => (
          <Tooltip key={item.grade}>
            <TooltipTrigger asChild>
              <button
                type="button"
                className={cn(
                  "inline-flex h-8 w-8 items-center justify-center rounded-md text-sm font-semibold text-primary-foreground transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  item.className,
                )}
                aria-label={`Score ${item.grade} — ${ECO_SCORE_LABELS[item.grade]}`}
              >
                {item.grade}
              </button>
            </TooltipTrigger>
            <TooltipContent className="bg-primary text-primary-foreground border-primary">
              <p className="font-medium">
                Score {item.grade} — {item.label}
              </p>
              <p className="text-xs text-primary-foreground/80">
                Charte Amani Resorts
              </p>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
};

export default EcoScoreLegend;
