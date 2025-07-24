-- First drop the trigger
DROP TRIGGER IF EXISTS prevent_role_change_trigger ON public.profiles;

-- Drop the problematic function
DROP FUNCTION IF EXISTS public.prevent_role_change();

-- Update the user's role to admin
UPDATE profiles SET role = 'admin' WHERE email = 'jolford@westint.com';