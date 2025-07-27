import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle, Users, Shield, Clock, Sparkles, Bell, CalendarClock, Brain, Target, DollarSign, Timer, Zap } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import AnimatedTransition from '@/components/AnimatedTransition';
import FloatingText from '@/components/FloatingText';
import { useSignupCounter } from '@/hooks/useSignupCounter';

const Index: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { count, remaining, isAlmostFull, percentageFilled } = useSignupCounter();
  
  const handleGetStarted = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      // User needs to sign in/up first - they'll be redirected to auth form by ProtectedRoute
      navigate('/dashboard');
    }
  };

  const handleAddSubscription = () => {
    if (user) {
      navigate('/add');
    } else {
      // User needs to sign in/up first - they'll be redirected to auth form by ProtectedRoute
      navigate('/add');
    }
  };
  
  return (
    <AnimatedTransition location="index" className="min-h-screen">
      <div className="flex flex-col min-h-screen">
        <header className="container max-w-7xl mx-auto px-4 py-6">
          <nav className="flex justify-between items-center">
            <div className="text-xl font-medium text-gradient">SubscriptionSniper</div>
            <div>
              <Button variant="ghost" className="mr-2" onClick={() => navigate('/settings')}>
                Settings
              </Button>
              <Button onClick={handleGetStarted}>
                {user ? 'Dashboard' : 'Get Started'} <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </nav>
        </header>
        
        <main className="flex-grow">
          {/* Hero Section */}
          <section className="py-20 md:py-32 relative">
            <FloatingText text="XYZ.com $19.00/month" color="#8B5CF6" speed={0.1} size="md" />
            <FloatingText text="StreamFlix $14.99/month" color="#F97316" speed={0.12} size="sm" />
            <FloatingText text="CloudStore $5.00/month" color="#0EA5E9" speed={0.11} size="md" />
            <FloatingText text="NewsDaily $7.50/month" color="#8B5CF6" speed={0.09} size="lg" />
            
            <div className="container max-w-7xl mx-auto px-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div className="space-y-8 relative">
                  <div className="inline-block mb-4">
                    <span className="px-4 py-2 rounded-full text-sm font-medium bg-primary/10 text-primary border border-primary/20">
                      🎯 Smart AI-Powered Tracking
                    </span>
                  </div>
                  <h1 className="text-5xl md:text-6xl font-bold tracking-tight leading-tight">
                    Your Subscriptions Are Out of Control
                    <br />
                    And It's Costing You Thousands
                  </h1>
                  <p className="text-xl text-muted-foreground leading-relaxed">
                    Right now, forgotten free trials are converting to paid plans. Unused apps are auto-renewing. Dead subscriptions are bleeding you dry. SubscriptionSniper stops the madness before your next billing cycle.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <Button size="lg" className="px-8 py-3 text-lg" onClick={handleGetStarted}>
                      {user ? 'Go to Dashboard' : 'Start Free'} <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                    <Button size="lg" variant="outline" className="px-8 py-3 text-lg" onClick={handleAddSubscription}>
                      {user ? 'Add Subscription' : 'See How It Works'}
                    </Button>
                  </div>
                </div>
                
                <div className="order-first md:order-last relative">
                  <div className="relative">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-primary rounded-2xl blur-lg opacity-50"></div>
                    <div className="glass-card p-6 relative rounded-2xl overflow-hidden border border-white/20">
                      <img 
                        src="/lovable-uploads/6b00ff42-f124-4fa2-a352-61c102b7a6fd.png" 
                        alt="Dashboard preview" 
                        className="rounded-xl shadow-lg w-full" 
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "https://i.imgur.com/qqLCJwn.png";
                          target.onerror = null;
                        }} 
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
          
          {/* Value Proposition Section */}
          <section className="py-16 bg-gradient-to-b from-muted/30 to-background">
            <div className="container max-w-7xl mx-auto px-4">
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 text-green-700 text-sm font-medium mb-6">
                  <Users className="h-4 w-4" />
                  Trusted by 10,000+ users managing $2M+ in subscriptions
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center space-y-4">
                  <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <DollarSign className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold">Save Money</h3>
                  <p className="text-muted-foreground">Never pay for forgotten subscriptions. Users save an average of $200/year.</p>
                </div>
                
                <div className="text-center space-y-4">
                  <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <Target className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold">Stay Organized</h3>
                  <p className="text-muted-foreground">All your subscriptions in one smart dashboard with intelligent categorization.</p>
                </div>
                
                <div className="text-center space-y-4">
                  <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                    <Shield className="h-8 w-8 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-semibold">Peace of Mind</h3>
                  <p className="text-muted-foreground">Smart alerts keep you informed. Never be surprised by charges again.</p>
                </div>
              </div>
            </div>
          </section>
          
          {/* How It Works - Benefits First */}
          <section className="py-20">
            <div className="container max-w-7xl mx-auto px-4">
              <div className="text-center mb-16">
                <h2 className="text-4xl font-bold mb-6">How SubscriptionSniper Works</h2>
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                  Three simple steps to take complete control of your subscriptions
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                <div className="text-center space-y-6">
                  <div className="mx-auto w-20 h-20 bg-gradient-to-br from-primary/20 to-primary/40 rounded-2xl flex items-center justify-center">
                    <Target className="h-10 w-10 text-primary" />
                  </div>
                  <div className="space-y-3">
                    <div className="text-sm font-medium text-primary">Step 1</div>
                    <h3 className="text-2xl font-bold">Quick Setup</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Add your subscription details with our intuitive interface. No tedious forms or manual data entry required.
                    </p>
                  </div>
                </div>
                
                <div className="text-center space-y-6">
                  <div className="mx-auto w-20 h-20 bg-gradient-to-br from-primary/20 to-primary/40 rounded-2xl flex items-center justify-center">
                    <Brain className="h-10 w-10 text-primary" />
                  </div>
                  <div className="space-y-3">
                    <div className="text-sm font-medium text-primary">Step 2</div>
                    <h3 className="text-2xl font-bold">Intelligent Monitoring</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      We track every detail—billing cycles, trial periods, renewal dates—so you can focus on what matters most to you.
                    </p>
                  </div>
                </div>
                
                <div className="text-center space-y-6">
                  <div className="mx-auto w-20 h-20 bg-gradient-to-br from-primary/20 to-primary/40 rounded-2xl flex items-center justify-center">
                    <Bell className="h-10 w-10 text-primary" />
                  </div>
                  <div className="space-y-3">
                    <div className="text-sm font-medium text-primary">Step 3</div>
                    <h3 className="text-2xl font-bold">Proactive Alerts</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Get notified before charges hit your account. Never be surprised by unexpected payments again.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
          
          {/* Why Choose SubscribeAI */}
          <section className="py-20 bg-muted/30">
            <div className="container max-w-7xl mx-auto px-4">
              <div className="text-center mb-16">
                <h2 className="text-4xl font-bold mb-6">Why Choose SubscriptionSniper?</h2>
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                  Advanced AI technology meets user-friendly design for the ultimate subscription management experience
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <div className="glass-card-hover p-6 space-y-4">
                  <Sparkles className="h-8 w-8 text-primary" />
                  <h3 className="text-lg font-semibold">Smart Input</h3>
                  <p className="text-muted-foreground">Add subscriptions quickly with our intelligent input system—streamlined and efficient.</p>
                </div>
                
                <div className="glass-card-hover p-6 space-y-4">
                  <Sparkles className="h-8 w-8 text-primary" />
                  <h3 className="text-lg font-semibold">Smart AI Processing</h3>
                  <p className="text-muted-foreground">Advanced technology that understands your subscriptions automatically and extracts key details.</p>
                </div>
                
                <div className="glass-card-hover p-6 space-y-4">
                  <Clock className="h-8 w-8 text-primary" />
                  <h3 className="text-lg font-semibold">Free Trial Protection</h3>
                  <p className="text-muted-foreground">Never lose money on forgotten free trials again with intelligent trial period tracking.</p>
                </div>
                
                <div className="glass-card-hover p-6 space-y-4">
                  <CalendarClock className="h-8 w-8 text-primary" />
                  <h3 className="text-lg font-semibold">Smart Reminders</h3>
                  <p className="text-muted-foreground">Customized alerts for renewals, payments, and trial endings delivered exactly when you need them.</p>
                </div>
                
                <div className="glass-card-hover p-6 space-y-4">
                  <Target className="h-8 w-8 text-primary" />
                  <h3 className="text-lg font-semibold">Spending Analytics</h3>
                  <p className="text-muted-foreground">Detailed insights into your subscription spending patterns and optimization recommendations.</p>
                </div>
                
                <div className="glass-card-hover p-6 space-y-4">
                  <Shield className="h-8 w-8 text-primary" />
                  <h3 className="text-lg font-semibold">Secure & Private</h3>
                  <p className="text-muted-foreground">Bank-level security with end-to-end encryption for all your subscription data.</p>
                </div>
                
                <div className="glass-card-hover p-6 space-y-4">
                  <Users className="h-8 w-8 text-primary" />
                  <h3 className="text-lg font-semibold">Family Sharing</h3>
                  <p className="text-muted-foreground">Share and manage family subscriptions with role-based access and spending limits.</p>
                </div>
                
                <div className="glass-card-hover p-6 space-y-4">
                  <CheckCircle className="h-8 w-8 text-primary" />
                  <h3 className="text-lg font-semibold">Intuitive Interface</h3>
                  <p className="text-muted-foreground">Clean, modern design that makes subscription management effortless and enjoyable.</p>
                </div>
              </div>
            </div>
          </section>
          
          {/* Social Proof/Testimonials */}
          <section className="py-20">
            <div className="container max-w-7xl mx-auto px-4">
              <div className="text-center mb-16">
                <h2 className="text-4xl font-bold mb-6">Loved by Thousands</h2>
                <p className="text-xl text-muted-foreground">See what our users are saying about SubscriptionSniper</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="glass-card p-8 space-y-4">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="w-4 h-4 bg-yellow-400 rounded-full"></div>
                    ))}
                  </div>
                  <p className="text-muted-foreground italic">
                    "SubscriptionSniper saved me over $300 this year by catching subscriptions I forgot about. The smart tracking is incredibly convenient!"
                  </p>
                  <div className="pt-4 border-t">
                    <p className="font-semibold">Sarah Chen</p>
                    <p className="text-sm text-muted-foreground">Product Manager</p>
                  </div>
                </div>
                
                <div className="glass-card p-8 space-y-4">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="w-4 h-4 bg-yellow-400 rounded-full"></div>
                    ))}
                  </div>
                  <p className="text-muted-foreground italic">
                    "Finally, a subscription tracker that actually works! The AI agents make it feel like having a personal assistant."
                  </p>
                  <div className="pt-4 border-t">
                    <p className="font-semibold">Marcus Rodriguez</p>
                    <p className="text-sm text-muted-foreground">Freelance Designer</p>
                  </div>
                </div>
                
                <div className="glass-card p-8 space-y-4">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="w-4 h-4 bg-yellow-400 rounded-full"></div>
                    ))}
                  </div>
                  <p className="text-muted-foreground italic">
                    "The free trial alerts alone have paid for themselves. No more unexpected charges on my credit card!"
                  </p>
                  <div className="pt-4 border-t">
                    <p className="font-semibold">Emily Watson</p>
                    <p className="text-sm text-muted-foreground">Small Business Owner</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
          
          {/* Pricing Section */}
          <section className="py-20 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
            <div className="container max-w-5xl mx-auto px-4">
              <div className="text-center mb-16">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                  <Timer className="h-4 w-4" />
                  Limited Time Offer
                </div>
                <h2 className="text-4xl font-bold mb-6">Simple Pricing, Lifetime Value</h2>
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                  Start free, then secure your lifetime access with our early adopter special
                </p>
              </div>
              
              <div className="relative max-w-2xl mx-auto">
                {/* FOMO Counter Bar */}
                <div className="mb-8 p-6 glass-card rounded-2xl border border-primary/20">
                  <div className="text-center mb-4">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Zap className={`h-5 w-5 ${isAlmostFull ? 'text-orange-500' : 'text-primary'}`} />
                      <span className="text-lg font-semibold">
                        {remaining.toLocaleString()} spots remaining for early adopters
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {count.toLocaleString()} out of 2,500 lifetime deals claimed
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="relative w-full bg-muted rounded-full h-3 overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-1000 ${
                        isAlmostFull 
                          ? 'bg-gradient-to-r from-orange-400 to-red-500' 
                          : 'bg-gradient-to-r from-primary to-primary/70'
                      }`}
                      style={{ width: `${percentageFilled}%` }}
                    ></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-50"></div>
                  </div>
                  
                  {isAlmostFull && (
                    <div className="mt-3 text-center">
                      <span className="text-sm font-medium text-orange-600 bg-orange-100 px-3 py-1 rounded-full">
                        🔥 Almost sold out!
                      </span>
                    </div>
                  )}
                </div>
                
                {/* Pricing Card */}
                <div className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-primary to-primary/60 rounded-3xl blur-lg opacity-30"></div>
                  <div className="glass-card p-8 rounded-3xl border border-primary/30 relative overflow-hidden">
                    <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-4 py-2 rounded-bl-2xl font-medium text-sm">
                      Early Adopter Special
                    </div>
                    
                    <div className="text-center space-y-6 pt-4">
                      <div>
                        <h3 className="text-2xl font-bold mb-2">SubscriptionSniper Lifetime</h3>
                        <p className="text-muted-foreground">Everything you need to master your subscriptions</p>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                          <span className="line-through">Regular: $149.99</span>
                        </div>
                        <div className="text-5xl font-bold text-primary">$49.99</div>
                        <div className="text-lg font-medium text-muted-foreground">One-time payment • Lifetime access</div>
                      </div>
                      
                      <div className="space-y-3 text-left">
                        <div className="flex items-center gap-3">
                          <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                          <span>3-day free trial (no credit card required)</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                          <span>Unlimited subscription tracking</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                          <span>AI-powered smart tracking & processing</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                          <span>Smart notifications & alerts</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                          <span>Advanced analytics & insights</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                          <span>Priority customer support</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                          <span>All future updates included</span>
                        </div>
                      </div>
                      
                      <div className="pt-4">
                        <Button 
                          size="lg" 
                          className="w-full px-8 py-4 text-lg font-semibold" 
                          onClick={handleGetStarted}
                        >
                          {user ? 'Go to Dashboard' : 'Start Free Trial'} <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                        <p className="text-xs text-muted-foreground mt-3 text-center">
                          Try free for 3 days, then secure your lifetime deal
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="text-center mt-8 space-y-2">
                  <p className="text-sm text-muted-foreground">
                    🔒 Secure payment • 💝 30-day money-back guarantee • 🚀 Instant access
                  </p>
                  <p className="text-xs text-muted-foreground">
                    After 2,500 early adopters, price increases to $149.99
                  </p>
                </div>
              </div>
            </div>
          </section>
          
          {/* Final CTA */}
          <section className="py-20 bg-gradient-to-r from-primary/5 to-primary/10">
            <div className="container max-w-4xl mx-auto px-4 text-center">
              <h2 className="text-4xl font-bold mb-6">Ready to Take Control?</h2>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                Join thousands of users who've eliminated subscription surprises and taken control of their recurring payments.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="px-12 py-4 text-lg" onClick={handleGetStarted}>
                  {user ? 'Go to Dashboard' : 'Start Free Today'} <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button size="lg" variant="outline" className="px-12 py-4 text-lg" onClick={handleAddSubscription}>
                  {user ? 'Add Subscription' : 'Add Your First Subscription'}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-6">
                No credit card required • Free forever • Setup in under 2 minutes
              </p>
            </div>
          </section>
        </main>
        
        <footer className="bg-muted/30 py-12">
          <div className="container max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
              <div>
                <div className="text-xl font-medium text-gradient mb-3">SubscriptionSniper</div>
                <p className="text-muted-foreground">
                  The smart way to manage subscriptions
                </p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Shield className="h-4 w-4" />
                  <span>Your data is secure and encrypted</span>
                </div>
              </div>
              <div className="text-right text-muted-foreground text-sm">
                &copy; {new Date().getFullYear()} SubscriptionSniper. All rights reserved.
              </div>
            </div>
          </div>
        </footer>
      </div>
    </AnimatedTransition>
  );
};

export default Index;
