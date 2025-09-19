import { describe, expect, test, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useTopCities } from "./useTopCities";
import * as supabaseClient from "@/lib/supabase-client";
import type { CityData } from "@/app/types/homepage";
import fc from "fast-check";

// Mock the supabase client
vi.mock("@/lib/supabase-client", () => ({
  getSupabaseClient: vi.fn(),
}));

const mockSupabaseClient = {
  from: vi.fn(() => mockSupabaseClient),
  select: vi.fn(() => mockSupabaseClient),
  not: vi.fn(() => mockSupabaseClient),
  eq: vi.fn(() => mockSupabaseClient),
};

const mockBusinessData = [
  { city: "Los Angeles", us_state: "California" },
  { city: "Los Angeles", us_state: "California" },
  { city: "San Francisco", us_state: "California" },
  { city: "Houston", us_state: "Texas" },
  { city: "Houston", us_state: "Texas" },
  { city: "Houston", us_state: "Texas" },
  { city: "New York City", us_state: "New York" },
  { city: "Miami", us_state: "Florida" },
];

describe("useTopCities", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(supabaseClient.getSupabaseClient).mockReturnValue(mockSupabaseClient as any);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  test("calculates top cities correctly with default limit", async () => {
    mockSupabaseClient.select.mockResolvedValueOnce({
      data: mockBusinessData,
      error: null,
    });

    const { result } = renderHook(() => useTopCities());

    expect(result.current.loading).toBe(true);
    expect(result.current.cities).toEqual([]);
    expect(result.current.error).toBe(null);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const expectedCities: CityData[] = [
      { city: "Houston", state: "Texas", businessCount: 3 },
      { city: "Los Angeles", state: "California", businessCount: 2 },
      { city: "San Francisco", state: "California", businessCount: 1 },
      { city: "New York City", state: "New York", businessCount: 1 },
      { city: "Miami", state: "Florida", businessCount: 1 },
    ];

    expect(result.current.cities).toEqual(expectedCities);
    expect(result.current.error).toBe(null);
  });

  test("respects custom limit parameter", async () => {
    mockSupabaseClient.select.mockResolvedValueOnce({
      data: mockBusinessData,
      error: null,
    });

    const { result } = renderHook(() => useTopCities(3));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.cities).toHaveLength(3);
    expect(result.current.cities[0]).toEqual({ city: "Houston", state: "Texas", businessCount: 3 });
    expect(result.current.cities[1]).toEqual({ city: "Los Angeles", state: "California", businessCount: 2 });
    expect(result.current.cities[2]).toEqual({ city: "San Francisco", state: "California", businessCount: 1 });
  });

  test("sorts cities by business count in descending order", async () => {
    const unsortedData = [
      { city: "Small Town", us_state: "Wyoming" },
      { city: "Houston", us_state: "Texas" },
      { city: "Houston", us_state: "Texas" },
      { city: "Houston", us_state: "Texas" },
      { city: "Houston", us_state: "Texas" },
      { city: "Los Angeles", us_state: "California" },
      { city: "Los Angeles", us_state: "California" },
      { city: "Los Angeles", us_state: "California" },
      { city: "Dover", us_state: "Delaware" },
      { city: "Dover", us_state: "Delaware" },
    ];

    mockSupabaseClient.select.mockResolvedValueOnce({
      data: unsortedData,
      error: null,
    });

    const { result } = renderHook(() => useTopCities());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.cities[0]).toEqual({ city: "Houston", state: "Texas", businessCount: 4 });
    expect(result.current.cities[1]).toEqual({ city: "Los Angeles", state: "California", businessCount: 3 });
    expect(result.current.cities[2]).toEqual({ city: "Dover", state: "Delaware", businessCount: 2 });
    expect(result.current.cities[3]).toEqual({ city: "Small Town", state: "Wyoming", businessCount: 1 });
  });

  test("handles empty business data", async () => {
    mockSupabaseClient.select.mockResolvedValueOnce({
      data: [],
      error: null,
    });

    const { result } = renderHook(() => useTopCities());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.cities).toEqual([]);
    expect(result.current.error).toBe(null);
  });

  test("handles null business data", async () => {
    mockSupabaseClient.select.mockResolvedValueOnce({
      data: null,
      error: null,
    });

    const { result } = renderHook(() => useTopCities());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.cities).toEqual([]);
  });

  test("filters out businesses with null or empty cities/states", async () => {
    const dataWithInvalidValues = [
      { city: "Los Angeles", us_state: "California" },
      { city: null, us_state: "California" },
      { city: "", us_state: "Texas" },
      { city: "Houston", us_state: null },
      { city: "Austin", us_state: "" },
      { city: undefined, us_state: "Florida" },
      { city: "Miami", us_state: "Florida" },
    ];

    mockSupabaseClient.select.mockResolvedValueOnce({
      data: dataWithInvalidValues,
      error: null,
    });

    const { result } = renderHook(() => useTopCities());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const expectedCities: CityData[] = [
      { city: "Los Angeles", state: "California", businessCount: 1 },
      { city: "Miami", state: "Florida", businessCount: 1 },
    ];

    expect(result.current.cities).toEqual(expectedCities);
  });

  test("treats city-state combinations as unique keys", async () => {
    const dataWithSameCityDifferentStates = [
      { city: "Springfield", us_state: "Illinois" },
      { city: "Springfield", us_state: "Missouri" },
      { city: "Springfield", us_state: "Massachusetts" },
      { city: "Springfield", us_state: "Illinois" }, // Duplicate
    ];

    mockSupabaseClient.select.mockResolvedValueOnce({
      data: dataWithSameCityDifferentStates,
      error: null,
    });

    const { result } = renderHook(() => useTopCities());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const expectedCities: CityData[] = [
      { city: "Springfield", state: "Illinois", businessCount: 2 },
      { city: "Springfield", state: "Missouri", businessCount: 1 },
      { city: "Springfield", state: "Massachusetts", businessCount: 1 },
    ];

    expect(result.current.cities).toEqual(expectedCities);
  });

  test("handles database fetch error", async () => {
    const errorMessage = "Database connection failed";
    mockSupabaseClient.select.mockResolvedValueOnce({
      data: null,
      error: { message: errorMessage },
    });

    const { result } = renderHook(() => useTopCities());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.cities).toEqual([]);
    expect(result.current.error).toBe(`Failed to fetch city businesses: ${errorMessage}`);
  });

  test("handles network errors gracefully", async () => {
    mockSupabaseClient.select.mockRejectedValueOnce(new Error("Network error"));

    const { result } = renderHook(() => useTopCities());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.cities).toEqual([]);
    expect(result.current.error).toBe("Network error");
  });

  test("handles non-Error exceptions", async () => {
    mockSupabaseClient.select.mockRejectedValueOnce("String error");

    const { result } = renderHook(() => useTopCities());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.cities).toEqual([]);
    expect(result.current.error).toBe("Failed to fetch top cities");
  });

  test("applies correct database filters", async () => {
    mockSupabaseClient.select.mockResolvedValueOnce({
      data: mockBusinessData,
      error: null,
    });

    renderHook(() => useTopCities());

    await waitFor(() => {
      expect(mockSupabaseClient.from).toHaveBeenCalledWith("production_businesses");
      expect(mockSupabaseClient.select).toHaveBeenCalledWith("city, us_state");
      
      // Check that all necessary filters are applied
      expect(mockSupabaseClient.not).toHaveBeenCalledWith("city", "is", null);
      expect(mockSupabaseClient.not).toHaveBeenCalledWith("city", "eq", "");
      expect(mockSupabaseClient.not).toHaveBeenCalledWith("us_state", "is", null);
      expect(mockSupabaseClient.not).toHaveBeenCalledWith("us_state", "eq", "");
    });
  });

  test("refetch function works correctly", async () => {
    // Mock initial fetch
    mockSupabaseClient.select.mockResolvedValueOnce({
      data: mockBusinessData,
      error: null,
    });

    const { result } = renderHook(() => useTopCities());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.cities).toHaveLength(5);

    // Mock refetch with different data
    const newBusinessData = [
      ...mockBusinessData,
      { city: "Houston", us_state: "Texas" },
      { city: "Phoenix", us_state: "Arizona" },
    ];
    mockSupabaseClient.select.mockResolvedValueOnce({
      data: newBusinessData,
      error: null,
    });

    await waitFor(() => {
      result.current.refetch();
    });

    await waitFor(() => {
      expect(result.current.cities[0]).toEqual({ city: "Houston", state: "Texas", businessCount: 4 });
      expect(result.current.cities).toHaveLength(6); // Added Phoenix
    });
  });

  test("maintains referential stability for refetch function", () => {
    mockSupabaseClient.select.mockResolvedValueOnce({
      data: mockBusinessData,
      error: null,
    });

    const { result, rerender } = renderHook(() => useTopCities());

    const refetchFunction1 = result.current.refetch;
    
    rerender();
    
    const refetchFunction2 = result.current.refetch;

    expect(refetchFunction1).toBe(refetchFunction2);
  });

  test("updates when limit parameter changes", async () => {
    mockSupabaseClient.select.mockResolvedValue({
      data: mockBusinessData,
      error: null,
    });

    const { result, rerender } = renderHook(
      ({ limit }) => useTopCities(limit),
      { initialProps: { limit: 2 } }
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.cities).toHaveLength(2);

    // Change limit
    rerender({ limit: 4 });

    await waitFor(() => {
      expect(result.current.cities).toHaveLength(4);
    });
  });

  test("handles case sensitivity in city and state names", async () => {
    const dataWithCaseDifferences = [
      { city: "los angeles", us_state: "california" },
      { city: "Los Angeles", us_state: "California" },
      { city: "LOS ANGELES", us_state: "CALIFORNIA" },
    ];

    mockSupabaseClient.select.mockResolvedValueOnce({
      data: dataWithCaseDifferences,
      error: null,
    });

    const { result } = renderHook(() => useTopCities());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Each case variation should be treated as distinct
    expect(result.current.cities).toHaveLength(3);
    expect(result.current.cities[0]).toEqual({ city: "los angeles", state: "california", businessCount: 1 });
    expect(result.current.cities[1]).toEqual({ city: "Los Angeles", state: "California", businessCount: 1 });
    expect(result.current.cities[2]).toEqual({ city: "LOS ANGELES", state: "CALIFORNIA", businessCount: 1 });
  });

  test("handles zero limit edge case", async () => {
    mockSupabaseClient.select.mockResolvedValueOnce({
      data: mockBusinessData,
      error: null,
    });

    const { result } = renderHook(() => useTopCities(0));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.cities).toEqual([]);
  });

  test("handles negative limit edge case", async () => {
    mockSupabaseClient.select.mockResolvedValueOnce({
      data: mockBusinessData,
      error: null,
    });

    const { result } = renderHook(() => useTopCities(-1));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.cities).toEqual([]);
  });

  test("creates correct city-state key format", async () => {
    const testData = [
      { city: "Austin", us_state: "Texas" },
      { city: "Austin", us_state: "Minnesota" }, // Different Austin
    ];

    mockSupabaseClient.select.mockResolvedValueOnce({
      data: testData,
      error: null,
    });

    const { result } = renderHook(() => useTopCities());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.cities).toHaveLength(2);
    expect(result.current.cities.find(c => c.state === "Texas")).toBeDefined();
    expect(result.current.cities.find(c => c.state === "Minnesota")).toBeDefined();
  });
});

// Property-based testing for aggregation logic
describe("useTopCities aggregation properties", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(supabaseClient.getSupabaseClient).mockReturnValue(mockSupabaseClient as any);
  });

  test("aggregation is commutative - order of input doesn't affect result", () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            city: fc.string().filter(s => s.length > 0),
            us_state: fc.string().filter(s => s.length > 0),
          }),
          { minLength: 1, maxLength: 20 }
        ),
        async (businessData) => {
          // Test with original order
          mockSupabaseClient.select.mockResolvedValueOnce({
            data: businessData,
            error: null,
          });

          const { result: result1 } = renderHook(() => useTopCities(10));
          await waitFor(() => expect(result1.current.loading).toBe(false));

          // Test with shuffled order
          const shuffledData = [...businessData].reverse();
          mockSupabaseClient.select.mockResolvedValueOnce({
            data: shuffledData,
            error: null,
          });

          const { result: result2 } = renderHook(() => useTopCities(10));
          await waitFor(() => expect(result2.current.loading).toBe(false));

          // Results should be identical
          expect(result1.current.cities).toEqual(result2.current.cities);
        }
      ),
      { numRuns: 10 }
    );
  });

  test("total business count equals sum of individual city counts", () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            city: fc.string().filter(s => s.length > 0),
            us_state: fc.string().filter(s => s.length > 0),
          }),
          { minLength: 1, maxLength: 20 }
        ),
        async (businessData) => {
          mockSupabaseClient.select.mockResolvedValueOnce({
            data: businessData,
            error: null,
          });

          const { result } = renderHook(() => useTopCities(100));
          await waitFor(() => expect(result.current.loading).toBe(false));

          const totalFromAggregation = result.current.cities.reduce(
            (sum, city) => sum + city.businessCount,
            0
          );

          expect(totalFromAggregation).toBe(businessData.length);
        }
      ),
      { numRuns: 10 }
    );
  });

  test("result is always sorted by business count descending", () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            city: fc.string().filter(s => s.length > 0),
            us_state: fc.string().filter(s => s.length > 0),
          }),
          { minLength: 2, maxLength: 20 }
        ),
        async (businessData) => {
          mockSupabaseClient.select.mockResolvedValueOnce({
            data: businessData,
            error: null,
          });

          const { result } = renderHook(() => useTopCities(100));
          await waitFor(() => expect(result.current.loading).toBe(false));

          const cities = result.current.cities;
          for (let i = 1; i < cities.length; i++) {
            expect(cities[i - 1].businessCount).toBeGreaterThanOrEqual(cities[i].businessCount);
          }
        }
      ),
      { numRuns: 10 }
    );
  });

  test("city-state combinations are unique", () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            city: fc.string().filter(s => s.length > 0),
            us_state: fc.string().filter(s => s.length > 0),
          }),
          { minLength: 1, maxLength: 20 }
        ),
        async (businessData) => {
          mockSupabaseClient.select.mockResolvedValueOnce({
            data: businessData,
            error: null,
          });

          const { result } = renderHook(() => useTopCities(100));
          await waitFor(() => expect(result.current.loading).toBe(false));

          const cityStateKeys = result.current.cities.map(c => `${c.city}, ${c.state}`);
          const uniqueKeys = new Set(cityStateKeys);
          
          expect(uniqueKeys.size).toBe(cityStateKeys.length);
        }
      ),
      { numRuns: 10 }
    );
  });
});