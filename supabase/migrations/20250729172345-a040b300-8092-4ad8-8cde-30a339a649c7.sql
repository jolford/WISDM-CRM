-- CRITICAL SECURITY FIXES - Part 2: Role Escalation Fix

-- 3. Fix role escalation vulnerability - Remove role updates from user policies
DROP POLICY IF EXISTS "Users can update their own personal info" ON public.profiles;

-- Create separate policies for different types of updates
CREATE POLICY "Users can update their own basic info" ON public.profiles
FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id AND
  -- Users cannot change their role, is_active status, or other restricted fields
  NEW.role = OLD.role AND
  NEW.is_active = OLD.is_active AND
  NEW.id = OLD.id AND
  NEW.email = OLD.email
);

-- 4. Create secure role assignment function
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
  
  -- Update the role
  UPDATE public.profiles 
  SET role = new_role, updated_at = now() 
  WHERE id = target_user_id;
  
  -- Log the change (basic logging for now)
  INSERT INTO public.import_audit_log (user_id, file_name, data_type, records_processed, records_imported, file_size, security_flags)
  VALUES (auth.uid(), 'role_change_audit', 'role_change', 1, 1, 0, ARRAY[format('Role changed from %s to %s for user %s. Reason: %s', old_role, new_role, target_user_id, COALESCE(reason, 'No reason provided'))]);
  
  RETURN true;
END;
$$;