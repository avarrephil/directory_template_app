import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import ForgotPasswordPage from "./page";
import { resetPassword } from "@/lib/supabase-client";

// Mock the resetPassword function from supabase-client
vi.mock("@/lib/supabase-client", () => ({
  resetPassword: vi.fn(),
}));

// Mock Next.js navigation hooks
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
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

describe("Forgot Password Flow End-to-End", () => {
  const user = userEvent.setup();
  let timers: NodeJS.Timeout[] = [];
  const mockResetPassword = vi.mocked(resetPassword);

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    timers = [];
  });

  afterEach(() => {
    vi.useRealTimers();
    timers.forEach((timer) => clearTimeout(timer));
  });

  test("renders forgot password form with all required elements", () => {
    render(<ForgotPasswordPage />);

    // Check page title and description
    expect(screen.getByText("Forgot your password?")).toBeInTheDocument();
    expect(
      screen.getByText(
        /Enter your email address and we'll send you a link to reset your password/
      )
    ).toBeInTheDocument();

    // Check form elements
    expect(screen.getByLabelText("Email Address")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("you@example.com")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Send Reset Link" })
    ).toBeInTheDocument();

    // Check navigation link
    expect(screen.getByText("Back to login")).toBeInTheDocument();
  });

  test("validates email field is required", () => {
    render(<ForgotPasswordPage />);

    const emailInput = screen.getByLabelText("Email Address");
    expect(emailInput).toHaveAttribute("required");
    expect(emailInput).toHaveAttribute("type", "email");
  });

  test("submits password reset request successfully", async () => {
    mockResetPassword.mockResolvedValue({ success: true });
    render(<ForgotPasswordPage />);

    const testEmail = "user@example.com";

    // Fill in email
    await user.type(screen.getByLabelText("Email Address"), testEmail);

    // Submit form
    await user.click(screen.getByRole("button", { name: "Send Reset Link" }));

    // Verify resetPassword was called with correct email
    expect(mockResetPassword).toHaveBeenCalledWith(testEmail);
  });

  test("shows loading state during password reset request", async () => {
    let resolvePromise: (value: { success: boolean }) => void;
    const mockPromise = new Promise<{ success: boolean }>((resolve) => {
      resolvePromise = resolve;
    });

    mockResetPassword.mockReturnValue(mockPromise);

    render(<ForgotPasswordPage />);

    await user.type(screen.getByLabelText("Email Address"), "test@example.com");

    const submitButton = screen.getByRole("button", {
      name: "Send Reset Link",
    });
    await user.click(submitButton);

    // Check loading state
    expect(
      screen.getByRole("button", { name: "Sending..." })
    ).toBeInTheDocument();
    expect(screen.getByRole("button")).toBeDisabled();
    expect(screen.getByLabelText("Email Address")).toBeDisabled();

    // Resolve the promise
    await act(async () => {
      resolvePromise({ success: true });
    });
  });

  test("displays success screen after successful reset request", async () => {
    mockResetPassword.mockResolvedValue({ success: true });
    render(<ForgotPasswordPage />);

    await user.type(screen.getByLabelText("Email Address"), "user@example.com");
    await user.click(screen.getByRole("button", { name: "Send Reset Link" }));

    // Wait for success state
    await waitFor(() => {
      expect(screen.getByText("Check your email")).toBeInTheDocument();
      expect(
        screen.getByText(
          "We've sent a password reset link to your email address."
        )
      ).toBeInTheDocument();
      expect(screen.getByText("✉️")).toBeInTheDocument();
      expect(
        screen.getByText(
          "Please check your email and click the link to reset your password."
        )
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          "You will be redirected to the login page in a few seconds."
        )
      ).toBeInTheDocument();
      expect(screen.getByText("Go to login now")).toBeInTheDocument();
    });
  });

  test("auto-redirects to login page after 5 seconds on success", async () => {
    mockResetPassword.mockResolvedValue({ success: true });
    render(<ForgotPasswordPage />);

    await user.type(screen.getByLabelText("Email Address"), "user@example.com");
    await user.click(screen.getByRole("button", { name: "Send Reset Link" }));

    // Wait for success state
    await waitFor(() => {
      expect(screen.getByText("Check your email")).toBeInTheDocument();
    });

    // Fast-forward 5 seconds
    act(() => {
      vi.advanceTimersByTime(5000);
    });

    // Verify redirect was called
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/login");
    });
  });

  test("displays error message on reset failure", async () => {
    const errorMessage = "Email not found";
    mockResetPassword.mockResolvedValue({
      success: false,
      error: errorMessage,
    });

    render(<ForgotPasswordPage />);

    await user.type(
      screen.getByLabelText("Email Address"),
      "nonexistent@example.com"
    );
    await user.click(screen.getByRole("button", { name: "Send Reset Link" }));

    // Check error message is displayed
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
      expect(screen.getByText("⚠️")).toBeInTheDocument();
    });

    // Should still show the form, not success screen
    expect(screen.getByText("Forgot your password?")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Send Reset Link" })
    ).toBeInTheDocument();
  });

  test("clears error on subsequent attempts", async () => {
    mockResetPassword
      .mockResolvedValueOnce({ success: false, error: "Email not found" })
      .mockResolvedValueOnce({ success: true });

    render(<ForgotPasswordPage />);

    // First failed attempt
    await user.type(
      screen.getByLabelText("Email Address"),
      "wrong@example.com"
    );
    await user.click(screen.getByRole("button", { name: "Send Reset Link" }));

    await waitFor(() => {
      expect(screen.getByText("Email not found")).toBeInTheDocument();
    });

    // Change email and try again
    await user.clear(screen.getByLabelText("Email Address"));
    await user.type(
      screen.getByLabelText("Email Address"),
      "correct@example.com"
    );
    await user.click(screen.getByRole("button", { name: "Send Reset Link" }));

    // Error should be cleared and success screen should appear
    await waitFor(() => {
      expect(screen.queryByText("Email not found")).not.toBeInTheDocument();
      expect(screen.getByText("Check your email")).toBeInTheDocument();
    });
  });

  test("handles various email formats correctly", async () => {
    mockResetPassword.mockResolvedValue({ success: true });
    render(<ForgotPasswordPage />);

    const emailFormats = [
      "user@example.com",
      "user.name@company.co.uk",
      "user+tag@domain.org",
      "admin123@business.info",
    ];

    for (const email of emailFormats) {
      // Clear previous input
      const emailInput = screen.getByLabelText("Email Address");
      await user.clear(emailInput);

      await user.type(emailInput, email);
      await user.click(screen.getByRole("button", { name: "Send Reset Link" }));

      await waitFor(() => {
        expect(mockResetPassword).toHaveBeenCalledWith(email);
      });

      // Reset for next iteration
      vi.clearAllMocks();
      // Reset page state by re-rendering
      const { rerender } = render(<ForgotPasswordPage />);
      rerender(<ForgotPasswordPage />);
    }
  });

  test("prevents submission with empty email", async () => {
    render(<ForgotPasswordPage />);

    // Try to submit without entering email
    await user.click(screen.getByRole("button", { name: "Send Reset Link" }));

    // HTML5 validation should prevent submission
    expect(mockResetPassword).not.toHaveBeenCalled();
  });

  test("success screen immediate login link works", async () => {
    mockResetPassword.mockResolvedValue({ success: true });
    render(<ForgotPasswordPage />);

    await user.type(screen.getByLabelText("Email Address"), "user@example.com");
    await user.click(screen.getByRole("button", { name: "Send Reset Link" }));

    await waitFor(() => {
      expect(screen.getByText("Go to login now")).toBeInTheDocument();
    });

    // Check the link points to login page
    const loginLink = screen.getByText("Go to login now");
    expect(loginLink.closest("a")).toHaveAttribute("href", "/login");
  });

  test("handles generic failure with fallback error message", async () => {
    mockResetPassword.mockResolvedValue({ success: false }); // No specific error

    render(<ForgotPasswordPage />);

    await user.type(screen.getByLabelText("Email Address"), "test@example.com");
    await user.click(screen.getByRole("button", { name: "Send Reset Link" }));

    await waitFor(() => {
      expect(
        screen.getByText("Failed to send reset email")
      ).toBeInTheDocument();
    });
  });
});
