-- Create early adopter signups tracking table
CREATE TABLE public.early_adopter_signups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  signup_type TEXT NOT NULL DEFAULT 'email_signup', -- 'email_signup', 'full_registration', 'interest'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.early_adopter_signups ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (for the counter)
CREATE POLICY "Anyone can view signup counts" 
ON public.early_adopter_signups 
FOR SELECT 
USING (true);

-- Allow authenticated users to insert their own signup
CREATE POLICY "Users can create their own signup entry" 
ON public.early_adopter_signups 
FOR INSERT 
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Create index for performance
CREATE INDEX idx_early_adopter_signups_created_at ON public.early_adopter_signups(created_at);
CREATE INDEX idx_early_adopter_signups_signup_type ON public.early_adopter_signups(signup_type);

-- Create trigger for updated_at
CREATE TRIGGER update_early_adopter_signups_updated_at
BEFORE UPDATE ON public.early_adopter_signups
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for this table
ALTER TABLE public.early_adopter_signups REPLICA IDENTITY FULL;

-- Create a function to get current signup count
CREATE OR REPLACE FUNCTION public.get_early_adopter_count()
RETURNS INTEGER AS $$
BEGIN
  RETURN (SELECT COUNT(*) FROM public.early_adopter_signups);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Insert some initial seed data for the counter (adjust the count as needed for your marketing)
INSERT INTO public.early_adopter_signups (email, signup_type, created_at) 
SELECT 
  'seed' || generate_series || '@example.com',
  'interest',
  now() - (random() * interval '30 days')
FROM generate_series(1, 1247);