
import React from 'react';
import { Calendar, CreditCard, BarChart3 } from 'lucide-react';
import { format, addDays, isBefore } from 'date-fns';
import { Subscription } from '@/lib/types';

interface DashboardStatsProps {
  activeSubscriptions: Subscription[];
  monthlySpend: number;
  yearlySpend: number;
}

const DashboardStats: React.FC<DashboardStatsProps> = ({ 
  activeSubscriptions, 
  monthlySpend, 
  yearlySpend
}) => {
  const getNextPaymentInfo = () => {
    let nextPayment = null;
    let nextPaymentDate = new Date(8640000000000000); // Max date
    const today = new Date();
    
    activeSubscriptions.forEach(sub => {
      let nextDate = new Date(sub.startDate);
      
      if (sub.cycle === 'monthly') {
        while (isBefore(nextDate, today)) {
          nextDate.setMonth(nextDate.getMonth() + 1);
        }
      } else if (sub.cycle === 'yearly') {
        while (isBefore(nextDate, today)) {
          nextDate.setFullYear(nextDate.getFullYear() + 1);
        }
      } else if (sub.cycle === 'weekly') {
        while (isBefore(nextDate, today)) {
          nextDate = addDays(nextDate, 7);
        }
      }
      
      if (isBefore(nextDate, nextPaymentDate)) {
        nextPaymentDate = nextDate;
        nextPayment = {
          name: sub.name,
          date: nextDate,
          price: sub.price,
          cycle: sub.cycle
        };
      }
    });
    
    return nextPayment;
  };

  const getMostExpensive = () => {
    if (activeSubscriptions.length === 0) return null;
    
    return activeSubscriptions.reduce((prev, current) => {
      const prevMonthly = prev.cycle === 'monthly' 
        ? prev.price 
        : prev.cycle === 'yearly' 
          ? prev.price / 12 
          : prev.price * 4.33;
          
      const currentMonthly = current.cycle === 'monthly' 
        ? current.price 
        : current.cycle === 'yearly' 
          ? current.price / 12 
          : current.price * 4.33;
      
      return prevMonthly > currentMonthly ? prev : current;
    });
  };
  
  const nextPayment = getNextPaymentInfo();
  const mostExpensive = getMostExpensive();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="glass-card p-4 flex flex-col">
        <div className="flex justify-between items-start">
          <span className="text-muted-foreground text-sm">Monthly Spend</span>
          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
            ${yearlySpend.toFixed(2)}/year
          </span>
        </div>
        <span className="text-2xl font-medium">${monthlySpend.toFixed(2)}/mo</span>
        <div className="flex items-center mt-2 text-sm text-muted-foreground">
          <CreditCard className="h-4 w-4 mr-1" />
          <span>Across {activeSubscriptions.length} subscriptions</span>
        </div>
      </div>
      
      <div className="glass-card p-4 flex flex-col">
        <span className="text-muted-foreground text-sm">Next Payment</span>
        {nextPayment ? (
          <>
            <span className="text-2xl font-medium">{format(nextPayment.date, 'MMM d')}</span>
            <div className="flex items-center mt-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4 mr-1" />
              <span>{nextPayment.name}, ${nextPayment.price.toFixed(2)}</span>
            </div>
          </>
        ) : (
          <>
            <span className="text-2xl font-medium">-</span>
            <div className="flex items-center mt-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4 mr-1" />
              <span>No upcoming payments</span>
            </div>
          </>
        )}
      </div>
      
      <div className="glass-card p-4 flex flex-col">
        <span className="text-muted-foreground text-sm">Most Expensive</span>
        {mostExpensive ? (
          <>
            <span className="text-2xl font-medium">{mostExpensive.name}</span>
            <div className="flex items-center mt-2 text-sm text-muted-foreground">
              <BarChart3 className="h-4 w-4 mr-1" />
              <span>
                ${mostExpensive.price.toFixed(2)} per {mostExpensive.cycle.replace('ly', '')}
              </span>
            </div>
          </>
        ) : (
          <>
            <span className="text-2xl font-medium">-</span>
            <div className="flex items-center mt-2 text-sm text-muted-foreground">
              <BarChart3 className="h-4 w-4 mr-1" />
              <span>No active subscriptions</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DashboardStats;
