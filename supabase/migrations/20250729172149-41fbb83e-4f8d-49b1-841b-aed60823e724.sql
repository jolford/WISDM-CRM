-- CRITICAL SECURITY FIXES

-- 1. Enable RLS on all unprotected tables
ALTER TABLE public.rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_conditions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_logs ENABLE ROW LEVEL SECURITY;

-- 2. Create secure RLS policies for rules tables
CREATE POLICY "Admins can manage all rules" ON public.rules
FOR ALL USING (get_current_user_role() = 'admin');

CREATE POLICY "Admins can manage automation rules" ON public.automation_rules
FOR ALL USING (get_current_user_role() = 'admin');

CREATE POLICY "Admins can manage automation conditions" ON public.automation_conditions
FOR ALL USING (get_current_user_role() = 'admin');

CREATE POLICY "Admins can manage automation actions" ON public.automation_actions
FOR ALL USING (get_current_user_role() = 'admin');

CREATE POLICY "Users can view automation logs" ON public.automation_logs
FOR SELECT USING (true);

CREATE POLICY "System can insert automation logs" ON public.automation_logs
FOR INSERT WITH CHECK (true);

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
  current_admin_role TEXT;
  old_role TEXT;
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

-- 5. Fix function security by updating existing functions
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name'
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.validate_csv_data(data_type text, row_data jsonb)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  -- Validate data type
  IF data_type NOT IN ('contacts', 'companies', 'deals', 'vendors', 'forecasts', 'reports', 'maintenance') THEN
    RAISE EXCEPTION 'Invalid data type: %. Allowed types: contacts, companies, deals, vendors, forecasts, reports, maintenance', data_type;
  END IF;
  
  -- Enhanced security validation for malicious content
  IF row_data::text ~* '(drop|delete|truncate|alter|create|exec|execute|union|select|insert|update)\s' THEN
    RAISE EXCEPTION 'Potentially malicious content detected in CSV data';
  END IF;
  
  -- Additional XSS protection
  IF row_data::text ~* '(<script|javascript:|data:text/html|vbscript:|on\w+\s*=)' THEN
    RAISE EXCEPTION 'Potentially malicious content detected in CSV data';
  END IF;
  
  -- Validate email format if email field exists
  IF data_type = 'contacts' AND row_data ? 'email' AND row_data->>'email' IS NOT NULL THEN
    IF NOT (row_data->>'email' ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$') THEN
      RAISE EXCEPTION 'Invalid email format: %', row_data->>'email';
    END IF;
  END IF;
  
  RETURN true;
END;
$$;

-- 6. Create audit trigger for role changes
CREATE OR REPLACE FUNCTION public.log_role_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  -- Only log if role actually changed
  IF OLD.role != NEW.role THEN
    -- Log to import_audit_log table for now (should be separate audit table in production)
    INSERT INTO public.import_audit_log (user_id, file_name, data_type, records_processed, records_imported, file_size, security_flags)
    VALUES (
      COALESCE(auth.uid(), NEW.id), 
      'role_change_audit', 
      'role_change', 
      1, 
      1, 
      0, 
      ARRAY[format('Role changed from %s to %s for user %s by %s at %s', OLD.role, NEW.role, NEW.id, COALESCE(auth.uid()::text, 'system'), now())]
    );
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger for role change auditing
DROP TRIGGER IF EXISTS log_role_change_trigger ON public.profiles;
CREATE TRIGGER log_role_change_trigger
  AFTER UPDATE ON public.profiles
  FOR EACH ROW
  WHEN (OLD.role IS DISTINCT FROM NEW.role)
  EXECUTE FUNCTION public.log_role_change();