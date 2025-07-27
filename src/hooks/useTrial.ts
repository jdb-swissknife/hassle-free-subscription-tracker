import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export interface TrialInfo {
  trialActive: boolean;
  trialDaysRemaining: number;
  trialStartedAt?: string;
  trialEndsAt?: string;
}

export function useTrial() {
  const { user } = useAuth();
  const [trialInfo, setTrialInfo] = useState<TrialInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    fetchTrialInfo();
  }, [user?.id]);

  const fetchTrialInfo = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .rpc('get_trial_info', { user_id: user.id });

      if (error) {
        console.error('Error fetching trial info:', error);
        setLoading(false);
        return;
      }

      if (data && data.length > 0) {
        const info = data[0];
        setTrialInfo({
          trialActive: info.trial_active,
          trialDaysRemaining: info.trial_days_remaining,
          trialStartedAt: info.trial_started_at,
          trialEndsAt: info.trial_ends_at,
        });
      } else {
        setTrialInfo({
          trialActive: false,
          trialDaysRemaining: 0,
        });
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching trial info:', error);
      setLoading(false);
    }
  };

  const startTrial = async () => {
    if (!user?.id) return false;

    try {
      const { error } = await supabase
        .rpc('start_user_trial', { user_id: user.id });

      if (error) {
        console.error('Error starting trial:', error);
        return false;
      }

      // Refresh trial info
      await fetchTrialInfo();
      return true;
    } catch (error) {
      console.error('Error starting trial:', error);
      return false;
    }
  };

  const hasTrialExpired = trialInfo && !trialInfo.trialActive && trialInfo.trialDaysRemaining <= 0;
  const isInTrial = trialInfo?.trialActive || false;

  return {
    trialInfo,
    loading,
    startTrial,
    hasTrialExpired,
    isInTrial,
    refreshTrialInfo: fetchTrialInfo,
  };
}