-- Secure deal_collections_summary view: Recreate with security_invoker to respect underlying RLS
-- The current view exposes sensitive sales data without RLS protection

-- 1. Drop the existing view
DROP VIEW IF EXISTS public.deal_collections_summary;

-- 2. Recreate the view with security options that respect underlying table RLS
CREATE VIEW public.deal_collections_summary
WITH (
  security_invoker = on,
  security_barrier = true
)
AS
SELECT 
  d.id as deal_id,
  d.stage,
  d.value as total_sales,
  d.name as deal_name,
  d.account_name,
  d.deal_owner_name,
  d.contact_name,
  d.value as expected_value
FROM public.deals d;

-- 3. Restrict direct access to the view - only authenticated users can access
REVOKE ALL ON TABLE public.deal_collections_summary FROM PUBLIC;
REVOKE ALL ON TABLE public.deal_collections_summary FROM anon;
GRANT SELECT ON TABLE public.deal_collections_summary TO authenticated;
GRANT SELECT ON TABLE public.deal_collections_summary TO service_role;