
import { Subscription, UserSettings } from './types';

export const mockSubscriptions: Subscription[] = [
  {
    id: '1',
    name: 'Netflix',
    provider: 'Netflix, Inc.',
    price: 15.99,
    cycle: 'monthly',
    startDate: new Date('2023-01-15'),
    trialEndDate: new Date('2023-02-15'),
    category: 'entertainment',
    logo: 'netflix-logo',
    color: '#E50914',
    description: 'Premium streaming subscription',
    paymentMethod: 'Visa ending in 4242',
    notifications: [
      {
        id: 'notif-1',
        type: 'trial-ending',
        enabled: true,
        daysInAdvance: 3,
      },
      {
        id: 'notif-2',
        type: 'payment-upcoming',
        enabled: true,
        daysInAdvance: 2,
      }
    ],
    active: true,
  },
  {
    id: '2',
    name: 'Spotify Premium',
    provider: 'Spotify AB',
    price: 9.99,
    cycle: 'monthly',
    startDate: new Date('2022-11-05'),
    category: 'entertainment',
    logo: 'spotify-logo',
    color: '#1DB954',
    paymentMethod: 'MasterCard ending in 8888',
    notifications: [
      {
        id: 'notif-3',
        type: 'payment-upcoming',
        enabled: true,
        daysInAdvance: 1,
      }
    ],
    active: true,
  },
  {
    id: '3',
    name: 'Adobe Creative Cloud',
    provider: 'Adobe Inc.',
    price: 52.99,
    cycle: 'monthly',
    startDate: new Date('2022-09-22'),
    category: 'productivity',
    logo: 'adobe-logo',
    color: '#FF0000',
    paymentMethod: 'PayPal',
    notifications: [
      {
        id: 'notif-4',
        type: 'payment-upcoming',
        enabled: true,
        daysInAdvance: 3,
      }
    ],
    active: true,
  },
  {
    id: '4',
    name: 'Amazon Prime',
    provider: 'Amazon.com, Inc.',
    price: 139,
    cycle: 'yearly',
    startDate: new Date('2023-02-10'),
    category: 'lifestyle',
    logo: 'amazon-logo',
    color: '#FF9900',
    paymentMethod: 'Amex ending in 1234',
    notifications: [
      {
        id: 'notif-5',
        type: 'subscription-renewal',
        enabled: true,
        daysInAdvance: 14,
      }
    ],
    active: true,
  },
  {
    id: '5',
    name: 'iCloud+',
    provider: 'Apple Inc.',
    price: 2.99,
    cycle: 'monthly',
    startDate: new Date('2023-01-01'),
    category: 'utilities',
    logo: 'apple-logo',
    color: '#A2AAAD',
    paymentMethod: 'Apple Pay',
    notifications: [
      {
        id: 'notif-6',
        type: 'payment-upcoming',
        enabled: false,
        daysInAdvance: 2,
      }
    ],
    active: true,
  }
];

export const mockUserSettings: UserSettings = {
  id: 'user-1',
  notificationPreference: {
    email: true,
    push: true,
    inApp: true,
    sms: false,
  },
  defaultNotifications: [
    {
      id: 'default-1',
      type: 'trial-ending',
      enabled: true,
      daysInAdvance: 3,
    },
    {
      id: 'default-2',
      type: 'payment-upcoming',
      enabled: true,
      daysInAdvance: 2,
    },
    {
      id: 'default-3',
      type: 'subscription-renewal',
      enabled: true,
      daysInAdvance: 7,
    }
  ],
  currency: 'USD',
  theme: 'system',
};

export const getUpcomingNotifications = () => {
  const today = new Date();
  const notifications = [];
  
  mockSubscriptions.forEach(subscription => {
    subscription.notifications.forEach(notification => {
      if (!notification.enabled) return;
      
      let targetDate: Date | undefined;
      
      if (notification.type === 'trial-ending' && subscription.trialEndDate) {
        targetDate = new Date(subscription.trialEndDate);
        targetDate.setDate(targetDate.getDate() - notification.daysInAdvance);
      } else if (notification.type === 'payment-upcoming' || notification.type === 'subscription-renewal') {
        // Calculate next payment date based on cycle
        const nextPaymentDate = new Date(subscription.startDate);
        
        if (subscription.cycle === 'monthly') {
          // Find the next monthly payment date
          while (nextPaymentDate <= today) {
            nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);
          }
        } else if (subscription.cycle === 'yearly') {
          // Find the next yearly payment date
          while (nextPaymentDate <= today) {
            nextPaymentDate.setFullYear(nextPaymentDate.getFullYear() + 1);
          }
        } else if (subscription.cycle === 'weekly') {
          // Find the next weekly payment date
          while (nextPaymentDate <= today) {
            nextPaymentDate.setDate(nextPaymentDate.getDate() + 7);
          }
        }
        
        targetDate = new Date(nextPaymentDate);
        targetDate.setDate(targetDate.getDate() - notification.daysInAdvance);
      }
      
      if (targetDate) {
        // Check if notification date is today or in the future
        const isToday = 
          targetDate.getDate() === today.getDate() && 
          targetDate.getMonth() === today.getMonth() && 
          targetDate.getFullYear() === today.getFullYear();
        
        const isUpcoming = targetDate > today && 
          targetDate.getTime() - today.getTime() < 7 * 24 * 60 * 60 * 1000; // within next 7 days
        
        if (isToday || isUpcoming) {
          notifications.push({
            id: `${subscription.id}-${notification.id}`,
            subscriptionId: subscription.id,
            subscriptionName: subscription.name,
            type: notification.type,
            targetDate: targetDate,
            isToday,
            message: notification.message || getDefaultMessage(notification.type, subscription, targetDate),
          });
        }
      }
    });
  });
  
  return notifications.sort((a, b) => a.targetDate.getTime() - b.targetDate.getTime());
};

const getDefaultMessage = (type: string, subscription: Subscription, date: Date) => {
  switch (type) {
    case 'trial-ending':
      return `Your trial for ${subscription.name} is ending soon`;
    case 'payment-upcoming':
      return `Upcoming payment of $${subscription.price} for ${subscription.name}`;
    case 'subscription-renewal':
      return `Your ${subscription.name} subscription will renew soon`;
    case 'price-change':
      return `Price change for your ${subscription.name} subscription`;
    default:
      return `Notification for ${subscription.name}`;
  }
};
