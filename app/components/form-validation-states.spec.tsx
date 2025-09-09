import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, test, expect, vi } from "vitest";

// Import all form components
import SignUpPage from "@/app/(auth)/signup/page";
import LoginPage from "@/app/(auth)/login/page";
import ForgotPasswordPage from "@/app/(auth)/forgot-password/page";
import ResetPasswordPage from "@/app/(auth)/reset-password/page";

// Mock auth functions
vi.mock("@/lib/supabase-client", () => ({
  signUp: vi.fn(),
  resetPassword: vi.fn(),
  updatePassword: vi.fn(),
}));

// Mock auth context
vi.mock("@/lib/auth-context", () => ({
  useAuth: () => ({
    signIn: vi.fn(),
    signUp: vi.fn(),
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
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

describe("Form Validation and Error States", () => {
  const user = userEvent.setup();

  describe("HTML5 Form Validation Attributes", () => {
    test("signup form has correct validation attributes", () => {
      render(<SignUpPage />);

      // Email field validation
      const emailInput = screen.getByLabelText("Email Address");
      expect(emailInput).toHaveAttribute("type", "email");
      expect(emailInput).toHaveAttribute("required");
      expect(emailInput).toHaveAttribute("autoComplete", "email");

      // Password field validation
      const passwordInput = screen.getByLabelText("Password");
      expect(passwordInput).toHaveAttribute("type", "password");
      expect(passwordInput).toHaveAttribute("required");
      expect(passwordInput).toHaveAttribute("autoComplete", "new-password");

      // Name fields validation
      const firstNameInput = screen.getByLabelText("First Name");
      expect(firstNameInput).toHaveAttribute("type", "text");
      expect(firstNameInput).toHaveAttribute("required");
      expect(firstNameInput).toHaveAttribute("autoComplete", "given-name");

      const lastNameInput = screen.getByLabelText("Last Name");
      expect(lastNameInput).toHaveAttribute("type", "text");
      expect(lastNameInput).toHaveAttribute("required");
      expect(lastNameInput).toHaveAttribute("autoComplete", "family-name");

      // Phone field validation (optional)
      const phoneInput = screen.getByLabelText("Phone Number (Optional)");
      expect(phoneInput).toHaveAttribute("type", "tel");
      expect(phoneInput).not.toHaveAttribute("required");
      expect(phoneInput).toHaveAttribute("autoComplete", "tel");

      // Checkbox validation (optional)
      const businessCheckbox = screen.getByLabelText(
        "I own a scratch & dent appliance business"
      );
      expect(businessCheckbox).toHaveAttribute("type", "checkbox");
      expect(businessCheckbox).not.toHaveAttribute("required");
    });

    test("login form has correct validation attributes", () => {
      render(<LoginPage />);

      const emailInput = screen.getByLabelText("Email Address");
      expect(emailInput).toHaveAttribute("type", "email");
      expect(emailInput).toHaveAttribute("required");
      expect(emailInput).toHaveAttribute("autoComplete", "email");

      const passwordInput = screen.getByLabelText("Password");
      expect(passwordInput).toHaveAttribute("type", "password");
      expect(passwordInput).toHaveAttribute("required");
      expect(passwordInput).toHaveAttribute("autoComplete", "current-password");
    });

    test("forgot password form has correct validation attributes", () => {
      render(<ForgotPasswordPage />);

      const emailInput = screen.getByLabelText("Email Address");
      expect(emailInput).toHaveAttribute("type", "email");
      expect(emailInput).toHaveAttribute("required");
      expect(emailInput).toHaveAttribute("autoComplete", "email");
    });

    test("reset password form has correct validation attributes", () => {
      render(<ResetPasswordPage />);

      const passwordInput = screen.getByLabelText("New Password");
      expect(passwordInput).toHaveAttribute("type", "password");
      expect(passwordInput).toHaveAttribute("required");

      const confirmPasswordInput = screen.getByLabelText(
        "Confirm New Password"
      );
      expect(confirmPasswordInput).toHaveAttribute("type", "password");
      expect(confirmPasswordInput).toHaveAttribute("required");
    });
  });

  describe("Error State Display and Styling", () => {
    test("signup form displays error with correct styling", async () => {
      const mockSignUp = vi.fn().mockResolvedValue({
        success: false,
        error: "Email already exists",
      });

      vi.doMock("@/lib/auth-context", () => ({
        useAuth: () => ({ signUp: mockSignUp }),
      }));

      render(<SignUpPage />);

      // Fill form and submit to trigger error
      await user.type(
        screen.getByLabelText("Email Address"),
        "test@example.com"
      );
      await user.type(screen.getByLabelText("Password"), "password123");
      await user.type(screen.getByLabelText("First Name"), "John");
      await user.type(screen.getByLabelText("Last Name"), "Doe");

      await user.click(screen.getByRole("button", { name: "Sign Up" }));

      // Wait for error to appear
      await waitFor(() => {
        expect(screen.getByText("Email already exists")).toBeInTheDocument();
      });

      // Check error styling
      const errorContainer = screen
        .getByText("Email already exists")
        .closest(".bg-red-50");
      expect(errorContainer).toHaveClass(
        "bg-red-50",
        "border",
        "border-red-200",
        "rounded-md",
        "p-4"
      );

      // Check error icon
      expect(screen.getByText("⚠️")).toBeInTheDocument();

      // Check error text styling
      const errorText = screen.getByText("Email already exists");
      expect(errorText).toHaveClass("text-sm", "text-red-800");
    });

    test("login form displays error with correct styling", async () => {
      const mockSignIn = vi.fn().mockResolvedValue({
        success: false,
        error: "Invalid credentials",
      });

      vi.doMock("@/lib/auth-context", () => ({
        useAuth: () => ({ signIn: mockSignIn }),
      }));

      render(<LoginPage />);

      await user.type(
        screen.getByLabelText("Email Address"),
        "wrong@example.com"
      );
      await user.type(screen.getByLabelText("Password"), "wrongpassword");
      await user.click(screen.getByRole("button", { name: "Sign In" }));

      await waitFor(() => {
        expect(screen.getByText("Invalid credentials")).toBeInTheDocument();
      });

      // Check error structure matches signup
      const errorContainer = screen
        .getByText("Invalid credentials")
        .closest(".bg-red-50");
      expect(errorContainer).toHaveClass(
        "bg-red-50",
        "border",
        "border-red-200",
        "rounded-md",
        "p-4"
      );
    });
  });

  describe("Form Field Disabled States During Loading", () => {
    test("signup form disables all fields during submission", async () => {
      const mockSignUp = vi
        .fn()
        .mockImplementation(
          () =>
            new Promise((resolve) =>
              setTimeout(() => resolve({ success: true }), 100)
            )
        );

      vi.doMock("@/lib/auth-context", () => ({
        useAuth: () => ({ signUp: mockSignUp }),
      }));

      render(<SignUpPage />);

      // Fill form
      const emailInput = screen.getByLabelText("Email Address");
      const passwordInput = screen.getByLabelText("Password");
      const firstNameInput = screen.getByLabelText("First Name");
      const lastNameInput = screen.getByLabelText("Last Name");
      const phoneInput = screen.getByLabelText("Phone Number (Optional)");
      const businessCheckbox = screen.getByLabelText(
        "I own a scratch & dent appliance business"
      );
      const submitButton = screen.getByRole("button", { name: "Sign Up" });

      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "password123");
      await user.type(firstNameInput, "John");
      await user.type(lastNameInput, "Doe");

      // Submit form to trigger loading state
      await user.click(submitButton);

      // Check all fields are disabled
      await waitFor(() => {
        expect(emailInput).toBeDisabled();
        expect(passwordInput).toBeDisabled();
        expect(firstNameInput).toBeDisabled();
        expect(lastNameInput).toBeDisabled();
        expect(phoneInput).toBeDisabled();
        expect(businessCheckbox).toBeDisabled();
        expect(submitButton).toBeDisabled();
      });

      // Check loading button text
      expect(
        screen.getByRole("button", { name: "Creating account..." })
      ).toBeInTheDocument();
    });

    test("login form disables fields during submission", async () => {
      const mockSignIn = vi
        .fn()
        .mockImplementation(
          () =>
            new Promise((resolve) =>
              setTimeout(() => resolve({ success: true }), 100)
            )
        );

      vi.doMock("@/lib/auth-context", () => ({
        useAuth: () => ({ signIn: mockSignIn }),
      }));

      render(<LoginPage />);

      const emailInput = screen.getByLabelText("Email Address");
      const passwordInput = screen.getByLabelText("Password");
      const submitButton = screen.getByRole("button", { name: "Sign In" });

      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "password123");
      await user.click(submitButton);

      await waitFor(() => {
        expect(emailInput).toBeDisabled();
        expect(passwordInput).toBeDisabled();
        expect(submitButton).toBeDisabled();
      });

      expect(
        screen.getByRole("button", { name: "Signing in..." })
      ).toBeInTheDocument();
    });
  });

  describe("Form Placeholder Text and Labels", () => {
    test("all forms have appropriate placeholder text", () => {
      // Signup form placeholders
      render(<SignUpPage />);
      expect(
        screen.getByPlaceholderText("you@example.com")
      ).toBeInTheDocument();
      expect(screen.getByPlaceholderText("••••••••")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("John")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("Doe")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("(555) 123-4567")).toBeInTheDocument();

      // Reset password placeholders
      const { unmount } = render(<ResetPasswordPage />);
      expect(screen.getAllByPlaceholderText("••••••••")).toHaveLength(2); // Two password fields
      unmount();

      // Login and forgot password placeholders
      render(<LoginPage />);
      expect(
        screen.getByPlaceholderText("you@example.com")
      ).toBeInTheDocument();
    });

    test("all form labels are properly associated with inputs", () => {
      render(<SignUpPage />);

      // Check label-input associations
      expect(screen.getByLabelText("Email Address")).toHaveAttribute(
        "id",
        "email"
      );
      expect(screen.getByLabelText("Password")).toHaveAttribute(
        "id",
        "password"
      );
      expect(screen.getByLabelText("First Name")).toHaveAttribute(
        "id",
        "first_name"
      );
      expect(screen.getByLabelText("Last Name")).toHaveAttribute(
        "id",
        "last_name"
      );
      expect(screen.getByLabelText("Phone Number (Optional)")).toHaveAttribute(
        "id",
        "phone_number"
      );
      expect(
        screen.getByLabelText("I own a scratch & dent appliance business")
      ).toHaveAttribute("id", "owns_business");
    });
  });

  describe("Form Accessibility and ARIA Attributes", () => {
    test("form buttons have correct type attributes", () => {
      render(<SignUpPage />);

      const submitButton = screen.getByRole("button", { name: "Sign Up" });
      expect(submitButton).toHaveAttribute("type", "submit");

      render(<LoginPage />);
      const loginButton = screen.getByRole("button", { name: "Sign In" });
      expect(loginButton).toHaveAttribute("type", "submit");
    });

    test("disabled form elements have proper styling classes", () => {
      render(<SignUpPage />);

      const emailInput = screen.getByLabelText("Email Address");
      expect(emailInput).toHaveClass(
        "disabled:opacity-50",
        "disabled:cursor-not-allowed"
      );

      const submitButton = screen.getByRole("button", { name: "Sign Up" });
      expect(submitButton).toHaveClass(
        "disabled:opacity-50",
        "disabled:cursor-not-allowed"
      );
    });

    test("form inputs have focus and hover states", () => {
      render(<LoginPage />);

      const emailInput = screen.getByLabelText("Email Address");
      expect(emailInput).toHaveClass(
        "focus:outline-none",
        "focus:ring-blue-500",
        "focus:border-blue-500"
      );

      const submitButton = screen.getByRole("button", { name: "Sign In" });
      expect(submitButton).toHaveClass(
        "hover:bg-blue-700",
        "focus:outline-none",
        "focus:ring-2",
        "focus:ring-offset-2",
        "focus:ring-blue-500"
      );
    });
  });

  describe("Form Error Clearing Behavior", () => {
    test("errors are cleared on subsequent form submissions", async () => {
      const mockSignIn = vi
        .fn()
        .mockResolvedValueOnce({ success: false, error: "Invalid credentials" })
        .mockResolvedValueOnce({ success: true });

      vi.doMock("@/lib/auth-context", () => ({
        useAuth: () => ({ signIn: mockSignIn }),
      }));

      render(<LoginPage />);

      // First failed submission
      await user.type(
        screen.getByLabelText("Email Address"),
        "test@example.com"
      );
      await user.type(screen.getByLabelText("Password"), "wrongpassword");
      await user.click(screen.getByRole("button", { name: "Sign In" }));

      // Wait for error
      await waitFor(() => {
        expect(screen.getByText("Invalid credentials")).toBeInTheDocument();
      });

      // Second successful submission
      await user.clear(screen.getByLabelText("Password"));
      await user.type(screen.getByLabelText("Password"), "correctpassword");
      await user.click(screen.getByRole("button", { name: "Sign In" }));

      // Error should be cleared
      await waitFor(() => {
        expect(
          screen.queryByText("Invalid credentials")
        ).not.toBeInTheDocument();
      });
    });
  });

  describe("Form Input Styling and States", () => {
    test("form inputs have consistent styling across all forms", () => {
      const expectedInputClasses = [
        "appearance-none",
        "block",
        "w-full",
        "px-3",
        "py-2",
        "border",
        "border-gray-300",
        "rounded-md",
        "placeholder-gray-400",
        "focus:outline-none",
        "focus:ring-blue-500",
        "focus:border-blue-500",
        "disabled:opacity-50",
        "disabled:cursor-not-allowed",
      ];

      // Check signup form
      render(<SignUpPage />);
      const signupEmailInput = screen.getByLabelText("Email Address");
      expectedInputClasses.forEach((className) => {
        expect(signupEmailInput).toHaveClass(className);
      });

      // Check login form
      const { unmount } = render(<LoginPage />);
      const loginEmailInput = screen.getByLabelText("Email Address");
      expectedInputClasses.forEach((className) => {
        expect(loginEmailInput).toHaveClass(className);
      });
      unmount();

      // Check forgot password form
      render(<ForgotPasswordPage />);
      const forgotEmailInput = screen.getByLabelText("Email Address");
      expectedInputClasses.forEach((className) => {
        expect(forgotEmailInput).toHaveClass(className);
      });
    });

    test("form buttons have consistent styling across all forms", () => {
      const expectedButtonClasses = [
        "w-full",
        "flex",
        "justify-center",
        "py-2",
        "px-4",
        "border",
        "border-transparent",
        "rounded-md",
        "shadow-sm",
        "text-sm",
        "font-medium",
        "text-white",
        "bg-blue-600",
        "hover:bg-blue-700",
        "focus:outline-none",
        "focus:ring-2",
        "focus:ring-offset-2",
        "focus:ring-blue-500",
        "disabled:opacity-50",
        "disabled:cursor-not-allowed",
      ];

      render(<SignUpPage />);
      const signupButton = screen.getByRole("button", { name: "Sign Up" });
      expectedButtonClasses.forEach((className) => {
        expect(signupButton).toHaveClass(className);
      });
    });
  });
});
