-- Phase 1: Critical Role-Based Access Control Security Fix

-- Create audit log table for role changes
CREATE TABLE public.role_change_audit (
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

-- Create user_roles table for secure role management
CREATE TABLE public.user_roles (
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

-- Enable RLS on new tables
ALTER TABLE public.role_change_audit ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

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

-- Create function to assign roles securely (admin only)
CREATE OR REPLACE FUNCTION public.assign_user_role(
  target_user_id UUID,
  new_role app_role,
  reason TEXT DEFAULT NULL,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
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
  current_admin_role := public.get_current_user_role();
  IF current_admin_role != 'admin' THEN
    RAISE EXCEPTION 'Only administrators can assign roles';
  END IF;
  
  -- Get current role for audit
  old_role := public.get_user_role(target_user_id);
  
  -- Deactivate existing roles for this user
  UPDATE public.user_roles 
  SET is_active = false, updated_at = now() 
  WHERE user_id = target_user_id AND is_active = true;
  
  -- Insert new role
  INSERT INTO public.user_roles (user_id, role, assigned_by, expires_at)
  VALUES (target_user_id, new_role, auth.uid(), expires_at);
  
  -- Log the change
  INSERT INTO public.role_change_audit (user_id, old_role, new_role, changed_by, reason)
  VALUES (target_user_id, old_role, new_role, auth.uid(), reason);
  
  RETURN true;
END;
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

-- Create trigger for automatic updated_at
CREATE TRIGGER update_user_roles_updated_at
BEFORE UPDATE ON public.user_roles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add security policies to contacts_export_view  
CREATE POLICY "Users can only view their own contact exports" 
ON public.contacts_export_view 
FOR SELECT 
USING (auth.uid() = user_id);

-- Migrate existing roles from profiles to user_roles
INSERT INTO public.user_roles (user_id, role, assigned_by, assigned_at)
SELECT 
  id, 
  role, 
  id, -- Self-assigned for migration
  created_at
FROM public.profiles
WHERE role IS NOT NULL;

-- Update existing admin policies to use new role system
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update user roles and status" ON public.profiles;
DROP POLICY IF EXISTS "Admins can insert profiles" ON public.profiles;

CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (public.get_current_user_role() = 'admin');

CREATE POLICY "Admins can update profile info (not roles)" 
ON public.profiles 
FOR UPDATE 
USING (public.get_current_user_role() = 'admin')
WITH CHECK (
  public.get_current_user_role() = 'admin' 
  AND OLD.role = NEW.role  -- Prevent role changes through profiles
);

CREATE POLICY "Admins can insert profiles" 
ON public.profiles 
FOR INSERT 
WITH CHECK (public.get_current_user_role() = 'admin');