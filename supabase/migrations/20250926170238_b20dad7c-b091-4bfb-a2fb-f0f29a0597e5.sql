-- Fix critical security issue: Remove insecure contacts_export_view
-- Views cannot have RLS policies, so we need to remove this security risk

-- Drop the contacts_export_view as it exposes all contact data without proper access control
DROP VIEW IF EXISTS public.contacts_export_view;

-- Create a secure function instead that respects user access controls
CREATE OR REPLACE FUNCTION public.get_contacts_export_data(requesting_user_id uuid DEFAULT auth.uid())
RETURNS TABLE (
  id uuid,
  "First Name" text,
  "Last Name" text,
  email text,
  phone text,
  mobile text,
  title text,
  department text,
  "Account Name" text,
  city text,
  state text,
  country text,
  "Lead Source" text,
  notes text,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    c.id,
    c.first_name,
    c.last_name,
    c.email,
    c.phone,
    c.mobile,
    c.title,
    c.department,
    c.account_name,
    c.city,
    c.state,
    c.country,
    c.lead_source,
    c.notes,
    c.created_at,
    c.updated_at
  FROM public.contacts c
  WHERE 
    -- Users can only access their own contacts
    (c.user_id = requesting_user_id)
    OR 
    -- Admins can access all contacts
    (public.get_current_user_role() = 'admin'::app_role);
$$;