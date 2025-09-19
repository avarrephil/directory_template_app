import type { Brand } from "@/lib/types";
import { brand } from "@/lib/types";

// Branded type for site settings ID
export type SiteSettingsId = Brand<string, "SiteSettingsId">;

export interface SiteSettings {
  id: SiteSettingsId;
  directory_name: string;
  logo_url?: string;
  primary_color: string;
  secondary_color: string;
  hero_title: string;
  hero_subtitle: string;
  hero_description: string;
  browse_all_cta: string;
  view_top_cta: string;
  bystate_title: string;
  bystate_description: string;
  show_bystate_section: boolean;
  bycities_title: string;
  bycities_description: string;
  show_bycities_section: boolean;
  // New color fields
  hero_title_color: string;
  hero_subtitle_color: string;
  hero_description_color: string;
  stats_text_color: string;
  browse_all_button_bg_color: string;
  browse_all_button_text_color: string;
  view_top_button_bg_color: string;
  view_top_button_text_color: string;
  view_top_button_border_color: string;
  updated_at: string;
}

export interface HomepageStats {
  totalBusinesses: number;
  statesCovered: number;
  citiesCovered: number;
}

export interface StateData {
  state: string;
  businessCount: number;
  cityCount: number;
  emoji: string;
}

export interface CityData {
  city: string;
  state: string;
  businessCount: number;
}

// State emoji mapping
export const STATE_EMOJIS: Record<string, string> = {
  // A States
  Alabama: "🏛️",
  Alaska: "🏔️",
  Arizona: "🌵",
  Arkansas: "💎",

  // C States
  California: "🌴",
  Colorado: "🏔️",
  Connecticut: "🌰",

  // D States
  Delaware: "🏛️",

  // F States
  Florida: "🌴",

  // G States
  Georgia: "🍑",

  // H States
  Hawaii: "🌺",

  // I States
  Idaho: "🏔️",
  Illinois: "🏢",
  Indiana: "🏁",
  Iowa: "🌽",

  // K States
  Kansas: "🌾",
  Kentucky: "🐎",

  // L States
  Louisiana: "⚜️",

  // M States
  Maine: "🦞",
  Maryland: "🦀",
  Massachusetts: "🚢",
  Michigan: "🚗",
  Minnesota: "❄️",
  Mississippi: "🎵",
  Missouri: "⭐",
  Montana: "🦬",

  // N States
  Nebraska: "🌾",
  Nevada: "🎰",
  "New Hampshire": "🏔️",
  "New Jersey": "🏖️",
  "New Mexico": "🌶️",
  "New York": "🗽",
  "North Carolina": "🏔️",
  "North Dakota": "🌾",

  // O States
  Ohio: "🏭",
  Oklahoma: "🏛️",
  Oregon: "🌲",

  // P States
  Pennsylvania: "🔔",

  // R States
  "Rhode Island": "🏖️",

  // S States
  "South Carolina": "🏖️",
  "South Dakota": "🗿",

  // T States
  Tennessee: "🎵",
  Texas: "⭐",

  // U States
  Utah: "🏔️",

  // V States
  Vermont: "🍁",
  Virginia: "🏛️",

  // W States
  Washington: "☕",
  "West Virginia": "🏔️",
  Wisconsin: "🧀",
  Wyoming: "🦌",
};

// Database response types
export interface SiteSettingsResponse {
  id: string;
  directory_name: string;
  logo_url?: string;
  primary_color: string;
  secondary_color: string;
  hero_title: string;
  hero_subtitle: string;
  hero_description: string;
  browse_all_cta: string;
  view_top_cta: string;
  bystate_title: string;
  bystate_description: string;
  show_bystate_section: boolean;
  bycities_title: string;
  bycities_description: string;
  show_bycities_section: boolean;
  updated_at: string;
}

export interface BusinessStatsResponse {
  total_businesses: number;
  states_covered: number;
  cities_covered: number;
}

export interface StateStatsResponse {
  state: string;
  business_count: number;
  city_count: number;
}

export interface CityStatsResponse {
  city: string;
  state: string;
  business_count: number;
}
