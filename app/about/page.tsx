"use client";

import Link from "next/link";
import Navbar from "@/app/components/public/Navbar";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">About Us</h1>

          <div className="prose prose-lg text-gray-600 space-y-6">
            <p>
              Welcome to Business Directory,
              your trusted source for finding quality local businesses across
              the United States.
            </p>

            <p>
              Our platform connects consumers with businesses offering
              discounted products and services, including scratch and dent
              appliances, factory seconds, and other quality goods with minor
              cosmetic imperfections. We believe everyone deserves access to
              quality products at affordable prices.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">
              Our Mission
            </h2>
            <p>
              To make quality appliances and products accessible to everyone by
              connecting customers with local businesses that specialize in
              discounted goods, helping families save money without sacrificing
              quality.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">
              What We Offer
            </h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                Comprehensive directory of scratch and dent appliance stores
              </li>
              <li>Coverage across all 50 US states</li>
              <li>
                Detailed store information including contact details and
                locations
              </li>
              <li>Regular updates to ensure accuracy</li>
              <li>Easy-to-use search and filtering tools</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">
              Why Choose Us
            </h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Extensive network of verified business partners</li>
              <li>
                Commitment to helping consumers save 30-70% on quality products
              </li>
              <li>User-friendly platform designed for easy navigation</li>
              <li>Dedicated customer support</li>
              <li>Regular content updates and new listings</li>
            </ul>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                Join Our Community
              </h3>
              <p className="text-blue-800">
                Whether you&apos;re a consumer looking for great deals or a business
                owner wanting to reach more customers, we&apos;re here to help you
                connect and save money together.
              </p>
            </div>
          </div>

          <div className="mt-12 text-center">
            <Link
              href="/"
              className="btn-primary inline-flex items-center bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-md font-medium transition-colors duration-200 mr-4"
            >
              ← Back to Homepage
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-md font-medium transition-colors duration-200"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
