"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import {
  getSupabaseClient,
  getCurrentUser,
  signOut as supabaseSignOut,
  updateActivityTimestamp,
  startSessionTimeouts,
  clearSessionTimeouts,
  type UserProfile,
  type AuthResult,
  type SignUpData,
} from "@/lib/supabase-client";
import { shouldSkipAuthRefresh } from "@/lib/auth-utils";
import { authLog } from "@/lib/auth-logger";

type AuthContextType = {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signUp: (userData: SignUpData) => Promise<AuthResult>;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signOut: () => Promise<{ success: boolean; error?: string }>;
  refreshAuth: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastAuthCheck, setLastAuthCheck] = useState<number>(0);
  const router = useRouter();

  // Track user activity for session management
  const trackActivity = () => {
    if (user) {
      updateActivityTimestamp();
    }
  };

  const refreshAuth = async (force: boolean = false) => {
    if (shouldSkipAuthRefresh(lastAuthCheck, force)) {
      authLog.info("Skipping auth refresh (recent check)");
      setLoading(false);
      return;
    }

    try {
      authLog.debug("Starting refreshAuth");
      setLoading(true);

      const result = await getCurrentUser();

      if (result.success) {
        setUser(result.user || null);
        setProfile(result.profile || null);
        setLastAuthCheck(Date.now());
      } else {
        authLog.error("getCurrentUser failed", result.error);
        setUser(null);
        setProfile(null);
      }
    } catch (error) {
      authLog.error("Auth refresh error", error);
      setUser(null);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (userData: SignUpData): Promise<AuthResult> => {
    const { signUp } = await import("@/lib/supabase-client");
    const result = await signUp(userData);

    if (result.success && result.user) {
      setUser(result.user);
      setProfile(result.profile || null);
      startSessionTimeouts();

      // Redirect based on role
      if (result.profile?.role === "admin") {
        router.push("/upload");
      } else {
        router.push("/user-dashboard");
      }
    }

    return result;
  };

  const handleSignIn = async (
    email: string,
    password: string
  ): Promise<AuthResult> => {
    const { signIn } = await import("@/lib/supabase-client");
    const result = await signIn(email, password);

    if (result.success && result.user) {
      setUser(result.user);
      setProfile(result.profile || null);
      startSessionTimeouts();

      // Redirect based on role
      if (result.profile?.role === "admin") {
        router.push("/upload");
      } else {
        router.push("/user-dashboard");
      }
    }

    return result;
  };

  const handleSignOut = async (): Promise<{
    success: boolean;
    error?: string;
  }> => {
    clearSessionTimeouts();
    const result = await supabaseSignOut();

    if (result.success) {
      setUser(null);
      setProfile(null);
      router.push("/login");
    }

    return result;
  };

  useEffect(() => {
    const supabase = getSupabaseClient();

    // Initial auth check
    refreshAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      authLog.debug("Auth state change", event);
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        if (session?.user) {
          const result = await getCurrentUser();
          if (result.success) {
            setUser(result.user || null);
            setProfile(result.profile || null);
            if (event === "SIGNED_IN") {
              startSessionTimeouts();
            }
          }
        }
      } else if (event === "SIGNED_OUT") {
        authLog.info("User signed out");
        clearSessionTimeouts();
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    // Add global activity listeners for session management
    const activityEvents = [
      "click",
      "keypress",
      "scroll",
      "mousemove",
      "touchstart",
    ];

    activityEvents.forEach((event) => {
      document.addEventListener(event, trackActivity, { passive: true });
    });

    return () => {
      subscription.unsubscribe();
      activityEvents.forEach((event) => {
        document.removeEventListener(event, trackActivity);
      });
      clearSessionTimeouts();
    };
  }, []);

  const value: AuthContextType = {
    user,
    profile,
    loading,
    signUp: handleSignUp,
    signIn: handleSignIn,
    signOut: handleSignOut,
    refreshAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
