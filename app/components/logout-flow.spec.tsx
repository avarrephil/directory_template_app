import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, test, expect, vi, beforeEach } from "vitest";
import Sidebar from "./sidebar";

// Mock user profile data
const mockAdminProfile = {
  first_name: "Admin",
  last_name: "User",
  role: "admin",
};

const mockUserProfile = {
  first_name: "John",
  last_name: "Doe",
  role: "user",
};

// Mock the auth context
const mockSignOut = vi.fn();
vi.mock("@/lib/auth-context", () => ({
  useAuth: () => ({
    profile: mockAdminProfile,
    signOut: mockSignOut,
  }),
}));

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

describe("Logout Confirmation Dialog and Sign Out Flow", () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders logout button in sidebar", () => {
    render(<Sidebar />);

    expect(screen.getByText("🚪 Logout")).toBeInTheDocument();

    const logoutButton = screen.getByText("🚪 Logout");
    expect(logoutButton).toHaveClass("text-left", "text-sm", "text-gray-700");
  });

  test("shows confirmation dialog when logout button is clicked", async () => {
    render(<Sidebar />);

    const logoutButton = screen.getByText("🚪 Logout");
    await user.click(logoutButton);

    // Check confirmation dialog appears
    await waitFor(() => {
      expect(screen.getByText("Confirm Logout")).toBeInTheDocument();
      expect(
        screen.getByText(
          /Are you sure you want to log out\? You'll need to sign in again to access your dashboard\./
        )
      ).toBeInTheDocument();
    });

    // Check dialog buttons
    expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Logout" })).toBeInTheDocument();
  });

  test("closes confirmation dialog when Cancel is clicked", async () => {
    render(<Sidebar />);

    // Open dialog
    const logoutButton = screen.getByText("🚪 Logout");
    await user.click(logoutButton);

    await waitFor(() => {
      expect(screen.getByText("Confirm Logout")).toBeInTheDocument();
    });

    // Click Cancel
    const cancelButton = screen.getByRole("button", { name: "Cancel" });
    await user.click(cancelButton);

    // Dialog should be closed
    await waitFor(() => {
      expect(screen.queryByText("Confirm Logout")).not.toBeInTheDocument();
    });

    // Sign out should not have been called
    expect(mockSignOut).not.toHaveBeenCalled();
  });

  test("completes logout when Logout button is clicked in dialog", async () => {
    mockSignOut.mockResolvedValue(undefined);
    render(<Sidebar />);

    // Open dialog
    const logoutButton = screen.getByText("🚪 Logout");
    await user.click(logoutButton);

    await waitFor(() => {
      expect(screen.getByText("Confirm Logout")).toBeInTheDocument();
    });

    // Click Logout in dialog
    const confirmLogoutButton = screen.getByRole("button", { name: "Logout" });
    await user.click(confirmLogoutButton);

    // Sign out should be called
    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalled();
    });

    // Dialog should be closed after logout
    await waitFor(() => {
      expect(screen.queryByText("Confirm Logout")).not.toBeInTheDocument();
    });
  });

  test("confirmation dialog has proper styling and overlay", async () => {
    render(<Sidebar />);

    const logoutButton = screen.getByText("🚪 Logout");
    await user.click(logoutButton);

    await waitFor(() => {
      expect(screen.getByText("Confirm Logout")).toBeInTheDocument();
    });

    // Check overlay styling
    const overlay = screen.getByText("Confirm Logout").closest(".fixed");
    expect(overlay).toHaveClass(
      "fixed",
      "inset-0",
      "bg-gray-600",
      "bg-opacity-50",
      "overflow-y-auto",
      "h-full",
      "w-full",
      "z-50"
    );

    // Check dialog styling
    const dialog = screen.getByText("Confirm Logout").closest(".border");
    expect(dialog).toHaveClass(
      "border",
      "w-96",
      "shadow-lg",
      "rounded-md",
      "bg-white"
    );
  });

  test("dialog buttons have correct styling", async () => {
    render(<Sidebar />);

    const logoutButton = screen.getByText("🚪 Logout");
    await user.click(logoutButton);

    await waitFor(() => {
      expect(screen.getByText("Confirm Logout")).toBeInTheDocument();
    });

    // Check Cancel button styling
    const cancelButton = screen.getByRole("button", { name: "Cancel" });
    expect(cancelButton).toHaveClass(
      "px-4",
      "py-2",
      "bg-gray-300",
      "text-gray-700",
      "rounded-md",
      "hover:bg-gray-400",
      "focus:outline-none",
      "focus:ring-2",
      "focus:ring-gray-500"
    );

    // Check Logout button styling
    const confirmLogoutButton = screen.getByRole("button", { name: "Logout" });
    expect(confirmLogoutButton).toHaveClass(
      "px-4",
      "py-2",
      "bg-red-600",
      "text-white",
      "rounded-md",
      "hover:bg-red-700",
      "focus:outline-none",
      "focus:ring-2",
      "focus:ring-red-500"
    );
  });

  test("shows user profile information correctly", () => {
    render(<Sidebar />);

    // Check user name is displayed
    expect(
      screen.getByText(
        `${mockAdminProfile.first_name} ${mockAdminProfile.last_name}`
      )
    ).toBeInTheDocument();
    expect(screen.getByText(mockAdminProfile.role)).toBeInTheDocument();
  });

  test("handles keyboard navigation in confirmation dialog", async () => {
    render(<Sidebar />);

    const logoutButton = screen.getByText("🚪 Logout");
    await user.click(logoutButton);

    await waitFor(() => {
      expect(screen.getByText("Confirm Logout")).toBeInTheDocument();
    });

    // Tab to navigate to Cancel button and press Enter
    await user.tab();
    const cancelButton = screen.getByRole("button", { name: "Cancel" });
    expect(cancelButton).toHaveFocus();

    await user.keyboard("{Enter}");

    // Dialog should close
    await waitFor(() => {
      expect(screen.queryByText("Confirm Logout")).not.toBeInTheDocument();
    });
  });

  test("dialog stays open during logout process", async () => {
    // Mock delayed logout
    mockSignOut.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve(undefined), 100))
    );

    render(<Sidebar />);

    const logoutButton = screen.getByText("🚪 Logout");
    await user.click(logoutButton);

    await waitFor(() => {
      expect(screen.getByText("Confirm Logout")).toBeInTheDocument();
    });

    const confirmLogoutButton = screen.getByRole("button", { name: "Logout" });
    await user.click(confirmLogoutButton);

    // Dialog should still be visible during logout process
    expect(screen.getByText("Confirm Logout")).toBeInTheDocument();

    // Wait for logout to complete
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 150));
    });

    // Dialog should close after logout completes
    await waitFor(() => {
      expect(screen.queryByText("Confirm Logout")).not.toBeInTheDocument();
    });
  });

  test("logout button is accessible and properly labeled", () => {
    render(<Sidebar />);

    const logoutButton = screen.getByText("🚪 Logout");

    // Should be inside a button element
    const buttonElement = logoutButton.closest("button");
    expect(buttonElement).toBeInTheDocument();

    // Should have proper styling for interaction
    expect(buttonElement).toHaveClass(
      "w-full",
      "text-left",
      "text-sm",
      "text-gray-700",
      "hover:text-gray-900",
      "hover:bg-gray-100"
    );
  });

  test("version information is displayed in sidebar", () => {
    render(<Sidebar />);

    expect(screen.getByText("Version 1.0.0")).toBeInTheDocument();
  });
});
