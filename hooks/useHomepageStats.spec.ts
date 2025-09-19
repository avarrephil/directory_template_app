import { describe, expect, test, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useHomepageStats } from "./useHomepageStats";
import * as supabaseClient from "@/lib/supabase-client";
import type { HomepageStats } from "@/app/types/homepage";

// Mock the supabase client
vi.mock("@/lib/supabase-client", () => ({
  getSupabaseClient: vi.fn(),
}));

const mockSupabaseClient = {
  from: vi.fn(() => mockSupabaseClient),
  select: vi.fn(() => mockSupabaseClient),
};

const mockBusinessData = [
  { id: "1", us_state: "California", city: "Los Angeles" },
  { id: "2", us_state: "California", city: "San Francisco" },
  { id: "3", us_state: "Texas", city: "Houston" },
  { id: "4", us_state: "Texas", city: "Austin" },
  { id: "5", us_state: "New York", city: "New York City" },
];

describe("useHomepageStats", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(supabaseClient.getSupabaseClient).mockReturnValue(mockSupabaseClient as any);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  test("calculates stats correctly from business data", async () => {
    mockSupabaseClient.select.mockResolvedValueOnce({
      data: mockBusinessData,
      error: null,
    });

    const { result } = renderHook(() => useHomepageStats());

    expect(result.current.loading).toBe(true);
    expect(result.current.stats).toBe(null);
    expect(result.current.error).toBe(null);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const expectedStats: HomepageStats = {
      totalBusinesses: 5,
      totalStates: 3,
      totalCities: 5,
    };

    expect(result.current.stats).toEqual(expectedStats);
    expect(result.current.error).toBe(null);
  });

  test("handles empty business data", async () => {
    mockSupabaseClient.select.mockResolvedValueOnce({
      data: [],
      error: null,
    });

    const { result } = renderHook(() => useHomepageStats());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const expectedStats: HomepageStats = {
      totalBusinesses: 0,
      totalStates: 0,
      totalCities: 0,
    };

    expect(result.current.stats).toEqual(expectedStats);
    expect(result.current.error).toBe(null);
  });

  test("handles null business data", async () => {
    mockSupabaseClient.select.mockResolvedValueOnce({
      data: null,
      error: null,
    });

    const { result } = renderHook(() => useHomepageStats());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const expectedStats: HomepageStats = {
      totalBusinesses: 0,
      totalStates: 0,
      totalCities: 0,
    };

    expect(result.current.stats).toEqual(expectedStats);
  });

  test("filters out null and empty state/city values", async () => {
    const dataWithNulls = [
      { id: "1", us_state: "California", city: "Los Angeles" },
      { id: "2", us_state: null, city: "San Francisco" },
      { id: "3", us_state: "Texas", city: null },
      { id: "4", us_state: "", city: "Houston" },
      { id: "5", us_state: "Texas", city: "" },
      { id: "6", us_state: "New York", city: "New York City" },
    ];

    mockSupabaseClient.select.mockResolvedValueOnce({
      data: dataWithNulls,
      error: null,
    });

    const { result } = renderHook(() => useHomepageStats());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Only businesses with both valid state and city should count toward states/cities
    // Total businesses is still 6 because it counts all records
    const expectedStats: HomepageStats = {
      totalBusinesses: 6,
      totalStates: 2, // California, Texas, New York (only counting valid states)
      totalCities: 2, // Los Angeles, New York City (only counting valid cities)
    };

    expect(result.current.stats).toEqual(expectedStats);
  });

  test("correctly counts unique states and cities", async () => {
    const dataWithDuplicates = [
      { id: "1", us_state: "California", city: "Los Angeles" },
      { id: "2", us_state: "California", city: "Los Angeles" }, // Duplicate city
      { id: "3", us_state: "California", city: "San Francisco" },
      { id: "4", us_state: "Texas", city: "Houston" },
      { id: "5", us_state: "Texas", city: "Houston" }, // Duplicate city
    ];

    mockSupabaseClient.select.mockResolvedValueOnce({
      data: dataWithDuplicates,
      error: null,
    });

    const { result } = renderHook(() => useHomepageStats());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const expectedStats: HomepageStats = {
      totalBusinesses: 5,
      totalStates: 2, // California, Texas
      totalCities: 3, // Los Angeles, San Francisco, Houston
    };

    expect(result.current.stats).toEqual(expectedStats);
  });

  test("handles database fetch error", async () => {
    const errorMessage = "Database connection failed";
    mockSupabaseClient.select.mockResolvedValueOnce({
      data: null,
      error: { message: errorMessage },
    });

    const { result } = renderHook(() => useHomepageStats());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.stats).toBe(null);
    expect(result.current.error).toBe(`Failed to fetch business data: ${errorMessage}`);
  });

  test("handles network errors gracefully", async () => {
    mockSupabaseClient.select.mockRejectedValueOnce(new Error("Network error"));

    const { result } = renderHook(() => useHomepageStats());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.stats).toBe(null);
    expect(result.current.error).toBe("Network error");
  });

  test("handles non-Error exceptions", async () => {
    mockSupabaseClient.select.mockRejectedValueOnce("String error");

    const { result } = renderHook(() => useHomepageStats());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.stats).toBe(null);
    expect(result.current.error).toBe("Failed to fetch homepage stats");
  });

  test("queries correct table and fields", async () => {
    mockSupabaseClient.select.mockResolvedValueOnce({
      data: mockBusinessData,
      error: null,
    });

    renderHook(() => useHomepageStats());

    await waitFor(() => {
      expect(mockSupabaseClient.from).toHaveBeenCalledWith("production_businesses");
      expect(mockSupabaseClient.select).toHaveBeenCalledWith("us_state, city");
    });
  });

  test("refetch function works correctly", async () => {
    // Mock initial fetch
    mockSupabaseClient.select.mockResolvedValueOnce({
      data: mockBusinessData,
      error: null,
    });

    const { result } = renderHook(() => useHomepageStats());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.stats?.totalBusinesses).toBe(5);

    // Mock refetch with different data
    const newBusinessData = [...mockBusinessData, { id: "6", us_state: "Florida", city: "Miami" }];
    mockSupabaseClient.select.mockResolvedValueOnce({
      data: newBusinessData,
      error: null,
    });

    await waitFor(() => {
      result.current.refetch();
    });

    await waitFor(() => {
      expect(result.current.stats?.totalBusinesses).toBe(6);
      expect(result.current.stats?.totalStates).toBe(4);
    });
  });

  test("maintains referential stability for refetch function", () => {
    mockSupabaseClient.select.mockResolvedValueOnce({
      data: mockBusinessData,
      error: null,
    });

    const { result, rerender } = renderHook(() => useHomepageStats());

    const refetchFunction1 = result.current.refetch;
    
    rerender();
    
    const refetchFunction2 = result.current.refetch;

    expect(refetchFunction1).toBe(refetchFunction2);
  });

  test("handles case sensitivity in state and city names", async () => {
    const dataWithCaseDifferences = [
      { id: "1", us_state: "california", city: "los angeles" },
      { id: "2", us_state: "California", city: "Los Angeles" },
      { id: "3", us_state: "CALIFORNIA", city: "LOS ANGELES" },
    ];

    mockSupabaseClient.select.mockResolvedValueOnce({
      data: dataWithCaseDifferences,
      error: null,
    });

    const { result } = renderHook(() => useHomepageStats());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Each case variation should be treated as distinct
    const expectedStats: HomepageStats = {
      totalBusinesses: 3,
      totalStates: 3, // california, California, CALIFORNIA
      totalCities: 3, // los angeles, Los Angeles, LOS ANGELES
    };

    expect(result.current.stats).toEqual(expectedStats);
  });
});