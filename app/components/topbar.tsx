"use client";

import { usePathname } from "next/navigation";

const getPageTitle = (pathname: string): string => {
  if (pathname === "/upload") return "Upload Files";
  if (pathname === "/settings") return "Settings";
  return "Dashboard";
};

const getPageDescription = (pathname: string): string => {
  if (pathname === "/upload") return "Upload and manage your CSV data files";
  if (pathname === "/settings") return "Configure your directory settings";
  return "Welcome to your business directory admin panel";
};

export default function Topbar() {
  const pathname = usePathname();
  const title = getPageTitle(pathname);
  const description = getPageDescription(pathname);

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-500">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">A</span>
          </div>
        </div>
      </div>
    </div>
  );
}
