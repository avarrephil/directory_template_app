import Link from "next/link";
import type { CityData } from "@/app/types/homepage";

interface CityCardProps {
  city: CityData;
}

export default function CityCard({ city }: CityCardProps) {
  return (
    <div className="city-card bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 p-6 border border-red-100 group hover:border-red-300">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <span className="text-3xl">🏙️</span>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-red-600 transition-colors">
              {city.city}
            </h3>
            <p className="text-sm text-gray-600">{city.state}</p>
          </div>
        </div>
      </div>

      <div className="space-y-2 mb-6">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Stores</span>
          <span className="font-semibold text-gray-900">
            {city.businessCount.toLocaleString()}
          </span>
        </div>
      </div>

      <Link
        href={`/browse-states?city=${encodeURIComponent(city.city)}&state=${encodeURIComponent(city.state)}`}
        className="btn-secondary inline-flex items-center justify-center w-full bg-red-600 hover:bg-red-700 py-2 px-4 rounded-md text-sm font-medium transition-colors duration-200"
      >
        View Directory
        <svg
          className="ml-2 w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </Link>
    </div>
  );
}
