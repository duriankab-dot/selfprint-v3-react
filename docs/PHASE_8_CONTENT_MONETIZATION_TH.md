# PHASE 8 — Content + Social Proof + Monetization (ภาษาไทย)

**วันที่:** 2026-08-17 | **Status:** 🔧 AUDIT | **Token:** Managed

---

## 🔴 Phase 8 ต้องทำ

### 1️⃣ Stripe Payment Flow

**File:** `stripeService.ts`

```typescript
// ✅ DONE: Pricing plans defined
const PRICING_PLANS = {
  free: { price: 0, features: [...] },
  plus: { price: 24900, features: [...] },  // ฿249/mo
  pro: { price: 58900, features: [...] },   // ฿589/mo
  lifetime: { price: 499000, features: [...] }, // ฿4,990
}

// ❌ TODO: Checkout session
async function createCheckoutSession(userId: string, tier: SubscriptionTier) {
  // 1. Create Stripe session
  const session = await stripe.checkout.sessions.create({
    customer_email: userEmail,
    payment_method_types: ['card'],
    line_items: [{
      price_data: {
        currency: 'thb',
        product_data: { name: tier.name },
        unit_amount: tier.price,
      },
      quantity: 1,
    }],
    mode: tier.billingPeriod === 'one-time' ? 'payment' : 'subscription',
    success_url: `${domain}/dashboard?success=true`,
    cancel_url: `${domain}/pricing?canceled=true`,
    client_reference_id: userId,
  });

  // 2. Store session reference
  await supabase
    .from('stripe_sessions')
    .insert({ user_id: userId, session_id: session.id });

  return session.url;
}

// ❌ TODO: Webhook handler
async function handleStripeWebhook(event: Stripe.Event) {
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.client_reference_id;
      
      // Update subscription
      await updateUserSubscription(userId, {
        tier: getTierFromSession(session),
        stripeCustomerId: session.customer,
        status: 'active',
      });
      break;
    }
    case 'customer.subscription.deleted': {
      // Downgrade to free
      break;
    }
  }
}
```

**Status:** ⚠️ PARTIAL (60% — pricing done, checkout & webhooks missing)

---

### 2️⃣ Blog System

**File:** `BlogPage.tsx`

```typescript
// ✅ STRUCTURE: Blog page exists
// ✅ SCHEMA: Articles index defined
// ❌ MISSING: Content strategy

// Articles needed (12 core):
const blogArticles = [
  // Career World
  { slug: 'career-twin-guidance', world: 'career', featured: true },
  { slug: 'decision-making-framework', world: 'career', featured: true },
  
  // Health World
  { slug: 'daily-wellness-ritual', world: 'health', featured: true },
  { slug: 'twin-health-insights', world: 'health', featured: false },
  
  // Relationships
  { slug: 'understanding-patterns', world: 'relationships', featured: true },
  { slug: 'twin-relationship-mirror', world: 'relationships', featured: false },
  
  // Platform
  { slug: 'what-is-selfprint', world: 'self', featured: true },
  { slug: 'how-twin-learns', world: 'self', featured: true },
  { slug: 'worlds-explained', world: 'self', featured: false },
  { slug: 'privacy-data-safety', world: 'self', featured: false },
  { slug: 'pricing-guide', world: 'self', featured: false },
  { slug: 'research-ai-personalization', world: 'self', featured: false },
];

// ❌ TODO: Store articles in Supabase
// Needed:
// - blog_articles table
// - blog_author_profiles
// - blog_comments (with moderation)
```

**Status:** ⚠️ PARTIAL (30% — structure done, content missing)

---

### 3️⃣ Social Proof (Testimonials + User Verification)

**Status:** ❌ NOT STARTED (0%)

```typescript
// ❌ NEEDED: Testimonials component
interface Testimonial {
  id: string;
  userId?: string;  // Verified users only
  name: string;
  role?: string;
  world: WorldId;  // Which world helped them
  quote: string;
  transformation: string; // Before/after
  metrics?: string; // "Improved productivity 40%"
  avatar?: string;
  verified: boolean;
  date: string;
}

// Components needed:
// 1. TestimonialCard (display)
// 2. TestimonialCarousel (featured)
// 3. TestimonialForm (user submission)
// 4. TestimonialModeration (review queue)

// Page: /testimonials (show all verified)
// Components: 
//   - TwinTestimonials (in pricing)
//   - WorldTestimonials (in each world)
```

**Status:** ❌ NOT STARTED

---

## 📊 Monetization Strategy

```
┌──────────────────────────────────────────┐
│ FREE (Core Experience)                   │
├──────────────────────────────────────────┤
│ • Basic Twin chat                        │
│ • Single world (self)                    │
│ • Limited SICE insights                  │
│ • No memory persistence                  │
│ Conversion funnel: Core Awakening        │
└──────────────────────────────────────────┘
             ↓ (30% convert)
┌──────────────────────────────────────────┐
│ PLUS (฿249/month) — Most Popular        │
├──────────────────────────────────────────┤
│ • Everything in Free                     │
│ • Memory persistence                     │
│ • Pattern detection                      │
│ • All 18 archetypes                      │
│ • Voice daily briefs                     │
│ • Decision guidance                      │
│ Churn prevention: Recurring value        │
└──────────────────────────────────────────┘
             ↓ (10% upgrade)
┌──────────────────────────────────────────┐
│ PRO (฿589/month) — Advanced              │
├──────────────────────────────────────────┤
│ • Everything in Plus                     │
│ • Future self projection                 │
│ • Journey roadmap (12 worlds)            │
│ • Relationship insights                  │
│ • Career intelligence                    │
│ • Priority support                       │
│ Upsell target: High-engagement users     │
└──────────────────────────────────────────┘
             ↓ (5% upgrade)
┌──────────────────────────────────────────┐
│ LIFETIME (฿4,990 one-time) — Founder    │
├──────────────────────────────────────────┤
│ • Everything in Pro                      │
│ • Unlimited AI usage                     │
│ • Export Twin data                       │
│ • Custom Twin training                   │
│ • VIP community                          │
│ │ Target: Early believers                │
└──────────────────────────────────────────┘
```

---

## 💰 Revenue Model

| Stream | Implementation | Status |
|--------|---|---|
| Subscriptions (Plus/Pro) | Stripe recurring | ⚠️ 60% |
| One-time (Lifetime) | Stripe payment | ⚠️ 60% |
| Blog sponsorship | Blog integration | ❌ 0% |
| White-label Twin | API tier | ❌ 0% |

---

## 📋 Phase 8 Checklist

### Stripe Checkout (Priority P0)
- [ ] Create checkout session flow
- [ ] Store session reference
- [ ] Redirect to Stripe hosted checkout
- [ ] Handle success/cancel redirects
- [ ] Test: Free → Plus checkout works

### Webhook Handler (Priority P0)
- [ ] Implement webhook receiver
- [ ] Verify Stripe signature
- [ ] Update subscription on purchase
- [ ] Send confirmation email
- [ ] Downgrade on subscription.deleted
- [ ] Test: Purchase → subscription active

### Blog Content (Priority P1)
- [ ] Create blog_articles table
- [ ] Write 12 core articles (2000+ words each)
- [ ] Set featured articles (6)
- [ ] Add SEO metadata per article
- [ ] Seed articles to DB
- [ ] Test: BlogPage loads articles

### Testimonials (Priority P2)
- [ ] Create testimonials table
- [ ] Build TestimonialCard component
- [ ] Build TestimonialForm (user submission)
- [ ] Implement moderation queue
- [ ] Show on pricing page
- [ ] Test: User submits testimonial → moderation flow

### Social Proof Display (Priority P2)
- [ ] Show verified testimonials on pricing
- [ ] Add user count badge (e.g., "2,000+ users")
- [ ] Show world-specific testimonials
- [ ] Display metrics (avg rating, reviews)

---

## 🔗 Files

```
src/services/
├── stripeService.ts ⚠️ (pricing done, checkout missing)
└── StripeWebhookService.ts ❌ (not created)

src/pages/
├── BlogPage.tsx ⚠️ (structure, content missing)
├── PricingPage.tsx ✅ (mostly done)
└── TestimonialsPage.tsx ❌ (not created)

src/components/
├── TestimonialCard.tsx ❌ (not created)
├── TestimonialCarousel.tsx ❌ (not created)
└── TestimonialForm.tsx ❌ (not created)

Database:
├── stripe_sessions (for session tracking)
├── blog_articles
├── blog_comments
└── testimonials (user submissions, verified only)

API:
└── /api/stripe/create-checkout ❌ (not implemented)
└── /api/stripe/webhook ❌ (not implemented)
```

---

## ⚠️ Critical Dependencies

**Blocks Phase 9:** Security (PCI compliance for payments)  
**Blocks Phase 10:** Testing (payment flow tests)  
**Depends on Phase 7:** Decision Intelligence (shows value in testimonials)

---

## 🎯 Success Criteria (Phase 10)

| Metric | Target |
|--------|--------|
| Stripe checkout works | 100% |
| Blog SEO index | Google indexing within 24h |
| Testimonials verified | 95%+ moderated before display |
| Conversion rate | >5% free → paid |

---

**Document:** PHASE_8_CONTENT_MONETIZATION_TH.md  
**Language:** ภาษาไทย | **Concise:** ✅ | **Token:** Managed
