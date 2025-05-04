
import React from 'react';
import { Subscription } from '@/lib/types';
import FreeTrialCard from '../FreeTrialCard';

interface FreeTrialsListProps {
  freeTrials: Subscription[];
  onCardClick: (id: string) => void;
}

const FreeTrialsList: React.FC<FreeTrialsListProps> = ({ freeTrials, onCardClick }) => {
  if (freeTrials.length === 0) return null;

  return (
    <div className="mb-6">
      <h2 className="text-lg font-medium mb-3">Free Trials</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {freeTrials.map((subscription) => (
          <FreeTrialCard
            key={`trial-${subscription.id}`}
            subscription={subscription}
            onClick={() => onCardClick(subscription.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default FreeTrialsList;
