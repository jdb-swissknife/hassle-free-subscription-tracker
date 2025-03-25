
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Calendar,
  AlertCircle,
  Check,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Subscription, SubscriptionCategory } from '@/lib/types';
import VoiceInput from '@/components/VoiceInput';
import { format } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const AddSubscription: React.FC = () => {
  const navigate = useNavigate();
  const [listening, setListening] = useState(false);
  const [processingVoice, setProcessingVoice] = useState(false);
  const [subscription, setSubscription] = useState<Partial<Subscription>>({
    name: '',
    provider: '',
    price: 0,
    cycle: 'monthly',
    category: 'entertainment',
    active: true,
    notifications: [
      {
        id: uuidv4(),
        type: 'payment-upcoming',
        enabled: true,
        daysInAdvance: 3,
      }
    ]
  });
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [hasTrial, setHasTrial] = useState(false);
  const [trialEndDate, setTrialEndDate] = useState<Date | undefined>(undefined);
  const [step, setStep] = useState(1);
  
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
  
  const handleVoiceInput = (transcript: string) => {
    setProcessingVoice(true);
    
    // This is a simplified mock of AI processing
    // In a real application, this would call an AI service to extract subscription details
    setTimeout(() => {
      // Example mock AI extraction
      const extractedData = mockAIExtraction(transcript);
      
      setSubscription(prev => ({
        ...prev,
        ...extractedData
      }));
      
      if (extractedData.trialEndDate) {
        setHasTrial(true);
        setTrialEndDate(extractedData.trialEndDate);
      }
      
      setProcessingVoice(false);
      toast.success('Subscription details extracted!');
    }, 1500);
  };
  
  // Mock AI extraction (would be replaced with actual AI service in real app)
  const mockAIExtraction = (transcript: string): Partial<Subscription> => {
    const lowercased = transcript.toLowerCase();
    
    // Very basic pattern matching for demo
    let extracted: Partial<Subscription> = {};
    
    // Try to extract name
    for (const service of ['netflix', 'spotify', 'hulu', 'disney', 'adobe', 'amazon prime']) {
      if (lowercased.includes(service)) {
        extracted.name = service.charAt(0).toUpperCase() + service.slice(1);
        
        // Add mock provider based on name
        if (service === 'netflix') extracted.provider = 'Netflix, Inc.';
        if (service === 'spotify') extracted.provider = 'Spotify AB';
        if (service === 'hulu') extracted.provider = 'Hulu, LLC';
        if (service === 'disney') extracted.provider = 'Disney';
        if (service === 'adobe') extracted.provider = 'Adobe Inc.';
        if (service === 'amazon prime') extracted.provider = 'Amazon.com, Inc.';
        
        break;
      }
    }
    
    // Try to extract price
    const priceMatch = lowercased.match(/(\$?\d+(\.\d{1,2})?)/);
    if (priceMatch) {
      const priceStr = priceMatch[0].replace('$', '');
      extracted.price = parseFloat(priceStr);
    }
    
    // Try to extract billing cycle
    if (lowercased.includes('month') || lowercased.includes('monthly')) {
      extracted.cycle = 'monthly';
    } else if (lowercased.includes('year') || lowercased.includes('annual')) {
      extracted.cycle = 'yearly';
    } else if (lowercased.includes('week') || lowercased.includes('weekly')) {
      extracted.cycle = 'weekly';
    }
    
    // Try to extract category
    for (const category of categories) {
      if (lowercased.includes(category.value)) {
        extracted.category = category.value;
        break;
      }
    }
    
    // Try to extract trial information
    if (lowercased.includes('trial') || lowercased.includes('free')) {
      const trialDaysMatch = lowercased.match(/(\d+)[\s-]*day/);
      if (trialDaysMatch) {
        const trialDays = parseInt(trialDaysMatch[1]);
        const trialDate = new Date();
        trialDate.setDate(trialDate.getDate() + trialDays);
        extracted.trialEndDate = trialDate;
      }
    }
    
    return extracted;
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
  
  const handleSubmit = () => {
    // In a real app, this would save to a database
    const newSubscription: Subscription = {
      id: uuidv4(),
      name: subscription.name || '',
      provider: subscription.provider || '',
      price: subscription.price || 0,
      cycle: subscription.cycle as 'monthly' | 'yearly' | 'weekly' | 'custom',
      startDate: startDate || new Date(),
      trialEndDate: hasTrial ? trialEndDate : undefined,
      category: subscription.category as SubscriptionCategory,
      active: true,
      notifications: subscription.notifications || []
    };
    
    console.log('New subscription:', newSubscription);
    
    toast.success('Subscription added successfully!');
    navigate('/');
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
              className={`flex-1 text-center py-3 ${step === 1 ? 'bg-primary/10 border-b-2 border-primary' : ''}`}
              onClick={() => step > 1 && setStep(1)}
            >
              Details
            </div>
            <div 
              className={`flex-1 text-center py-3 ${step === 2 ? 'bg-primary/10 border-b-2 border-primary' : ''}`}
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
            placeholder="Describe your subscription with voice..."
            className="mb-6"
          />
          
          {processingVoice && (
            <div className="flex items-center justify-center p-4 mb-6 rounded-md bg-primary/5 animate-pulse">
              <Sparkles className="h-5 w-5 mr-2 text-primary" />
              <span>Processing your subscription details...</span>
            </div>
          )}
          
          {step === 1 ? (
            <>
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label htmlFor="name">Subscription Name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={subscription.name}
                      onChange={handleInputChange}
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="provider">Provider</Label>
                    <Input
                      id="provider"
                      name="provider"
                      value={subscription.provider}
                      onChange={handleInputChange}
                      className="mt-1"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="price">Price</Label>
                      <Input
                        id="price"
                        name="price"
                        type="number"
                        value={subscription.price || ''}
                        onChange={handleInputChange}
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="cycle">Billing Cycle</Label>
                      <Select
                        value={subscription.cycle}
                        onValueChange={(value) => handleSelectChange('cycle', value)}
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
                      onValueChange={(value) => handleSelectChange('category', value as SubscriptionCategory)}
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
            </>
          ) : (
            <>
              <div className="space-y-6">
                <div>
                  <Label>Start Date</Label>
                  <div className="mt-1">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !startDate && "text-muted-foreground"
                          )}
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 pointer-events-auto">
                        <CalendarComponent
                          mode="single"
                          selected={startDate}
                          onSelect={setStartDate}
                          initialFocus
                          className={cn("p-3 pointer-events-auto")}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="hasTrial"
                    checked={hasTrial}
                    onChange={e => setHasTrial(e.target.checked)}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <Label htmlFor="hasTrial">This subscription has a free trial</Label>
                </div>
                
                {hasTrial && (
                  <div>
                    <Label>Trial End Date</Label>
                    <div className="mt-1">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !trialEndDate && "text-muted-foreground"
                            )}
                          >
                            <Calendar className="mr-2 h-4 w-4" />
                            {trialEndDate ? format(trialEndDate, "PPP") : <span>Pick a date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 pointer-events-auto">
                          <CalendarComponent
                            mode="single"
                            selected={trialEndDate}
                            onSelect={setTrialEndDate}
                            initialFocus
                            className={cn("p-3 pointer-events-auto")}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                )}
                
                <div className="rounded-md bg-blue-50 dark:bg-blue-900/20 p-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <AlertCircle className="h-5 w-5 text-blue-400 dark:text-blue-300" aria-hidden="true" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300">Notifications</h3>
                      <div className="mt-2 text-sm text-blue-700 dark:text-blue-400">
                        <p>Default notifications will be set up for this subscription, including:</p>
                        <ul className="list-disc pl-5 mt-1 space-y-1">
                          <li>Payment reminders 3 days before due date</li>
                          {hasTrial && <li>Trial end reminders 3 days before expiration</li>}
                          <li>Annual renewal reminders (if applicable)</li>
                        </ul>
                        <p className="mt-2">You can customize these in Settings later.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
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
