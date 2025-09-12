import { describe, test, expect, beforeEach, vi } from "vitest";
import {
  shouldSkipAuthRefresh,
  isTokenNearExpiry,
  shouldRefreshToken,
} from "./auth-utils";
import { AUTH_CONFIG } from "./auth-config";

describe("shouldSkipAuthRefresh", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("returns false when forced", () => {
    const recentTime = Date.now() - 1000; // 1 second ago
    expect(shouldSkipAuthRefresh(recentTime, true)).toBe(false);
  });

  test("returns false for first check (lastCheck = 0)", () => {
    expect(shouldSkipAuthRefresh(0, false)).toBe(false);
  });

  test("returns true for recent check within cache duration", () => {
    const recentTime = Date.now() - AUTH_CONFIG.CACHE_DURATION_MS / 2;
    expect(shouldSkipAuthRefresh(recentTime, false)).toBe(true);
  });

  test("returns false for old check outside cache duration", () => {
    const oldTime = Date.now() - (AUTH_CONFIG.CACHE_DURATION_MS + 1000);
    expect(shouldSkipAuthRefresh(oldTime, false)).toBe(false);
  });

  test("returns false for exactly expired cache", () => {
    const expiredTime = Date.now() - AUTH_CONFIG.CACHE_DURATION_MS;
    expect(shouldSkipAuthRefresh(expiredTime, false)).toBe(false);
  });

  test("handles edge case of future timestamp", () => {
    const futureTime = Date.now() + 10000; // 10 seconds in future
    expect(shouldSkipAuthRefresh(futureTime, false)).toBe(true);
  });
});

describe("isTokenNearExpiry", () => {
  test("returns true for token expiring within threshold", () => {
    const nowInSeconds = Date.now() / 1000;
    const expiresInTenSeconds = nowInSeconds + 10;
    expect(isTokenNearExpiry(expiresInTenSeconds, 30)).toBe(true);
  });

  test("returns false for token with plenty of time", () => {
    const nowInSeconds = Date.now() / 1000;
    const expiresInOneHour = nowInSeconds + 3600;
    expect(isTokenNearExpiry(expiresInOneHour, 30)).toBe(false);
  });

  test("returns true for already expired token", () => {
    const nowInSeconds = Date.now() / 1000;
    const expiredTenSecondsAgo = nowInSeconds - 10;
    expect(isTokenNearExpiry(expiredTenSecondsAgo, 30)).toBe(true);
  });

  test("uses default threshold of 30 seconds", () => {
    const nowInSeconds = Date.now() / 1000;
    const expiresInTwentySeconds = nowInSeconds + 20;
    expect(isTokenNearExpiry(expiresInTwentySeconds)).toBe(true);
  });
});

describe("shouldRefreshToken", () => {
  test("returns false for session without expires_at", () => {
    expect(shouldRefreshToken({})).toBe(false);
    expect(shouldRefreshToken(null)).toBe(false);
    expect(shouldRefreshToken(undefined)).toBe(false);
  });

  test("returns true for session with near expiry", () => {
    const nowInSeconds = Date.now() / 1000;
    const session = { expires_at: nowInSeconds + 10 };
    expect(shouldRefreshToken(session)).toBe(true);
  });

  test("returns false for session with distant expiry", () => {
    const nowInSeconds = Date.now() / 1000;
    const session = { expires_at: nowInSeconds + 3600 };
    expect(shouldRefreshToken(session)).toBe(false);
  });
});
