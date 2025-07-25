-- Add deal_owner_name column to deals table
ALTER TABLE public.deals 
ADD COLUMN deal_owner_name TEXT;