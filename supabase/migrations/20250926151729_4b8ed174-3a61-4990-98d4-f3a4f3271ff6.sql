-- Add missing financial columns to maintenance_records
ALTER TABLE public.maintenance_records
  ADD COLUMN IF NOT EXISTS income numeric NULL,
  ADD COLUMN IF NOT EXISTS profit numeric NULL,
  ADD COLUMN IF NOT EXISTS margin_percent numeric NULL;

-- Optional: simple backfill for profit/margin if data exists in some rows (kept minimal/no-op if null)
UPDATE public.maintenance_records
SET profit = CASE WHEN income IS NOT NULL AND cost IS NOT NULL THEN income - cost ELSE profit END,
    margin_percent = CASE WHEN income IS NOT NULL AND income != 0 AND profit IS NOT NULL THEN ROUND((profit / income) * 100, 2) ELSE margin_percent END;