
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
  | 'custom';

export type NotificationSetting = {
  id: string;
  type: NotificationType;
  enabled: boolean;
  daysInAdvance: number;
  message?: string;
};

export type NotificationPreference = {
  email: boolean;
  push: boolean;
  inApp: boolean;
};

export type UserSettings = {
  id: string;
  notificationPreference: NotificationPreference;
  defaultNotifications: NotificationSetting[];
  currency: string;
  theme: 'light' | 'dark' | 'system';
};
