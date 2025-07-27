
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Subscription, SubscriptionCategory } from '@/lib/types';
import SubscriptionForm from '@/components/SubscriptionForm';
import SubscriptionSettings from '@/components/SubscriptionSettings';
import { toast } from 'sonner';
import { useSupabaseSubscriptions } from '@/hooks/useSupabaseSubscriptions';
import { getRandomColor, createDefaultNotifications } from '@/utils/subscriptionUtils';

const AddSubscription: React.FC = () => {
  const navigate = useNavigate();
  const { addSubscription } = useSupabaseSubscriptions();
  const [subscription, setSubscription] = useState<Partial<Subscription>>({
    name: '',
    provider: '',
    price: 0,
    cycle: 'monthly',
    category: 'entertainment',
    active: true,
    notifications: createDefaultNotifications()
  });
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [hasTrial, setHasTrial] = useState(false);
  const [trialEndDate, setTrialEndDate] = useState<Date | undefined>(undefined);
  const [step, setStep] = useState(1);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    setSubscription(prev => ({
      ...prev,
      [name]: name === 'price' ? parseFloat(value) : value
    }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setSubscription(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const isStepValid = () => {
    if (step === 1) {
      return !!subscription.name && !!subscription.provider && !!subscription.price;
    }
    return true;
  };
  
  const handleSubmit = async () => {
    // Add subscription to user's list
    const newSubscription: Omit<Subscription, 'id'> = {
      name: subscription.name || '',
      provider: subscription.provider || '',
      price: subscription.price || 0,
      cycle: subscription.cycle as 'monthly' | 'yearly' | 'weekly' | 'custom',
      startDate: startDate || new Date(),
      trialEndDate: hasTrial ? trialEndDate : undefined,
      category: subscription.category as SubscriptionCategory,
      active: true,
      status: 'active',
      notifications: subscription.notifications || createDefaultNotifications(),
      color: subscription.color || getRandomColor(),
      description: subscription.description
    };
    
    const result = await addSubscription(newSubscription);
    if (result) {
      navigate('/dashboard');
    }
  };
  
  
  return (
    <div className="container max-w-2xl mx-auto px-4 py-8 min-h-screen">
      <header className="mb-8">
        <div className="flex items-center gap-2 mb-6">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold">Add Subscription</h1>
        </div>
        
        <div className="glass-card overflow-hidden mb-6">
          <div className="flex items-center border-b border-border">
            <div 
              className={`flex-1 text-center py-3 cursor-pointer ${step === 1 ? 'bg-primary/10 border-b-2 border-primary' : ''}`}
              onClick={() => step > 1 && setStep(1)}
            >
              Details
            </div>
            <div 
              className={`flex-1 text-center py-3 cursor-pointer ${step === 2 ? 'bg-primary/10 border-b-2 border-primary' : ''}`}
              onClick={() => step < 2 && isStepValid() && setStep(2)}
            >
              Settings
            </div>
          </div>
        </div>
      </header>
      
      <main>
        <div className="glass-card p-6 mb-6">
          {step === 1 ? (
            <SubscriptionForm
              subscription={subscription}
              onInputChange={handleInputChange}
              onSelectChange={handleSelectChange}
            />
          ) : (
            <SubscriptionSettings
              startDate={startDate}
              setStartDate={setStartDate}
              hasTrial={hasTrial}
              setHasTrial={setHasTrial}
              trialEndDate={trialEndDate}
              setTrialEndDate={setTrialEndDate}
              subscription={subscription}
              onSubscriptionChange={(updates) => setSubscription(prev => ({ ...prev, ...updates }))}
            />
          )}
        </div>
        
        <div className="flex justify-between">
          {step > 1 ? (
            <Button variant="outline" onClick={() => setStep(step - 1)}>
              Previous
            </Button>
          ) : (
            <Button variant="outline" onClick={() => navigate('/')}>
              Cancel
            </Button>
          )}
          
          {step < 2 ? (
            <Button 
              onClick={() => setStep(step + 1)} 
              disabled={!isStepValid()}
            >
              Next
            </Button>
          ) : (
            <Button onClick={handleSubmit}>
              <Check className="mr-2 h-4 w-4" /> Save Subscription
            </Button>
          )}
        </div>
      </main>
    </div>
  );
};

export default AddSubscription;
