
import React, { useState, useEffect } from 'react';
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
import { format, addDays, addWeeks, addMonths } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useSubscriptions } from '@/hooks/useSubscriptions';
import { Checkbox } from '@/components/ui/checkbox';

const AddSubscription: React.FC = () => {
  const navigate = useNavigate();
  const { addSubscription } = useSubscriptions();
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
    console.log("Processing voice input:", transcript);
    
    // Extract data from voice input
    setTimeout(() => {
      // Example mock AI extraction
      const extractedData = mockAIExtraction(transcript);
      console.log("Extracted data:", extractedData);
      
      // Update subscription state with extracted data
      setSubscription(prev => {
        const newData = {
          ...prev,
          ...extractedData
        };
        console.log("Updated subscription data:", newData);
        return newData;
      });
      
      // Update start date if present in extracted data
      if (extractedData.startDate) {
        setStartDate(extractedData.startDate);
        console.log("Setting start date:", extractedData.startDate);
      }
      
      // Update trial information if present in extracted data
      if (extractedData.trialEndDate) {
        setHasTrial(true);
        setTrialEndDate(extractedData.trialEndDate);
        console.log("Setting trial end date:", extractedData.trialEndDate);
      }
      
      setProcessingVoice(false);
      toast.success('Subscription details extracted!');
    }, 1500);
  };
  
  // Improved AI extraction with better pattern matching
  const mockAIExtraction = (transcript: string): Partial<Subscription> => {
    console.log("Running AI extraction on:", transcript);
    const lowercased = transcript.toLowerCase();
    
    // Very basic pattern matching for demo
    let extracted: Partial<Subscription> = {};
    
    // More explicit pattern matching for service names
    const servicePatterns = [
      { pattern: /netflix/i, name: 'Netflix', provider: 'Netflix, Inc.' },
      { pattern: /spotify/i, name: 'Spotify', provider: 'Spotify AB' },
      { pattern: /hulu/i, name: 'Hulu', provider: 'Hulu, LLC' },
      { pattern: /disney(\s|plus|\+)/i, name: 'Disney+', provider: 'Disney' },
      { pattern: /adobe/i, name: 'Adobe Creative Cloud', provider: 'Adobe Inc.' },
      { pattern: /amazon(\s|prime)/i, name: 'Amazon Prime', provider: 'Amazon.com, Inc.' },
      { pattern: /youtube(\s|premium)/i, name: 'YouTube Premium', provider: 'Google LLC' },
      { pattern: /apple(\s|music)/i, name: 'Apple Music', provider: 'Apple Inc.' },
      { pattern: /hbo(\s|max)/i, name: 'HBO Max', provider: 'WarnerMedia' }
    ];
    
    // Check for service name matches
    for (const service of servicePatterns) {
      if (service.pattern.test(lowercased)) {
        extracted.name = service.name;
        extracted.provider = service.provider;
        break;
      }
    }
    
    // Try to extract custom name if no match found
    if (!extracted.name) {
      const nameMatch = lowercased.match(/subscription(?:\s+for)?\s+([a-z0-9\s]+?)(?:\s+for|from|costs|is|at|with|$)/i);
      if (nameMatch && nameMatch[1]) {
        const name = nameMatch[1].trim();
        extracted.name = name.charAt(0).toUpperCase() + name.slice(1);
      }
    }
    
    // Try to extract custom provider
    const providerMatch = lowercased.match(/(?:from|by|provider|with)\s+([a-z0-9\s]+?)(?:\s+for|costs|is|at|$)/i);
    if (providerMatch && providerMatch[1] && !extracted.provider) {
      const provider = providerMatch[1].trim();
      extracted.provider = provider.charAt(0).toUpperCase() + provider.slice(1);
    }
    
    // Try to extract price with improved pattern
    const priceMatch = lowercased.match(/(\$?\d+(\.\d{1,2})?)\s*(?:dollars|usd|per|a|\/)/i);
    if (priceMatch) {
      const priceStr = priceMatch[1].replace('$', '');
      extracted.price = parseFloat(priceStr);
    }
    
    // Try to extract billing cycle with more patterns
    if (/(month|monthly|per month|each month)/i.test(lowercased)) {
      extracted.cycle = 'monthly';
    } else if (/(year|yearly|annual|annually|per year)/i.test(lowercased)) {
      extracted.cycle = 'yearly';
    } else if (/(week|weekly|per week|each week)/i.test(lowercased)) {
      extracted.cycle = 'weekly';
    }
    
    // Try to extract category with more accurate matching
    for (const category of categories) {
      if (lowercased.includes(category.value) || 
          (category.value === 'entertainment' && /(movie|stream|watch|show)/i.test(lowercased)) ||
          (category.value === 'productivity' && /(work|office|document)/i.test(lowercased)) ||
          (category.value === 'social' && /(network|media|chat)/i.test(lowercased))) {
        extracted.category = category.value;
        break;
      }
    }
    
    // Try to extract start date
    const startDateRegexes = [
      /start(?:s|ed|ing)?\s+(?:on|at|from)?\s+(\w+\s+\d{1,2}(?:st|nd|rd|th)?(?:\s*,?\s*\d{4})?)/i,
      /begin(?:s|ning)?\s+(?:on|at|from)?\s+(\w+\s+\d{1,2}(?:st|nd|rd|th)?(?:\s*,?\s*\d{4})?)/i,
      /(?:from|on)\s+(\w+\s+\d{1,2}(?:st|nd|rd|th)?(?:\s*,?\s*\d{4})?)/i
    ];
    
    for (const regex of startDateRegexes) {
      const startDateMatch = lowercased.match(regex);
      if (startDateMatch && startDateMatch[1]) {
        try {
          // Try to parse the date string - this is a simplified approach
          // In a real app, you would use a more robust date parsing library
          const dateStr = startDateMatch[1];
          const dateObj = new Date(dateStr);
          if (!isNaN(dateObj.getTime())) {
            extracted.startDate = dateObj;
            break;
          }
        } catch (e) {
          console.log("Error parsing start date:", e);
        }
      }
    }
    
    // If no specific start date found, look for relative dates
    if (!extracted.startDate) {
      if (/start(?:s|ed|ing)?\s+today/i.test(lowercased)) {
        extracted.startDate = new Date();
      } else if (/start(?:s|ed|ing)?\s+tomorrow/i.test(lowercased)) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        extracted.startDate = tomorrow;
      } else if (/start(?:s|ed|ing)?\s+next\s+week/i.test(lowercased)) {
        extracted.startDate = addWeeks(new Date(), 1);
      } else if (/start(?:s|ed|ing)?\s+next\s+month/i.test(lowercased)) {
        extracted.startDate = addMonths(new Date(), 1);
      }
    }
    
    // Try to extract trial information with improved pattern
    if (/(trial|free|days|for free)/i.test(lowercased)) {
      const trialDaysMatch = lowercased.match(/(\d+)[\s-]*(day|days|week|weeks|month|months)(?:\s+(?:free|trial))/i);
      
      if (trialDaysMatch) {
        const trialValue = parseInt(trialDaysMatch[1]);
        const trialUnit = trialDaysMatch[2].toLowerCase();
        
        const startDateToUse = extracted.startDate || new Date();
        let trialDate;
        
        if (trialUnit.includes('day')) {
          trialDate = addDays(startDateToUse, trialValue);
        } else if (trialUnit.includes('week')) {
          trialDate = addWeeks(startDateToUse, trialValue);
        } else if (trialUnit.includes('month')) {
          trialDate = addMonths(startDateToUse, trialValue);
        }
        
        if (trialDate) {
          extracted.trialEndDate = trialDate;
        }
      } else if (/has\s+(?:a\s+)?(?:free\s+)?trial/i.test(lowercased)) {
        // If trial is mentioned but no specific duration, default to 7 days
        const startDateToUse = extracted.startDate || new Date();
        extracted.trialEndDate = addDays(startDateToUse, 7);
      }
    }
    
    console.log("Extraction result:", extracted);
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
    // Add new subscription to storage
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
      notifications: subscription.notifications || [],
      color: subscription.color || getRandomColor(),
      description: subscription.description,
      paymentMethod: subscription.paymentMethod,
      logo: subscription.logo,
      endDate: subscription.endDate
    };
    
    addSubscription(newSubscription);
    navigate('/dashboard');
  };
  
  // Generate a random color for the subscription
  const getRandomColor = () => {
    const colors = [
      '#E50914', // Netflix red
      '#1DB954', // Spotify green
      '#FF9900', // Amazon orange
      '#0088CC', // Telegram blue
      '#FF0000', // YouTube red
      '#00AEEF', // Twitter blue
      '#A2AAAD', // Apple gray
      '#F56040', // Instagram gradient
      '#7289DA', // Discord purple
      '#00B2FF', // PayPal blue
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };
  
  // For debugging purposes
  useEffect(() => {
    console.log("Current subscription state:", subscription);
    console.log("Current start date:", startDate);
    console.log("Has trial:", hasTrial);
    console.log("Trial end date:", trialEndDate);
  }, [subscription, startDate, hasTrial, trialEndDate]);
  
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
            placeholder="Describe your subscription with voice... (e.g., 'Netflix for $15.99 monthly starting next week with a 30-day trial')"
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
                      value={subscription.name || ''}
                      onChange={handleInputChange}
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="provider">Provider</Label>
                    <Input
                      id="provider"
                      name="provider"
                      value={subscription.provider || ''}
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
                  <Checkbox
                    id="hasTrial"
                    checked={hasTrial}
                    onCheckedChange={(checked) => setHasTrial(checked === true)}
                    className="rounded text-primary focus:ring-primary"
                  />
                  <Label htmlFor="hasTrial" className="cursor-pointer">This subscription has a free trial</Label>
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
