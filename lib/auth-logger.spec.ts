import { describe, test, expect, beforeEach, vi } from "vitest";
import { authLog } from "./auth-logger";

// Mock console methods
const mockConsoleError = vi
  .spyOn(console, "error")
  .mockImplementation(() => {});
const mockConsoleWarn = vi.spyOn(console, "warn").mockImplementation(() => {});

describe("authLog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("has all required log methods", () => {
    expect(typeof authLog.debug).toBe("function");
    expect(typeof authLog.error).toBe("function");
    expect(typeof authLog.info).toBe("function");
    expect(typeof authLog.timeout).toBe("function");
    expect(typeof authLog.success).toBe("function");
  });

  test("error method always calls console.error", () => {
    authLog.error("Error message", new Error("test"));
    expect(mockConsoleError).toHaveBeenCalledWith(
      "❌ [AUTH] Error message",
      new Error("test")
    );
  });

  test("timeout method can be called without error", () => {
    expect(() => authLog.timeout("Timeout message")).not.toThrow();
  });

  test("error handles missing error parameter", () => {
    authLog.error("Error message");
    expect(mockConsoleError).toHaveBeenCalledWith(
      "❌ [AUTH] Error message",
      ""
    );
  });

  test("debug method doesn't throw", () => {
    expect(() => authLog.debug("Test message")).not.toThrow();
  });

  test("info and success methods don't throw", () => {
    expect(() => authLog.info("Info message")).not.toThrow();
    expect(() => authLog.success("Success message")).not.toThrow();
  });
});
