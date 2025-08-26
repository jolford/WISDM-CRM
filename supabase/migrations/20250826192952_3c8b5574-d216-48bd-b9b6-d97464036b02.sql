-- Clean up junk data from all modules
-- This will remove test data and incomplete records

-- 1. Clean up test contacts (obvious test data)
DELETE FROM contacts 
WHERE 
    first_name ILIKE '%test%' 
    OR last_name ILIKE '%test%'
    OR email ILIKE '%test%'
    OR email ILIKE '%example%'
    OR email ILIKE '%sample%'
    OR contact_name ILIKE '%test%'
    OR (first_name IS NULL AND last_name IS NULL)
    OR email ILIKE '%.test'
    OR email ILIKE '%dummy%';

-- 2. Clean up incomplete accounts (missing essential data)
DELETE FROM accounts 
WHERE 
    name ILIKE '%test%'
    OR email ILIKE '%test%'
    OR email ILIKE '%example%'
    OR name ILIKE '%sample%'
    OR (name IS NULL OR TRIM(name) = '')
    OR (email IS NULL AND phone IS NULL AND website IS NULL);

-- 3. Clean up test deals
DELETE FROM deals 
WHERE 
    name ILIKE '%test%'
    OR account_name ILIKE '%test%'
    OR deal_owner_name ILIKE '%test%'
    OR contact_name ILIKE '%test%'
    OR name ILIKE '%sample%'
    OR name ILIKE '%dummy%'
    OR (name IS NULL OR TRIM(name) = '');

-- 4. Clean up incomplete tasks
DELETE FROM tasks 
WHERE 
    title ILIKE '%test%'
    OR (title IS NULL OR TRIM(title) = '')
    OR (description IS NULL AND due_date IS NULL);

-- 5. Clean up test vendors
DELETE FROM vendors 
WHERE 
    name ILIKE '%test%'
    OR email ILIKE '%test%'
    OR contact_name ILIKE '%test%'
    OR name ILIKE '%sample%'
    OR (name IS NULL OR TRIM(name) = '');

-- 6. Clean up test tickets
DELETE FROM tickets 
WHERE 
    subject ILIKE '%test%'
    OR customer_name ILIKE '%test%'
    OR email ILIKE '%test%'
    OR company ILIKE '%test%'
    OR (subject IS NULL OR TRIM(subject) = '');

-- 7. Clean up orphaned maintenance records (no linked account)
DELETE FROM maintenance_records 
WHERE 
    product_name ILIKE '%test%'
    OR vendor_name ILIKE '%test%'
    OR (product_name IS NULL OR TRIM(product_name) = '');

-- 8. Clean up test forecasts
DELETE FROM forecasts 
WHERE 
    period ILIKE '%test%'
    OR (target_amount IS NULL AND actual_amount IS NULL);

-- 9. Clean up empty reports
DELETE FROM reports 
WHERE 
    name ILIKE '%test%'
    OR (name IS NULL OR TRIM(name) = '')
    OR (data_sources IS NULL OR array_length(data_sources, 1) = 0);

-- 10. Clean up test sales records
DELETE FROM sales 
WHERE 
    customer_name ILIKE '%test%'
    OR rep_name ILIKE '%test%'
    OR product ILIKE '%test%'
    OR (customer_name IS NULL OR TRIM(customer_name) = '');

-- Clean up any orphaned report-related records
DELETE FROM report_charts WHERE report_id NOT IN (SELECT id FROM reports);
DELETE FROM report_filters WHERE report_id NOT IN (SELECT id FROM reports);
DELETE FROM dashboard_widgets WHERE dashboard_id NOT IN (SELECT id FROM reports WHERE is_dashboard = true);
DELETE FROM scheduled_reports WHERE report_id NOT IN (SELECT id FROM reports);

-- Clean up orphaned deal invoices
DELETE FROM deal_invoices WHERE deal_id NOT IN (SELECT id FROM deals);