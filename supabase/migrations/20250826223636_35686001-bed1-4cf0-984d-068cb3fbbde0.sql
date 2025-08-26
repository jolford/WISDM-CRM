-- Update all tickets with NULL user_id to assign them to the current user
-- This fixes the issue where imported tickets aren't visible due to RLS policies

UPDATE tickets 
SET user_id = '9be8a7c1-6944-42f2-85a7-e2f67e1cf2af'
WHERE user_id IS NULL;