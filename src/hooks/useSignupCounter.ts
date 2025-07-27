import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

// Real-time signup counter that tracks actual early adopter signups
export function useSignupCounter() {
  const [count, setCount] = useState(1247); // Fallback starting count
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Fetch initial count
    const fetchCount = async () => {
      try {
        const { count: signupCount, error } = await supabase
          .from('early_adopter_signups')
          .select('*', { count: 'exact', head: true });
        
        if (error) {
          console.error('Error fetching signup count:', error);
          setLoading(false);
          return;
        }
        
        setCount(signupCount || 1247);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching signup count:', error);
        setLoading(false);
      }
    };

    fetchCount();

    // Set up real-time subscription
    const channel = supabase
      .channel('early_adopter_signups_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'early_adopter_signups'
        },
        () => {
          // Refetch count when new signup is added
          fetchCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
  
  const targetLimit = 2500;
  const remaining = Math.max(0, targetLimit - count);
  const isAlmostFull = remaining < 100;
  
  return {
    count,
    remaining,
    isAlmostFull,
    percentageFilled: (count / targetLimit) * 100,
    loading
  };
}