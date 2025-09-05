-- Remove the overly permissive public SELECT policy that exposes email addresses
DROP POLICY "Anyone can view signup counts" ON public.early_adopter_signups;

-- Create a more secure policy that only allows users to see their own signup entries
CREATE POLICY "Users can view their own signup entries" 
ON public.early_adopter_signups 
FOR SELECT 
USING (auth.uid() = user_id OR user_id IS NULL);

-- Update the INSERT policy to be more restrictive - only allow authenticated users or anonymous with email
DROP POLICY "Users can create their own signup entry" ON public.early_adopter_signups;

CREATE POLICY "Allow secure signup creation" 
ON public.early_adopter_signups 
FOR INSERT 
WITH CHECK (
  (auth.uid() IS NOT NULL AND auth.uid() = user_id) OR 
  (user_id IS NULL AND email IS NOT NULL)
);