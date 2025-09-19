"use client";

import { useState, useEffect } from "react";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import type { SiteSettings } from "@/app/types/homepage";

interface HomepageSettingsProps {
  onSuccess?: () => void;
}

export default function HomepageSettings({ onSuccess }: HomepageSettingsProps) {
  const { settings, loading, error, updateSettings } = useSiteSettings();
  const [formData, setFormData] = useState<Partial<SiteSettings>>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (settings) {
      setFormData({
        directory_name: settings.directory_name,
        logo_url: settings.logo_url || "",
        primary_color: settings.primary_color,
        secondary_color: settings.secondary_color,
        hero_title: settings.hero_title,
        hero_subtitle: settings.hero_subtitle,
        hero_description: settings.hero_description,
        browse_all_cta: settings.browse_all_cta,
        view_top_cta: settings.view_top_cta,
        bystate_title: settings.bystate_title,
        bystate_description: settings.bystate_description,
        show_bystate_section: settings.show_bystate_section,
        bycities_title: settings.bycities_title,
        bycities_description: settings.bycities_description,
        show_bycities_section: settings.show_bycities_section,
        // New color fields
        hero_title_color: settings.hero_title_color,
        hero_subtitle_color: settings.hero_subtitle_color,
        hero_description_color: settings.hero_description_color,
        stats_text_color: settings.stats_text_color,
        browse_all_button_bg_color: settings.browse_all_button_bg_color,
        browse_all_button_text_color: settings.browse_all_button_text_color,
        view_top_button_bg_color: settings.view_top_button_bg_color,
        view_top_button_text_color: settings.view_top_button_text_color,
        view_top_button_border_color: settings.view_top_button_border_color,
      });
    }
  }, [settings]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleCheckboxChange = (name: keyof SiteSettings, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    const result = await updateSettings(formData);

    if (result.success) {
      setSaveSuccess(true);
      onSuccess?.();
      setTimeout(() => setSaveSuccess(false), 3000);
    } else {
      setSaveError(result.error || "Failed to save settings");
    }

    setSaving(false);
  };

  const updateCSSVariables = () => {
    if (formData.primary_color) {
      document.documentElement.style.setProperty(
        "--homepage-primary",
        formData.primary_color
      );
    }
    if (formData.secondary_color) {
      document.documentElement.style.setProperty(
        "--homepage-secondary",
        formData.secondary_color
      );
    }
  };

  useEffect(() => {
    updateCSSVariables();
  }, [formData.primary_color, formData.secondary_color]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-300 rounded w-1/3"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-300 rounded"></div>
            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-6">
        Homepage Customization
      </h3>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {saveSuccess && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
          <p className="text-sm text-green-600">Settings saved successfully!</p>
        </div>
      )}

      {saveError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{saveError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Settings */}
        <div>
          <h4 className="text-lg font-medium text-gray-900 mb-4">
            Basic Settings
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Directory Name
              </label>
              <input
                type="text"
                name="directory_name"
                value={formData.directory_name || ""}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Logo URL
              </label>
              <input
                type="url"
                name="logo_url"
                value={formData.logo_url || ""}
                onChange={handleInputChange}
                placeholder="https://example.com/logo.png"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Color Settings */}
        <div>
          <h4 className="text-lg font-medium text-gray-900 mb-4">
            Color Theme
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Primary Color
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  name="primary_color"
                  value={formData.primary_color || "#2563eb"}
                  onChange={handleInputChange}
                  className="h-10 w-20 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  name="primary_color"
                  value={formData.primary_color || "#2563eb"}
                  onChange={handleInputChange}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Secondary Color
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  name="secondary_color"
                  value={formData.secondary_color || "#1e40af"}
                  onChange={handleInputChange}
                  className="h-10 w-20 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  name="secondary_color"
                  value={formData.secondary_color || "#1e40af"}
                  onChange={handleInputChange}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Hero Section */}
        <div>
          <h4 className="text-lg font-medium text-gray-900 mb-4">
            Hero Section
          </h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hero Title
              </label>
              <input
                type="text"
                name="hero_title"
                value={formData.hero_title || ""}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hero Subtitle
              </label>
              <input
                type="text"
                name="hero_subtitle"
                value={formData.hero_subtitle || ""}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hero Description
              </label>
              <textarea
                name="hero_description"
                value={formData.hero_description || ""}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Browse All Button Text
                </label>
                <input
                  type="text"
                  name="browse_all_cta"
                  value={formData.browse_all_cta || ""}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  View Top Button Text
                </label>
                <input
                  type="text"
                  name="view_top_cta"
                  value={formData.view_top_cta || ""}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Hero Section Colors */}
        <div>
          <h4 className="text-lg font-medium text-gray-900 mb-4">
            Hero Section Colors
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hero Title Color
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  name="hero_title_color"
                  value={formData.hero_title_color || "#ffffff"}
                  onChange={handleInputChange}
                  className="h-10 w-20 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  name="hero_title_color"
                  value={formData.hero_title_color || "#ffffff"}
                  onChange={handleInputChange}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hero Subtitle Color
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  name="hero_subtitle_color"
                  value={formData.hero_subtitle_color || "#f97316"}
                  onChange={handleInputChange}
                  className="h-10 w-20 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  name="hero_subtitle_color"
                  value={formData.hero_subtitle_color || "#f97316"}
                  onChange={handleInputChange}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hero Description Color
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  name="hero_description_color"
                  value={formData.hero_description_color || "#ffffff"}
                  onChange={handleInputChange}
                  className="h-10 w-20 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  name="hero_description_color"
                  value={formData.hero_description_color || "#ffffff"}
                  onChange={handleInputChange}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Card Colors */}
        <div>
          <h4 className="text-lg font-medium text-gray-900 mb-4">
            Statistics Card Colors
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Statistics Text Color
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  name="stats_text_color"
                  value={formData.stats_text_color || "#f97316"}
                  onChange={handleInputChange}
                  className="h-10 w-20 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  name="stats_text_color"
                  value={formData.stats_text_color || "#f97316"}
                  onChange={handleInputChange}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Button Colors */}
        <div>
          <h4 className="text-lg font-medium text-gray-900 mb-4">
            Button Colors
          </h4>
          <div className="space-y-6">
            <div>
              <h5 className="text-md font-medium text-gray-800 mb-3">
                Browse All States Button
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Background Color
                  </label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="color"
                      name="browse_all_button_bg_color"
                      value={formData.browse_all_button_bg_color || "#f97316"}
                      onChange={handleInputChange}
                      className="h-10 w-20 border border-gray-300 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      name="browse_all_button_bg_color"
                      value={formData.browse_all_button_bg_color || "#f97316"}
                      onChange={handleInputChange}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Text Color
                  </label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="color"
                      name="browse_all_button_text_color"
                      value={formData.browse_all_button_text_color || "#000000"}
                      onChange={handleInputChange}
                      className="h-10 w-20 border border-gray-300 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      name="browse_all_button_text_color"
                      value={formData.browse_all_button_text_color || "#000000"}
                      onChange={handleInputChange}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h5 className="text-md font-medium text-gray-800 mb-3">
                View Top States Button
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Background Color
                  </label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="color"
                      name="view_top_button_bg_color"
                      value={formData.view_top_button_bg_color || "#00000000"}
                      onChange={handleInputChange}
                      className="h-10 w-20 border border-gray-300 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      name="view_top_button_bg_color"
                      value={formData.view_top_button_bg_color || "transparent"}
                      onChange={handleInputChange}
                      placeholder="transparent or #color"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Text Color
                  </label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="color"
                      name="view_top_button_text_color"
                      value={formData.view_top_button_text_color || "#ffffff"}
                      onChange={handleInputChange}
                      className="h-10 w-20 border border-gray-300 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      name="view_top_button_text_color"
                      value={formData.view_top_button_text_color || "#ffffff"}
                      onChange={handleInputChange}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Border Color
                  </label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="color"
                      name="view_top_button_border_color"
                      value={formData.view_top_button_border_color || "#ffffff"}
                      onChange={handleInputChange}
                      className="h-10 w-20 border border-gray-300 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      name="view_top_button_border_color"
                      value={formData.view_top_button_border_color || "#ffffff"}
                      onChange={handleInputChange}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* By State Section */}
        <div>
          <h4 className="text-lg font-medium text-gray-900 mb-4">
            By State Section
          </h4>
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={formData.show_bystate_section || false}
                onChange={(e) =>
                  handleCheckboxChange("show_bystate_section", e.target.checked)
                }
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 text-sm font-medium text-gray-700">
                Show By State Section
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Section Title
              </label>
              <input
                type="text"
                name="bystate_title"
                value={formData.bystate_title || ""}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Section Description
              </label>
              <textarea
                name="bystate_description"
                value={formData.bystate_description || ""}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* By Cities Section */}
        <div>
          <h4 className="text-lg font-medium text-gray-900 mb-4">
            By Cities Section
          </h4>
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={formData.show_bycities_section || false}
                onChange={(e) =>
                  handleCheckboxChange(
                    "show_bycities_section",
                    e.target.checked
                  )
                }
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 text-sm font-medium text-gray-700">
                Show By Cities Section
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Section Title
              </label>
              <input
                type="text"
                name="bycities_title"
                value={formData.bycities_title || ""}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Section Description
              </label>
              <textarea
                name="bycities_description"
                value={formData.bycities_description || ""}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="pt-4 border-t border-gray-200">
          <button
            type="submit"
            disabled={saving}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Saving..." : "Save Homepage Settings"}
          </button>
        </div>
      </form>
    </div>
  );
}
