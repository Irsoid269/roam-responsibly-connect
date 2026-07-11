import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const cmsKeys = {
  hero: (page: string) => ["cms-hero", page] as const,
  stats: (page: string) => ["cms-stats", page] as const,
  infoCards: (page: string) => ["cms-info", page] as const,
  missionValues: ["mission-values"] as const,
  missionMilestones: ["mission-milestones"] as const,
  missionTeam: ["mission-team"] as const,
  partners: ["partner-orgs"] as const,
  breakdown: ["impact-breakdown"] as const,
  quarters: ["impact-quarters"] as const,
};

export type CmsPageKey = "mission" | "carbon" | "partners" | "impact_report";

export function useCmsHero(pageKey: CmsPageKey) {
  return useQuery({
    queryKey: cmsKeys.hero(pageKey),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cms_page_heroes")
        .select("*")
        .eq("page_key", pageKey)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    staleTime: 60_000,
  });
}

export function useUpdateCmsHero() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (row: {
      page_key: CmsPageKey;
      badge_text?: string | null;
      title: string;
      title_highlight?: string | null;
      description?: string | null;
      cta_label?: string | null;
      cta_url?: string | null;
      pdf_url?: string | null;
    }) => {
      const { error } = await supabase.from("cms_page_heroes").upsert({
        ...row,
        updated_at: new Date().toISOString(),
      });
      if (error) throw error;
    },
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: cmsKeys.hero(v.page_key) });
    },
  });
}

export function useCmsStats(pageKey: CmsPageKey, admin = false) {
  return useQuery({
    queryKey: [...cmsKeys.stats(pageKey), admin ? "admin" : "pub"],
    queryFn: async () => {
      let q = supabase
        .from("cms_stat_cards")
        .select("*")
        .eq("page_key", pageKey)
        .order("sort_order");
      if (!admin) q = q.eq("published", true);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useCmsInfoCards(pageKey: CmsPageKey, admin = false) {
  return useQuery({
    queryKey: [...cmsKeys.infoCards(pageKey), admin ? "admin" : "pub"],
    queryFn: async () => {
      let q = supabase
        .from("cms_info_cards")
        .select("*")
        .eq("page_key", pageKey)
        .order("sort_order");
      if (!admin) q = q.eq("published", true);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useMissionValues(admin = false) {
  return useQuery({
    queryKey: [...cmsKeys.missionValues, admin ? "admin" : "pub"],
    queryFn: async () => {
      let q = supabase.from("mission_values").select("*").order("sort_order");
      if (!admin) q = q.eq("published", true);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useMissionMilestones(admin = false) {
  return useQuery({
    queryKey: [...cmsKeys.missionMilestones, admin ? "admin" : "pub"],
    queryFn: async () => {
      let q = supabase.from("mission_milestones").select("*").order("sort_order");
      if (!admin) q = q.eq("published", true);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useMissionTeam(admin = false) {
  return useQuery({
    queryKey: [...cmsKeys.missionTeam, admin ? "admin" : "pub"],
    queryFn: async () => {
      let q = supabase.from("mission_team").select("*").order("sort_order");
      if (!admin) q = q.eq("published", true);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function usePartnerOrgs(admin = false) {
  return useQuery({
    queryKey: [...cmsKeys.partners, admin ? "admin" : "pub"],
    queryFn: async () => {
      let q = supabase.from("partner_orgs").select("*").order("sort_order");
      if (!admin) q = q.eq("published", true);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useImpactBreakdown(admin = false) {
  return useQuery({
    queryKey: [...cmsKeys.breakdown, admin ? "admin" : "pub"],
    queryFn: async () => {
      let q = supabase.from("impact_breakdown").select("*").order("sort_order");
      if (!admin) q = q.eq("published", true);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useImpactQuarters(admin = false) {
  return useQuery({
    queryKey: [...cmsKeys.quarters, admin ? "admin" : "pub"],
    queryFn: async () => {
      let q = supabase.from("impact_quarters").select("*").order("sort_order");
      if (!admin) q = q.eq("published", true);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });
}
