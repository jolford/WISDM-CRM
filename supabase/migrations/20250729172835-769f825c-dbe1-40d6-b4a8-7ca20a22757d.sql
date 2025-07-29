-- CRITICAL SECURITY FIXES - Part 3: Fix remaining function security

-- Fix function security by updating existing functions with proper search paths
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