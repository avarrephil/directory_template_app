"use client";

import ProtectedRoute from "@/lib/protected-route";
import { useAuth } from "@/lib/auth-context";

export default function UserDashboardPage() {
  const { profile } = useAuth();

  return (
    <ProtectedRoute requiredRole="user">
      <div className="max-w-6xl mx-auto p-6 space-y-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
              <span className="text-2xl">👋</span>
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Welcome back {profile?.first_name}!
            </h1>
            
            <p className="text-gray-600 mb-8">
              Your user dashboard is ready. More features coming soon!
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
              <div className="flex">
                <div className="flex-shrink-0">
                  <span className="text-blue-400">ℹ️</span>
                </div>
                <div className="ml-3 text-left">
                  <h3 className="text-sm font-medium text-blue-800">
                    Account Information
                  </h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <p><strong>Name:</strong> {profile?.first_name} {profile?.last_name}</p>
                    <p><strong>Role:</strong> {profile?.role}</p>
                    {profile?.phone_number && (
                      <p><strong>Phone:</strong> {profile.phone_number}</p>
                    )}
                    {profile?.owns_business && (
                      <p><strong>Business Owner:</strong> Yes</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Coming Soon
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="border border-gray-200 rounded-lg p-4 text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-xl">🔍</span>
              </div>
              <h3 className="font-medium text-gray-900 mb-2">Search Directory</h3>
              <p className="text-sm text-gray-500">
                Browse and search through business listings
              </p>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-4 text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-xl">⭐</span>
              </div>
              <h3 className="font-medium text-gray-900 mb-2">Favorites</h3>
              <p className="text-sm text-gray-500">
                Save and manage your favorite businesses
              </p>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-4 text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-xl">📊</span>
              </div>
              <h3 className="font-medium text-gray-900 mb-2">Analytics</h3>
              <p className="text-sm text-gray-500">
                View your activity and usage statistics
              </p>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}