
import { NotificationSetting, NotificationChannel, NotificationHistory, Subscription } from '@/lib/types';
import { differenceInDays, format } from 'date-fns';

export class NotificationService {
  private static instance: NotificationService;
  private notificationHistory: NotificationHistory[] = [];

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  // Check which notifications should be triggered
  checkUpcomingNotifications(subscriptions: Subscription[]): NotificationHistory[] {
    const today = new Date();
    const notifications: NotificationHistory[] = [];

    subscriptions.forEach(subscription => {
      if (!subscription.active) return;

      subscription.notifications.forEach(setting => {
        if (!setting.enabled) return;

        const shouldNotify = this.shouldTriggerNotification(subscription, setting, today);
        if (shouldNotify) {
          const notification = this.createNotification(subscription, setting);
          notifications.push(notification);
        }
      });
    });

    return notifications;
  }

  private shouldTriggerNotification(
    subscription: Subscription, 
    setting: NotificationSetting, 
    today: Date
  ): boolean {
    let targetDate: Date;

    switch (setting.type) {
      case 'trial-ending':
        if (!subscription.trialEndDate) return false;
        targetDate = new Date(subscription.trialEndDate);
        break;
      case 'payment-upcoming':
      case 'subscription-renewal':
        targetDate = this.calculateNextPaymentDate(subscription);
        break;
      default:
        return false;
    }

    const daysUntil = differenceInDays(targetDate, today);
    return daysUntil === setting.daysInAdvance;
  }

  private calculateNextPaymentDate(subscription: Subscription): Date {
    const startDate = new Date(subscription.startDate);
    const today = new Date();
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

  private createNotification(
    subscription: Subscription, 
    setting: NotificationSetting
  ): NotificationHistory {
    const message = this.generateNotificationMessage(subscription, setting);
    
    return {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      subscriptionId: subscription.id,
      subscriptionName: subscription.name,
      type: setting.type,
      channel: 'inApp',
      message,
      sentAt: new Date(),
      delivered: true,
      opened: false,
      clicked: false
    };
  }

  private generateNotificationMessage(
    subscription: Subscription, 
    setting: NotificationSetting
  ): string {
    const price = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(subscription.price);

    switch (setting.type) {
      case 'trial-ending':
        return `Your ${subscription.name} free trial ends in ${setting.daysInAdvance} day${setting.daysInAdvance !== 1 ? 's' : ''}. Consider upgrading or canceling to avoid charges.`;
      case 'payment-upcoming':
        return `Your ${subscription.name} payment of ${price} is due in ${setting.daysInAdvance} day${setting.daysInAdvance !== 1 ? 's' : ''}.`;
      case 'subscription-renewal':
        return `Your ${subscription.name} subscription (${price}/${subscription.cycle.slice(0, -2)}) renews in ${setting.daysInAdvance} day${setting.daysInAdvance !== 1 ? 's' : ''}.`;
      case 'payment-failure':
        return `Payment failed for ${subscription.name}. Please update your payment method to avoid service interruption.`;
      case 'subscription-change':
        return `Changes detected for your ${subscription.name} subscription. Please review the updated details.`;
      case 'price-change':
        return `The price for ${subscription.name} will change to ${price} starting with your next billing cycle.`;
      default:
        return setting.message || `Reminder for ${subscription.name}`;
    }
  }

  // Get notification history
  getNotificationHistory(): NotificationHistory[] {
    return this.notificationHistory.sort((a, b) => b.sentAt.getTime() - a.sentAt.getTime());
  }

  // Mark notification as opened
  markAsOpened(notificationId: string): void {
    const notification = this.notificationHistory.find(n => n.id === notificationId);
    if (notification) {
      notification.opened = true;
    }
  }

  // Mark notification as clicked
  markAsClicked(notificationId: string): void {
    const notification = this.notificationHistory.find(n => n.id === notificationId);
    if (notification) {
      notification.clicked = true;
    }
  }

  // Add notification to history
  addToHistory(notification: NotificationHistory): void {
    this.notificationHistory.push(notification);
  }

  // Clear old notifications
  clearOldNotifications(daysOld: number = 30): void {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);
    
    this.notificationHistory = this.notificationHistory.filter(
      notification => notification.sentAt > cutoffDate
    );
  }
}
