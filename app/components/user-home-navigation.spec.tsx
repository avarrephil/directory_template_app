import { render, screen } from "@testing-library/react";
import { describe, test, expect, vi } from "vitest";
import Sidebar from "./sidebar";

// Mock auth context for user role
vi.mock("@/lib/auth-context", () => ({
  useAuth: () => ({
    profile: {
      first_name: "Jane",
      last_name: "Doe",
      role: "user",
    },
    signOut: vi.fn(),
  }),
}));

// Mock Next.js components
vi.mock("next/link", () => ({
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/user-dashboard",
}));

describe("User Home Navigation Link", () => {
  test("user role sees Home navigation link pointing to user dashboard", () => {
    render(<Sidebar />);

    // Should show Home link for user role
    const homeLink = screen.getByText("Home");
    expect(homeLink).toBeInTheDocument();
    expect(homeLink.closest("a")).toHaveAttribute("href", "/user-dashboard");
  });

  test("user navigation includes Home with house icon", () => {
    render(<Sidebar />);

    // Home link should have the house icon
    const homeIcon = screen.getByText("🏠");
    expect(homeIcon).toBeInTheDocument();

    // Icon should be in the same link as Home text
    const homeLink = screen.getByText("Home").closest("a");
    expect(homeLink).toContainElement(homeIcon);
  });

  test("user role does not see admin-specific Upload navigation", () => {
    render(<Sidebar />);

    // Should NOT show Upload link for user role
    expect(screen.queryByText("Upload")).not.toBeInTheDocument();
    expect(screen.queryByText("📤")).not.toBeInTheDocument();
  });

  test("user role still has access to Settings navigation", () => {
    render(<Sidebar />);

    // Should show Settings link for user role
    const settingsLink = screen.getByText("Settings");
    expect(settingsLink).toBeInTheDocument();
    expect(settingsLink.closest("a")).toHaveAttribute("href", "/settings");

    // Settings should have gear icon
    const settingsIcon = screen.getByText("⚙️");
    expect(settingsIcon).toBeInTheDocument();
  });

  test("user navigation shows correct role-specific items", () => {
    render(<Sidebar />);

    // User should see Home and Settings, but not Upload
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Settings")).toBeInTheDocument();
    expect(screen.queryByText("Upload")).not.toBeInTheDocument();
  });

  test("Home link is correctly configured for user dashboard navigation", () => {
    render(<Sidebar />);

    // Home link should be present and correctly configured
    const homeLink = screen.getByText("Home").closest("a");
    expect(homeLink).toHaveAttribute("href", "/user-dashboard");

    // Verify the link is rendered and functional
    expect(homeLink).toBeInTheDocument();
    expect(screen.getByText("Home")).toBeInTheDocument();
  });

  test("user dashboard is displayed as the user dashboard type", () => {
    render(<Sidebar />);

    // Should show "User Dashboard" subtitle
    expect(screen.getByText("User Dashboard")).toBeInTheDocument();
    expect(screen.queryByText("Admin Dashboard")).not.toBeInTheDocument();
  });

  test("user profile information is displayed in sidebar", () => {
    render(<Sidebar />);

    // Should show user's name and role
    expect(screen.getByText("Jane Doe")).toBeInTheDocument();
    expect(screen.getByText("user")).toBeInTheDocument();
  });

  test("sidebar maintains consistent structure for user role", () => {
    render(<Sidebar />);

    // Main title should be present
    expect(screen.getByText("Business Directory")).toBeInTheDocument();

    // Logout functionality should be available
    expect(screen.getByText("🚪 Logout")).toBeInTheDocument();

    // Version info should be shown
    expect(screen.getByText("Version 1.0.0")).toBeInTheDocument();
  });
});
