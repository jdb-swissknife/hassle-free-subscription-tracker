
-- Create subscriptions table for the app
CREATE TABLE public.subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  provider TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  cycle TEXT NOT NULL DEFAULT 'monthly' CHECK (cycle IN ('monthly', 'yearly', 'weekly', 'custom')),
  category TEXT DEFAULT 'other',
  color TEXT,
  description TEXT,
  website_url TEXT,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  end_date TIMESTAMP WITH TIME ZONE,
  trial_end_date TIMESTAMP WITH TIME ZONE,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own subscriptions" 
  ON public.subscriptions 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own subscriptions" 
  ON public.subscriptions 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscriptions" 
  ON public.subscriptions 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own subscriptions" 
  ON public.subscriptions 
  FOR DELETE 
  USING (auth.uid() = user_id);
