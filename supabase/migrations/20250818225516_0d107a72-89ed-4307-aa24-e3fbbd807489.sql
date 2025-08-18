-- Secure deal_collections_summary against unauthorized access
-- Strategy: Drop and recreate the view with security_barrier + security_invoker
-- and enforce filtering by current user unless role is admin/manager.
-- Also restrict privileges to authenticated role only.

-- 1) Recreate secure view
DROP VIEW IF EXISTS public.deal_collections_summary;

CREATE VIEW public.deal_collections_summary
WITH (
  security_invoker = true,
  security_barrier = true
) AS
SELECT 
  d.id AS deal_id,
  d.name AS deal_name,
  d.account_name,
  d.contact_name,
  d.deal_owner_name,
  d.stage,
  d.value AS expected_value,
  COALESCE(SUM(CASE WHEN di.status = 'paid' THEN di.paid_amount ELSE 0 END), 0) AS total_sales
FROM public.deals d
LEFT JOIN public.deal_invoices di ON di.deal_id = d.id
-- Enforce per-user visibility; allow admins/managers to view all
WHERE (
  public.get_current_user_role() IN ('admin', 'manager')
  OR d.user_id = auth.uid()
)
GROUP BY d.id, d.name, d.account_name, d.contact_name, d.deal_owner_name, d.stage, d.value;

-- 2) Tighten privileges
REVOKE ALL ON public.deal_collections_summary FROM PUBLIC;
REVOKE ALL ON public.deal_collections_summary FROM anon;
GRANT SELECT ON public.deal_collections_summary TO authenticated;

-- Note: RLS is not applicable to views; underlying tables (deals, deal_invoices)
-- already have RLS ensuring only owners can access their rows.