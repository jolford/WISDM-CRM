-- Phase 1: Fix Function Search Path Security
-- Update all functions to have secure search path

-- Fix handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
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

-- Fix get_current_user_role function
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS app_role
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN (
    SELECT role 
    FROM public.profiles 
    WHERE id = auth.uid()
  );
END;
$$;

-- Fix assign_user_role function  
CREATE OR REPLACE FUNCTION public.assign_user_role(target_user_id uuid, new_role text, reason text DEFAULT NULL::text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  current_admin_role TEXT;
  old_role TEXT;
BEGIN
  -- Check if current user is admin
  SELECT public.get_current_user_role()::text INTO current_admin_role;
  
  IF current_admin_role != 'admin' THEN
    RAISE EXCEPTION 'Only administrators can assign roles';
  END IF;
  
  -- Validate role
  IF new_role NOT IN ('admin', 'manager', 'sales_rep') THEN
    RAISE EXCEPTION 'Invalid role. Must be: admin, manager, or sales_rep';
  END IF;
  
  -- Get current role for audit
  SELECT role::text INTO old_role FROM public.profiles WHERE id = target_user_id;
  
  -- Authorize this role change
  PERFORM set_config('app.role_change_authorized', 'true', true);
  
  -- Update the role
  UPDATE public.profiles 
  SET role = new_role::app_role, updated_at = now() 
  WHERE id = target_user_id;
  
  -- Reset authorization
  PERFORM set_config('app.role_change_authorized', 'false', true);
  
  -- Log the change
  INSERT INTO public.import_audit_log (user_id, file_name, data_type, records_processed, records_imported, file_size, security_flags)
  VALUES (auth.uid(), 'role_change_audit', 'role_change', 1, 1, 0, ARRAY[format('Role changed from %s to %s for user %s. Reason: %s', old_role, new_role, target_user_id, COALESCE(reason, 'No reason provided'))]);
  
  RETURN true;
END;
$$;

-- Fix handle_new_ticket_message function
CREATE OR REPLACE FUNCTION public.handle_new_ticket_message(p_ticket_id bigint, p_message_text text, p_sender_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    INSERT INTO public.ticket_messages (ticket_id, message_text, sender_id, created_at)
    VALUES (p_ticket_id, p_message_text, p_sender_id, NOW());
END;
$$;

-- Fix validate_csv_data function
CREATE OR REPLACE FUNCTION public.validate_csv_data(data_type text, row_data jsonb)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
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

-- Fix check_import_rate_limit function
CREATE OR REPLACE FUNCTION public.check_import_rate_limit(user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  recent_imports INTEGER;
  user_role TEXT;
BEGIN
  -- Get user role
  SELECT public.get_current_user_role()::text INTO user_role;
  
  -- Only allow imports for managers and admins
  IF user_role NOT IN ('admin', 'manager') THEN
    RETURN false;
  END IF;
  
  -- For now, allow all imports but this would check a proper rate limit table
  -- In production, implement proper rate limiting based on time windows
  RETURN true;
END;
$$;