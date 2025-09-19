"use client";

import Link from "next/link";
import Navbar from "@/app/components/public/Navbar";

export default function BrowseStatesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">
            Browse States
          </h1>
          <p className="text-lg text-gray-600 mb-12">
            This page is currently under construction. Please check back soon
            for a comprehensive listing of all states and their business
            directories.
          </p>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
            <div className="text-6xl mb-4">🚧</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Coming Soon
            </h2>
            <p className="text-gray-600 mb-6">
              We&apos;re working hard to bring you a detailed state-by-state
              directory of local businesses. This page will feature:
            </p>
            <ul className="text-left text-gray-600 space-y-2 max-w-md mx-auto mb-8">
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                Interactive state map
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                Detailed business listings by state
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                Search and filter functionality
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                Contact information and store details
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <Link
              href="/"
              className="btn-primary inline-flex items-center bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-md font-medium transition-colors duration-200"
            >
              ← Back to Homepage
            </Link>
            <div>
              <Link
                href="/contact"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Contact us for updates
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
