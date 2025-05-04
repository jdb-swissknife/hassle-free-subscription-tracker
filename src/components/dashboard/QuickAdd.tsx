
import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface QuickAddProps {
  onAddNew: () => void;
  className?: string;
}

const QuickAdd: React.FC<QuickAddProps> = ({ onAddNew, className = '' }) => {
  return (
    <div className={`glass-card p-4 ${className}`}>
      <h3 className="text-lg font-medium mb-2">Quick Add</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Add a new subscription to track your expenses
      </p>
      <Button 
        onClick={onAddNew} 
        className="w-full"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Subscription
      </Button>
    </div>
  );
};

export default QuickAdd;
