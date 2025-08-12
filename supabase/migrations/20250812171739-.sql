-- Fix critical security issue: Remove public access to sales table
-- This removes the overly permissive policy that allows anyone to read all sales data

-- Drop the dangerous "sales_read_all_auth" policy that allows public access
DROP POLICY IF EXISTS "sales_read_all_auth" ON public.sales;

-- Add a secure policy that only allows users to see their own sales data
CREATE POLICY "Users can view their own sales data" 
ON public.sales 
FOR SELECT 
USING (created_by = auth.uid());

-- Verify that the secure, user-scoped policies remain:
-- ✓ "sales_insert_own" - users can only create sales for themselves  
-- ✓ "sales_update_own" - users can only update their own sales
-- ✓ "Users can view their own sales data" - users can only see their own sales data

-- All policies now properly restrict access to created_by = auth.uid()