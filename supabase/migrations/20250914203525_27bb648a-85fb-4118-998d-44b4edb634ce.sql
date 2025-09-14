-- Fix remaining security vulnerability: Remove public access to email signups
DROP POLICY "Users can view their own signup entries" ON public.early_adopter_signups;

-- Create completely secure policy that only allows authenticated users to see their own entries
CREATE POLICY "Users can view only their own signup entries" 
ON public.early_adopter_signups 
FOR SELECT 
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- The get_early_adopter_count() function will still work for public signup counts
-- since it uses SECURITY DEFINER permissions