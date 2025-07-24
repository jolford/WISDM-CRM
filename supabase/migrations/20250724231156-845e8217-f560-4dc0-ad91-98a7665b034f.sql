-- Drop the trigger that's causing issues
DROP TRIGGER IF EXISTS prevent_role_change_trigger ON public.profiles;

-- Update the user's role to admin
UPDATE profiles SET role = 'admin' WHERE email = 'jolford@westint.com';