import { render, screen } from "@testing-library/react";
import { describe, test, expect, vi, beforeEach } from "vitest";

// Mock Next.js navigation hooks
vi.mock("next/navigation", () => ({
  usePathname: () => "/upload",
}));

// Mock Next.js Link component
vi.mock("next/link", () => ({
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));

// Test Admin Navigation
describe("Admin Role Navigation", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Mock admin profile
    vi.doMock("@/lib/auth-context", () => ({
      useAuth: () => ({
        profile: {
          first_name: "Admin",
          last_name: "User",
          role: "admin",
        },
        signOut: vi.fn(),
      }),
    }));
  });

  test("admin sees Upload and Settings navigation items", async () => {
    const { default: Sidebar } = await import("./sidebar");
    render(<Sidebar />);

    // Admin should see Upload navigation
    expect(screen.getByText("Upload")).toBeInTheDocument();

    // Admin should see Settings navigation
    expect(screen.getByText("Settings")).toBeInTheDocument();

    // Check navigation links point to correct routes
    const uploadLink = screen.getByText("Upload").closest("a");
    expect(uploadLink).toHaveAttribute("href", "/upload");

    const settingsLink = screen.getByText("Settings").closest("a");
    expect(settingsLink).toHaveAttribute("href", "/settings");
  });

  test("admin sees correct dashboard title", async () => {
    const { default: Sidebar } = await import("./sidebar");
    render(<Sidebar />);

    expect(screen.getByText("Business Directory")).toBeInTheDocument();
    expect(screen.getByText("Admin Dashboard")).toBeInTheDocument();
  });

  test("admin profile information is displayed", async () => {
    const { default: Sidebar } = await import("./sidebar");
    render(<Sidebar />);

    expect(screen.getByText("Admin User")).toBeInTheDocument();
    expect(screen.getByText("admin")).toBeInTheDocument();
  });
});

describe("User Role Navigation", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Reset and mock user profile
    vi.doMock("@/lib/auth-context", () => ({
      useAuth: () => ({
        profile: {
          first_name: "John",
          last_name: "Doe",
          role: "user",
        },
        signOut: vi.fn(),
      }),
    }));

    vi.doMock("next/navigation", () => ({
      usePathname: () => "/user-dashboard",
    }));
  });

  test("user sees Home and Settings navigation items", async () => {
    // Import with fresh mock
    const module = await import("./sidebar");
    const Sidebar = module.default;

    render(<Sidebar />);

    // User should see Home navigation
    expect(screen.getByText("Home")).toBeInTheDocument();

    // User should see Settings navigation
    expect(screen.getByText("Settings")).toBeInTheDocument();

    // Check navigation links point to correct routes
    const homeLink = screen.getByText("Home").closest("a");
    expect(homeLink).toHaveAttribute("href", "/user-dashboard");

    const settingsLink = screen.getByText("Settings").closest("a");
    expect(settingsLink).toHaveAttribute("href", "/settings");
  });

  test("user sees correct dashboard title", async () => {
    const module = await import("./sidebar");
    const Sidebar = module.default;

    render(<Sidebar />);

    expect(screen.getByText("Business Directory")).toBeInTheDocument();
    expect(screen.getByText("User Dashboard")).toBeInTheDocument();
  });

  test("user does NOT see Upload navigation", async () => {
    const module = await import("./sidebar");
    const Sidebar = module.default;

    render(<Sidebar />);

    // User should NOT see Upload navigation
    expect(screen.queryByText("Upload")).not.toBeInTheDocument();
  });

  test("user profile information is displayed", async () => {
    const module = await import("./sidebar");
    const Sidebar = module.default;

    render(<Sidebar />);

    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("user")).toBeInTheDocument();
  });
});
