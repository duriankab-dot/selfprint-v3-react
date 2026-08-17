# HANDOFF — 2026-08-10 §31 Monetization Complete

**Date:** 2026-08-10  
**Session:** §31 Monetization Backend  
**Status:** ✅ §31 Complete | audioManager.ts bugs fixed | TypeScript EXIT:0 ✅

---

## ✅ งานที่เสร็จในเซสชันนี้

### 1. §31 Monetization Backend — `/api/stripe.ts` ✅

| ไฟล์ | หน้าที่ |
|------|---------|
| `api/stripe.ts` | Vercel function: 4 actions via `?action=...` |
| `supabase/migrations/20260810_subscriptions.sql` | ตาราง `subscriptions` + RLS + index + trigger |

**4 actions:**
```
POST /api/stripe?action=create-checkout  → Stripe Checkout session (tier + billing)
POST /api/stripe?action=create-portal   → Stripe Billing Portal (manage sub)
GET  /api/stripe?action=subscription    → Current subscription status จาก DB
POST /api/stripe?action=webhook         → Stripe webhook → upsert Supabase
```

**Security:** userId ต้องผ่าน `verifyUser()` (Bearer JWT) เท่านั้น — ไม่เชื่อ client body

**Webhook events handled:**
- `checkout.session.completed` → upsert subscriptions table
- `customer.subscription.updated/deleted` → update tier + status + expires_at
- `invoice.payment_failed` → mark status = 'expired'

---

### 2. §31 PricingPage.tsx ✅

| ไฟล์ | หน้าที่ |
|------|---------|
| `src/pages/PricingPage.tsx` | UI 4-tier pricing + PricingSuccessPage export |
| `src/styles/pricing.css` | CSS ใช้ `var(--...)` ทั้งหมด, reduced-motion safe |

**Features:**
- Monthly / Annual billing toggle (ประหยัด 28%)
- 4 cards: Free · Plus · Pro · Lifetime
- แสดง savings ตอน annual
- isCurrent detection → "จัดการแผน" button
- `canUpgrade()` logic: ถ้า tier เดียวกัน → portal, ถ้าสูงกว่า → checkout
- Route `/pricing/success?session_id=...` → PricingSuccessPage

---

### 3. แก้ Bug userId ใน `usePricing.ts` ✅

```diff
- const userId = localStorage.getItem('selfprint-user-id');
+ const userId = auth?.session?.user?.id;
```

ทั้ง `startCheckout()` และ `managePlan()` — ใช้ `AuthContext` โดยตรง

---

### 4. App.tsx Routes ✅

```tsx
<Route path="/pricing"         element={<PricingPage />} />
<Route path="/pricing/success" element={<PricingSuccessPage />} />
```

---

### 5. แก้ Bug audioManager.ts (pre-existing จาก session ก่อน) ✅

| บรรทัด | Bug | Fix |
|--------|-----|-----|
| 149, 151 | `audioElement` ไม่มีใน scope | → `gainNode.gain.value` |
| 166, 168 | `audioElement` ไม่มีใน scope | → `gainNode.gain.value` |
| 222 | `const ctx = initializeAudioPlayer()` ctx ไม่ถูกใช้ | → `initializeAudioPlayer()` |

---

### 6. `stripe` package ✅

```json
"dependencies": {
  "stripe": "^16.12.0"
}
```
ติดตั้งแล้วด้วย `npm install stripe --legacy-peer-deps`

---

## TypeScript Verification

```bash
npx tsc -b --noEmit
# Output: (empty) ← EXIT:0 ✅
```

---

## สิ่งที่ต้องทำบนเครื่อง (ก่อน deploy)

```bash
# 1. Commit งานนี้
cd D:\selfprint-v3-react
git add -A
git commit -m "feat(§31): monetization backend + PricingPage + fix userId bug + fix audioManager"

# 2. ตั้ง Vercel env vars (ใน Vercel Dashboard → Project → Settings → Environment Variables)
STRIPE_SECRET_KEY=sk_test_xxxxx          # Stripe secret key (test ก่อน)
STRIPE_WEBHOOK_SECRET=whsec_xxxxx        # สร้างใน Stripe Dashboard → Webhooks
STRIPE_PRICE_PLUS_MONTHLY=price_xxxxx   # สร้างใน Stripe Dashboard → Products
STRIPE_PRICE_PLUS_ANNUAL=price_xxxxx
STRIPE_PRICE_PRO_MONTHLY=price_xxxxx
STRIPE_PRICE_PRO_ANNUAL=price_xxxxx
STRIPE_PRICE_LIFETIME=price_xxxxx
FRONTEND_URL=https://selfprint.app       # หรือ domain จริง

# 3. Run Supabase migration
supabase db push
# หรือ paste SQL จาก supabase/migrations/20260810_subscriptions.sql ใน Supabase Dashboard

# 4. ลงทะเบียน Stripe Webhook
# Stripe Dashboard → Developers → Webhooks → Add endpoint:
# URL: https://selfprint.app/api/stripe?action=webhook
# Events: checkout.session.completed, customer.subscription.updated,
#          customer.subscription.deleted, invoice.payment_failed

# 5. ตั้ง vercel.json body parser สำหรับ webhook (raw body จำเป็น)
```

**vercel.json** — ต้องเพิ่ม:
```json
{
  "functions": {
    "api/stripe.ts": {
      "bodyParser": false
    }
  }
}
```

---

## Architecture ณ วันนี้

```
App.tsx
  SubscriptionProvider (§31)
    ...providers...
      Router
        /pricing         → PricingPage (4-tier, billing toggle)
        /pricing/success → PricingSuccessPage
        ...routes เดิม...

api/
  stripe.ts ✅  (create-checkout | create-portal | subscription | webhook)
  chat.ts ✅

src/
  hooks/
    usePricing.ts ✅ (userId fixed: useAuth().session?.user?.id)
  services/
    stripeService.ts ✅ (PRICING_PLANS + API calls)
    audioManager.ts ✅ (audioElement bug fixed)
  context/
    SubscriptionContext.tsx ✅
  pages/
    PricingPage.tsx ✅ NEW
  styles/
    pricing.css ✅ NEW

supabase/migrations/
  20260810_subscriptions.sql ✅ NEW
```

---

## กฎที่ห้ามลืม

1. `verbatimModuleSyntax: true` → `import type { }` สำหรับ type-only imports
2. userId → `useAuth().session?.user?.id` เท่านั้น — ห้ามใช้ localStorage
3. CSS → `var(--...)` เท่านั้น — ห้าม hardcode สี/ขนาด
4. `npx tsc -b --noEmit` ก่อน commit — ต้อง EXIT:0 ✅ (verified)
5. Stripe webhook ต้องใช้ raw body — `bodyParser: false` ใน vercel.json

---

## สถานะ P0+P1+§31 ✅ ครบ

| Priority | Feature | Status |
|----------|---------|--------|
| P0 | Intelligence, Twin, Dashboard, Experience, PWA, Privacy, Auth, Push, TwinEvolution | ✅ |
| P1 | Daily Brief, Smart Push, Badge System, Voice Twin, Growth Visualization | ✅ |
| §31 | Monetization Backend + PricingPage + Supabase migration | ✅ |

---

## Next Session — P2 หรือ §34/§37

**ตามลำดับความสำคัญ:**

| Feature | § | ความซับซ้อน | หมายเหตุ |
|---------|---|------------|---------|
| Passkey (WebAuthn) | §34 | สูง | ต้องการ Apple Developer Account |
| Offline Journal Queue | §37 | กลาง | IndexedDB + Background Sync |
| Advanced Adaptive Environments | §46 | กลาง | Time-of-day themes |
| Future Self | §46 | สูง | Complex projection engine |
| Life Intelligence Packs | §33 | กลาง | Career/Relationship/Money modules |

**Next person can start with `§34: Passkey (WebAuthn)` หรือ `§37: Offline Journal Queue`**

---

**Token budget preserved ✅ | Branch: master/main | tsc EXIT:0 ✅**
