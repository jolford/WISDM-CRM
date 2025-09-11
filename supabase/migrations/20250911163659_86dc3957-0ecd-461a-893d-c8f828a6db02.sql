-- Secure contacts_export_view: use invoker rights, add security barrier, and restrict privileges
-- 1) Recreate the view with security options so it respects underlying RLS
DROP VIEW IF EXISTS public.contacts_export_view;

CREATE VIEW public.contacts_export_view
WITH (
  security_invoker = on,
  security_barrier = true
)
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

-- 2) Restrict privileges so unauthenticated/public cannot access this view directly
REVOKE ALL ON TABLE public.contacts_export_view FROM PUBLIC;
REVOKE ALL ON TABLE public.contacts_export_view FROM anon;
GRANT SELECT ON TABLE public.contacts_export_view TO authenticated;
GRANT SELECT ON TABLE public.contacts_export_view TO service_role;