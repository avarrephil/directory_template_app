import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, test, expect, vi, beforeEach } from "vitest";
import SignUpPage from "./page";

// Mock the auth context
const mockSignUp = vi.fn();
vi.mock("@/lib/auth-context", () => ({
  useAuth: () => ({
    signUp: mockSignUp,
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

describe("SignUpPage complete user signup flow", () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders all required form fields with proper labels and placeholders", () => {
    render(<SignUpPage />);

    // Check all form fields are present
    expect(screen.getByLabelText("Email Address")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("you@example.com")).toBeInTheDocument();

    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("••••••••")).toBeInTheDocument();

    expect(screen.getByLabelText("First Name")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("John")).toBeInTheDocument();

    expect(screen.getByLabelText("Last Name")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Doe")).toBeInTheDocument();

    expect(
      screen.getByLabelText("Phone Number (Optional)")
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText("(555) 123-4567")).toBeInTheDocument();

    expect(
      screen.getByLabelText("I own a scratch & dent appliance business")
    ).toBeInTheDocument();

    expect(screen.getByRole("button", { name: "Sign Up" })).toBeInTheDocument();
  });

  test("validates required fields and shows proper field types", () => {
    render(<SignUpPage />);

    const emailInput = screen.getByLabelText("Email Address");
    const passwordInput = screen.getByLabelText("Password");
    const firstNameInput = screen.getByLabelText("First Name");
    const lastNameInput = screen.getByLabelText("Last Name");
    const phoneInput = screen.getByLabelText("Phone Number (Optional)");
    const businessCheckbox = screen.getByLabelText(
      "I own a scratch & dent appliance business"
    );

    // Check field types
    expect(emailInput).toHaveAttribute("type", "email");
    expect(passwordInput).toHaveAttribute("type", "password");
    expect(firstNameInput).toHaveAttribute("type", "text");
    expect(lastNameInput).toHaveAttribute("type", "text");
    expect(phoneInput).toHaveAttribute("type", "tel");
    expect(businessCheckbox).toHaveAttribute("type", "checkbox");

    // Check required attributes
    expect(emailInput).toHaveAttribute("required");
    expect(passwordInput).toHaveAttribute("required");
    expect(firstNameInput).toHaveAttribute("required");
    expect(lastNameInput).toHaveAttribute("required");
    expect(phoneInput).not.toHaveAttribute("required");
    expect(businessCheckbox).not.toHaveAttribute("required");
  });

  test("submits form with complete user data including all fields", async () => {
    mockSignUp.mockResolvedValue({ success: true });
    render(<SignUpPage />);

    const testData = {
      email: "test@example.com",
      password: "securePassword123",
      first_name: "John",
      last_name: "Doe",
      phone_number: "555-123-4567",
      owns_business: true,
    };

    // Fill in all form fields
    await user.type(screen.getByLabelText("Email Address"), testData.email);
    await user.type(screen.getByLabelText("Password"), testData.password);
    await user.type(screen.getByLabelText("First Name"), testData.first_name);
    await user.type(screen.getByLabelText("Last Name"), testData.last_name);
    await user.type(
      screen.getByLabelText("Phone Number (Optional)"),
      testData.phone_number
    );

    // Check the business owner checkbox
    const businessCheckbox = screen.getByLabelText(
      "I own a scratch & dent appliance business"
    );
    await user.click(businessCheckbox);

    // Submit the form
    const submitButton = screen.getByRole("button", { name: "Sign Up" });
    await user.click(submitButton);

    // Wait for the signUp function to be called
    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledWith(testData);
    });
  });

  test("submits form with minimal required data only", async () => {
    mockSignUp.mockResolvedValue({ success: true });
    render(<SignUpPage />);

    const minimalData = {
      email: "minimal@test.com",
      password: "password123",
      first_name: "Jane",
      last_name: "Smith",
      phone_number: "",
      owns_business: false,
    };

    // Fill in only required fields
    await user.type(screen.getByLabelText("Email Address"), minimalData.email);
    await user.type(screen.getByLabelText("Password"), minimalData.password);
    await user.type(
      screen.getByLabelText("First Name"),
      minimalData.first_name
    );
    await user.type(screen.getByLabelText("Last Name"), minimalData.last_name);

    // Leave phone number empty and checkbox unchecked
    const submitButton = screen.getByRole("button", { name: "Sign Up" });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledWith(minimalData);
    });
  });

  test("shows loading state during form submission", async () => {
    // Mock a delayed response
    mockSignUp.mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(() => resolve({ success: true }), 100)
        )
    );

    render(<SignUpPage />);

    // Fill in form
    await user.type(screen.getByLabelText("Email Address"), "test@example.com");
    await user.type(screen.getByLabelText("Password"), "password123");
    await user.type(screen.getByLabelText("First Name"), "John");
    await user.type(screen.getByLabelText("Last Name"), "Doe");

    const submitButton = screen.getByRole("button", { name: "Sign Up" });
    await user.click(submitButton);

    // Check loading state
    expect(
      screen.getByRole("button", { name: "Creating account..." })
    ).toBeInTheDocument();
    expect(screen.getByRole("button")).toBeDisabled();

    // Wait for loading to complete
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Sign Up" })
      ).toBeInTheDocument();
    });
  });

  test("displays error message on signup failure", async () => {
    const errorMessage = "Email already exists";
    mockSignUp.mockResolvedValue({ success: false, error: errorMessage });

    render(<SignUpPage />);

    // Fill in form
    await user.type(
      screen.getByLabelText("Email Address"),
      "existing@example.com"
    );
    await user.type(screen.getByLabelText("Password"), "password123");
    await user.type(screen.getByLabelText("First Name"), "John");
    await user.type(screen.getByLabelText("Last Name"), "Doe");

    await user.click(screen.getByRole("button", { name: "Sign Up" }));

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
      expect(screen.getByText("⚠️")).toBeInTheDocument();
    });
  });

  test("checkbox toggles correctly and updates form state", async () => {
    mockSignUp.mockResolvedValue({ success: true });
    render(<SignUpPage />);

    const businessCheckbox = screen.getByLabelText(
      "I own a scratch & dent appliance business"
    );

    // Initially unchecked
    expect(businessCheckbox).not.toBeChecked();

    // Click to check
    await user.click(businessCheckbox);
    expect(businessCheckbox).toBeChecked();

    // Click to uncheck
    await user.click(businessCheckbox);
    expect(businessCheckbox).not.toBeChecked();

    // Fill form and submit with checkbox checked
    await user.type(screen.getByLabelText("Email Address"), "test@example.com");
    await user.type(screen.getByLabelText("Password"), "password123");
    await user.type(screen.getByLabelText("First Name"), "John");
    await user.type(screen.getByLabelText("Last Name"), "Doe");
    await user.click(businessCheckbox); // Check it again

    await user.click(screen.getByRole("button", { name: "Sign Up" }));

    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
        first_name: "John",
        last_name: "Doe",
        phone_number: "",
        owns_business: true,
      });
    });
  });

  test("form inputs are disabled during loading", async () => {
    mockSignUp.mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(() => resolve({ success: true }), 100)
        )
    );

    render(<SignUpPage />);

    const emailInput = screen.getByLabelText("Email Address");
    const passwordInput = screen.getByLabelText("Password");
    const firstNameInput = screen.getByLabelText("First Name");
    const lastNameInput = screen.getByLabelText("Last Name");
    const phoneInput = screen.getByLabelText("Phone Number (Optional)");
    const businessCheckbox = screen.getByLabelText(
      "I own a scratch & dent appliance business"
    );

    // Fill in form
    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "password123");
    await user.type(firstNameInput, "John");
    await user.type(lastNameInput, "Doe");

    await user.click(screen.getByRole("button", { name: "Sign Up" }));

    // Check all inputs are disabled during loading
    expect(emailInput).toBeDisabled();
    expect(passwordInput).toBeDisabled();
    expect(firstNameInput).toBeDisabled();
    expect(lastNameInput).toBeDisabled();
    expect(phoneInput).toBeDisabled();
    expect(businessCheckbox).toBeDisabled();

    // Wait for loading to complete
    await waitFor(() => {
      expect(emailInput).not.toBeDisabled();
    });
  });

  test("includes link to login page", () => {
    render(<SignUpPage />);

    const loginLink = screen.getByText("Log in");
    expect(loginLink).toBeInTheDocument();
    expect(loginLink.closest("a")).toHaveAttribute("href", "/login");

    expect(screen.getByText("Already have an account?")).toBeInTheDocument();
  });
});
