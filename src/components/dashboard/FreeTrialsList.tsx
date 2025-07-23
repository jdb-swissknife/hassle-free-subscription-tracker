
import React from 'react';
import { differenceInDays } from 'date-fns';
import { Subscription } from '@/lib/types';
import FreeTrialCard from '../FreeTrialCard';

interface FreeTrialsListProps {
  freeTrials: Subscription[];
  onCardClick: (id: string) => void;
}

const FreeTrialsList: React.FC<FreeTrialsListProps> = ({ freeTrials, onCardClick }) => {
  console.log('FreeTrialsList received:', freeTrials);
  console.log('FreeTrialsList - Window size:', { width: window.innerWidth, isMobile: window.innerWidth < 768 });
  
  if (freeTrials.length === 0) {
    console.log('FreeTrialsList - No free trials to display');
    return null;
  }

  const today = new Date();
  
  // Separate expiring (≤3 days) from regular free trials
  const expiringTrials = freeTrials.filter(sub => {
    if (!sub.trialEndDate) return false;
    const daysLeft = differenceInDays(new Date(sub.trialEndDate), today);
    const isExpiring = daysLeft >= 0 && daysLeft <= 3;
    console.log(`${sub.name}: ${daysLeft} days left, expiring: ${isExpiring}`);
    return isExpiring;
  });
  
  const regularTrials = freeTrials.filter(sub => {
    if (!sub.trialEndDate) return false;
    const daysLeft = differenceInDays(new Date(sub.trialEndDate), today);
    return daysLeft > 3;
  });

  console.log('Expiring trials:', expiringTrials);
  console.log('Regular trials:', regularTrials);

  return (
    <div className="mb-6">
      {/* DEBUG INFO - VISIBLE ON SCREEN */}
      <div className="bg-red-500 text-white p-4 mb-4 text-lg border-4 border-black fixed top-0 left-0 right-0 z-50">MOBILE DEBUG VISIBLE
        <div>🔍 DEBUG: Total free trials: {freeTrials.length}</div>
        <div>📱 Window width: {window.innerWidth}px (Mobile: {window.innerWidth < 768 ? 'YES' : 'NO'})</div>
        <div>⚠️ Expiring trials: {expiringTrials.length}</div>
        <div>📅 Regular trials: {regularTrials.length}</div>
        {freeTrials.map(t => (
          <div key={t.id}>
            {t.name}: {t.trialEndDate ? `${differenceInDays(new Date(t.trialEndDate), today)} days` : 'No date'}
          </div>
        ))}
      </div>
      
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
