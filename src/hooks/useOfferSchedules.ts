import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface OfferSchedule {
  id: string;
  offer_id: string;
  start_at: string;
  end_at: string;
  capacity: number;
  booked_count: number;
  price_eur: number | null;
}

export const offerSchedulesKeys = {
  upcoming: (offerId: string) => ["offer-schedules", "upcoming", offerId] as const,
  all: (offerId: string) => ["offer-schedules", "all", offerId] as const,
};

/** Future, bookable schedules for the public slot picker. */
export function useUpcomingOfferSchedules(offerId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: offerSchedulesKeys.upcoming(offerId || "none"),
    enabled: !!offerId && enabled,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("offer_schedules")
        .select("*")
        .eq("offer_id", offerId!)
        .gt("end_at", new Date().toISOString())
        .order("start_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as OfferSchedule[];
    },
    staleTime: 10_000,
  });
}

/** Every schedule (past included) for admin management. */
export function useAllOfferSchedules(offerId: string | undefined) {
  return useQuery({
    queryKey: offerSchedulesKeys.all(offerId || "none"),
    enabled: !!offerId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("offer_schedules")
        .select("*")
        .eq("offer_id", offerId!)
        .order("start_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as OfferSchedule[];
    },
    staleTime: 5_000,
  });
}

export function useInvalidateOfferSchedules() {
  const queryClient = useQueryClient();
  return (offerId: string) => {
    queryClient.invalidateQueries({ queryKey: offerSchedulesKeys.upcoming(offerId) });
    queryClient.invalidateQueries({ queryKey: offerSchedulesKeys.all(offerId) });
  };
}

/** Cheap existence check: does this offer have any bookable slot at all? */
export async function offerHasUpcomingSchedules(offerId: string): Promise<boolean> {
  const { count, error } = await supabase
    .from("offer_schedules")
    .select("id", { count: "exact", head: true })
    .eq("offer_id", offerId)
    .gt("end_at", new Date().toISOString());
  if (error) {
    console.warn("offerHasUpcomingSchedules failed:", error.message);
    return false;
  }
  return (count ?? 0) > 0;
}
