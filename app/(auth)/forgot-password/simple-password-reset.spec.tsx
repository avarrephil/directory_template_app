import { render, screen } from "@testing-library/react";
import { describe, test, expect, vi } from "vitest";
import ForgotPasswordPage from "./page";

// Mock the resetPassword function from supabase-client
vi.mock("@/lib/supabase-client", () => ({
  resetPassword: vi.fn().mockResolvedValue({ success: true }),
}));

// Mock Next.js navigation hooks
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
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

describe("Password Reset Flow - Core Elements", () => {
  test("renders forgot password form with all required UI elements", () => {
    render(<ForgotPasswordPage />);

    // Check main heading and description
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

    // Check email field properties
    const emailInput = screen.getByLabelText("Email Address");
    expect(emailInput).toHaveAttribute("type", "email");
    expect(emailInput).toHaveAttribute("required");

    // Check navigation links
    expect(screen.getByText("Back to login")).toBeInTheDocument();
    const backLink = screen.getByText("Back to login");
    expect(backLink.closest("a")).toHaveAttribute("href", "/login");
  });

  test("form has proper accessibility attributes", () => {
    render(<ForgotPasswordPage />);

    const emailInput = screen.getByLabelText("Email Address");
    const submitButton = screen.getByRole("button", {
      name: "Send Reset Link",
    });

    expect(emailInput).toHaveAttribute("id", "email");
    expect(emailInput).toHaveAttribute("name", "email");
    expect(emailInput).toHaveAttribute("autoComplete", "email");

    expect(submitButton).toHaveAttribute("type", "submit");
  });

  test("page layout and styling structure is correct", () => {
    render(<ForgotPasswordPage />);

    // Check main containers exist
    expect(
      screen.getByText("Forgot your password?").closest(".text-center")
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText("Email Address").closest(".bg-white")
    ).toBeInTheDocument();
  });
});
