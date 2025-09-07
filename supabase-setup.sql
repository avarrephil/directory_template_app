-- Supabase setup script for Business Directory App
-- This schema matches the existing UploadedFile TypeScript interface

-- Create uploaded_files table
CREATE TABLE IF NOT EXISTS uploaded_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  size BIGINT NOT NULL,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status TEXT NOT NULL CHECK (status IN ('uploaded', 'processing', 'completed', 'error')),
  storage_path TEXT, -- Path in Supabase storage bucket
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

CREATE TRIGGER update_uploaded_files_updated_at 
    BEFORE UPDATE ON uploaded_files 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Create storage bucket for CSV files
INSERT INTO storage.buckets (id, name, public)
VALUES ('csv_files', 'csv_files', false)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies
-- Allow authenticated users to upload files
CREATE POLICY "Allow file uploads" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'csv_files');

-- Allow authenticated users to view their uploaded files
CREATE POLICY "Allow file downloads" ON storage.objects
FOR SELECT USING (bucket_id = 'csv_files');

-- Allow authenticated users to delete their files
CREATE POLICY "Allow file deletions" ON storage.objects
FOR DELETE USING (bucket_id = 'csv_files');

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_uploaded_files_status ON uploaded_files(status);
CREATE INDEX IF NOT EXISTS idx_uploaded_files_uploaded_at ON uploaded_files(uploaded_at DESC);
CREATE INDEX IF NOT EXISTS idx_uploaded_files_name ON uploaded_files(name);

-- Insert sample data (optional - matches existing mock data structure)
INSERT INTO uploaded_files (name, size, uploaded_at, status, storage_path) VALUES
('restaurants_downtown.csv', 2456789, '2024-01-15 10:30:00+00', 'completed', 'uploads/sample-1/restaurants_downtown.csv'),
('cafes_midtown.csv', 1234567, '2024-01-14 14:20:00+00', 'processing', 'uploads/sample-2/cafes_midtown.csv'),
('bakeries_uptown.csv', 987654, '2024-01-13 09:15:00+00', 'error', 'uploads/sample-3/bakeries_uptown.csv')
ON CONFLICT (id) DO NOTHING;