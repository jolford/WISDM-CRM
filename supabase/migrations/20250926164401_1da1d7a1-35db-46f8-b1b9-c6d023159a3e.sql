CREATE OR REPLACE FUNCTION public.prevent_role_change()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
  -- Prevent role changes unless done by admin through specific function
  IF OLD.role != NEW.role AND current_setting('app.role_change_authorized', true) != 'true' THEN
    RAISE EXCEPTION 'Role changes must be done through admin functions only';
  END IF;
  
  -- Prevent is_active changes by non-admins
  IF OLD.is_active != NEW.is_active AND (SELECT public.get_current_user_role()) != 'admin' THEN
    RAISE EXCEPTION 'Only administrators can change user active status';
  END IF;
  
  RETURN NEW;
END;
$function$;