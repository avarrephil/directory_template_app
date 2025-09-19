"use client";

import Link from "next/link";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { useHomepageStats } from "@/hooks/useHomepageStats";
import StatCard from "./StatCard";

export default function HeroSection() {
  const { settings } = useSiteSettings();
  const { stats, loading: statsLoading } = useHomepageStats();

  return (
    <section
      className="relative bg-gradient-to-br from-blue-600 to-blue-800 text-white overflow-hidden"
      style={
        {
          "--hero-title-color": settings?.hero_title_color,
          "--hero-subtitle-color": settings?.hero_subtitle_color,
          "--hero-description-color": settings?.hero_description_color,
          "--stats-text-color": settings?.stats_text_color,
          "--browse-all-bg": settings?.browse_all_button_bg_color,
          "--browse-all-text": settings?.browse_all_button_text_color,
          "--view-top-bg": settings?.view_top_button_bg_color,
          "--view-top-text": settings?.view_top_button_text_color,
          "--view-top-border": settings?.view_top_button_border_color,
        } as React.CSSProperties
      }
    >
      {/* Background decoration */}
      <div className="absolute inset-0 bg-black/10"></div>
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-10 left-10 w-20 h-20 bg-white rounded-full"></div>
          <div className="absolute top-32 right-20 w-16 h-16 bg-white rounded-full"></div>
          <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-white rounded-full"></div>
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="text-center mb-16">
          {/* Main heading */}
          <h1
            className="text-4xl md:text-6xl font-bold mb-6 leading-tight"
            style={{ color: "var(--hero-title-color)" }}
          >
            {settings?.hero_title}
          </h1>

          {/* Subtitle with dynamic color */}
          <h2 className="text-2xl md:text-3xl font-semibold mb-8">
            <span style={{ color: "var(--hero-subtitle-color)" }}>
              {settings?.hero_subtitle}
            </span>
          </h2>

          {/* Description */}
          <p
            className="text-lg md:text-xl max-w-4xl mx-auto mb-12 leading-relaxed"
            style={{ color: "var(--hero-description-color)" }}
          >
            {settings?.hero_description}
          </p>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto">
            <StatCard
              value={stats?.totalBusinesses}
              label="Store Listings"
              loading={statsLoading}
            />
            <StatCard
              value={stats?.statesCovered}
              label="States Covered"
              loading={statsLoading}
            />
            <StatCard
              value={stats?.citiesCovered}
              label="Cities"
              loading={statsLoading}
            />
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/browse-states"
              className="px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg"
              style={{
                backgroundColor: "var(--browse-all-bg)",
                color: "var(--browse-all-text)",
              }}
            >
              {settings?.browse_all_cta}
            </Link>
            <Link
              href="/browse-states"
              className="px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-200 backdrop-blur-sm border-2"
              style={{
                backgroundColor: "var(--view-top-bg)",
                color: "var(--view-top-text)",
                borderColor: "var(--view-top-border)",
              }}
            >
              {settings?.view_top_cta}
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom wave decoration */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          className="w-full h-12 md:h-20"
          fill="white"
        >
          <path d="M0,60 C400,0 800,120 1200,60 L1200,120 L0,120 Z" />
        </svg>
      </div>
    </section>
  );
}
