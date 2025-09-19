import { describe, expect, test, beforeAll, afterAll, beforeEach } from "vitest";
import { getSupabaseClient } from "@/lib/supabase-client";
import type { SiteSettings, HomepageStats, StateData, CityData } from "@/app/types/homepage";
import { brand } from "@/lib/types";

/**
 * Integration tests for database operations
 * These tests interact with a real Supabase instance to verify database schemas and operations
 * 
 * Note: These tests require proper Supabase environment setup
 * They should be run against a test database, not production
 */

const TEST_SETTINGS_ID = "00000000-0000-0000-0000-000000000001";

describe("Database Integration Tests", () => {
  const supabase = getSupabaseClient();
  let testBusinessIds: string[] = [];

  beforeAll(async () => {
    // Verify we're not running against production
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (supabaseUrl?.includes('production') || supabaseUrl?.includes('prod')) {
      throw new Error("Integration tests should not run against production database");
    }
  });

  afterAll(async () => {
    // Clean up test data
    if (testBusinessIds.length > 0) {
      await supabase
        .from("production_businesses")
        .delete()
        .in("id", testBusinessIds);
    }
  });

  describe("site_settings table operations", () => {
    test("can fetch site settings by ID", async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("*")
        .eq("id", TEST_SETTINGS_ID)
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      if (data) {
        expect(data.id).toBe(TEST_SETTINGS_ID);
        expect(typeof data.directory_name).toBe("string");
        expect(typeof data.primary_color).toBe("string");
        expect(typeof data.secondary_color).toBe("string");
      }
    });

    test("can update site settings", async () => {
      const testDirectoryName = `Test Directory ${Date.now()}`;
      const updates = {
        directory_name: testDirectoryName,
        updated_at: new Date().toISOString(),
      };

      const { error: updateError } = await supabase
        .from("site_settings")
        .update(updates)
        .eq("id", TEST_SETTINGS_ID);

      expect(updateError).toBeNull();

      // Verify the update
      const { data: updatedData, error: fetchError } = await supabase
        .from("site_settings")
        .select("directory_name")
        .eq("id", TEST_SETTINGS_ID)
        .single();

      expect(fetchError).toBeNull();
      expect(updatedData?.directory_name).toBe(testDirectoryName);
    });

    test("handles non-existent settings ID gracefully", async () => {
      const nonExistentId = "99999999-9999-9999-9999-999999999999";
      
      const { data, error } = await supabase
        .from("site_settings")
        .select("*")
        .eq("id", nonExistentId)
        .single();

      expect(data).toBeNull();
      expect(error).toBeDefined();
      expect(error?.code).toBe("PGRST116"); // PostgREST: no rows returned
    });

    test("validates required fields structure", async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("*")
        .eq("id", TEST_SETTINGS_ID)
        .single();

      expect(error).toBeNull();
      if (data) {
        // Verify all required fields exist
        const requiredFields = [
          'id', 'directory_name', 'primary_color', 'secondary_color',
          'hero_title', 'hero_subtitle', 'hero_description', 'browse_all_cta',
          'view_top_cta', 'bystate_title', 'bystate_description', 
          'bycities_title', 'bycities_description', 'updated_at'
        ];

        requiredFields.forEach(field => {
          expect(data).toHaveProperty(field);
        });

        // Verify boolean fields
        expect(typeof data.show_bystate_section).toBe("boolean");
        expect(typeof data.show_bycities_section).toBe("boolean");
      }
    });
  });

  describe("production_businesses table operations", () => {
    beforeEach(async () => {
      // Clean up any existing test data
      if (testBusinessIds.length > 0) {
        await supabase
          .from("production_businesses")
          .delete()
          .in("id", testBusinessIds);
        testBusinessIds = [];
      }
    });

    test("can insert and query business data", async () => {
      const testBusinesses = [
        {
          city: "Test City 1",
          us_state: "Test State 1",
          business_name: "Test Business 1",
        },
        {
          city: "Test City 2", 
          us_state: "Test State 1",
          business_name: "Test Business 2",
        },
        {
          city: "Test City 3",
          us_state: "Test State 2", 
          business_name: "Test Business 3",
        },
      ];

      const { data: insertedData, error: insertError } = await supabase
        .from("production_businesses")
        .insert(testBusinesses)
        .select("id");

      expect(insertError).toBeNull();
      expect(insertedData).toHaveLength(3);
      
      if (insertedData) {
        testBusinessIds = insertedData.map(row => row.id);
      }

      // Query the inserted data
      const { data: queryData, error: queryError } = await supabase
        .from("production_businesses")
        .select("us_state, city")
        .in("id", testBusinessIds);

      expect(queryError).toBeNull();
      expect(queryData).toHaveLength(3);
    });

    test("filters out null and empty state/city values correctly", async () => {
      const testBusinessesWithNulls = [
        {
          city: "Valid City",
          us_state: "Valid State",
          business_name: "Valid Business",
        },
        {
          city: null,
          us_state: "Valid State",
          business_name: "Null City Business",
        },
        {
          city: "",
          us_state: "Valid State", 
          business_name: "Empty City Business",
        },
        {
          city: "Valid City",
          us_state: null,
          business_name: "Null State Business",
        },
        {
          city: "Valid City",
          us_state: "",
          business_name: "Empty State Business", 
        },
      ];

      const { data: insertedData, error: insertError } = await supabase
        .from("production_businesses")
        .insert(testBusinessesWithNulls)
        .select("id");

      expect(insertError).toBeNull();
      
      if (insertedData) {
        testBusinessIds = insertedData.map(row => row.id);
      }

      // Query with proper filters (same as used in hooks)
      const { data: filteredData, error: queryError } = await supabase
        .from("production_businesses")
        .select("us_state, city")
        .in("id", testBusinessIds)
        .not("us_state", "is", null)
        .not("us_state", "eq", "")
        .not("city", "is", null)
        .not("city", "eq", "");

      expect(queryError).toBeNull();
      expect(filteredData).toHaveLength(1); // Only the valid business
      expect(filteredData?.[0]).toEqual({
        city: "Valid City",
        us_state: "Valid State",
      });
    });

    test("can aggregate state statistics correctly", async () => {
      const testStatesData = [
        { city: "LA", us_state: "California", business_name: "CA Biz 1" },
        { city: "SF", us_state: "California", business_name: "CA Biz 2" },
        { city: "SD", us_state: "California", business_name: "CA Biz 3" },
        { city: "Houston", us_state: "Texas", business_name: "TX Biz 1" },
        { city: "Austin", us_state: "Texas", business_name: "TX Biz 2" },
        { city: "NYC", us_state: "New York", business_name: "NY Biz 1" },
      ];

      const { data: insertedData, error: insertError } = await supabase
        .from("production_businesses")
        .insert(testStatesData)
        .select("id");

      expect(insertError).toBeNull();
      
      if (insertedData) {
        testBusinessIds = insertedData.map(row => row.id);
      }

      const { data: stateData, error: queryError } = await supabase
        .from("production_businesses")
        .select("us_state")
        .in("id", testBusinessIds)
        .not("us_state", "is", null)
        .not("us_state", "eq", "");

      expect(queryError).toBeNull();
      expect(stateData).toHaveLength(6);

      // Count businesses by state
      const stateCounts = new Map<string, number>();
      stateData?.forEach((item: any) => {
        const state = item.us_state;
        stateCounts.set(state, (stateCounts.get(state) || 0) + 1);
      });

      expect(stateCounts.get("California")).toBe(3);
      expect(stateCounts.get("Texas")).toBe(2);
      expect(stateCounts.get("New York")).toBe(1);
    });

    test("can aggregate city-state statistics correctly", async () => {
      const testCitiesData = [
        { city: "Houston", us_state: "Texas", business_name: "TX Houston 1" },
        { city: "Houston", us_state: "Texas", business_name: "TX Houston 2" },
        { city: "Houston", us_state: "Texas", business_name: "TX Houston 3" },
        { city: "Austin", us_state: "Texas", business_name: "TX Austin 1" },
        { city: "Springfield", us_state: "Illinois", business_name: "IL Springfield 1" },
        { city: "Springfield", us_state: "Missouri", business_name: "MO Springfield 1" },
      ];

      const { data: insertedData, error: insertError } = await supabase
        .from("production_businesses")
        .insert(testCitiesData)
        .select("id");

      expect(insertError).toBeNull();
      
      if (insertedData) {
        testBusinessIds = insertedData.map(row => row.id);
      }

      const { data: cityData, error: queryError } = await supabase
        .from("production_businesses")
        .select("city, us_state")
        .in("id", testBusinessIds)
        .not("city", "is", null)
        .not("city", "eq", "")
        .not("us_state", "is", null)
        .not("us_state", "eq", "");

      expect(queryError).toBeNull();
      expect(cityData).toHaveLength(6);

      // Count businesses by city-state combination
      const cityStateCounts = new Map<string, number>();
      cityData?.forEach((item: any) => {
        const key = `${item.city}, ${item.us_state}`;
        cityStateCounts.set(key, (cityStateCounts.get(key) || 0) + 1);
      });

      expect(cityStateCounts.get("Houston, Texas")).toBe(3);
      expect(cityStateCounts.get("Austin, Texas")).toBe(1);
      expect(cityStateCounts.get("Springfield, Illinois")).toBe(1);
      expect(cityStateCounts.get("Springfield, Missouri")).toBe(1);
    });

    test("can calculate homepage statistics", async () => {
      const testStatisticsData = [
        { city: "Los Angeles", us_state: "California", business_name: "CA Business 1" },
        { city: "San Francisco", us_state: "California", business_name: "CA Business 2" },
        { city: "Houston", us_state: "Texas", business_name: "TX Business 1" },
        { city: "Miami", us_state: "Florida", business_name: "FL Business 1" },
        { city: null, us_state: "Invalid", business_name: "Invalid Business 1" },
        { city: "", us_state: "Invalid", business_name: "Invalid Business 2" },
      ];

      const { data: insertedData, error: insertError } = await supabase
        .from("production_businesses")
        .insert(testStatisticsData)
        .select("id");

      expect(insertError).toBeNull();
      
      if (insertedData) {
        testBusinessIds = insertedData.map(row => row.id);
      }

      const { data: allBusinesses, error: queryError } = await supabase
        .from("production_businesses")
        .select("us_state, city")
        .in("id", testBusinessIds);

      expect(queryError).toBeNull();

      // Calculate statistics like the hook does
      const validBusinesses = allBusinesses?.filter((item: any) => 
        item.us_state && item.us_state !== "" && item.city && item.city !== ""
      ) || [];

      const uniqueStates = new Set(validBusinesses.map((item: any) => item.us_state));
      const uniqueCities = new Set(validBusinesses.map((item: any) => item.city));

      const stats: HomepageStats = {
        totalBusinesses: allBusinesses?.length || 0,
        totalStates: uniqueStates.size,
        totalCities: uniqueCities.size,
      };

      expect(stats.totalBusinesses).toBe(6);
      expect(stats.totalStates).toBe(3); // California, Texas, Florida (not Invalid)
      expect(stats.totalCities).toBe(4); // LA, SF, Houston, Miami
    });
  });

  describe("Database schema validation", () => {
    test("site_settings table has correct structure", async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("*")
        .limit(1);

      expect(error).toBeNull();
      
      // Even if no data, the query should succeed and we can check the structure
      // by attempting to select specific columns
      const { error: structureError } = await supabase
        .from("site_settings")
        .select(`
          id,
          directory_name,
          logo_url,
          primary_color,
          secondary_color,
          hero_title,
          hero_subtitle,
          hero_description,
          browse_all_cta,
          view_top_cta,
          bystate_title,
          bystate_description,
          show_bystate_section,
          bycities_title,
          bycities_description,
          show_bycities_section,
          updated_at
        `)
        .limit(1);

      expect(structureError).toBeNull();
    });

    test("production_businesses table has correct structure", async () => {
      const { error: structureError } = await supabase
        .from("production_businesses")
        .select(`
          id,
          city,
          us_state,
          business_name,
          created_at
        `)
        .limit(1);

      expect(structureError).toBeNull();
    });
  });

  describe("Database permissions and RLS", () => {
    test("can read from site_settings table", async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("id")
        .limit(1);

      expect(error).toBeNull();
      // Data might be empty, but query should succeed
    });

    test("can update site_settings table", async () => {
      // First check if we have any settings to update
      const { data: existingData } = await supabase
        .from("site_settings")
        .select("id")
        .limit(1);

      if (existingData && existingData.length > 0) {
        const { error } = await supabase
          .from("site_settings")
          .update({ updated_at: new Date().toISOString() })
          .eq("id", existingData[0].id);

        expect(error).toBeNull();
      }
    });

    test("can read from production_businesses table", async () => {
      const { data, error } = await supabase
        .from("production_businesses")
        .select("id")
        .limit(1);

      expect(error).toBeNull();
      // Data might be empty, but query should succeed
    });
  });
});