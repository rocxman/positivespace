'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-provider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Check, Sparkles, Zap, Crown } from 'lucide-react';
import { cn } from '@/lib/utils';

const plans = [
  {
    id: 'starter',
    name: 'Starter',
    price: 29000,
    credits: 100,
    description: 'Perfect for getting started',
    features: [
      '100 credits per month',
      'Basic genre selection',
      'Standard quality audio',
      '7-day song storage',
      'Email support',
    ],
    notIncluded: [
      'Priority generation',
      'High quality audio',
      'API access',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 79000,
    credits: 300,
    description: 'Best for regular creators',
    popular: true,
    features: [
      '300 credits per month',
      'All genres & moods',
      'High quality audio (320kbps)',
      '30-day song storage',
      'Priority generation',
      'Stem export (beta)',
      'Discord support',
    ],
    notIncluded: [
      'API access',
    ],
  },
  {
    id: 'unlimited',
    name: 'Unlimited',
    price: 199000,
    credits: -1,
    description: 'For power users & creators',
    features: [
      'Unlimited credits',
      'All genres & moods',
      'Lossless audio quality',
      'Unlimited storage',
      'Priority generation',
      'Full stem export',
      'API access (beta)',
      'Custom style training',
      'Dedicated support',
    ],
    notIncluded: [],
  },
];

const creditPackages = [
  { credits: 50, price: 15000, label: '50 credits' },
  { credits: 100, price: 25000, label: '100 credits' },
  { credits: 250, price: 50000, label: '250 credits' },
  { credits: 500, price: 90000, label: '500 credits' },
];

export default function BillingPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      setCurrentPlan(user.plan || 'free');
    }
  }, [user]);

  const handleSubscribe = async (planId: string) => {
    setIsProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setCurrentPlan(planId);
    setIsProcessing(false);
  };

  if (authLoading || !user) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Billing</h1>
        <p className="text-slate-400 mt-1">Manage your subscription and credits</p>
      </div>

      {currentPlan === 'free' && (
        <Card className="bg-gradient-to-r from-purple-900/30 to-slate-900/30 border-purple-500/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white">Current Plan: Free</h3>
                <p className="text-slate-400">10 free credits daily. Upgrade for more!</p>
              </div>
              <Badge className="bg-slate-700 text-slate-300">{user.credits} credits today</Badge>
            </div>
          </CardContent>
        </Card>
      )}

      <div>
        <h2 className="text-xl font-semibold text-white mb-4">Subscription Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={cn(
                'relative bg-slate-900/50 border-white/5',
                plan.popular && 'border-purple-500 ring-2 ring-purple-500/20'
              )}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-600 text-white">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Most Popular
                </Badge>
              )}
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  {plan.id === 'unlimited' ? (
                    <Crown className="w-5 h-5 text-yellow-400" />
                  ) : plan.id === 'pro' ? (
                    <Zap className="w-5 h-5 text-purple-400" />
                  ) : null}
                  {plan.name}
                </CardTitle>
                <CardDescription className="text-slate-400">{plan.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <span className="text-3xl font-bold text-white">{formatPrice(plan.price)}</span>
                  <span className="text-slate-400">/month</span>
                </div>
                <div className="mb-6 text-sm">
                  <span className="text-purple-400 font-medium">
                    {plan.credits === -1 ? 'Unlimited' : `${plan.credits} credits`}
                  </span>
                  <span className="text-slate-400"> per month</span>
                </div>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-slate-300">
                      <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                  {plan.notIncluded.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-slate-600">
                      <span className="w-4 h-4 flex-shrink-0">×</span>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={isProcessing || currentPlan === plan.id}
                  className={cn(
                    'w-full',
                    plan.popular
                      ? 'bg-purple-600 hover:bg-purple-700 text-white'
                      : 'bg-slate-800 hover:bg-slate-700 text-white',
                    currentPlan === plan.id && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  {currentPlan === plan.id ? (
                    'Current Plan'
                  ) : isProcessing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Subscribe'
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold text-white mb-4">One-time Credit Packages</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {creditPackages.map((pkg) => (
            <Card key={pkg.credits} className="bg-slate-900/50 border-white/5">
              <CardContent className="pt-6 text-center">
                <div className="text-2xl font-bold text-white mb-1">{pkg.credits}</div>
                <div className="text-sm text-slate-400 mb-3">credits</div>
                <div className="text-lg font-semibold text-purple-400 mb-4">{formatPrice(pkg.price)}</div>
                <Button
                  variant="outline"
                  className="w-full border-slate-700 text-slate-300 hover:bg-slate-800"
                  disabled={isProcessing}
                >
                  {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Purchase'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Card className="bg-slate-900/50 border-white/5">
        <CardHeader>
          <CardTitle className="text-white">Payment History</CardTitle>
          <CardDescription className="text-slate-400">Your recent transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-slate-500">
            No transactions yet
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
