import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle, Bell, CalendarClock, Sparkles } from 'lucide-react';
import AnimatedTransition from '@/components/AnimatedTransition';
import FloatingText from '@/components/FloatingText';

const Index: React.FC = () => {
  const navigate = useNavigate();
  return <AnimatedTransition location="index" className="min-h-screen">
      <div className="flex flex-col min-h-screen">
        <header className="container max-w-7xl mx-auto px-4 py-6">
          <nav className="flex justify-between items-center">
            <div className="text-xl font-medium text-gradient">SubscribeAI</div>
            <div>
              <Button variant="ghost" className="mr-2" onClick={() => navigate('/settings')}>
                Settings
              </Button>
              <Button onClick={() => navigate('/dashboard')}>
                Dashboard <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </nav>
        </header>
        
        <main className="flex-grow">
          <section className="py-20 md:py-32 relative">
            <FloatingText text="XYZ.com $19.00/month" color="#8B5CF6" speed={0.1} size="md" />
            <FloatingText text="ABC.io $29.99/month" color="#0EA5E9" speed={0.15} size="md" />
            <FloatingText text="StreamFlix $14.99/month" color="#F97316" speed={0.12} size="sm" />
            <FloatingText text="MusicLoop $9.99/month" color="#D946EF" speed={0.08} size="sm" />
            <FloatingText text="CloudStore $5.00/month" color="#0EA5E9" speed={0.11} size="md" />
            <FloatingText text="NewsDaily $7.50/month" color="#8B5CF6" speed={0.09} size="lg" />
            
            <div className="container max-w-7xl mx-auto px-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div className="space-y-6 relative">
                  <div className="inline-block mb-2">
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary">
                      Hassle-free subscription tracking
                    </span>
                  </div>
                  <h1 className="text-5xl font-bold tracking-tight leading-tight md:text-4xl">
                    Free Trials Fumbled? Old Subscriptions Forgotten? Meet Agents SubLedger & SubSnipe—Your AI Dream Team.
                  </h1>
                  <p className="text-xl text-muted-foreground">
                    SubscribeAI keeps track of all your subscriptions and notifies you of important dates, so you can focus on what matters.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 pt-2">
                    <Button size="lg" className="px-8" onClick={() => navigate('/dashboard')}>
                      Get Started <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                    <Button size="lg" variant="outline" className="px-8" onClick={() => navigate('/add')}>
                      Add Subscription
                    </Button>
                  </div>
                  
                  {/* SubLedger agent - reduced size and adjusted position */}
                  <div className="absolute bottom-[-220px] left-[10%] z-10 w-[280px] md:w-[320px]">
                    <img src="/lovable-uploads/9ae4b7af-790c-448b-a8a1-64848152e948.png" alt="SubLedger Agent" className="w-full h-auto object-contain" />
                  </div>
                </div>
                
                <div className="order-first md:order-last relative">
                  {/* SubSnipe agent - significantly reduced size and repositioned */}
                  <div className="absolute top-[-100px] right-[60%] z-10 w-[80px] md:w-[100px] transform rotate-0">
                    <img src="/lovable-uploads/e10d332d-84b8-40ec-b7c2-1052a7f181a9.png" alt="SubSnipe Agent" className="w-full h-auto object-contain" />
                  </div>
                  <div className="relative">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-primary rounded-2xl blur-lg opacity-50"></div>
                    <div className="glass-card p-6 relative rounded-2xl overflow-hidden border border-white/20">
                      <img src="/lovable-uploads/6b00ff42-f124-4fa2-a352-61c102b7a6fd.png" alt="Dashboard preview" className="rounded-xl shadow-lg w-full" onError={e => {
                      const target = e.target as HTMLImageElement;
                      target.src = "https://i.imgur.com/qqLCJwn.png";
                      target.onerror = null;
                    }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
          
          <section className="py-16 bg-muted/30">
            <div className="container max-w-7xl mx-auto px-4">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4">How It Works</h2>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  Our AI-powered subscription tracker makes managing your subscriptions effortless
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="glass-card-hover p-6">
                  <div className="mb-4 rounded-full bg-primary/10 p-3 w-12 h-12 flex items-center justify-center">
                    <Sparkles className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-medium mb-2">Voice & Text Input</h3>
                  <p className="text-muted-foreground">
                    Simply describe your subscription using voice or text, and our AI will extract all the important details.
                  </p>
                </div>
                
                <div className="glass-card-hover p-6">
                  <div className="mb-4 rounded-full bg-primary/10 p-3 w-12 h-12 flex items-center justify-center">
                    <CalendarClock className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-medium mb-2">Smart Tracking</h3>
                  <p className="text-muted-foreground">
                    We keep track of all your subscription details, including billing cycles, trial periods, and renewal dates.
                  </p>
                </div>
                
                <div className="glass-card-hover p-6">
                  <div className="mb-4 rounded-full bg-primary/10 p-3 w-12 h-12 flex items-center justify-center">
                    <Bell className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-medium mb-2">Timely Notifications</h3>
                  <p className="text-muted-foreground">
                    Receive customized alerts for trial end dates, upcoming payments, and subscription renewals.
                  </p>
                </div>
              </div>
            </div>
          </section>
          
          <section className="py-16">
            <div className="container max-w-7xl mx-auto px-4">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4">Key Features</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {["Voice & text input for easy data entry", "AI-powered detail extraction", "Free trial period tracking", "Renewal reminders", "Payment notifications", "Subscription analytics", "Customizable alerts", "Clean, intuitive interface"].map((feature, index) => <div key={index} className="flex items-start p-4">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <p>{feature}</p>
                  </div>)}
              </div>
            </div>
          </section>
          
          <section className="py-16 bg-primary/5">
            <div className="container max-w-3xl mx-auto px-4 text-center">
              <h2 className="text-3xl font-bold mb-6">Ready to get started?</h2>
              <p className="text-xl text-muted-foreground mb-8">
                Join thousands of users who have simplified their subscription management
              </p>
              <Button size="lg" className="px-8" onClick={() => navigate('/dashboard')}>
                Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </section>
        </main>
        
        <footer className="bg-muted/30 py-10">
          <div className="container max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <div className="text-xl font-medium text-gradient mb-2">SubscribeAI</div>
                <p className="text-muted-foreground">
                  The hassle-free subscription tracker
                </p>
              </div>
              <div className="text-right text-muted-foreground text-sm">
                &copy; {new Date().getFullYear()} SubscribeAI. All rights reserved.
              </div>
            </div>
          </div>
        </footer>
      </div>
    </AnimatedTransition>;
};
export default Index;
