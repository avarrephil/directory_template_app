"use client";

import Link from "next/link";
import { useState } from "react";
import { useSiteSettings } from "@/hooks/useSiteSettings";

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { settings } = useSiteSettings();

  const menuItems = [
    { name: "Home", href: "/" },
    { name: "Browse States", href: "/browse-states" },
    { name: "About Us", href: "/about" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <nav className="topbar-nav bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Directory Name */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-3">
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
              <span className="text-xl font-bold text-gray-900">
                {settings?.directory_name}
              </span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              {menuItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-black hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors duration-200"
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Browse Directory Button */}
          <div className="hidden md:block">
            <Link
              href="/browse-states"
              className="btn-primary bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
            >
              Browse Directory
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            >
              <span className="sr-only">Open main menu</span>
              {/* Hamburger icon */}
              <svg
                className="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={
                    isMobileMenuOpen
                      ? "M6 18L18 6M6 6l12 12"
                      : "M4 6h16M4 12h16M4 18h16"
                  }
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
            {menuItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-black hover:text-blue-600 block px-3 py-2 text-base font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <Link
              href="/browse-states"
              className="btn-primary bg-blue-600 hover:bg-blue-700 block px-3 py-2 rounded-md text-base font-medium mt-4"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Browse Directory
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
