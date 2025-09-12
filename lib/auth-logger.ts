import { AUTH_CONFIG } from "./auth-config";

// Check if we're on an auth page where missing sessions are expected
const isAuthPage = (): boolean => {
  if (typeof window === "undefined") return false;
  const authPages = [
    "/login",
    "/signup",
    "/forgot-password",
    "/reset-password",
  ];
  return authPages.includes(window.location.pathname);
};

export const authLog = {
  debug: (message: string, data?: unknown) => {
    if (AUTH_CONFIG.LOG_LEVEL === "debug") {
      console.log(`🔍 [AUTH] ${message}`, data || "");
    }
  },
  error: (message: string, error?: unknown) => {
    // Suppress expected auth errors on auth pages
    if (
      isAuthPage() &&
      (message.includes("Auth session missing") ||
        message.includes("getCurrentUser failed") ||
        message.includes("Supabase auth error"))
    ) {
      return; // Silent on auth pages
    }
    // Always log errors in production and development otherwise
    console.error(`❌ [AUTH] ${message}`, error || "");
  },
  warn: (message: string, data?: unknown) => {
    // Suppress expected auth warnings on auth pages
    if (
      isAuthPage() &&
      (message.includes("Auth session missing") ||
        message.includes("getCurrentUser failed") ||
        message.includes("Auth request timed out"))
    ) {
      return; // Silent on auth pages
    }
    // Always log warnings in production and development otherwise
    console.warn(`⚠️ [AUTH] ${message}`, data || "");
  },
  info: (message: string, data?: unknown) => {
    if (AUTH_CONFIG.LOG_LEVEL === "debug") {
      console.log(`ℹ️ [AUTH] ${message}`, data || "");
    }
  },
  timeout: (message: string) => {
    // Timeouts should be logged as warnings in production
    if (AUTH_CONFIG.LOG_LEVEL === "debug") {
      console.log(`⏰ [AUTH] ${message}`);
    } else {
      console.warn(`⏰ [AUTH] ${message}`);
    }
  },
  success: (message: string, data?: unknown) => {
    if (AUTH_CONFIG.LOG_LEVEL === "debug") {
      console.log(`✅ [AUTH] ${message}`, data || "");
    }
  },
};
