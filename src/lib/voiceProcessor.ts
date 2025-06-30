
import { addDays, addWeeks, addMonths, parse, isValid } from 'date-fns';
import { Subscription, SubscriptionCategory } from '@/lib/types';
import { findSubscriptionMatch, suggestCategory } from '@/lib/subscriptionDatabase';

export const extractPriceFromTranscript = (transcript: string): number | null => {
  const pricePatterns = [
    /(\d+(?:\.\d{1,2})?)\s*(?:dollars?|usd|bucks?)/i,
    /\$(\d+(?:\.\d{1,2})?)/i,
    /(\d+(?:\.\d{1,2})?)\s*per/i,
  ];
  
  for (const pattern of pricePatterns) {
    const match = transcript.match(pattern);
    if (match && match[1]) {
      const price = parseFloat(match[1]);
      if (price > 0 && price < 10000) {
        return price;
      }
    }
  }
  
  return null;
};

export const mockAIExtraction = (transcript: string): Partial<Subscription> => {
  console.log("Running AI extraction on:", transcript);
  const lowercased = transcript.toLowerCase();
  
  let extracted: Partial<Subscription> = {};
  
  // Extract service name - be more literal
  const namePatterns = [
    /(?:subscription\s+(?:for|to)\s+)([a-z0-9\s&]+?)(?:\s+(?:for|costs|is|at|starting|begins))/i,
    /(?:for\s+)([a-z0-9\s&]+?)(?:\s+(?:subscription|service|app|costs|is|at))/i,
  ];
  
  for (const pattern of namePatterns) {
    const match = transcript.match(pattern);
    if (match && match[1]) {
      const name = match[1].trim();
      if (name.length > 1 && name.length < 50) {
        extracted.name = name;
        extracted.provider = name;
        extracted.category = suggestCategory(name) as SubscriptionCategory;
        break;
      }
    }
  }
  
  // If no pattern match, use first few words as name
  if (!extracted.name) {
    const words = transcript.split(' ').slice(0, 3).join(' ');
    if (words.length > 0) {
      extracted.name = words;
      extracted.provider = words;
      extracted.category = suggestCategory(words) as SubscriptionCategory;
    }
  }
  
  // Price extraction
  const price = extractPriceFromTranscript(transcript);
  if (price) {
    extracted.price = price;
  }
  
  // Billing cycle detection
  if (/(month|monthly|per month|each month|every month)/i.test(lowercased)) {
    extracted.cycle = 'monthly';
  } else if (/(year|yearly|annual|annually|per year|each year|every year)/i.test(lowercased)) {
    extracted.cycle = 'yearly';
  } else if (/(week|weekly|per week|each week|every week)/i.test(lowercased)) {
    extracted.cycle = 'weekly';
  }
  
  // Start date parsing
  const today = new Date();
  
  // Relative date patterns
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
  
  // Specific date patterns
  if (!extracted.startDate) {
    const specificDatePatterns = [
      /(?:start(?:s|ed|ing)?|begin(?:s|ning)?|on)\s+(?:on\s+)?(\w+\s+\d{1,2}(?:st|nd|rd|th)?(?:\s*,?\s*\d{2,4})?)/i,
      /(?:start(?:s|ed|ing)?|begin(?:s|ning)?|on)\s+(?:on\s+)?(\w+\s+\d{1,2}(?:st|nd|rd|th)?)/i,
      /(\w+\s+\d{1,2}(?:st|nd|rd|th)?)(?:\s+(?:is|will be|starts?))/i,
      /(?:start(?:s|ed|ing)?|begin(?:s|ning)?|on)\s+(?:on\s+)?(\d{1,2}[\/\-]\d{1,2}(?:[\/\-]\d{2,4})?)/i,
    ];
    
    for (const pattern of specificDatePatterns) {
      const dateMatch = transcript.match(pattern);
      if (dateMatch && dateMatch[1]) {
        try {
          let cleanDateString = dateMatch[1].trim();
          
          // Clean up ordinal numbers
          cleanDateString = cleanDateString.replace(/(\d+)(?:st|nd|rd|th)/g, '$1');
          
          // Try different date parsing approaches
          let parsedDate;
          
          // Try with current year if no year specified
          if (!/\d{4}/.test(cleanDateString)) {
            parsedDate = parse(cleanDateString + ` ${today.getFullYear()}`, 'MMMM d yyyy', new Date());
            if (!isValid(parsedDate)) {
              parsedDate = parse(cleanDateString + ` ${today.getFullYear()}`, 'MMM d yyyy', new Date());
            }
          } else {
            // Has year
            parsedDate = parse(cleanDateString, 'MMMM d yyyy', new Date());
            if (!isValid(parsedDate)) {
              parsedDate = parse(cleanDateString, 'MMM d yyyy', new Date());
            }
            if (!isValid(parsedDate)) {
              parsedDate = parse(cleanDateString, 'M/d/yyyy', new Date());
            }
            if (!isValid(parsedDate)) {
              parsedDate = parse(cleanDateString, 'M/d/yy', new Date());
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
          console.log("Error parsing specific date:", dateMatch[1], e);
        }
      }
    }
  }
  
  // Trial information extraction
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

export const processVoiceInput = (transcript: string) => {
  console.log("Processing voice input:", transcript);
  
  // First, try to find a match in the database
  const match = findSubscriptionMatch(transcript);
  
  if (match) {
    console.log("Found database match:", match);
    
    return {
      subscription: {
        name: match.name,
        provider: match.provider,
        category: match.category as SubscriptionCategory,
        price: extractPriceFromTranscript(transcript) || match.commonPrices[0] || 0
      },
      isNewSubscription: false,
      extractedData: mockAIExtraction(transcript)
    };
  } else {
    console.log("No database match found, using AI extraction");
    
    const extractedData = mockAIExtraction(transcript);
    return {
      subscription: extractedData,
      isNewSubscription: true,
      extractedData
    };
  }
};
