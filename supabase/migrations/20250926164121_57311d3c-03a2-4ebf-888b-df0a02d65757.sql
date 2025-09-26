-- Recreate profiles RLS policies with schema-qualified function to avoid search_path issues
DROP POLICY IF EXISTS "Admins can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update user roles and status" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own basic info only" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

-- Recreate policies
CREATE POLICY "Admins can insert profiles"
ON public.profiles
FOR INSERT
WITH CHECK (public.get_current_user_role() = 'admin'::app_role);

CREATE POLICY "Admins can update all profiles"
ON public.profiles
FOR UPDATE
USING (public.get_current_user_role() = 'admin'::app_role);

CREATE POLICY "Admins can update user roles and status"
ON public.profiles
FOR UPDATE
USING (public.get_current_user_role() = 'admin'::app_role)
WITH CHECK (public.get_current_user_role() = 'admin'::app_role);

CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
USING (public.get_current_user_role() = 'admin'::app_role);

CREATE POLICY "Users can update their own basic info only"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);
