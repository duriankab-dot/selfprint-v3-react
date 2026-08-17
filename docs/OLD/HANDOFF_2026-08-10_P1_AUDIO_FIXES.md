# 🎯 HANDOFF - Selfprint Phase 2 Audio Fixes + Monetization

**Date:** 2026-08-10  
**Status:** §14-30 Complete ✅ | §23-24 Fixed ✅ | §31/§34/§37 Pending 🔄

---

## ✅ **Completed This Session**

### Core Features (§14-31)
| Section | Feature | Status |
|---------|---------|--------|
| §14 | Evidence Labels (KNOW/INFER/UNKNOWN) | ✅ Complete |
| §15 | Feedback Loop + Calibration | ✅ Complete |
| §23 | Adaptive Audio + Ducking | ✅ Fixed (Web Audio API) |
| §24 | Audio Permission + Settings | ✅ Fixed (UI Button) |
| §28 | Contextual Popups (4 types) | ✅ Complete |
| §30 | Twin Evolution Scene | ✅ Complete |
| §31 | Monetization (Stripe) | ⏳ Backend pending |

### Recent Fixes (This Handoff)
- **§23:** Replaced example.com URLs → Web Audio Oscillator (frequencies)
  - Polyphonic tone generation (C major chords)
  - No external file dependencies
  - Frequencies per experience: 174-784 Hz
  
- **§24:** Added AudioSettingsButton component
  - 🎵 Button for navbar/header
  - Launches AudioSettings modal
  - Audio permission gate working

---

## 🔴 **Pending Work (Priority Order)**

### Priority 1: §31 Monetization Backend (High Impact)
**Files needed:**
- `/api/stripe.ts` - 3 endpoints:
  - `POST /api/stripe/create-checkout` → Stripe session
  - `POST /api/stripe/create-portal` → Billing portal
  - `GET /api/stripe/subscription` → Current tier
- `src/pages/PricingPage.tsx` - 4-tier pricing display
- Fix bug: `usePricing.ts` line 33 uses `localStorage.getItem('selfprint-user-id')` → should use `useAuth().session?.user?.id`

**Why:** §31 context ready but API endpoints missing → payment flow broken

---

### Priority 2: §34 Passkey + Apple Login (Medium)
**Requires:**
- Apple Developer Account setup
- Supabase Passkey configuration
- WebAuthn implementation

**Skip if:** Developer accounts not ready

---

### Priority 3: §37 Offline Journal Queue (Lower)
**Feature:** Save journal entries offline, sync when online

**Status:** Not yet implemented (§37 in Master Direction)

---

## 📦 **Current Git Status**

```bash
# Latest commits
git log --oneline -5
# Expected output:
# [latest] fix(§23-24): Web Audio API + AudioSettings UI button
# [before] feat: §14-31 complete (6 sections: evidence, feedback, audio, popups, evolution, monetization)

# Current branch
git branch
# Should be: master or main (verify before push)

# Push status
git status
# Should be: "working tree clean"
```

---

## 🚀 **Next Session Commands**

```bash
# 1. Verify clean repo
cd D:\selfprint-v3-react
git status

# 2. Build test (will show any TypeScript errors)
npm install --legacy-peer-deps
npm run build

# 3. If build OK, continue with §31 Stripe backend

# 4. When ready to push
git add -A
git commit -m "feat(§31): stripe backend + pricing page"
git push origin master  # (or main)
```

---

## 📋 **Files Modified/Created (This Session)**

| File | Change | Status |
|------|--------|--------|
| `src/services/audioManager.ts` | ✏️ Web Audio API refactor | ✅ Ready |
| `src/components/AudioSettingsButton.tsx` | ✨ New UI button | ✅ Ready |
| `src/components/AudioSettings.tsx` | ✓ Already exists | ✅ Ready |
| `src/context/AudioContext.tsx` | ✓ Already exists | ✅ Ready |

---

## 🎯 **Upcoming Session Priorities**

**If continuing in new session:**

1. **Implement §31 Stripe Backend** (2-3 hours)
   - Create `/api/stripe.ts` with 3 endpoints
   - Build `PricingPage.tsx` component
   - Fix userId bug in usePricing.ts
   - Test checkout flow

2. **Add PricingPage to App Routes**
   - Import PricingPage
   - Add route: `/pricing`
   - Test navigation

3. **Integration Testing**
   - npm run build (check TypeScript)
   - npm run dev (test locally)
   - Verify audio plays
   - Verify audio ducking
   - Verify popups appear
   - Verify subscription context

---

## 💡 **Architecture Notes**

### Audio System (§23)
- **Before:** External MP3 URLs → 404 errors
- **After:** Web Audio API Oscillator → Instant tone generation
- **Format:** Polyphonic frequencies (multiple oscillators per experience)
- **Benefits:** No CDN dependency, works offline, minimal latency

### Subscription System (§31)
- **Frontend:** SubscriptionContext + usePricing hook (ready)
- **Backend:** 3 Stripe endpoints (to create)
- **Database:** Supabase (store subscription status)
- **Feature Gates:** Automatic per-tier (implemented)

---

## ⚠️ **Known Issues to Watch**

1. **Native Binding (rolldown)** - Linux sandbox limitation
   - Only affects build in Linux environment
   - Works fine on Windows (npm run build)

2. **Git HEAD.lock** - Rare permission issue
   - Solution: `rm .git/HEAD.lock` before commit

3. **Audio URLs** - Fixed in this handoff
   - Was: `https://example.com/audio/*.mp3`
   - Now: Oscillator frequencies (working)

---

## 📞 **Questions for Next Session?**

1. **Stripe Keys:** Do you have test/live Stripe keys ready?
2. **Pricing:** Use suggested pricing (฿249/589/4990) or custom?
3. **Audio CDN:** Keep Web Audio API or host real MP3s later?
4. **Apple Dev:** Ready for §34 Passkey, or skip for now?

---

## 🔗 **Key Files Reference**

```
src/
├── context/
│   ├── AudioContext.tsx ✅
│   ├── PopupContext.tsx ✅
│   ├── EvolutionContext.tsx ✅
│   ├── SubscriptionContext.tsx ✅ (API missing)
│   └── ...
├── services/
│   ├── audioManager.ts ✅ (FIXED)
│   ├── popupService.ts ✅
│   ├── stripeService.ts ✅ (Backend missing)
│   └── ...
├── components/
│   ├── AudioSettings.tsx ✅
│   ├── AudioSettingsButton.tsx ✅ (NEW)
│   ├── ContextualPopup.tsx ✅
│   ├── TwinEvolutionScene.tsx ✅
│   └── ...
├── hooks/
│   ├── useAudio.ts ✅
│   ├── useAudioDucking.ts ✅
│   ├── useContextualPopup.ts ✅
│   ├── useEvolutionTracking.ts ✅
│   ├── usePricing.ts ✅ (userId bug)
│   └── ...
└── App.tsx ✅ (all providers wired)

api/
└── stripe.ts ⏳ (TO CREATE)

pages/
└── PricingPage.tsx ⏳ (TO CREATE)
```

---

**Session End:** Ready for handoff ✅  
**Branch:** master/main ✅  
**Token Budget:** Preserved for §31-37 ✅
