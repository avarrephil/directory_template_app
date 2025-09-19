import { describe, expect, test, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useTopStates } from "./useTopStates";
import * as supabaseClient from "@/lib/supabase-client";
import type { StateData } from "@/app/types/homepage";
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
  { us_state: "California", city: "Los Angeles" },
  { us_state: "California", city: "San Francisco" },
  { us_state: "California", city: "San Diego" },
  { us_state: "Texas", city: "Houston" },
  { us_state: "Texas", city: "Austin" },
  { us_state: "New York", city: "New York City" },
  { us_state: "Florida", city: "Miami" },
];

describe("useTopStates", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(supabaseClient.getSupabaseClient).mockReturnValue(mockSupabaseClient as any);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  test("calculates top states correctly with default limit", async () => {
    mockSupabaseClient.select.mockResolvedValueOnce({
      data: mockBusinessData,
      error: null,
    });

    const { result } = renderHook(() => useTopStates());

    expect(result.current.loading).toBe(true);
    expect(result.current.states).toEqual([]);
    expect(result.current.error).toBe(null);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const expectedStates: StateData[] = [
      { state: "California", businessCount: 3 },
      { state: "Texas", businessCount: 2 },
      { state: "New York", businessCount: 1 },
      { state: "Florida", businessCount: 1 },
    ];

    expect(result.current.states).toEqual(expectedStates);
    expect(result.current.error).toBe(null);
  });

  test("respects custom limit parameter", async () => {
    mockSupabaseClient.select.mockResolvedValueOnce({
      data: mockBusinessData,
      error: null,
    });

    const { result } = renderHook(() => useTopStates(2));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.states).toHaveLength(2);
    expect(result.current.states[0]).toEqual({ state: "California", businessCount: 3 });
    expect(result.current.states[1]).toEqual({ state: "Texas", businessCount: 2 });
  });

  test("sorts states by business count in descending order", async () => {
    const unsortedData = [
      { us_state: "Wyoming", city: "Cheyenne" },
      { us_state: "California", city: "Los Angeles" },
      { us_state: "California", city: "San Francisco" },
      { us_state: "California", city: "San Diego" },
      { us_state: "California", city: "Sacramento" },
      { us_state: "Texas", city: "Houston" },
      { us_state: "Delaware", city: "Dover" },
      { us_state: "Delaware", city: "Wilmington" },
    ];

    mockSupabaseClient.select.mockResolvedValueOnce({
      data: unsortedData,
      error: null,
    });

    const { result } = renderHook(() => useTopStates());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.states[0]).toEqual({ state: "California", businessCount: 4 });
    expect(result.current.states[1]).toEqual({ state: "Delaware", businessCount: 2 });
    expect(result.current.states[2]).toEqual({ state: "Texas", businessCount: 1 });
    expect(result.current.states[3]).toEqual({ state: "Wyoming", businessCount: 1 });
  });

  test("handles empty business data", async () => {
    mockSupabaseClient.select.mockResolvedValueOnce({
      data: [],
      error: null,
    });

    const { result } = renderHook(() => useTopStates());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.states).toEqual([]);
    expect(result.current.error).toBe(null);
  });

  test("handles null business data", async () => {
    mockSupabaseClient.select.mockResolvedValueOnce({
      data: null,
      error: null,
    });

    const { result } = renderHook(() => useTopStates());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.states).toEqual([]);
  });

  test("filters out businesses with null or empty states", async () => {
    const dataWithInvalidStates = [
      { us_state: "California", city: "Los Angeles" },
      { us_state: null, city: "San Francisco" },
      { us_state: "", city: "Houston" },
      { us_state: "Texas", city: "Austin" },
      { us_state: undefined, city: "Miami" },
    ];

    mockSupabaseClient.select.mockResolvedValueOnce({
      data: dataWithInvalidStates,
      error: null,
    });

    const { result } = renderHook(() => useTopStates());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const expectedStates: StateData[] = [
      { state: "California", businessCount: 1 },
      { state: "Texas", businessCount: 1 },
    ];

    expect(result.current.states).toEqual(expectedStates);
  });

  test("handles database fetch error", async () => {
    const errorMessage = "Database connection failed";
    mockSupabaseClient.select.mockResolvedValueOnce({
      data: null,
      error: { message: errorMessage },
    });

    const { result } = renderHook(() => useTopStates());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.states).toEqual([]);
    expect(result.current.error).toBe(`Failed to fetch state businesses: ${errorMessage}`);
  });

  test("handles network errors gracefully", async () => {
    mockSupabaseClient.select.mockRejectedValueOnce(new Error("Network error"));

    const { result } = renderHook(() => useTopStates());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.states).toEqual([]);
    expect(result.current.error).toBe("Network error");
  });

  test("handles non-Error exceptions", async () => {
    mockSupabaseClient.select.mockRejectedValueOnce("String error");

    const { result } = renderHook(() => useTopStates());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.states).toEqual([]);
    expect(result.current.error).toBe("Failed to fetch top states");
  });

  test("applies correct database filters", async () => {
    mockSupabaseClient.select.mockResolvedValueOnce({
      data: mockBusinessData,
      error: null,
    });

    renderHook(() => useTopStates());

    await waitFor(() => {
      expect(mockSupabaseClient.from).toHaveBeenCalledWith("production_businesses");
      expect(mockSupabaseClient.select).toHaveBeenCalledWith("us_state");
      expect(mockSupabaseClient.not).toHaveBeenCalledWith("us_state", "is", null);
      expect(mockSupabaseClient.eq).toHaveBeenCalledWith("us_state", "");
    });
  });

  test("refetch function works correctly", async () => {
    // Mock initial fetch
    mockSupabaseClient.select.mockResolvedValueOnce({
      data: mockBusinessData,
      error: null,
    });

    const { result } = renderHook(() => useTopStates());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.states).toHaveLength(4);

    // Mock refetch with different data
    const newBusinessData = [
      ...mockBusinessData,
      { us_state: "California", city: "Oakland" },
      { us_state: "Nevada", city: "Las Vegas" },
    ];
    mockSupabaseClient.select.mockResolvedValueOnce({
      data: newBusinessData,
      error: null,
    });

    await waitFor(() => {
      result.current.refetch();
    });

    await waitFor(() => {
      expect(result.current.states[0]).toEqual({ state: "California", businessCount: 4 });
      expect(result.current.states).toHaveLength(5); // Added Nevada
    });
  });

  test("maintains referential stability for refetch function", () => {
    mockSupabaseClient.select.mockResolvedValueOnce({
      data: mockBusinessData,
      error: null,
    });

    const { result, rerender } = renderHook(() => useTopStates());

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
      ({ limit }) => useTopStates(limit),
      { initialProps: { limit: 2 } }
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.states).toHaveLength(2);

    // Change limit
    rerender({ limit: 3 });

    await waitFor(() => {
      expect(result.current.states).toHaveLength(3);
    });
  });

  test("handles duplicate state names correctly", async () => {
    const dataWithDuplicates = [
      { us_state: "California", city: "Los Angeles" },
      { us_state: "California", city: "San Francisco" },
      { us_state: "california", city: "San Diego" }, // Different case
      { us_state: "California", city: "Sacramento" },
    ];

    mockSupabaseClient.select.mockResolvedValueOnce({
      data: dataWithDuplicates,
      error: null,
    });

    const { result } = renderHook(() => useTopStates());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Should treat different cases as different states
    expect(result.current.states).toHaveLength(2);
    expect(result.current.states[0]).toEqual({ state: "California", businessCount: 3 });
    expect(result.current.states[1]).toEqual({ state: "california", businessCount: 1 });
  });

  test("handles zero limit edge case", async () => {
    mockSupabaseClient.select.mockResolvedValueOnce({
      data: mockBusinessData,
      error: null,
    });

    const { result } = renderHook(() => useTopStates(0));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.states).toEqual([]);
  });

  test("handles negative limit edge case", async () => {
    mockSupabaseClient.select.mockResolvedValueOnce({
      data: mockBusinessData,
      error: null,
    });

    const { result } = renderHook(() => useTopStates(-1));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.states).toEqual([]);
  });
});

// Property-based testing for aggregation logic
describe("useTopStates aggregation properties", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(supabaseClient.getSupabaseClient).mockReturnValue(mockSupabaseClient as any);
  });

  test("aggregation is commutative - order of input doesn't affect result", () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            us_state: fc.string().filter(s => s.length > 0),
            city: fc.string(),
          }),
          { minLength: 1, maxLength: 20 }
        ),
        async (businessData) => {
          // Test with original order
          mockSupabaseClient.select.mockResolvedValueOnce({
            data: businessData,
            error: null,
          });

          const { result: result1 } = renderHook(() => useTopStates(10));
          await waitFor(() => expect(result1.current.loading).toBe(false));

          // Test with shuffled order
          const shuffledData = [...businessData].reverse();
          mockSupabaseClient.select.mockResolvedValueOnce({
            data: shuffledData,
            error: null,
          });

          const { result: result2 } = renderHook(() => useTopStates(10));
          await waitFor(() => expect(result2.current.loading).toBe(false));

          // Results should be identical
          expect(result1.current.states).toEqual(result2.current.states);
        }
      ),
      { numRuns: 10 }
    );
  });

  test("total business count equals sum of individual state counts", () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            us_state: fc.string().filter(s => s.length > 0),
            city: fc.string(),
          }),
          { minLength: 1, maxLength: 20 }
        ),
        async (businessData) => {
          mockSupabaseClient.select.mockResolvedValueOnce({
            data: businessData,
            error: null,
          });

          const { result } = renderHook(() => useTopStates(100));
          await waitFor(() => expect(result.current.loading).toBe(false));

          const totalFromAggregation = result.current.states.reduce(
            (sum, state) => sum + state.businessCount,
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
            us_state: fc.string().filter(s => s.length > 0),
            city: fc.string(),
          }),
          { minLength: 2, maxLength: 20 }
        ),
        async (businessData) => {
          mockSupabaseClient.select.mockResolvedValueOnce({
            data: businessData,
            error: null,
          });

          const { result } = renderHook(() => useTopStates(100));
          await waitFor(() => expect(result.current.loading).toBe(false));

          const states = result.current.states;
          for (let i = 1; i < states.length; i++) {
            expect(states[i - 1].businessCount).toBeGreaterThanOrEqual(states[i].businessCount);
          }
        }
      ),
      { numRuns: 10 }
    );
  });
});