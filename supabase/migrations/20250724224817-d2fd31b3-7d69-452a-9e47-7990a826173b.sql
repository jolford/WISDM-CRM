-- Fix function search path security issues
-- Update prevent_role_change function with proper search path
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Update log_role_change function with proper search path
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Add input validation functions for data import security
CREATE OR REPLACE FUNCTION public.validate_csv_data(data_type text, row_data jsonb)
RETURNS boolean AS $$
BEGIN
  -- Validate data type
  IF data_type NOT IN ('contacts', 'companies', 'deals') THEN
    RAISE EXCEPTION 'Invalid data type: %. Allowed types: contacts, companies, deals', data_type;
  END IF;
  
  -- Basic validation for malicious content
  -- Check for potential SQL injection patterns
  IF row_data::text ~* '(drop|delete|truncate|alter|create|exec|execute|union|select|insert|update)\s' THEN
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Add rate limiting function for import operations
CREATE OR REPLACE FUNCTION public.check_import_rate_limit(user_id uuid)
RETURNS boolean AS $$
DECLARE
  recent_imports integer;
BEGIN
  -- Check how many imports this user has done in the last hour
  -- This would normally check an imports_log table, but for now we'll use a simpler approach
  -- In production, you'd implement a proper rate limiting table
  RETURN true; -- For now, allow all imports
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';