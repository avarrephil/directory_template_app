"use client";

import { useState, useEffect } from "react";
import { getSupabaseClient } from "@/lib/supabase-client";
import { brand } from "@/lib/types";
import type {
  SiteSettings,
  SiteSettingsId,
  SiteSettingsResponse,
} from "@/app/types/homepage";

const DEFAULT_SETTINGS_ID = "00000000-0000-0000-0000-000000000001";

export const useSiteSettings = () => {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const supabase = getSupabaseClient();

      const { data, error: fetchError } = await supabase
        .from("site_settings")
        .select("*")
        .eq("id", DEFAULT_SETTINGS_ID)
        .single();

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      if (data) {
        const dbData = data as any;
        const settings: SiteSettings = {
          id: brand<string, "SiteSettingsId">(dbData.id),
          directory_name: dbData.directory_name,
          logo_url: dbData.logo_url || undefined,
          primary_color: dbData.primary_color,
          secondary_color: dbData.secondary_color,
          hero_title: dbData.hero_title,
          hero_subtitle: dbData.hero_subtitle,
          hero_description: dbData.hero_description,
          browse_all_cta: dbData.browse_all_cta,
          view_top_cta: dbData.view_top_cta,
          bystate_title: dbData.bystate_title,
          bystate_description: dbData.bystate_description,
          show_bystate_section: dbData.show_bystate_section,
          bycities_title: dbData.bycities_title,
          bycities_description: dbData.bycities_description,
          show_bycities_section: dbData.show_bycities_section,
          // New color fields with defaults
          hero_title_color: dbData.hero_title_color || "#ffffff",
          hero_subtitle_color: dbData.hero_subtitle_color || "#f97316",
          hero_description_color: dbData.hero_description_color || "#ffffff",
          stats_text_color: dbData.stats_text_color || "#f97316",
          browse_all_button_bg_color:
            dbData.browse_all_button_bg_color || "#f97316",
          browse_all_button_text_color:
            dbData.browse_all_button_text_color || "#000000",
          view_top_button_bg_color:
            dbData.view_top_button_bg_color || "transparent",
          view_top_button_text_color:
            dbData.view_top_button_text_color || "#ffffff",
          view_top_button_border_color:
            dbData.view_top_button_border_color || "#ffffff",
          updated_at: dbData.updated_at,
        };
        setSettings(settings);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch settings");
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (
    updates: Partial<Omit<SiteSettings, "id" | "updated_at">>
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const supabase = getSupabaseClient();

      const updateData: any = {
        ...updates,
        updated_at: new Date().toISOString(),
      };

      const { error: updateError } = await (supabase as any)
        .from("site_settings")
        .update(updateData)
        .eq("id", DEFAULT_SETTINGS_ID);

      if (updateError) {
        throw new Error(updateError.message);
      }

      // Refresh settings after update
      await fetchSettings();
      return { success: true };
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to update settings";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return {
    settings,
    loading,
    error,
    updateSettings,
    refetch: fetchSettings,
  };
};
