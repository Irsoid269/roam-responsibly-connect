import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface EmissionFactorSet {
  id: string;
  name: string;
}

export type EmissionFactorMap = Record<string, Record<string, number>>;

export interface ActiveEmissionFactors {
  setId: string | null;
  setName: string | null;
  factors: EmissionFactorMap;
}

/** Live factors from the currently active emission_factor_sets row, grouped
 * by category then subcategory (e.g. factors.transport.plane). Returns an
 * empty map (never throws) if none is configured yet — callers should merge
 * this over their own hardcoded defaults rather than assume completeness. */
export function useActiveEmissionFactors() {
  return useQuery({
    queryKey: ["emission-factors", "active"],
    queryFn: async (): Promise<ActiveEmissionFactors> => {
      const { data: set, error: setError } = await supabase
        .from("emission_factor_sets")
        .select("id, name")
        .eq("is_active", true)
        .maybeSingle();

      if (setError || !set) {
        return { setId: null, setName: null, factors: {} };
      }

      const { data: factorRows, error: factorsError } = await supabase
        .from("emission_factors")
        .select("category, subcategory, value")
        .eq("set_id", set.id);

      if (factorsError || !factorRows) {
        return { setId: set.id, setName: set.name, factors: {} };
      }

      const factors: EmissionFactorMap = {};
      for (const row of factorRows) {
        if (!factors[row.category]) factors[row.category] = {};
        factors[row.category][row.subcategory] = Number(row.value);
      }

      return { setId: set.id, setName: set.name, factors };
    },
    staleTime: 5 * 60_000,
  });
}
