-- Add status and cancelled_at columns to subscriptions table
ALTER TABLE public.subscriptions 
ADD COLUMN status TEXT DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'paused')),
ADD COLUMN cancelled_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Update existing subscriptions based on active field
UPDATE public.subscriptions 
SET status = CASE 
  WHEN active = true THEN 'active'
  WHEN active = false THEN 'cancelled'
END;

-- Create index for better performance on status queries
CREATE INDEX idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX idx_subscriptions_user_status ON public.subscriptions(user_id, status);