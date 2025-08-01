-- Update report names to match the original import file names
-- We'll update them one by one based on creation order

UPDATE reports 
SET name = 'WIS - Accounts in Education Sector',
    description = 'Accounts in Education Sector analysis report',
    folder_name = 'WIS Reports',
    updated_at = now()
WHERE name = 'Unknown Report' 
AND id = (SELECT id FROM reports WHERE name = 'Unknown Report' ORDER BY created_at LIMIT 1);

UPDATE reports 
SET name = 'WIS - AZ Pipeline & Forecast by Sales Stage and Next Steps to Close Deal',
    description = 'AZ Pipeline & Forecast by Sales Stage and Next Steps analysis',
    folder_name = 'WIS Reports',
    updated_at = now()
WHERE name = 'Unknown Report' 
AND id = (SELECT id FROM reports WHERE name = 'Unknown Report' ORDER BY created_at LIMIT 1 OFFSET 1);

UPDATE reports 
SET name = 'WIS - Won Deals - Money Pending Collections and Payment Status',
    description = 'Won Deals - Money Pending Collections and Payment Status report',
    folder_name = 'WIS Reports',
    updated_at = now()
WHERE name = 'Unknown Report' 
AND id = (SELECT id FROM reports WHERE name = 'Unknown Report' ORDER BY created_at LIMIT 1 OFFSET 2);

UPDATE reports 
SET name = 'WIS - Justine Pipeline All Deals & Forecast by Sales Stage and Next Steps to Close Deal',
    description = 'Justine Pipeline All Deals & Forecast by Sales Stage analysis',
    folder_name = 'WIS Reports',
    updated_at = now()
WHERE name = 'Unknown Report' 
AND id = (SELECT id FROM reports WHERE name = 'Unknown Report' ORDER BY created_at LIMIT 1 OFFSET 3);

-- Update any remaining unknown reports with a generic pattern
UPDATE reports 
SET name = 'WIS Report ' || (ROW_NUMBER() OVER (ORDER BY created_at))::text,
    folder_name = 'WIS Reports',
    updated_at = now()
WHERE name = 'Unknown Report';