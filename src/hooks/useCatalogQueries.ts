import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const queryKeys = {
  destinations: ["destinations"] as const,
  destination: (id: string) => ["destinations", id] as const,
  coworkings: ["coworkings"] as const,
  accommodations: ["accommodations"] as const,
  activities: ["activities"] as const,
  mobility: ["mobility"] as const,
  profile: (userId: string) => ["profile", userId] as const,
  reservations: (userId: string) => ["reservations", userId] as const,
  reviews: ["reviews"] as const,
  adminReviews: ["admin-reviews"] as const,
  communityStories: ["community-stories"] as const,
  adminCommunityStories: ["admin-community-stories"] as const,
  storyLikes: (userId: string) => ["story-likes", userId] as const,
  storyComments: (storyId: string) => ["story-comments", storyId] as const,
  carbonHistory: (userId: string) => ["carbon-history", userId] as const,
  homepageCta: ["homepage-cta"] as const,
  communityLeaders: ["community-leaders"] as const,
  blogPosts: ["blog-posts"] as const,
  events: ["events"] as const,
  contactMessages: ["contact-messages"] as const,
  partnerApplications: ["partner-applications"] as const,
  ambassadors: ["ambassadors"] as const,
  ambassadorBenefits: ["ambassador-benefits"] as const,
};

export function useDestinations() {
  return useQuery({
    queryKey: queryKeys.destinations,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("destinations")
        .select("*")
        .order("rating", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 60_000,
  });
}

/** Destinations flagged by admin for the homepage hero search. */
export function useHeroDestinations() {
  return useQuery({
    queryKey: [...queryKeys.destinations, "hero"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("destinations")
        .select("id, name, city, country, show_in_hero")
        .eq("show_in_hero", true)
        .order("name");
      // Fallback if column not migrated yet
      if (error) {
        const { data: all, error: err2 } = await supabase
          .from("destinations")
          .select("id, name, city, country")
          .order("name");
        if (err2) throw err2;
        return (all ?? []).map((d) => ({ ...d, show_in_hero: true }));
      }
      return data ?? [];
    },
    staleTime: 60_000,
  });
}

/** Destinations flagged by admin for the homepage cards grid. */
export function useHomeDestinations(limit = 4) {
  return useQuery({
    queryKey: [...queryKeys.destinations, "home", limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("destinations")
        .select("*")
        .eq("show_on_home", true)
        .order("rating", { ascending: false })
        .limit(limit);
      if (error) {
        const { data: all, error: err2 } = await supabase
          .from("destinations")
          .select("*")
          .order("rating", { ascending: false })
          .limit(limit);
        if (err2) throw err2;
        return all ?? [];
      }
      return data ?? [];
    },
    staleTime: 60_000,
  });
}

export function useCatalogCounts() {
  return useQuery({
    queryKey: ["catalog-counts"],
    queryFn: async () => {
      const [dest, cowork, profiles] = await Promise.all([
        supabase.from("destinations").select("id", { count: "exact", head: true }),
        supabase.from("coworking_spaces").select("id", { count: "exact", head: true }),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
      ]);
      return {
        destinations: dest.count ?? 0,
        coworkings: cowork.count ?? 0,
        travelers: profiles.count ?? 0,
      };
    },
    staleTime: 120_000,
  });
}

export function useDestination(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.destination(id || ""),
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("destinations")
        .select("*")
        .eq("id", id!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    staleTime: 60_000,
  });
}

export function useCoworkings(destinationId?: string) {
  return useQuery({
    queryKey: [...queryKeys.coworkings, destinationId || "all"],
    queryFn: async () => {
      let q = supabase.from("coworking_spaces").select("*").order("rating", { ascending: false });
      if (destinationId) q = q.eq("destination_id", destinationId);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 60_000,
  });
}

export function useAccommodations(destinationId?: string) {
  return useQuery({
    queryKey: [...queryKeys.accommodations, destinationId || "all"],
    queryFn: async () => {
      let q = supabase.from("accommodations").select("*").order("rating", { ascending: false });
      if (destinationId) q = q.eq("destination_id", destinationId);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 60_000,
  });
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function useActivities(destinationId?: string) {
  return useQuery({
    queryKey: [...queryKeys.activities, destinationId || "all"],
    queryFn: async () => {
      let q = supabase.from("activities").select("*").order("name");
      if (destinationId && UUID_RE.test(destinationId)) {
        // Multi-location circuits (no single destination_id, e.g. the Coworkation
        // Eco-Comores catalogue) stay bookable from any destination's page.
        q = q.or(`destination_id.eq.${destinationId},destination_id.is.null`);
      } else if (destinationId) {
        q = q.eq("destination_id", destinationId);
      }
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 60_000,
  });
}

export function useMobility(destinationId?: string) {
  return useQuery({
    queryKey: [...queryKeys.mobility, destinationId || "all"],
    queryFn: async () => {
      let q = supabase.from("mobility_options").select("*").order("name");
      if (destinationId) q = q.eq("destination_id", destinationId);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 60_000,
  });
}

export function useProfile(userId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.profile(userId || ""),
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

export function useUserReservations(userId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.reservations(userId || ""),
    enabled: !!userId,
    queryFn: async () => {
      const { data: resas, error } = await supabase
        .from("reservations")
        .select(
          "id, status, check_in_date, check_out_date, total_price, total_carbon_impact, carbon_offset_purchased, destination_id, created_at",
        )
        .eq("user_id", userId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      if (!resas?.length) return [];

      const withItems = await Promise.all(
        resas.map(async (r) => {
          const { data: items } = await supabase
            .from("reservation_items")
            .select(
              "id, item_type, item_name, quantity, unit_price, total_price, carbon_impact, start_date, end_date",
            )
            .eq("reservation_id", r.id);
          return { ...r, items: items || [] };
        }),
      );
      return withItems;
    },
  });
}

export function useApprovedReviews() {
  return useQuery({
    queryKey: queryKeys.reviews,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .eq("status", "approved")
        .order("created_at", { ascending: false });
      // Fallback if status column not yet migrated
      if (error) {
        const { data: all, error: err2 } = await supabase
          .from("reviews")
          .select("*")
          .order("created_at", { ascending: false });
        if (err2) throw err2;
        return all ?? [];
      }
      return data ?? [];
    },
    staleTime: 30_000,
  });
}

export function useAdminReviews() {
  return useQuery({
    queryKey: queryKeys.adminReviews,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useModerateReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      status,
      moderatorId,
    }: {
      id: string;
      status: "approved" | "rejected" | "pending";
      moderatorId: string;
    }) => {
      const { error } = await supabase
        .from("reviews")
        .update({
          status,
          moderated_at: new Date().toISOString(),
          moderated_by: moderatorId,
        } as never)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.adminReviews });
      qc.invalidateQueries({ queryKey: queryKeys.reviews });
    },
  });
}

export function useSaveCarbonEstimate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      userId: string;
      transport: number;
      accommodation: number;
      mobility: number;
      activities: number;
      total: number;
      offsetAmount?: number;
      emissionFactorSetId?: string | null;
    }) => {
      const { error } = await supabase.from("carbon_footprint_history").insert({
        user_id: payload.userId,
        transport_carbon: payload.transport,
        accommodation_carbon: payload.accommodation,
        activities_carbon: payload.activities + payload.mobility,
        total_carbon: payload.total,
        offset_amount: payload.offsetAmount ?? 0,
        date: new Date().toISOString().slice(0, 10),
        emission_factor_set_id: payload.emissionFactorSetId ?? null,
      });
      if (error) throw error;
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: queryKeys.carbonHistory(vars.userId) });
    },
  });
}

export function useApprovedCommunityStories(limit = 6) {
  return useQuery({
    queryKey: [...queryKeys.communityStories, limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("community_stories")
        .select("*")
        .eq("status", "approved")
        .order("created_at", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 30_000,
  });
}

export function useAdminCommunityStories() {
  return useQuery({
    queryKey: queryKeys.adminCommunityStories,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("community_stories")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useSubmitCommunityStory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      userId: string;
      authorName: string;
      authorLocation?: string;
      destination: string;
      content: string;
      imageUrl?: string | null;
    }) => {
      const { error } = await supabase.from("community_stories").insert({
        user_id: payload.userId,
        author_name: payload.authorName,
        author_location: payload.authorLocation || null,
        destination: payload.destination,
        content: payload.content,
        image_url: payload.imageUrl || null,
        status: "pending",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.adminCommunityStories });
      qc.invalidateQueries({ queryKey: queryKeys.communityStories });
    },
  });
}

export function useModerateCommunityStory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      status,
      moderatorId,
    }: {
      id: string;
      status: "approved" | "rejected" | "pending";
      moderatorId: string;
    }) => {
      const { error } = await supabase
        .from("community_stories")
        .update({
          status,
          moderated_at: new Date().toISOString(),
          moderated_by: moderatorId,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.adminCommunityStories });
      qc.invalidateQueries({ queryKey: queryKeys.communityStories });
    },
  });
}

/** Story IDs liked by the current user */
export function useMyStoryLikes(userId?: string) {
  return useQuery({
    queryKey: queryKeys.storyLikes(userId || "anon"),
    enabled: Boolean(userId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("community_story_likes")
        .select("story_id")
        .eq("user_id", userId!);
      if (error) throw error;
      return new Set((data ?? []).map((r) => r.story_id));
    },
  });
}

export function useToggleStoryLike() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      storyId,
      userId,
      liked,
    }: {
      storyId: string;
      userId: string;
      liked: boolean;
    }) => {
      if (liked) {
        const { error } = await supabase
          .from("community_story_likes")
          .delete()
          .eq("story_id", storyId)
          .eq("user_id", userId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("community_story_likes").insert({
          story_id: storyId,
          user_id: userId,
        });
        if (error) throw error;
      }
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: queryKeys.communityStories });
      qc.invalidateQueries({ queryKey: queryKeys.storyLikes(vars.userId) });
    },
  });
}

export function useStoryComments(storyId: string | null) {
  return useQuery({
    queryKey: queryKeys.storyComments(storyId || "none"),
    enabled: Boolean(storyId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("community_story_comments")
        .select("*")
        .eq("story_id", storyId!)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useAddStoryComment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      storyId: string;
      userId: string;
      authorName: string;
      content: string;
    }) => {
      const { error } = await supabase.from("community_story_comments").insert({
        story_id: payload.storyId,
        user_id: payload.userId,
        author_name: payload.authorName,
        content: payload.content.trim(),
      });
      if (error) throw error;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: queryKeys.storyComments(vars.storyId) });
      qc.invalidateQueries({ queryKey: queryKeys.communityStories });
    },
  });
}

export const defaultHomepageCta = {
  badge_text: "Prêt pour l'aventure ?",
  title: "Planifiez votre premier\nséjour Amani aux Comores",
  description:
    "Rejoignez une communauté de plus de 12 000 professionnels qui ont choisi de travailler autrement, en harmonie avec la planète.",
  primary_label: "Commencer gratuitement",
  primary_url: "/signup",
  secondary_label: "Voir une démo",
  secondary_url: "/destinations",
  trust_items: ["Inscription gratuite", "Annulation flexible", "Support 24/7"],
  is_active: true,
};

export function useHomepageCta() {
  return useQuery({
    queryKey: queryKeys.homepageCta,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("homepage_cta")
        .select("*")
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) {
        return { ...defaultHomepageCta, id: null as string | null, missing: true as const };
      }
      if (!data) {
        return { ...defaultHomepageCta, id: null as string | null, missing: true as const };
      }
      return { ...data, missing: false as const };
    },
    staleTime: 60_000,
  });
}

export function useUpdateHomepageCta() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      id?: string | null;
      badge_text: string;
      title: string;
      description: string;
      primary_label: string;
      primary_url: string;
      secondary_label: string;
      secondary_url: string;
      trust_items: string[];
      is_active: boolean;
    }) => {
      const row = {
        badge_text: payload.badge_text,
        title: payload.title,
        description: payload.description,
        primary_label: payload.primary_label,
        primary_url: payload.primary_url,
        secondary_label: payload.secondary_label,
        secondary_url: payload.secondary_url,
        trust_items: payload.trust_items,
        is_active: payload.is_active,
        updated_at: new Date().toISOString(),
      };

      if (payload.id) {
        const { error } = await supabase
          .from("homepage_cta")
          .update(row)
          .eq("id", payload.id);
        if (error) throw error;
        return;
      }

      const { error } = await supabase.from("homepage_cta").insert([row]);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.homepageCta });
    },
  });
}

export function useSubmitReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      userId: string;
      targetType: "destination" | "coworking" | "accommodation" | "activity";
      targetId: string;
      rating: number;
      comment: string;
    }) => {
      const { error } = await supabase.from("reviews").insert({
        user_id: payload.userId,
        target_type: payload.targetType,
        target_id: payload.targetId,
        rating: payload.rating,
        comment: payload.comment,
        status: "pending",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.reviews });
      qc.invalidateQueries({ queryKey: queryKeys.adminReviews });
    },
  });
}

export function useCommunityLeaders() {
  return useQuery({
    queryKey: queryKeys.communityLeaders,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url, total_carbon_saved, trips_count, bio")
        .order("total_carbon_saved", { ascending: false })
        .limit(12);
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 60_000,
  });
}

export function useSubmitContactMessage() {
  return useMutation({
    mutationFn: async (payload: {
      firstName: string;
      lastName: string;
      email: string;
      subject: string;
      message: string;
      userId?: string | null;
    }) => {
      const { error } = await supabase.from("contact_messages").insert({
        first_name: payload.firstName,
        last_name: payload.lastName,
        email: payload.email,
        subject: payload.subject,
        message: payload.message,
        user_id: payload.userId || null,
      });
      if (error) throw error;
    },
  });
}

export function useSubmitPartnerApplication() {
  return useMutation({
    mutationFn: async (payload: {
      firstName: string;
      lastName: string;
      email: string;
      companyName: string;
      partnerType: string;
      website?: string;
      message?: string;
      userId?: string | null;
    }) => {
      const { error } = await supabase.from("partner_applications").insert({
        first_name: payload.firstName,
        last_name: payload.lastName,
        email: payload.email,
        company_name: payload.companyName,
        partner_type: payload.partnerType,
        website: payload.website || null,
        message: payload.message || null,
        user_id: payload.userId || null,
      });
      if (error) throw error;
    },
  });
}

export function useBlogPosts(admin = false) {
  return useQuery({
    queryKey: [...queryKeys.blogPosts, admin ? "admin" : "public"],
    queryFn: async () => {
      let q = supabase.from("blog_posts").select("*").order("published_at", { ascending: false });
      if (!admin) q = q.eq("published", true);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 60_000,
  });
}

export function useEvents(admin = false) {
  return useQuery({
    queryKey: [...queryKeys.events, admin ? "admin" : "public"],
    queryFn: async () => {
      let q = supabase.from("events").select("*").order("starts_at", { ascending: true });
      if (!admin) q = q.eq("published", true);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 60_000,
  });
}

export function useContactMessages() {
  return useQuery({
    queryKey: queryKeys.contactMessages,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contact_messages")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function usePartnerApplications() {
  return useQuery({
    queryKey: queryKeys.partnerApplications,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("partner_applications")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useGlobalSearchCatalog() {
  return useQuery({
    queryKey: ["global-search"],
    queryFn: async () => {
      const [dest, cw, acc, act] = await Promise.all([
        supabase.from("destinations").select("id, name, city, country").order("name").limit(40),
        supabase.from("coworking_spaces").select("id, name, destination_id").order("name").limit(40),
        supabase.from("accommodations").select("id, name, destination_id").order("name").limit(30),
        supabase.from("activities").select("id, name, destination_id").order("name").limit(30),
      ]);
      return {
        destinations: dest.data ?? [],
        coworkings: cw.data ?? [],
        accommodations: acc.data ?? [],
        activities: act.data ?? [],
      };
    },
    staleTime: 120_000,
  });
}

export function useActiveNgos() {
  return useQuery({
    queryKey: ["ngos", "active"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ngos")
        .select("*")
        .eq("is_active", true)
        .order("sort_order");
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 60_000,
  });
}

export function useCreateDonation() {
  return useMutation({
    mutationFn: async (payload: {
      userId: string;
      ngoId: string;
      amount: number;
      co2OffsetKg?: number;
      reservationId?: string | null;
    }) => {
      const { data, error } = await supabase
        .from("donations")
        .insert({
          user_id: payload.userId,
          ngo_id: payload.ngoId,
          amount: payload.amount,
          co2_offset_kg: payload.co2OffsetKg ?? null,
          reservation_id: payload.reservationId ?? null,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
  });
}

export interface ActionSessionWithAction {
  id: string;
  action_id: string;
  location: string | null;
  starts_at: string;
  ends_at: string | null;
  capacity: number;
  registered_count: number;
  sustainable_actions: {
    title: string;
    description: string | null;
    category: string | null;
  } | null;
}

export function useUpcomingActionSessions() {
  return useQuery({
    queryKey: ["action-sessions", "upcoming"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("action_sessions")
        .select("*, sustainable_actions(title, description, category)")
        .gt("starts_at", new Date().toISOString())
        .order("starts_at");
      if (error) throw error;
      return (data ?? []) as unknown as ActionSessionWithAction[];
    },
    staleTime: 30_000,
  });
}

export function useMyParticipation(sessionId: string | undefined, userId: string | undefined) {
  return useQuery({
    queryKey: ["action-participations", "mine", sessionId, userId],
    enabled: !!sessionId && !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("action_participations")
        .select("*")
        .eq("session_id", sessionId!)
        .eq("user_id", userId!)
        .neq("status", "cancelled")
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

export function useRegisterForAction() {
  return useMutation({
    mutationFn: async (sessionId: string) => {
      const { data, error } = await supabase.rpc("register_for_action", {
        p_session_id: sessionId,
      });
      if (error) throw error;
      return data;
    },
  });
}

export function useAmbassadors(admin = false) {
  return useQuery({
    queryKey: [...queryKeys.ambassadors, admin ? "admin" : "public"],
    queryFn: async () => {
      let q = supabase
        .from("ambassadors")
        .select("*")
        .order("sort_order", { ascending: true });
      if (!admin) q = q.eq("published", true);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 60_000,
  });
}

export function useAmbassadorBenefits(admin = false) {
  return useQuery({
    queryKey: [...queryKeys.ambassadorBenefits, admin ? "admin" : "public"],
    queryFn: async () => {
      let q = supabase
        .from("ambassador_benefits")
        .select("*")
        .order("sort_order", { ascending: true });
      if (!admin) q = q.eq("published", true);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 60_000,
  });
}

export function useAdminCreateCommunityStory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      userId: string;
      authorName: string;
      authorLocation?: string;
      destination: string;
      content: string;
      imageUrl?: string | null;
      status?: "pending" | "approved" | "rejected";
    }) => {
      const { error } = await supabase.from("community_stories").insert({
        user_id: payload.userId,
        author_name: payload.authorName,
        author_location: payload.authorLocation || null,
        destination: payload.destination,
        content: payload.content,
        image_url: payload.imageUrl || null,
        status: payload.status || "approved",
        moderated_at: new Date().toISOString(),
        moderated_by: payload.userId,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.adminCommunityStories });
      qc.invalidateQueries({ queryKey: queryKeys.communityStories });
    },
  });
}

export function useAdminCreateReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      userId: string;
      targetType: string;
      targetId: string;
      rating: number;
      comment: string;
      authorDisplayName?: string;
      status?: "pending" | "approved" | "rejected";
    }) => {
      const { error } = await supabase.from("reviews").insert({
        user_id: payload.userId,
        target_type: payload.targetType,
        target_id: payload.targetId,
        rating: payload.rating,
        comment: payload.comment,
        author_display_name: payload.authorDisplayName || null,
        status: payload.status || "approved",
        moderated_at: new Date().toISOString(),
        moderated_by: payload.userId,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.adminReviews });
      qc.invalidateQueries({ queryKey: queryKeys.reviews });
    },
  });
}

// ---------------------------------------------------------------------------
// Modération & signalement (cahier §7.9)
// ---------------------------------------------------------------------------

export type ReportTargetType = "story" | "review" | "comment";
export type ReportReason =
  | "spam"
  | "abus"
  | "contenu_inapproprie"
  | "fausse_information"
  | "autre";

export function useCreateReport() {
  return useMutation({
    mutationFn: async (payload: {
      reporterUserId: string;
      targetType: ReportTargetType;
      targetId: string;
      reason: ReportReason;
      comment?: string;
    }) => {
      const { error } = await supabase.from("reports").insert({
        reporter_user_id: payload.reporterUserId,
        target_type: payload.targetType,
        target_id: payload.targetId,
        reason: payload.reason,
        comment: payload.comment || null,
      });
      if (error) throw error;
    },
  });
}

export interface ReportRow {
  id: string;
  reporter_user_id: string;
  target_type: ReportTargetType;
  target_id: string;
  reason: ReportReason;
  comment: string | null;
  status: "open" | "in_review" | "actioned" | "rejected";
  created_at: string;
  resolved_at: string | null;
  resolved_by: string | null;
}

export function useReports(statusFilter: string) {
  return useQuery({
    queryKey: ["reports", "admin", statusFilter],
    queryFn: async () => {
      let query = supabase
        .from("reports")
        .select("*")
        .order("created_at", { ascending: false });
      if (statusFilter !== "all") query = query.eq("status", statusFilter);
      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as ReportRow[];
    },
  });
}

export function useResolveReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      reportId: string;
      action: "soft_delete" | "ban" | "warn" | "dismiss";
      reason?: string;
    }) => {
      const { error } = await supabase.rpc("resolve_report", {
        p_report_id: payload.reportId,
        p_action: payload.action,
        p_reason: payload.reason || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reports", "admin"] });
      qc.invalidateQueries({ queryKey: ["profiles", "banned"] });
    },
  });
}

export function useUnbanUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { userId: string; reason?: string }) => {
      const { error } = await supabase.rpc("unban_user", {
        p_user_id: payload.userId,
        p_reason: payload.reason || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["profiles", "banned"] });
    },
  });
}

export interface NotificationRow {
  id: string;
  user_id: string | null;
  recipient_email: string | null;
  type: string;
  subject: string;
  payload: Record<string, unknown>;
  status: "pending" | "sent" | "failed" | "skipped_no_provider";
  error: string | null;
  created_at: string;
  sent_at: string | null;
}

export function useNotifications(statusFilter: string) {
  return useQuery({
    queryKey: ["notifications", "admin", statusFilter],
    queryFn: async () => {
      let query = supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);
      if (statusFilter !== "all") query = query.eq("status", statusFilter);
      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as NotificationRow[];
    },
  });
}

export interface DuplicateIpSignal {
  session_id: string;
  registration_ip: string;
  distinct_users: number;
  user_ids: string[];
}

export function useDuplicateRegistrationSignals() {
  return useQuery({
    queryKey: ["action-participation-ip-duplicates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("action_participation_ip_duplicates")
        .select("*");
      if (error) throw error;
      return (data ?? []) as DuplicateIpSignal[];
    },
    staleTime: 60_000,
  });
}

export function useBannedUsers() {
  return useQuery({
    queryKey: ["profiles", "banned"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("user_id, full_name, banned_at, banned_reason")
        .eq("is_banned", true)
        .order("banned_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}
