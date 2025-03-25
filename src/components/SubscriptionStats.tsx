
import React from 'react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Legend, 
  Tooltip 
} from 'recharts';
import { Subscription, SubscriptionCategory } from '@/lib/types';

interface SubscriptionStatsProps {
  subscriptions: Subscription[];
  className?: string;
}

const CATEGORY_COLORS: Record<SubscriptionCategory, string> = {
  'entertainment': '#E50914',
  'productivity': '#1DB954',
  'utilities': '#A2AAAD',
  'social': '#1877F2',
  'health': '#FF2D55',
  'finance': '#53D769',
  'lifestyle': '#FF9900',
  'other': '#8E9196'
};

const CATEGORY_LABELS: Record<SubscriptionCategory, string> = {
  'entertainment': 'Entertainment',
  'productivity': 'Productivity',
  'utilities': 'Utilities',
  'social': 'Social',
  'health': 'Health',
  'finance': 'Finance',
  'lifestyle': 'Lifestyle',
  'other': 'Other'
};

const SubscriptionStats: React.FC<SubscriptionStatsProps> = ({ 
  subscriptions,
  className = '',
}) => {
  const activeSubscriptions = subscriptions.filter(sub => sub.active);
  
  // Calculate monthly spending by category
  const spendingByCategory = activeSubscriptions.reduce((acc, sub) => {
    const category = sub.category;
    const monthlyCost = sub.cycle === 'monthly' 
      ? sub.price 
      : sub.cycle === 'yearly' 
        ? sub.price / 12 
        : sub.cycle === 'weekly' 
          ? sub.price * 4.33 
          : sub.price;
    
    if (!acc[category]) {
      acc[category] = {
        name: CATEGORY_LABELS[category],
        value: 0,
        color: CATEGORY_COLORS[category]
      };
    }
    
    acc[category].value += monthlyCost;
    return acc;
  }, {} as Record<string, { name: string; value: number; color: string }>);
  
  const chartData = Object.values(spendingByCategory).filter(cat => cat.value > 0);
  
  // If no data, show placeholder
  if (chartData.length === 0) {
    return (
      <div className={`glass-card p-4 ${className}`}>
        <h3 className="text-lg font-medium mb-2">Spending by Category</h3>
        <div className="text-center text-muted-foreground p-4">
          No active subscriptions
        </div>
      </div>
    );
  }

  return (
    <div className={`glass-card p-4 ${className}`}>
      <h3 className="text-lg font-medium mb-4">Spending by Category</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
              nameKey="name"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              labelLine={false}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: number) => `$${value.toFixed(2)}`} 
              wrapperClassName="glass-card"
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SubscriptionStats;
