"use client";

import { useSiteSettings } from "@/hooks/useSiteSettings";
import { useHomepageStats } from "@/hooks/useHomepageStats";
import { useTopStates } from "@/hooks/useTopStates";
import { useTopCities } from "@/hooks/useTopCities";

interface HomepageDataWrapperProps {
  children: React.ReactNode;
}

export default function HomepageDataWrapper({
  children,
}: HomepageDataWrapperProps) {
  const {
    settings,
    loading: settingsLoading,
    error: settingsError,
  } = useSiteSettings();
  const {
    stats,
    loading: statsLoading,
    error: statsError,
  } = useHomepageStats();
  const {
    loading: statesLoading,
    error: statesError,
  } = useTopStates(8);
  const {
    loading: citiesLoading,
    error: citiesError,
  } = useTopCities(12);

  const isLoading =
    settingsLoading || statsLoading || statesLoading || citiesLoading;
  const hasError = settingsError || statsError || statesError || citiesError;

  // Show error state if any data fails to load
  if (hasError) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center">
        <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <span className="text-2xl">⚠️</span>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-1">
          Error loading homepage data
        </h3>
        <p className="text-gray-600 mb-4">
          {settingsError || statsError || statesError || citiesError}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Show loading state while data is being fetched
  if (isLoading || !settings || !stats) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center">
        <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mb-4"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  // All critical data is loaded, render the homepage
  return <>{children}</>;
}
