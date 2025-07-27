import { supabase } from '@/lib/supabase';
import { NotificationHistory, NotificationType } from '@/lib/types';

export class EmailNotificationService {
  private static instance: EmailNotificationService;

  static getInstance(): EmailNotificationService {
    if (!EmailNotificationService.instance) {
      EmailNotificationService.instance = new EmailNotificationService();
    }
    return EmailNotificationService.instance;
  }

  // Queue an email notification
  async queueNotification(
    userId: string,
    subscriptionId: string,
    type: NotificationType,
    emailData: {
      subscription_name: string;
      price: number;
      cycle: string;
      days_remaining: number;
    }
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notification_queue')
        .insert({
          user_id: userId,
          subscription_id: subscriptionId,
          notification_type: type,
          channel: 'email',
          scheduled_for: new Date().toISOString(),
          email_data: emailData
        });

      if (error) {
        console.error('Error queuing notification:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in queueNotification:', error);
      return false;
    }
  }

  // Get notification history for a user
  async getNotificationHistory(userId: string): Promise<NotificationHistory[]> {
    try {
      const { data, error } = await supabase
        .from('notification_queue')
        .select(`
          id,
          subscription_id,
          notification_type,
          channel,
          sent_at,
          status,
          email_data,
          subscriptions!inner(name)
        `)
        .eq('user_id', userId)
        .eq('status', 'sent')
        .order('sent_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching notification history:', error);
        return [];
      }

      return data?.map(item => ({
        id: item.id,
        subscriptionId: item.subscription_id,
        subscriptionName: item.subscriptions?.name || 'Unknown',
        type: item.notification_type as NotificationType,
        channel: item.channel as 'email',
        message: this.generateMessageFromEmailData(item.email_data, item.notification_type),
        sentAt: new Date(item.sent_at || ''),
        delivered: item.status === 'sent',
        opened: false, // We'll implement email tracking later
        clicked: false
      })) || [];
    } catch (error) {
      console.error('Error in getNotificationHistory:', error);
      return [];
    }
  }

  // Get pending notifications count
  async getPendingNotificationsCount(userId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('notification_queue')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('status', 'pending');

      if (error) {
        console.error('Error getting pending count:', error);
        return 0;
      }

      return count || 0;
    } catch (error) {
      console.error('Error in getPendingNotificationsCount:', error);
      return 0;
    }
  }

  // Manually trigger notification processing
  async triggerNotificationProcessing(): Promise<boolean> {
    try {
      const response = await supabase.functions.invoke('process-notifications', {
        body: { manual_trigger: true }
      });

      if (response.error) {
        console.error('Error triggering notification processing:', response.error);
        return false;
      }

      console.log('Notification processing triggered:', response.data);
      return true;
    } catch (error) {
      console.error('Error in triggerNotificationProcessing:', error);
      return false;
    }
  }

  // Test email functionality by sending a test email
  async sendTestEmail(
    userEmail: string,
    subscriptionName: string = "Test Subscription"
  ): Promise<boolean> {
    try {
      const response = await supabase.functions.invoke('send-notification-email', {
        body: {
          notificationId: 'test-' + Date.now(),
          userEmail,
          subscriptionName,
          notificationType: 'payment-upcoming',
          daysRemaining: 3,
          price: 9.99,
          cycle: 'monthly'
        }
      });

      if (response.error) {
        console.error('Error sending test email:', response.error);
        return false;
      }

      console.log('Test email sent:', response.data);
      return true;
    } catch (error) {
      console.error('Error in sendTestEmail:', error);
      return false;
    }
  }

  private generateMessageFromEmailData(emailData: any, type: string): string {
    const { subscription_name, days_remaining, price } = emailData;
    const formattedPrice = `$${price?.toFixed(2) || '0.00'}`;

    switch (type) {
      case 'trial-ending':
        return `Your ${subscription_name} free trial ends in ${days_remaining} day${days_remaining !== 1 ? 's' : ''}. Consider upgrading or canceling to avoid charges.`;
      case 'payment-upcoming':
        return `Your ${subscription_name} payment of ${formattedPrice} is due in ${days_remaining} day${days_remaining !== 1 ? 's' : ''}.`;
      case 'subscription-renewal':
        return `Your ${subscription_name} subscription renews in ${days_remaining} day${days_remaining !== 1 ? 's' : ''}.`;
      default:
        return `Reminder for ${subscription_name}`;
    }
  }
}