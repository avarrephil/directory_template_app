'use client'

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NavigationItem } from '@/app/types';

const navigation: NavigationItem[] = [
  { name: 'Upload', href: '/upload', current: false },
  { name: 'Settings', href: '/settings', current: false },
];

export default function Sidebar() {
  const pathname = usePathname();

  const updatedNavigation = navigation.map((item) => ({
    ...item,
    current: pathname === item.href,
  }));

  return (
    <div className="flex h-full w-64 flex-col bg-gray-50 border-r border-gray-200">
      <div className="flex flex-1 flex-col pt-8 pb-4">
        <div className="px-6 mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Business Directory
          </h1>
          <p className="text-sm text-gray-600 mt-1">Admin Dashboard</p>
        </div>
        <nav className="flex-1 space-y-1 px-3">
          {updatedNavigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`
                group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200
                ${
                  item.current
                    ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-600'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }
              `}
            >
              <span className="mr-3 text-lg">
                {item.name === 'Upload' ? '📤' : '⚙️'}
              </span>
              {item.name}
            </Link>
          ))}
        </nav>
        <div className="px-6 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Version 1.0.0
          </p>
        </div>
      </div>
    </div>
  );
}