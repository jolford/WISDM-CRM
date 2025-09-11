-- Enable Row Level Security on the contacts export view
ALTER TABLE public.contacts_export_view ENABLE ROW LEVEL SECURITY;

-- Add RLS policy to ensure users can only see their own contact data in the export view
CREATE POLICY "Users can view their own contacts in export view" 
ON public.contacts_export_view 
FOR SELECT 
USING (auth.uid() = user_id);

-- Also fix the deal_collections_summary view for complete security
ALTER TABLE public.deal_collections_summary ENABLE ROW LEVEL SECURITY;

-- Add RLS policy for deal collections summary to ensure users only see their own deals
CREATE POLICY "Users can view their own deal collections" 
ON public.deal_collections_summary 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.deals 
  WHERE deals.id = deal_collections_summary.deal_id 
  AND deals.user_id = auth.uid()
));