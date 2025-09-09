import { render, screen } from "@testing-library/react";
import { describe, test, expect, vi, beforeEach } from "vitest";
import Sidebar from "./sidebar";

// Mock admin profile
const mockAdminProfile = {
  first_name: "Admin",
  last_name: "User",
  role: "admin",
};

// Mock user profile
const mockUserProfile = {
  first_name: "John",
  last_name: "Doe",
  role: "user",
};

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

describe("Role-Based Navigation Visibility", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Admin Navigation", () => {
    beforeEach(() => {
      vi.doMock("@/lib/auth-context", () => ({
        useAuth: () => ({
          profile: mockAdminProfile,
          signOut: vi.fn(),
        }),
      }));
    });

    test("shows admin-specific navigation items", () => {
      vi.doMock("@/lib/auth-context", () => ({
        useAuth: () => ({
          profile: mockAdminProfile,
          signOut: vi.fn(),
        }),
      }));

      render(<Sidebar />);

      // Admin should see Upload navigation
      expect(screen.getByText("📤")).toBeInTheDocument(); // Upload icon
      expect(screen.getByText("Upload")).toBeInTheDocument();

      // Admin should see Settings navigation
      expect(screen.getByText("⚙️")).toBeInTheDocument(); // Settings icon
      expect(screen.getByText("Settings")).toBeInTheDocument();

      // Check navigation links point to correct routes
      const uploadLink = screen.getByText("Upload");
      expect(uploadLink.closest("a")).toHaveAttribute("href", "/upload");

      const settingsLink = screen.getByText("Settings");
      expect(settingsLink.closest("a")).toHaveAttribute("href", "/settings");
    });

    test("shows admin dashboard title and description", () => {
      vi.doMock("@/lib/auth-context", () => ({
        useAuth: () => ({
          profile: mockAdminProfile,
          signOut: vi.fn(),
        }),
      }));

      render(<Sidebar />);

      expect(screen.getByText("Business Directory")).toBeInTheDocument();
      expect(screen.getByText("Admin Dashboard")).toBeInTheDocument();
    });

    test("displays admin profile information correctly", () => {
      vi.doMock("@/lib/auth-context", () => ({
        useAuth: () => ({
          profile: mockAdminProfile,
          signOut: vi.fn(),
        }),
      }));

      render(<Sidebar />);

      expect(
        screen.getByText(
          `${mockAdminProfile.first_name} ${mockAdminProfile.last_name}`
        )
      ).toBeInTheDocument();
      expect(screen.getByText(mockAdminProfile.role)).toBeInTheDocument();
    });

    test("admin navigation items have correct styling when active", () => {
      vi.doMock("@/lib/auth-context", () => ({
        useAuth: () => ({
          profile: mockAdminProfile,
          signOut: vi.fn(),
        }),
      }));

      // Mock pathname to show Upload as current
      vi.doMock("next/navigation", () => ({
        usePathname: () => "/upload",
      }));

      render(<Sidebar />);

      const uploadLink = screen.getByText("Upload").closest("a");
      expect(uploadLink).toHaveClass(
        "bg-blue-100",
        "text-blue-700",
        "border-r-2",
        "border-blue-600"
      );
    });
  });

  describe("User Navigation", () => {
    beforeEach(() => {
      vi.doMock("@/lib/auth-context", () => ({
        useAuth: () => ({
          profile: mockUserProfile,
          signOut: vi.fn(),
        }),
      }));

      vi.doMock("next/navigation", () => ({
        usePathname: () => "/user-dashboard",
      }));
    });

    test("shows user-specific navigation items", () => {
      vi.doMock("@/lib/auth-context", () => ({
        useAuth: () => ({
          profile: mockUserProfile,
          signOut: vi.fn(),
        }),
      }));

      render(<Sidebar />);

      // User should see Home navigation
      expect(screen.getByText("🏠")).toBeInTheDocument(); // Home icon
      expect(screen.getByText("Home")).toBeInTheDocument();

      // User should see Settings navigation
      expect(screen.getByText("⚙️")).toBeInTheDocument(); // Settings icon
      expect(screen.getByText("Settings")).toBeInTheDocument();

      // Check navigation links point to correct routes
      const homeLink = screen.getByText("Home");
      expect(homeLink.closest("a")).toHaveAttribute("href", "/user-dashboard");

      const settingsLink = screen.getByText("Settings");
      expect(settingsLink.closest("a")).toHaveAttribute("href", "/settings");
    });

    test("does NOT show admin-specific navigation items for user", () => {
      vi.doMock("@/lib/auth-context", () => ({
        useAuth: () => ({
          profile: mockUserProfile,
          signOut: vi.fn(),
        }),
      }));

      render(<Sidebar />);

      // User should NOT see Upload navigation
      expect(screen.queryByText("Upload")).not.toBeInTheDocument();

      // Should not see upload icon in navigation (but may appear elsewhere)
      const uploadElements = screen.queryAllByText("📤");
      uploadElements.forEach((element) => {
        // None of these should be navigation links
        expect(element.closest("a")).not.toHaveAttribute("href", "/upload");
      });
    });

    test("shows user dashboard title and description", () => {
      vi.doMock("@/lib/auth-context", () => ({
        useAuth: () => ({
          profile: mockUserProfile,
          signOut: vi.fn(),
        }),
      }));

      render(<Sidebar />);

      expect(screen.getByText("Business Directory")).toBeInTheDocument();
      expect(screen.getByText("User Dashboard")).toBeInTheDocument();
    });

    test("displays user profile information correctly", () => {
      vi.doMock("@/lib/auth-context", () => ({
        useAuth: () => ({
          profile: mockUserProfile,
          signOut: vi.fn(),
        }),
      }));

      render(<Sidebar />);

      expect(
        screen.getByText(
          `${mockUserProfile.first_name} ${mockUserProfile.last_name}`
        )
      ).toBeInTheDocument();
      expect(screen.getByText(mockUserProfile.role)).toBeInTheDocument();
    });

    test("user navigation items have correct styling when active", () => {
      vi.doMock("@/lib/auth-context", () => ({
        useAuth: () => ({
          profile: mockUserProfile,
          signOut: vi.fn(),
        }),
      }));

      vi.doMock("next/navigation", () => ({
        usePathname: () => "/user-dashboard",
      }));

      render(<Sidebar />);

      const homeLink = screen.getByText("Home").closest("a");
      expect(homeLink).toHaveClass(
        "bg-blue-100",
        "text-blue-700",
        "border-r-2",
        "border-blue-600"
      );
    });
  });

  describe("Common Navigation Elements", () => {
    test("both roles see Settings navigation", () => {
      // Test admin
      vi.doMock("@/lib/auth-context", () => ({
        useAuth: () => ({
          profile: mockAdminProfile,
          signOut: vi.fn(),
        }),
      }));

      const { rerender } = render(<Sidebar />);
      expect(screen.getByText("Settings")).toBeInTheDocument();

      // Test user
      vi.doMock("@/lib/auth-context", () => ({
        useAuth: () => ({
          profile: mockUserProfile,
          signOut: vi.fn(),
        }),
      }));

      rerender(<Sidebar />);
      expect(screen.getByText("Settings")).toBeInTheDocument();
    });

    test("both roles see logout functionality", () => {
      // Test admin
      vi.doMock("@/lib/auth-context", () => ({
        useAuth: () => ({
          profile: mockAdminProfile,
          signOut: vi.fn(),
        }),
      }));

      const { rerender } = render(<Sidebar />);
      expect(screen.getByText("🚪 Logout")).toBeInTheDocument();

      // Test user
      vi.doMock("@/lib/auth-context", () => ({
        useAuth: () => ({
          profile: mockUserProfile,
          signOut: vi.fn(),
        }),
      }));

      rerender(<Sidebar />);
      expect(screen.getByText("🚪 Logout")).toBeInTheDocument();
    });

    test("both roles see version information", () => {
      // Test admin
      vi.doMock("@/lib/auth-context", () => ({
        useAuth: () => ({
          profile: mockAdminProfile,
          signOut: vi.fn(),
        }),
      }));

      const { rerender } = render(<Sidebar />);
      expect(screen.getByText("Version 1.0.0")).toBeInTheDocument();

      // Test user
      vi.doMock("@/lib/auth-context", () => ({
        useAuth: () => ({
          profile: mockUserProfile,
          signOut: vi.fn(),
        }),
      }));

      rerender(<Sidebar />);
      expect(screen.getByText("Version 1.0.0")).toBeInTheDocument();
    });

    test("navigation styling is consistent between roles", () => {
      // Both roles should have the same base navigation styling
      vi.doMock("@/lib/auth-context", () => ({
        useAuth: () => ({
          profile: mockAdminProfile,
          signOut: vi.fn(),
        }),
      }));

      const { rerender } = render(<Sidebar />);

      // Check admin navigation styling
      const adminNav = screen.getByText("Settings").closest("nav");
      expect(adminNav).toHaveClass("flex-1", "space-y-1", "px-3");

      // Test user navigation styling
      vi.doMock("@/lib/auth-context", () => ({
        useAuth: () => ({
          profile: mockUserProfile,
          signOut: vi.fn(),
        }),
      }));

      rerender(<Sidebar />);

      const userNav = screen.getByText("Settings").closest("nav");
      expect(userNav).toHaveClass("flex-1", "space-y-1", "px-3");
    });
  });

  describe("Navigation Structure Validation", () => {
    test("admin navigation contains exactly 2 items (Upload, Settings)", () => {
      vi.doMock("@/lib/auth-context", () => ({
        useAuth: () => ({
          profile: mockAdminProfile,
          signOut: vi.fn(),
        }),
      }));

      render(<Sidebar />);

      const navLinks = screen.getAllByRole("link");
      const mainNavLinks = navLinks.filter(
        (link) =>
          link.getAttribute("href")?.startsWith("/upload") ||
          link.getAttribute("href")?.startsWith("/settings")
      );

      expect(mainNavLinks).toHaveLength(2);
    });

    test("user navigation contains exactly 2 items (Home, Settings)", () => {
      vi.doMock("@/lib/auth-context", () => ({
        useAuth: () => ({
          profile: mockUserProfile,
          signOut: vi.fn(),
        }),
      }));

      render(<Sidebar />);

      const navLinks = screen.getAllByRole("link");
      const mainNavLinks = navLinks.filter(
        (link) =>
          link.getAttribute("href")?.startsWith("/user-dashboard") ||
          link.getAttribute("href")?.startsWith("/settings")
      );

      expect(mainNavLinks).toHaveLength(2);
    });
  });
});
