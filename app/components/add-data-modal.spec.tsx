import { describe, test, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { brand } from "@/lib/types";
import AddDataModal from "./add-data-modal";

// Mock the supabase-client module
vi.mock("@/lib/supabase-client", () => ({
  processFileToPreRelease: vi.fn(),
}));

describe("AddDataModal", () => {
  const mockFileId = brand<string, "FileId">("test-file-id");
  const mockFileName = "test-file.csv";
  const mockOnClose = vi.fn();
  const mockOnSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderModal = () => {
    return render(
      <AddDataModal
        fileId={mockFileId}
        fileName={mockFileName}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );
  };

  test("renders modal with correct title and file name", () => {
    renderModal();

    expect(screen.getByText("Add Data to Pre-Release")).toBeInTheDocument();
    expect(screen.getByText(`File: ${mockFileName}`)).toBeInTheDocument();
  });

  test("shows confirmation message initially", () => {
    renderModal();

    expect(
      screen.getByText(
        /This will add the data from this CSV file to the pre-release table/
      )
    ).toBeInTheDocument();
    expect(screen.getByText("Do you want to proceed?")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Add Data" })
    ).toBeInTheDocument();
  });

  test("calls onClose when cancel button is clicked", () => {
    renderModal();

    const cancelButton = screen.getByRole("button", { name: "Cancel" });
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalledOnce();
  });

  test("calls onClose when X button is clicked", () => {
    renderModal();

    const closeButton = screen.getByText("×");
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledOnce();
  });

  test("shows processing state when Add Data is clicked", async () => {
    const { processFileToPreRelease } = await import("@/lib/supabase-client");
    vi.mocked(processFileToPreRelease).mockImplementation(
      () => new Promise(() => {}) // Never resolves to keep in processing state
    );

    renderModal();

    const addDataButton = screen.getByRole("button", { name: "Add Data" });
    fireEvent.click(addDataButton);

    await waitFor(() => {
      expect(screen.getByText("Processing file...")).toBeInTheDocument();
    });

    expect(screen.queryByText("×")).not.toBeInTheDocument();
  });

  test("shows success state when processing completes successfully", async () => {
    const { processFileToPreRelease } = await import("@/lib/supabase-client");
    vi.mocked(processFileToPreRelease).mockResolvedValue({
      success: true,
      processed: 100,
    });

    renderModal();

    const addDataButton = screen.getByRole("button", { name: "Add Data" });
    fireEvent.click(addDataButton);

    await waitFor(() => {
      expect(screen.getByText("Data Added Successfully")).toBeInTheDocument();
    });

    expect(screen.getByText("100 records processed")).toBeInTheDocument();
    expect(mockOnSuccess).toHaveBeenCalledOnce();
  });

  test("shows error state when processing fails", async () => {
    const { processFileToPreRelease } = await import("@/lib/supabase-client");
    const errorMessage = "Processing failed";
    vi.mocked(processFileToPreRelease).mockResolvedValue({
      success: false,
      error: errorMessage,
    });

    renderModal();

    const addDataButton = screen.getByRole("button", { name: "Add Data" });
    fireEvent.click(addDataButton);

    await waitFor(() => {
      expect(screen.getByText("Processing Failed")).toBeInTheDocument();
    });

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Try Again" })
    ).toBeInTheDocument();
  });

  test("resets to initial state when Try Again is clicked after error", async () => {
    const { processFileToPreRelease } = await import("@/lib/supabase-client");
    vi.mocked(processFileToPreRelease).mockResolvedValue({
      success: false,
      error: "Test error",
    });

    renderModal();

    const addDataButton = screen.getByRole("button", { name: "Add Data" });
    fireEvent.click(addDataButton);

    await waitFor(() => {
      expect(screen.getByText("Processing Failed")).toBeInTheDocument();
    });

    const tryAgainButton = screen.getByRole("button", { name: "Try Again" });
    fireEvent.click(tryAgainButton);

    expect(screen.getByText("Do you want to proceed?")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Add Data" })
    ).toBeInTheDocument();
  });
});
