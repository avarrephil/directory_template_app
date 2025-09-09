"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

type ProtectedRouteProps = {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'user';
  redirectTo?: string;
};

export default function ProtectedRoute({ 
  children, 
  requiredRole,
  redirectTo
}: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    // Redirect to login if not authenticated
    if (!user) {
      router.push('/login');
      return;
    }

    // Check role-based access
    if (requiredRole && profile?.role !== requiredRole) {
      // Redirect based on user's actual role
      if (profile?.role === 'admin') {
        router.push('/upload');
      } else if (profile?.role === 'user') {
        router.push('/user-dashboard');
      } else {
        router.push('/login');
      }
      return;
    }

    // Custom redirect
    if (redirectTo) {
      router.push(redirectTo);
      return;
    }
  }, [user, profile, loading, requiredRole, redirectTo, router]);

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center">
        <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mb-4"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  // Don't render anything if redirecting
  if (!user) {
    return null;
  }

  // Don't render if role doesn't match
  if (requiredRole && profile?.role !== requiredRole) {
    return null;
  }

  return <>{children}</>;
}