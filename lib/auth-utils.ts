import { AUTH_CONFIG } from "./auth-config";
import { authLog } from "./auth-logger";

export const shouldSkipAuthRefresh = (
  lastCheck: number,
  force: boolean
): boolean => {
  if (force) {
    authLog.debug("Forcing auth refresh");
    return false;
  }

  if (lastCheck === 0) {
    authLog.debug("First auth check, not skipping");
    return false;
  }

  const now = Date.now();
  const timeSinceLastCheck = now - lastCheck;
  const shouldSkip = timeSinceLastCheck < AUTH_CONFIG.CACHE_DURATION_MS;

  if (shouldSkip) {
    const remainingTime = Math.ceil(
      (AUTH_CONFIG.CACHE_DURATION_MS - timeSinceLastCheck) / 1000
    );
    authLog.debug(
      `Skipping auth refresh, cache valid for ${remainingTime}s more`
    );
  } else {
    authLog.debug("Cache expired, proceeding with auth refresh");
  }

  return shouldSkip;
};

export const isTokenNearExpiry = (
  tokenExp: number,
  thresholdSeconds: number = 30
): boolean => {
  const now = Date.now() / 1000; // Convert to seconds
  const timeUntilExpiry = tokenExp - now;
  return timeUntilExpiry <= thresholdSeconds;
};

export const shouldRefreshToken = (session: any): boolean => {
  if (!session?.expires_at) {
    authLog.debug("No session expiry time found");
    return false;
  }

  const isNearExpiry = isTokenNearExpiry(session.expires_at);
  if (isNearExpiry) {
    authLog.debug("Token is near expiry, should refresh");
  }

  return isNearExpiry;
};
