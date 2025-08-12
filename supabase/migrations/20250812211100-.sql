-- Phase 1: Critical Data Exposure Fixes
-- Enable RLS and add policies to unprotected views

-- Enable RLS on contacts_export_view
ALTER TABLE public.contacts_export_view ENABLE ROW LEVEL SECURITY;

-- Add user-scoped policy to contacts_export_view
CREATE POLICY "Users can view their own contact exports" 
ON public.contacts_export_view 
FOR SELECT 
USING (auth.uid() = user_id);

-- Enable RLS on deal_collections_summary  
ALTER TABLE public.deal_collections_summary ENABLE ROW LEVEL SECURITY;

-- Add policy to deal_collections_summary (this view doesn't have user_id, so we need to join with deals table)
CREATE POLICY "Users can view deal collections for their deals" 
ON public.deal_collections_summary 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM deals d 
  WHERE d.id = deal_collections_summary.deal_id 
  AND d.user_id = auth.uid()
));

-- Phase 2: Fix Policy Conflicts
-- Remove overly permissive products table policy
DROP POLICY IF EXISTS "select_products" ON public.products;

-- Restrict automation logs to admin-only access
DROP POLICY IF EXISTS "Users can view automation logs" ON public.automation_logs;

CREATE POLICY "Admins can view automation logs" 
ON public.automation_logs 
FOR SELECT 
USING (get_current_user_role() = 'admin'::app_role);