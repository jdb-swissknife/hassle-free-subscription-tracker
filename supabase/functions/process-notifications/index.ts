import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';
import { differenceInDays } from 'https://esm.sh/date-fns@3.6.0';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Subscription {
  id: string;
  user_id: string;
  name: string;
  price: number;
  cycle: string;
  start_date: string;
  trial_end_date?: string;
  status: string;
}

interface UserProfile {
  user_id: string;
  email: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting notification processing...');

    const today = new Date();
    const threeDaysFromNow = new Date(today);
    threeDaysFromNow.setDate(today.getDate() + 3);

    const sevenDaysFromNow = new Date(today);
    sevenDaysFromNow.setDate(today.getDate() + 7);

    // Get all active subscriptions
    const { data: subscriptions, error: subError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('status', 'active');

    if (subError) {
      console.error('Error fetching subscriptions:', subError);
      throw subError;
    }

    console.log(`Found ${subscriptions?.length || 0} active subscriptions`);

    if (!subscriptions || subscriptions.length === 0) {
      return new Response(JSON.stringify({ 
        message: 'No active subscriptions found',
        processed: 0 
      }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    let notificationsCreated = 0;

    for (const subscription of subscriptions) {
      try {
        console.log(`Processing subscription: ${subscription.name} for user: ${subscription.user_id}`);

        // Get user's email from auth.users (we'll need to get this differently)
        // For now, let's get user settings to check notification preferences
        const { data: userSettings } = await supabase
          .from('user_settings')
          .select('email_notifications')
          .eq('user_id', subscription.user_id)
          .single();

        // Skip if user has disabled email notifications
        if (userSettings && !userSettings.email_notifications) {
          console.log(`Email notifications disabled for user ${subscription.user_id}`);
          continue;
        }

        // Check for trial ending notifications
        if (subscription.trial_end_date) {
          const trialEndDate = new Date(subscription.trial_end_date);
          const daysUntilTrialEnd = differenceInDays(trialEndDate, today);
          
          if (daysUntilTrialEnd === 3 || daysUntilTrialEnd === 1) {
            await createNotification(subscription, 'trial-ending', daysUntilTrialEnd, trialEndDate);
            notificationsCreated++;
          }
        }

        // Check for payment reminders
        const nextPaymentDate = calculateNextPaymentDate(subscription, today);
        const daysUntilPayment = differenceInDays(nextPaymentDate, today);

        if (daysUntilPayment === 3 || daysUntilPayment === 1) {
          await createNotification(subscription, 'payment-upcoming', daysUntilPayment, nextPaymentDate);
          notificationsCreated++;
        }

        // Check for renewal reminders (for yearly subscriptions)
        if (subscription.cycle === 'yearly' && daysUntilPayment === 7) {
          await createNotification(subscription, 'subscription-renewal', daysUntilPayment, nextPaymentDate);
          notificationsCreated++;
        }

      } catch (error) {
        console.error(`Error processing subscription ${subscription.id}:`, error);
        // Continue with other subscriptions
      }
    }

    // Now process any pending notifications in the queue
    await processPendingNotifications();

    console.log(`Notification processing complete. Created ${notificationsCreated} new notifications.`);

    return new Response(JSON.stringify({
      success: true,
      message: `Processed ${subscriptions.length} subscriptions`,
      notificationsCreated,
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error: any) {
    console.error("Error in process-notifications function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

async function createNotification(
  subscription: Subscription, 
  type: string, 
  daysUntil: number, 
  scheduledDate: Date
) {
  try {
    // Check if notification already exists to avoid duplicates
    const { data: existing } = await supabase
      .from('notification_queue')
      .select('id')
      .eq('subscription_id', subscription.id)
      .eq('notification_type', type)
      .eq('status', 'pending')
      .gte('scheduled_for', new Date().toISOString())
      .single();

    if (existing) {
      console.log(`Notification already exists for ${subscription.name} - ${type}`);
      return;
    }

    const { error } = await supabase
      .from('notification_queue')
      .insert({
        user_id: subscription.user_id,
        subscription_id: subscription.id,
        notification_type: type,
        channel: 'email',
        scheduled_for: new Date().toISOString(), // Send immediately
        email_data: {
          subscription_name: subscription.name,
          price: subscription.price,
          cycle: subscription.cycle,
          days_remaining: daysUntil
        }
      });

    if (error) {
      console.error('Error creating notification:', error);
      throw error;
    }

    console.log(`Created ${type} notification for ${subscription.name}`);
  } catch (error) {
    console.error(`Failed to create notification for ${subscription.id}:`, error);
  }
}

function calculateNextPaymentDate(subscription: Subscription, today: Date): Date {
  const startDate = new Date(subscription.start_date);
  let nextDate = new Date(startDate);

  // If in trial, next payment is after trial
  if (subscription.trial_end_date && new Date(subscription.trial_end_date) > today) {
    return new Date(subscription.trial_end_date);
  }

  // Calculate next billing cycle
  switch (subscription.cycle) {
    case 'monthly':
      while (nextDate <= today) {
        nextDate.setMonth(nextDate.getMonth() + 1);
      }
      break;
    case 'yearly':
      while (nextDate <= today) {
        nextDate.setFullYear(nextDate.getFullYear() + 1);
      }
      break;
    case 'weekly':
      while (nextDate <= today) {
        nextDate.setDate(nextDate.getDate() + 7);
      }
      break;
    default:
      nextDate = new Date(today);
      nextDate.setDate(nextDate.getDate() + 30);
  }

  return nextDate;
}

async function processPendingNotifications() {
  try {
    console.log('Processing pending notifications...');

    // Get pending notifications scheduled for now or earlier
    const { data: pendingNotifications, error } = await supabase
      .from('notification_queue')
      .select(`
        *,
        profiles!notification_queue_user_id_fkey(*)
      `)
      .eq('status', 'pending')
      .lte('scheduled_for', new Date().toISOString())
      .lt('attempts', 3);

    if (error) {
      console.error('Error fetching pending notifications:', error);
      return;
    }

    if (!pendingNotifications || pendingNotifications.length === 0) {
      console.log('No pending notifications to process');
      return;
    }

    console.log(`Found ${pendingNotifications.length} pending notifications`);

    for (const notification of pendingNotifications) {
      try {
        // Get user email from auth metadata (this is a simplified approach)
        const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(notification.user_id);
        
        if (authError || !authUser.user?.email) {
          console.error(`No email found for user ${notification.user_id}`);
          continue;
        }

        // Call the email sending function
        const emailPayload = {
          notificationId: notification.id,
          userEmail: authUser.user.email,
          subscriptionName: notification.email_data.subscription_name,
          notificationType: notification.notification_type,
          daysRemaining: notification.email_data.days_remaining,
          price: notification.email_data.price,
          cycle: notification.email_data.cycle
        };

        const response = await fetch(`${supabaseUrl}/functions/v1/send-notification-email`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(emailPayload)
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Failed to send email for notification ${notification.id}:`, errorText);
          
          // Update notification with error
          await supabase
            .from('notification_queue')
            .update({
              status: 'failed',
              error_message: errorText,
              attempts: notification.attempts + 1
            })
            .eq('id', notification.id);
        }

      } catch (error) {
        console.error(`Error processing notification ${notification.id}:`, error);
        
        // Update notification with error
        await supabase
          .from('notification_queue')
          .update({
            status: 'failed',
            error_message: error.message,
            attempts: notification.attempts + 1
          })
          .eq('id', notification.id);
      }
    }

  } catch (error) {
    console.error('Error processing pending notifications:', error);
  }
}

serve(handler);