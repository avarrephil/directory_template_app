"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import {
  getSupabaseClient,
  getCurrentUser,
  signOut as supabaseSignOut,
  type UserProfile,
  type AuthResult,
  type SignUpData,
} from "@/lib/supabase-client";

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
  const router = useRouter();

  const refreshAuth = async () => {
    try {
      setLoading(true);
      const result = await getCurrentUser();
      if (result.success) {
        setUser(result.user || null);
        setProfile(result.profile || null);
      } else {
        setUser(null);
        setProfile(null);
      }
    } catch (error) {
      console.error("Auth refresh error:", error);
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
      
      // Redirect based on role
      if (result.profile?.role === 'admin') {
        router.push('/upload');
      } else {
        router.push('/user-dashboard');
      }
    }
    
    return result;
  };

  const handleSignIn = async (email: string, password: string): Promise<AuthResult> => {
    const { signIn } = await import("@/lib/supabase-client");
    const result = await signIn(email, password);
    
    if (result.success && result.user) {
      setUser(result.user);
      setProfile(result.profile || null);
      
      // Redirect based on role
      if (result.profile?.role === 'admin') {
        router.push('/upload');
      } else {
        router.push('/user-dashboard');
      }
    }
    
    return result;
  };

  const handleSignOut = async (): Promise<{ success: boolean; error?: string }> => {
    const result = await supabaseSignOut();
    
    if (result.success) {
      setUser(null);
      setProfile(null);
      router.push('/login');
    }
    
    return result;
  };

  useEffect(() => {
    const supabase = getSupabaseClient();
    
    // Initial auth check
    refreshAuth();
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          if (session?.user) {
            const result = await getCurrentUser();
            if (result.success) {
              setUser(result.user || null);
              setProfile(result.profile || null);
            }
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setProfile(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
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

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};