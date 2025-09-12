export const AUTH_CONFIG = Object.freeze({
  // Auth request timeout: 3-5s (was 15s)
  TIMEOUT_MS: 4000,

  // Caching auth checks: 1-5 min (was 30s)
  CACHE_DURATION_MS: 3 * 60 * 1000, // 3 minutes

  // Session timeouts
  IDLE_SESSION_TIMEOUT_MS: 20 * 60 * 1000, // 20 minutes
  ABSOLUTE_SESSION_TIMEOUT_MS: 12 * 60 * 60 * 1000, // 12 hours

  // Token lifetimes
  ACCESS_TOKEN_LIFETIME_SECONDS: 10 * 60, // 10 minutes
  REFRESH_TOKEN_LIFETIME_SECONDS: 14 * 24 * 60 * 60, // 14 days

  RETRY_ATTEMPTS: 2,
  LOG_LEVEL: process.env.NODE_ENV === "development" ? "debug" : "error",
} as const);

export type AuthTimeoutResponse = {
  data: { user: null };
  error: null;
};

export type LogLevel = typeof AUTH_CONFIG.LOG_LEVEL;
