import Link from "next/link";
import type { StateData } from "@/app/types/homepage";

interface StateCardProps {
  state: StateData;
}

export default function StateCard({ state }: StateCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 p-6 border border-gray-100 group hover:border-blue-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <span className="text-3xl">{state.emoji}</span>
          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
            {state.state}
          </h3>
        </div>
      </div>

      <div className="space-y-2 mb-6">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Stores</span>
          <span className="font-semibold text-gray-900">
            {state.businessCount.toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Cities</span>
          <span className="font-semibold text-gray-900">
            {state.cityCount.toLocaleString()}
          </span>
        </div>
      </div>

      <Link
        href={`/browse-states?state=${encodeURIComponent(state.state)}`}
        className="btn-primary inline-flex items-center justify-center w-full bg-blue-600 hover:bg-blue-700 py-2 px-4 rounded-md text-sm font-medium transition-colors duration-200"
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
