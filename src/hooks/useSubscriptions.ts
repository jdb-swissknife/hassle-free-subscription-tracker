
import { useCallback } from 'react';
import { Subscription } from '@/lib/types';
import useLocalStorage from './useLocalStorage';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';

export function useSubscriptions() {
  const [subscriptions, setSubscriptions] = useLocalStorage<Subscription[]>('subscriptions', []);

  // Add a new subscription
  const addSubscription = useCallback((subscription: Omit<Subscription, 'id'>) => {
    const newSubscription = {
      ...subscription,
      id: uuidv4(),
    };
    
    setSubscriptions(prev => [...prev, newSubscription]);
    toast.success('Subscription added successfully!');
    return newSubscription;
  }, [setSubscriptions]);

  // Update an existing subscription
  const updateSubscription = useCallback((id: string, subscription: Partial<Subscription>) => {
    setSubscriptions(prev => {
      const exists = prev.some(sub => sub.id === id);
      
      if (!exists) {
        toast.error('Subscription not found');
        return prev;
      }
      
      const updated = prev.map(sub => {
        if (sub.id === id) {
          return { ...sub, ...subscription };
        }
        return sub;
      });
      
      toast.success('Subscription updated successfully!');
      return updated;
    });
  }, [setSubscriptions]);

  // Delete a subscription
  const deleteSubscription = useCallback((id: string) => {
    setSubscriptions(prev => {
      const exists = prev.some(sub => sub.id === id);
      
      if (!exists) {
        toast.error('Subscription not found');
        return prev;
      }
      
      const updated = prev.filter(sub => sub.id !== id);
      toast.success('Subscription deleted successfully!');
      return updated;
    });
  }, [setSubscriptions]);

  // Get a subscription by ID
  const getSubscription = useCallback((id: string) => {
    return subscriptions.find(sub => sub.id === id);
  }, [subscriptions]);

  // Calculate total monthly spending
  const calculateMonthlySpend = useCallback(() => {
    return subscriptions
      .filter(sub => sub.active)
      .reduce((sum, sub) => {
        if (sub.cycle === 'monthly') return sum + sub.price;
        if (sub.cycle === 'yearly') return sum + (sub.price / 12);
        if (sub.cycle === 'weekly') return sum + (sub.price * 4.33); // Average weeks in month
        return sum;
      }, 0);
  }, [subscriptions]);

  // Get all active subscriptions
  const getActiveSubscriptions = useCallback(() => {
    return subscriptions.filter(sub => sub.active);
  }, [subscriptions]);

  // Get all free trials
  const getFreeTrials = useCallback(() => {
    const today = new Date();
    return subscriptions.filter(sub => 
      sub.active && sub.trialEndDate && new Date(sub.trialEndDate) > today
    );
  }, [subscriptions]);

  // Search subscriptions
  const searchSubscriptions = useCallback((term: string) => {
    if (!term) return subscriptions;
    
    const searchTerm = term.toLowerCase();
    return subscriptions.filter(sub => 
      sub.name.toLowerCase().includes(searchTerm) || 
      sub.provider.toLowerCase().includes(searchTerm) ||
      sub.description?.toLowerCase().includes(searchTerm)
    );
  }, [subscriptions]);

  return {
    subscriptions,
    addSubscription,
    updateSubscription,
    deleteSubscription,
    getSubscription,
    calculateMonthlySpend,
    getActiveSubscriptions,
    getFreeTrials,
    searchSubscriptions
  };
}
