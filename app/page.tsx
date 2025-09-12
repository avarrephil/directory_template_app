"use client";

import { useRouter } from "next/navigation";
import { checkAuthState, getDashboardRoute } from "@/lib/client-auth-utils";

export default function Home() {
  const router = useRouter();

  const handleDashboardClick = async () => {
    try {
      const { user, profile } = await checkAuthState();
      const route = getDashboardRoute(profile);
      router.push(route);
    } catch (error) {
      console.error("Dashboard navigation error:", error);
      router.push("/login");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center">
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Home Page</h1>
        <p className="text-gray-600 mb-4">The app is running!</p>
        <div className="space-y-2">
          <a
            href="/login"
            className="block text-blue-600 hover:text-blue-800 underline"
          >
            Go to Login
          </a>
          <a
            href="/debug"
            className="block text-blue-600 hover:text-blue-800 underline"
          >
            Go to Debug
          </a>
          <button
            onClick={handleDashboardClick}
            className="block text-blue-600 hover:text-blue-800 underline bg-transparent border-none cursor-pointer p-0 text-left"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
