import { useContext } from 'react';
import { useSubscription } from '@/context/SubscriptionContext';
import { createCheckoutSession, createPortalSession, PRICING_PLANS, calculatePrice } from '@/services/stripeService';
import { AuthContext } from '@/context/AuthContext';

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
  const auth = useContext(AuthContext);

  /**
   * Start checkout flow
   */
  const startCheckout = async (tier: 'plus' | 'pro' | 'lifetime', billingPeriod: 'monthly' | 'annual' = 'monthly') => {
    try {
      // userId ต้องมาจาก auth session เท่านั้น — ห้ามใช้ localStorage
      const userId = auth?.session?.user?.id;
      if (!userId) {
        console.error('[Pricing] User not authenticated, redirect to onboarding');
        window.location.href = '/onboarding';
        return;
      }

      const { sessionId } = await createCheckoutSession(tier, billingPeriod, userId);
      window.location.href = `https://checkout.stripe.com/pay/${sessionId}`;
    } catch (error) {
      console.error('[Pricing] Checkout failed:', error);
      alert('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
    }
  };

  /**
   * Open billing portal (manage subscription)
   */
  const managePlan = async () => {
    try {
      // userId ต้องมาจาก auth session เท่านั้น — ห้ามใช้ localStorage
      const userId = auth?.session?.user?.id;
      if (!userId) {
        console.error('[Pricing] User not authenticated');
        window.location.href = '/onboarding';
        return;
      }

      const { portalUrl } = await createPortalSession(userId);
      window.location.href = portalUrl;
    } catch (error) {
      console.error('[Pricing] Portal failed:', error);
      alert('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
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
