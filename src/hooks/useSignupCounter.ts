import { useState, useEffect } from 'react';

// Simple hook to simulate a signup counter with FOMO
// In a real app, this would connect to your database
export function useSignupCounter() {
  const [count, setCount] = useState(1247); // Starting count for early adopters
  
  useEffect(() => {
    // Simulate periodic increases to create FOMO
    const interval = setInterval(() => {
      setCount(prev => {
        const random = Math.random();
        // 20% chance to increment by 1, creating realistic growth
        if (random < 0.2 && prev < 2500) {
          return prev + 1;
        }
        return prev;
      });
    }, 15000); // Check every 15 seconds
    
    return () => clearInterval(interval);
  }, []);
  
  const remaining = Math.max(0, 2500 - count);
  const isAlmostFull = remaining < 100;
  
  return {
    count,
    remaining,
    isAlmostFull,
    percentageFilled: (count / 2500) * 100
  };
}