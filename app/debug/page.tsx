"use client";

export default function DebugPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center">
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Debug Page</h1>
        <p className="text-gray-600 mb-4">This page works without authentication.</p>
        <div className="space-y-2">
          <p>Environment variables:</p>
          <ul className="list-disc pl-5 text-sm">
            <li>NEXT_PUBLIC_SUPABASE_URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? "Set" : "Missing"}</li>
            <li>NEXT_PUBLIC_SUPABASE_ANON_KEY: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "Set" : "Missing"}</li>
          </ul>
        </div>
        <div className="mt-4">
          <a href="/login" className="text-blue-600 hover:text-blue-800 underline">
            Go to Login
          </a>
        </div>
      </div>
    </div>
  );
}