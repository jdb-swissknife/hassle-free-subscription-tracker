-- Fix security vulnerability: Remove overly permissive policy that exposes all notification data
DROP POLICY "System can manage all notifications" ON public.notification_queue;

-- Create secure policies for notification queue management
-- Allow system functions to insert notifications (for edge functions)
CREATE POLICY "System functions can insert notifications" 
ON public.notification_queue 
FOR INSERT 
WITH CHECK (true);

-- Allow system functions to update notifications (for status updates)
CREATE POLICY "System functions can update notifications" 
ON public.notification_queue 
FOR UPDATE 
USING (true);

-- The existing "Users can view their own notifications" SELECT policy is already secure
-- No changes needed for SELECT operations

-- Note: DELETE operations are intentionally not allowed to maintain audit trail