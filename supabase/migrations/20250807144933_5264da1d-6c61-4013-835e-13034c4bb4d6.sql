-- Delete all reports with 'Unknown Report' name that have no description
DELETE FROM reports 
WHERE name = 'Unknown Report' AND (description IS NULL OR description = '');

-- Update any remaining 'Unknown Report' entries with meaningful names based on their data
UPDATE reports 
SET name = CASE 
  WHEN 'deals' = ANY(data_sources) THEN 'Deals Report'
  WHEN 'contacts' = ANY(data_sources) THEN 'Contacts Report'  
  WHEN 'accounts' = ANY(data_sources) THEN 'Accounts Report'
  ELSE 'Custom Report'
END,
description = CASE 
  WHEN description IS NULL OR description = '' THEN 'Auto-generated report'
  ELSE description
END
WHERE name = 'Unknown Report';