
import React from 'react';
import { format } from 'date-fns';
import { Calendar, AlertCircle } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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
}

const SubscriptionSettings: React.FC<SubscriptionSettingsProps> = ({
  startDate,
  setStartDate,
  hasTrial,
  setHasTrial,
  trialEndDate,
  setTrialEndDate
}) => {
  return (
    <div className="space-y-6">
      <div>
        <Label>Start Date</Label>
        <div className="mt-1">
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
            <PopoverContent className="w-auto p-0 pointer-events-auto">
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
      </div>
      
      <div className="flex items-center space-x-2">
        <Checkbox
          id="hasTrial"
          checked={hasTrial}
          onCheckedChange={(checked) => setHasTrial(checked === true)}
          className="rounded text-primary focus:ring-primary"
        />
        <Label htmlFor="hasTrial" className="cursor-pointer">This subscription has a free trial</Label>
      </div>
      
      {hasTrial && (
        <div>
          <Label>Trial End Date</Label>
          <div className="mt-1">
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
                  {trialEndDate ? format(trialEndDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 pointer-events-auto">
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
        </div>
      )}
      
      <div className="rounded-md bg-blue-50 dark:bg-blue-900/20 p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <AlertCircle className="h-5 w-5 text-blue-400 dark:text-blue-300" aria-hidden="true" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300">Notifications</h3>
            <div className="mt-2 text-sm text-blue-700 dark:text-blue-400">
              <p>Default notifications will be set up for this subscription, including:</p>
              <ul className="list-disc pl-5 mt-1 space-y-1">
                <li>Payment reminders 3 days before due date</li>
                {hasTrial && <li>Trial end reminders 3 days before expiration</li>}
                <li>Annual renewal reminders (if applicable)</li>
              </ul>
              <p className="mt-2">You can customize these in Settings later.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionSettings;
