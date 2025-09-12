-- Secure deal_collections_summary table: Enable RLS and restrict access to user's own deals
-- This table currently has no RLS protection and exposes sensitive sales data

-- 1. Enable Row Level Security
ALTER TABLE public.deal_collections_summary ENABLE ROW LEVEL SECURITY;

-- 2. Create policy to allow users to only view summary data for their own deals
CREATE POLICY "Users can view summary for their own deals" 
ON public.deal_collections_summary 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 
    FROM public.deals d 
    WHERE d.id = deal_collections_summary.deal_id 
    AND d.user_id = auth.uid()
  )
);

-- 3. Allow authenticated users to insert summary data only for their own deals
CREATE POLICY "Users can insert summary for their own deals" 
ON public.deal_collections_summary 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 
    FROM public.deals d 
    WHERE d.id = deal_collections_summary.deal_id 
    AND d.user_id = auth.uid()
  )
);

-- 4. Allow authenticated users to update summary data only for their own deals
CREATE POLICY "Users can update summary for their own deals" 
ON public.deal_collections_summary 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 
    FROM public.deals d 
    WHERE d.id = deal_collections_summary.deal_id 
    AND d.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 
    FROM public.deals d 
    WHERE d.id = deal_collections_summary.deal_id 
    AND d.user_id = auth.uid()
  )
);

-- 5. Allow authenticated users to delete summary data only for their own deals
CREATE POLICY "Users can delete summary for their own deals" 
ON public.deal_collections_summary 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 
    FROM public.deals d 
    WHERE d.id = deal_collections_summary.deal_id 
    AND d.user_id = auth.uid()
  )
);