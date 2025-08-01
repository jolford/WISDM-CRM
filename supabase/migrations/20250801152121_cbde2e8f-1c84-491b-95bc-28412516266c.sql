-- Update report names to match the original import file names
-- First, get the reports in order by created_at and update them individually

WITH ordered_reports AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) as rn
  FROM reports 
  WHERE name = 'Unknown Report'
)
UPDATE reports 
SET name = CASE 
  WHEN (SELECT rn FROM ordered_reports WHERE ordered_reports.id = reports.id) = 1 
    THEN 'WIS - Accounts in Education Sector'
  WHEN (SELECT rn FROM ordered_reports WHERE ordered_reports.id = reports.id) = 2 
    THEN 'WIS - AZ Pipeline & Forecast by Sales Stage and Next Steps to Close Deal'
  WHEN (SELECT rn FROM ordered_reports WHERE ordered_reports.id = reports.id) = 3 
    THEN 'WIS - Won Deals - Money Pending Collections and Payment Status'
  WHEN (SELECT rn FROM ordered_reports WHERE ordered_reports.id = reports.id) = 4 
    THEN 'WIS - Justine Pipeline All Deals & Forecast by Sales Stage and Next Steps to Close Deal'
  ELSE 'WIS Report ' || (SELECT rn FROM ordered_reports WHERE ordered_reports.id = reports.id)::text
END,
description = CASE 
  WHEN (SELECT rn FROM ordered_reports WHERE ordered_reports.id = reports.id) = 1 
    THEN 'Accounts in Education Sector analysis report'
  WHEN (SELECT rn FROM ordered_reports WHERE ordered_reports.id = reports.id) = 2 
    THEN 'AZ Pipeline & Forecast by Sales Stage and Next Steps analysis'
  WHEN (SELECT rn FROM ordered_reports WHERE ordered_reports.id = reports.id) = 3 
    THEN 'Won Deals - Money Pending Collections and Payment Status report'
  WHEN (SELECT rn FROM ordered_reports WHERE ordered_reports.id = reports.id) = 4 
    THEN 'Justine Pipeline All Deals & Forecast by Sales Stage analysis'
  ELSE 'WIS Report analysis'
END,
folder_name = 'WIS Reports',
updated_at = now()
WHERE name = 'Unknown Report';