
import React from 'react';
import { Plus, Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface QuickAddProps {
  onAddNew: () => void;
  onAddVoice?: () => void;
  className?: string;
}

const QuickAdd: React.FC<QuickAddProps> = ({ onAddNew, onAddVoice, className = '' }) => {
  return (
    <div className={`glass-card p-4 ${className}`}>
      <h3 className="text-lg font-medium mb-2">Quick Add</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Add a new subscription to track your expenses
      </p>
      <div className="space-y-2">
        <Button 
          onClick={onAddNew} 
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Subscription
        </Button>
        
        {onAddVoice && (
          <Button 
            onClick={onAddVoice}
            variant="outline"
            className="w-full" 
          >
            <Mic className="h-4 w-4 mr-2" />
            Add with Voice
          </Button>
        )}
      </div>
    </div>
  );
};

export default QuickAdd;
