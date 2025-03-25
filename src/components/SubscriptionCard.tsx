
import React from 'react';
import { Subscription } from '@/lib/types';
import { formatDistanceToNow, format, isBefore, isAfter, addDays } from 'date-fns';
import { Calendar, CreditCard, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SubscriptionCardProps {
  subscription: Subscription;
  onClick?: () => void;
  className?: string;
}

const SubscriptionCard: React.FC<SubscriptionCardProps> = ({ 
  subscription, 
  onClick,
  className = '',
}) => {
  const {
    name,
    provider,
    price,
    cycle,
    startDate,
    trialEndDate,
    category,
    color,
    active,
  } = subscription;

  const today = new Date();
  
  // Check if in trial period
  const inTrial = trialEndDate && isAfter(trialEndDate, today);
  
  // Calculate next billing date
  const calculateNextBillingDate = () => {
    let nextDate = new Date(startDate);
    
    if (cycle === 'monthly') {
      while (isBefore(nextDate, today)) {
        nextDate.setMonth(nextDate.getMonth() + 1);
      }
    } else if (cycle === 'yearly') {
      while (isBefore(nextDate, today)) {
        nextDate.setFullYear(nextDate.getFullYear() + 1);
      }
    } else if (cycle === 'weekly') {
      while (isBefore(nextDate, today)) {
        nextDate = addDays(nextDate, 7);
      }
    }
    
    return nextDate;
  };
  
  const nextBillingDate = calculateNextBillingDate();
  const isUpcoming = isBefore(nextBillingDate, addDays(today, 7));
  
  // Format price based on cycle
  const formattedPrice = () => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };
  
  // Determine card status
  const getCardStatus = () => {
    if (!active) return 'inactive';
    if (inTrial) return 'trial';
    if (isUpcoming) return 'upcoming';
    return 'active';
  };
  
  const status = getCardStatus();
  
  // Card status styles
  const getStatusStyles = () => {
    switch (status) {
      case 'trial':
        return 'border-yellow-300/30 bg-yellow-50/30 dark:bg-yellow-900/10';
      case 'upcoming':
        return 'border-orange-300/30 bg-orange-50/30 dark:bg-orange-900/10';
      case 'inactive':
        return 'border-gray-300/30 bg-gray-50/30 dark:bg-gray-900/10 opacity-60';
      default:
        return 'border-blue-300/30 bg-blue-50/30 dark:bg-blue-900/10';
    }
  };
  
  // Status indicator element
  const renderStatusIndicator = () => {
    switch (status) {
      case 'trial':
        return (
          <div className="flex items-center text-yellow-600 dark:text-yellow-400 text-xs gap-1">
            <Clock className="h-3 w-3" />
            <span>
              Trial ends {formatDistanceToNow(trialEndDate!, { addSuffix: true })}
            </span>
          </div>
        );
      case 'upcoming':
        return (
          <div className="flex items-center text-orange-600 dark:text-orange-400 text-xs gap-1">
            <AlertCircle className="h-3 w-3" />
            <span>
              Payment due {formatDistanceToNow(nextBillingDate, { addSuffix: true })}
            </span>
          </div>
        );
      case 'inactive':
        return (
          <div className="flex items-center text-gray-500 text-xs gap-1">
            <AlertCircle className="h-3 w-3" />
            <span>Inactive</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center text-green-600 dark:text-green-400 text-xs gap-1">
            <CheckCircle2 className="h-3 w-3" />
            <span>Active</span>
          </div>
        );
    }
  };

  return (
    <div 
      className={cn(
        "glass-card-hover cursor-pointer transition-all p-4 relative overflow-hidden",
        getStatusStyles(),
        className
      )}
      onClick={onClick}
      style={{ borderLeftColor: color, borderLeftWidth: '4px' }}
    >
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="font-medium text-lg leading-tight">{name}</h3>
          <p className="text-muted-foreground text-sm">{provider}</p>
        </div>
        <div className="text-right">
          <p className="font-medium">{formattedPrice()}</p>
          <p className="text-xs text-muted-foreground">
            per {cycle === 'custom' ? 'period' : cycle.slice(0, -2)}
          </p>
        </div>
      </div>
      
      <div className="flex justify-between mt-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          <Calendar className="h-4 w-4" />
          <span>Since {format(startDate, 'MMM yyyy')}</span>
        </div>
        <div className="flex items-center gap-1">
          <CreditCard className="h-4 w-4" />
          <span>{format(nextBillingDate, 'MMM d')}</span>
        </div>
      </div>
      
      <div className="mt-3 pt-2 border-t border-border">
        {renderStatusIndicator()}
      </div>
    </div>
  );
};

export default SubscriptionCard;
