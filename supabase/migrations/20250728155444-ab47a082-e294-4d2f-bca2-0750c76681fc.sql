-- Add folder and last_accessed fields to reports table
ALTER TABLE public.reports 
ADD COLUMN folder_name text DEFAULT 'General Reports',
ADD COLUMN last_accessed_at timestamp with time zone DEFAULT now(),
ADD COLUMN created_by_name text DEFAULT 'System User';

-- Update existing reports with sample folder assignments
UPDATE public.reports 
SET folder_name = CASE 
  WHEN name ILIKE '%deal%' OR name ILIKE '%pipeline%' OR name ILIKE '%forecast%' THEN 'Deal Reports'
  WHEN name ILIKE '%contact%' OR name ILIKE '%account%' OR name ILIKE '%company%' THEN 'Account and Contact Reports'
  WHEN name ILIKE '%maintenance%' OR name ILIKE '%software%' THEN 'Maintenance Reports'
  WHEN name ILIKE '%campaign%' OR name ILIKE '%marketing%' THEN 'Campaign Reports'
  ELSE 'General Reports'
END;