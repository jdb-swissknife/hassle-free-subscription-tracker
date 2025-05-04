
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  Calendar, 
  CreditCard, 
  Bell, 
  Clock,
  Trash2,
  Edit,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSubscriptions } from '@/hooks/useSubscriptions';
import { format, differenceInDays, addDays } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from 'sonner';

const SubscriptionDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  const {
    getSubscription,
    deleteSubscription
  } = useSubscriptions();
  
  const subscription = getSubscription(id || '');
  
  if (!subscription) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-8 min-h-screen">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full mb-6"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        
        <div className="glass-card p-10 text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4">Subscription not found</h1>
          <p className="text-muted-foreground mb-6">
            The subscription you're looking for doesn't exist or has been deleted.
          </p>
          <Button onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }
  
  const { 
    name, 
    provider, 
    price, 
    cycle, 
    startDate, 
    endDate,
    trialEndDate,
    category,
    description,
    paymentMethod,
    logo,
    color,
    active,
    notifications
  } = subscription;
  
  const today = new Date();
  const trialDaysLeft = trialEndDate ? differenceInDays(new Date(trialEndDate), today) : null;
  const inTrial = trialDaysLeft !== null && trialDaysLeft >= 0;
  
  // Calculate next billing date
  const calculateNextBillingDate = () => {
    let nextDate = new Date(startDate);
    
    // If there's a trial, first payment is after trial
    if (inTrial) {
      return new Date(trialEndDate!);
    }
    
    if (cycle === 'monthly') {
      while (nextDate <= today) {
        nextDate.setMonth(nextDate.getMonth() + 1);
      }
    } else if (cycle === 'yearly') {
      while (nextDate <= today) {
        nextDate.setFullYear(nextDate.getFullYear() + 1);
      }
    } else if (cycle === 'weekly') {
      while (nextDate <= today) {
        nextDate = addDays(nextDate, 7);
      }
    }
    
    return nextDate;
  };
  
  const nextBillingDate = calculateNextBillingDate();
  const daysUntilBilling = differenceInDays(nextBillingDate, today);
  
  const formatPrice = () => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };
  
  const handleDelete = () => {
    deleteSubscription(id || '');
    navigate('/dashboard');
  };
  
  return (
    <div className="container max-w-4xl mx-auto px-4 py-8 min-h-screen">
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
          <h1 className="text-3xl font-bold">{name}</h1>
        </div>
        
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
          <div className="text-muted-foreground">{provider}</div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              className="gap-1"
              onClick={() => navigate(`/edit/${id}`)}
            >
              <Edit className="h-4 w-4" />
              Edit
            </Button>
            
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  variant="destructive" 
                  size="sm"
                  className="gap-1"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Delete Subscription</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to delete {name}? This action cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button 
                    variant="outline" 
                    onClick={() => setDeleteDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={handleDelete}
                  >
                    Delete
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="glass-card p-6" style={{ borderLeftColor: color, borderLeftWidth: '4px' }}>
          <h2 className="text-lg font-medium mb-4">Subscription Details</h2>
          
          <div className="space-y-4">
            <div>
              <div className="text-sm text-muted-foreground">Price</div>
              <div className="text-xl font-medium">{formatPrice()}</div>
              <div className="text-sm text-muted-foreground">per {cycle === 'custom' ? 'period' : cycle.slice(0, -2)}</div>
            </div>
            
            <div>
              <div className="text-sm text-muted-foreground">Category</div>
              <div>{category.charAt(0).toUpperCase() + category.slice(1)}</div>
            </div>
            
            {description && (
              <div>
                <div className="text-sm text-muted-foreground">Description</div>
                <div>{description}</div>
              </div>
            )}
            
            {paymentMethod && (
              <div>
                <div className="text-sm text-muted-foreground">Payment Method</div>
                <div>{paymentMethod}</div>
              </div>
            )}
            
            <div>
              <div className="text-sm text-muted-foreground">Status</div>
              <div className={`${active ? 'text-green-600' : 'text-muted-foreground'}`}>
                {active ? 'Active' : 'Inactive'}
              </div>
            </div>
          </div>
        </div>
        
        <div className="glass-card p-6">
          <h2 className="text-lg font-medium mb-4">Important Dates</h2>
          
          <div className="space-y-4">
            <div>
              <div className="text-sm text-muted-foreground">Started On</div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{format(new Date(startDate), 'MMM d, yyyy')}</span>
              </div>
            </div>
            
            <div>
              <div className="text-sm text-muted-foreground">Next Payment</div>
              <div className="flex items-center gap-1">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <span>{format(nextBillingDate, 'MMM d, yyyy')}</span>
                <span className={`ml-1 text-xs px-2 py-0.5 rounded-full ${
                  daysUntilBilling <= 3 
                    ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' 
                    : daysUntilBilling <= 7
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                      : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                }`}>
                  {daysUntilBilling} days
                </span>
              </div>
            </div>
            
            {inTrial && (
              <div>
                <div className="text-sm text-muted-foreground">Trial Ends On</div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4 text-yellow-600" />
                  <span>{format(new Date(trialEndDate!), 'MMM d, yyyy')}</span>
                  <span className="ml-1 text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 px-2 py-0.5 rounded-full">
                    {trialDaysLeft} days left
                  </span>
                </div>
              </div>
            )}
            
            {endDate && (
              <div>
                <div className="text-sm text-muted-foreground">Ends On</div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{format(new Date(endDate), 'MMM d, yyyy')}</span>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="glass-card p-6">
          <h2 className="text-lg font-medium mb-4">Notifications</h2>
          
          {notifications.length > 0 ? (
            <div className="space-y-3">
              {notifications.map(notification => (
                <div 
                  key={notification.id}
                  className={`p-3 rounded-lg ${notification.enabled 
                    ? 'bg-primary/10' 
                    : 'bg-muted/50 text-muted-foreground'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="font-medium">
                      {notification.type === 'trial-ending' && 'Trial Ending Soon'}
                      {notification.type === 'payment-upcoming' && 'Payment Reminder'}
                      {notification.type === 'subscription-renewal' && 'Renewal Reminder'}
                      {notification.type === 'price-change' && 'Price Change Alert'}
                      {notification.type === 'custom' && 'Custom Alert'}
                    </div>
                    <div className="text-xs">
                      {notification.enabled ? (
                        <span className="bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                          Active
                        </span>
                      ) : (
                        <span className="bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                          Disabled
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center text-sm">
                    <Bell className="h-3 w-3 mr-1" />
                    <span>
                      {notification.daysInAdvance} {notification.daysInAdvance === 1 ? 'day' : 'days'} before
                    </span>
                  </div>
                  
                  {notification.message && (
                    <div className="mt-1 text-sm">
                      "{notification.message}"
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              No notifications set
            </div>
          )}
          
          <Button
            variant="outline"
            className="w-full mt-4"
            onClick={() => {
              toast.info('Notification settings will be implemented in future updates');
            }}
          >
            Manage Notifications
          </Button>
        </div>
      </div>
      
      <div className="glass-card p-6 mb-6">
        <h2 className="text-lg font-medium mb-4">Payment History</h2>
        <div className="text-center py-10 text-muted-foreground">
          <p>Payment history will be implemented in future updates</p>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionDetail;
