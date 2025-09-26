-- Create security monitoring tables for authentication
-- These tables will help track and prevent security threats

-- Table for tracking authentication attempts (for rate limiting)
CREATE TABLE IF NOT EXISTS public.auth_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  ip_address inet,
  user_agent text,
  attempt_type text NOT NULL CHECK (attempt_type IN ('login', 'signup')),
  success boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

-- Table for security events logging
CREATE TABLE IF NOT EXISTS public.security_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  email text,
  ip_address inet,
  user_agent text,
  details jsonb,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on both tables
ALTER TABLE public.auth_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;

-- Only admins can view security data
CREATE POLICY "Admins can view auth attempts" 
ON public.auth_attempts 
FOR SELECT 
USING (public.get_current_user_role() = 'admin'::app_role);

CREATE POLICY "System can insert auth attempts" 
ON public.auth_attempts 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins can view security events" 
ON public.security_events 
FOR SELECT 
USING (public.get_current_user_role() = 'admin'::app_role);

CREATE POLICY "System can insert security events" 
ON public.security_events 
FOR INSERT 
WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_auth_attempts_email_created 
ON public.auth_attempts (email, created_at);

CREATE INDEX IF NOT EXISTS idx_auth_attempts_ip_created 
ON public.auth_attempts (ip_address, created_at);

CREATE INDEX IF NOT EXISTS idx_security_events_type_created 
ON public.security_events (event_type, created_at);

-- Auto-cleanup old auth attempts (older than 7 days)
CREATE OR REPLACE FUNCTION public.cleanup_old_auth_attempts()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  DELETE FROM public.auth_attempts 
  WHERE created_at < now() - interval '7 days';
$$;