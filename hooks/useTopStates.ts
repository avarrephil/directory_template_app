"use client";

import { useState, useEffect } from "react";
import { getSupabaseClient } from "@/lib/supabase-client";
import type { StateData } from "@/app/types/homepage";
import { STATE_EMOJIS } from "@/app/types/homepage";

export const useTopStates = (limit: number = 8) => {
  const [states, setStates] = useState<StateData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTopStates = async () => {
    try {
      setLoading(true);
      setError(null);
      const supabase = getSupabaseClient();

      // Get business count by state
      const { data: businessData, error: businessError } = await supabase
        .from("production_businesses")
        .select("us_state")
        .not("us_state", "is", null)
        .not("us_state", "eq", "");

      if (businessError) {
        throw new Error(
          `Failed to fetch state businesses: ${businessError.message}`
        );
      }

      // Count businesses by state
      const stateBusinessCounts = new Map<string, number>();
      businessData?.forEach((item: any) => {
        const state = item.us_state;
        stateBusinessCounts.set(
          state,
          (stateBusinessCounts.get(state) || 0) + 1
        );
      });

      // Get city count by state
      const { data: cityData, error: cityError } = await supabase
        .from("production_businesses")
        .select("us_state, city")
        .not("us_state", "is", null)
        .not("us_state", "eq", "")
        .not("city", "is", null)
        .not("city", "eq", "");

      if (cityError) {
        throw new Error(`Failed to fetch state cities: ${cityError.message}`);
      }

      // Count cities by state
      const stateCityCounts = new Map<string, Set<string>>();
      cityData?.forEach((item: any) => {
        const state = item.us_state;
        const city = item.city;
        if (!stateCityCounts.has(state)) {
          stateCityCounts.set(state, new Set());
        }
        stateCityCounts.get(state)!.add(city);
      });

      // Create state data array
      const stateDataArray: StateData[] = Array.from(
        stateBusinessCounts.entries()
      )
        .map(([state, businessCount]) => ({
          state,
          businessCount,
          cityCount: stateCityCounts.get(state)?.size || 0,
          emoji: STATE_EMOJIS[state] || "📍",
        }))
        .sort((a, b) => b.businessCount - a.businessCount)
        .slice(0, limit);

      setStates(stateDataArray);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch top states"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopStates();
  }, [limit]);

  return {
    states,
    loading,
    error,
    refetch: fetchTopStates,
  };
};
