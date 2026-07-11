import {
  Leaf,
  Heart,
  Globe,
  Users,
  Target,
  TrendingUp,
  TrendingDown,
  Award,
  TreePine,
  type LucideIcon,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  leaf: Leaf,
  heart: Heart,
  globe: Globe,
  users: Users,
  target: Target,
  trending: TrendingUp,
  "trending-down": TrendingDown,
  award: Award,
  tree: TreePine,
};

export function cmsIcon(key: string | null | undefined): LucideIcon {
  return ICONS[(key || "leaf").toLowerCase()] || Leaf;
}

export const CMS_ICON_OPTIONS = [
  { value: "leaf", label: "Feuille" },
  { value: "heart", label: "Cœur" },
  { value: "globe", label: "Globe" },
  { value: "users", label: "Utilisateurs" },
  { value: "target", label: "Cible" },
  { value: "trending", label: "Croissance" },
  { value: "trending-down", label: "Réduction" },
  { value: "award", label: "Trophée" },
  { value: "tree", label: "Arbre" },
];
