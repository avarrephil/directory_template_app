import { describe, test, expect } from "vitest";
import { AUTH_CONFIG } from "./auth-config";

describe("AUTH_CONFIG", () => {
  test("has correct timeout values", () => {
    expect(AUTH_CONFIG.TIMEOUT_MS).toBe(10000); // 10 seconds
    expect(AUTH_CONFIG.CACHE_DURATION_MS).toBe(600000); // 10 minutes
    expect(AUTH_CONFIG.RETRY_ATTEMPTS).toBe(2);
  });

  test("has correct session timeout values", () => {
    expect(AUTH_CONFIG.IDLE_SESSION_TIMEOUT_MS).toBe(3600000); // 1 hour
    expect(AUTH_CONFIG.ABSOLUTE_SESSION_TIMEOUT_MS).toBe(86400000); // 24 hours
  });

  test("has correct token lifetime values", () => {
    expect(AUTH_CONFIG.ACCESS_TOKEN_LIFETIME_SECONDS).toBe(3600); // 1 hour
    expect(AUTH_CONFIG.REFRESH_TOKEN_LIFETIME_SECONDS).toBe(2592000); // 30 days
  });

  test("has a valid log level", () => {
    expect(["debug", "error"]).toContain(AUTH_CONFIG.LOG_LEVEL);
  });

  test("config object is readonly", () => {
    expect(() => {
      // @ts-expect-error - testing runtime immutability
      AUTH_CONFIG.TIMEOUT_MS = 999;
    }).toThrow();
  });
});
