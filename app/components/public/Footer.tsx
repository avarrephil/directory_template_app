"use client";

import Link from "next/link";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { STATE_EMOJIS } from "@/app/types/homepage";

export default function Footer() {
  const { settings } = useSiteSettings();

  // All US states for the footer listing
  const allStates = Object.keys(STATE_EMOJIS).sort();

  // Popular states (top 4 for quick links)
  const popularStates = ["California", "Texas", "New York", "Florida"];

  return (
    <footer className="site-footer bg-gray-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              {settings?.logo_url ? (
                <img
                  src={settings.logo_url}
                  alt={settings.directory_name}
                  className="h-8 w-8 rounded"
                />
              ) : (
                <div className="h-8 w-8 bg-blue-600 rounded flex items-center justify-center">
                  <span className="text-white text-sm font-bold">
                    {settings?.directory_name?.charAt(0)}
                  </span>
                </div>
              )}
              <span className="text-lg font-bold">
                {settings?.directory_name}
              </span>
            </div>
            <p className="text-white text-sm leading-relaxed">
              Your trusted source for finding discount appliances with minor
              cosmetic damage. Save 30-70% on quality appliances across all 50
              US states.
            </p>
            <div className="flex items-center space-x-2">
              <span className="text-white">📧</span>
              <Link
                href="/contact"
                className="text-white hover:text-gray-200 text-sm transition-colors"
              >
                Contact
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Quick Links</h3>
            <div className="space-y-2">
              <Link
                href="/"
                className="block text-white hover:text-gray-200 text-sm transition-colors"
              >
                Home
              </Link>
              <Link
                href="/browse-states"
                className="block text-white hover:text-gray-200 text-sm transition-colors"
              >
                Browse All States
              </Link>
              <Link
                href="/about"
                className="block text-white hover:text-gray-200 text-sm transition-colors"
              >
                About Us
              </Link>
              <Link
                href="/contact"
                className="block text-white hover:text-gray-200 text-sm transition-colors"
              >
                Contact Us
              </Link>
            </div>
          </div>

          {/* Popular States */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Popular States</h3>
            <div className="space-y-2">
              {popularStates.map((state) => (
                <Link
                  key={state}
                  href={`/browse-states?state=${encodeURIComponent(state)}`}
                  className="block text-white hover:text-gray-200 text-sm transition-colors"
                >
                  {state}
                </Link>
              ))}
              <Link
                href="/browse-states"
                className="block text-white hover:text-gray-200 text-sm transition-colors font-medium"
              >
                View All States →
              </Link>
            </div>
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Resources</h3>
            <div className="space-y-2">
              <Link
                href="/browse-states"
                className="block text-white hover:text-gray-200 text-sm transition-colors"
              >
                Submit a Store
              </Link>
              <Link
                href="/contact"
                className="block text-white hover:text-gray-200 text-sm transition-colors"
              >
                Send Feedback
              </Link>
              <Link
                href="/about"
                className="block text-white hover:text-gray-200 text-sm transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="/about"
                className="block text-white hover:text-gray-200 text-sm transition-colors"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>

        {/* All States Section */}
        <div className="border-t border-gray-700 pt-8 mt-8">
          <h3 className="text-lg font-semibold mb-4 text-center">
            Browse Scratch & Dent Appliances by State
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 text-sm">
            {allStates.map((state) => (
              <Link
                key={state}
                href={`/browse-states?state=${encodeURIComponent(state)}`}
                className="text-white hover:text-gray-200 transition-colors py-1"
              >
                {state} Scratch & Dent Stores
              </Link>
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 pt-8 mt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-white text-sm">
              © 2025 Scratch & Dent Appliance Directory. All rights reserved.
            </p>
            <div className="flex items-center space-x-6 text-sm">
              <span className="text-white font-medium">
                10,000+ Store Listings
              </span>
              <span className="text-white font-medium">50 US States</span>
              <span className="text-white font-medium">Save 30-70%</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
