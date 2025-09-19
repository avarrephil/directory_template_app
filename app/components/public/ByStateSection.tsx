"use client";

import { useSiteSettings } from "@/hooks/useSiteSettings";
import { useTopStates } from "@/hooks/useTopStates";
import StateCard from "./StateCard";

export default function ByStateSection() {
  const { settings } = useSiteSettings();
  const { states, loading } = useTopStates(8);

  // Don't render if disabled in settings
  if (settings && !settings.show_bystate_section) {
    return null;
  }

  return (
    <section className="py-16 md:py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            {settings?.bystate_title}
          </h2>
          <p className="text-lg text-gray-600 max-w-4xl mx-auto leading-relaxed">
            {settings?.bystate_description}
          </p>
        </div>

        {/* States Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-lg shadow-md p-6 animate-pulse"
              >
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 bg-gray-300 rounded"></div>
                  <div className="h-6 bg-gray-300 rounded w-24"></div>
                </div>
                <div className="space-y-2 mb-6">
                  <div className="flex justify-between">
                    <div className="h-4 bg-gray-300 rounded w-12"></div>
                    <div className="h-4 bg-gray-300 rounded w-16"></div>
                  </div>
                  <div className="flex justify-between">
                    <div className="h-4 bg-gray-300 rounded w-10"></div>
                    <div className="h-4 bg-gray-300 rounded w-12"></div>
                  </div>
                </div>
                <div className="h-10 bg-gray-300 rounded"></div>
              </div>
            ))}
          </div>
        ) : states.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {states.map((state) => (
              <StateCard key={state.state} state={state} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">
              No state data available at the moment.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
