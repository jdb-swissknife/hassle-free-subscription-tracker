
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, CheckCircle, Moon, SunMedium, Laptop } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { mockUserSettings } from '@/lib/mockData';
import { UserSettings, NotificationSetting } from '@/lib/types';
import { toast } from 'sonner';

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState<UserSettings>(mockUserSettings);
  
  const handleNotificationToggle = (id: string, enabled: boolean) => {
    setSettings(prev => ({
      ...prev,
      defaultNotifications: prev.defaultNotifications.map(notification => 
        notification.id === id ? { ...notification, enabled } : notification
      )
    }));
  };
  
  const handleNotificationDaysChange = (id: string, days: number) => {
    setSettings(prev => ({
      ...prev,
      defaultNotifications: prev.defaultNotifications.map(notification => 
        notification.id === id ? { ...notification, daysInAdvance: days } : notification
      )
    }));
  };
  
  const handlePreferenceToggle = (key: keyof UserSettings['notificationPreference'], value: boolean) => {
    setSettings(prev => ({
      ...prev,
      notificationPreference: {
        ...prev.notificationPreference,
        [key]: value
      }
    }));
  };
  
  const handleThemeChange = (theme: 'light' | 'dark' | 'system') => {
    setSettings(prev => ({
      ...prev,
      theme
    }));
  };
  
  const handleCurrencyChange = (currency: string) => {
    setSettings(prev => ({
      ...prev,
      currency
    }));
  };
  
  const handleSave = () => {
    // In a real app, this would save to a database
    console.log('Saving settings:', settings);
    toast.success('Settings saved successfully!');
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
                      : 'Subscription Renewal Alerts'}
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
          </div>
        </section>
        
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => navigate('/')}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            <CheckCircle className="mr-2 h-4 w-4" /> Save Settings
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Settings;
