"use client";

import { useState, useEffect } from "react";
import { getSupabaseClient } from "@/lib/supabase-client";
import type { HomepageStats } from "@/app/types/homepage";

export const useHomepageStats = () => {
  const [stats, setStats] = useState<HomepageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const supabase = getSupabaseClient();

      // Get total business count
      const { count: totalBusinesses, error: businessError } = await supabase
        .from("production_businesses")
        .select("*", { count: "exact", head: true });

      if (businessError) {
        throw new Error(`Failed to count businesses: ${businessError.message}`);
      }

      // Get unique states count
      const { data: statesData, error: statesError } = await supabase
        .from("production_businesses")
        .select("us_state")
        .not("us_state", "is", null)
        .not("us_state", "eq", "");

      if (statesError) {
        throw new Error(`Failed to fetch states: ${statesError.message}`);
      }

      const uniqueStates = new Set(
        statesData?.map((item: any) => item.us_state) || []
      );
      const statesCovered = uniqueStates.size;

      // Get unique cities count
      const { data: citiesData, error: citiesError } = await supabase
        .from("production_businesses")
        .select("city")
        .not("city", "is", null)
        .not("city", "eq", "");

      if (citiesError) {
        throw new Error(`Failed to fetch cities: ${citiesError.message}`);
      }

      const uniqueCities = new Set(citiesData?.map((item: any) => item.city) || []);
      const citiesCovered = uniqueCities.size;

      const stats: HomepageStats = {
        totalBusinesses: totalBusinesses || 0,
        statesCovered,
        citiesCovered,
      };

      setStats(stats);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch homepage stats"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats,
  };
};
