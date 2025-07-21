import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

export interface UserProfile {
  id: string
  user_id: string
  first_name: string | null
  last_name: string | null
  display_name: string | null
  created_at: string
  updated_at: string
}

export function useProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  const fetchProfile = async () => {
    if (!user) {
      setProfile(null)
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      setProfile(data)
    } catch (error: any) {
      console.error('Error fetching profile:', error)
      toast.error('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (updates: Partial<Pick<UserProfile, 'first_name' | 'last_name' | 'display_name'>>) => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          ...updates,
        })
        .select()
        .single()

      if (error) throw error

      setProfile(data)
      toast.success('Profile updated successfully')
    } catch (error: any) {
      console.error('Error updating profile:', error)
      toast.error('Failed to update profile')
      throw error
    }
  }

  useEffect(() => {
    fetchProfile()
  }, [user])

  return {
    profile,
    loading,
    updateProfile,
    refetch: fetchProfile,
  }
}