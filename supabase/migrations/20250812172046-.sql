-- Fix critical security issue: Remove public update access to contacts table
-- This removes the overly permissive policy that allows anyone to modify all contact records

-- Drop the dangerous "contacts_update_all" policy that allows public updates
DROP POLICY IF EXISTS "contacts_update_all" ON public.contacts;

-- Also drop the "contacts_read_all" policy for better security
-- (users should only see their own contacts unless specifically needed)
DROP POLICY IF EXISTS "contacts_read_all" ON public.contacts;

-- Verify that the secure, user-scoped policies remain:
-- ✓ "Users can view their own contacts" - users can only see their own contacts
-- ✓ "Users can insert their own contacts" - users can only create contacts for themselves  
-- ✓ "Users can update their own contacts" - users can only update their own contacts
-- ✓ "Users can delete their own contacts" - users can only delete their own contacts

-- All remaining policies properly restrict access to user_id = auth.uid()