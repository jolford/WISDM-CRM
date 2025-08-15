-- Fix Security Definer View issues by recreating views with SECURITY INVOKER
-- This ensures views use the permissions of the querying user, not the creator

-- Recreate contacts_export_view with SECURITY INVOKER
DROP VIEW IF EXISTS public.contacts_export_view;

CREATE VIEW public.contacts_export_view
WITH (security_invoker = true) AS 
SELECT 
  c.id,
  c.user_id,
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
  c.contact_owner AS "Contact Owner",
  c.lead_source AS "Lead Source",
  c.record_id AS "Record Id",
  c.general_phone AS "General Phone",
  c.direct_phone AS "Direct Phone",
  c.street AS "Street",
  c.city AS "City", 
  c.state AS "State",
  c.zip_code AS "Zip Code",
  c.country AS "Country",
  c.county AS "County",
  c.salutation AS "Salutation",
  c.description AS "Description",
  c.email_opt_out AS "Email Opt Out",
  c.unsubscribed_mode AS "Unsubscribed Mode",
  c.unsubscribed_time AS "Unsubscribed Time",
  c.referrer AS "Referrer",
  c.first_page_visited AS "First Page Visited",
  c.role_in_deals AS "Role in deals",
  c.industry_fb_group_memberships AS "Industry & FB Group Memberships",
  c.name_pronunciation AS "Name Pronunciation",
  c.account_egnyte_link AS "Account Egnyte Link",
  c.linkedin_connection AS "LinkedIn Connection",
  c.conferences_organizations_attended AS "Conferences & Organizations Attended",
  c.reference_services_products AS "Reference Services Products & Solutions",
  c.reference_egnyte_link AS "Reference Egnyte Link",
  c.reference_subject_matter AS "Reference Subject Matter, Use Case & Department",
  c.reference_type AS "Reference Type",
  c.tag AS "Tag",
  c.enrich_status AS "Enrich Status",
  c.modified_by AS "Modified By",
  c.created_by AS "Created By",
  c.notes,
  c.created_at,
  c.updated_at
FROM public.contacts c
WHERE c.user_id = auth.uid();

-- Recreate deal_collections_summary with SECURITY INVOKER
DROP VIEW IF EXISTS public.deal_collections_summary;

CREATE VIEW public.deal_collections_summary
WITH (security_invoker = true) AS
SELECT 
  d.id AS deal_id,
  d.name AS deal_name,
  d.account_name,
  d.contact_name,
  d.deal_owner_name,
  d.stage,
  d.value AS expected_value,
  COALESCE(SUM(di.paid_amount), 0) AS total_sales
FROM deals d
LEFT JOIN deal_invoices di ON d.id = di.deal_id
WHERE d.user_id = auth.uid()
GROUP BY d.id, d.name, d.account_name, d.contact_name, d.deal_owner_name, d.stage, d.value;