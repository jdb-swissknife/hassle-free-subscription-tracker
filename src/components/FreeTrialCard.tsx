
import React from 'react';
import { differenceInDays } from 'date-fns';
import { Clock, AlertCircle } from 'lucide-react';
import { Subscription } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

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
  const isMobile = useIsMobile();
  
  console.log('FreeTrialCard - Mobile Detection:', { isMobile, subscription: name });
  
  if (!trialEndDate) return null;
  
  const today = new Date();
  const daysLeft = differenceInDays(new Date(trialEndDate), today);
  
  console.log('FreeTrialCard - Trial Info:', { name, daysLeft, trialEndDate });
  
  // Skip if trial has ended
  if (daysLeft < 0) return null;
  
  // Determine urgency styling - enhanced for mobile visibility
  const isUrgent = daysLeft <= 3;
  console.log('FreeTrialCard - Styling Decision:', { name, isUrgent, daysLeft, isMobile });
  
  const cardStyles = isUrgent 
    ? `border-red-500 border-4 bg-red-100 dark:bg-red-900 ring-4 ring-red-500/60 animate-pulse shadow-2xl shadow-red-500/40 transform scale-[1.02] urgent-trial-mobile`
    : "border-yellow-300/30 bg-yellow-50/30 dark:bg-yellow-900/10";

  console.log('FreeTrialCard - Final styles applied:', cardStyles);

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
            ? "text-red-800 dark:text-red-300 font-bold" 
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
