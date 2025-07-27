-- Create notification queue table to store pending notifications
CREATE TABLE public.notification_queue (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  subscription_id UUID NOT NULL REFERENCES public.subscriptions(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL,
  channel TEXT NOT NULL DEFAULT 'email',
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, sent, failed, cancelled
  attempts INTEGER NOT NULL DEFAULT 0,
  max_attempts INTEGER NOT NULL DEFAULT 3,
  email_data JSONB,
  error_message TEXT,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on notification queue
ALTER TABLE public.notification_queue ENABLE ROW LEVEL SECURITY;

-- Create policies for notification queue
CREATE POLICY "Users can view their own notifications"
ON public.notification_queue
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "System can manage all notifications"
ON public.notification_queue
FOR ALL
USING (true);

-- Add index for efficient querying
CREATE INDEX idx_notification_queue_scheduled ON public.notification_queue(scheduled_for, status);
CREATE INDEX idx_notification_queue_user ON public.notification_queue(user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_notification_queue_updated_at
BEFORE UPDATE ON public.notification_queue
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add email tracking columns to existing notification history
ALTER TABLE public.user_settings 
DROP COLUMN IF EXISTS sms_notifications,
DROP COLUMN IF EXISTS phone_number;

-- Create email templates table for customizable templates
CREATE TABLE public.email_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  notification_type TEXT NOT NULL,
  subject TEXT NOT NULL,
  html_content TEXT NOT NULL,
  text_content TEXT,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on email templates
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

-- Create policy for email templates (read-only for users)
CREATE POLICY "Anyone can view email templates"
ON public.email_templates
FOR SELECT
USING (true);

-- Insert default email templates
INSERT INTO public.email_templates (notification_type, subject, html_content, text_content, is_default) VALUES
('trial-ending', 'Your {{subscription_name}} trial is ending soon', 
'<h2>Your trial is ending soon</h2><p>Your {{subscription_name}} free trial ends in {{days_remaining}} day(s). Consider upgrading or canceling to avoid charges of {{price}}.</p><p><a href="{{subscription_url}}">Manage Subscription</a></p>', 
'Your {{subscription_name}} free trial ends in {{days_remaining}} day(s). Consider upgrading or canceling to avoid charges of {{price}}.', 
true),

('payment-upcoming', 'Payment reminder for {{subscription_name}}', 
'<h2>Payment Due Soon</h2><p>Your {{subscription_name}} payment of {{price}} is due in {{days_remaining}} day(s).</p><p><a href="{{subscription_url}}">View Details</a></p>', 
'Your {{subscription_name}} payment of {{price}} is due in {{days_remaining}} day(s).', 
true),

('subscription-renewal', '{{subscription_name}} renewal reminder', 
'<h2>Subscription Renewal</h2><p>Your {{subscription_name}} subscription ({{price}}/{{cycle}}) renews in {{days_remaining}} day(s).</p><p><a href="{{subscription_url}}">Manage Subscription</a></p>', 
'Your {{subscription_name}} subscription ({{price}}/{{cycle}}) renews in {{days_remaining}} day(s).', 
true);

-- Create trigger for email templates
CREATE TRIGGER update_email_templates_updated_at
BEFORE UPDATE ON public.email_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();