-- Drop all triggers on profiles table
DROP TRIGGER IF EXISTS prevent_role_change_trigger ON public.profiles;
DROP TRIGGER IF EXISTS prevent_unauthorized_role_change ON public.profiles;

-- Now drop the function with cascade
DROP FUNCTION IF EXISTS public.prevent_role_change() CASCADE;

-- Update the user's role to admin
UPDATE profiles SET role = 'admin' WHERE email = 'jolford@westint.com';