import { describe, expect, test, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useSiteSettings } from "./useSiteSettings";
import * as supabaseClient from "@/lib/supabase-client";
import type { SiteSettings } from "@/app/types/homepage";

// Mock the supabase client
vi.mock("@/lib/supabase-client", () => ({
  getSupabaseClient: vi.fn(),
}));

// Mock branded type utility
vi.mock("@/lib/types", () => ({
  brand: vi.fn((value: string) => value),
}));

const mockSupabaseClient = {
  from: vi.fn(() => mockSupabaseClient),
  select: vi.fn(() => mockSupabaseClient),
  eq: vi.fn(() => mockSupabaseClient),
  single: vi.fn(),
  update: vi.fn(() => mockSupabaseClient),
};

const mockSiteSettingsData = {
  id: "00000000-0000-0000-0000-000000000001",
  directory_name: "Test Directory",
  logo_url: "https://example.com/logo.png",
  primary_color: "#2563eb",
  secondary_color: "#1e40af",
  hero_title: "Test Hero Title",
  hero_subtitle: "Test Hero Subtitle",
  hero_description: "Test Hero Description",
  browse_all_cta: "Browse All Businesses",
  view_top_cta: "View Top Businesses",
  bystate_title: "Browse by State",
  bystate_description: "Find businesses in your state",
  show_bystate_section: true,
  bycities_title: "Top Cities",
  bycities_description: "Explore businesses in popular cities",
  show_bycities_section: true,
  updated_at: "2024-01-15T10:30:00Z",
};

describe("useSiteSettings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(supabaseClient.getSupabaseClient).mockReturnValue(
      mockSupabaseClient as any
    );
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  test("fetches settings successfully on mount", async () => {
    mockSupabaseClient.single.mockResolvedValueOnce({
      data: mockSiteSettingsData,
      error: null,
    });

    const { result } = renderHook(() => useSiteSettings());

    expect(result.current.loading).toBe(true);
    expect(result.current.settings).toBe(null);
    expect(result.current.error).toBe(null);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.settings).toEqual(
      expect.objectContaining({
        directory_name: "Test Directory",
        logo_url: "https://example.com/logo.png",
        primary_color: "#2563eb",
        hero_title: "Test Hero Title",
      })
    );
    expect(result.current.error).toBe(null);
  });

  test("handles fetch error correctly", async () => {
    const errorMessage = "Database connection failed";
    mockSupabaseClient.single.mockResolvedValueOnce({
      data: null,
      error: { message: errorMessage },
    });

    const { result } = renderHook(() => useSiteSettings());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.settings).toBe(null);
    expect(result.current.error).toBe(errorMessage);
  });

  test("handles missing logo_url by setting undefined", async () => {
    const dataWithoutLogo = { ...mockSiteSettingsData, logo_url: null };
    mockSupabaseClient.single.mockResolvedValueOnce({
      data: dataWithoutLogo,
      error: null,
    });

    const { result } = renderHook(() => useSiteSettings());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.settings?.logo_url).toBeUndefined();
  });

  test("updates settings successfully", async () => {
    // Mock successful initial fetch
    mockSupabaseClient.single.mockResolvedValueOnce({
      data: mockSiteSettingsData,
      error: null,
    });

    // Mock successful update - the eq method needs to return the promise
    const mockEq = vi.fn().mockResolvedValueOnce({
      data: null,
      error: null,
    });
    mockSupabaseClient.update.mockReturnValueOnce({
      eq: mockEq,
    });

    // Mock successful refetch after update
    const updatedData = {
      ...mockSiteSettingsData,
      directory_name: "Updated Directory",
    };
    mockSupabaseClient.single.mockResolvedValueOnce({
      data: updatedData,
      error: null,
    });

    const { result } = renderHook(() => useSiteSettings());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const updates = { directory_name: "Updated Directory" };
    let updateResult: { success: boolean; error?: string } = { success: false };

    await act(async () => {
      updateResult = await result.current.updateSettings(updates);
    });

    expect(updateResult.success).toBe(true);
    expect(updateResult.error).toBeUndefined();
    expect(mockSupabaseClient.update).toHaveBeenCalledWith(
      expect.objectContaining({
        directory_name: "Updated Directory",
        updated_at: expect.any(String),
      })
    );
  });

  test("handles update error correctly", async () => {
    // Mock successful initial fetch
    mockSupabaseClient.single.mockResolvedValueOnce({
      data: mockSiteSettingsData,
      error: null,
    });

    // Mock failed update - the eq method needs to return the promise with error
    const updateErrorMessage = "Update failed";
    const mockEq = vi.fn().mockResolvedValueOnce({
      data: null,
      error: { message: updateErrorMessage },
    });
    mockSupabaseClient.update.mockReturnValueOnce({
      eq: mockEq,
    });

    const { result } = renderHook(() => useSiteSettings());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const updates = { directory_name: "Updated Directory" };
    let updateResult: { success: boolean; error?: string } = { success: true };

    await act(async () => {
      updateResult = await result.current.updateSettings(updates);
    });

    expect(updateResult.success).toBe(false);
    expect(updateResult.error).toBe(updateErrorMessage);
    expect(result.current.error).toBe(updateErrorMessage);
  });

  test("refetch function works correctly", async () => {
    // Mock initial fetch
    mockSupabaseClient.single.mockResolvedValueOnce({
      data: mockSiteSettingsData,
      error: null,
    });

    const { result } = renderHook(() => useSiteSettings());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Mock refetch
    const refetchedData = {
      ...mockSiteSettingsData,
      directory_name: "Refetched Directory",
    };
    mockSupabaseClient.single.mockResolvedValueOnce({
      data: refetchedData,
      error: null,
    });

    await act(async () => {
      await result.current.refetch();
    });

    await waitFor(() => {
      expect(result.current.settings?.directory_name).toBe(
        "Refetched Directory"
      );
    });
  });

  test("queries correct settings ID", async () => {
    mockSupabaseClient.single.mockResolvedValueOnce({
      data: mockSiteSettingsData,
      error: null,
    });

    renderHook(() => useSiteSettings());

    await waitFor(() => {
      expect(mockSupabaseClient.eq).toHaveBeenCalledWith(
        "id",
        "00000000-0000-0000-0000-000000000001"
      );
    });
  });

  test("maps database fields to SiteSettings interface correctly", async () => {
    mockSupabaseClient.single.mockResolvedValueOnce({
      data: mockSiteSettingsData,
      error: null,
    });

    const { result } = renderHook(() => useSiteSettings());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const settings = result.current.settings as SiteSettings;
    expect(settings.directory_name).toBe(mockSiteSettingsData.directory_name);
    expect(settings.primary_color).toBe(mockSiteSettingsData.primary_color);
    expect(settings.hero_title).toBe(mockSiteSettingsData.hero_title);
    expect(settings.show_bystate_section).toBe(
      mockSiteSettingsData.show_bystate_section
    );
    expect(settings.updated_at).toBe(mockSiteSettingsData.updated_at);
  });

  test("handles network errors gracefully", async () => {
    mockSupabaseClient.single.mockRejectedValueOnce(new Error("Network error"));

    const { result } = renderHook(() => useSiteSettings());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.settings).toBe(null);
    expect(result.current.error).toBe("Network error");
  });

  test("handles non-Error exceptions", async () => {
    mockSupabaseClient.single.mockRejectedValueOnce("String error");

    const { result } = renderHook(() => useSiteSettings());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.settings).toBe(null);
    expect(result.current.error).toBe("Failed to fetch settings");
  });
});
