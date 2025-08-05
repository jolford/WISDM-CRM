-- Delete all reports with 'Unknown Report' name that have no description
DELETE FROM reports 
WHERE name = 'Unknown Report' AND (description IS NULL OR description = '');

-- Update any remaining 'Unknown Report' entries with meaningful names based on their data
UPDATE reports 
SET name = CASE 
  WHEN data_sources @> '["deals"]' THEN 'Deals Report'
  WHEN data_sources @> '["contacts"]' THEN 'Contacts Report'  
  WHEN data_sources @> '["accounts"]' THEN 'Accounts Report'
  ELSE 'Custom Report'
END,
description = CASE 
  WHEN description IS NULL OR description = '' THEN 'Auto-generated report'
  ELSE description
END
WHERE name = 'Unknown Report';