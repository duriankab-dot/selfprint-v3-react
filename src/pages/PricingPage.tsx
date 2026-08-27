/**
 * PricingPage — § 31 Monetization
 *
 * 4-tier model:
 *   Free     = Discover Yourself     ฿0
 *   Plus     = Know Yourself         ฿249/mo · ฿1,990/yr
 *   Pro      = Navigate Yourself     ฿589/mo · ฿4,990/yr
 *   Lifetime = Own Your Twin         ฿4,990 one-time (founder)
 *
 * Design rules (§ 43):
 * - ห้าม hardcode สี — ใช้ CSS var(--...) เท่านั้น
 * - ห้าม lock Basic Identity ไว้หลัง Paywall
 * - Premium = ความลึก ไม่ใช่ตัวตน (§ 32)
 */

import { useState } from 'react';
import { usePricing } from '@/hooks/usePricing';
import type { SubscriptionTier } from '@/context/SubscriptionContext';
import { MetaTagManager } from '@/components/MetaTagManager';
import { useLanguage } from '@/context/LanguageContext';
import { getSeoMetadata } from '@/constants/seoMetadata';
import { generatePricingSchema, type PricingPlan } from '@/lib/structuredData';
import { formatCurrency } from '@/config/currencyConfig';
import type { CurrencyCode } from '@/config/currencyConfig';
import '../styles/pricing.css';

// ─── Types ────────────────────────────────────────────────────────────────────
type BillingPeriod = 'monthly' | 'annual';

// ─── Pricing data (source of truth: stripeService.ts — kept in sync) ──────────
const PLANS: Array<{
  tier: SubscriptionTier;
  name: string;
  tagline: string;
  monthlyPrice: number | null;
  annualTotal: number | null;
  annualMonthly: number | null;
  savings: number | null;
  cta: string;
  highlighted: boolean;
  features: string[];
}> = [
  {
    tier: 'free',
    name: 'Free',
    tagline: 'Discover Yourself',
    monthlyPrice: 0,
    annualTotal: null,
    annualMonthly: null,
    savings: null,
    cta: 'เริ่มต้นใช้งาน',
    highlighted: false,
    features: [
      'สนทนากับ Twin ขั้นพื้นฐาน',
      'Insight & Reflection หลัก',
      'Hub access',
      'Archetype 1 แบบ',
      'Badge system',
      'Evolution milestones',
    ],
  },
  {
    tier: 'plus',
    name: 'Plus',
    tagline: 'Know Yourself',
    monthlyPrice: 249,
    annualTotal: 1990,
    annualMonthly: 166,
    savings: 509,
    cta: 'เริ่ม Plus',
    highlighted: true,
    features: [
      'ทุกอย่างใน Free',
      'Memory persistence — Twin จดจำคุณ',
      'Pattern detection — รูปแบบพฤติกรรม',
      'Advanced analytics & insights',
      'Archetypes ครบ 18 แบบ',
      'Daily Brief ด้วยเสียง (§25)',
      'Decision guidance',
    ],
  },
  {
    tier: 'pro',
    name: 'Pro',
    tagline: 'Navigate Yourself',
    monthlyPrice: 589,
    annualTotal: 4990,
    annualMonthly: 416,
    savings: 1078,
    cta: 'เริ่ม Pro',
    highlighted: false,
    features: [
      'ทุกอย่างใน Plus',
      'Future Self projection',
      'Journey roadmap',
      'Relationship insights',
      'Career intelligence',
      'AI usage สูงกว่า',
      'Priority email support',
    ],
  },
  {
    tier: 'lifetime',
    name: 'Lifetime',
    tagline: 'Own Your Twin',
    monthlyPrice: null,
    annualTotal: null,
    annualMonthly: null,
    savings: null,
    cta: 'รับ Lifetime',
    highlighted: false,
    features: [
      'ทุกอย่างใน Pro ไม่จำกัด',
      'Unlimited AI usage',
      'Export Twin data & conversations',
      'Custom Twin training',
      'VIP community access',
      'Lifetime updates',
      'Priority 24/7 support',
    ],
  },
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function PricingPage() {
  const [billing, setBilling] = useState<BillingPeriod>('monthly');
  const { tier: currentTier, startCheckout, managePlan, canUpgrade } = usePricing();
  const { language } = useLanguage();
  const seoData = getSeoMetadata('pricing', language);

  // Generate pricing schema for search engines
  const pricingPlans: PricingPlan[] = [
    {
      name: 'Free',
      price: 0,
      priceCurrency: 'USD',
      billingDuration: 'P1M',
      description: 'Discover yourself with basic Twin conversation',
    },
    {
      name: 'Plus',
      price: 9.99,
      priceCurrency: 'USD',
      billingDuration: 'P1M',
      description: 'Know yourself deeper with enhanced insights',
    },
    {
      name: 'Pro',
      price: 18.99,
      priceCurrency: 'USD',
      billingDuration: 'P1M',
      description: 'Navigate yourself with advanced analytics',
    },
    {
      name: 'Lifetime',
      price: 199,
      priceCurrency: 'USD',
      billingDuration: 'P1Y',
      description: 'Own your Twin forever with lifetime access',
    },
  ];
  const pricingSchema = generatePricingSchema(pricingPlans);

  const handleCTA = async (plan: typeof PLANS[number]) => {
    if (plan.tier === 'free') {
      // ROUTELOOP-002 FIX: bare "/onboarding" hits the catch-all
      const langPrefix = window.location.pathname.startsWith('/th') ? '/th' : '/en';
      window.location.href = `${langPrefix}/onboarding`;
      return;
    }
    if (!canUpgrade(plan.tier as 'plus' | 'pro' | 'lifetime')) {
      // Already on this tier or higher → open billing portal
      await managePlan();
      return;
    }
    await startCheckout(plan.tier as 'plus' | 'pro' | 'lifetime', billing);
  };

  // Get currency based on language
  const getCurrency = (): CurrencyCode => (language === 'th' ? 'THB' : 'USD');
  const currency = getCurrency();

  // USD prices for English locale (separately defined — THB and USD are not direct conversions)
  const USD_PRICES: Record<string, { monthly: number; annual: number; annualMonthly: number; lifetime: number }> = {
    plus:     { monthly: 9.99,  annual: 79,  annualMonthly: 6.58,  lifetime: 0 },
    pro:      { monthly: 18.99, annual: 149, annualMonthly: 12.42, lifetime: 0 },
    lifetime: { monthly: 0,     annual: 0,   annualMonthly: 0,     lifetime: 199 },
  };

  const formatPrice = (plan: typeof PLANS[number]): { main: string; sub: string } => {
    const isThai = language === 'th';
    const freeText = isThai ? 'ฟรี' : 'Free';
    const foreverText = isThai ? 'ตลอดไป' : 'Forever';
    const lifetimeText = isThai ? 'จ่ายครั้งเดียว (Founder)' : 'One-time (Founder)';
    const perYearText = isThai ? '/ปี' : '/year';
    const perMonthText = isThai ? '/เดือน' : '/month';

    if (plan.tier === 'free') return { main: freeText, sub: foreverText };

    if (plan.tier === 'lifetime') {
      // THB: ฿4,990 (from stripeService) | USD: $199
      const price = isThai ? 4990 : USD_PRICES.lifetime.lifetime;
      return { main: formatCurrency(price, currency), sub: lifetimeText };
    }

    const usd = USD_PRICES[plan.tier];

    if (billing === 'annual' && plan.annualMonthly !== null) {
      // THB prices already in THB; USD uses USD_PRICES
      const monthlyDisplay = isThai ? (plan.annualMonthly ?? 0) : (usd?.annualMonthly ?? 0);
      const totalDisplay   = isThai ? (plan.annualTotal   ?? 0) : (usd?.annual       ?? 0);
      return {
        main: formatCurrency(monthlyDisplay, currency),
        sub: `${formatCurrency(totalDisplay, currency)}${perYearText}`,
      };
    }

    // Monthly: THB from PLANS, USD from USD_PRICES
    const monthlyDisplay = isThai ? (plan.monthlyPrice ?? 0) : (usd?.monthly ?? 0);
    return {
      main: formatCurrency(monthlyDisplay, currency),
      sub: perMonthText,
    };
  };

  return (
    <>
      {seoData && (
        <MetaTagManager
          title={seoData.title}
          description={seoData.description}
          keywords={seoData.keywords?.join(', ')}
          ogImage={seoData.ogImage}
          canonicalUrl={`/${language}/pricing`}
          schema={pricingSchema}
        />
      )}
      <div className="pricing-page">
        {/* Header */}
        <div className="pricing-header">
        <p className="pricing-eyebrow">§ 31 Monetization</p>
        <h1 className="pricing-title">เลือกแผนที่ใช่สำหรับคุณ</h1>
        <p className="pricing-subtitle">
          ยิ่งเข้าใจตัวเองลึกขึ้นเท่าไร Twin ของคุณยิ่งมีคุณค่ามากขึ้นเท่านั้น
        </p>

        {/* Billing toggle */}
        <div className="pricing-billing-toggle" role="group" aria-label="รูปแบบการชำระเงิน">
          <button
            className={`pricing-billing-btn${billing === 'monthly' ? ' active' : ''}`}
            onClick={() => setBilling('monthly')}
          >
            รายเดือน
          </button>
          <button
            className={`pricing-billing-btn${billing === 'annual' ? ' active' : ''}`}
            onClick={() => setBilling('annual')}
          >
            รายปี
            <span className="pricing-billing-badge">ประหยัดถึง 28%</span>
          </button>
        </div>
      </div>

      {/* Cards */}
      <div className="pricing-grid">
        {PLANS.map((plan) => {
          const { main, sub } = formatPrice(plan);
          const isCurrent = plan.tier === currentTier;
          const isHigher = canUpgrade(plan.tier as 'plus' | 'pro' | 'lifetime');

          return (
            <div
              key={plan.tier}
              className={[
                'pricing-card',
                plan.highlighted ? 'pricing-card--highlighted' : '',
                isCurrent ? 'pricing-card--current' : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {plan.highlighted && (
                <div className="pricing-card-badge">ยอดนิยม</div>
              )}
              {isCurrent && (
                <div className="pricing-card-badge pricing-card-badge--current">
                  แผนของคุณ
                </div>
              )}

              <div className="pricing-card-header">
                <span className="pricing-card-tier">{plan.name}</span>
                <p className="pricing-card-tagline">{plan.tagline}</p>
              </div>

              <div className="pricing-card-price">
                <span className="pricing-price-main">{main}</span>
                <span className="pricing-price-sub">{sub}</span>

                {billing === 'annual' && plan.savings && (
                  <p className="pricing-savings">
                    ประหยัด ฿{plan.savings.toLocaleString()}/ปี
                  </p>
                )}
              </div>

              <ul className="pricing-features">
                {plan.features.map((f) => (
                  <li key={f} className="pricing-feature-item">
                    <span className="pricing-feature-check" aria-hidden="true">✦</span>
                    {f}
                  </li>
                ))}
              </ul>

              <button
                className={[
                  'pricing-cta-btn',
                  plan.highlighted ? 'pricing-cta-btn--primary' : '',
                  isCurrent && !isHigher ? 'pricing-cta-btn--manage' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => handleCTA(plan)}
                disabled={plan.tier === 'free' && isCurrent}
              >
                {isCurrent && plan.tier !== 'free'
                  ? 'จัดการแผน'
                  : isCurrent
                  ? 'แผนปัจจุบัน'
                  : plan.cta}
              </button>
            </div>
          );
        })}
      </div>

      {/* Footer note */}
      <div className="pricing-footer">
        <p>ไม่มีสัญญาผูกมัด — ยกเลิกได้ทุกเมื่อ</p>
        <p>
          มีคำถาม?{' '}
          <a href="mailto:hello@selfprint.app" className="pricing-footer-link">
            ติดต่อเรา
          </a>
        </p>
      </div>
    </div>
    </>
  );
}

// ─── Success sub-page (ใช้ route /pricing/success) ────────────────────────────
export function PricingSuccessPage() {
  const params = new URLSearchParams(window.location.search);
  const sessionId = params.get('session_id');

  return (
    <div className="pricing-success">
      <div className="pricing-success-icon" aria-hidden="true">✦</div>
      <h1 className="pricing-success-title">ยินดีด้วย!</h1>
      <p className="pricing-success-subtitle">
        Twin ของคุณพร้อมให้รู้จักคุณในระดับที่ลึกขึ้นแล้ว
      </p>
      {sessionId && (
        <p className="pricing-success-ref">
          หมายเลขอ้างอิง: <code>{sessionId.slice(0, 20)}…</code>
        </p>
      )}
      <button
        className="pricing-cta-btn pricing-cta-btn--primary"
        onClick={() => {
          // ROUTELOOP-002 FIX: bare "/dashboard" hits the catch-all
          const langPrefix = window.location.pathname.startsWith('/th') ? '/th' : '/en';
          window.location.href = `${langPrefix}/dashboard`;
        }}
      >
        เปิด Dashboard
      </button>
    </div>
  );
}
