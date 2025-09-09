"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { NavigationItem } from "@/app/types";

const adminNavigation: NavigationItem[] = [
  { name: "Upload", href: "/upload", current: false },
  { name: "Settings", href: "/settings", current: false },
];

const userNavigation: NavigationItem[] = [
  { name: "Home", href: "/user-dashboard", current: false },
  { name: "Settings", href: "/settings", current: false },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { profile, signOut } = useAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Get navigation items based on user role
  const navigation =
    profile?.role === "admin" ? adminNavigation : userNavigation;

  const updatedNavigation = navigation.map((item) => ({
    ...item,
    current: pathname === item.href,
  }));

  const handleLogout = async () => {
    await signOut();
    setShowLogoutConfirm(false);
  };

  return (
    <>
      <div className="flex h-full w-64 flex-col bg-gray-50 border-r border-gray-200">
        <div className="flex flex-1 flex-col pt-8 pb-4">
          <div className="px-6 mb-8">
            <h1 className="text-2xl font-bold text-gray-900">
              Business Directory
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              {profile?.role === "admin" ? "Admin Dashboard" : "User Dashboard"}
            </p>
          </div>
          <nav className="flex-1 space-y-1 px-3">
            {updatedNavigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200
                  ${
                    item.current
                      ? "bg-blue-100 text-blue-700 border-r-2 border-blue-600"
                      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  }
                `}
              >
                <span className="mr-3 text-lg">
                  {item.name === "Upload"
                    ? "📤"
                    : item.name === "Home"
                      ? "🏠"
                      : "⚙️"}
                </span>
                {item.name}
              </Link>
            ))}
          </nav>
          <div className="px-6 pt-4 border-t border-gray-200 space-y-4">
            {profile && (
              <div className="text-sm">
                <p className="font-medium text-gray-900">
                  {profile.first_name} {profile.last_name}
                </p>
                <p className="text-xs text-gray-500 capitalize">
                  {profile.role}
                </p>
              </div>
            )}

            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="w-full text-left text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 px-3 py-2 rounded-md transition-colors duration-200"
            >
              🚪 Logout
            </button>

            <p className="text-xs text-gray-500">Version 1.0.0</p>
          </div>
        </div>
      </div>

      {/* Logout Confirmation Dialog */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Confirm Logout
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                Are you sure you want to log out? You&apos;ll need to sign in
                again to access your dashboard.
              </p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
