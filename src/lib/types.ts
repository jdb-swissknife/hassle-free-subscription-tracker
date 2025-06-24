
export type Subscription = {
  id: string;
  name: string;
  provider: string;
  price: number;
  cycle: 'monthly' | 'yearly' | 'weekly' | 'custom';
  startDate: Date;
  endDate?: Date;
  trialEndDate?: Date;
  category: SubscriptionCategory;
  logo?: string;
  color?: string;
  description?: string;
  paymentMethod?: string;
  notifications: NotificationSetting[];
  active: boolean;
};

export type SubscriptionCategory = 
  | 'entertainment'
  | 'productivity'
  | 'utilities'
  | 'social'
  | 'lifestyle'
  | 'health'
  | 'finance'
  | 'other';

export type NotificationType = 
  | 'trial-ending'
  | 'payment-upcoming'
  | 'subscription-renewal'
  | 'price-change'
  | 'payment-failure'
  | 'subscription-change'
  | 'custom';

export type NotificationSetting = {
  id: string;
  type: NotificationType;
  enabled: boolean;
  daysInAdvance: number;
  message?: string;
};

export type NotificationChannel = 'email' | 'sms' | 'inApp';

export type NotificationPreference = {
  email: boolean;
  push: boolean;
  inApp: boolean;
  sms: boolean;
};

export type UserSettings = {
  id: string;
  notificationPreference: NotificationPreference;
  defaultNotifications: NotificationSetting[];
  currency: string;
  theme: 'light' | 'dark' | 'system';
  phoneNumber?: string;
  timezone?: string;
};

export type NotificationHistory = {
  id: string;
  subscriptionId: string;
  subscriptionName: string;
  type: NotificationType;
  channel: NotificationChannel;
  message: string;
  sentAt: Date;
  delivered: boolean;
  opened?: boolean;
  clicked?: boolean;
};

export type CalendarEvent = {
  id: string;
  subscriptionId: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  reminders: number[]; // minutes before event
  type: 'renewal' | 'payment' | 'trial-end';
};
