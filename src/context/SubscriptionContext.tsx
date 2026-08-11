import React, { createContext, useContext, useState, useEffect } from 'react';
import { getSubscriptionStatus } from '@/services/stripeService';
import { useAuth } from '@/hooks/useAuth';

/**
 * § 31 Monetization
 * § 32 Monetize Depth, not Identity
 *
 * 4-tier model:
 * - Free: Discover Yourself (basic identity free)
 * - Plus: Know Yourself (฿249/month)
 * - Pro: Navigate Yourself (฿589/month)
 * - Lifetime: Own Your Twin (฿4,900-7,900 one-time)
 */

export type SubscriptionTier = 'free' | 'plus' | 'pro' | 'lifetime';

export interface SubscriptionStatus {
  tier: SubscriptionTier;
  status: 'active' | 'expired' | 'cancelled' | 'pending';
  startDate?: string; // ISO timestamp
  expiresAt?: string; // ISO timestamp (null for lifetime)
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
}

export interface PricingPlan {
  tier: SubscriptionTier;
  name: string;
  tagline: string;
  price: number; // in base currency (e.g., cents for USD)
  currency: string;
  billingPeriod: 'monthly' | 'annual' | 'one-time';
  features: string[];
  cta: string;
  highlighted?: boolean;
}

interface SubscriptionContextType {
  // Current subscription
  subscription: SubscriptionStatus;

  // Check if feature is available
  canAccess: (feature: string) => boolean;

  // Get tier level (for comparisons)
  getTierLevel: (tier: SubscriptionTier) => number;

  // Update subscription (from Stripe webhook)
  updateSubscription: (status: SubscriptionStatus) => void;

  // Check if on trial
  isTrialing: boolean;

  // Remaining days (for trial or expiring subscription)
  daysRemaining: number | null;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

/**
 * Feature availability mapping
 * Based on tier (implements §32: monetize depth, not identity)
 */
const FEATURE_AVAILABILITY: Record<SubscriptionTier, Set<string>> = {
  free: new Set([
    // Basic identity (FREE)
    'basic-chat',
    'basic-insights',
    'hub-access',
    'one-archetype',
    'badge-system',
    'daily-brief-text',

    // §15: All tiers get feedback loop
    'feedback-loop',

    // §14: All tiers get evidence labels
    'evidence-labels',

    // §28: All tiers get popups
    'contextual-popups',

    // §30: All tiers get evolution
    'twin-evolution-scene',
  ]),

  plus: new Set([
    // All free features
    ...['basic-chat', 'basic-insights', 'hub-access', 'one-archetype', 'badge-system', 'daily-brief-text', 'feedback-loop', 'evidence-labels', 'contextual-popups', 'twin-evolution-scene'],

    // Plus additions (Know Yourself - Depth)
    'memory-persistence', // Save responses across sessions
    'pattern-detection', // Detect behavioral patterns
    'advanced-analytics', // Deeper insights
    'full-archetypes', // All 18 archetypes
    'daily-brief-audio', // Voice dailies
    'decision-guidance', // Decision support
  ]),

  pro: new Set([
    // All plus features
    ...[
      'basic-chat',
      'basic-insights',
      'hub-access',
      'one-archetype',
      'badge-system',
      'daily-brief-text',
      'feedback-loop',
      'evidence-labels',
      'contextual-popups',
      'twin-evolution-scene',
      'memory-persistence',
      'pattern-detection',
      'advanced-analytics',
      'full-archetypes',
      'daily-brief-audio',
      'decision-guidance',
    ],

    // Pro additions (Navigate Yourself - Advanced)
    'future-self', // See projected future
    'journey-roadmap', // Life direction clarity
    'relationship-insights', // Deep relational analysis
    'career-intelligence', // Career guidance
    'advanced-ai-usage', // Higher API quota
    'priority-support',
  ]),

  lifetime: new Set([
    // All pro features
    ...[
      'basic-chat',
      'basic-insights',
      'hub-access',
      'one-archetype',
      'badge-system',
      'daily-brief-text',
      'feedback-loop',
      'evidence-labels',
      'contextual-popups',
      'twin-evolution-scene',
      'memory-persistence',
      'pattern-detection',
      'advanced-analytics',
      'full-archetypes',
      'daily-brief-audio',
      'decision-guidance',
      'future-self',
      'journey-roadmap',
      'relationship-insights',
      'career-intelligence',
      'advanced-ai-usage',
      'priority-support',
    ],

    // Lifetime only (Own Your Twin)
    'unlimited-ai-usage',
    'personal-ai-twin-export', // Download Twin data
    'custom-twin-training', // Fine-tune Twin
    'vip-features',
  ]),
};

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { session, loading } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionStatus>(() => {
    // Load from localStorage as cache
    const stored = localStorage.getItem('selfprint-subscription');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (error) {
        console.error('Failed to load subscription from cache:', error);
      }
    }

    // Default: free tier
    return {
      tier: 'free',
      status: 'active',
    };
  });

  // Fetch subscription from API when auth session changes
  useEffect(() => {
    if (loading || !session?.access_token) {
      // User not authenticated — stay on free tier
      setSubscription({
        tier: 'free',
        status: 'active',
      });
      return;
    }

    (async () => {
      try {
        const data = await getSubscriptionStatus(session.access_token);
        const newSubscription: SubscriptionStatus = {
          tier: data.tier || 'free',
          status: data.status || 'active',
          expiresAt: data.expiresAt,
          stripeCustomerId: data.stripeCustomerId,
          stripeSubscriptionId: data.stripeSubscriptionId,
        };
        setSubscription(newSubscription);
      } catch (error) {
        console.error('[Subscription] Failed to fetch subscription:', error);
        // Keep cached subscription on error
      }
    })();
  }, [session?.access_token, loading]);

  // Persist subscription to localStorage as cache
  useEffect(() => {
    localStorage.setItem('selfprint-subscription', JSON.stringify(subscription));
  }, [subscription]);

  // Check if currently trialing
  const isTrialing = subscription.status === 'pending';

  // Calculate days remaining
  const daysRemaining = subscription.expiresAt
    ? Math.ceil((new Date(subscription.expiresAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null;

  const canAccess = (feature: string): boolean => {
    const features = FEATURE_AVAILABILITY[subscription.tier];
    return features.has(feature);
  };

  const getTierLevel = (tier: SubscriptionTier): number => {
    const levels: Record<SubscriptionTier, number> = {
      free: 0,
      plus: 1,
      pro: 2,
      lifetime: 3,
    };
    return levels[tier];
  };

  const updateSubscription = (status: SubscriptionStatus) => {
    setSubscription(status);
    console.log(`[Subscription] Updated to ${status.tier} (${status.status})`);
  };

  return (
    <SubscriptionContext.Provider
      value={{
        subscription,
        canAccess,
        getTierLevel,
        updateSubscription,
        isTrialing,
        daysRemaining: daysRemaining && daysRemaining > 0 ? daysRemaining : null,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within SubscriptionProvider');
  }
  return context;
};
