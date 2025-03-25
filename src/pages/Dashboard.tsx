
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Calendar, 
  CreditCard, 
  Settings as SettingsIcon,
  Search,
  BarChart3,
  Filter,
  ArrowUpDown,
  Clock,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SubscriptionCard from '@/components/SubscriptionCard';
import FreeTrialCard from '@/components/FreeTrialCard';
import SubscriptionStats from '@/components/SubscriptionStats';
import NotificationBadge from '@/components/NotificationBadge';
import { mockSubscriptions } from '@/lib/mockData';
import { Subscription, SubscriptionCategory } from '@/lib/types';
import { format, addDays, isBefore } from 'date-fns';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [subscriptions] = useState<Subscription[]>(mockSubscriptions);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'date'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [filterActive, setFilterActive] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<SubscriptionCategory | 'all'>('all');
  
  // Filter and sort subscriptions
  const filteredSubscriptions = subscriptions
    .filter(sub => filterActive ? sub.active : true)
    .filter(sub => categoryFilter === 'all' ? true : sub.category === categoryFilter)
    .filter(sub => 
      sub.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.provider.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'name') {
        return sortOrder === 'asc' 
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      } else if (sortBy === 'price') {
        return sortOrder === 'asc' 
          ? a.price - b.price
          : b.price - a.price;
      } else {
        return sortOrder === 'asc' 
          ? a.startDate.getTime() - b.startDate.getTime()
          : b.startDate.getTime() - a.startDate.getTime();
      }
    });
    
  // Calculate stats
  const activeSubscriptions = subscriptions.filter(sub => sub.active);
  const monthlySpend = activeSubscriptions.reduce((sum, sub) => {
    if (sub.cycle === 'monthly') return sum + sub.price;
    if (sub.cycle === 'yearly') return sum + (sub.price / 12);
    if (sub.cycle === 'weekly') return sum + (sub.price * 4.33); // Average weeks in month
    return sum;
  }, 0);
  
  const yearlySpend = monthlySpend * 12;
  
  // Find active free trials
  const today = new Date();
  const freeTrials = activeSubscriptions.filter(sub => 
    sub.trialEndDate && isBefore(today, sub.trialEndDate)
  );
  
  // Find next payment
  const getNextPaymentInfo = () => {
    let nextPayment = null;
    let nextPaymentDate = new Date(8640000000000000); // Max date
    
    activeSubscriptions.forEach(sub => {
      let nextDate = new Date(sub.startDate);
      
      if (sub.cycle === 'monthly') {
        while (isBefore(nextDate, today)) {
          nextDate.setMonth(nextDate.getMonth() + 1);
        }
      } else if (sub.cycle === 'yearly') {
        while (isBefore(nextDate, today)) {
          nextDate.setFullYear(nextDate.getFullYear() + 1);
        }
      } else if (sub.cycle === 'weekly') {
        while (isBefore(nextDate, today)) {
          nextDate = addDays(nextDate, 7);
        }
      }
      
      if (isBefore(nextDate, nextPaymentDate)) {
        nextPaymentDate = nextDate;
        nextPayment = {
          name: sub.name,
          date: nextDate,
          price: sub.price,
          cycle: sub.cycle
        };
      }
    });
    
    return nextPayment;
  };

  // Find most expensive subscription
  const getMostExpensive = () => {
    if (activeSubscriptions.length === 0) return null;
    
    return activeSubscriptions.reduce((prev, current) => {
      // Normalize to monthly cost for comparison
      const prevMonthly = prev.cycle === 'monthly' 
        ? prev.price 
        : prev.cycle === 'yearly' 
          ? prev.price / 12 
          : prev.price * 4.33;
          
      const currentMonthly = current.cycle === 'monthly' 
        ? current.price 
        : current.cycle === 'yearly' 
          ? current.price / 12 
          : current.price * 4.33;
      
      return prevMonthly > currentMonthly ? prev : current;
    });
  };
  
  const nextPayment = getNextPaymentInfo();
  const mostExpensive = getMostExpensive();
  
  const toggleSort = (field: 'name' | 'price' | 'date') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  return (
    <div className="container max-w-5xl mx-auto px-4 py-8 min-h-screen">
      <header className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-bold text-gradient">Subscriptions</h1>
          <div className="flex items-center gap-2">
            <NotificationBadge />
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              onClick={() => navigate('/settings')}
            >
              <SettingsIcon className="h-5 w-5" />
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="glass-card p-4 flex flex-col">
            <div className="flex justify-between items-start">
              <span className="text-muted-foreground text-sm">Monthly Spend</span>
              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                ${yearlySpend.toFixed(2)}/year
              </span>
            </div>
            <span className="text-2xl font-medium">${monthlySpend.toFixed(2)}/mo</span>
            <div className="flex items-center mt-2 text-sm text-muted-foreground">
              <CreditCard className="h-4 w-4 mr-1" />
              <span>Across {activeSubscriptions.length} subscriptions</span>
            </div>
          </div>
          
          <div className="glass-card p-4 flex flex-col">
            <span className="text-muted-foreground text-sm">Next Payment</span>
            {nextPayment ? (
              <>
                <span className="text-2xl font-medium">{format(nextPayment.date, 'MMM d')}</span>
                <div className="flex items-center mt-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>{nextPayment.name}, ${nextPayment.price.toFixed(2)}</span>
                </div>
              </>
            ) : (
              <>
                <span className="text-2xl font-medium">-</span>
                <div className="flex items-center mt-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>No upcoming payments</span>
                </div>
              </>
            )}
          </div>
          
          <div className="glass-card p-4 flex flex-col">
            <span className="text-muted-foreground text-sm">Most Expensive</span>
            {mostExpensive ? (
              <>
                <span className="text-2xl font-medium">{mostExpensive.name}</span>
                <div className="flex items-center mt-2 text-sm text-muted-foreground">
                  <BarChart3 className="h-4 w-4 mr-1" />
                  <span>
                    ${mostExpensive.price.toFixed(2)} per {mostExpensive.cycle.replace('ly', '')}
                  </span>
                </div>
              </>
            ) : (
              <>
                <span className="text-2xl font-medium">-</span>
                <div className="flex items-center mt-2 text-sm text-muted-foreground">
                  <BarChart3 className="h-4 w-4 mr-1" />
                  <span>No active subscriptions</span>
                </div>
              </>
            )}
          </div>
        </div>
        
        {freeTrials.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-medium mb-3">Free Trials</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {freeTrials.map((subscription) => (
                <FreeTrialCard
                  key={`trial-${subscription.id}`}
                  subscription={subscription}
                  onClick={() => navigate(`/subscription/${subscription.id}`)}
                />
              ))}
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="relative w-full md:w-auto flex-grow">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search subscriptions..."
                  className="pl-9 glass-card"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-1">
                      <Filter className="h-4 w-4" />
                      <span className="hidden sm:inline">Filter</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem 
                      onClick={() => setFilterActive(true)}
                      className={filterActive ? "bg-muted" : ""}
                    >
                      Active only
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => setFilterActive(false)}
                      className={!filterActive ? "bg-muted" : ""}
                    >
                      Show all
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-1">
                      <ArrowUpDown className="h-4 w-4" />
                      <span className="hidden sm:inline">Sort</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => toggleSort('name')}>
                      By name {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => toggleSort('price')}>
                      By price {sortBy === 'price' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => toggleSort('date')}>
                      By date {sortBy === 'date' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                
                <Button onClick={() => navigate('/add')} size="sm" className="gap-1">
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">Add</span>
                </Button>
              </div>
            </div>
          </div>
          <div className="hidden lg:block">
            {/* Empty div for grid alignment */}
          </div>
        </div>
      </header>
      
      <main>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Tabs defaultValue="all" className="mb-6">
              <TabsList className="glass-card">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="entertainment">Entertainment</TabsTrigger>
                <TabsTrigger value="productivity">Productivity</TabsTrigger>
                <TabsTrigger value="utilities">Utilities</TabsTrigger>
                <TabsTrigger value="other">Other</TabsTrigger>
              </TabsList>
              <TabsContent value="all">
                {filteredSubscriptions.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4">
                    {filteredSubscriptions.map((subscription) => (
                      <SubscriptionCard
                        key={subscription.id}
                        subscription={subscription}
                        onClick={() => navigate(`/subscription/${subscription.id}`)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="glass-card p-10 text-center">
                    <h3 className="text-xl font-medium mb-2">No subscriptions found</h3>
                    <p className="text-muted-foreground mb-6">
                      {searchTerm 
                        ? `No results for "${searchTerm}"`
                        : 'Add your first subscription to get started'}
                    </p>
                    <Button onClick={() => navigate('/add')}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Subscription
                    </Button>
                  </div>
                )}
              </TabsContent>
              <TabsContent value="entertainment">
                {filteredSubscriptions.filter(sub => sub.category === 'entertainment').length > 0 ? (
                  <div className="grid grid-cols-1 gap-4">
                    {filteredSubscriptions
                      .filter(sub => sub.category === 'entertainment')
                      .map((subscription) => (
                        <SubscriptionCard
                          key={subscription.id}
                          subscription={subscription}
                          onClick={() => navigate(`/subscription/${subscription.id}`)}
                        />
                      ))}
                  </div>
                ) : (
                  <div className="glass-card p-6 text-center">
                    <p className="text-muted-foreground">No entertainment subscriptions found</p>
                  </div>
                )}
              </TabsContent>
              <TabsContent value="productivity">
                {filteredSubscriptions.filter(sub => sub.category === 'productivity').length > 0 ? (
                  <div className="grid grid-cols-1 gap-4">
                    {filteredSubscriptions
                      .filter(sub => sub.category === 'productivity')
                      .map((subscription) => (
                        <SubscriptionCard
                          key={subscription.id}
                          subscription={subscription}
                          onClick={() => navigate(`/subscription/${subscription.id}`)}
                        />
                      ))}
                  </div>
                ) : (
                  <div className="glass-card p-6 text-center">
                    <p className="text-muted-foreground">No productivity subscriptions found</p>
                  </div>
                )}
              </TabsContent>
              <TabsContent value="utilities">
                {filteredSubscriptions.filter(sub => sub.category === 'utilities').length > 0 ? (
                  <div className="grid grid-cols-1 gap-4">
                    {filteredSubscriptions
                      .filter(sub => sub.category === 'utilities')
                      .map((subscription) => (
                        <SubscriptionCard
                          key={subscription.id}
                          subscription={subscription}
                          onClick={() => navigate(`/subscription/${subscription.id}`)}
                        />
                      ))}
                  </div>
                ) : (
                  <div className="glass-card p-6 text-center">
                    <p className="text-muted-foreground">No utilities subscriptions found</p>
                  </div>
                )}
              </TabsContent>
              <TabsContent value="other">
                {filteredSubscriptions.filter(sub => 
                  !['entertainment', 'productivity', 'utilities'].includes(sub.category)
                ).length > 0 ? (
                  <div className="grid grid-cols-1 gap-4">
                    {filteredSubscriptions
                      .filter(sub => !['entertainment', 'productivity', 'utilities'].includes(sub.category))
                      .map((subscription) => (
                        <SubscriptionCard
                          key={subscription.id}
                          subscription={subscription}
                          onClick={() => navigate(`/subscription/${subscription.id}`)}
                        />
                      ))}
                  </div>
                ) : (
                  <div className="glass-card p-6 text-center">
                    <p className="text-muted-foreground">No other subscriptions found</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
          
          <div>
            <SubscriptionStats 
              subscriptions={subscriptions} 
              className="mb-6"
            />
            
            <div className="glass-card p-4">
              <h3 className="text-lg font-medium mb-2">Quick Add</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Add a new subscription to track your expenses
              </p>
              <Button 
                onClick={() => navigate('/add')} 
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Subscription
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
