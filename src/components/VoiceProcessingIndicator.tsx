
import React from 'react';
import { Sparkles, Database } from 'lucide-react';

interface VoiceProcessingIndicatorProps {
  processingVoice: boolean;
  isNewSubscription: boolean;
  subscriptionName?: string;
}

const VoiceProcessingIndicator: React.FC<VoiceProcessingIndicatorProps> = ({
  processingVoice,
  isNewSubscription,
  subscriptionName
}) => {
  if (processingVoice) {
    return (
      <div className="flex items-center justify-center p-4 mb-6 rounded-md bg-primary/5 animate-pulse">
        <Sparkles className="h-5 w-5 mr-2 text-primary" />
        <span>Processing your subscription details...</span>
      </div>
    );
  }

  if (isNewSubscription && subscriptionName) {
    return (
      <div className="flex items-center justify-center p-4 mb-6 rounded-md bg-green-50 dark:bg-green-900/20">
        <Database className="h-5 w-5 mr-2 text-green-600 dark:text-green-400" />
        <span className="text-green-800 dark:text-green-300">
          New subscription "{subscriptionName}" will be saved to database for future users!
        </span>
      </div>
    );
  }

  return null;
};

export default VoiceProcessingIndicator;
