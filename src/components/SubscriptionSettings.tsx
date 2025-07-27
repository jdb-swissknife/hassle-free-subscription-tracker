
import React from 'react';
import { format } from 'date-fns';
import { Calendar, AlertCircle, Palette, FileText, Bell } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

interface SubscriptionSettingsProps {
  startDate: Date | undefined;
  setStartDate: (date: Date | undefined) => void;
  hasTrial: boolean;
  setHasTrial: (hasTrial: boolean) => void;
  trialEndDate: Date | undefined;
  setTrialEndDate: (date: Date | undefined) => void;
  subscription: any;
  onSubscriptionChange: (updates: any) => void;
}

const colorOptions = [
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Purple', value: '#8b5cf6' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Green', value: '#10b981' },
  { name: 'Orange', value: '#f59e0b' },
  { name: 'Red', value: '#ef4444' },
  { name: 'Indigo', value: '#6366f1' },
  { name: 'Teal', value: '#14b8a6' },
];

const SubscriptionSettings: React.FC<SubscriptionSettingsProps> = ({
  startDate,
  setStartDate,
  hasTrial,
  setHasTrial,
  trialEndDate,
  setTrialEndDate,
  subscription,
  onSubscriptionChange
}) => {
  return (
    <div className="space-y-8">
      {/* Start Date */}
      <div>
        <Label className="text-sm font-medium flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Start Date
        </Label>
        <p className="text-sm text-muted-foreground mb-3">When did you start this subscription?</p>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-full justify-start text-left font-normal",
                !startDate && "text-muted-foreground"
              )}
            >
              <Calendar className="mr-2 h-4 w-4" />
              {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 pointer-events-auto" align="start">
            <CalendarComponent
              mode="single"
              selected={startDate}
              onSelect={setStartDate}
              initialFocus
              className={cn("p-3 pointer-events-auto")}
            />
          </PopoverContent>
        </Popover>
      </div>
      
      {/* Free Trial - Featured Section */}
      <div className="rounded-lg border-2 border-dashed border-primary/30 bg-primary/5 p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="rounded-full bg-primary/10 p-3">
              <AlertCircle className="h-6 w-6 text-primary" />
            </div>
          </div>
          <div className="flex-1 space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-primary">Free Trial Information</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Does this subscription include a free trial period? This helps track when you'll be charged.
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <Checkbox
                id="hasTrial"
                checked={hasTrial}
                onCheckedChange={(checked) => setHasTrial(checked === true)}
                className="rounded h-5 w-5"
              />
              <Label htmlFor="hasTrial" className="cursor-pointer font-medium text-base">
                Yes, this subscription has a free trial
              </Label>
            </div>
            
            {hasTrial && (
              <div className="mt-4 p-4 bg-background rounded-lg border">
                <Label className="text-sm font-medium flex items-center gap-2 mb-3">
                  <Calendar className="h-4 w-4" />
                  When does your free trial end?
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !trialEndDate && "text-muted-foreground"
                      )}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {trialEndDate ? format(trialEndDate, "PPP") : <span>Select trial end date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 pointer-events-auto" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={trialEndDate}
                      onSelect={setTrialEndDate}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Color Selection */}
      <div>
        <Label className="text-sm font-medium flex items-center gap-2">
          <Palette className="h-4 w-4" />
          Color Theme (Optional)
        </Label>
        <p className="text-sm text-muted-foreground mb-3">Choose a color to identify this subscription, or we'll pick one randomly</p>
        <div className="grid grid-cols-4 gap-3">
          {colorOptions.map((color) => (
            <button
              key={color.value}
              type="button"
              className={cn(
                "relative h-12 w-full rounded-lg border-2 transition-all hover:scale-105",
                subscription.color === color.value
                  ? "border-primary ring-2 ring-primary/20"
                  : "border-border hover:border-primary/50"
              )}
              style={{ backgroundColor: color.value }}
              onClick={() => onSubscriptionChange({ color: color.value })}
            >
              {subscription.color === color.value && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-3 w-3 rounded-full bg-white shadow-sm" />
                </div>
              )}
              <span className="sr-only">{color.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Description */}
      <div>
        <Label htmlFor="description" className="text-sm font-medium flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Description (Optional)
        </Label>
        <p className="text-sm text-muted-foreground mb-3">Add notes about this subscription</p>
        <Textarea
          id="description"
          placeholder="e.g., Family plan, includes premium features..."
          value={subscription.description || ''}
          onChange={(e) => onSubscriptionChange({ description: e.target.value })}
          className="min-h-[80px]"
        />
      </div>

      {/* Notifications */}
      <div>
        <Label className="text-sm font-medium flex items-center gap-2">
          <Bell className="h-4 w-4" />
          Notification Settings
        </Label>
        <p className="text-sm text-muted-foreground mb-4">Choose when to receive reminders</p>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-lg border">
            <div>
              <p className="font-medium">Payment Reminders</p>
              <p className="text-sm text-muted-foreground">Get notified 3 days before payment is due</p>
            </div>
            <Switch
              checked={subscription.notifications?.payment?.enabled !== false}
              onCheckedChange={(enabled) => 
                onSubscriptionChange({
                  notifications: {
                    ...subscription.notifications,
                    payment: { ...subscription.notifications?.payment, enabled }
                  }
                })
              }
            />
          </div>

          {hasTrial && (
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div>
                <p className="font-medium">Trial End Reminders</p>
                <p className="text-sm text-muted-foreground">Get notified 3 days before trial expires</p>
              </div>
              <Switch
                checked={subscription.notifications?.trial?.enabled !== false}
                onCheckedChange={(enabled) => 
                  onSubscriptionChange({
                    notifications: {
                      ...subscription.notifications,
                      trial: { ...subscription.notifications?.trial, enabled }
                    }
                  })
                }
              />
            </div>
          )}

          <div className="flex items-center justify-between p-3 rounded-lg border">
            <div>
              <p className="font-medium">Renewal Reminders</p>
              <p className="text-sm text-muted-foreground">Get notified before annual renewals</p>
            </div>
            <Switch
              checked={subscription.notifications?.renewal?.enabled !== false}
              onCheckedChange={(enabled) => 
                onSubscriptionChange({
                  notifications: {
                    ...subscription.notifications,
                    renewal: { ...subscription.notifications?.renewal, enabled }
                  }
                })
              }
            />
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="rounded-lg bg-muted/50 p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
          <div>
            <h3 className="font-medium">Settings Summary</h3>
            <div className="mt-2 text-sm text-muted-foreground space-y-1">
              <p>• Start Date: {startDate ? format(startDate, "PPP") : "Not set"}</p>
              {hasTrial && trialEndDate && (
                <p>• Trial ends: {format(trialEndDate, "PPP")}</p>
              )}
              <p>• Color: {colorOptions.find(c => c.value === subscription.color)?.name || "Default"}</p>
              <p>• Notifications: {
                [
                  subscription.notifications?.payment?.enabled !== false && "Payment",
                  subscription.notifications?.trial?.enabled !== false && hasTrial && "Trial",
                  subscription.notifications?.renewal?.enabled !== false && "Renewal"
                ].filter(Boolean).join(", ") || "None"
              }</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionSettings;
