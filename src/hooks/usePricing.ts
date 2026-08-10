import { useSubscription } from '@/context/SubscriptionContext';
import { createCheckoutSession, createPortalSession, PRICING_PLANS, calculatePrice } from '@/services/stripeService';

/**
 * Hook for Pricing & Subscription Integration
 * § 31: Monetization
 *
 * Usage:
 * ```tsx
 * function PricingPage() {
 *   const { tier, canAccess, startCheckout, managePlan } = usePricing();
 *
 *   if (!canAccess('advanced-analytics')) {
 *     return <UpgradePrompt />;
 *   }
 * }
 * ```
 */

export function usePricing() {
  const { subscription, canAccess, getTierLevel, isTrialing, daysRemaining } = useSubscription();

  /**
   * Start checkout flow
   */
  const startCheckout = async (tier: 'plus' | 'pro' | 'lifetime', billingPeriod: 'monthly' | 'annual' = 'monthly') => {
    try {
      // Get user ID from auth context (assuming available)
      const userId = localStorage.getItem('selfprint-user-id');
      if (!userId) {
        console.error('[Pricing] User ID not found, redirect to login');
        window.location.href = '/login';
        return;
      }

      const { sessionId } = await createCheckoutSession(tier, billingPeriod, userId);

      // Redirect to Stripe Checkout
      // In real implementation: load Stripe.js and redirect
      window.location.href = `https://checkout.stripe.com/pay/${sessionId}`;
    } catch (error) {
      console.error('[Pricing] Checkout failed:', error);
      alert('Failed to start checkout. Please try again.');
    }
  };

  /**
   * Open billing portal (manage subscription)
   */
  const managePlan = async () => {
    try {
      const userId = localStorage.getItem('selfprint-user-id');
      if (!userId) {
        console.error('[Pricing] User ID not found');
        return;
      }

      const { portalUrl } = await createPortalSession(userId);
      window.location.href = portalUrl;
    } catch (error) {
      console.error('[Pricing] Portal failed:', error);
      alert('Failed to open billing portal. Please try again.');
    }
  };

  /**
   * Check if can upgrade (useful for UI logic)
   */
  const canUpgrade = (targetTier: 'plus' | 'pro' | 'lifetime') => {
    return getTierLevel(targetTier) > getTierLevel(subscription.tier);
  };

  /**
   * Get current plan info
   */
  const currentPlan = PRICING_PLANS[subscription.tier];

  /**
   * Get all available plans
   */
  const allPlans = PRICING_PLANS;

  return {
    // Current state
    tier: subscription.tier,
    status: subscription.status,
    plan: currentPlan,
    isTrialing,
    daysRemaining,

    // Available actions
    canAccess,
    canUpgrade,
    startCheckout,
    managePlan,

    // Pricing data
    allPlans,
    calculatePrice,

    // Helper: Get tier level for comparison
    getTierLevel,
  };
}

/**
 * Component wrapper for feature gating
 * Shows paywall if feature requires higher tier
 */
export function useFeaturedAccess(feature: string) {
  const { canAccess, tier, startCheckout } = usePricing();

  const hasAccess = canAccess(feature);

  const requestAccess = (preferredTier: 'plus' | 'pro' = 'plus') => {
    startCheckout(preferredTier);
  };

  return { hasAccess, tier, requestAccess };
}
