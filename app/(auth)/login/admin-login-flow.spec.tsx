import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, test, expect, vi, beforeEach } from "vitest";
import LoginPage from "./page";

// Mock the auth context
const mockSignIn = vi.fn();
const mockProfile = { role: "admin", first_name: "Admin", last_name: "User" };
vi.mock("@/lib/auth-context", () => ({
  useAuth: () => ({
    signIn: mockSignIn,
    profile: mockProfile,
  }),
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

describe("Admin Login Flow and Upload Page Access", () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders login form with all required elements", () => {
    render(<LoginPage />);

    // Check page title and description
    expect(screen.getByText("Business Directory")).toBeInTheDocument();
    expect(screen.getByText("Sign in to your account")).toBeInTheDocument();
    expect(
      screen.getByText("Access your directory management dashboard")
    ).toBeInTheDocument();

    // Check form fields
    expect(screen.getByLabelText("Email Address")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("you@example.com")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("••••••••")).toBeInTheDocument();

    // Check buttons and links
    expect(screen.getByRole("button", { name: "Sign In" })).toBeInTheDocument();
    expect(screen.getByText("Forgot your password?")).toBeInTheDocument();
    expect(screen.getByText("Sign up")).toBeInTheDocument();
  });

  test("validates form fields are required", () => {
    render(<LoginPage />);

    const emailInput = screen.getByLabelText("Email Address");
    const passwordInput = screen.getByLabelText("Password");

    expect(emailInput).toHaveAttribute("required");
    expect(passwordInput).toHaveAttribute("required");
    expect(emailInput).toHaveAttribute("type", "email");
    expect(passwordInput).toHaveAttribute("type", "password");
  });

  test("submits admin login credentials correctly", async () => {
    mockSignIn.mockResolvedValue({ success: true });
    render(<LoginPage />);

    const adminCredentials = {
      email: "admin@example.com",
      password: "adminPassword123",
    };

    // Fill in admin credentials
    await user.type(
      screen.getByLabelText("Email Address"),
      adminCredentials.email
    );
    await user.type(
      screen.getByLabelText("Password"),
      adminCredentials.password
    );

    // Submit the form
    const submitButton = screen.getByRole("button", { name: "Sign In" });
    await user.click(submitButton);

    // Verify signIn was called with correct credentials
    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith(
        adminCredentials.email,
        adminCredentials.password
      );
    });
  });

  test("shows loading state during admin login", async () => {
    // Mock delayed response
    mockSignIn.mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(() => resolve({ success: true }), 100)
        )
    );

    render(<LoginPage />);

    // Fill in credentials
    await user.type(screen.getByLabelText("Email Address"), "admin@test.com");
    await user.type(screen.getByLabelText("Password"), "password123");

    const submitButton = screen.getByRole("button", { name: "Sign In" });
    await user.click(submitButton);

    // Check loading state
    expect(
      screen.getByRole("button", { name: "Signing in..." })
    ).toBeInTheDocument();
    expect(screen.getByRole("button")).toBeDisabled();

    // Check form inputs are disabled during loading
    expect(screen.getByLabelText("Email Address")).toBeDisabled();
    expect(screen.getByLabelText("Password")).toBeDisabled();

    // Wait for loading to complete
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Sign In" })
      ).toBeInTheDocument();
    });
  });

  test("displays error message on admin login failure", async () => {
    const errorMessage = "Invalid email or password";
    mockSignIn.mockResolvedValue({ success: false, error: errorMessage });

    render(<LoginPage />);

    // Fill in incorrect admin credentials
    await user.type(
      screen.getByLabelText("Email Address"),
      "wrong-admin@example.com"
    );
    await user.type(screen.getByLabelText("Password"), "wrongPassword");

    await user.click(screen.getByRole("button", { name: "Sign In" }));

    // Check error message is displayed
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
      expect(screen.getByText("⚠️")).toBeInTheDocument();
    });
  });

  test("clears error message on subsequent login attempts", async () => {
    const errorMessage = "Login failed";
    mockSignIn
      .mockResolvedValueOnce({ success: false, error: errorMessage })
      .mockResolvedValueOnce({ success: true });

    render(<LoginPage />);

    // First failed attempt
    await user.type(
      screen.getByLabelText("Email Address"),
      "admin@example.com"
    );
    await user.type(screen.getByLabelText("Password"), "wrongPassword");
    await user.click(screen.getByRole("button", { name: "Sign In" }));

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    // Clear password field and try again
    await user.clear(screen.getByLabelText("Password"));
    await user.type(screen.getByLabelText("Password"), "correctPassword");
    await user.click(screen.getByRole("button", { name: "Sign In" }));

    // Error message should be cleared
    await waitFor(() => {
      expect(screen.queryByText(errorMessage)).not.toBeInTheDocument();
    });
  });

  test("includes all navigation links", () => {
    render(<LoginPage />);

    // Check forgot password link
    const forgotPasswordLink = screen.getByText("Forgot your password?");
    expect(forgotPasswordLink).toBeInTheDocument();
    expect(forgotPasswordLink.closest("a")).toHaveAttribute(
      "href",
      "/forgot-password"
    );

    // Check signup link
    const signupLink = screen.getByText("Sign up");
    expect(signupLink).toBeInTheDocument();
    expect(signupLink.closest("a")).toHaveAttribute("href", "/signup");

    // Check descriptive text
    expect(screen.getByText("Don't have an account?")).toBeInTheDocument();
  });

  test("form handles edge case inputs correctly", async () => {
    mockSignIn.mockResolvedValue({ success: true });
    render(<LoginPage />);

    // Test with special characters in email and password
    const specialCredentials = {
      email: "admin+test@company.co.uk",
      password: "P@ssw0rd!#$%",
    };

    await user.type(
      screen.getByLabelText("Email Address"),
      specialCredentials.email
    );
    await user.type(
      screen.getByLabelText("Password"),
      specialCredentials.password
    );

    await user.click(screen.getByRole("button", { name: "Sign In" }));

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith(
        specialCredentials.email,
        specialCredentials.password
      );
    });
  });

  test("handles form submission without credentials gracefully", async () => {
    render(<LoginPage />);

    // Try to submit empty form
    const submitButton = screen.getByRole("button", { name: "Sign In" });
    await user.click(submitButton);

    // HTML5 validation should prevent submission, so signIn should not be called
    expect(mockSignIn).not.toHaveBeenCalled();
  });
});
