import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { NotificationHistory, NotificationType } from '@/lib/types';
import { NotificationService } from '@/services/notificationService';
import { format, isToday, isYesterday } from 'date-fns';

interface NotificationInboxProps {
  className?: string;
}

const NotificationInbox: React.FC<NotificationInboxProps> = ({ className = '' }) => {
  const [notifications, setNotifications] = useState<NotificationHistory[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  
  const notificationService = NotificationService.getInstance();

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = () => {
    const history = notificationService.getNotificationHistory();
    setNotifications(history);
    setUnreadCount(history.filter(n => !n.opened).length);
  };

  const handleNotificationClick = (notificationId: string) => {
    notificationService.markAsClicked(notificationId);
    loadNotifications();
  };

  const markAsRead = (notificationId: string) => {
    notificationService.markAsOpened(notificationId);
    loadNotifications();
  };

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'trial-ending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'payment-upcoming':
      case 'subscription-renewal':
        return <Bell className="h-4 w-4 text-blue-500" />;
      case 'payment-failure':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'subscription-change':
      case 'price-change':
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const getNotificationPriority = (type: NotificationType): 'high' | 'medium' | 'low' => {
    switch (type) {
      case 'payment-failure':
        return 'high';
      case 'trial-ending':
      case 'payment-upcoming':
        return 'medium';
      default:
        return 'low';
    }
  };

  const formatNotificationDate = (date: Date) => {
    if (isToday(date)) {
      return `Today, ${format(date, 'h:mm a')}`;
    } else if (isYesterday(date)) {
      return `Yesterday, ${format(date, 'h:mm a')}`;
    } else {
      return format(date, 'MMM d, h:mm a');
    }
  };

  const groupedNotifications = notifications.reduce((groups, notification) => {
    const dateKey = isToday(notification.sentAt) 
      ? 'Today' 
      : isYesterday(notification.sentAt) 
        ? 'Yesterday' 
        : format(notification.sentAt, 'MMM d, yyyy');
    
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(notification);
    return groups;
  }, {} as Record<string, NotificationHistory[]>);

  return (
    <div className={`glass-card ${className}`}>
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            <h3 className="font-medium">Notifications</h3>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="text-xs">
                {unreadCount}
              </Badge>
            )}
          </div>
          {notifications.length > 0 && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => {
                notifications.forEach(n => {
                  if (!n.opened) notificationService.markAsOpened(n.id);
                });
                loadNotifications();
              }}
            >
              Mark all read
            </Button>
          )}
        </div>
      </div>

      <ScrollArea className="h-96">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No notifications yet</p>
            <p className="text-sm">You'll see subscription reminders and alerts here</p>
          </div>
        ) : (
          <div className="p-4 space-y-4">
            {Object.entries(groupedNotifications).map(([dateGroup, groupNotifications]) => (
              <div key={dateGroup}>
                <h4 className="font-medium text-sm text-muted-foreground mb-2">{dateGroup}</h4>
                <div className="space-y-2">
                  {groupNotifications.map((notification) => {
                    const priority = getNotificationPriority(notification.type);
                    return (
                      <div
                        key={notification.id}
                        className={`p-3 rounded-lg cursor-pointer transition-colors ${
                          notification.opened 
                            ? 'bg-muted/30 hover:bg-muted/50' 
                            : 'bg-primary/10 hover:bg-primary/20 border-l-4 border-primary'
                        } ${priority === 'high' ? 'ring-2 ring-red-500/20' : ''}`}
                        onClick={() => handleNotificationClick(notification.id)}
                      >
                        <div className="flex items-start gap-3">
                          {getNotificationIcon(notification.type)}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h5 className="font-medium text-sm truncate">
                                {notification.subscriptionName}
                              </h5>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground">
                                  {formatNotificationDate(notification.sentAt)}
                                </span>
                                {!notification.opened && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      markAsRead(notification.id);
                                    }}
                                  >
                                    <CheckCircle className="h-3 w-3" />
                                  </Button>
                                )}
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {notification.message}
                            </p>
                            <div className="flex items-center justify-between mt-2">
                              <Badge variant="outline" className="text-xs">
                                {notification.type.replace('-', ' ')}
                              </Badge>
                              {notification.clicked && (
                                <span className="text-xs text-green-600 flex items-center gap-1">
                                  <CheckCircle className="h-3 w-3" />
                                  Viewed
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {Object.keys(groupedNotifications).indexOf(dateGroup) < Object.keys(groupedNotifications).length - 1 && (
                  <Separator className="mt-4" />
                )}
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default NotificationInbox;
