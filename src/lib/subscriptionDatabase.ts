
export interface SubscriptionData {
  name: string;
  provider: string;
  category: string;
  commonPrices: number[];
  alternativeNames?: string[];
  logo?: string;
}

export const subscriptionDatabase: SubscriptionData[] = [
  // Entertainment - Streaming Video
  { name: 'Netflix', provider: 'Netflix, Inc.', category: 'entertainment', commonPrices: [15.99, 22.99], alternativeNames: ['netflix'] },
  { name: 'Disney+', provider: 'Disney', category: 'entertainment', commonPrices: [7.99, 13.99], alternativeNames: ['disney plus', 'disney+'] },
  { name: 'Hulu', provider: 'Hulu, LLC', category: 'entertainment', commonPrices: [7.99, 14.99], alternativeNames: ['hulu'] },
  { name: 'HBO Max', provider: 'Warner Bros. Discovery', category: 'entertainment', commonPrices: [9.99, 15.99], alternativeNames: ['hbo', 'max'] },
  { name: 'Amazon Prime Video', provider: 'Amazon.com, Inc.', category: 'entertainment', commonPrices: [8.99, 14.99], alternativeNames: ['prime video', 'amazon prime'] },
  { name: 'Apple TV+', provider: 'Apple Inc.', category: 'entertainment', commonPrices: [6.99], alternativeNames: ['apple tv plus'] },
  { name: 'Paramount+', provider: 'Paramount Global', category: 'entertainment', commonPrices: [5.99, 11.99], alternativeNames: ['paramount plus'] },
  { name: 'Peacock', provider: 'NBCUniversal', category: 'entertainment', commonPrices: [5.99, 11.99], alternativeNames: ['peacock tv'] },
  { name: 'ESPN+', provider: 'Disney', category: 'entertainment', commonPrices: [6.99], alternativeNames: ['espn plus'] },
  { name: 'Discovery+', provider: 'Warner Bros. Discovery', category: 'entertainment', commonPrices: [4.99, 6.99], alternativeNames: ['discovery plus'] },
  { name: 'Crunchyroll', provider: 'Sony Pictures Entertainment', category: 'entertainment', commonPrices: [7.99, 9.99], alternativeNames: ['crunchyroll'] },

  // Entertainment - Music
  { name: 'Spotify', provider: 'Spotify AB', category: 'entertainment', commonPrices: [9.99, 15.99], alternativeNames: ['spotify'] },
  { name: 'Apple Music', provider: 'Apple Inc.', category: 'entertainment', commonPrices: [9.99, 14.99], alternativeNames: ['apple music'] },
  { name: 'YouTube Premium', provider: 'Google LLC', category: 'entertainment', commonPrices: [11.99, 17.99], alternativeNames: ['youtube premium', 'youtube red'] },

  // Entertainment - Gaming
  { name: 'Xbox Game Pass', provider: 'Microsoft Corporation', category: 'entertainment', commonPrices: [9.99, 14.99], alternativeNames: ['xbox gamepass', 'game pass'] },
  { name: 'PlayStation Plus', provider: 'Sony Interactive Entertainment', category: 'entertainment', commonPrices: [9.99, 17.99], alternativeNames: ['playstation plus', 'ps plus'] },
  { name: 'Nintendo Switch Online', provider: 'Nintendo', category: 'entertainment', commonPrices: [3.99, 7.99], alternativeNames: ['nintendo online'] },
  { name: 'Apple Arcade', provider: 'Apple Inc.', category: 'entertainment', commonPrices: [4.99], alternativeNames: ['apple arcade'] },
  { name: 'Google Play Pass', provider: 'Google LLC', category: 'entertainment', commonPrices: [4.99], alternativeNames: ['play pass'] },
  { name: 'EA Play', provider: 'Electronic Arts', category: 'entertainment', commonPrices: [4.99, 14.99], alternativeNames: ['ea play'] },

  // Productivity
  { name: 'Microsoft 365', provider: 'Microsoft Corporation', category: 'productivity', commonPrices: [6.99, 12.99], alternativeNames: ['office 365', 'microsoft office'] },
  { name: 'Adobe Creative Cloud', provider: 'Adobe Inc.', category: 'productivity', commonPrices: [20.99, 52.99], alternativeNames: ['adobe cc', 'creative cloud'] },
  { name: 'Google Workspace', provider: 'Google LLC', category: 'productivity', commonPrices: [6, 12, 18], alternativeNames: ['google workspace', 'g suite'] },
  { name: 'Notion', provider: 'Notion Labs', category: 'productivity', commonPrices: [8, 15], alternativeNames: ['notion'] },
  { name: 'Slack', provider: 'Salesforce', category: 'productivity', commonPrices: [7.25, 12.50], alternativeNames: ['slack'] },
  { name: 'Dropbox', provider: 'Dropbox, Inc.', category: 'utilities', commonPrices: [9.99, 16.58], alternativeNames: ['dropbox'] },

  // Lifestyle - Food & Drink
  { name: 'HelloFresh', provider: 'HelloFresh SE', category: 'lifestyle', commonPrices: [60, 90, 120], alternativeNames: ['hello fresh'] },
  { name: 'Blue Bottle Coffee', provider: 'Blue Bottle Coffee', category: 'lifestyle', commonPrices: [20, 30, 40], alternativeNames: ['blue bottle'] },
  { name: 'Daily Harvest', provider: 'Daily Harvest', category: 'lifestyle', commonPrices: [5.99, 8.99], alternativeNames: ['daily harvest'] },

  // Lifestyle - Fashion & Beauty
  { name: 'Stitch Fix', provider: 'Stitch Fix, Inc.', category: 'lifestyle', commonPrices: [20], alternativeNames: ['stitch fix'] },
  { name: 'Birchbox', provider: 'Birchbox', category: 'lifestyle', commonPrices: [15], alternativeNames: ['birch box'] },
  { name: 'Fabletics', provider: 'TechStyle Fashion Group', category: 'lifestyle', commonPrices: [49.95], alternativeNames: ['fabletics'] },
  { name: 'Savage X Fenty', provider: 'Savage X Fenty', category: 'lifestyle', commonPrices: [49.95], alternativeNames: ['savage fenty'] },

  // Health & Fitness
  { name: 'Peloton', provider: 'Peloton Interactive', category: 'health', commonPrices: [12.99, 39], alternativeNames: ['peloton'] },
  { name: 'Calm', provider: 'Calm.com', category: 'health', commonPrices: [69.99], alternativeNames: ['calm'] },
  { name: 'Headspace', provider: 'Headspace Inc.', category: 'health', commonPrices: [12.99, 69.99], alternativeNames: ['headspace'] },
  { name: 'Noom', provider: 'Noom Inc.', category: 'health', commonPrices: [59, 129], alternativeNames: ['noom'] },

  // Finance & Business
  { name: 'QuickBooks', provider: 'Intuit Inc.', category: 'finance', commonPrices: [15, 30, 70], alternativeNames: ['quickbooks'] },
  { name: 'Salesforce', provider: 'Salesforce', category: 'productivity', commonPrices: [25, 75, 150], alternativeNames: ['salesforce'] },

  // News & Media
  { name: 'New York Times', provider: 'The New York Times Company', category: 'other', commonPrices: [4.25, 17], alternativeNames: ['nyt', 'new york times'] },
  { name: 'Wall Street Journal', provider: 'Dow Jones & Company', category: 'other', commonPrices: [29.99, 38.99], alternativeNames: ['wsj', 'wall street journal'] },
  { name: 'Washington Post', provider: 'Nash Holdings', category: 'other', commonPrices: [4, 10], alternativeNames: ['washington post', 'wapo'] },

  // Education
  { name: 'MasterClass', provider: 'MasterClass', category: 'other', commonPrices: [180], alternativeNames: ['masterclass', 'master class'] },
  { name: 'Skillshare', provider: 'Skillshare', category: 'other', commonPrices: [99, 168], alternativeNames: ['skillshare'] },
  { name: 'Coursera', provider: 'Coursera Inc.', category: 'other', commonPrices: [39, 79], alternativeNames: ['coursera'] },
  { name: 'Udemy', provider: 'Udemy', category: 'other', commonPrices: [19.99, 199.99], alternativeNames: ['udemy'] },

  // Books & Reading
  { name: 'Audible', provider: 'Amazon.com, Inc.', category: 'other', commonPrices: [14.95, 22.95], alternativeNames: ['audible'] },
  { name: 'Kindle Unlimited', provider: 'Amazon.com, Inc.', category: 'other', commonPrices: [9.99], alternativeNames: ['kindle unlimited'] },
  { name: 'Scribd', provider: 'Scribd Inc.', category: 'other', commonPrices: [9.99], alternativeNames: ['scribd'] },

  // Pets & Family
  { name: 'Chewy', provider: 'Chewy, Inc.', category: 'lifestyle', commonPrices: [25, 50, 100], alternativeNames: ['chewy'] },
  { name: 'BarkBox', provider: 'BarkBox', category: 'lifestyle', commonPrices: [22, 35], alternativeNames: ['bark box'] },
  { name: 'KiwiCo', provider: 'KiwiCo', category: 'lifestyle', commonPrices: [19.95, 39.95], alternativeNames: ['kiwi co'] },
];

// Fuzzy search function to find matches
export function findSubscriptionMatch(searchTerm: string): SubscriptionData | null {
  const term = searchTerm.toLowerCase().trim();
  
  // Exact match first
  const exactMatch = subscriptionDatabase.find(sub => 
    sub.name.toLowerCase() === term || 
    sub.alternativeNames?.some(alt => alt.toLowerCase() === term)
  );
  
  if (exactMatch) return exactMatch;
  
  // Partial match
  const partialMatch = subscriptionDatabase.find(sub =>
    sub.name.toLowerCase().includes(term) ||
    sub.alternativeNames?.some(alt => alt.toLowerCase().includes(term)) ||
    term.includes(sub.name.toLowerCase())
  );
  
  return partialMatch || null;
}

// Function to save new subscription to database (in a real app, this would be an API call)
export function saveNewSubscriptionToDatabase(subscription: SubscriptionData): void {
  // In a real application, this would make an API call to save to a backend database
  // For now, we'll add it to the local array (this won't persist across sessions)
  subscriptionDatabase.push(subscription);
  console.log('New subscription saved to database:', subscription);
}

// Function to suggest category based on name
export function suggestCategory(name: string): string {
  const nameLower = name.toLowerCase();
  
  // Entertainment keywords
  if (/(stream|tv|movie|music|game|video|netflix|spotify|disney|hulu)/i.test(nameLower)) {
    return 'entertainment';
  }
  
  // Productivity keywords
  if (/(office|work|document|productivity|adobe|microsoft|google)/i.test(nameLower)) {
    return 'productivity';
  }
  
  // Health keywords
  if (/(health|fitness|gym|workout|meditation|calm|headspace)/i.test(nameLower)) {
    return 'health';
  }
  
  // Lifestyle keywords
  if (/(food|fashion|beauty|coffee|meal|clothing|style)/i.test(nameLower)) {
    return 'lifestyle';
  }
  
  // Finance keywords
  if (/(bank|finance|money|payment|quickbooks|accounting)/i.test(nameLower)) {
    return 'finance';
  }
  
  // Default to 'other'
  return 'other';
}
