-- Fix Security Issues - Critical Fixes (Corrected)

-- 1. Drop the security definer view and recreate without SECURITY DEFINER
DROP VIEW IF EXISTS public.contacts_import_view;

-- 2. Add trigger to prevent users from changing their own roles
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

-- 3. Add the trigger to profiles table
DROP TRIGGER IF EXISTS prevent_role_change_trigger ON public.profiles;
CREATE TRIGGER prevent_role_change_trigger
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_role_change();

-- 4. Add trigger to log role changes for audit purposes
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

-- 5. Add the audit trigger
DROP TRIGGER IF EXISTS log_role_change_trigger ON public.profiles;
CREATE TRIGGER log_role_change_trigger
  AFTER UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.log_role_change();

-- 6. Create a safer view for contact exports (without SECURITY DEFINER)
CREATE OR REPLACE VIEW public.contacts_export_view AS
SELECT 
  c.id,
  c.user_id,
  c.record_id AS "Record Id",
  c.contact_owner AS "Contact Owner",
  c.lead_source AS "Lead Source",
  c.first_name AS "First Name",
  c.last_name AS "Last Name",
  c.account_name AS "Account Name",
  c.vendor_name AS "Vendor Name",
  c.email AS "Email",
  c.title AS "Title",
  c.department AS "Department",
  c.phone AS "Phone",
  c.mobile AS "Mobile",
  c.created_by AS "Created By",
  c.modified_by AS "Modified By",
  c.contact_name AS "Contact Name",
  c.description AS "Description",
  c.salutation AS "Salutation",
  c.tag AS "Tag",
  c.reporting_to AS "Reporting To",
  c.email_opt_out AS "Email Opt Out",
  c.unsubscribed_mode AS "Unsubscribed Mode",
  c.unsubscribed_time AS "Unsubscribed Time",
  c.referrer AS "Referrer",
  c.first_page_visited AS "First Page Visited",
  c.general_phone AS "General Phone",
  c.direct_phone AS "Direct Phone",
  c.linkedin_connection AS "LinkedIn Connection",
  c.account_egnyte_link AS "Account Egnyte Link",
  c.name_pronunciation AS "Name Pronunciation",
  c.industry_fb_group_memberships AS "Industry & FB Group Memberships",
  c.role_in_deals AS "Role in deals",
  c.street AS "Street",
  c.city AS "City",
  c.zip_code AS "Zip Code",
  c.state AS "State",
  c.country AS "Country",
  c.county AS "County",
  c.enrich_status AS "Enrich Status",
  c.reference_type AS "Reference Type",
  c.reference_subject_matter AS "Reference Subject Matter, Use Case & Department",
  c.reference_egnyte_link AS "Reference Egnyte Link",
  c.reference_services_products AS "Reference Services Products & Solutions",
  c.conferences_organizations_attended AS "Conferences & Organizations Attended",
  c.notes,
  c.created_at,
  c.updated_at
FROM public.contacts c;