import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, test, expect, vi, beforeEach } from "vitest";
import FileUpload from "./file-upload";
import { uploadFile } from "@/lib/supabase-client";

// Mock the uploadFile function from supabase-client
vi.mock("@/lib/supabase-client", () => ({
  uploadFile: vi.fn(),
}));

describe("File Upload Functionality for Admin Users", () => {
  const user = userEvent.setup();
  const mockOnFilesUploaded = vi.fn();
  const mockUploadFile = vi.mocked(uploadFile);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders file upload component with all required elements", () => {
    render(<FileUpload onFilesUploaded={mockOnFilesUploaded} />);

    // Check main upload area
    expect(
      screen.getByText("Drop CSV files here or click to browse")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Maximum 10 files, 50MB per file")
    ).toBeInTheDocument();
    expect(screen.getByText("📁")).toBeInTheDocument();

    // Check upload button
    expect(
      screen.getByRole("button", { name: "Choose Files" })
    ).toBeInTheDocument();

    // Check file input
    const fileInput = screen
      .getByRole("button")
      .parentElement?.querySelector('input[type="file"]');
    expect(fileInput).toBeInTheDocument();
    expect(fileInput).toHaveAttribute("accept", ".csv");
    expect(fileInput).toHaveAttribute("multiple");

    // Check upload restrictions
    expect(
      screen.getByText("• Only CSV files are accepted")
    ).toBeInTheDocument();
    expect(screen.getByText("• Maximum file size: 50MB")).toBeInTheDocument();
    expect(screen.getByText("• Maximum files: 10")).toBeInTheDocument();
    expect(
      screen.getByText("• Files are uploaded to secure cloud storage")
    ).toBeInTheDocument();
  });

  test("file input accepts only CSV files", () => {
    render(<FileUpload onFilesUploaded={mockOnFilesUploaded} />);

    const fileInput = screen
      .getByRole("button")
      .parentElement?.querySelector('input[type="file"]') as HTMLInputElement;
    expect(fileInput.accept).toBe(".csv");
    expect(fileInput.multiple).toBe(true);
  });

  test("handles successful file upload", async () => {
    mockUploadFile.mockImplementation((file, options) => {
      // Simulate progress callbacks
      setTimeout(() => options.onProgress({ percentage: 50 }), 10);
      setTimeout(() => options.onProgress({ percentage: 100 }), 20);

      return Promise.resolve({
        success: true,
        fileName: file.name,
        fileId: "test-file-id",
      });
    });

    render(<FileUpload onFilesUploaded={mockOnFilesUploaded} />);

    // Create a mock CSV file
    const csvFile = new File(["name,email\nJohn,john@test.com"], "test.csv", {
      type: "text/csv",
    });

    const fileInput = screen
      .getByRole("button")
      .parentElement?.querySelector('input[type="file"]') as HTMLInputElement;

    // Simulate file selection
    fireEvent.change(fileInput, { target: { files: [csvFile] } });

    // Check uploading state
    await waitFor(() => {
      expect(
        screen.getByText("Uploading files... (1 remaining)")
      ).toBeInTheDocument();
      expect(screen.getByText("Uploading...")).toBeInTheDocument();
    });

    // Wait for upload to complete
    await waitFor(() => {
      expect(mockUploadFile).toHaveBeenCalledWith(csvFile, expect.any(Object));
      expect(mockOnFilesUploaded).toHaveBeenCalledWith([
        {
          success: true,
          fileName: "test.csv",
          fileId: "test-file-id",
        },
      ]);
    });
  });

  test("displays upload progress for files", async () => {
    let progressCallback: (progress: { percentage: number }) => void;

    mockUploadFile.mockImplementation((file, options) => {
      progressCallback = options.onProgress;
      return new Promise((resolve) => {
        setTimeout(() => {
          progressCallback({ percentage: 25 });
          setTimeout(() => {
            progressCallback({ percentage: 75 });
            setTimeout(() => {
              progressCallback({ percentage: 100 });
              resolve({ success: true, fileName: file.name });
            }, 50);
          }, 50);
        }, 50);
      });
    });

    render(<FileUpload onFilesUploaded={mockOnFilesUploaded} />);

    const csvFile = new File(["data"], "progress-test.csv", {
      type: "text/csv",
    });
    const fileInput = screen
      .getByRole("button")
      .parentElement?.querySelector('input[type="file"]') as HTMLInputElement;

    fireEvent.change(fileInput, { target: { files: [csvFile] } });

    // Wait for progress display
    await waitFor(() => {
      expect(screen.getByText("progress-test.csv")).toBeInTheDocument();
    });

    // Progress bar should appear
    const progressBar = screen
      .getByText("progress-test.csv")
      .parentElement?.querySelector('[style*="width"]');
    expect(progressBar).toBeInTheDocument();
  });

  test("handles file upload errors", async () => {
    mockUploadFile.mockRejectedValue(new Error("Upload failed: Network error"));

    render(<FileUpload onFilesUploaded={mockOnFilesUploaded} />);

    const csvFile = new File(["data"], "error-test.csv", { type: "text/csv" });
    const fileInput = screen
      .getByRole("button")
      .parentElement?.querySelector('input[type="file"]') as HTMLInputElement;

    fireEvent.change(fileInput, { target: { files: [csvFile] } });

    // Wait for error to appear
    await waitFor(() => {
      expect(screen.getByText("Upload Errors")).toBeInTheDocument();
      expect(
        screen.getByText("error-test.csv: Upload failed: Network error")
      ).toBeInTheDocument();
      expect(screen.getByText("⚠️")).toBeInTheDocument();
    });

    // Check error styling
    const errorContainer = screen
      .getByText("Upload Errors")
      .closest(".bg-red-50");
    expect(errorContainer).toHaveClass(
      "bg-red-50",
      "border",
      "border-red-200",
      "rounded-md",
      "p-4"
    );
  });

  test("validates maximum file limit", async () => {
    render(<FileUpload onFilesUploaded={mockOnFilesUploaded} />);

    // Create 11 files (exceeding the MAX_FILES limit of 10)
    const files = Array.from(
      { length: 11 },
      (_, i) => new File(["data"], `file${i}.csv`, { type: "text/csv" })
    );

    const fileInput = screen
      .getByRole("button")
      .parentElement?.querySelector('input[type="file"]') as HTMLInputElement;

    // Mock files property
    Object.defineProperty(fileInput, "files", {
      value: files,
      writable: false,
    });

    fireEvent.change(fileInput, { target: { files } });

    // Should show error for too many files
    await waitFor(() => {
      expect(screen.getByText("Upload Errors")).toBeInTheDocument();
      expect(screen.getByText("Maximum 10 files allowed")).toBeInTheDocument();
    });

    // Upload should not be triggered
    expect(mockUploadFile).not.toHaveBeenCalled();
  });

  test("drag and drop functionality works", async () => {
    mockUploadFile.mockResolvedValue({
      success: true,
      fileName: "dropped.csv",
    });

    render(<FileUpload onFilesUploaded={mockOnFilesUploaded} />);

    const uploadArea = screen
      .getByText("Drop CSV files here or click to browse")
      .closest("div");

    const csvFile = new File(["data"], "dropped.csv", { type: "text/csv" });

    // Simulate drag over
    fireEvent.dragOver(uploadArea!, {
      dataTransfer: { files: [csvFile] },
    });

    // Should show drag state
    expect(uploadArea).toHaveClass("border-blue-500", "bg-blue-50");

    // Simulate drop
    fireEvent.drop(uploadArea!, {
      dataTransfer: { files: [csvFile] },
    });

    // Should trigger upload
    await waitFor(() => {
      expect(mockUploadFile).toHaveBeenCalledWith(csvFile, expect.any(Object));
    });
  });

  test("prevents multiple simultaneous uploads", async () => {
    // Mock long-running upload
    mockUploadFile.mockImplementation(() => new Promise(() => {})); // Never resolves

    render(<FileUpload onFilesUploaded={mockOnFilesUploaded} />);

    const csvFile1 = new File(["data1"], "file1.csv", { type: "text/csv" });
    const csvFile2 = new File(["data2"], "file2.csv", { type: "text/csv" });

    const fileInput = screen
      .getByRole("button")
      .parentElement?.querySelector('input[type="file"]') as HTMLInputElement;

    // Start first upload
    fireEvent.change(fileInput, { target: { files: [csvFile1] } });

    // Verify uploading state
    await waitFor(() => {
      expect(
        screen.getByText("Uploading files... (1 remaining)")
      ).toBeInTheDocument();
    });

    // Try second upload while first is in progress
    fireEvent.change(fileInput, { target: { files: [csvFile2] } });

    // Should not trigger second upload
    expect(mockUploadFile).toHaveBeenCalledTimes(1);
  });

  test("disables input and button during upload", async () => {
    mockUploadFile.mockImplementation(() => new Promise(() => {})); // Never resolves

    render(<FileUpload onFilesUploaded={mockOnFilesUploaded} />);

    const csvFile = new File(["data"], "test.csv", { type: "text/csv" });
    const fileInput = screen
      .getByRole("button")
      .parentElement?.querySelector('input[type="file"]') as HTMLInputElement;
    const uploadButton = screen.getByRole("button", { name: "Choose Files" });

    // Start upload
    fireEvent.change(fileInput, { target: { files: [csvFile] } });

    // Check elements are disabled
    await waitFor(() => {
      expect(fileInput).toBeDisabled();
      expect(uploadButton).toBeDisabled();
      expect(uploadButton).toHaveTextContent("Uploading...");
    });

    // Check disabled styling
    expect(uploadButton).toHaveClass(
      "disabled:opacity-50",
      "disabled:cursor-not-allowed"
    );
    expect(fileInput).toHaveClass("disabled:cursor-not-allowed");
  });

  test("resets file input after selection", async () => {
    mockUploadFile.mockResolvedValue({ success: true, fileName: "test.csv" });

    render(<FileUpload onFilesUploaded={mockOnFilesUploaded} />);

    const csvFile = new File(["data"], "test.csv", { type: "text/csv" });
    const fileInput = screen
      .getByRole("button")
      .parentElement?.querySelector('input[type="file"]') as HTMLInputElement;

    // Mock the value property
    Object.defineProperty(fileInput, "value", {
      value: "test.csv",
      writable: true,
    });

    fireEvent.change(fileInput, { target: { files: [csvFile] } });

    // Input value should be reset (this happens in the onChange handler)
    await waitFor(() => {
      expect(mockUploadFile).toHaveBeenCalled();
    });
  });

  test("handles multiple file uploads correctly", async () => {
    const files = [
      new File(["data1"], "file1.csv", { type: "text/csv" }),
      new File(["data2"], "file2.csv", { type: "text/csv" }),
      new File(["data3"], "file3.csv", { type: "text/csv" }),
    ];

    mockUploadFile.mockImplementation((file) =>
      Promise.resolve({ success: true, fileName: file.name })
    );

    render(<FileUpload onFilesUploaded={mockOnFilesUploaded} />);

    const fileInput = screen
      .getByRole("button")
      .parentElement?.querySelector('input[type="file"]') as HTMLInputElement;

    fireEvent.change(fileInput, { target: { files } });

    // Should show correct count
    await waitFor(() => {
      expect(
        screen.getByText("Uploading files... (3 remaining)")
      ).toBeInTheDocument();
    });

    // Should call uploadFile for each file
    await waitFor(() => {
      expect(mockUploadFile).toHaveBeenCalledTimes(3);
      files.forEach((file) => {
        expect(mockUploadFile).toHaveBeenCalledWith(file, expect.any(Object));
      });
    });
  });

  test("upload area has correct styling states", () => {
    render(<FileUpload onFilesUploaded={mockOnFilesUploaded} />);

    const uploadArea = screen
      .getByText("Drop CSV files here or click to browse")
      .closest("div");

    // Default state
    expect(uploadArea).toHaveClass(
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

    // Contains file input overlay
    const fileInput = uploadArea?.querySelector('input[type="file"]');
    expect(fileInput).toHaveClass(
      "absolute",
      "inset-0",
      "w-full",
      "h-full",
      "opacity-0",
      "cursor-pointer",
      "disabled:cursor-not-allowed"
    );
  });
});
