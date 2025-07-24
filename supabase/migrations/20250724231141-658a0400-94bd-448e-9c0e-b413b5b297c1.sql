-- Temporarily disable the role change trigger
ALTER TABLE public.profiles DISABLE TRIGGER prevent_role_change_trigger;

-- Update the user's role to admin
UPDATE profiles SET role = 'admin' WHERE email = 'jolford@westint.com';

-- Re-enable the trigger
ALTER TABLE public.profiles ENABLE TRIGGER prevent_role_change_trigger;