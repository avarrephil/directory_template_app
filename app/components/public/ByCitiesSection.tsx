"use client";

import { useSiteSettings } from "@/hooks/useSiteSettings";
import { useTopCities } from "@/hooks/useTopCities";
import CityCard from "./CityCard";

export default function ByCitiesSection() {
  const { settings } = useSiteSettings();
  const { cities, loading } = useTopCities(8);

  // Don't render if disabled in settings
  if (settings && !settings.show_bycities_section) {
    return null;
  }

  return (
    <section className="homepage-section py-16 md:py-24 bg-red-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            {settings?.bycities_title}
          </h2>
          <p className="text-lg text-gray-600 max-w-4xl mx-auto leading-relaxed">
            {settings?.bycities_description}
          </p>
        </div>

        {/* Cities Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-lg shadow-md p-6 animate-pulse"
              >
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 bg-gray-300 rounded"></div>
                  <div className="space-y-1">
                    <div className="h-6 bg-gray-300 rounded w-24"></div>
                    <div className="h-4 bg-gray-300 rounded w-16"></div>
                  </div>
                </div>
                <div className="space-y-2 mb-6">
                  <div className="flex justify-between">
                    <div className="h-4 bg-gray-300 rounded w-12"></div>
                    <div className="h-4 bg-gray-300 rounded w-16"></div>
                  </div>
                </div>
                <div className="h-10 bg-gray-300 rounded"></div>
              </div>
            ))}
          </div>
        ) : cities.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {cities.map((city) => (
              <CityCard key={`${city.city}-${city.state}`} city={city} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">
              No city data available at the moment.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
