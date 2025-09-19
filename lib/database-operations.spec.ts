import { describe, expect, test, vi, beforeEach } from "vitest";
import { insertBusinessBatch, updateFileStatus } from "./database-operations";
import { brand } from "./types";
import type { FileId } from "./types";

const mockClient = {
  url: "https://test.supabase.co",
  serviceKey: "test-service-key",
};

const testFileId: FileId = brand<string, "FileId">("test-file-123");

global.fetch = vi.fn();

beforeEach(() => {
  vi.resetAllMocks();
});

describe("insertBusinessBatch", () => {
  test("successfully inserts batch of records", async () => {
    const records = [
      { file_id: testFileId, name: "Business 1" },
      { file_id: testFileId, name: "Business 2" },
    ];

    (fetch as any).mockResolvedValueOnce({
      ok: true,
    });

    const result = await insertBusinessBatch(records, mockClient);

    expect(result).toEqual({ success: true });
    expect(fetch).toHaveBeenCalledWith(
      "https://test.supabase.co/rest/v1/pre_release_businesses",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: "test-service-key",
          Authorization: "Bearer test-service-key",
          Prefer: "return=minimal",
        },
        body: JSON.stringify(records),
      }
    );
  });

  test("handles failed insertion", async () => {
    const records = [{ file_id: testFileId, name: "Business 1" }];

    (fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 400,
      text: async () => "Bad request",
    });

    const result = await insertBusinessBatch(records, mockClient);

    expect(result).toEqual({
      success: false,
      error: "Batch insert failed: 400 - Bad request",
    });
  });

  test("handles network error", async () => {
    const records = [{ file_id: testFileId, name: "Business 1" }];

    (fetch as any).mockRejectedValueOnce(new Error("Network error"));

    const result = await insertBusinessBatch(records, mockClient);

    expect(result).toEqual({
      success: false,
      error: "Network error",
    });
  });
});

describe("updateFileStatus", () => {
  test("successfully updates file status", async () => {
    (fetch as any).mockResolvedValueOnce({
      ok: true,
    });

    const result = await updateFileStatus(testFileId, "added", mockClient);

    expect(result).toEqual({ success: true });
    expect(fetch).toHaveBeenCalledWith(
      `https://test.supabase.co/rest/v1/uploaded_files?id=eq.${testFileId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          apikey: "test-service-key",
          Authorization: "Bearer test-service-key",
        },
        body: expect.stringContaining('"status":"added"'),
      }
    );
  });

  test("handles failed status update", async () => {
    (fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 404,
      text: async () => "File not found",
    });

    const result = await updateFileStatus(testFileId, "added", mockClient);

    expect(result).toEqual({
      success: false,
      error: "Status update failed: 404 - File not found",
    });
  });

  test("handles network error", async () => {
    (fetch as any).mockRejectedValueOnce(new Error("Connection timeout"));

    const result = await updateFileStatus(testFileId, "added", mockClient);

    expect(result).toEqual({
      success: false,
      error: "Connection timeout",
    });
  });
});
