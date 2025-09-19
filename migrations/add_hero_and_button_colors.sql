-- Migration: Add hero section and button color controls
-- This adds color fields for hero text, statistics, and buttons

ALTER TABLE site_settings 
ADD COLUMN hero_title_color TEXT DEFAULT '#ffffff',
ADD COLUMN hero_subtitle_color TEXT DEFAULT '#f97316',  -- Orange color
ADD COLUMN hero_description_color TEXT DEFAULT '#ffffff',
ADD COLUMN stats_text_color TEXT DEFAULT '#f97316',     -- Orange color  
ADD COLUMN browse_all_button_bg_color TEXT DEFAULT '#f97316',     -- Orange color
ADD COLUMN browse_all_button_text_color TEXT DEFAULT '#000000',   -- Black text
ADD COLUMN view_top_button_bg_color TEXT DEFAULT 'transparent',   -- Transparent background
ADD COLUMN view_top_button_text_color TEXT DEFAULT '#ffffff',     -- White text  
ADD COLUMN view_top_button_border_color TEXT DEFAULT '#ffffff';   -- White border