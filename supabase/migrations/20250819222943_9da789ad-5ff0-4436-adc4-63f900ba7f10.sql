-- Secure contacts_export_view against unauthorized access
-- Strategy: Drop and recreate the view with security_barrier + security_invoker
-- and enforce filtering by current user unless role is admin/manager.
-- Also restrict privileges to authenticated role only.

-- 1) Recreate secure view
DROP VIEW IF EXISTS public.contacts_export_view;

CREATE VIEW public.contacts_export_view
WITH (
  security_invoker = true,
  security_barrier = true
) AS
SELECT 
  c.contact_owner                             AS "Contact Owner",
  c.reference_egnyte_link                     AS "Reference Egnyte Link",
  c.reference_subject_matter                  AS "Reference Subject Matter, Use Case & Department",
  c.referrer                                  AS "Referrer",
  c.department                                AS "Department",
  c.id                                        AS id,
  c.email_opt_out                             AS "Email Opt Out",
  c.unsubscribed_time                         AS "Unsubscribed Time",
  c.updated_at                                AS updated_at,
  c.title                                     AS "Title",
  c.mobile                                    AS "Mobile",
  c.phone                                     AS "Phone",
  c.email                                     AS "Email",
  c.created_at                                AS created_at,
  COALESCE(c.contact_name, NULLIF(TRIM(CONCAT(c.first_name, ' ', c.last_name)), '')) AS "Contact Name",
  c.last_name                                 AS "Last Name",
  c.first_name                                AS "First Name",
  c.industry_fb_group_memberships             AS "Industry & FB Group Memberships",
  c.user_id                                   AS user_id,
  c.name_pronunciation                        AS "Name Pronunciation",
  c.account_egnyte_link                       AS "Account Egnyte Link",
  c.linkedin_connection                       AS "LinkedIn Connection",
  c.conferences_organizations_attended        AS "Conferences & Organizations Attended",
  c.notes                                     AS notes,
  c.created_by                                AS "Created By",
  c.modified_by                               AS "Modified By",
  c.enrich_status                             AS "Enrich Status",
  c.tag                                       AS "Tag",
  c.reference_type                            AS "Reference Type",
  c.direct_phone                              AS "Direct Phone",
  c.general_phone                             AS "General Phone",
  c.record_id                                 AS "Record Id",
  c.lead_source                               AS "Lead Source",
  c.reference_services_products               AS "Reference Services Products & Solutions",
  c.city                                      AS "City",
  c.state                                     AS "State",
  c.zip_code                                  AS "Zip Code",
  c.country                                   AS "Country",
  c.street                                    AS "Street",
  c.county                                    AS "County",
  c.salutation                                AS "Salutation",
  c.description                               AS "Description",
  c.role_in_deals                             AS "Role in deals",
  c.vendor_name                               AS "Vendor Name",
  c.account_name                              AS "Account Name",
  c.unsubscribed_mode                         AS "Unsubscribed Mode",
  c.first_page_visited                        AS "First Page Visited"
FROM public.contacts c
WHERE (
  public.get_current_user_role()::text IN ('admin', 'manager')
  OR c.user_id = auth.uid()
);

-- 2) Tighten privileges
REVOKE ALL ON public.contacts_export_view FROM PUBLIC;
REVOKE ALL ON public.contacts_export_view FROM anon;
GRANT SELECT ON public.contacts_export_view TO authenticated;
