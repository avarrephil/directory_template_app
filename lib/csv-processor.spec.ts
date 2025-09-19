import { describe, expect, test, vi, beforeEach } from "vitest";
import { processCSVToPreRelease } from "./csv-processor";
import { brand } from "./types";
import type { FileId } from "./types";
import * as databaseOperations from "./database-operations";

vi.mock("./database-operations");

const mockInsertBusinessBatch = vi.mocked(
  databaseOperations.insertBusinessBatch
);

const testFileId: FileId = brand<string, "FileId">("test-file-123");
const mockConfig = {
  url: "https://test.supabase.co",
  serviceKey: "test-service-key",
};

beforeEach(() => {
  vi.resetAllMocks();
});

describe("processCSVToPreRelease", () => {
  test("processes valid CSV successfully", async () => {
    const csvText = `name,phone,city
Business One,123-456-7890,New York
Business Two,987-654-3210,Los Angeles`;

    mockInsertBusinessBatch.mockResolvedValue({ success: true });

    const result = await processCSVToPreRelease(
      csvText,
      testFileId,
      mockConfig
    );

    expect(result).toEqual({
      success: true,
      processed: 2,
    });

    expect(mockInsertBusinessBatch).toHaveBeenCalledWith(
      [
        {
          file_id: testFileId,
          name: "Business One",
          phone: "123-456-7890",
          city: "New York",
        },
        {
          file_id: testFileId,
          name: "Business Two",
          phone: "987-654-3210",
          city: "Los Angeles",
        },
      ],
      { url: mockConfig.url, serviceKey: mockConfig.serviceKey }
    );
  });

  test("handles empty CSV file", async () => {
    const csvText = "";

    const result = await processCSVToPreRelease(
      csvText,
      testFileId,
      mockConfig
    );

    expect(result).toEqual({
      success: false,
      error: "CSV file is empty",
    });

    expect(mockInsertBusinessBatch).not.toHaveBeenCalled();
  });

  test("handles CSV with only headers", async () => {
    const csvText = "name,phone,city";

    const result = await processCSVToPreRelease(
      csvText,
      testFileId,
      mockConfig
    );

    expect(result).toEqual({
      success: false,
      error: "No data rows found in CSV",
    });

    expect(mockInsertBusinessBatch).not.toHaveBeenCalled();
  });

  test("handles batch insertion failure", async () => {
    const csvText = `name,phone
Business One,123-456-7890`;

    mockInsertBusinessBatch.mockResolvedValue({
      success: false,
      error: "Database connection failed",
    });

    const result = await processCSVToPreRelease(
      csvText,
      testFileId,
      mockConfig
    );

    expect(result).toEqual({
      success: false,
      error: "Database connection failed",
    });
  });

  test("processes large CSV in batches", async () => {
    const headerLine = "name,phone";
    const dataLines = Array.from(
      { length: 2500 },
      (_, i) => `Business ${i + 1},123-456-789${i % 10}`
    );
    const csvText = [headerLine, ...dataLines].join("\n");

    mockInsertBusinessBatch.mockResolvedValue({ success: true });

    const result = await processCSVToPreRelease(
      csvText,
      testFileId,
      mockConfig
    );

    expect(result).toEqual({
      success: true,
      processed: 2500,
    });

    expect(mockInsertBusinessBatch).toHaveBeenCalledTimes(3);
    expect(mockInsertBusinessBatch).toHaveBeenNthCalledWith(
      1,
      expect.arrayContaining([]),
      expect.any(Object)
    );
    expect(mockInsertBusinessBatch).toHaveBeenNthCalledWith(
      2,
      expect.arrayContaining([]),
      expect.any(Object)
    );
    expect(mockInsertBusinessBatch).toHaveBeenNthCalledWith(
      3,
      expect.arrayContaining([]),
      expect.any(Object)
    );
  });

  test("handles unexpected errors gracefully", async () => {
    const csvText = `name,phone
Business One,123-456-7890`;

    mockInsertBusinessBatch.mockRejectedValue(new Error("Unexpected error"));

    const result = await processCSVToPreRelease(
      csvText,
      testFileId,
      mockConfig
    );

    expect(result).toEqual({
      success: false,
      error: "Unexpected error",
    });
  });
});
