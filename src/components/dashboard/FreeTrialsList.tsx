
import React from 'react';
import { differenceInDays } from 'date-fns';
import { Subscription } from '@/lib/types';
import FreeTrialCard from '../FreeTrialCard';

interface FreeTrialsListProps {
  freeTrials: Subscription[];
  onCardClick: (id: string) => void;
}

const FreeTrialsList: React.FC<FreeTrialsListProps> = ({ freeTrials, onCardClick }) => {
  if (freeTrials.length === 0) return null;

  const today = new Date();
  
  // Separate expiring (≤3 days) from regular free trials
  const expiringTrials = freeTrials.filter(sub => {
    if (!sub.trialEndDate) return false;
    const daysLeft = differenceInDays(new Date(sub.trialEndDate), today);
    return daysLeft >= 0 && daysLeft <= 3;
  });
  
  const regularTrials = freeTrials.filter(sub => {
    if (!sub.trialEndDate) return false;
    const daysLeft = differenceInDays(new Date(sub.trialEndDate), today);
    return daysLeft > 3;
  });

  return (
    <div className="mb-6">
      {/* Expiring Free Trials Section */}
      {expiringTrials.length > 0 && (
        <div className="mb-4">
          <h2 className="text-lg font-medium mb-3 text-red-700 dark:text-red-300">
            ⚠️ Expiring Free Trials
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {expiringTrials.map((subscription) => (
              <FreeTrialCard
                key={`expiring-trial-${subscription.id}`}
                subscription={subscription}
                onClick={() => onCardClick(subscription.id)}
              />
            ))}
          </div>
        </div>
      )}
      
      {/* Regular Free Trials Section */}
      {regularTrials.length > 0 && (
        <div>
          <h2 className="text-lg font-medium mb-3">Free Trials</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {regularTrials.map((subscription) => (
              <FreeTrialCard
                key={`trial-${subscription.id}`}
                subscription={subscription}
                onClick={() => onCardClick(subscription.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FreeTrialsList;
