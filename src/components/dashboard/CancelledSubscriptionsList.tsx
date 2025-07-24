import React from 'react';
import { format } from 'date-fns';
import { Calendar, Trash2 } from 'lucide-react';
import { Subscription } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface CancelledSubscriptionsListProps {
  cancelledSubscriptions: Subscription[];
  onDelete: (id: string) => void;
}

const CancelledSubscriptionsList: React.FC<CancelledSubscriptionsListProps> = ({ 
  cancelledSubscriptions, 
  onDelete 
}) => {
  if (cancelledSubscriptions.length === 0) {
    return (
      <div className="glass-card p-6 text-center">
        <h3 className="text-xl font-medium mb-2">No cancelled subscriptions</h3>
        <p className="text-muted-foreground">
          Cancelled subscriptions will appear here for your records
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {cancelledSubscriptions.map((subscription) => (
        <Card key={subscription.id} className="p-4 opacity-70">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-medium line-through">{subscription.name}</h3>
                <span className="px-2 py-1 text-xs bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 rounded">
                  CANCELLED
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-1">{subscription.provider}</p>
              <p className="text-sm text-muted-foreground">
                ${subscription.price.toFixed(2)}/{subscription.cycle}
              </p>
              {subscription.cancelledAt && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                  <Calendar className="h-3 w-3" />
                  Cancelled: {format(subscription.cancelledAt, 'MMM dd, yyyy')}
                </div>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(subscription.id)}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default CancelledSubscriptionsList;