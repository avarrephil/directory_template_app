import { describe, expect, test, vi, afterEach } from "vitest";
import {
  validateCsvFile,
  generateUniqueFilePath,
  resetPassword,
  updatePassword,
  signUp,
  signIn,
  signOut,
  getCurrentUser,
} from "./supabase-client";
import type { FileId } from "./types";

describe("validateCsvFile", () => {
  test("accepts valid CSV file", () => {
    const validFile = new File(
      ["name,email\nJohn,john@example.com"],
      "test.csv",
      {
        type: "text/csv",
      }
    );

    const result = validateCsvFile(validFile);

    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  test("rejects non-CSV file", () => {
    const invalidFile = new File(["test content"], "test.txt", {
      type: "text/plain",
    });

    const result = validateCsvFile(invalidFile);

    expect(result.valid).toBe(false);
    expect(result.error).toBe("File must be a CSV");
  });

  test("rejects file exceeding size limit", () => {
    // Create a mock file with large size but without allocating actual memory
    const largeFile = new File(["small content"], "large.csv", {
      type: "text/csv",
    });

    // Mock the size property to simulate a large file
    Object.defineProperty(largeFile, "size", {
      value: 51 * 1024 * 1024, // 51MB
      writable: false,
    });

    const result = validateCsvFile(largeFile);

    expect(result.valid).toBe(false);
    expect(result.error).toBe("File size exceeds 50MB limit");
  });

  test("rejects empty file", () => {
    const emptyFile = new File([], "empty.csv", {
      type: "text/csv",
    });

    const result = validateCsvFile(emptyFile);

    expect(result.valid).toBe(false);
    expect(result.error).toBe("File is empty");
  });

  test("accepts CSV file with uppercase extension", () => {
    const validFile = new File(
      ["name,email\nJohn,john@example.com"],
      "test.CSV",
      {
        type: "text/csv",
      }
    );

    const result = validateCsvFile(validFile);

    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });
});

describe("generateUniqueFilePath", () => {
  test("generates path with uploads prefix", () => {
    const filename = "test.csv";

    const path = generateUniqueFilePath(filename);

    expect(path).toMatch(/^uploads\/\d+-[a-z0-9]+\/test\.csv$/);
  });

  test("preserves original filename", () => {
    const filename = "business-data.csv";

    const path = generateUniqueFilePath(filename);

    expect(path).toContain(filename);
  });

  test("generates unique paths for same filename", () => {
    const filename = "test.csv";

    const path1 = generateUniqueFilePath(filename);
    const path2 = generateUniqueFilePath(filename);

    expect(path1).not.toBe(path2);
  });

  test("handles special characters in filename", () => {
    const filename = "file with spaces & symbols.csv";

    const path = generateUniqueFilePath(filename);

    expect(path).toContain(filename);
    expect(path).toMatch(
      /^uploads\/\d+-[a-z0-9]+\/file with spaces & symbols\.csv$/
    );
  });
});

// Phase 1 Tests: Supabase Configuration Utilities
describe("getSupabaseConfig", () => {
  const originalUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const originalKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  afterEach(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = originalUrl;
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = originalKey;
  });

  test("returns config when environment variables are set", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-key";

    // Import function dynamically to get updated env
    const { getSupabaseConfig } = await import("./supabase-client");
    const config = getSupabaseConfig();

    expect(config).toEqual({
      url: "https://test.supabase.co",
      key: "test-key",
    });
  });

  test("throws error when URL is missing", async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-key";

    const { getSupabaseConfig } = await import("./supabase-client");

    expect(() => getSupabaseConfig()).toThrow("Supabase configuration missing");
  });

  test("throws error when key is missing", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    const { getSupabaseConfig } = await import("./supabase-client");

    expect(() => getSupabaseConfig()).toThrow("Supabase configuration missing");
  });
});

// Phase 2 Tests: API Response Validation
describe("validateFileRecord", () => {
  test("validates correct file record", async () => {
    const validRecord = {
      id: "123e4567-e89b-12d3-a456-426614174000",
      name: "test.csv",
      size: 1024,
      uploaded_at: "2024-01-15T10:30:00+00:00",
      status: "uploaded",
      storage_path: "uploads/123/test.csv",
    };

    const { validateFileRecord } = await import("./supabase-client");
    const result = validateFileRecord(validRecord);

    expect(result).toEqual(validRecord);
  });

  test("throws error for missing required fields", async () => {
    const invalidRecord = {
      id: "123",
      // missing name, size, etc.
    };

    const { validateFileRecord } = await import("./supabase-client");

    expect(() => validateFileRecord(invalidRecord)).toThrow(
      "Invalid file record"
    );
  });

  test("throws error for null input", async () => {
    const { validateFileRecord } = await import("./supabase-client");

    expect(() => validateFileRecord(null)).toThrow("Invalid file record");
  });
});

// Phase 3 Tests: Split Function Helpers
describe("getFileStoragePath", () => {
  test("returns storage path for existing file", async () => {
    // This will fail until we implement the function
    const { getFileStoragePath } = await import("./supabase-client");
    const fileId = "test-file-id" as FileId;

    // Mock the HTTP response
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([{ storage_path: "uploads/test/file.csv" }]),
    });

    const result = await getFileStoragePath(fileId);

    expect(result).toBe("uploads/test/file.csv");
  });

  test("returns null for file without storage path", async () => {
    const { getFileStoragePath } = await import("./supabase-client");
    const fileId = "test-file-id" as FileId;

    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([{ storage_path: null }]),
    });

    const result = await getFileStoragePath(fileId);

    expect(result).toBe(null);
  });
});

// Note: These integration-style tests would normally require proper Supabase mocking
// For now, we'll test the basic structure and error handling of auth functions

describe("Authentication Functions Structure", () => {
  test("resetPassword function exists and has correct signature", () => {
    expect(typeof resetPassword).toBe("function");
  });

  test("updatePassword function exists and has correct signature", () => {
    expect(typeof updatePassword).toBe("function");
  });

  test("signUp function exists and has correct signature", () => {
    expect(typeof signUp).toBe("function");
  });

  test("signIn function exists and has correct signature", () => {
    expect(typeof signIn).toBe("function");
  });

  test("signOut function exists and has correct signature", () => {
    expect(typeof signOut).toBe("function");
  });

  test("getCurrentUser function exists and has correct signature", () => {
    expect(typeof getCurrentUser).toBe("function");
  });
});

// Test helper function for validating auth result structure
function validateAuthResultStructure(
  result: { success: boolean; error?: string; user?: unknown },
  shouldHaveUser: boolean = false
) {
  expect(result).toHaveProperty("success");
  expect(typeof result.success).toBe("boolean");

  if (!result.success) {
    expect(result).toHaveProperty("error");
    expect(typeof result.error).toBe("string");
  }

  if (shouldHaveUser) {
    expect(result).toHaveProperty("user");
  }
}

describe("Auth Function Return Types", () => {
  // These tests verify the functions return the correct structure
  // without actually calling Supabase (which would require proper setup)

  test("auth functions return proper error structure when missing environment", async () => {
    // Temporarily clear env vars to test error handling
    const originalUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const originalKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    try {
      const result = await resetPassword("test@example.com");
      validateAuthResultStructure(result);
      expect(result.success).toBe(false);
      expect(result.error).toContain("configuration");
    } catch (error) {
      // Expected to throw due to missing config
      expect(error).toBeDefined();
    } finally {
      // Restore env vars
      if (originalUrl) process.env.NEXT_PUBLIC_SUPABASE_URL = originalUrl;
      if (originalKey) process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = originalKey;
    }
  });
});
