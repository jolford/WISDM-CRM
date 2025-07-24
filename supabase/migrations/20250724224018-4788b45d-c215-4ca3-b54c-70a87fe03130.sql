-- Add missing columns to match CSV headers exactly
ALTER TABLE public.contacts 
ADD COLUMN record_id TEXT,
ADD COLUMN contact_owner_id UUID,
ADD COLUMN created_by_id UUID,
ADD COLUMN created_by TEXT,
ADD COLUMN modified_by_id UUID,
ADD COLUMN modified_by TEXT,
ADD COLUMN created_time TIMESTAMP WITH TIME ZONE,
ADD COLUMN modified_time TIMESTAMP WITH TIME ZONE;

-- Update existing column names to match CSV if needed (we'll use aliases in queries)
-- The existing columns are fine, we just need the additional ones