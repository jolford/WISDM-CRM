-- Secure deal_collections_summary view further
-- Recreate with security_barrier + security_invoker and enforce privileges

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
  COALESCE(SUM(di.paid_amount), 0) AS total_sales
FROM public.deals d
LEFT JOIN public.deal_invoices di ON d.id = di.deal_id
WHERE d.user_id = auth.uid()
GROUP BY d.id, d.name, d.account_name, d.contact_name, d.deal_owner_name, d.stage, d.value;

-- Restrict access to authenticated users only (JWT must be present)
REVOKE ALL ON public.deal_collections_summary FROM anon;
GRANT SELECT ON public.deal_collections_summary TO authenticated;