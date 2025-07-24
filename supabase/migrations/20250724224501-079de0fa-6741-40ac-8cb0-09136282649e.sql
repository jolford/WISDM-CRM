-- Phase 1: Fix Critical Privilege Escalation Vulnerability
-- Drop existing policies that allow users to update their own profiles (including roles)
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Create separate policies for different update operations
-- Users can only update their personal information (not role or is_active)
CREATE POLICY "Users can update their own personal info"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Only admins can update roles and active status
CREATE POLICY "Admins can update user roles and status"
ON public.profiles
FOR UPDATE
USING (get_current_user_role() = 'admin'::app_role)
WITH CHECK (get_current_user_role() = 'admin'::app_role);

-- Add a database function to prevent role changes by non-admins
CREATE OR REPLACE FUNCTION public.prevent_role_change()
RETURNS TRIGGER AS $$
BEGIN
  -- If role or is_active is being changed and user is not admin
  IF (OLD.role != NEW.role OR OLD.is_active != NEW.is_active) AND 
     get_current_user_role() != 'admin'::app_role THEN
    RAISE EXCEPTION 'Only admins can change user roles or active status';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to prevent unauthorized role changes
DROP TRIGGER IF EXISTS prevent_unauthorized_role_change ON public.profiles;
CREATE TRIGGER prevent_unauthorized_role_change
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_role_change();

-- Add a database function to log role changes for audit trail
CREATE OR REPLACE FUNCTION public.log_role_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Only log if role actually changed
  IF OLD.role != NEW.role THEN
    -- In a production system, you'd insert into an audit log table
    -- For now, we'll use pg_notify to signal the change
    PERFORM pg_notify('role_change', json_build_object(
      'user_id', NEW.id,
      'old_role', OLD.role,
      'new_role', NEW.role,
      'changed_by', auth.uid(),
      'timestamp', now()
    )::text);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for role change logging
DROP TRIGGER IF EXISTS profile_role_change_log ON public.profiles;
CREATE TRIGGER profile_role_change_log
  AFTER UPDATE ON public.profiles
  FOR EACH ROW
  WHEN (OLD.role IS DISTINCT FROM NEW.role)
  EXECUTE FUNCTION public.log_role_change();

-- Phase 2: Fix Security Definer View Issue
-- Drop the problematic security definer view and recreate without security definer
DROP VIEW IF EXISTS public.contacts_import_view;

-- Recreate the view without SECURITY DEFINER (will use caller's permissions)
CREATE VIEW public.contacts_import_view AS
SELECT 
  id,
  user_id,
  company_id,
  record_id AS "Record Id",
  contact_owner AS "Contact Owner",
  lead_source AS "Lead Source",
  first_name AS "First Name",
  last_name AS "Last Name",
  account_name AS "Account Name",
  vendor_name AS "Vendor Name",
  email AS "Email",
  title AS "Title",
  phone AS "Phone",
  department AS "Department",
  mobile AS "Mobile",
  email_opt_out AS "Email Opt Out",
  created_by AS "Created By",
  modified_by AS "Modified By",
  contact_name AS "Contact Name",
  description AS "Description",
  salutation AS "Salutation",
  tag AS "Tag",
  reporting_to AS "Reporting To",
  notes,
  last_activity_time AS "Last Activity Time",
  unsubscribed_time AS "Unsubscribed Time",
  unsubscribed_mode AS "Unsubscribed Mode",
  change_log_time AS "Change Log Time",
  first_visit AS "First Visit",
  visitor_score AS "Visitor Score",
  referrer AS "Referrer",
  first_page_visited AS "First Page Visited",
  average_time_spent_minutes AS "Average Time Spent (Minutes)",
  most_recent_visit AS "Most Recent Visit",
  number_of_chats AS "Number Of Chats",
  days_visited AS "Days Visited",
  locked AS "Locked",
  last_enriched_time AS "Last Enriched Time",
  created_at,
  updated_at,
  account_name_id AS "Account Name.id",
  vendor_name_id AS "Vendor Name.id",
  contact_owner_id AS "Contact Owner.id",
  created_by_id AS "Created By.id",
  modified_by_id AS "Modified By.id",
  reporting_to_id AS "Reporting To.id",
  created_time AS "Created Time",
  modified_time AS "Modified Time",
  general_phone AS "General Phone",
  direct_phone AS "Direct Phone",
  linkedin_connection AS "LinkedIn Connection",
  account_egnyte_link AS "Account Egnyte Link",
  name_pronunciation AS "Name Pronunciation",
  industry_fb_group_memberships AS "Industry & FB Group Memberships",
  role_in_deals AS "Role in deals",
  street AS "Street",
  city AS "City",
  zip_code AS "Zip Code",
  state AS "State",
  country AS "Country",
  county AS "County",
  enrich_status AS "Enrich Status",
  reference_type AS "Reference Type",
  reference_subject_matter AS "Reference Subject Matter, Use Case & Department",
  reference_egnyte_link AS "Reference Egnyte Link",
  reference_services_products AS "Reference Services Products & Solutions",
  conferences_organizations_attended AS "Conferences & Organizations Attended"
FROM public.contacts;

-- Phase 3: Strengthen INSERT RLS Policies
-- Add explicit INSERT policies with user_id validation for all main tables

-- Companies table - ensure user_id is properly set
DROP POLICY IF EXISTS "Users can insert their own companies" ON public.companies;
CREATE POLICY "Users can insert their own companies"
ON public.companies
FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND
  user_id IS NOT NULL
);

-- Contacts table - ensure user_id is properly set  
DROP POLICY IF EXISTS "Users can insert their own contacts" ON public.contacts;
CREATE POLICY "Users can insert their own contacts"
ON public.contacts
FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND
  user_id IS NOT NULL
);

-- Deals table - ensure user_id is properly set
DROP POLICY IF EXISTS "Users can insert their own deals" ON public.deals;
CREATE POLICY "Users can insert their own deals"
ON public.deals
FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND
  user_id IS NOT NULL
);

-- Tasks table - ensure user_id is properly set
DROP POLICY IF EXISTS "Users can insert their own tasks" ON public.tasks;
CREATE POLICY "Users can insert their own tasks"
FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND
  user_id IS NOT NULL
);