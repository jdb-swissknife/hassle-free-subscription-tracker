
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
  
  // Determine urgency styling
  const isUrgent = daysLeft <= 3;
  const cardStyles = isUrgent 
    ? "border-red-500/50 bg-red-50/40 dark:bg-red-900/20 ring-2 ring-red-500/20 animate-pulse"
    : "border-yellow-300/30 bg-yellow-50/30 dark:bg-yellow-900/10";

  return (
    <div 
      className={cn(
        "glass-card-hover cursor-pointer transition-all p-3 relative overflow-hidden",
        cardStyles,
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
        <div className={cn(
          "flex items-center text-xs gap-1",
          isUrgent 
            ? "text-red-700 dark:text-red-400 font-medium" 
            : "text-yellow-600 dark:text-yellow-400"
        )}>
          {isUrgent ? (
            <AlertCircle className="h-4 w-4 animate-pulse" />
          ) : (
            <Clock className="h-4 w-4" />
          )}
          <span className="font-medium">
            {daysLeft} {daysLeft === 1 ? 'day' : 'days'} left{isUrgent ? '!' : ''}
          </span>
        </div>
      </div>
    </div>
  );
};

export default FreeTrialCard;
