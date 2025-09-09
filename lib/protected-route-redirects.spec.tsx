import { render, screen, waitFor } from "@testing-library/react";
import { describe, test, expect, vi, beforeEach } from "vitest";
import ProtectedRoute from "./protected-route";

// Mock Next.js navigation hook
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe("Protected Route Redirects for Unauthenticated Users", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("redirects unauthenticated user to login page", async () => {
    // Mock no user (unauthenticated)
    vi.doMock("@/lib/auth-context", () => ({
      useAuth: () => ({
        user: null,
        profile: null,
        loading: false,
      }),
    }));

    const TestContent = () => <div>Protected Content</div>;

    render(
      <ProtectedRoute>
        <TestContent />
      </ProtectedRoute>
    );

    // Should redirect to login
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/login");
    });

    // Should not render protected content
    expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
  });

  test("shows loading state during authentication check", () => {
    // Mock loading state
    vi.doMock("@/lib/auth-context", () => ({
      useAuth: () => ({
        user: null,
        profile: null,
        loading: true,
      }),
    }));

    const TestContent = () => <div>Protected Content</div>;

    render(
      <ProtectedRoute>
        <TestContent />
      </ProtectedRoute>
    );

    // Should show loading state
    expect(screen.getByText("Loading...")).toBeInTheDocument();
    expect(
      screen.getByRole("progressbar", { hidden: true })
    ).toBeInTheDocument(); // spinner

    // Should not redirect or show content during loading
    expect(mockPush).not.toHaveBeenCalled();
    expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
  });

  test("redirects admin user accessing user-only route to admin dashboard", async () => {
    // Mock admin user trying to access user-only route
    vi.doMock("@/lib/auth-context", () => ({
      useAuth: () => ({
        user: { id: "admin-1", email: "admin@test.com" },
        profile: { role: "admin", first_name: "Admin", last_name: "User" },
        loading: false,
      }),
    }));

    const TestContent = () => <div>User Only Content</div>;

    render(
      <ProtectedRoute requiredRole="user">
        <TestContent />
      </ProtectedRoute>
    );

    // Should redirect admin to upload page
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/upload");
    });

    // Should not render user-only content to admin
    expect(screen.queryByText("User Only Content")).not.toBeInTheDocument();
  });

  test("redirects user trying to access admin-only route to user dashboard", async () => {
    // Mock regular user trying to access admin-only route
    vi.doMock("@/lib/auth-context", () => ({
      useAuth: () => ({
        user: { id: "user-1", email: "user@test.com" },
        profile: { role: "user", first_name: "John", last_name: "Doe" },
        loading: false,
      }),
    }));

    const TestContent = () => <div>Admin Only Content</div>;

    render(
      <ProtectedRoute requiredRole="admin">
        <TestContent />
      </ProtectedRoute>
    );

    // Should redirect user to user dashboard
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/user-dashboard");
    });

    // Should not render admin-only content to user
    expect(screen.queryByText("Admin Only Content")).not.toBeInTheDocument();
  });

  test("redirects authenticated user with unknown role to login", async () => {
    // Mock user with unknown/invalid role
    vi.doMock("@/lib/auth-context", () => ({
      useAuth: () => ({
        user: { id: "user-1", email: "user@test.com" },
        profile: { role: "invalid-role", first_name: "John", last_name: "Doe" },
        loading: false,
      }),
    }));

    const TestContent = () => <div>Admin Only Content</div>;

    render(
      <ProtectedRoute requiredRole="admin">
        <TestContent />
      </ProtectedRoute>
    );

    // Should redirect to login for unknown role
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/login");
    });

    expect(screen.queryByText("Admin Only Content")).not.toBeInTheDocument();
  });

  test("redirects to custom redirect URL when provided", async () => {
    // Mock unauthenticated user with custom redirect
    vi.doMock("@/lib/auth-context", () => ({
      useAuth: () => ({
        user: { id: "user-1", email: "user@test.com" },
        profile: { role: "user", first_name: "John", last_name: "Doe" },
        loading: false,
      }),
    }));

    const TestContent = () => <div>Protected Content</div>;

    render(
      <ProtectedRoute redirectTo="/custom-page">
        <TestContent />
      </ProtectedRoute>
    );

    // Should redirect to custom page
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/custom-page");
    });

    expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
  });

  test("renders content for authenticated admin user with correct role", async () => {
    // Mock authenticated admin user accessing admin route
    vi.doMock("@/lib/auth-context", () => ({
      useAuth: () => ({
        user: { id: "admin-1", email: "admin@test.com" },
        profile: { role: "admin", first_name: "Admin", last_name: "User" },
        loading: false,
      }),
    }));

    const TestContent = () => <div>Admin Content</div>;

    render(
      <ProtectedRoute requiredRole="admin">
        <TestContent />
      </ProtectedRoute>
    );

    // Should NOT redirect
    await waitFor(() => {
      expect(mockPush).not.toHaveBeenCalled();
    });

    // Should render content
    expect(screen.getByText("Admin Content")).toBeInTheDocument();
  });

  test("renders content for authenticated user with correct role", async () => {
    // Mock authenticated user accessing user route
    vi.doMock("@/lib/auth-context", () => ({
      useAuth: () => ({
        user: { id: "user-1", email: "user@test.com" },
        profile: { role: "user", first_name: "John", last_name: "Doe" },
        loading: false,
      }),
    }));

    const TestContent = () => <div>User Content</div>;

    render(
      <ProtectedRoute requiredRole="user">
        <TestContent />
      </ProtectedRoute>
    );

    // Should NOT redirect
    await waitFor(() => {
      expect(mockPush).not.toHaveBeenCalled();
    });

    // Should render content
    expect(screen.getByText("User Content")).toBeInTheDocument();
  });

  test("renders content for authenticated user when no specific role required", async () => {
    // Mock authenticated user accessing general protected route
    vi.doMock("@/lib/auth-context", () => ({
      useAuth: () => ({
        user: { id: "user-1", email: "user@test.com" },
        profile: { role: "user", first_name: "John", last_name: "Doe" },
        loading: false,
      }),
    }));

    const TestContent = () => <div>General Protected Content</div>;

    render(
      <ProtectedRoute>
        <TestContent />
      </ProtectedRoute>
    );

    // Should NOT redirect
    await waitFor(() => {
      expect(mockPush).not.toHaveBeenCalled();
    });

    // Should render content
    expect(screen.getByText("General Protected Content")).toBeInTheDocument();
  });

  test("loading spinner has correct styling and accessibility", () => {
    vi.doMock("@/lib/auth-context", () => ({
      useAuth: () => ({
        user: null,
        profile: null,
        loading: true,
      }),
    }));

    render(
      <ProtectedRoute>
        <div>Content</div>
      </ProtectedRoute>
    );

    // Check loading container styling
    const loadingContainer = screen.getByText("Loading...").closest("div");
    expect(loadingContainer).toHaveClass(
      "min-h-screen",
      "bg-gray-50",
      "flex",
      "flex-col",
      "justify-center",
      "items-center"
    );

    // Check spinner styling
    const spinner = screen.getByRole("progressbar", { hidden: true });
    expect(spinner).toHaveClass(
      "animate-spin",
      "w-8",
      "h-8",
      "border-2",
      "border-blue-600",
      "border-t-transparent",
      "rounded-full",
      "mb-4"
    );

    // Check loading text styling
    const loadingText = screen.getByText("Loading...");
    expect(loadingText).toHaveClass("text-gray-600");
  });

  test("handles edge case of user with no profile", async () => {
    // Mock user without profile data
    vi.doMock("@/lib/auth-context", () => ({
      useAuth: () => ({
        user: { id: "user-1", email: "user@test.com" },
        profile: null, // No profile data
        loading: false,
      }),
    }));

    const TestContent = () => <div>Protected Content</div>;

    render(
      <ProtectedRoute requiredRole="admin">
        <TestContent />
      </ProtectedRoute>
    );

    // Should redirect to login when profile is null
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/login");
    });

    expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
  });
});
