import { render, screen } from "@testing-library/react";
import { describe, test, expect, vi } from "vitest";
import ResetPasswordPage from "./page";

// Mock the updatePassword function from supabase-client
vi.mock("@/lib/supabase-client", () => ({
  updatePassword: vi.fn().mockResolvedValue({ success: true }),
}));

// Mock Next.js navigation hooks
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
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

describe("Reset Password Flow - Core Elements", () => {
  test("renders reset password form with all required UI elements", () => {
    render(<ResetPasswordPage />);

    // Check main heading and description
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

    // Check password field properties
    const passwordInput = screen.getByLabelText("New Password");
    const confirmPasswordInput = screen.getByLabelText("Confirm New Password");

    expect(passwordInput).toHaveAttribute("type", "password");
    expect(passwordInput).toHaveAttribute("required");
    expect(confirmPasswordInput).toHaveAttribute("type", "password");
    expect(confirmPasswordInput).toHaveAttribute("required");

    // Check navigation links
    expect(screen.getByText("Back to login")).toBeInTheDocument();
    const backLink = screen.getByText("Back to login");
    expect(backLink.closest("a")).toHaveAttribute("href", "/login");
  });

  test("form has proper accessibility attributes", () => {
    render(<ResetPasswordPage />);

    const passwordInput = screen.getByLabelText("New Password");
    const confirmPasswordInput = screen.getByLabelText("Confirm New Password");
    const submitButton = screen.getByRole("button", {
      name: "Update Password",
    });

    expect(passwordInput).toHaveAttribute("id", "password");
    expect(passwordInput).toHaveAttribute("name", "password");
    expect(confirmPasswordInput).toHaveAttribute("id", "confirmPassword");
    expect(confirmPasswordInput).toHaveAttribute("name", "confirmPassword");

    expect(submitButton).toHaveAttribute("type", "submit");
  });

  test("password fields have proper placeholders", () => {
    render(<ResetPasswordPage />);

    const passwordInput = screen.getByLabelText("New Password");
    const confirmPasswordInput = screen.getByLabelText("Confirm New Password");

    expect(passwordInput).toHaveAttribute("placeholder", "••••••••");
    expect(confirmPasswordInput).toHaveAttribute("placeholder", "••••••••");
  });

  test("page layout and styling structure is correct", () => {
    render(<ResetPasswordPage />);

    // Check main containers exist
    expect(
      screen.getByText("Reset your password").closest(".text-center")
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText("New Password").closest(".bg-white")
    ).toBeInTheDocument();
  });
});
