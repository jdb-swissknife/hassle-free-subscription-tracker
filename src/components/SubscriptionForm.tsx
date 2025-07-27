
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Subscription, SubscriptionCategory } from '@/lib/types';

interface SubscriptionFormProps {
  subscription: Partial<Subscription>;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSelectChange: (name: string, value: string) => void;
}

const SubscriptionForm: React.FC<SubscriptionFormProps> = ({
  subscription,
  onInputChange,
  onSelectChange
}) => {
  const categories: { value: SubscriptionCategory; label: string; }[] = [
    { value: 'entertainment', label: 'Entertainment' },
    { value: 'productivity', label: 'Productivity' },
    { value: 'utilities', label: 'Utilities' },
    { value: 'social', label: 'Social' },
    { value: 'lifestyle', label: 'Lifestyle' },
    { value: 'health', label: 'Health' },
    { value: 'finance', label: 'Finance' },
    { value: 'other', label: 'Other' },
  ];
  
  const cycles = [
    { value: 'monthly', label: 'Monthly' },
    { value: 'yearly', label: 'Yearly' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'custom', label: 'Custom' },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        <div>
          <Label htmlFor="name">Subscription Name</Label>
          <Input
            id="name"
            name="name"
            value={subscription.name || ''}
            onChange={onInputChange}
            className="mt-1"
            placeholder="e.g., Netflix, Spotify, Office 365"
          />
        </div>
        
        <div>
          <Label htmlFor="provider">Provider/Company</Label>
          <Input
            id="provider"
            name="provider"
            value={subscription.provider || ''}
            onChange={onInputChange}
            className="mt-1"
            placeholder="e.g., Netflix, Spotify, Microsoft"
          />
        </div>
        
        <div>
          <Label htmlFor="paymentMethod">Payment Method</Label>
          <Select
            value={subscription.paymentMethod}
            onValueChange={(value) => onSelectChange('paymentMethod', value)}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select payment method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="card">Card</SelectItem>
              <SelectItem value="paypal">PayPal</SelectItem>
              <SelectItem value="apple">Apple Pay</SelectItem>
              <SelectItem value="bank">Bank Transfer</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="price">Price</Label>
            <Input
              id="price"
              name="price"
              type="number"
              value={subscription.price || ''}
              onChange={onInputChange}
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="cycle">Billing Cycle</Label>
            <Select
              value={subscription.cycle}
              onValueChange={(value) => onSelectChange('cycle', value)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select cycle" />
              </SelectTrigger>
              <SelectContent>
                {cycles.map((cycle) => (
                  <SelectItem key={cycle.value} value={cycle.value}>
                    {cycle.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div>
          <Label htmlFor="category">Category</Label>
          <Select
            value={subscription.category}
            onValueChange={(value) => onSelectChange('category', value as SubscriptionCategory)}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionForm;
