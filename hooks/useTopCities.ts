"use client";

import { useState, useEffect } from "react";
import { getSupabaseClient } from "@/lib/supabase-client";
import type { CityData } from "@/app/types/homepage";

export const useTopCities = (limit: number = 8) => {
  const [cities, setCities] = useState<CityData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTopCities = async () => {
    try {
      setLoading(true);
      setError(null);
      const supabase = getSupabaseClient();

      // Get business count by city and state
      const { data: businessData, error: businessError } = await supabase
        .from("production_businesses")
        .select("city, us_state")
        .not("city", "is", null)
        .not("city", "eq", "")
        .not("us_state", "is", null)
        .not("us_state", "eq", "");

      if (businessError) {
        throw new Error(
          `Failed to fetch city businesses: ${businessError.message}`
        );
      }

      // Count businesses by city-state combination
      const cityBusinessCounts = new Map<
        string,
        { city: string; state: string; count: number }
      >();

      businessData?.forEach((item: any) => {
        const city = item.city;
        const state = item.us_state;
        const key = `${city}, ${state}`;

        if (cityBusinessCounts.has(key)) {
          cityBusinessCounts.get(key)!.count += 1;
        } else {
          cityBusinessCounts.set(key, {
            city,
            state,
            count: 1,
          });
        }
      });

      // Create city data array and sort by business count
      const cityDataArray: CityData[] = Array.from(cityBusinessCounts.values())
        .map(({ city, state, count }) => ({
          city,
          state,
          businessCount: count,
        }))
        .sort((a, b) => b.businessCount - a.businessCount)
        .slice(0, limit);

      setCities(cityDataArray);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch top cities"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopCities();
  }, [limit]);

  return {
    cities,
    loading,
    error,
    refetch: fetchTopCities,
  };
};
