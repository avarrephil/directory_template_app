import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import ResetPasswordPage from "./page";

// Mock the updatePassword function from supabase-client
const mockUpdatePassword = vi.fn();
vi.mock("@/lib/supabase-client", () => ({
  updatePassword: mockUpdatePassword,
}));

// Mock Next.js navigation hooks
const mockPush = vi.fn();
const mockSearchParams = new URLSearchParams();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useSearchParams: () => mockSearchParams,
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

describe("Reset Password Flow End-to-End", () => {
  const user = userEvent.setup();
  let timers: NodeJS.Timeout[] = [];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    timers = [];
  });

  afterEach(() => {
    vi.useRealTimers();
    timers.forEach((timer) => clearTimeout(timer));
  });

  test("renders reset password form with all required elements", () => {
    render(<ResetPasswordPage />);

    // Check page title and description
    expect(screen.getByText("Reset your password")).toBeInTheDocument();
    expect(
      screen.getByText("Enter your new password below.")
    ).toBeInTheDocument();

    // Check form fields
    expect(screen.getByLabelText("New Password")).toBeInTheDocument();
    expect(screen.getByLabelText("Confirm New Password")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Update Password" })
    ).toBeInTheDocument();

    // Check navigation link
    expect(screen.getByText("Back to login")).toBeInTheDocument();
  });

  test("validates form fields are required and correct type", () => {
    render(<ResetPasswordPage />);

    const passwordInput = screen.getByLabelText("New Password");
    const confirmPasswordInput = screen.getByLabelText("Confirm New Password");

    expect(passwordInput).toHaveAttribute("required");
    expect(passwordInput).toHaveAttribute("type", "password");
    expect(confirmPasswordInput).toHaveAttribute("required");
    expect(confirmPasswordInput).toHaveAttribute("type", "password");
  });

  test("successfully updates password with matching passwords", async () => {
    mockUpdatePassword.mockResolvedValue({ success: true });
    render(<ResetPasswordPage />);

    const newPassword = "newSecurePassword123";

    // Fill in both password fields
    await user.type(screen.getByLabelText("New Password"), newPassword);
    await user.type(screen.getByLabelText("Confirm New Password"), newPassword);

    // Submit form
    await user.click(screen.getByRole("button", { name: "Update Password" }));

    // Verify updatePassword was called with correct password
    await waitFor(() => {
      expect(mockUpdatePassword).toHaveBeenCalledWith(newPassword);
    });
  });

  test("shows loading state during password update", async () => {
    mockUpdatePassword.mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(() => resolve({ success: true }), 100)
        )
    );

    render(<ResetPasswordPage />);

    const password = "testPassword123";
    await user.type(screen.getByLabelText("New Password"), password);
    await user.type(screen.getByLabelText("Confirm New Password"), password);

    const submitButton = screen.getByRole("button", {
      name: "Update Password",
    });
    await user.click(submitButton);

    // Check loading state
    expect(
      screen.getByRole("button", { name: "Updating..." })
    ).toBeInTheDocument();
    expect(screen.getByRole("button")).toBeDisabled();
    expect(screen.getByLabelText("New Password")).toBeDisabled();
    expect(screen.getByLabelText("Confirm New Password")).toBeDisabled();

    // Wait for loading to complete
    await act(async () => {
      vi.advanceTimersByTime(100);
    });
  });

  test("displays success screen after successful password update", async () => {
    mockUpdatePassword.mockResolvedValue({ success: true });
    render(<ResetPasswordPage />);

    const password = "newPassword123";
    await user.type(screen.getByLabelText("New Password"), password);
    await user.type(screen.getByLabelText("Confirm New Password"), password);
    await user.click(screen.getByRole("button", { name: "Update Password" }));

    // Wait for success state
    await waitFor(() => {
      expect(screen.getByText("Password Updated!")).toBeInTheDocument();
      expect(
        screen.getByText("Your password has been successfully updated.")
      ).toBeInTheDocument();
      expect(screen.getByText("✅")).toBeInTheDocument();
      expect(
        screen.getByText(
          "You will be redirected to the login page in a few seconds."
        )
      ).toBeInTheDocument();
      expect(screen.getByText("Go to login now")).toBeInTheDocument();
    });
  });

  test("auto-redirects to login page after 3 seconds on success", async () => {
    mockUpdatePassword.mockResolvedValue({ success: true });
    render(<ResetPasswordPage />);

    const password = "newPassword123";
    await user.type(screen.getByLabelText("New Password"), password);
    await user.type(screen.getByLabelText("Confirm New Password"), password);
    await user.click(screen.getByRole("button", { name: "Update Password" }));

    // Wait for success state
    await waitFor(() => {
      expect(screen.getByText("Password Updated!")).toBeInTheDocument();
    });

    // Fast-forward 3 seconds
    act(() => {
      vi.advanceTimersByTime(3000);
    });

    // Verify redirect was called
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/login");
    });
  });

  test("validates passwords match before submitting", async () => {
    render(<ResetPasswordPage />);

    // Fill in non-matching passwords
    await user.type(screen.getByLabelText("New Password"), "password123");
    await user.type(
      screen.getByLabelText("Confirm New Password"),
      "differentPassword"
    );

    await user.click(screen.getByRole("button", { name: "Update Password" }));

    // Should show error message
    await waitFor(() => {
      expect(screen.getByText("Passwords do not match")).toBeInTheDocument();
      expect(screen.getByText("⚠️")).toBeInTheDocument();
    });

    // Should not call updatePassword
    expect(mockUpdatePassword).not.toHaveBeenCalled();
  });

  test("validates password minimum length", async () => {
    render(<ResetPasswordPage />);

    // Fill in password that's too short
    const shortPassword = "123";
    await user.type(screen.getByLabelText("New Password"), shortPassword);
    await user.type(
      screen.getByLabelText("Confirm New Password"),
      shortPassword
    );

    await user.click(screen.getByRole("button", { name: "Update Password" }));

    // Should show error message
    await waitFor(() => {
      expect(
        screen.getByText("Password must be at least 6 characters long")
      ).toBeInTheDocument();
      expect(screen.getByText("⚠️")).toBeInTheDocument();
    });

    // Should not call updatePassword
    expect(mockUpdatePassword).not.toHaveBeenCalled();
  });

  test("displays error message on update failure", async () => {
    const errorMessage = "Failed to update password. Please try again.";
    mockUpdatePassword.mockResolvedValue({
      success: false,
      error: errorMessage,
    });

    render(<ResetPasswordPage />);

    const password = "validPassword123";
    await user.type(screen.getByLabelText("New Password"), password);
    await user.type(screen.getByLabelText("Confirm New Password"), password);
    await user.click(screen.getByRole("button", { name: "Update Password" }));

    // Check error message is displayed
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
      expect(screen.getByText("⚠️")).toBeInTheDocument();
    });

    // Should still show the form, not success screen
    expect(screen.getByText("Reset your password")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Update Password" })
    ).toBeInTheDocument();
  });

  test("clears validation errors on subsequent attempts", async () => {
    render(<ResetPasswordPage />);

    // First attempt with mismatched passwords
    await user.type(screen.getByLabelText("New Password"), "password123");
    await user.type(screen.getByLabelText("Confirm New Password"), "different");
    await user.click(screen.getByRole("button", { name: "Update Password" }));

    await waitFor(() => {
      expect(screen.getByText("Passwords do not match")).toBeInTheDocument();
    });

    // Clear fields and try again with matching passwords
    await user.clear(screen.getByLabelText("New Password"));
    await user.clear(screen.getByLabelText("Confirm New Password"));

    const correctPassword = "correctPassword123";
    await user.type(screen.getByLabelText("New Password"), correctPassword);
    await user.type(
      screen.getByLabelText("Confirm New Password"),
      correctPassword
    );

    mockUpdatePassword.mockResolvedValue({ success: true });
    await user.click(screen.getByRole("button", { name: "Update Password" }));

    // Error should be cleared
    await waitFor(() => {
      expect(
        screen.queryByText("Passwords do not match")
      ).not.toBeInTheDocument();
    });
  });

  test("handles various password formats correctly", async () => {
    mockUpdatePassword.mockResolvedValue({ success: true });
    render(<ResetPasswordPage />);

    const passwordFormats = [
      "simple123",
      "Complex@Password123",
      "verylongpasswordwithmanycharacters",
      "P@ssW0rd!#$",
    ];

    for (const password of passwordFormats) {
      // Clear previous inputs
      await user.clear(screen.getByLabelText("New Password"));
      await user.clear(screen.getByLabelText("Confirm New Password"));

      await user.type(screen.getByLabelText("New Password"), password);
      await user.type(screen.getByLabelText("Confirm New Password"), password);
      await user.click(screen.getByRole("button", { name: "Update Password" }));

      await waitFor(() => {
        expect(mockUpdatePassword).toHaveBeenCalledWith(password);
      });

      // Reset mocks for next iteration
      vi.clearAllMocks();
    }
  });

  test("prevents submission with empty passwords", async () => {
    render(<ResetPasswordPage />);

    // Try to submit without entering passwords
    await user.click(screen.getByRole("button", { name: "Update Password" }));

    // HTML5 validation should prevent submission
    expect(mockUpdatePassword).not.toHaveBeenCalled();
  });

  test("success screen immediate login link works", async () => {
    mockUpdatePassword.mockResolvedValue({ success: true });
    render(<ResetPasswordPage />);

    const password = "newPassword123";
    await user.type(screen.getByLabelText("New Password"), password);
    await user.type(screen.getByLabelText("Confirm New Password"), password);
    await user.click(screen.getByRole("button", { name: "Update Password" }));

    await waitFor(() => {
      expect(screen.getByText("Go to login now")).toBeInTheDocument();
    });

    // Check the link points to login page
    const loginLink = screen.getByText("Go to login now");
    expect(loginLink.closest("a")).toHaveAttribute("href", "/login");
  });

  test("handles generic failure with fallback error message", async () => {
    mockUpdatePassword.mockResolvedValue({ success: false }); // No specific error

    render(<ResetPasswordPage />);

    const password = "validPassword123";
    await user.type(screen.getByLabelText("New Password"), password);
    await user.type(screen.getByLabelText("Confirm New Password"), password);
    await user.click(screen.getByRole("button", { name: "Update Password" }));

    await waitFor(() => {
      expect(screen.getByText("Failed to update password")).toBeInTheDocument();
    });
  });

  test("validates edge case password lengths", async () => {
    render(<ResetPasswordPage />);

    // Test exactly 6 characters (should be valid)
    const exactMinPassword = "123456";
    await user.type(screen.getByLabelText("New Password"), exactMinPassword);
    await user.type(
      screen.getByLabelText("Confirm New Password"),
      exactMinPassword
    );

    mockUpdatePassword.mockResolvedValue({ success: true });
    await user.click(screen.getByRole("button", { name: "Update Password" }));

    // Should call updatePassword (no length error)
    await waitFor(() => {
      expect(mockUpdatePassword).toHaveBeenCalledWith(exactMinPassword);
    });
  });
});
