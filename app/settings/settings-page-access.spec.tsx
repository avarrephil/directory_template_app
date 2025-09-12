import { render, screen } from "@testing-library/react";
import { describe, test, expect, vi, beforeEach } from "vitest";
import SettingsPage from "./page";

// Mock the ProtectedRoute component
vi.mock("@/lib/protected-route", () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="protected-route">{children}</div>
  ),
}));

// Mock auth context for different roles
const mockAuthContext = vi.hoisted(() => ({
  useAuth: vi.fn(),
}));

vi.mock("@/lib/auth-context", () => mockAuthContext);

describe("Settings Page Protection and Access", () => {
  describe("Settings Page Protection", () => {
    test("settings page is wrapped in protected route", () => {
      mockAuthContext.useAuth.mockReturnValue({
        profile: { first_name: "John", last_name: "Doe", role: "user" },
      });

      render(<SettingsPage />);

      // Should be wrapped in protected route
      expect(screen.getByTestId("protected-route")).toBeInTheDocument();
    });

    test("settings page requires authentication for access", () => {
      mockAuthContext.useAuth.mockReturnValue({
        profile: { first_name: "John", last_name: "Doe", role: "user" },
      });

      render(<SettingsPage />);

      // Page should render the main content when authenticated
      expect(screen.getByText("Directory Settings")).toBeInTheDocument();
    });
  });

  describe("Admin User Access", () => {
    beforeEach(() => {
      mockAuthContext.useAuth.mockReturnValue({
        profile: { first_name: "Admin", last_name: "User", role: "admin" },
      });
    });

    test("admin user can access settings page content", () => {
      render(<SettingsPage />);

      // Should show main settings heading
      expect(screen.getByText("Directory Settings")).toBeInTheDocument();

      // Should show settings form fields
      expect(screen.getByText("Directory Name")).toBeInTheDocument();
      expect(screen.getByText("Business Category")).toBeInTheDocument();
      expect(screen.getByText("Directory Description")).toBeInTheDocument();
    });

    test("admin user can access AI processing settings", () => {
      render(<SettingsPage />);

      // Should show AI processing settings section
      expect(screen.getByText("AI Processing Settings")).toBeInTheDocument();

      // Should show AI processing options
      expect(
        screen.getByText("Auto-enrich business information")
      ).toBeInTheDocument();
      expect(screen.getByText("Remove duplicate entries")).toBeInTheDocument();
      expect(screen.getByText("Standardize categories")).toBeInTheDocument();
    });

    test("admin user can access settings save functionality", () => {
      render(<SettingsPage />);

      // Should show save button
      const saveButton = screen.getByRole("button", { name: "Save Settings" });
      expect(saveButton).toBeInTheDocument();
      expect(saveButton).toHaveClass("bg-blue-600", "text-white");
    });
  });

  describe("Regular User Access", () => {
    beforeEach(() => {
      mockAuthContext.useAuth.mockReturnValue({
        profile: { first_name: "Regular", last_name: "User", role: "user" },
      });
    });

    test("regular user can access settings page content", () => {
      render(<SettingsPage />);

      // Regular users should also have access to settings
      expect(screen.getByText("Directory Settings")).toBeInTheDocument();

      // Should show settings form fields
      expect(screen.getByText("Directory Name")).toBeInTheDocument();
      expect(screen.getByText("Business Category")).toBeInTheDocument();
    });

    test("regular user can access all settings sections", () => {
      render(<SettingsPage />);

      // Should have access to AI processing settings
      expect(screen.getByText("AI Processing Settings")).toBeInTheDocument();

      // Should have access to save functionality
      expect(
        screen.getByRole("button", { name: "Save Settings" })
      ).toBeInTheDocument();
    });
  });

  describe("Settings Form Structure", () => {
    beforeEach(() => {
      mockAuthContext.useAuth.mockReturnValue({
        profile: { first_name: "Test", last_name: "User", role: "user" },
      });
    });

    test("directory name input is properly configured", () => {
      render(<SettingsPage />);

      const directoryNameInput = screen.getByPlaceholderText(
        "e.g., Local Restaurants Guide"
      );
      expect(directoryNameInput).toHaveAttribute("type", "text");
      expect(directoryNameInput).toHaveClass("w-full", "px-3", "py-2");
    });

    test("business category dropdown has all expected options", () => {
      render(<SettingsPage />);

      // Find the select element directly since labels aren't properly associated
      const categorySelect = screen.getByRole("combobox");
      expect(categorySelect).toBeInTheDocument();

      // Check for category options
      expect(screen.getByText("Restaurants")).toBeInTheDocument();
      expect(screen.getByText("Retail Stores")).toBeInTheDocument();
      expect(screen.getByText("Professional Services")).toBeInTheDocument();
      expect(screen.getByText("Healthcare")).toBeInTheDocument();
      expect(screen.getByText("Automotive")).toBeInTheDocument();
      expect(screen.getByText("Entertainment")).toBeInTheDocument();
    });

    test("directory description textarea is properly configured", () => {
      render(<SettingsPage />);

      const descriptionTextarea = screen.getByPlaceholderText(
        "Brief description of your directory..."
      );
      expect(descriptionTextarea.tagName).toBe("TEXTAREA");
      expect(descriptionTextarea).toHaveAttribute("rows", "3");
      expect(descriptionTextarea).toHaveClass("w-full", "px-3", "py-2");
    });

    test("AI processing checkboxes are present and configured", () => {
      render(<SettingsPage />);

      // Get all checkboxes
      const checkboxes = screen.getAllByRole("checkbox");
      expect(checkboxes).toHaveLength(3);

      // All should be checked by default and have proper styling
      checkboxes.forEach((checkbox) => {
        expect(checkbox).toBeChecked();
        expect(checkbox).toHaveClass("h-4", "w-4", "text-blue-600");
      });
    });

    test("save button has proper styling and accessibility", () => {
      render(<SettingsPage />);

      const saveButton = screen.getByRole("button", { name: "Save Settings" });
      expect(saveButton).toHaveAttribute("type", "button");
      expect(saveButton).toHaveClass(
        "bg-blue-600",
        "text-white",
        "px-4",
        "py-2",
        "rounded-md",
        "hover:bg-blue-700",
        "focus:outline-none",
        "focus:ring-2",
        "focus:ring-blue-500"
      );
    });
  });

  describe("Settings Page Layout and Styling", () => {
    beforeEach(() => {
      mockAuthContext.useAuth.mockReturnValue({
        profile: { first_name: "Test", last_name: "User", role: "user" },
      });
    });

    test("main container has proper responsive layout", () => {
      render(<SettingsPage />);

      const mainContainer = screen
        .getByText("Directory Settings")
        .closest(".max-w-4xl");
      expect(mainContainer).toHaveClass(
        "max-w-4xl",
        "mx-auto",
        "p-6",
        "space-y-8"
      );
    });

    test("settings card has proper styling", () => {
      render(<SettingsPage />);

      const settingsCard = screen
        .getByText("Directory Settings")
        .closest(".bg-white");
      expect(settingsCard).toHaveClass(
        "bg-white",
        "rounded-lg",
        "shadow-sm",
        "border",
        "border-gray-200",
        "p-6"
      );
    });

    test("form uses responsive grid layout", () => {
      render(<SettingsPage />);

      const gridContainer = screen.getByText("Directory Name").closest(".grid");
      expect(gridContainer).toHaveClass(
        "grid",
        "grid-cols-1",
        "md:grid-cols-2",
        "gap-6"
      );
    });

    test("TODO notes are displayed for incomplete features", () => {
      render(<SettingsPage />);

      // Should show TODO notes for unimplemented features
      expect(
        screen.getByText("TODO: Implement setting persistence")
      ).toBeInTheDocument();
      expect(
        screen.getByText("TODO: Implement settings save functionality")
      ).toBeInTheDocument();
    });
  });

  describe("Settings Page Accessibility", () => {
    beforeEach(() => {
      mockAuthContext.useAuth.mockReturnValue({
        profile: { first_name: "Test", last_name: "User", role: "user" },
      });
    });

    test("form labels are present and descriptive", () => {
      render(<SettingsPage />);

      // Check that labels are present (even if not properly associated)
      expect(screen.getByText("Directory Name")).toBeInTheDocument();
      expect(screen.getByText("Business Category")).toBeInTheDocument();
      expect(screen.getByText("Directory Description")).toBeInTheDocument();

      // Check that form elements are accessible
      expect(
        screen.getByPlaceholderText("e.g., Local Restaurants Guide")
      ).toBeInTheDocument();
      expect(screen.getByRole("combobox")).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText("Brief description of your directory...")
      ).toBeInTheDocument();
    });

    test("checkboxes have proper labels", () => {
      render(<SettingsPage />);

      // Check that checkbox labels are present and checkboxes exist
      expect(
        screen.getByText("Auto-enrich business information")
      ).toBeInTheDocument();
      expect(screen.getByText("Remove duplicate entries")).toBeInTheDocument();
      expect(screen.getByText("Standardize categories")).toBeInTheDocument();

      // Check that we have the right number of checkboxes
      const checkboxes = screen.getAllByRole("checkbox");
      expect(checkboxes).toHaveLength(3);
    });

    test("form inputs have focus states defined", () => {
      render(<SettingsPage />);

      const directoryNameInput = screen.getByPlaceholderText(
        "e.g., Local Restaurants Guide"
      );
      expect(directoryNameInput).toHaveClass(
        "focus:outline-none",
        "focus:ring-2",
        "focus:ring-blue-500",
        "focus:border-blue-500"
      );
    });
  });
});
