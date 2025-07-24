-- Phase 1: Critical Role-Based Access Control Security Fix

-- Create user_roles table for secure role management
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  role app_role NOT NULL DEFAULT 'sales_rep',
  assigned_by UUID NOT NULL,
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, role, is_active)
);

-- Create audit log table for role changes
CREATE TABLE IF NOT EXISTS public.role_change_audit (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  old_role app_role,
  new_role app_role NOT NULL,
  changed_by UUID NOT NULL,
  reason TEXT,
  approved_by UUID,
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.role_change_audit ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Migrate existing roles from profiles to user_roles
INSERT INTO public.user_roles (user_id, role, assigned_by, assigned_at)
SELECT 
  id, 
  role, 
  id, -- Self-assigned for migration
  created_at
FROM public.profiles
WHERE role IS NOT NULL
ON CONFLICT (user_id, role, is_active) DO NOTHING;

-- Create trigger for automatic updated_at
CREATE TRIGGER update_user_roles_updated_at
BEFORE UPDATE ON public.user_roles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create secure function to get user's current role
CREATE OR REPLACE FUNCTION public.get_user_role(target_user_id UUID)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO ''
AS $$
  SELECT role 
  FROM public.user_roles 
  WHERE user_id = target_user_id 
    AND is_active = true 
    AND (expires_at IS NULL OR expires_at > now())
  ORDER BY assigned_at DESC 
  LIMIT 1;
$$;

-- Update get_current_user_role to use new secure system
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO ''
AS $$
  SELECT COALESCE(
    (SELECT role 
     FROM public.user_roles 
     WHERE user_id = auth.uid() 
       AND is_active = true 
       AND (expires_at IS NULL OR expires_at > now())
     ORDER BY assigned_at DESC 
     LIMIT 1),
    'sales_rep'::app_role
  );
$$;

-- Create RLS policies for role_change_audit
CREATE POLICY "Admins can view all role changes" 
ON public.role_change_audit 
FOR SELECT 
USING (public.get_current_user_role() = 'admin');

CREATE POLICY "System can insert role changes" 
ON public.role_change_audit 
FOR INSERT 
WITH CHECK (true);

-- Create RLS policies for user_roles
CREATE POLICY "Admins can view all user roles" 
ON public.user_roles 
FOR SELECT 
USING (public.get_current_user_role() = 'admin');

CREATE POLICY "Users can view their own roles" 
ON public.user_roles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can insert user roles" 
ON public.user_roles 
FOR INSERT 
WITH CHECK (public.get_current_user_role() = 'admin');