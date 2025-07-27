import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'
import { UserSettings, NotificationSetting } from '@/lib/types'

interface DatabaseUserSettings {
  id: string
  user_id: string
  email_notifications: boolean
  push_notifications: boolean
  in_app_notifications: boolean
  currency: string
  theme: 'light' | 'dark' | 'system'
  timezone: string
  default_notifications: NotificationSetting[]
  created_at: string
  updated_at: string
}

const defaultNotifications: NotificationSetting[] = [
  {
    id: 'trial-ending',
    type: 'trial-ending',
    enabled: true,
    daysInAdvance: 3,
  },
  {
    id: 'payment-upcoming',
    type: 'payment-upcoming',
    enabled: true,
    daysInAdvance: 2,
  },
  {
    id: 'subscription-renewal',
    type: 'subscription-renewal',
    enabled: true,
    daysInAdvance: 7,
  },
]

export function useUserSettings() {
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  // Create default settings
  const createDefaultSettings = (): UserSettings => ({
    id: '',
    notificationPreference: {
      email: true,
      push: true,
      inApp: true,
      sms: false,
    },
    defaultNotifications,
    currency: 'USD',
    theme: 'system',
    timezone: 'America/New_York',
  })

  // Fetch user settings from database
  const fetchSettings = useCallback(async () => {
    if (!user) {
      // Set default settings for non-authenticated users
      setSettings(createDefaultSettings())
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') {
        // PGRST116 is "not found" error, which is expected for new users
        throw error
      }

      if (data) {
        // Transform database format to app format
        const userSettings: UserSettings = {
          id: data.id,
          notificationPreference: {
            email: data.email_notifications,
            push: data.push_notifications,
            inApp: data.in_app_notifications,
            sms: false, // SMS removed
          },
          defaultNotifications: Array.isArray(data.default_notifications) 
            ? (data.default_notifications as NotificationSetting[])
            : defaultNotifications,
          currency: data.currency,
          theme: data.theme as 'light' | 'dark' | 'system',
          timezone: data.timezone,
        }
        setSettings(userSettings)
      } else {
        // Create default settings for new user and immediately set them
        const newSettings = createDefaultSettings()
        setSettings(newSettings)
      }
    } catch (error: any) {
      console.error('Error fetching user settings:', error)
      // On error, still provide default settings instead of leaving null
      setSettings(createDefaultSettings())
      toast.error('Failed to load settings')
    } finally {
      setLoading(false)
    }
  }, [user])

  // Save settings to database
  const saveSettings = useCallback(async (newSettings: UserSettings) => {
    if (!user) return false

    try {
      const dbData = {
        user_id: user.id,
        email_notifications: newSettings.notificationPreference.email,
        push_notifications: newSettings.notificationPreference.push,
        in_app_notifications: newSettings.notificationPreference.inApp,
        currency: newSettings.currency,
        theme: newSettings.theme,
        timezone: newSettings.timezone || 'America/New_York',
        default_notifications: newSettings.defaultNotifications,
      }

      const { error } = await supabase
        .from('user_settings')
        .upsert(dbData, { onConflict: 'user_id' })

      if (error) throw error

      setSettings(newSettings)
      toast.success('Settings saved successfully!')
      return true
    } catch (error: any) {
      console.error('Error saving user settings:', error)
      toast.error('Failed to save settings')
      return false
    }
  }, [user])

  // Update a specific setting
  const updateSetting = useCallback(async (key: keyof UserSettings, value: any) => {
    if (!settings) return false

    const newSettings = { ...settings, [key]: value }
    return await saveSettings(newSettings)
  }, [settings, saveSettings])

  // Update notification preference
  const updateNotificationPreference = useCallback(async (key: keyof UserSettings['notificationPreference'], value: boolean) => {
    if (!settings) return false

    const newSettings = {
      ...settings,
      notificationPreference: {
        ...settings.notificationPreference,
        [key]: value
      }
    }
    return await saveSettings(newSettings)
  }, [settings, saveSettings])

  // Update a default notification setting
  const updateDefaultNotification = useCallback(async (notificationId: string, updates: Partial<NotificationSetting>) => {
    if (!settings) return false

    const newNotifications = settings.defaultNotifications.map(notification =>
      notification.id === notificationId
        ? { ...notification, ...updates }
        : notification
    )

    const newSettings = {
      ...settings,
      defaultNotifications: newNotifications
    }
    return await saveSettings(newSettings)
  }, [settings, saveSettings])

  // Load settings when user changes
  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  return {
    settings,
    loading,
    saveSettings,
    updateSetting,
    updateNotificationPreference,
    updateDefaultNotification,
    refreshSettings: fetchSettings,
  }
}