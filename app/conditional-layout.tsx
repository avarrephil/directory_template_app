"use client";

import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import Sidebar from "@/app/components/sidebar";
import Topbar from "@/app/components/topbar";

export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();

  // Auth pages that should not show sidebar/topbar
  const authPages = ['/login', '/signup', '/forgot-password'];
  const isAuthPage = authPages.includes(pathname);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center">
        <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mb-4"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  // If user is not authenticated, show auth pages without layout
  if (!user || isAuthPage) {
    return <>{children}</>;
  }

  // If user is authenticated, show dashboard layout with sidebar and topbar
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
}