-- Add company_name and contact_name columns to deals table
ALTER TABLE public.deals 
ADD COLUMN company_name TEXT,
ADD COLUMN contact_name TEXT;