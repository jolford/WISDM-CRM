-- Phase 1: Fix Critical Privilege Escalation Vulnerability
-- Drop existing policies that allow users to update their own profiles (including roles)
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Create separate policies for different update operations
-- Users can only update their personal information (not role or is_active)
CREATE POLICY "Users can update their own personal info"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Only admins can update roles and active status
CREATE POLICY "Admins can update user roles and status"
ON public.profiles
FOR UPDATE
USING (get_current_user_role() = 'admin'::app_role)
WITH CHECK (get_current_user_role() = 'admin'::app_role);

-- Add a database function to prevent role changes by non-admins
CREATE OR REPLACE FUNCTION public.prevent_role_change()
RETURNS TRIGGER AS $$
BEGIN
  -- If role or is_active is being changed and user is not admin
  IF (OLD.role != NEW.role OR OLD.is_active != NEW.is_active) AND 
     get_current_user_role() != 'admin'::app_role THEN
    RAISE EXCEPTION 'Only admins can change user roles or active status';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to prevent unauthorized role changes
DROP TRIGGER IF EXISTS prevent_unauthorized_role_change ON public.profiles;
CREATE TRIGGER prevent_unauthorized_role_change
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_role_change();

-- Add a database function to log role changes for audit trail
CREATE OR REPLACE FUNCTION public.log_role_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Only log if role actually changed
  IF OLD.role != NEW.role THEN
    -- In a production system, you'd insert into an audit log table
    -- For now, we'll use pg_notify to signal the change
    PERFORM pg_notify('role_change', json_build_object(
      'user_id', NEW.id,
      'old_role', OLD.role,
      'new_role', NEW.role,
      'changed_by', auth.uid(),
      'timestamp', now()
    )::text);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for role change logging
DROP TRIGGER IF EXISTS profile_role_change_log ON public.profiles;
CREATE TRIGGER profile_role_change_log
  AFTER UPDATE ON public.profiles
  FOR EACH ROW
  WHEN (OLD.role IS DISTINCT FROM NEW.role)
  EXECUTE FUNCTION public.log_role_change();