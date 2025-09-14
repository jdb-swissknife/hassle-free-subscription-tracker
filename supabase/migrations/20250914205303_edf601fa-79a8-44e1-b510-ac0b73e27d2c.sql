-- Security Enhancement Migration: Fix email templates access and database function security

-- 1. Secure Email Templates Table
-- Drop the overly permissive policy that allows anyone to view email templates
DROP POLICY IF EXISTS "Anyone can view email templates" ON public.email_templates;

-- Create a new restrictive policy - only system functions with service role can access
CREATE POLICY "System functions can view email templates" 
ON public.email_templates 
FOR SELECT 
USING (auth.role() = 'service_role');

-- 2. Fix Database Function Security - Update all functions to include proper search_path

-- Update handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, first_name, last_name, display_name)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name',
    COALESCE(NEW.raw_user_meta_data ->> 'display_name', NEW.raw_user_meta_data ->> 'first_name')
  );
  RETURN NEW;
END;
$function$;

-- Update update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Update update_user_settings_updated_at function
CREATE OR REPLACE FUNCTION public.update_user_settings_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Update get_early_adopter_count function
CREATE OR REPLACE FUNCTION public.get_early_adopter_count()
 RETURNS integer
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
  RETURN (SELECT COUNT(*) FROM public.early_adopter_signups);
END;
$function$;

-- Update start_user_trial function
CREATE OR REPLACE FUNCTION public.start_user_trial(user_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
  UPDATE public.profiles 
  SET 
    trial_started_at = now(),
    trial_ends_at = now() + interval '3 days',
    trial_used = TRUE,
    subscription_status = 'trial'
  WHERE profiles.user_id = start_user_trial.user_id;
END;
$function$;

-- Update is_trial_active function
CREATE OR REPLACE FUNCTION public.is_trial_active(user_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = is_trial_active.user_id 
    AND trial_ends_at > now() 
    AND subscription_status = 'trial'
  );
END;
$function$;

-- Update get_trial_info function
CREATE OR REPLACE FUNCTION public.get_trial_info(user_id uuid)
 RETURNS TABLE(trial_active boolean, trial_days_remaining integer, trial_started_at timestamp with time zone, trial_ends_at timestamp with time zone)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    CASE WHEN p.trial_ends_at > now() AND p.subscription_status = 'trial' THEN TRUE ELSE FALSE END as trial_active,
    CASE WHEN p.trial_ends_at > now() THEN EXTRACT(day FROM p.trial_ends_at - now())::INTEGER ELSE 0 END as trial_days_remaining,
    p.trial_started_at,
    p.trial_ends_at
  FROM public.profiles p
  WHERE p.user_id = get_trial_info.user_id;
END;
$function$;