-- Add trial tracking to profiles table
ALTER TABLE public.profiles 
ADD COLUMN trial_started_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN trial_ends_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN trial_used BOOLEAN DEFAULT FALSE,
ADD COLUMN subscription_status TEXT DEFAULT 'trial' CHECK (subscription_status IN ('trial', 'active', 'expired', 'cancelled'));

-- Create function to start user trial
CREATE OR REPLACE FUNCTION public.start_user_trial(user_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.profiles 
  SET 
    trial_started_at = now(),
    trial_ends_at = now() + interval '3 days',
    trial_used = TRUE,
    subscription_status = 'trial'
  WHERE profiles.user_id = start_user_trial.user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check if user trial is active
CREATE OR REPLACE FUNCTION public.is_trial_active(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = is_trial_active.user_id 
    AND trial_ends_at > now() 
    AND subscription_status = 'trial'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Create function to get trial info for user
CREATE OR REPLACE FUNCTION public.get_trial_info(user_id UUID)
RETURNS TABLE (
  trial_active BOOLEAN,
  trial_days_remaining INTEGER,
  trial_started_at TIMESTAMP WITH TIME ZONE,
  trial_ends_at TIMESTAMP WITH TIME ZONE
) AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;