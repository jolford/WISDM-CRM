-- Fix the security definer view issue by recreating views with security_invoker=on
-- This ensures views use the querying user's permissions and respect RLS policies

-- Drop existing views
DROP VIEW IF EXISTS public.contacts_export_view;
DROP VIEW IF EXISTS public.deal_collections_summary;

-- Recreate contacts_export_view with security_invoker=on to respect RLS
CREATE VIEW public.contacts_export_view
WITH (security_invoker=on)
AS
SELECT 
  c.id,
  c.first_name AS "First Name",
  c.last_name AS "Last Name",
  c.contact_name AS "Contact Name",
  c.email AS "Email",
  c.phone AS "Phone",
  c.mobile AS "Mobile",
  c.title AS "Title",
  c.department AS "Department",
  c.account_name AS "Account Name",
  c.vendor_name AS "Vendor Name",
  c.street AS "Street",
  c.city AS "City",
  c.state AS "State",
  c.zip_code AS "Zip Code",
  c.country AS "Country",
  c.county AS "County",
  c.salutation AS "Salutation",
  c.description AS "Description",
  c.role_in_deals AS "Role in deals",
  c.industry_fb_group_memberships AS "Industry & FB Group Memberships",
  c.name_pronunciation AS "Name Pronunciation",
  c.account_egnyte_link AS "Account Egnyte Link",
  c.linkedin_connection AS "LinkedIn Connection",
  c.direct_phone AS "Direct Phone",
  c.general_phone AS "General Phone",
  c.record_id AS "Record Id",
  c.conferences_organizations_attended AS "Conferences & Organizations Attended",
  c.first_page_visited AS "First Page Visited",
  c.reference_services_products AS "Reference Services Products & Solutions",
  c.reference_egnyte_link AS "Reference Egnyte Link",
  c.referrer AS "Referrer",
  c.lead_source AS "Lead Source",
  c.notes,
  c.created_by AS "Created By",
  c.modified_by AS "Modified By",
  c.enrich_status AS "Enrich Status",
  c.tag AS "Tag",
  c.reference_type AS "Reference Type",
  c.reference_subject_matter AS "Reference Subject Matter, Use Case & Department",
  c.contact_owner AS "Contact Owner",
  c.email_opt_out AS "Email Opt Out",
  c.unsubscribed_time AS "Unsubscribed Time",
  c.unsubscribed_mode AS "Unsubscribed Mode",
  c.created_at,
  c.updated_at,
  c.user_id
FROM public.contacts c;

-- Recreate deal_collections_summary view with security_invoker=on to respect RLS
CREATE VIEW public.deal_collections_summary
WITH (security_invoker=on)
AS
SELECT 
  d.id as deal_id,
  d.name as deal_name,
  d.value as expected_value,
  d.account_name,
  d.contact_name,
  d.deal_owner_name,
  d.stage,
  COALESCE(d.value, 0) as total_sales
FROM public.deals d;