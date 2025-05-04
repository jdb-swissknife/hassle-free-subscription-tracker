
import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Subscription } from '@/lib/types';
import SubscriptionCard from '../SubscriptionCard';

interface SubscriptionTabContentProps {
  filteredSubscriptions: Subscription[];
  category?: string;
  searchTerm: string;
  onAddNew: () => void;
  onCardClick: (id: string) => void;
}

const SubscriptionTabContent: React.FC<SubscriptionTabContentProps> = ({ 
  filteredSubscriptions, 
  category,
  searchTerm,
  onAddNew,
  onCardClick
}) => {
  // If category is provided, filter by category
  const subscriptions = category ? 
    filteredSubscriptions.filter(sub => {
      if (category === 'other') {
        return !['entertainment', 'productivity', 'utilities'].includes(sub.category);
      }
      return sub.category === category;
    }) : 
    filteredSubscriptions;

  if (subscriptions.length > 0) {
    return (
      <div className="grid grid-cols-1 gap-4">
        {subscriptions.map((subscription) => (
          <SubscriptionCard
            key={subscription.id}
            subscription={subscription}
            onClick={() => onCardClick(subscription.id)}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="glass-card p-6 text-center">
      {category ? (
        <p className="text-muted-foreground">No {category} subscriptions found</p>
      ) : searchTerm ? (
        <div>
          <h3 className="text-xl font-medium mb-2">No subscriptions found</h3>
          <p className="text-muted-foreground mb-6">No results for "{searchTerm}"</p>
        </div>
      ) : (
        <div>
          <h3 className="text-xl font-medium mb-2">No subscriptions found</h3>
          <p className="text-muted-foreground mb-6">Add your first subscription to get started</p>
          <Button onClick={onAddNew}>
            <Plus className="h-4 w-4 mr-2" />
            Add Subscription
          </Button>
        </div>
      )}
    </div>
  );
};

export default SubscriptionTabContent;
