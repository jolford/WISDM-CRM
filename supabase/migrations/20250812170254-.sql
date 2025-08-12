-- Fix critical security issue: Remove public access policies for tickets table
-- This removes the overly permissive policies that allow anyone to read all tickets

-- Drop the dangerous "Allow select for all users" policy
DROP POLICY IF EXISTS "Allow select for all users" ON public.tickets;

-- Drop the redundant "Allow insert for all users" policy  
-- (we already have "Users can insert own tickets" which is properly scoped)
DROP POLICY IF EXISTS "Allow insert for all users" ON public.tickets;

-- Verify that the secure, user-scoped policies remain:
-- ✓ "Users can view own tickets" - users can only see their own tickets
-- ✓ "Users can insert own tickets" - users can only create tickets for themselves  
-- ✓ "Users can update own tickets" - users can only update their own tickets
-- ✓ "Users can delete own tickets" - users can only delete their own tickets

-- All remaining policies properly restrict access to user_id = auth.uid()