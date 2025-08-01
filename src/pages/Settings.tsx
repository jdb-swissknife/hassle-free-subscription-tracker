
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Bell, 
  CheckCircle, 
  Moon, 
  SunMedium, 
  Laptop,
  Calendar,
  Download,
  Globe,
  LogOut,
  User,
  TestTube
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { mockUserSettings } from '@/lib/mockData';
import { UserSettings, NotificationSetting } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';
import { useSupabaseSubscriptions } from '@/hooks/useSupabaseSubscriptions';
import { useUserSettings } from '@/hooks/useUserSettings';
import { CalendarService } from '@/services/calendarService';
import { toast } from 'sonner';
import DataExport from '@/components/DataExport';

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { settings, loading: settingsLoading, updateSetting, updateNotificationPreference, updateDefaultNotification } = useUserSettings();
  
  const { subscriptions } = useSupabaseSubscriptions();
  const calendarService = CalendarService.getInstance();
  
  const handleNotificationToggle = async (id: string, enabled: boolean) => {
    await updateDefaultNotification(id, { enabled });
  };
  
  const handleNotificationDaysChange = async (id: string, days: number) => {
    await updateDefaultNotification(id, { daysInAdvance: days });
  };
  
  const handlePreferenceToggle = async (key: keyof UserSettings['notificationPreference'], value: boolean) => {
    await updateNotificationPreference(key, value);
  };
  
  const handleThemeChange = async (theme: 'light' | 'dark' | 'system') => {
    await updateSetting('theme', theme);
  };
  
  const handleCurrencyChange = async (currency: string) => {
    await updateSetting('currency', currency);
  };

  const handlePhoneNumberChange = async (phoneNumber: string) => {
    await updateSetting('phoneNumber', phoneNumber);
  };

  const handleTimezoneChange = async (timezone: string) => {
    await updateSetting('timezone', timezone);
  };

  const handleDownloadAllCalendar = () => {
    const activeSubscriptions = subscriptions.filter(sub => sub.active);
    if (activeSubscriptions.length === 0) {
      toast.error('No active subscriptions to export');
      return;
    }
    
    calendarService.downloadBulkCalendar(activeSubscriptions, 12);
    toast.success('Calendar file downloaded successfully!');
  };

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success('Successfully logged out');
      navigate('/');
    } catch (error) {
      toast.error('Failed to log out');
    }
  };
  
  const getThemeIcon = (theme: string) => {
    switch (theme) {
      case 'light':
        return <SunMedium className="h-5 w-5" />;
      case 'dark':
        return <Moon className="h-5 w-5" />;
      default:
        return <Laptop className="h-5 w-5" />;
    }
  };
  
  // Show loading state while settings are being fetched or if settings is null
  if (settingsLoading || !settings) {
    return (
      <div className="container max-w-2xl mx-auto px-4 py-8 min-h-screen">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading settings...</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container max-w-2xl mx-auto px-4 py-8 min-h-screen">
      <header className="mb-8">
        <div className="flex items-center gap-2 mb-6">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold">Settings</h1>
        </div>
      </header>
      
      <main className="space-y-8">
        <section className="glass-card p-6">
          <h2 className="text-xl font-medium mb-4 flex items-center">
            <Bell className="h-5 w-5 mr-2 text-primary" />
            Notification Preferences
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="email-notifications" className="flex-grow">Email Notifications</Label>
              <Switch
                id="email-notifications"
                checked={settings.notificationPreference.email}
                onCheckedChange={(checked) => handlePreferenceToggle('email', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="push-notifications" className="flex-grow">Push Notifications</Label>
              <Switch
                id="push-notifications"
                checked={settings.notificationPreference.push}
                onCheckedChange={(checked) => handlePreferenceToggle('push', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="inapp-notifications" className="flex-grow">In-App Notifications</Label>
              <Switch
                id="inapp-notifications"
                checked={settings.notificationPreference.inApp}
                onCheckedChange={(checked) => handlePreferenceToggle('inApp', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TestTube className="h-4 w-4" />
                <span>Test Email Notifications</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  if (!user?.email) {
                    toast.error('No email address found');
                    return;
                  }
                  
                  try {
                    const { EmailNotificationService } = await import('@/services/emailNotificationService');
                    const service = EmailNotificationService.getInstance();
                    const success = await service.sendTestEmail(user.email);
                    if (success) {
                      toast.success('Test email sent successfully!');
                    } else {
                      toast.error('Failed to send test email');
                    }
                  } catch (error) {
                    console.error('Error sending test email:', error);
                    toast.error('Error sending test email');
                  }
                }}
              >
                Send Test Email
              </Button>
            </div>
          </div>
          
          <Separator className="my-6" />
          
          <h3 className="text-lg font-medium mb-4">Default Notification Settings</h3>
          <p className="text-sm text-muted-foreground mb-4">
            These settings will apply to all new subscriptions you add. You can customize notifications for individual subscriptions separately.
          </p>
          
          <div className="space-y-5">
            {settings.defaultNotifications.map((notification: NotificationSetting) => (
              <div key={notification.id} className="rounded-md bg-accent/50 p-4">
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor={`notification-${notification.id}`} className="font-medium">
                    {notification.type === 'trial-ending'
                      ? 'Trial Expiration Alerts'
                      : notification.type === 'payment-upcoming'
                      ? 'Payment Reminders'
                      : notification.type === 'subscription-renewal'
                      ? 'Subscription Renewal Alerts'
                      : notification.type === 'payment-failure'
                      ? 'Payment Failure Alerts'
                      : notification.type === 'price-change'
                      ? 'Price Change Notifications'
                      : 'Custom Notifications'}
                  </Label>
                  <Switch
                    id={`notification-${notification.id}`}
                    checked={notification.enabled}
                    onCheckedChange={(checked) => handleNotificationToggle(notification.id, checked)}
                  />
                </div>
                
                <div className="flex items-center mt-2">
                  <span className="text-sm text-muted-foreground mr-2">Notify me</span>
                  <Select
                    value={notification.daysInAdvance.toString()}
                    onValueChange={(value) => handleNotificationDaysChange(notification.id, parseInt(value))}
                    disabled={!notification.enabled}
                  >
                    <SelectTrigger className="w-24">
                      <SelectValue placeholder="Days" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 day</SelectItem>
                      <SelectItem value="2">2 days</SelectItem>
                      <SelectItem value="3">3 days</SelectItem>
                      <SelectItem value="5">5 days</SelectItem>
                      <SelectItem value="7">7 days</SelectItem>
                      <SelectItem value="14">14 days</SelectItem>
                    </SelectContent>
                  </Select>
                  <span className="text-sm text-muted-foreground ml-2">in advance</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="glass-card p-6">
          <h2 className="text-xl font-medium mb-4 flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-primary" />
            Calendar Integration
          </h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Export Subscription Calendar</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Download your subscription renewals and payment dates as a calendar file that you can import into Google Calendar, Outlook, or Apple Calendar.
              </p>
              
              <Button
                onClick={handleDownloadAllCalendar}
                className="flex items-center gap-2"
                disabled={subscriptions.filter(sub => sub.active).length === 0}
              >
                <Download className="h-4 w-4" />
                Download Calendar (.ics)
              </Button>
              
              {subscriptions.filter(sub => sub.active).length === 0 && (
                <p className="text-sm text-muted-foreground mt-2">
                  Add some active subscriptions to export their calendar events.
                </p>
              )}
            </div>

            <Separator />

            <div>
              <h3 className="font-medium mb-2">How to Import</h3>
              <div className="text-sm text-muted-foreground space-y-2">
                <p><strong>Google Calendar:</strong> Go to Settings → Import & Export → Import</p>
                <p><strong>Outlook:</strong> File → Open & Export → Import/Export → Import an iCalendar file</p>
                <p><strong>Apple Calendar:</strong> File → Import → Select the .ics file</p>
              </div>
            </div>
          </div>
        </section>
        
        <section className="glass-card p-6">
          <h2 className="text-xl font-medium mb-4">Appearance & Preferences</h2>
          
          <div className="space-y-6">
            <div>
              <Label htmlFor="theme-select" className="block mb-2">Theme</Label>
              <div className="grid grid-cols-3 gap-2">
                {(['light', 'dark', 'system'] as const).map((theme) => (
                  <Button
                    key={theme}
                    variant={settings.theme === theme ? "default" : "outline"}
                    className="flex flex-col h-auto py-3 px-4 gap-2 items-center justify-center hover:border-primary"
                    onClick={() => handleThemeChange(theme)}
                  >
                    {getThemeIcon(theme)}
                    <span className="capitalize">{theme}</span>
                  </Button>
                ))}
              </div>
            </div>
            
            <div>
              <Label htmlFor="currency-select" className="block mb-2">Currency</Label>
              <Select
                value={settings.currency}
                onValueChange={handleCurrencyChange}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                  <SelectItem value="GBP">GBP (£)</SelectItem>
                  <SelectItem value="JPY">JPY (¥)</SelectItem>
                  <SelectItem value="CAD">CAD ($)</SelectItem>
                  <SelectItem value="AUD">AUD ($)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="timezone-select" className="block mb-2 flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Timezone
              </Label>
              <Select
                value={settings.timezone}
                onValueChange={handleTimezoneChange}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                  <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                  <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                  <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                  <SelectItem value="Europe/London">London Time (GMT)</SelectItem>
                  <SelectItem value="Europe/Paris">Central European Time (CET)</SelectItem>
                  <SelectItem value="Asia/Tokyo">Japan Time (JST)</SelectItem>
                  <SelectItem value="Australia/Sydney">Australian Eastern Time (AET)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </section>

        <DataExport />

        <section className="glass-card p-6">
          <h2 className="text-xl font-medium mb-4 flex items-center">
            <User className="h-5 w-5 mr-2 text-primary" />
            Account
          </h2>
          
          <div className="space-y-4">
            <div>
              <Label className="block mb-2">Email</Label>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>

            <div>
              <Button
                onClick={() => navigate('/account')}
                variant="outline"
                className="flex items-center gap-2"
              >
                <User className="h-4 w-4" />
                Manage Account
              </Button>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="font-medium mb-2 text-destructive">Danger Zone</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Sign out of your account. You'll need to sign back in to access your subscriptions.
              </p>
              <Button
                variant="destructive"
                onClick={handleLogout}
                className="flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Settings;
