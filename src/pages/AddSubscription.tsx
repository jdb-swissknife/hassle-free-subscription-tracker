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
import { format, addDays, addWeeks, addMonths, parse, isValid } from 'date-fns';
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
  
  // Improved AI extraction - focus more on service name, make provider optional
  const mockAIExtraction = (transcript: string): Partial<Subscription> => {
    console.log("Running AI extraction on:", transcript);
    const lowercased = transcript.toLowerCase();
    
    let extracted: Partial<Subscription> = {};
    
    // More literal approach - extract company names as spoken
    // First check for common service patterns
    const servicePatterns = [
      { pattern: /netflix/i, name: 'Netflix', provider: 'Netflix, Inc.' },
      { pattern: /spotify/i, name: 'Spotify', provider: 'Spotify AB' },
      { pattern: /hulu/i, name: 'Hulu', provider: 'Hulu, LLC' },
      { pattern: /disney(\s|plus|\+)/i, name: 'Disney+', provider: 'Disney' },
      { pattern: /adobe/i, name: 'Adobe Creative Cloud', provider: 'Adobe Inc.' },
      { pattern: /amazon(\s|prime)/i, name: 'Amazon Prime', provider: 'Amazon.com, Inc.' },
      { pattern: /youtube(\s|premium)/i, name: 'YouTube Premium', provider: 'Google LLC' },
      { pattern: /apple(\s|music)/i, name: 'Apple Music', provider: 'Apple Inc.' },
      { pattern: /microsoft(\s|office|365)/i, name: 'Microsoft 365', provider: 'Microsoft Corporation' },
      { pattern: /google(\s|one|drive)/i, name: 'Google One', provider: 'Google LLC' },
      { pattern: /dropbox/i, name: 'Dropbox', provider: 'Dropbox, Inc.' },
    ];
    
    // Check for known services first
    let foundKnownService = false;
    for (const service of servicePatterns) {
      if (service.pattern.test(lowercased)) {
        extracted.name = service.name;
        extracted.provider = service.provider;
        foundKnownService = true;
        break;
      }
    }
    
    // If no known service found, extract any reasonable service name
    if (!foundKnownService) {
      // Extract any capitalized words or quoted content as potential service names
      const namePatterns = [
        /(?:subscription\s+(?:for|to)\s+)([a-z0-9\s&]+?)(?:\s+(?:for|costs|is|at|starting|begins))/i,
        /(?:for\s+)([a-z0-9\s&]+?)(?:\s+(?:subscription|service|app))/i,
        /(?:^|\s)([A-Z][a-z0-9]*(?:\s+[A-Z][a-z0-9]*)*)/g, // Capitalized words
      ];
      
      for (const pattern of namePatterns) {
        const match = transcript.match(pattern);
        if (match && match[1]) {
          const name = match[1].trim();
          if (name.length > 1 && name.length < 50) { // Reasonable name length
            extracted.name = name;
            // Don't set provider automatically - let user add it manually if needed
            break;
          }
        }
      }
    }
    
    // Improved price extraction with more patterns
    const pricePatterns = [
      /(\d+(?:\.\d{1,2})?)\s*(?:dollars?|usd|bucks?)\s*(?:per|a|each|\/)/i,
      /\$(\d+(?:\.\d{1,2})?)\s*(?:per|a|each|\/|for)/i,
      /(\d+(?:\.\d{1,2})?)\s*(?:per|a|each|\/)/i,
      /costs?\s*(\d+(?:\.\d{1,2})?)/i,
      /price\s*(?:is|of)?\s*(\d+(?:\.\d{1,2})?)/i,
    ];
    
    for (const pattern of pricePatterns) {
      const priceMatch = lowercased.match(pattern);
      if (priceMatch && priceMatch[1]) {
        const price = parseFloat(priceMatch[1]);
        if (price > 0 && price < 10000) { // Reasonable price range
          extracted.price = price;
          break;
        }
      }
    }
    
    // Billing cycle detection with more patterns
    if (/(month|monthly|per month|each month|every month)/i.test(lowercased)) {
      extracted.cycle = 'monthly';
    } else if (/(year|yearly|annual|annually|per year|each year|every year)/i.test(lowercased)) {
      extracted.cycle = 'yearly';
    } else if (/(week|weekly|per week|each week|every week)/i.test(lowercased)) {
      extracted.cycle = 'weekly';
    }
    
    // Category detection with improved patterns
    const categoryPatterns = [
      { pattern: /(stream|streaming|movie|movies|tv|show|entertainment|watch)/i, category: 'entertainment' },
      { pattern: /(work|office|document|productivity|suite)/i, category: 'productivity' },
      { pattern: /(cloud|storage|backup|drive|utility)/i, category: 'utilities' },
      { pattern: /(social|network|media|chat|messaging)/i, category: 'social' },
      { pattern: /(lifestyle|living|home)/i, category: 'lifestyle' },
      { pattern: /(health|fitness|medical|wellness)/i, category: 'health' },
      { pattern: /(finance|financial|banking|money)/i, category: 'finance' },
    ];
    
    for (const { pattern, category } of categoryPatterns) {
      if (pattern.test(lowercased)) {
        extracted.category = category as SubscriptionCategory;
        break;
      }
    }
    
    // Enhanced start date parsing
    const today = new Date();
    
    // Relative date patterns - Fixed the type issue
    const relativeDatePatterns = [
      { pattern: /start(?:s|ed|ing)?\s+today/i, dateGetter: () => new Date() },
      { pattern: /start(?:s|ed|ing)?\s+tomorrow/i, dateGetter: () => addDays(new Date(), 1) },
      { pattern: /start(?:s|ed|ing)?\s+next\s+week/i, dateGetter: () => addWeeks(new Date(), 1) },
      { pattern: /start(?:s|ed|ing)?\s+next\s+month/i, dateGetter: () => addMonths(new Date(), 1) },
      { pattern: /(?:in|after)\s+(\d+)\s+days?/i, dateGetter: (match: RegExpMatchArray) => addDays(new Date(), parseInt(match[1])) },
      { pattern: /(?:in|after)\s+(\d+)\s+weeks?/i, dateGetter: (match: RegExpMatchArray) => addWeeks(new Date(), parseInt(match[1])) },
      { pattern: /(?:in|after)\s+(\d+)\s+months?/i, dateGetter: (match: RegExpMatchArray) => addMonths(new Date(), parseInt(match[1])) },
    ];
    
    for (const { pattern, dateGetter } of relativeDatePatterns) {
      const match = lowercased.match(pattern);
      if (match) {
        try {
          extracted.startDate = dateGetter(match);
          break;
        } catch (e) {
          console.log("Error parsing relative date:", e);
        }
      }
    }
    
    // Specific date patterns - more comprehensive
    if (!extracted.startDate) {
      const specificDatePatterns = [
        // Month Day, Year
        /(?:start(?:s|ed|ing)?|begin(?:s|ning)?|on)\s+(?:on\s+)?(\w+\s+\d{1,2}(?:st|nd|rd|th)?(?:\s*,?\s*\d{2,4})?)/i,
        // Month Day
        /(?:start(?:s|ed|ing)?|begin(?:s|ning)?|on)\s+(?:on\s+)?(\w+\s+\d{1,2}(?:st|nd|rd|th)?)/i,
        // Just month and day without keywords
        /(\w+\s+\d{1,2}(?:st|nd|rd|th)?)(?:\s+(?:is|will be|starts?))/i,
        // Numeric dates
        /(?:start(?:s|ed|ing)?|begin(?:s|ning)?|on)\s+(?:on\s+)?(\d{1,2}[\/\-]\d{1,2}(?:[\/\-]\d{2,4})?)/i,
      ];
      
      for (const pattern of specificDatePatterns) {
        const dateMatch = transcript.match(pattern);
        if (dateMatch && dateMatch[1]) {
          try {
            let dateString = dateMatch[1].trim();
            
            // Clean up ordinal numbers (1st, 2nd, 3rd, 4th)
            dateString = dateString.replace(/(\d+)(?:st|nd|rd|th)/g, '$1');
            
            // Try different date parsing approaches
            let parsedDate;
            
            // Try with current year if no year specified
            if (!/\d{4}/.test(dateString)) {
              parsedDate = parse(dateString + ` ${today.getFullYear()}`, 'MMMM d yyyy', new Date());
              if (!isValid(parsedDate)) {
                parsedDate = parse(dateString + ` ${today.getFullYear()}`, 'MMM d yyyy', new Date());
              }
            } else {
              // Has year
              parsedDate = parse(dateString, 'MMMM d yyyy', new Date());
              if (!isValid(parsedDate)) {
                parsedDate = parse(dateString, 'MMM d yyyy', new Date());
              }
              if (!isValid(parsedDate)) {
                parsedDate = parse(dateString, 'M/d/yyyy', new Date());
              }
              if (!isValid(parsedDate)) {
                parsedDate = parse(dateString, 'M/d/yy', new Date());
              }
            }
            
            if (isValid(parsedDate)) {
              // If parsed date is in the past, assume next year
              if (parsedDate < today) {
                parsedDate = addMonths(parsedDate, 12);
              }
              extracted.startDate = parsedDate;
              break;
            }
          } catch (e) {
            console.log("Error parsing specific date:", dateString, e);
          }
        }
      }
    }
    
    // Trial information extraction - improved
    const trialPatterns = [
      /(\d+)[\s-]*(?:day|days)\s+(?:free\s+)?trial/i,
      /(\d+)[\s-]*(?:week|weeks)\s+(?:free\s+)?trial/i,
      /(\d+)[\s-]*(?:month|months)\s+(?:free\s+)?trial/i,
      /(?:free\s+)?trial\s+(?:for\s+)?(\d+)\s+(?:day|days)/i,
      /(?:free\s+)?trial\s+(?:for\s+)?(\d+)\s+(?:week|weeks)/i,
      /(?:free\s+)?trial\s+(?:for\s+)?(\d+)\s+(?:month|months)/i,
      /has\s+(?:a\s+)?(?:free\s+)?trial/i,
    ];
    
    for (const pattern of trialPatterns) {
      const trialMatch = lowercased.match(pattern);
      if (trialMatch) {
        const startDateToUse = extracted.startDate || new Date();
        let trialDate;
        
        if (trialMatch[1]) {
          const trialValue = parseInt(trialMatch[1]);
          const patternStr = pattern.source.toLowerCase();
          
          if (patternStr.includes('day')) {
            trialDate = addDays(startDateToUse, trialValue);
          } else if (patternStr.includes('week')) {
            trialDate = addWeeks(startDateToUse, trialValue);
          } else if (patternStr.includes('month')) {
            trialDate = addMonths(startDateToUse, trialValue);
          }
        } else {
          // Generic trial mention without specific duration - default to 7 days
          trialDate = addDays(startDateToUse, 7);
        }
        
        if (trialDate) {
          extracted.trialEndDate = trialDate;
          break;
        }
      }
    }
    
    console.log("Final extraction result:", extracted);
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
      // Only require name and price - provider is now optional
      return !!subscription.name && !!subscription.price;
    }
    return true;
  };
  
  const handleSubmit = () => {
    // Add new subscription to storage
    const newSubscription: Subscription = {
      id: uuidv4(),
      name: subscription.name || '',
      provider: subscription.provider || subscription.name || '', // Use name as fallback for provider
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
            placeholder="Describe your subscription with voice... (e.g., 'Netflix for $15.99 monthly starting January 15th with a 30-day trial')"
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
                    <Label htmlFor="name">Subscription Name *</Label>
                    <Input
                      id="name"
                      name="name"
                      value={subscription.name || ''}
                      onChange={handleInputChange}
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="provider">Provider (Optional)</Label>
                    <Input
                      id="provider"
                      name="provider"
                      value={subscription.provider || ''}
                      onChange={handleInputChange}
                      className="mt-1"
                      placeholder="You can add this later if needed"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="price">Price *</Label>
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
