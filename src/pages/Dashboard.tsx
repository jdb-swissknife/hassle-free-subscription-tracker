
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
  ArrowUpDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import SubscriptionCard from '@/components/SubscriptionCard';
import NotificationBadge from '@/components/NotificationBadge';
import { mockSubscriptions } from '@/lib/mockData';
import { Subscription } from '@/lib/types';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [subscriptions] = useState<Subscription[]>(mockSubscriptions);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'date'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [filterActive, setFilterActive] = useState(true);
  
  // Filter and sort subscriptions
  const filteredSubscriptions = subscriptions
    .filter(sub => filterActive ? sub.active : true)
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
  const totalMonthly = activeSubscriptions.reduce((sum, sub) => {
    if (sub.cycle === 'monthly') return sum + sub.price;
    if (sub.cycle === 'yearly') return sum + (sub.price / 12);
    if (sub.cycle === 'weekly') return sum + (sub.price * 4.33); // Average weeks in month
    return sum;
  }, 0);

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
            <span className="text-muted-foreground text-sm">Total Monthly</span>
            <span className="text-2xl font-medium">${totalMonthly.toFixed(2)}</span>
            <div className="flex items-center mt-2 text-sm text-muted-foreground">
              <CreditCard className="h-4 w-4 mr-1" />
              <span>Across {activeSubscriptions.length} subscriptions</span>
            </div>
          </div>
          
          <div className="glass-card p-4 flex flex-col">
            <span className="text-muted-foreground text-sm">Next Payment</span>
            <span className="text-2xl font-medium">June 15</span>
            <div className="flex items-center mt-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4 mr-1" />
              <span>Netflix, $15.99</span>
            </div>
          </div>
          
          <div className="glass-card p-4 flex flex-col">
            <span className="text-muted-foreground text-sm">Most Expensive</span>
            <span className="text-2xl font-medium">Adobe CC</span>
            <div className="flex items-center mt-2 text-sm text-muted-foreground">
              <BarChart3 className="h-4 w-4 mr-1" />
              <span>$52.99 per month</span>
            </div>
          </div>
        </div>
        
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
      </header>
      
      <main>
        {filteredSubscriptions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
      </main>
    </div>
  );
};

export default Dashboard;
