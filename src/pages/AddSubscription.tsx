
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Subscription, SubscriptionCategory } from '@/lib/types';
import VoiceInput from '@/components/VoiceInput';
import SubscriptionForm from '@/components/SubscriptionForm';
import SubscriptionSettings from '@/components/SubscriptionSettings';
import VoiceProcessingIndicator from '@/components/VoiceProcessingIndicator';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import { useSupabaseSubscriptions } from '@/hooks/useSupabaseSubscriptions';
import { saveNewSubscriptionToDatabase, SubscriptionData } from '@/lib/subscriptionDatabase';
import { processVoiceInput } from '@/lib/voiceProcessor';
import { getRandomColor, createDefaultNotifications } from '@/utils/subscriptionUtils';

const AddSubscription: React.FC = () => {
  const navigate = useNavigate();
  const { addSubscription } = useSupabaseSubscriptions();
  const [listening, setListening] = useState(false);
  const [processingVoice, setProcessingVoice] = useState(false);
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
  const [isNewSubscription, setIsNewSubscription] = useState(false);
  
  const handleVoiceInput = (transcript: string) => {
    setProcessingVoice(true);
    
    const { subscription: extractedSubscription, isNewSubscription: isNew, extractedData } = processVoiceInput(transcript);
    
    setSubscription(prev => ({
      ...prev,
      ...extractedSubscription
    }));
    
    setIsNewSubscription(isNew);
    
    if (isNew) {
      console.log("No database match found, using AI extraction");
    } else {
      console.log("Found database match:", extractedSubscription);
      toast.success(`Found ${extractedSubscription.name} in database!`);
    }
    
    // Handle dates
    if (extractedData.startDate) {
      setStartDate(extractedData.startDate);
    }
    
    if (extractedData.trialEndDate) {
      setHasTrial(true);
      setTrialEndDate(extractedData.trialEndDate);
    }
    
    setTimeout(() => {
      setProcessingVoice(false);
    }, 1500);
  };
  
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
    // If this is a new subscription not in our database, save it
    if (isNewSubscription && subscription.name && subscription.provider && subscription.category) {
      const newSubscriptionData: SubscriptionData = {
        name: subscription.name,
        provider: subscription.provider,
        category: subscription.category,
        commonPrices: subscription.price ? [subscription.price] : [],
        alternativeNames: [subscription.name.toLowerCase()]
      };
      
      saveNewSubscriptionToDatabase(newSubscriptionData);
      toast.success('New subscription saved to database for future users!');
    }
    
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
  
  // For debugging purposes
  useEffect(() => {
    console.log("Current subscription state:", subscription);
    console.log("Current start date:", startDate);
    console.log("Has trial:", hasTrial);
    console.log("Trial end date:", trialEndDate);
    console.log("Is new subscription:", isNewSubscription);
  }, [subscription, startDate, hasTrial, trialEndDate, isNewSubscription]);
  
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
          <VoiceInput
            onResult={handleVoiceInput}
            listening={listening}
            onListeningChange={setListening}
            placeholder="Describe your subscription with voice... (e.g., 'Netflix for $15.99 monthly starting January 15th with a 30-day trial')"
            className="mb-6"
          />
          
          <VoiceProcessingIndicator
            processingVoice={processingVoice}
            isNewSubscription={isNewSubscription}
            subscriptionName={subscription.name}
          />
          
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
