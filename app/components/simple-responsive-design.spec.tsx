import { render, screen } from "@testing-library/react";
import { describe, test, expect, vi } from "vitest";

// Import key components to test responsive design
import SignUpPage from "@/app/(auth)/signup/page";
import LoginPage from "@/app/(auth)/login/page";
import FileUpload from "@/app/components/file-upload";

// Mock dependencies
vi.mock("@/lib/supabase-client", () => ({
  uploadFile: vi.fn().mockResolvedValue({ success: true }),
}));

vi.mock("@/lib/auth-context", () => ({
  useAuth: () => ({
    signIn: vi.fn(),
    signUp: vi.fn(),
    profile: { first_name: "John", last_name: "Doe", role: "user" },
  }),
}));

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
  usePathname: () => "/user-dashboard",
}));

describe("Core Responsive Design Features", () => {
  describe("Authentication Pages - Mobile Layout", () => {
    test("signup page uses responsive container structure", () => {
      render(<SignUpPage />);

      // Main container should be responsive with proper breakpoint classes
      const mainContainer = screen
        .getByText("Create your account")
        .closest(".min-h-screen");
      expect(mainContainer).toHaveClass(
        "min-h-screen",
        "bg-gray-50",
        "flex",
        "flex-col",
        "justify-center",
        "py-12",
        "sm:px-6",
        "lg:px-8"
      );
    });

    test("login page uses responsive form card structure", () => {
      render(<LoginPage />);

      // Form card should have responsive padding
      const formCard = screen
        .getByLabelText("Email Address")
        .closest(".bg-white");
      expect(formCard).toHaveClass("bg-white", "py-8", "px-4", "sm:px-10");
    });

    test("form inputs are mobile-optimized with full width", () => {
      render(<SignUpPage />);

      // All inputs should be full width for mobile
      const emailInput = screen.getByLabelText("Email Address");
      expect(emailInput).toHaveClass("block", "w-full", "px-3", "py-2");

      const passwordInput = screen.getByLabelText("Password");
      expect(passwordInput).toHaveClass("block", "w-full", "px-3", "py-2");
    });

    test("buttons are touch-friendly with adequate sizing", () => {
      render(<LoginPage />);

      // Submit button should be full width with proper padding
      const submitButton = screen.getByRole("button", { name: "Sign In" });
      expect(submitButton).toHaveClass(
        "w-full",
        "flex",
        "justify-center",
        "py-2",
        "px-4"
      );
    });
  });

  describe("Form Structure and Spacing", () => {
    test("forms use consistent spacing between elements", () => {
      render(<SignUpPage />);

      // Form should have proper spacing between elements
      const form = screen.getByLabelText("Email Address").closest("form");
      expect(form).toHaveClass("space-y-6");
    });

    test("input labels and fields have proper structure", () => {
      render(<LoginPage />);

      // Labels should have proper classes for mobile readability
      const emailLabel = screen.getByText("Email Address");
      expect(emailLabel).toHaveClass(
        "block",
        "text-sm",
        "font-medium",
        "text-gray-700"
      );

      // Input wrapper should have mt-1 for proper spacing
      const inputWrapper = screen
        .getByLabelText("Email Address")
        .closest(".mt-1");
      expect(inputWrapper).toBeTruthy();
    });
  });

  describe("Responsive Grid Layout", () => {
    test("signup form uses responsive grid for name fields", () => {
      render(<SignUpPage />);

      // Name fields should use responsive grid
      const nameGrid = screen.getByLabelText("First Name").closest(".grid");
      expect(nameGrid).toHaveClass("grid", "grid-cols-2", "gap-4");
    });
  });

  describe("Component Upload - Mobile Friendly", () => {
    const mockOnFilesUploaded = vi.fn();

    test("file upload component has mobile-optimized layout", () => {
      render(<FileUpload onFilesUploaded={mockOnFilesUploaded} />);

      // Upload area parent should have proper responsive structure
      const uploadText = screen.getByText(
        "Drop CSV files here or click to browse"
      );
      expect(uploadText).toHaveClass("text-lg", "font-medium", "text-gray-900");

      // Main container should be responsive
      const mainContainer = uploadText.closest(".space-y-4");
      expect(mainContainer).toHaveClass("space-y-4");
    });

    test("upload button has proper touch target size", () => {
      render(<FileUpload onFilesUploaded={mockOnFilesUploaded} />);

      // Upload button should have adequate padding for touch
      const uploadButton = screen.getByRole("button", { name: "Choose Files" });
      expect(uploadButton).toHaveClass("px-4", "py-2", "text-sm");
    });

    test("file restrictions are clearly displayed for mobile", () => {
      render(<FileUpload onFilesUploaded={mockOnFilesUploaded} />);

      // File restrictions should be visible and readable - check parent container
      const restrictionContainer = screen
        .getByText("• Only CSV files are accepted")
        .closest("div");
      expect(restrictionContainer).toHaveClass(
        "text-xs",
        "text-gray-500",
        "space-y-1"
      );

      // Individual restrictions should be present
      expect(
        screen.getByText("• Only CSV files are accepted")
      ).toBeInTheDocument();
      expect(screen.getByText("• Maximum file size: 50MB")).toBeInTheDocument();
      expect(screen.getByText("• Maximum files: 10")).toBeInTheDocument();
    });
  });

  describe("Typography - Mobile Readability", () => {
    test("headings use appropriate sizes for mobile", () => {
      render(<SignUpPage />);

      // Main heading should be readable on mobile
      const mainHeading = screen.getByText("Create your account");
      expect(mainHeading).toHaveClass("text-3xl", "font-bold", "text-gray-900");

      // Subtitle should be appropriately sized
      const subtitle = screen.getByText(
        "Join the largest directory of scratch & dent appliance stores"
      );
      expect(subtitle).toHaveClass("text-sm", "text-gray-600");
    });

    test("form labels are readable on mobile screens", () => {
      render(<LoginPage />);

      // Labels should be clear and well-sized
      const labels = ["Email Address", "Password"];
      labels.forEach((labelText) => {
        const label = screen.getByText(labelText);
        expect(label).toHaveClass("text-sm", "font-medium", "text-gray-700");
      });
    });
  });

  describe("Responsive Utility Classes Usage", () => {
    test("components properly use responsive breakpoint classes", () => {
      render(<LoginPage />);

      // Check for responsive padding usage
      const formContainer = screen
        .getByText("Sign in to your account")
        .closest(".sm\\:mx-auto");
      expect(formContainer?.classList.toString()).toMatch(/sm:mx-auto/);
      expect(formContainer?.classList.toString()).toMatch(/sm:w-full/);
      expect(formContainer?.classList.toString()).toMatch(/sm:max-w-md/);
    });

    test("responsive padding classes are used correctly", () => {
      render(<LoginPage />);

      // Main container should use responsive padding
      const mainContainer = screen
        .getByText("Sign in to your account")
        .closest(".min-h-screen");
      expect(mainContainer).toHaveClass("py-12", "sm:px-6", "lg:px-8");
    });
  });

  describe("Mobile Touch Targets", () => {
    test("interactive elements meet minimum size requirements", () => {
      render(<SignUpPage />);

      // All input fields should be properly sized
      const inputs = screen.getAllByRole("textbox");
      inputs.forEach((input) => {
        expect(input).toHaveClass("py-2"); // Adequate vertical padding
      });

      // Submit button should have proper dimensions
      const submitButton = screen.getByRole("button");
      expect(submitButton).toHaveClass("py-2", "px-4"); // Adequate touch target
    });

    test("form elements avoid being too small for mobile interaction", () => {
      render(<LoginPage />);

      // Password input should be adequately sized
      const passwordInput = screen.getByLabelText("Password");
      expect(passwordInput).toHaveClass("px-3", "py-2");

      // Links should be properly styled - check that link exists and is interactive
      const forgotLink = screen.getByText("Forgot your password?");
      expect(forgotLink).toBeInTheDocument();
      expect(forgotLink.closest("a")).toHaveAttribute(
        "href",
        "/forgot-password"
      );
    });
  });

  describe("Mobile Layout Prevention of Horizontal Scrolling", () => {
    test("form components use full available width properly", () => {
      render(<SignUpPage />);

      // All form inputs should use full width to prevent overflow
      const allInputs = screen.getAllByRole("textbox");
      allInputs.forEach((input) => {
        expect(input).toHaveClass("w-full");
      });

      // Buttons should also use full width
      const button = screen.getByRole("button");
      expect(button).toHaveClass("w-full");
    });

    test("containers have proper max-width constraints", () => {
      render(<LoginPage />);

      // Form container should be constrained but responsive
      const formContainer = screen
        .getByText("Sign in to your account")
        .closest(".sm\\:max-w-md");
      expect(formContainer?.classList.toString()).toMatch(/sm:max-w-md/);
    });
  });
});
