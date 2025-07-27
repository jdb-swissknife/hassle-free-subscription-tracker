import { useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { EmailNotificationService } from '@/services/emailNotificationService';
import { useSupabaseSubscriptions } from './useSupabaseSubscriptions';
import { differenceInDays } from 'date-fns';
import { toast } from 'sonner';

export function useNotificationScheduler() {
  const { user } = useAuth();
  const { subscriptions } = useSupabaseSubscriptions();
  const emailService = EmailNotificationService.getInstance();

  // Check and queue notifications for subscriptions
  const checkAndQueueNotifications = useCallback(async () => {
    if (!user || !subscriptions.length) return;

    const today = new Date();
    let notificationsQueued = 0;

    for (const subscription of subscriptions) {
      if (subscription.status !== 'active') continue;

      try {
        // Check for trial ending notifications
        if (subscription.trialEndDate) {
          const trialEndDate = new Date(subscription.trialEndDate);
          const daysUntilTrialEnd = differenceInDays(trialEndDate, today);
          
          if (daysUntilTrialEnd === 3 || daysUntilTrialEnd === 1) {
            const success = await emailService.queueNotification(
              user.id,
              subscription.id,
              'trial-ending',
              {
                subscription_name: subscription.name,
                price: subscription.price,
                cycle: subscription.cycle,
                days_remaining: daysUntilTrialEnd
              }
            );
            if (success) notificationsQueued++;
          }
        }

        // Check for payment reminders
        const nextPaymentDate = calculateNextPaymentDate(subscription, today);
        const daysUntilPayment = differenceInDays(nextPaymentDate, today);

        if (daysUntilPayment === 3 || daysUntilPayment === 1) {
          const success = await emailService.queueNotification(
            user.id,
            subscription.id,
            'payment-upcoming',
            {
              subscription_name: subscription.name,
              price: subscription.price,
              cycle: subscription.cycle,
              days_remaining: daysUntilPayment
            }
          );
          if (success) notificationsQueued++;
        }

        // Check for renewal reminders (for yearly subscriptions)
        if (subscription.cycle === 'yearly' && daysUntilPayment === 7) {
          const success = await emailService.queueNotification(
            user.id,
            subscription.id,
            'subscription-renewal',
            {
              subscription_name: subscription.name,
              price: subscription.price,
              cycle: subscription.cycle,
              days_remaining: daysUntilPayment
            }
          );
          if (success) notificationsQueued++;
        }

      } catch (error) {
        console.error(`Error processing notifications for ${subscription.name}:`, error);
      }
    }

    if (notificationsQueued > 0) {
      console.log(`Queued ${notificationsQueued} notifications`);
      // Trigger processing of queued notifications
      await emailService.triggerNotificationProcessing();
    }

  }, [user, subscriptions, emailService]);

  // Send a test email
  const sendTestEmail = useCallback(async () => {
    if (!user?.email) {
      toast.error('No email address found');
      return false;
    }

    try {
      const success = await emailService.sendTestEmail(user.email);
      if (success) {
        toast.success('Test email sent successfully!');
        return true;
      } else {
        toast.error('Failed to send test email');
        return false;
      }
    } catch (error) {
      console.error('Error sending test email:', error);
      toast.error('Error sending test email');
      return false;
    }
  }, [user, emailService]);

  // Check notifications on mount and subscription changes
  useEffect(() => {
    checkAndQueueNotifications();
  }, [checkAndQueueNotifications]);

  return {
    checkAndQueueNotifications,
    sendTestEmail,
    emailService
  };
}

function calculateNextPaymentDate(subscription: any, today: Date): Date {
  const startDate = new Date(subscription.startDate);
  let nextDate = new Date(startDate);

  // If in trial, next payment is after trial
  if (subscription.trialEndDate && new Date(subscription.trialEndDate) > today) {
    return new Date(subscription.trialEndDate);
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