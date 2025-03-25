
import React from 'react';
import { Bell } from 'lucide-react';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { getUpcomingNotifications } from '@/lib/mockData';
import { format } from 'date-fns';

interface NotificationBadgeProps {
  className?: string;
}

const NotificationBadge: React.FC<NotificationBadgeProps> = ({ className = '' }) => {
  const notifications = getUpcomingNotifications();
  const hasNotifications = notifications.length > 0;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={`relative rounded-full ${className}`}
        >
          <Bell className="h-5 w-5" />
          {hasNotifications && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] text-white">
              {notifications.length}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 glass-card backdrop-blur-lg">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="font-medium">Notifications</h3>
          {hasNotifications && (
            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
              {notifications.length} new
            </span>
          )}
        </div>
        <div className="max-h-80 overflow-y-auto">
          {hasNotifications ? (
            <div className="divide-y divide-border">
              {notifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className="p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-medium">{notification.subscriptionName}</span>
                    <span className="text-xs text-muted-foreground">
                      {notification.isToday 
                        ? 'Today' 
                        : format(notification.targetDate, 'MMM d')}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{notification.message}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <p className="text-muted-foreground text-sm">No new notifications</p>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationBadge;
