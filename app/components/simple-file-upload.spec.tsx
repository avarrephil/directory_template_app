import { render, screen } from "@testing-library/react";
import { describe, test, expect, vi } from "vitest";
import FileUpload from "./file-upload";

// Mock the uploadFile function
vi.mock("@/lib/supabase-client", () => ({
  uploadFile: vi.fn().mockResolvedValue({ success: true }),
}));

describe("File Upload Functionality - Core Features", () => {
  const mockOnFilesUploaded = vi.fn();

  test("renders file upload component with all admin features", () => {
    render(<FileUpload onFilesUploaded={mockOnFilesUploaded} />);

    // Main upload area
    expect(
      screen.getByText("Drop CSV files here or click to browse")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Maximum 10 files, 50MB per file")
    ).toBeInTheDocument();
    expect(screen.getByText("📁")).toBeInTheDocument();

    // Upload button
    expect(
      screen.getByRole("button", { name: "Choose Files" })
    ).toBeInTheDocument();

    // File restrictions info
    expect(
      screen.getByText("• Only CSV files are accepted")
    ).toBeInTheDocument();
    expect(screen.getByText("• Maximum file size: 50MB")).toBeInTheDocument();
    expect(screen.getByText("• Maximum files: 10")).toBeInTheDocument();
    expect(
      screen.getByText("• Files are uploaded to secure cloud storage")
    ).toBeInTheDocument();
  });

  test("file input has correct configuration for CSV uploads", () => {
    render(<FileUpload onFilesUploaded={mockOnFilesUploaded} />);

    // Find the hidden file input
    const fileInput = screen
      .getByRole("button")
      .parentElement?.querySelector('input[type="file"]') as HTMLInputElement;

    expect(fileInput).toBeInTheDocument();
    expect(fileInput.accept).toBe(".csv");
    expect(fileInput.multiple).toBe(true);
    expect(fileInput).toHaveClass(
      "opacity-0",
      "cursor-pointer",
      "disabled:cursor-not-allowed"
    );
  });

  test("upload button has correct styling and behavior", () => {
    render(<FileUpload onFilesUploaded={mockOnFilesUploaded} />);

    const uploadButton = screen.getByRole("button", { name: "Choose Files" });

    expect(uploadButton).toHaveAttribute("type", "button");
    expect(uploadButton).toHaveClass(
      "inline-flex",
      "items-center",
      "px-4",
      "py-2",
      "border",
      "border-gray-300",
      "shadow-sm",
      "text-sm",
      "font-medium",
      "rounded-md",
      "text-gray-700",
      "bg-white",
      "hover:bg-gray-50",
      "focus:outline-none",
      "focus:ring-2",
      "focus:ring-blue-500",
      "focus:ring-offset-2",
      "disabled:opacity-50",
      "disabled:cursor-not-allowed"
    );
  });

  test("drag and drop area has correct styling classes", () => {
    render(<FileUpload onFilesUploaded={mockOnFilesUploaded} />);

    const dropArea = screen
      .getByText("Drop CSV files here or click to browse")
      .closest("div");

    expect(dropArea).toHaveClass(
      "relative",
      "border-2",
      "border-dashed",
      "rounded-lg",
      "p-12",
      "text-center",
      "transition-colors",
      "duration-200",
      "border-gray-300",
      "hover:border-gray-400"
    );
  });

  test("upload restrictions are clearly communicated", () => {
    render(<FileUpload onFilesUploaded={mockOnFilesUploaded} />);

    // File type restriction
    expect(
      screen.getByText("• Only CSV files are accepted")
    ).toBeInTheDocument();

    // Size restrictions
    expect(screen.getByText("• Maximum file size: 50MB")).toBeInTheDocument();
    expect(
      screen.getByText("Maximum 10 files, 50MB per file")
    ).toBeInTheDocument();

    // Count restriction
    expect(screen.getByText("• Maximum files: 10")).toBeInTheDocument();

    // Security info
    expect(
      screen.getByText("• Files are uploaded to secure cloud storage")
    ).toBeInTheDocument();
  });

  test("component constants match expected values", () => {
    // Test that the component uses the correct constants
    render(<FileUpload onFilesUploaded={mockOnFilesUploaded} />);

    // MAX_FILES = 10
    expect(
      screen.getByText("Maximum 10 files, 50MB per file")
    ).toBeInTheDocument();
    expect(screen.getByText("• Maximum files: 10")).toBeInTheDocument();

    // ACCEPTED_FILE_TYPE = ".csv"
    expect(
      screen.getByText("• Only CSV files are accepted")
    ).toBeInTheDocument();

    const fileInput = screen
      .getByRole("button")
      .parentElement?.querySelector('input[type="file"]') as HTMLInputElement;
    expect(fileInput.accept).toBe(".csv");
  });

  test("upload area icon and text are properly displayed", () => {
    render(<FileUpload onFilesUploaded={mockOnFilesUploaded} />);

    // File icon
    expect(screen.getByText("📁")).toBeInTheDocument();

    // Main instruction text
    expect(
      screen.getByText("Drop CSV files here or click to browse")
    ).toBeInTheDocument();

    // Subtitle with file limits
    expect(
      screen.getByText("Maximum 10 files, 50MB per file")
    ).toBeInTheDocument();
  });

  test("component layout structure is correct", () => {
    render(<FileUpload onFilesUploaded={mockOnFilesUploaded} />);

    // Main container
    const mainContainer = screen
      .getByText("Drop CSV files here or click to browse")
      .closest(".space-y-4");
    expect(mainContainer).toHaveClass("space-y-4");

    // Icon container
    const iconContainer = screen.getByText("📁").closest(".w-16.h-16");
    expect(iconContainer).toHaveClass(
      "mx-auto",
      "w-16",
      "h-16",
      "bg-gray-100",
      "rounded-full",
      "flex",
      "items-center",
      "justify-center"
    );

    // Instructions area
    const instructionsArea = screen
      .getByText("Drop CSV files here or click to browse")
      .closest(".space-y-4");
    expect(instructionsArea).toBeInTheDocument();
  });

  test("file upload is an admin-only feature", () => {
    // This component should only be rendered on admin pages
    // The upload page itself is protected by ProtectedRoute with requiredRole="admin"

    render(<FileUpload onFilesUploaded={mockOnFilesUploaded} />);

    // The component renders when accessed by admin
    expect(
      screen.getByText("Drop CSV files here or click to browse")
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Choose Files" })
    ).toBeInTheDocument();

    // CSV-specific features (admin business use case)
    expect(
      screen.getByText("• Only CSV files are accepted")
    ).toBeInTheDocument();
    expect(
      screen.getByText("• Files are uploaded to secure cloud storage")
    ).toBeInTheDocument();
  });

  test("component supports accessibility features", () => {
    render(<FileUpload onFilesUploaded={mockOnFilesUploaded} />);

    // Button has proper role and type
    const uploadButton = screen.getByRole("button", { name: "Choose Files" });
    expect(uploadButton).toHaveAttribute("type", "button");

    // File input is focusable and has proper attributes
    const fileInput = screen
      .getByRole("button")
      .parentElement?.querySelector('input[type="file"]') as HTMLInputElement;
    expect(fileInput).toHaveAttribute("type", "file");
    expect(fileInput).toHaveAttribute("multiple");

    // Focus and hover states are defined in CSS classes
    expect(uploadButton).toHaveClass(
      "focus:outline-none",
      "focus:ring-2",
      "focus:ring-blue-500"
    );
  });
});
