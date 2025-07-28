-- Rename companies table to accounts
ALTER TABLE companies RENAME TO accounts;

-- Update any foreign key references in other tables that might reference companies
-- Check contacts table for company_id reference
ALTER TABLE contacts RENAME COLUMN company_id TO account_id;

-- Check deals table for company_id reference  
ALTER TABLE deals RENAME COLUMN company_id TO account_id;
ALTER TABLE deals RENAME COLUMN company_name TO account_name;

-- Check tasks table for company_id reference
ALTER TABLE tasks RENAME COLUMN company_id TO account_id;

-- Check maintenance_records table for company_id reference
ALTER TABLE maintenance_records RENAME COLUMN company_id TO account_id;

-- Clear all reports data so user can re-import
DELETE FROM dashboard_widgets;
DELETE FROM report_charts;
DELETE FROM report_filters;
DELETE FROM scheduled_reports;
DELETE FROM reports;