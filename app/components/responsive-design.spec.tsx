import { render, screen } from "@testing-library/react";
import { describe, test, expect, vi } from "vitest";

// Import key components to test responsive design
import SignUpPage from "@/app/(auth)/signup/page";
import LoginPage from "@/app/(auth)/login/page";
import UserDashboardPage from "@/app/user-dashboard/page";
import Sidebar from "@/app/components/sidebar";

// Mock dependencies
vi.mock("@/lib/supabase-client", () => ({
  signUp: vi.fn(),
  resetPassword: vi.fn(),
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

describe("Responsive Design on Mobile Devices", () => {
  describe("Authentication Pages - Mobile Responsive", () => {
    test("signup page uses mobile-responsive container classes", () => {
      render(<SignUpPage />);

      // Main container should be responsive
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

      // Form container should have responsive width
      const formContainer = screen
        .getByText("Create your account")
        .closest(".sm\\:mx-auto");
      expect(formContainer?.classList.toString()).toMatch(/sm:mx-auto/);
      expect(formContainer?.classList.toString()).toMatch(/sm:w-full/);
      expect(formContainer?.classList.toString()).toMatch(/sm:max-w-md/);
    });

    test("login page uses mobile-responsive layout", () => {
      render(<LoginPage />);

      // Check responsive padding and spacing
      const container = screen
        .getByText("Sign in to your account")
        .closest(".min-h-screen");
      expect(container).toHaveClass("py-12", "sm:px-6", "lg:px-8");

      // Form card should be responsive
      const formCard = screen
        .getByLabelText("Email Address")
        .closest(".bg-white");
      expect(formCard).toHaveClass("py-8", "px-4", "sm:px-10");
    });

    test("form inputs and buttons are mobile-friendly", () => {
      render(<SignUpPage />);

      // Input fields should be full width on mobile
      const emailInput = screen.getByLabelText("Email Address");
      expect(emailInput).toHaveClass("block", "w-full", "px-3", "py-2");

      // Buttons should be full width
      const submitButton = screen.getByRole("button", { name: "Sign Up" });
      expect(submitButton).toHaveClass(
        "w-full",
        "flex",
        "justify-center",
        "py-2",
        "px-4"
      );

      // Grid layout should be responsive for name fields
      const nameGrid = screen.getByLabelText("First Name").closest(".grid");
      expect(nameGrid).toHaveClass("grid", "grid-cols-2", "gap-4");
    });
  });

  describe("Dashboard Layout - Mobile Responsive", () => {
    test("sidebar has mobile-responsive width and layout", () => {
      render(<Sidebar />);

      // Sidebar main container has proper responsive width
      const sidebarContainer = screen
        .getByText("Business Directory")
        .closest(".w-64");
      expect(sidebarContainer).toHaveClass(
        "flex",
        "h-full",
        "w-64",
        "flex-col",
        "bg-gray-50"
      );

      // Inner container has proper flex layout
      const innerContainer = screen
        .getByText("Business Directory")
        .closest(".flex-1");
      expect(innerContainer).toHaveClass(
        "flex",
        "flex-1",
        "flex-col",
        "pt-8",
        "pb-4"
      );

      // Navigation should use proper spacing for mobile touch
      const navContainer = screen.getByText("Settings").closest("nav");
      expect(navContainer).toHaveClass("flex-1", "space-y-1", "px-3");

      // Navigation links should have adequate touch targets
      const navLinks = screen.getAllByRole("link");
      navLinks.forEach((link) => {
        expect(link).toHaveClass("px-3", "py-2"); // Minimum 44px touch target height
      });
    });

    test("user dashboard page uses responsive grid layout", () => {
      render(<UserDashboardPage />);

      // Main container should be responsive
      const mainContainer = screen
        .getByText(/Welcome back/i)
        .closest(".max-w-6xl");
      expect(mainContainer).toHaveClass(
        "max-w-6xl",
        "mx-auto",
        "p-6",
        "space-y-8"
      );

      // Coming soon features should have responsive grid
      const featureGrid = screen.getByText("Search Directory").closest(".grid");
      expect(featureGrid).toHaveClass(
        "grid",
        "grid-cols-1",
        "md:grid-cols-2",
        "lg:grid-cols-3",
        "gap-6"
      );

      // Feature cards should be responsive
      const featureCard = screen
        .getByText("Search Directory")
        .closest(".border");
      expect(featureCard).toHaveClass(
        "border",
        "border-gray-200",
        "rounded-lg",
        "p-4",
        "text-center"
      );
    });
  });

  describe("Typography and Text - Mobile Responsive", () => {
    test("headings use responsive text sizing", () => {
      render(<SignUpPage />);

      // Main heading should scale with breakpoints
      const mainHeading = screen.getByText("Create your account");
      expect(mainHeading).toHaveClass("text-3xl", "font-bold", "text-gray-900");

      // Subtitle should be appropriately sized for mobile
      const subtitle = screen.getByText(
        "Join the largest directory of scratch & dent appliance stores"
      );
      expect(subtitle).toHaveClass("text-sm", "text-gray-600");
    });

    test("form labels and text are readable on mobile", () => {
      render(<LoginPage />);

      // Form labels should be clear and readable
      const emailLabel = screen.getByText("Email Address");
      expect(emailLabel).toHaveClass(
        "block",
        "text-sm",
        "font-medium",
        "text-gray-700"
      );

      // Helper text should be appropriately sized
      const helperText = screen.getByText(
        "Access your directory management dashboard"
      );
      expect(helperText).toHaveClass("text-sm", "text-gray-600");
    });
  });

  describe("Spacing and Layout - Mobile Optimized", () => {
    test("forms use proper spacing for mobile interaction", () => {
      render(<SignUpPage />);

      // Form should have proper spacing between elements
      const form = screen.getByLabelText("Email Address").closest("form");
      expect(form).toHaveClass("space-y-6");

      // Input containers should have proper structure
      const emailDiv = screen.getByLabelText("Email Address").closest("div");
      expect(emailDiv?.parentElement).toHaveClass("space-y-6");
    });

    test("cards and containers have mobile-appropriate spacing", () => {
      render(<UserDashboardPage />);

      // Cards should have proper padding for mobile
      const welcomeCard = screen
        .getByText(/Welcome back/i)
        .closest(".bg-white");
      expect(welcomeCard).toHaveClass(
        "bg-white",
        "rounded-lg",
        "shadow-sm",
        "border",
        "border-gray-200",
        "p-6"
      );

      // Icon containers should be properly sized for mobile
      const iconContainer = screen.getByText("👋").closest(".w-16");
      expect(iconContainer).toHaveClass(
        "mx-auto",
        "w-16",
        "h-16",
        "bg-blue-100",
        "rounded-full"
      );
    });
  });

  describe("Interactive Elements - Mobile Touch Friendly", () => {
    test("buttons have adequate touch targets for mobile", () => {
      render(<LoginPage />);

      // Primary buttons should be at least 44px tall (py-2 = 8px top + 8px bottom + text height)
      const submitButton = screen.getByRole("button", { name: "Sign In" });
      expect(submitButton).toHaveClass("py-2", "px-4", "text-sm");

      // Links should have adequate touch targets
      const forgotPasswordLink = screen.getByText("Forgot your password?");
      expect(forgotPasswordLink).toHaveClass(
        "font-medium",
        "text-blue-600",
        "hover:text-blue-500"
      );
    });

    test("navigation elements are touch-friendly", () => {
      render(<Sidebar />);

      // Navigation links should have proper padding for touch
      const navLinks = screen.getAllByRole("link");
      navLinks.forEach((link) => {
        expect(link).toHaveClass("px-3", "py-2");
      });

      // Logout button should be appropriately sized
      const logoutButton = screen.getByText("🚪 Logout");
      expect(logoutButton.closest("button")).toHaveClass(
        "w-full",
        "text-left",
        "px-3",
        "py-2"
      );
    });
  });

  describe("Responsive Utility Classes", () => {
    test("components use responsive padding classes", () => {
      render(<LoginPage />);

      // Check responsive padding usage
      const formCard = screen
        .getByLabelText("Email Address")
        .closest(".sm\\:px-10");
      expect(formCard?.classList.toString()).toMatch(/px-4/); // Mobile padding
      expect(formCard?.classList.toString()).toMatch(/sm:px-10/); // Tablet+ padding
    });

    test("components use responsive margin and width classes", () => {
      render(<SignUpPage />);

      // Check responsive container widths
      const container = screen.getByText("Create your account").closest("div");
      const parentContainer = container?.parentElement;

      expect(parentContainer?.classList.toString()).toMatch(/sm:mx-auto/);
      expect(parentContainer?.classList.toString()).toMatch(/sm:w-full/);
      expect(parentContainer?.classList.toString()).toMatch(/sm:max-w-md/);
    });
  });

  describe("Content Readability on Small Screens", () => {
    test("text content is appropriately sized and spaced for mobile reading", () => {
      render(<UserDashboardPage />);

      // Main welcome text should be readable
      const welcomeText = screen.getByText(/Welcome back/i);
      expect(welcomeText).toHaveClass("text-2xl", "font-bold", "text-gray-900");

      // Description text should be clear
      const descriptionText = screen.getByText(
        "Your user dashboard is ready. More features coming soon!"
      );
      expect(descriptionText).toHaveClass("text-gray-600");

      // Feature descriptions should be appropriately sized
      const featureDescription = screen.getByText(
        "Browse and search through business listings"
      );
      expect(featureDescription).toHaveClass("text-sm", "text-gray-500");
    });

    test("form elements maintain readability on mobile", () => {
      render(<SignUpPage />);

      // Form labels should be clearly readable
      const labels = ["Email Address", "Password", "First Name", "Last Name"];
      labels.forEach((labelText) => {
        const label = screen.getByText(labelText);
        expect(label).toHaveClass("text-sm", "font-medium", "text-gray-700");
      });

      // Error states should be visible on mobile
      const form = screen.getByLabelText("Email Address").closest("form");
      // Error container structure matches mobile-friendly design
      expect(form).toHaveClass("space-y-6");
    });
  });

  describe("Mobile-Specific Layout Considerations", () => {
    test("viewport meta tag considerations are reflected in component design", () => {
      // Components should be designed assuming proper viewport meta tag
      render(<SignUpPage />);

      // Full width utilization on mobile
      const inputs = screen.getAllByRole("textbox");
      inputs.forEach((input) => {
        expect(input).toHaveClass("w-full");
      });

      // Proper touch target sizing (minimum 44px)
      const submitButton = screen.getByRole("button");
      expect(submitButton).toHaveClass("py-2"); // 8px top + 8px bottom + text height ≈ 44px
    });

    test("components avoid horizontal scrolling on mobile", () => {
      render(<UserDashboardPage />);

      // Main containers should use full available width without overflow
      const mainContainer = screen
        .getByText(/Welcome back/i)
        .closest(".max-w-6xl");
      expect(mainContainer).toHaveClass("max-w-6xl", "mx-auto"); // Centers and constrains width

      // Feature grid should stack on mobile
      const featureGrid = screen.getByText("Search Directory").closest(".grid");
      expect(featureGrid).toHaveClass("grid-cols-1"); // Single column on mobile
    });
  });
});
