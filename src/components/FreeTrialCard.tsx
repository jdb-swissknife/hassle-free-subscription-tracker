
import React from 'react';
import { differenceInDays } from 'date-fns';
import { Clock, AlertCircle } from 'lucide-react';
import { Subscription } from '@/lib/types';
import { cn } from '@/lib/utils';

interface FreeTrialCardProps {
  subscription: Subscription;
  onClick?: () => void;
  className?: string;
}

const FreeTrialCard: React.FC<FreeTrialCardProps> = ({ 
  subscription, 
  onClick,
  className = '',
}) => {
  const { name, provider, trialEndDate, color } = subscription;
  
  if (!trialEndDate) return null;
  
  const today = new Date();
  const daysLeft = differenceInDays(new Date(trialEndDate), today);
  
  // Skip if trial has ended
  if (daysLeft < 0) return null;
  
  return (
    <div 
      className={cn(
        "glass-card-hover cursor-pointer transition-all p-3 relative overflow-hidden",
        "border-yellow-300/30 bg-yellow-50/30 dark:bg-yellow-900/10",
        className
      )}
      onClick={onClick}
      style={{ borderLeftColor: color, borderLeftWidth: '4px' }}
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium leading-tight">{name}</h3>
          <p className="text-muted-foreground text-xs">{provider}</p>
        </div>
        <div className="flex items-center text-yellow-600 dark:text-yellow-400 text-xs gap-1">
          {daysLeft <= 3 ? (
            <AlertCircle className="h-4 w-4" />
          ) : (
            <Clock className="h-4 w-4" />
          )}
          <span className="font-medium">
            {daysLeft} {daysLeft === 1 ? 'day' : 'days'} left
          </span>
        </div>
      </div>
    </div>
  );
};

export default FreeTrialCard;
