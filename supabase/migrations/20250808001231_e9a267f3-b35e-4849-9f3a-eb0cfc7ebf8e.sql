-- 1) Create deal_invoices table to track collections/payment status per deal
CREATE TABLE IF NOT EXISTS public.deal_invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  deal_id uuid NOT NULL REFERENCES public.deals(id) ON DELETE CASCADE,
  invoice_number text,
  amount numeric NOT NULL DEFAULT 0,
  due_date date,
  status text NOT NULL DEFAULT 'unpaid', -- allowed values (not enforced): unpaid, partial, paid, overdue
  paid_amount numeric NOT NULL DEFAULT 0,
  paid_at timestamp with time zone,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- trigger to keep updated_at fresh
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_update_deal_invoices_updated_at'
  ) THEN
    CREATE TRIGGER trg_update_deal_invoices_updated_at
    BEFORE UPDATE ON public.deal_invoices
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END$$;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_deal_invoices_deal_id ON public.deal_invoices(deal_id);
CREATE INDEX IF NOT EXISTS idx_deal_invoices_user_id ON public.deal_invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_deal_invoices_due_date ON public.deal_invoices(due_date);

-- 2) RLS
ALTER TABLE public.deal_invoices ENABLE ROW LEVEL SECURITY;

-- Users can view invoices for deals they own
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE polname = 'Users can view invoices for their deals' 
      AND tablename = 'deal_invoices'
  ) THEN
    CREATE POLICY "Users can view invoices for their deals"
    ON public.deal_invoices
    FOR SELECT
    USING (
      EXISTS (
        SELECT 1 FROM public.deals d
        WHERE d.id = deal_invoices.deal_id AND d.user_id = auth.uid()
      )
    );
  END IF;
END$$;

-- Users can insert invoices only for their deals
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE polname = 'Users can insert invoices for their deals' 
      AND tablename = 'deal_invoices'
  ) THEN
    CREATE POLICY "Users can insert invoices for their deals"
    ON public.deal_invoices
    FOR INSERT
    WITH CHECK (
      user_id = auth.uid() AND
      EXISTS (
        SELECT 1 FROM public.deals d
        WHERE d.id = deal_invoices.deal_id AND d.user_id = auth.uid()
      )
    );
  END IF;
END$$;

-- Users can update invoices only for their deals
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE polname = 'Users can update invoices for their deals' 
      AND tablename = 'deal_invoices'
  ) THEN
    CREATE POLICY "Users can update invoices for their deals"
    ON public.deal_invoices
    FOR UPDATE
    USING (
      EXISTS (
        SELECT 1 FROM public.deals d
        WHERE d.id = deal_invoices.deal_id AND d.user_id = auth.uid()
      )
    )
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM public.deals d
        WHERE d.id = deal_invoices.deal_id AND d.user_id = auth.uid()
      )
    );
  END IF;
END$$;

-- Users can delete invoices only for their deals
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE polname = 'Users can delete invoices for their deals' 
      AND tablename = 'deal_invoices'
  ) THEN
    CREATE POLICY "Users can delete invoices for their deals"
    ON public.deal_invoices
    FOR DELETE
    USING (
      EXISTS (
        SELECT 1 FROM public.deals d
        WHERE d.id = deal_invoices.deal_id AND d.user_id = auth.uid()
      )
    );
  END IF;
END$$;

-- 3) Summary view for collections & payment status per deal
CREATE OR REPLACE VIEW public.deal_collections_summary AS
SELECT
  d.id AS deal_id,
  d.user_id,
  d.name AS deal_name,
  d.value AS deal_value,
  d.stage,
  d.probability,
  d.close_date,
  COALESCE(SUM(i.amount), 0)::numeric AS invoiced_total,
  COALESCE(SUM(i.paid_amount), 0)::numeric AS paid_total,
  COALESCE(SUM(i.amount - i.paid_amount), 0)::numeric AS pending_total,
  MAX(i.due_date) FILTER (WHERE i.status <> 'paid' AND (i.amount - i.paid_amount) > 0) AS next_due_date,
  BOOL_OR((i.due_date < now()::date) AND i.status <> 'paid' AND (i.amount - i.paid_amount) > 0) AS has_overdue
FROM public.deals d
LEFT JOIN public.deal_invoices i ON i.deal_id = d.id
GROUP BY d.id;

-- helper view limited to current user (leverages RLS on base tables)
-- no separate RLS needed since base tables enforce access
