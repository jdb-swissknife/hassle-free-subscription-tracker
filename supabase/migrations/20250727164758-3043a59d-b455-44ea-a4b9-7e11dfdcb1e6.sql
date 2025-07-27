-- Fix security issue: Function Search Path Mutable
-- Update the user_settings function to use an immutable search path

CREATE OR REPLACE FUNCTION public.update_user_settings_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;