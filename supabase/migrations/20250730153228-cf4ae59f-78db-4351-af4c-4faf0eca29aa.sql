-- CRITICAL SECURITY FIXES - Part 4: Role escalation vulnerability fix

-- Drop the existing policy that allows users to update their own info (including role)
DROP POLICY IF EXISTS "Users can update their own personal info" ON public.profiles;

-- Create a restrictive policy that prevents role changes
CREATE POLICY "Users can update their own basic info only" ON public.profiles
FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id
);

-- Add a constraint to prevent role changes through regular updates
-- This will be enforced at the database level
CREATE OR REPLACE FUNCTION public.prevent_role_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  -- Prevent role changes unless done by admin through specific function
  IF OLD.role != NEW.role AND current_setting('app.role_change_authorized', true) != 'true' THEN
    RAISE EXCEPTION 'Role changes must be done through admin functions only';
  END IF;
  
  -- Prevent is_active changes by non-admins
  IF OLD.is_active != NEW.is_active AND get_current_user_role() != 'admin' THEN
    RAISE EXCEPTION 'Only administrators can change user active status';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to enforce role change restrictions
DROP TRIGGER IF EXISTS prevent_unauthorized_role_change ON public.profiles;
CREATE TRIGGER prevent_unauthorized_role_change
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_role_change();

-- Create secure role assignment function
CREATE OR REPLACE FUNCTION public.assign_user_role(
  target_user_id UUID,
  new_role app_role,
  reason TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  current_admin_role app_role;
  old_role app_role;
BEGIN
  -- Check if current user is admin
  SELECT get_current_user_role() INTO current_admin_role;
  
  IF current_admin_role != 'admin' THEN
    RAISE EXCEPTION 'Only administrators can assign roles';
  END IF;
  
  -- Get current role for audit
  SELECT role INTO old_role FROM public.profiles WHERE id = target_user_id;
  
  -- Authorize this role change
  PERFORM set_config('app.role_change_authorized', 'true', true);
  
  -- Update the role
  UPDATE public.profiles 
  SET role = new_role, updated_at = now() 
  WHERE id = target_user_id;
  
  -- Reset authorization
  PERFORM set_config('app.role_change_authorized', 'false', true);
  
  -- Log the change
  INSERT INTO public.import_audit_log (user_id, file_name, data_type, records_processed, records_imported, file_size, security_flags)
  VALUES (auth.uid(), 'role_change_audit', 'role_change', 1, 1, 0, ARRAY[format('Role changed from %s to %s for user %s. Reason: %s', old_role, new_role, target_user_id, COALESCE(reason, 'No reason provided'))]);
  
  RETURN true;
END;
$$;