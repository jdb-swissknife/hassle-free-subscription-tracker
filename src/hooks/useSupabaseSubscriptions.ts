
import { useCallback, useEffect, useState } from 'react'
import { Subscription, SubscriptionCategory } from '@/lib/types'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'

export function useSupabaseSubscriptions() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  // Fetch subscriptions from Supabase
  const fetchSubscriptions = useCallback(async () => {
    if (!user) {
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Transform the data to match our Subscription type
      const transformedSubscriptions = (data || []).map((sub: any) => ({
        id: sub.id,
        name: sub.name,
        provider: sub.provider,
        price: sub.price,
        cycle: sub.cycle as 'monthly' | 'yearly' | 'weekly' | 'custom',
        startDate: new Date(sub.start_date),
        endDate: sub.end_date ? new Date(sub.end_date) : undefined,
        trialEndDate: sub.trial_end_date ? new Date(sub.trial_end_date) : undefined,
        category: (sub.category || 'other') as SubscriptionCategory,
        color: sub.color,
        description: sub.description,
        notifications: [],
        active: sub.active,
      }))

      setSubscriptions(transformedSubscriptions)
    } catch (error: any) {
      console.error('Error fetching subscriptions:', error)
      toast.error('Failed to load subscriptions')
    } finally {
      setLoading(false)
    }
  }, [user])

  // Load subscriptions when user changes
  useEffect(() => {
    fetchSubscriptions()
  }, [fetchSubscriptions])

  // Add a new subscription
  const addSubscription = useCallback(async (subscription: Omit<Subscription, 'id'>) => {
    if (!user) return null

    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .insert([
          {
            name: subscription.name,
            provider: subscription.provider,
            price: subscription.price,
            cycle: subscription.cycle,
            category: subscription.category,
            color: subscription.color,
            description: subscription.description,
            user_id: user.id,
            start_date: subscription.startDate?.toISOString() || new Date().toISOString(),
            end_date: subscription.endDate?.toISOString(),
            trial_end_date: subscription.trialEndDate?.toISOString(),
            active: subscription.active,
          }
        ])
        .select()
        .single()

      if (error) throw error

      if (data) {
        const newSubscription: Subscription = {
          id: data.id,
          name: data.name,
          provider: data.provider,
          price: data.price,
          cycle: data.cycle as 'monthly' | 'yearly' | 'weekly' | 'custom',
          startDate: new Date(data.start_date),
          endDate: data.end_date ? new Date(data.end_date) : undefined,
          trialEndDate: data.trial_end_date ? new Date(data.trial_end_date) : undefined,
          category: (data.category || 'other') as SubscriptionCategory,
          color: data.color,
          description: data.description,
          notifications: [],
          active: data.active,
        }

        setSubscriptions(prev => [newSubscription, ...prev])
        toast.success('Subscription added successfully!')
        return newSubscription
      }
    } catch (error: any) {
      console.error('Error adding subscription:', error)
      toast.error('Failed to add subscription')
      return null
    }
  }, [user])

  // Update an existing subscription
  const updateSubscription = useCallback(async (id: string, updates: Partial<Subscription>) => {
    if (!user) return

    try {
      const updateData: any = {}
      
      if (updates.name !== undefined) updateData.name = updates.name
      if (updates.provider !== undefined) updateData.provider = updates.provider
      if (updates.price !== undefined) updateData.price = updates.price
      if (updates.cycle !== undefined) updateData.cycle = updates.cycle
      if (updates.category !== undefined) updateData.category = updates.category
      if (updates.color !== undefined) updateData.color = updates.color
      if (updates.description !== undefined) updateData.description = updates.description
      if (updates.startDate !== undefined) updateData.start_date = updates.startDate.toISOString()
      if (updates.endDate !== undefined) updateData.end_date = updates.endDate?.toISOString()
      if (updates.trialEndDate !== undefined) updateData.trial_end_date = updates.trialEndDate?.toISOString()
      if (updates.active !== undefined) updateData.active = updates.active

      const { error } = await supabase
        .from('subscriptions')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) throw error

      setSubscriptions(prev =>
        prev.map(sub => (sub.id === id ? { ...sub, ...updates } : sub))
      )
      toast.success('Subscription updated successfully!')
    } catch (error: any) {
      console.error('Error updating subscription:', error)
      toast.error('Failed to update subscription')
    }
  }, [user])

  // Delete a subscription
  const deleteSubscription = useCallback(async (id: string) => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('subscriptions')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) throw error

      setSubscriptions(prev => prev.filter(sub => sub.id !== id))
      toast.success('Subscription deleted successfully!')
    } catch (error: any) {
      console.error('Error deleting subscription:', error)
      toast.error('Failed to delete subscription')
    }
  }, [user])

  // Get a subscription by ID
  const getSubscription = useCallback((id: string) => {
    return subscriptions.find(sub => sub.id === id)
  }, [subscriptions])

  // Calculate total monthly spending
  const calculateMonthlySpend = useCallback(() => {
    return subscriptions
      .filter(sub => sub.active)
      .reduce((sum, sub) => {
        if (sub.cycle === 'monthly') return sum + sub.price
        if (sub.cycle === 'yearly') return sum + (sub.price / 12)
        if (sub.cycle === 'weekly') return sum + (sub.price * 4.33)
        return sum
      }, 0)
  }, [subscriptions])

  // Get all active subscriptions
  const getActiveSubscriptions = useCallback(() => {
    return subscriptions.filter(sub => sub.active)
  }, [subscriptions])

  // Get all free trials
  const getFreeTrials = useCallback(() => {
    const today = new Date()
    return subscriptions.filter(sub => 
      sub.active && sub.trialEndDate && new Date(sub.trialEndDate) > today
    )
  }, [subscriptions])

  // Search subscriptions
  const searchSubscriptions = useCallback((term: string) => {
    if (!term) return subscriptions
    
    const searchTerm = term.toLowerCase()
    return subscriptions.filter(sub => 
      sub.name.toLowerCase().includes(searchTerm) || 
      sub.provider.toLowerCase().includes(searchTerm) ||
      sub.description?.toLowerCase().includes(searchTerm)
    )
  }, [subscriptions])

  return {
    subscriptions,
    loading,
    addSubscription,
    updateSubscription,
    deleteSubscription,
    getSubscription,
    calculateMonthlySpend,
    getActiveSubscriptions,
    getFreeTrials,
    searchSubscriptions,
    refreshSubscriptions: fetchSubscriptions,
  }
}
