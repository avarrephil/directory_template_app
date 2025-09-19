export const AUTH_CONFIG = Object.freeze({
  // Auth request timeout: Reasonable 10s for initial checks
  TIMEOUT_MS: 10000,

  // Caching auth checks: Increased to 10 minutes
  CACHE_DURATION_MS: 10 * 60 * 1000, // 10 minutes

  // Session timeouts - Aligned with Supabase server defaults
  IDLE_SESSION_TIMEOUT_MS: 1 * 60 * 60 * 1000, // 1 hour idle timeout
  ABSOLUTE_SESSION_TIMEOUT_MS: 24 * 60 * 60 * 1000, // 24 hours absolute

  // Token lifetimes - Aligned with Supabase server defaults
  ACCESS_TOKEN_LIFETIME_SECONDS: 1 * 60 * 60, // 1 hour
  REFRESH_TOKEN_LIFETIME_SECONDS: 30 * 24 * 60 * 60, // 30 days

  RETRY_ATTEMPTS: 2,
  LOG_LEVEL: process.env.NODE_ENV === "development" ? "debug" : "error",
} as const);

export type AuthTimeoutResponse = {
  data: { user: null };
  error: null;
};

export type LogLevel = typeof AUTH_CONFIG.LOG_LEVEL;
