/**
 * Stripe Integration Service
 * § 31 Monetization
 *
 * Handles:
 * - Payment processing
 * - Subscription management
 * - Webhook handling (backend)
 */

import type { SubscriptionTier, PricingPlan } from '@/context/SubscriptionContext';

/**
 * Pricing plans configuration
 * Prices in base currency (THB)
 */
export const PRICING_PLANS: Record<SubscriptionTier, PricingPlan> = {
  free: {
    tier: 'free',
    name: 'Free',
    tagline: 'Discover Yourself',
    price: 0,
    currency: 'THB',
    billingPeriod: 'one-time',
    features: [
      'Basic chat with your Twin',
      'Core insights & reflections',
      'Hub access',
      'Single archetype',
      'Badge system',
      'Evolution milestones',
    ],
    cta: 'Getting Started',
    highlighted: false,
  },

  plus: {
    tier: 'plus',
    name: 'Plus',
    tagline: 'Know Yourself',
    price: 24900, // ฿249
    currency: 'THB',
    billingPeriod: 'monthly',
    features: [
      'Everything in Free',
      'Memory persistence (save conversations)',
      'Pattern detection (behavioral insights)',
      'Advanced analytics',
      'All 18 archetypes',
      'Voice daily briefs',
      'Decision guidance',
    ],
    cta: 'Start Plus',
    highlighted: true, // Most popular
  },

  pro: {
    tier: 'pro',
    name: 'Pro',
    tagline: 'Navigate Yourself',
    price: 58900, // ฿589
    currency: 'THB',
    billingPeriod: 'monthly',
    features: [
      'Everything in Plus',
      'Future self projection',
      'Journey roadmap',
      'Relationship insights',
      'Career intelligence',
      'Higher AI usage limits',
      'Priority email support',
    ],
    cta: 'Start Pro',
    highlighted: false,
  },

  lifetime: {
    tier: 'lifetime',
    name: 'Lifetime',
    tagline: 'Own Your Twin',
    price: 499000, // ฿4,990 (founder pricing)
    currency: 'THB',
    billingPeriod: 'one-time',
    features: [
      'Everything in Pro',
      'Unlimited AI usage',
      'Export Twin data & conversations',
      'Custom Twin training',
      'Priority 24/7 support',
      'VIP community access',
      'Lifetime updates',
    ],
    cta: 'Get Lifetime',
    highlighted: false,
  },
};

/**
 * Annual pricing (discount bundles)
 */
export const ANNUAL_PRICING = {
  plus: {
    annualPrice: 199000, // ฿1,990 (~28% discount)
    monthlyEquivalent: 16583,
    savings: 50900,
  },
  pro: {
    annualPrice: 499000, // ฿4,990 (~28% discount)
    monthlyEquivalent: 41583,
    savings: 118800,
  },
};

/**
 * Create Stripe checkout session
 * Redirects to Stripe Checkout
 *
 * @param tier - Subscription tier
 * @param billingPeriod - 'monthly' | 'annual'
 * @param userId - User ID for metadata
 */
export async function createCheckoutSession(
  tier: SubscriptionTier,
  billingPeriod: 'monthly' | 'annual',
  userId: string
): Promise<{ sessionId: string }> {
  try {
    // Call backend API to create Stripe session
    const response = await fetch('/api/stripe/create-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tier,
        billingPeriod,
        userId,
        returnUrl: `${window.location.origin}/pricing/success`,
      }),
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`Failed to create checkout session: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('[Stripe] Checkout creation failed:', error);
    throw error;
  }
}

/**
 * Create portal session for existing customers
 * Redirects to Stripe Billing Portal (manage subscription)
 *
 * @param userId - User ID
 */
export async function createPortalSession(userId: string): Promise<{ portalUrl: string }> {
  try {
    const response = await fetch('/api/stripe/create-portal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`Failed to create portal session: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('[Stripe] Portal creation failed:', error);
    throw error;
  }
}

/**
 * Get current subscription from backend
 * Calls Stripe API to fetch latest subscription status
 *
 * @param userId - User ID
 */
export async function getSubscriptionStatus(userId: string) {
  try {
    const response = await fetch(`/api/stripe/subscription?userId=${userId}`, {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch subscription: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('[Stripe] Subscription fetch failed:', error);
    throw error;
  }
}

/**
 * Log payment event (for analytics)
 */
export function logPaymentMetric(
  action: 'checkout_started' | 'payment_success' | 'payment_failed' | 'subscription_upgraded',
  tier: SubscriptionTier,
  metadata?: Record<string, any>
) {
  const timestamp = new Date().toISOString();
  console.log(`[Payment] ${action} → ${tier} at ${timestamp}`, metadata);

  // In production: send to analytics
  // analytics.track('payment_event', { action, tier, timestamp, ...metadata });
}

/**
 * Calculate pricing with discount
 */
export function calculatePrice(
  tier: SubscriptionTier,
  billingPeriod: 'monthly' | 'annual'
): { total: number; monthly: number; savings?: number } {
  const plan = PRICING_PLANS[tier];

  if (billingPeriod === 'monthly') {
    return { total: plan.price, monthly: plan.price };
  }

  // Annual pricing
  if (tier === 'plus') {
    return {
      total: ANNUAL_PRICING.plus.annualPrice,
      monthly: ANNUAL_PRICING.plus.monthlyEquivalent,
      savings: ANNUAL_PRICING.plus.savings,
    };
  }

  if (tier === 'pro') {
    return {
      total: ANNUAL_PRICING.pro.annualPrice,
      monthly: ANNUAL_PRICING.pro.monthlyEquivalent,
      savings: ANNUAL_PRICING.pro.savings,
    };
  }

  return { total: plan.price, monthly: plan.price };
}
