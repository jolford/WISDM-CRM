-- Clean up incorrectly imported maintenance records
DELETE FROM maintenance_records 
WHERE product_name = 'Unknown Product' 
AND user_id = '9be8a7c1-6944-42f2-85a7-e2f67e1cf2af';