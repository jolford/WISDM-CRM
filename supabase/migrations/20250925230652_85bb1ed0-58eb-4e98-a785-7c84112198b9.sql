-- Secure contacts_export_view: Recreate with security_invoker to enforce underlying RLS
-- and restrict direct access to authenticated roles only.

-- 1) Drop existing view if present
DROP VIEW IF EXISTS public.contacts_export_view;

-- 2) Recreate the view with security options so it respects RLS on public.contacts
CREATE VIEW public.contacts_export_view
WITH (
  security_invoker = on,
  security_barrier = true
)
AS
SELECT
  c.conferences_organizations_attended AS "Conferences & Organizations Attended",
  c.unsubscribed_mode AS "Unsubscribed Mode",
  c.contact_owner AS "Contact Owner",
  c.tag AS "Tag",
  c.enrich_status AS "Enrich Status",
  c.modified_by AS "Modified By",
  c.created_by AS "Created By",
  c.notes AS notes,
  c.lead_source AS "Lead Source",
  c.referrer AS Referrer,
  c.reference_egnyte_link AS "Reference Egnyte Link",
  c.reference_services_products AS "Reference Services Products & Solutions",
  c.first_page_visited AS "First Page Visited",
  c.record_id AS "Record Id",
  c.general_phone AS "General Phone",
  c.direct_phone AS "Direct Phone",
  c.linkedin_connection AS "LinkedIn Connection",
  c.account_egnyte_link AS "Account Egnyte Link",
  c.name_pronunciation AS "Name Pronunciation",
  c.industry_fb_group_memberships AS "Industry & FB Group Memberships",
  c.role_in_deals AS "Role in deals",
  c.description AS Description,
  c.salutation AS Salutation,
  c.county AS County,
  c.country AS Country,
  c.zip_code AS "Zip Code",
  c.state AS State,
  c.city AS City,
  c.street AS Street,
  c.vendor_name AS "Vendor Name",
  c.account_name AS "Account Name",
  c.department AS Department,
  c.title AS Title,
  c.mobile AS Mobile,
  c.id AS id,
  c.email_opt_out AS "Email Opt Out",
  c.unsubscribed_time AS "Unsubscribed Time",
  c.created_at AS created_at,
  c.updated_at AS updated_at,
  c.user_id AS user_id,
  c.phone AS Phone,
  c.email AS Email,
  c.contact_name AS "Contact Name",
  c.last_name AS "Last Name",
  c.first_name AS "First Name",
  c.reference_type AS "Reference Type",
  c.reference_subject_matter AS "Reference Subject Matter, Use Case & Department"
FROM public.contacts c;

-- 3) Lock down privileges on the view
REVOKE ALL ON TABLE public.contacts_export_view FROM PUBLIC;
REVOKE ALL ON TABLE public.contacts_export_view FROM anon;
GRANT SELECT ON TABLE public.contacts_export_view TO authenticated;
GRANT SELECT ON TABLE public.contacts_export_view TO service_role;

-- 4) Document security intent
COMMENT ON VIEW public.contacts_export_view IS 'Security-invoker view over public.contacts. Inherits RLS from contacts so users only see their own rows.';