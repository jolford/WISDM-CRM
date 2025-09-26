-- Fix critical security issue: Replace insecure deal_collections_summary view
-- Current view exposes all deals without access control

-- Drop the insecure view
DROP VIEW IF EXISTS public.deal_collections_summary;

-- Create secure function to replace the view
CREATE OR REPLACE FUNCTION public.get_deal_collections_summary(requesting_user_id uuid DEFAULT auth.uid())
RETURNS TABLE(
  deal_id uuid,
  stage deal_stage,
  total_sales numeric,
  deal_name text,
  account_name text,
  deal_owner_name text,
  contact_name text,
  expected_value numeric
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    d.id AS deal_id,
    d.stage,
    d.value AS total_sales,
    d.name AS deal_name,
    d.account_name,
    d.deal_owner_name,
    d.contact_name,
    d.value AS expected_value
  FROM public.deals d
  WHERE 
    -- Users can only access their own deals
    (d.user_id = requesting_user_id)
    OR 
    -- Admins can access all deals
    (public.get_current_user_role() = 'admin'::app_role);
$$;

-- Grant access to authenticated users
GRANT EXECUTE ON FUNCTION public.get_deal_collections_summary TO authenticated;