-- Phase 2: Complete CSV Import Security and Role Management

-- Create function to assign roles securely (admin only)
CREATE OR REPLACE FUNCTION public.assign_user_role(
  target_user_id UUID,
  new_role TEXT,
  reason TEXT DEFAULT NULL,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  current_admin_role TEXT;
  old_role TEXT;
BEGIN
  -- Check if current user is admin using RPC
  SELECT public.get_current_user_role() INTO current_admin_role;
  
  IF current_admin_role != 'admin' THEN
    RAISE EXCEPTION 'Only administrators can assign roles';
  END IF;
  
  -- Validate role
  IF new_role NOT IN ('admin', 'manager', 'sales_rep') THEN
    RAISE EXCEPTION 'Invalid role. Must be: admin, manager, or sales_rep';
  END IF;
  
  -- Get current role for audit
  SELECT public.get_user_role(target_user_id) INTO old_role;
  
  -- Deactivate existing roles for this user
  UPDATE public.user_roles 
  SET is_active = false, updated_at = now() 
  WHERE user_id = target_user_id AND is_active = true;
  
  -- Insert new role
  INSERT INTO public.user_roles (user_id, role, assigned_by, expires_at)
  VALUES (target_user_id, new_role::app_role, auth.uid(), expires_at);
  
  -- Log the change
  INSERT INTO public.role_change_audit (user_id, old_role, new_role, changed_by, reason)
  VALUES (target_user_id, old_role::app_role, new_role::app_role, auth.uid(), reason);
  
  RETURN true;
END;
$$;

-- Enhanced rate limiting function for imports
CREATE OR REPLACE FUNCTION public.check_import_rate_limit(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  recent_imports INTEGER;
  user_role TEXT;
BEGIN
  -- Get user role
  SELECT public.get_user_role(user_id) INTO user_role;
  
  -- Only allow imports for managers and admins
  IF user_role NOT IN ('admin', 'manager') THEN
    RETURN false;
  END IF;
  
  -- For now, allow all imports but this would check a proper rate limit table
  -- In production, implement proper rate limiting based on time windows
  RETURN true;
END;
$$;

-- Create import audit log table for security monitoring
CREATE TABLE IF NOT EXISTS public.import_audit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  file_name TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  data_type TEXT NOT NULL,
  records_processed INTEGER NOT NULL,
  records_imported INTEGER NOT NULL,
  import_status TEXT NOT NULL DEFAULT 'completed',
  ip_address INET,
  user_agent TEXT,
  security_flags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on import audit log
ALTER TABLE public.import_audit_log ENABLE ROW LEVEL SECURITY;

-- Create policies for import audit log
CREATE POLICY "Admins can view all import logs" 
ON public.import_audit_log 
FOR SELECT 
USING (public.get_current_user_role() = 'admin');

CREATE POLICY "Users can view their own import logs" 
ON public.import_audit_log 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can insert import logs" 
ON public.import_audit_log 
FOR INSERT 
WITH CHECK (true);