-- Cleanup safety: remove any lingering 'Unknown Product' records for all users
DELETE FROM public.maintenance_records WHERE product_name = 'Unknown Product';