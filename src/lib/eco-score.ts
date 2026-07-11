/** Amani eco-score tokens A→E — use exclusively for carbon / eco badges. */
export const ECO_SCORE_BADGE: Record<string, string> = {
  A: "bg-eco-a text-primary-foreground",
  B: "bg-eco-b text-primary-foreground",
  C: "bg-eco-c text-primary-foreground",
  D: "bg-eco-d text-primary-foreground",
  E: "bg-eco-e text-primary-foreground",
};

export const ECO_SCORE_TEXT: Record<string, string> = {
  A: "text-eco-a",
  B: "text-eco-b",
  C: "text-eco-c",
  D: "text-eco-d",
  E: "text-eco-e",
};

export const ECO_SCORE_SOFT: Record<string, string> = {
  A: "bg-eco-a/20 text-eco-a",
  B: "bg-eco-b/20 text-eco-b",
  C: "bg-eco-c/20 text-eco-c",
  D: "bg-eco-d/20 text-eco-d",
  E: "bg-eco-e/20 text-eco-e",
};

export const ECO_SCORE_LABELS: Record<string, string> = {
  A: "Exemplaire",
  B: "Très bien",
  C: "Moyen",
  D: "À améliorer",
  E: "Élevé",
};

export const ECO_SCORE_LEGEND = [
  { grade: "A", label: "Exemplaire", className: "bg-eco-a" },
  { grade: "B", label: "Bon", className: "bg-eco-b" },
  { grade: "C", label: "Moyen", className: "bg-eco-c" },
  { grade: "D", label: "À améliorer", className: "bg-eco-d" },
  { grade: "E", label: "Élevé", className: "bg-eco-e" },
] as const;

export function ecoScoreBadge(score: string | null | undefined): string {
  const key = (score || "B").toUpperCase().charAt(0);
  return ECO_SCORE_BADGE[key] || ECO_SCORE_BADGE.B;
}

export function ecoScoreFromKg(totalKg: number): {
  grade: string;
  label: string;
  color: string;
  bgColor: string;
} {
  if (totalKg < 400) {
    return { grade: "A", label: ECO_SCORE_LABELS.A, color: "text-eco-a", bgColor: "bg-eco-a/20" };
  }
  if (totalKg < 800) {
    return { grade: "B", label: ECO_SCORE_LABELS.B, color: "text-eco-b", bgColor: "bg-eco-b/20" };
  }
  if (totalKg < 1000) {
    return { grade: "C", label: ECO_SCORE_LABELS.C, color: "text-eco-c", bgColor: "bg-eco-c/20" };
  }
  if (totalKg < 1500) {
    return { grade: "D", label: ECO_SCORE_LABELS.D, color: "text-eco-d", bgColor: "bg-eco-d/20" };
  }
  return { grade: "E", label: ECO_SCORE_LABELS.E, color: "text-eco-e", bgColor: "bg-eco-e/20" };
}

/** Map numeric carbon intensity to eco badge background. */
export function ecoBadgeFromIntensity(
  value: number | null,
  thresholds: [number, number, number, number] = [0, 50, 100, 150],
): string {
  if (!value || value <= thresholds[0]) return "bg-eco-a";
  if (value < thresholds[1]) return "bg-eco-b";
  if (value < thresholds[2]) return "bg-eco-c";
  if (value < thresholds[3]) return "bg-eco-d";
  return "bg-eco-e";
}
