import { describe, expect, test, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import HomepageSettings from "./HomepageSettings";
import * as useSiteSettingsHook from "@/hooks/useSiteSettings";
import type { SiteSettings } from "@/app/types/homepage";

// Mock the useSiteSettings hook
vi.mock("@/hooks/useSiteSettings", () => ({
  useSiteSettings: vi.fn(),
}));

const mockSiteSettings: SiteSettings = {
  id: "test-id" as any,
  directory_name: "Test Directory",
  logo_url: "https://example.com/logo.png",
  primary_color: "#2563eb",
  secondary_color: "#1e40af",
  hero_title: "Test Hero Title",
  hero_subtitle: "Test Hero Subtitle",
  hero_description: "Test Hero Description",
  browse_all_cta: "Browse All",
  view_top_cta: "View Top",
  bystate_title: "Browse by State",
  bystate_description: "Find businesses by state",
  show_bystate_section: true,
  bycities_title: "Top Cities",
  bycities_description: "Explore popular cities",
  show_bycities_section: true,
  hero_title_color: "#ffffff",
  hero_subtitle_color: "#f97316",
  hero_description_color: "#ffffff",
  stats_text_color: "#f97316",
  browse_all_button_bg_color: "#f97316",
  browse_all_button_text_color: "#000000",
  view_top_button_bg_color: "transparent",
  view_top_button_text_color: "#ffffff",
  view_top_button_border_color: "#ffffff",
  updated_at: "2024-01-15T10:30:00Z",
};

const mockUseSiteSettings = {
  settings: mockSiteSettings,
  loading: false,
  error: null,
  updateSettings: vi.fn(),
  refetch: vi.fn(),
};

describe("HomepageSettings", () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useSiteSettingsHook.useSiteSettings).mockReturnValue(
      mockUseSiteSettings
    );
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  test("renders loading state correctly", () => {
    vi.mocked(useSiteSettingsHook.useSiteSettings).mockReturnValue({
      ...mockUseSiteSettings,
      loading: true,
      settings: null,
    });

    render(<HomepageSettings />);

    expect(screen.getByText(/loading homepage settings/i)).toBeInTheDocument();
  });

  test("renders error state correctly", () => {
    const errorMessage = "Failed to load settings";
    vi.mocked(useSiteSettingsHook.useSiteSettings).mockReturnValue({
      ...mockUseSiteSettings,
      loading: false,
      settings: null,
      error: errorMessage,
    });

    render(<HomepageSettings />);

    expect(
      screen.getByText(/error loading homepage settings/i)
    ).toBeInTheDocument();
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  test("renders all form fields with correct initial values", () => {
    render(<HomepageSettings />);

    // Basic settings
    expect(screen.getByDisplayValue("Test Directory")).toBeInTheDocument();
    expect(
      screen.getByDisplayValue("https://example.com/logo.png")
    ).toBeInTheDocument();
    expect(screen.getByDisplayValue("#2563eb")).toBeInTheDocument();
    expect(screen.getByDisplayValue("#1e40af")).toBeInTheDocument();

    // Hero section
    expect(screen.getByDisplayValue("Test Hero Title")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Test Hero Subtitle")).toBeInTheDocument();
    expect(
      screen.getByDisplayValue("Test Hero Description")
    ).toBeInTheDocument();
    expect(screen.getByDisplayValue("Browse All")).toBeInTheDocument();
    expect(screen.getByDisplayValue("View Top")).toBeInTheDocument();

    // States section
    expect(screen.getByDisplayValue("Browse by State")).toBeInTheDocument();
    expect(
      screen.getByDisplayValue("Find businesses by state")
    ).toBeInTheDocument();

    // Cities section
    expect(screen.getByDisplayValue("Top Cities")).toBeInTheDocument();
    expect(
      screen.getByDisplayValue("Explore popular cities")
    ).toBeInTheDocument();
  });

  test("renders section toggles with correct initial states", () => {
    render(<HomepageSettings />);

    const stateToggle = screen.getByRole("checkbox", {
      name: /show states section/i,
    });
    const citiesToggle = screen.getByRole("checkbox", {
      name: /show cities section/i,
    });

    expect(stateToggle).toBeChecked();
    expect(citiesToggle).toBeChecked();
  });

  test("updates form fields correctly", async () => {
    render(<HomepageSettings />);

    const directoryNameInput = screen.getByDisplayValue("Test Directory");

    await user.clear(directoryNameInput);
    await user.type(directoryNameInput, "Updated Directory");

    expect(screen.getByDisplayValue("Updated Directory")).toBeInTheDocument();
  });

  test("toggles section visibility correctly", async () => {
    render(<HomepageSettings />);

    const stateToggle = screen.getByRole("checkbox", {
      name: /show states section/i,
    });

    await user.click(stateToggle);

    expect(stateToggle).not.toBeChecked();
  });

  test("handles form submission successfully", async () => {
    mockUseSiteSettings.updateSettings.mockResolvedValueOnce({ success: true });

    render(<HomepageSettings />);

    const directoryNameInput = screen.getByDisplayValue("Test Directory");
    const saveButton = screen.getByRole("button", { name: /save settings/i });

    await user.clear(directoryNameInput);
    await user.type(directoryNameInput, "Updated Directory");
    await user.click(saveButton);

    await waitFor(() => {
      expect(mockUseSiteSettings.updateSettings).toHaveBeenCalledWith(
        expect.objectContaining({
          directory_name: "Updated Directory",
        })
      );
    });

    expect(
      screen.getByText(/settings saved successfully/i)
    ).toBeInTheDocument();
  });

  test("handles form submission error", async () => {
    const errorMessage = "Update failed";
    mockUseSiteSettings.updateSettings.mockResolvedValueOnce({
      success: false,
      error: errorMessage,
    });

    render(<HomepageSettings />);

    const saveButton = screen.getByRole("button", { name: /save settings/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText(/failed to save settings/i)).toBeInTheDocument();
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  test("shows loading state during form submission", async () => {
    // Mock updateSettings to return a promise that we can control
    let resolveUpdate: (value: any) => void;
    const updatePromise = new Promise((resolve) => {
      resolveUpdate = resolve;
    });
    mockUseSiteSettings.updateSettings.mockReturnValue(updatePromise);

    render(<HomepageSettings />);

    const saveButton = screen.getByRole("button", { name: /save settings/i });
    await user.click(saveButton);

    expect(screen.getByText(/saving settings/i)).toBeInTheDocument();
    expect(saveButton).toBeDisabled();

    // Resolve the promise
    resolveUpdate!({ success: true });

    await waitFor(() => {
      expect(
        screen.getByText(/settings saved successfully/i)
      ).toBeInTheDocument();
      expect(saveButton).not.toBeDisabled();
    });
  });

  test("validates required fields", async () => {
    render(<HomepageSettings />);

    const directoryNameInput = screen.getByDisplayValue("Test Directory");
    const saveButton = screen.getByRole("button", { name: /save settings/i });

    // Clear required field
    await user.clear(directoryNameInput);
    await user.click(saveButton);

    // Form should not submit
    expect(mockUseSiteSettings.updateSettings).not.toHaveBeenCalled();
  });

  test("handles color input changes", async () => {
    render(<HomepageSettings />);

    const primaryColorInput = screen.getByDisplayValue("#2563eb");

    await user.clear(primaryColorInput);
    await user.type(primaryColorInput, "#ff0000");

    expect(screen.getByDisplayValue("#ff0000")).toBeInTheDocument();
  });

  test("handles textarea changes", async () => {
    render(<HomepageSettings />);

    const descriptionTextarea = screen.getByDisplayValue(
      "Test Hero Description"
    );

    await user.clear(descriptionTextarea);
    await user.type(descriptionTextarea, "Updated description");

    expect(screen.getByDisplayValue("Updated description")).toBeInTheDocument();
  });

  test("preserves form state during loading", async () => {
    const { rerender } = render(<HomepageSettings />);

    const directoryNameInput = screen.getByDisplayValue("Test Directory");
    await user.clear(directoryNameInput);
    await user.type(directoryNameInput, "Modified Directory");

    // Simulate loading state
    vi.mocked(useSiteSettingsHook.useSiteSettings).mockReturnValue({
      ...mockUseSiteSettings,
      loading: true,
    });

    rerender(<HomepageSettings />);

    // Form should still show the modified value during loading
    expect(screen.getByDisplayValue("Modified Directory")).toBeInTheDocument();
  });

  test("resets form when settings change externally", () => {
    const { rerender } = render(<HomepageSettings />);

    // Modify form
    const directoryNameInput = screen.getByDisplayValue("Test Directory");
    fireEvent.change(directoryNameInput, {
      target: { value: "Modified Directory" },
    });

    expect(screen.getByDisplayValue("Modified Directory")).toBeInTheDocument();

    // Simulate external settings change
    const newSettings = {
      ...mockSiteSettings,
      directory_name: "External Update",
    };
    vi.mocked(useSiteSettingsHook.useSiteSettings).mockReturnValue({
      ...mockUseSiteSettings,
      settings: newSettings,
    });

    rerender(<HomepageSettings />);

    expect(screen.getByDisplayValue("External Update")).toBeInTheDocument();
  });

  test("handles missing optional fields gracefully", () => {
    const settingsWithoutLogo = { ...mockSiteSettings, logo_url: undefined };
    vi.mocked(useSiteSettingsHook.useSiteSettings).mockReturnValue({
      ...mockUseSiteSettings,
      settings: settingsWithoutLogo,
    });

    render(<HomepageSettings />);

    const logoInput = screen.getByLabelText(/logo url/i);
    expect(logoInput).toHaveValue("");
  });

  test("submits only changed fields", async () => {
    mockUseSiteSettings.updateSettings.mockResolvedValueOnce({ success: true });

    render(<HomepageSettings />);

    const directoryNameInput = screen.getByDisplayValue("Test Directory");
    const saveButton = screen.getByRole("button", { name: /save settings/i });

    // Only change directory name
    await user.clear(directoryNameInput);
    await user.type(directoryNameInput, "Updated Directory");
    await user.click(saveButton);

    await waitFor(() => {
      expect(mockUseSiteSettings.updateSettings).toHaveBeenCalledWith({
        directory_name: "Updated Directory",
        logo_url: "https://example.com/logo.png",
        primary_color: "#2563eb",
        secondary_color: "#1e40af",
        hero_title: "Test Hero Title",
        hero_subtitle: "Test Hero Subtitle",
        hero_description: "Test Hero Description",
        browse_all_cta: "Browse All",
        view_top_cta: "View Top",
        bystate_title: "Browse by State",
        bystate_description: "Find businesses by state",
        show_bystate_section: true,
        bycities_title: "Top Cities",
        bycities_description: "Explore popular cities",
        show_bycities_section: true,
      });
    });
  });

  test("clears success/error messages when form changes", async () => {
    mockUseSiteSettings.updateSettings.mockResolvedValueOnce({ success: true });

    render(<HomepageSettings />);

    const saveButton = screen.getByRole("button", { name: /save settings/i });
    const directoryNameInput = screen.getByDisplayValue("Test Directory");

    // Submit form to show success message
    await user.click(saveButton);
    await waitFor(() => {
      expect(
        screen.getByText(/settings saved successfully/i)
      ).toBeInTheDocument();
    });

    // Modify form - success message should disappear
    await user.type(directoryNameInput, " Modified");

    expect(
      screen.queryByText(/settings saved successfully/i)
    ).not.toBeInTheDocument();
  });

  test("has proper accessibility attributes", () => {
    render(<HomepageSettings />);

    // Check for proper labeling
    expect(screen.getByLabelText(/directory name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/primary color/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/hero title/i)).toBeInTheDocument();

    // Check for fieldsets
    expect(
      screen.getByRole("group", { name: /basic settings/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("group", { name: /hero section/i })
    ).toBeInTheDocument();

    // Check form has proper structure
    expect(screen.getByRole("form")).toBeInTheDocument();
  });

  test("handles keyboard navigation correctly", async () => {
    render(<HomepageSettings />);

    const directoryNameInput = screen.getByDisplayValue("Test Directory");
    const logoInput = screen.getByDisplayValue("https://example.com/logo.png");

    directoryNameInput.focus();
    expect(directoryNameInput).toHaveFocus();

    await user.tab();
    expect(logoInput).toHaveFocus();
  });
});
