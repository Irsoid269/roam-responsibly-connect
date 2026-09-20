import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface HoldCountdownProps {
  expiresAt: string;
  className?: string;
}

function formatRemaining(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

/** Live countdown for a held slot — the item is auto-released by useCart once this hits zero. */
const HoldCountdown = ({ expiresAt, className }: HoldCountdownProps) => {
  const [remainingMs, setRemainingMs] = useState(
    () => new Date(expiresAt).getTime() - Date.now(),
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setRemainingMs(new Date(expiresAt).getTime() - Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  const isUrgent = remainingMs < 60_000;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-xs font-medium",
        isUrgent ? "text-destructive" : "text-muted-foreground",
        className,
      )}
      title="Créneau réservé temporairement — libéré automatiquement à expiration"
    >
      <Clock className="w-3 h-3" />
      {formatRemaining(remainingMs)}
    </span>
  );
};

export default HoldCountdown;
