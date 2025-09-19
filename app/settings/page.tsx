import ProtectedRoute from "@/lib/protected-route";
import HomepageSettings from "@/app/components/admin/HomepageSettings";

export default function SettingsPage() {
  return (
    <ProtectedRoute>
      <div className="max-w-4xl mx-auto p-6 space-y-8">
        {/* Homepage Settings */}
        <HomepageSettings />
      </div>
    </ProtectedRoute>
  );
}
