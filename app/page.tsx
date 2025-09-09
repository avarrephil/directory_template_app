"use client";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center">
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Home Page</h1>
        <p className="text-gray-600 mb-4">The app is running!</p>
        <div className="space-y-2">
          <a href="/login" className="block text-blue-600 hover:text-blue-800 underline">
            Go to Login
          </a>
          <a href="/debug" className="block text-blue-600 hover:text-blue-800 underline">
            Go to Debug
          </a>
        </div>
      </div>
    </div>
  );
}
