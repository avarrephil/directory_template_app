import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, test, expect, vi, beforeEach } from "vitest";
import LoginPage from "./page";

// Mock the auth context for user role
const mockSignIn = vi.fn();
const mockUserProfile = {
  role: "user",
  first_name: "John",
  last_name: "Doe",
  phone_number: "555-123-4567",
  owns_business: true,
};

vi.mock("@/lib/auth-context", () => ({
  useAuth: () => ({
    signIn: mockSignIn,
    profile: mockUserProfile,
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

describe("User Login Flow and Dashboard Access", () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("submits user login credentials correctly", async () => {
    mockSignIn.mockResolvedValue({ success: true });
    render(<LoginPage />);

    const userCredentials = {
      email: "user@example.com",
      password: "userPassword123",
    };

    // Fill in user credentials
    await user.type(
      screen.getByLabelText("Email Address"),
      userCredentials.email
    );
    await user.type(
      screen.getByLabelText("Password"),
      userCredentials.password
    );

    // Submit the form
    const submitButton = screen.getByRole("button", { name: "Sign In" });
    await user.click(submitButton);

    // Verify signIn was called with correct credentials
    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith(
        userCredentials.email,
        userCredentials.password
      );
    });
  });

  test("handles user login with business owner account", async () => {
    mockSignIn.mockResolvedValue({ success: true });
    render(<LoginPage />);

    const businessOwnerCredentials = {
      email: "business.owner@example.com",
      password: "businessPassword123",
    };

    await user.type(
      screen.getByLabelText("Email Address"),
      businessOwnerCredentials.email
    );
    await user.type(
      screen.getByLabelText("Password"),
      businessOwnerCredentials.password
    );

    await user.click(screen.getByRole("button", { name: "Sign In" }));

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith(
        businessOwnerCredentials.email,
        businessOwnerCredentials.password
      );
    });
  });

  test("shows appropriate error for user login failures", async () => {
    const errorMessage = "Invalid user credentials";
    mockSignIn.mockResolvedValue({ success: false, error: errorMessage });

    render(<LoginPage />);

    await user.type(
      screen.getByLabelText("Email Address"),
      "wrong-user@example.com"
    );
    await user.type(screen.getByLabelText("Password"), "wrongPassword");

    await user.click(screen.getByRole("button", { name: "Sign In" }));

    // Check error message is displayed
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
      expect(screen.getByText("⚠️")).toBeInTheDocument();
    });
  });

  test("handles user login with different email formats", async () => {
    mockSignIn.mockResolvedValue({ success: true });
    render(<LoginPage />);

    // Test with various valid email formats users might have
    const emailFormats = [
      "user@company.com",
      "john.doe@business.co.uk",
      "user+test@example.org",
      "user123@domain.info",
    ];

    for (const email of emailFormats) {
      // Clear previous inputs
      await user.clear(screen.getByLabelText("Email Address"));
      await user.clear(screen.getByLabelText("Password"));

      await user.type(screen.getByLabelText("Email Address"), email);
      await user.type(screen.getByLabelText("Password"), "password123");

      await user.click(screen.getByRole("button", { name: "Sign In" }));

      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledWith(email, "password123");
      });

      vi.clearAllMocks();
    }
  });

  test("prevents submission of empty user credentials", async () => {
    render(<LoginPage />);

    // Try to submit without filling any fields
    const submitButton = screen.getByRole("button", { name: "Sign In" });
    await user.click(submitButton);

    // HTML5 validation should prevent submission
    expect(mockSignIn).not.toHaveBeenCalled();
  });

  test("prevents submission with only email filled", async () => {
    render(<LoginPage />);

    // Fill only email, leave password empty
    await user.type(screen.getByLabelText("Email Address"), "user@example.com");

    await user.click(screen.getByRole("button", { name: "Sign In" }));

    // Should not submit due to required password field
    expect(mockSignIn).not.toHaveBeenCalled();
  });

  test("prevents submission with only password filled", async () => {
    render(<LoginPage />);

    // Fill only password, leave email empty
    await user.type(screen.getByLabelText("Password"), "password123");

    await user.click(screen.getByRole("button", { name: "Sign In" }));

    // Should not submit due to required email field
    expect(mockSignIn).not.toHaveBeenCalled();
  });

  test("clears error state on new login attempt", async () => {
    // First attempt fails
    mockSignIn
      .mockResolvedValueOnce({ success: false, error: "Login failed" })
      // Second attempt succeeds
      .mockResolvedValueOnce({ success: true });

    render(<LoginPage />);

    // First failed attempt
    await user.type(screen.getByLabelText("Email Address"), "user@example.com");
    await user.type(screen.getByLabelText("Password"), "wrongPassword");
    await user.click(screen.getByRole("button", { name: "Sign In" }));

    await waitFor(() => {
      expect(screen.getByText("Login failed")).toBeInTheDocument();
    });

    // Correct the password and try again
    await user.clear(screen.getByLabelText("Password"));
    await user.type(screen.getByLabelText("Password"), "correctPassword");
    await user.click(screen.getByRole("button", { name: "Sign In" }));

    // Error should be cleared
    await waitFor(() => {
      expect(screen.queryByText("Login failed")).not.toBeInTheDocument();
    });
  });
});
