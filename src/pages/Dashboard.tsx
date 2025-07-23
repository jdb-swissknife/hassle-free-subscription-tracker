
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings as SettingsIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SubscriptionCategory } from '@/lib/types';
import { useSupabaseSubscriptions } from '@/hooks/useSupabaseSubscriptions';
import NotificationBadge from '@/components/NotificationBadge';
import DashboardStats from '@/components/dashboard/DashboardStats';
import FreeTrialsList from '@/components/dashboard/FreeTrialsList';
import SearchFilterBar from '@/components/dashboard/SearchFilterBar';
import SubscriptionTabContent from '@/components/dashboard/SubscriptionTabContent';
import SubscriptionStats from '@/components/SubscriptionStats';
import QuickAdd from '@/components/dashboard/QuickAdd';
import { useAuth } from '@/contexts/AuthContext';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { 
    subscriptions,
    loading,
    calculateMonthlySpend,
    getActiveSubscriptions,
    getFreeTrials,
    searchSubscriptions
  } = useSupabaseSubscriptions();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'date'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [filterActive, setFilterActive] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<SubscriptionCategory | 'all'>('all');
  
  const activeSubscriptions = getActiveSubscriptions();
  const monthlySpend = calculateMonthlySpend();
  const yearlySpend = monthlySpend * 12;
  const freeTrials = getFreeTrials();
  
  console.log('Dashboard - Data Summary:', {
    totalSubscriptions: subscriptions.length,
    activeSubscriptions: activeSubscriptions.length, 
    freeTrials: freeTrials.length,
    loading,
    user: !!user
  });
  
  console.log('Dashboard - Free Trials Details:', freeTrials.map(ft => ({
    name: ft.name,
    trialEndDate: ft.trialEndDate,
    active: ft.active
  })));
  
  const filteredSubscriptions = searchSubscriptions(searchTerm)
    .filter(sub => filterActive ? sub.active : true)
    .filter(sub => categoryFilter === 'all' ? true : sub.category === categoryFilter)
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
          ? new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
          : new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
      }
    });

  const handleTabChange = (value: string) => {
    if (value === 'all') {
      setCategoryFilter('all');
    } else {
      setCategoryFilter(value as SubscriptionCategory);
    }
  };
  
  const handleCardClick = (id: string) => {
    navigate(`/subscription/${id}`);
  };
  
  const handleAddNew = () => {
    navigate('/add');
  };
  
  const handleSortChange = (field: 'name' | 'price' | 'date') => {
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
        
        <DashboardStats 
          activeSubscriptions={activeSubscriptions}
          monthlySpend={monthlySpend}
          yearlySpend={yearlySpend}
        />
        
        <FreeTrialsList 
          freeTrials={freeTrials} 
          onCardClick={handleCardClick} 
        />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <SearchFilterBar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onFilterChange={setFilterActive}
            onSortChange={handleSortChange}
            filterActive={filterActive}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onAddNew={handleAddNew}
          />
          <div className="hidden lg:block">
            {/* Empty div for grid alignment */}
          </div>
        </div>
      </header>
      
      <main>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-2">
            <Tabs defaultValue="all" className="mb-6" onValueChange={handleTabChange}>
              <TabsList className="glass-card">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="entertainment">Entertainment</TabsTrigger>
                <TabsTrigger value="productivity">Productivity</TabsTrigger>
                <TabsTrigger value="utilities">Utilities</TabsTrigger>
                <TabsTrigger value="other">Other</TabsTrigger>
              </TabsList>
              <TabsContent value="all">
                <SubscriptionTabContent 
                  filteredSubscriptions={filteredSubscriptions}
                  searchTerm={searchTerm}
                  onAddNew={handleAddNew}
                  onCardClick={handleCardClick}
                />
              </TabsContent>
              <TabsContent value="entertainment">
                <SubscriptionTabContent 
                  filteredSubscriptions={filteredSubscriptions}
                  category="entertainment"
                  searchTerm={searchTerm}
                  onAddNew={handleAddNew}
                  onCardClick={handleCardClick}
                />
              </TabsContent>
              <TabsContent value="productivity">
                <SubscriptionTabContent 
                  filteredSubscriptions={filteredSubscriptions}
                  category="productivity"
                  searchTerm={searchTerm}
                  onAddNew={handleAddNew}
                  onCardClick={handleCardClick}
                />
              </TabsContent>
              <TabsContent value="utilities">
                <SubscriptionTabContent 
                  filteredSubscriptions={filteredSubscriptions}
                  category="utilities"
                  searchTerm={searchTerm}
                  onAddNew={handleAddNew}
                  onCardClick={handleCardClick}
                />
              </TabsContent>
              <TabsContent value="other">
                <SubscriptionTabContent 
                  filteredSubscriptions={filteredSubscriptions}
                  category="other"
                  searchTerm={searchTerm}
                  onAddNew={handleAddNew}
                  onCardClick={handleCardClick}
                />
              </TabsContent>
            </Tabs>
          </div>
          
          <div className="lg:col-span-2">
            <SubscriptionStats 
              subscriptions={subscriptions} 
              className="mb-6"
            />
            
            <QuickAdd onAddNew={handleAddNew} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
