# 🪟 Windows E2E Testing Checklist — Selfprint Full User Journey

**Platform:** Windows 11 / Windows 10  
**Browser:** Chrome / Edge (latest)  
**Environment:** npm run dev (local) + staging (post-deploy)  
**Scope:** Full pricing + passkey auth + audio flow + dashboard  

---

## 🎯 Test Objectives

| Feature | Status | Covered | 
|---------|--------|---------|
| §31 Monetization (Stripe) | ✅ Complete | Pricing page + checkout |
| §34 Passkey (Frontend) | ✅ Complete | Auth UI |
| §34 Passkey (Backend) | ⏳ In progress | Registration + verification |
| §37 Offline Journal | ✅ Complete | Service Worker + IndexedDB |
| §46 Adaptive Environments | ✅ Complete | Lighting + Particles + Audio |

---

## 🔧 Prerequisites

### Environment Setup
```bash
cd D:\selfprint-v3-react

# 1. Install dependencies
npm install

# 2. Verify build passes (fix rolldown binding issue if needed)
npm run build

# 3. Start dev server
npm run dev
# Navigate to http://localhost:5173

# 4. Open DevTools (F12)
# - Console tab (for errors)
# - Network tab (track API calls)
# - Application tab (check IndexedDB, localStorage)
```

### Supabase Setup
```bash
# Ensure migrations are deployed:
# 1. Login to Supabase Dashboard
# 2. Go to project → SQL Editor
# 3. Copy & run all migration files:
#    - 20260809_intelligence_core_schema.sql
#    - 20260810_create_user_credentials.sql
#    - 20260811_create_passkey_challenges.sql ← NEW

# 4. Verify tables exist:
#    - auth.users
#    - public.user_credentials
#    - public.passkey_challenges
```

---

## 📋 Test Scenarios

### 1️⃣ Landing Page + Authentication

**Goal:** User signs up and authenticates  
**Time:** ~10 min

#### Scenario 1.1: Sign Up (Email/Password)
```
[ ] 1. Load http://localhost:5173
[ ] 2. Click "Sign up" / "Create account"
[ ] 3. Enter email (test@example.com)
[ ] 4. Enter password (TestPass123!)
[ ] 5. Verify email (if OTP required)
[ ] 6. See "Welcome" screen
[ ] ✓ Expected: Redirected to onboarding or dashboard
[ ] ✓ Check: auth.users table has new row
```

#### Scenario 1.2: Sign In (Passkey Registration)
```
[ ] 1. On auth screen, click "Register Passkey" / "Create Passkey"
[ ] 2. Browser shows WebAuthn dialog
   [ ] a. If on Windows + has Windows Hello: Use face/fingerprint
   [ ] b. If no biometric: Use "Security Key" option or virtual authenticator
[ ] 3. Verify attestation succeeds
[ ] 4. See success message "Passkey registered"
[ ] ✓ Expected: Redirected to dashboard
[ ] ✓ Check: user_credentials table has one row
[ ] ✓ Check: Can see credential name ("My Passkey" or custom)
```

#### Scenario 1.3: Sign Out + Sign In with Passkey
```
[ ] 1. On dashboard, click "Sign out"
[ ] 2. Back to auth screen
[ ] 3. Enter email (test@example.com)
[ ] 4. Click "Sign in with Passkey"
[ ] 5. Browser shows WebAuthn dialog (list of registered passkeys)
[ ] 6. Select passkey / use biometric
[ ] 7. Assertion verified
[ ] ✓ Expected: Signed in, back to dashboard
[ ] ✓ Check: Console shows no auth errors
[ ] ✓ Check: Network tab shows POST to auth-verify-passkey ✅
```

---

### 2️⃣ Pricing & Subscription (§31 Stripe)

**Goal:** User views pricing, initiates checkout  
**Time:** ~15 min

#### Scenario 2.1: View Pricing Page
```
[ ] 1. On dashboard, click "Pricing" / "Upgrade" / "Subscribe"
[ ] 2. See pricing tiers (Free, Pro, etc.)
[ ] 3. Each tier shows:
   [ ] a. Feature list
   [ ] b. Monthly + annual price
   [ ] c. "Choose plan" button
[ ] 4. Can toggle between monthly/annual
[ ] ✓ Expected: Prices update dynamically
[ ] ✓ Check: Stripe publishable key loaded (DevTools → Network)
```

#### Scenario 2.2: Initiate Checkout (Pro Plan)
```
[ ] 1. Click "Choose Plan" for Pro tier
[ ] 2. Browser navigates to Stripe Checkout
[ ] 3. Stripe Hosted Checkout loads
   [ ] a. Shows plan name + price
   [ ] b. Shows billing email (pre-filled if logged in)
   [ ] c. Shows "Pay" button
[ ] 4. DevTools → Network: See POST to /api/stripe/create-session
[ ] ✓ Expected: Stripe Checkout session created (no errors)
[ ] ✓ Check: Session ID in URL
```

#### Scenario 2.3: Complete Payment (Test Card)
```
[ ] 1. On Stripe Checkout, fill payment info:
   [ ] Email: test@example.com
   [ ] Card: 4242 4242 4242 4242 (test card)
   [ ] Expiry: 12/25
   [ ] CVC: 123
[ ] 2. Click "Pay" button
[ ] 3. Wait for payment processing
[ ] 4. Redirected to success page
[ ] ✓ Expected: Subscription created in Stripe
[ ] ✓ Check: Stripe Dashboard shows transaction
[ ] ✓ Check: DB has subscription record
[ ] ✓ Check: User can see "Pro plan active" badge
```

#### Scenario 2.4: Return to Dashboard After Payment
```
[ ] 1. Click "Return to Dashboard" on success page
[ ] 2. Back on dashboard
[ ] 3. See subscription status (Pro, expires in 30 days)
[ ] 4. Features available to Pro tier are unlocked
[ ] ✓ Expected: No errors, clean UI
```

---

### 3️⃣ Dashboard & Core Experience (§46 Audio)

**Goal:** User interacts with dashboard, audio plays  
**Time:** ~20 min

#### Scenario 3.1: Load Dashboard
```
[ ] 1. After sign-in, see dashboard
[ ] 2. Dashboard loads:
   [ ] a. Dynamic "Today" section (based on time/mood)
   [ ] b. AI greeting or status
   [ ] c. Navigation: Today | Explore | Twin | Me
   [ ] d. SoundscapePlayer visible
[ ] 3. Check time-of-day lighting (should match current time):
   [ ] Morning (5-11am): Warm, energetic lighting
   [ ] Afternoon (11am-5pm): Bright, creative lighting
   [ ] Evening (5-9pm): Calm, reflective lighting
   [ ] Night (9pm-5am): Dark, restful lighting
[ ] ✓ Expected: Smooth load, CSS injected (check <style> tag)
[ ] ✓ Check: No console errors
```

#### Scenario 3.2: Audio Playback (SoundscapePlayer)
```
[ ] 1. On dashboard, locate SoundscapePlayer component
   [ ] Usually: Bottom of screen or integrated in "Today" section
[ ] 2. See:
   [ ] a. Soundscape name + emoji (Thai text)
   [ ] b. Play/pause button
   [ ] c. Volume slider (if expanded)
   [ ] d. Time-of-day label
[ ] 3. Click play button (▶)
[ ] 4. Observe:
   [ ] a. Progress indicator if CDN loading (should be fast)
   [ ] b. Button changes to pause (⏸)
   [ ] c. Status indicator: 🟢 (CDN) or 🟡 (Synthesis fallback)
[ ] 5. Wait 5-10 seconds
[ ] 6. Should hear ambient audio (from CDN or synthesized)
[ ] ✓ Expected: Audio plays smoothly, no glitches
[ ] ✓ Check: DevTools → Network tab:
   [ ] - XHR to CDN URL (if 🟢): https://res.cloudinary.com/...
   [ ] - If CDN fails → see 🟡, audio still plays (synthesis)
```

#### Scenario 3.3: Audio Ducking (Twin Speaks)
```
[ ] 1. SoundscapePlayer playing audio (volume ~60%)
[ ] 2. Trigger Twin to speak (click "Talk to Twin" or similar)
[ ] 3. Twin gives a message (voice + text)
[ ] 4. Observe:
   [ ] a. Background audio volume drops (ducked to ~20%)
   [ ] b. Twin voice is clear and prominent
   [ ] c. After Twin finishes: volume fades back to 60%
[ ] ✓ Expected: Smooth ducking/unducking (no abrupt muting)
[ ] ✓ Check: Audio context gain nodes working
```

#### Scenario 3.4: Period Transitions (Audio Switch)
```
[ ] 1. Note current soundscape (e.g., "morning-forest")
[ ] 2. Wait or manually set time to next period
   [ ] Option A: Wait until time boundary (5-11am → 11am-5pm)
   [ ] Option B: Mock time in DevTools: localStorage.setItem('testTime', '13:00')
[ ] 3. Refresh page (F5) or trigger update
[ ] 4. Observe:
   [ ] a. Soundscape changes to match new period
   [ ] b. SoundscapePlayer shows new name + lighting
   [ ] c. Audio crossfades smoothly (no harsh cuts)
[ ] ✓ Expected: Seamless transition, updated visual environment
```

#### Scenario 3.5: Offline Support (Audio Caching)
```
[ ] 1. Play soundscape (wait for CDN to cache in IndexedDB)
   [ ] Check DevTools → Application → IndexedDB → selfprint-audio-cache
   [ ] Should see record for soundscape ID with cached buffer
[ ] 2. DevTools → Network → Offline (throttle to offline)
[ ] 3. With offline:
   [ ] a. Try to play same soundscape
   [ ] b. Should load from IndexedDB cache (no network)
   [ ] c. Audio plays (may be silence if cache miss, that's ok)
[ ] 4. Go back online, refresh
[ ] ✓ Expected: PWA works offline for cached audio
```

---

### 4️⃣ Journal & Reflection (§37 Offline)

**Goal:** User creates journal entry, syncs offline  
**Time:** ~15 min

#### Scenario 4.1: Create Journal Entry
```
[ ] 1. On dashboard, find Journal / "Bันทึก" section
[ ] 2. Click "New entry" / "Write today"
[ ] 3. Form appears:
   [ ] a. Title field
   [ ] b. Content textarea
   [ ] c. Optional: mood/tag selection
   [ ] d. Submit button
[ ] 4. Fill in:
   [ ] Title: "My thoughts today"
   [ ] Content: "Lorem ipsum dolor sit amet..."
[ ] 5. Click "Save" / "Post"
[ ] ✓ Expected: Entry created, appears in list
[ ] ✓ Check: DB has new record in journal table
```

#### Scenario 4.2: Offline Sync Queue
```
[ ] 1. Create another journal entry (online)
[ ] 2. Go offline (DevTools → Network → Offline)
[ ] 3. Create 3rd journal entry while offline
[ ] 4. Check DevTools → Application → IndexedDB:
   [ ] - Look for offline_queue or journal_pending table
   [ ] - Should see 3rd entry marked "pending"
[ ] 5. Go back online
[ ] 6. Wait 5-10 seconds or trigger sync manually
[ ] 7. Check journal list:
   [ ] a. 3rd entry should appear (was synced from offline queue)
   [ ] b. Check DB: all entries present
[ ] ✓ Expected: Offline-first architecture working
[ ] ✓ Check: No duplicate entries after sync
```

#### Scenario 4.3: Reflection Prompt
```
[ ] 1. After creating journal, see optional "Reflect" prompt
   [ ] Or find Reflection section in dashboard
[ ] 2. AI asks follow-up question (e.g., "What did you learn?")
[ ] 3. User responds with voice or text
   [ ] If voice: Microphone access prompt → user allows
   [ ] Speech-to-text should convert audio to text
[ ] 4. Response saved as Reflection
[ ] ✓ Expected: Voice input works, text appears
[ ] ✓ Check: No microphone errors in console
```

---

### 5️⃣ Explore & Engagement (Activities)

**Goal:** User tries self-exploration activities  
**Time:** ~15 min

#### Scenario 5.1: Fingerprint Exploration
```
[ ] 1. Navigate to "Explore" / "สำรวจตัวเอง"
[ ] 2. See activity cards (Fingerprint, Palm, Hexagram, etc.)
[ ] 3. Click "Fingerprint" card
[ ] 4. See:
   [ ] a. Explanation of dermatoglyphics
   [ ] b. "Scan fingerprint" button
[ ] 5. Click scan button:
   [ ] a. Camera permission prompt (if first time)
   [ ] b. User allows camera access
[ ] 6. Point fingertip at camera
[ ] 7. System attempts to detect fingerprint pattern
[ ] 8. See result:
   [ ] a. Pattern visualization (grid/diagram)
   [ ] b. Interpretation text (exploratory language, not deterministic)
   [ ] c. "Does this match you?" prompt
[ ] 9. Click "Yes" or "No"
[ ] 10. Response saved to Reflection loop
[ ] ✓ Expected: Camera works, pattern shown (even if imperfect)
[ ] ✓ Check: No crash if fingerprint detection fails
```

#### Scenario 5.2: Palm Reading
```
[ ] 1. On Explore, click "Palm" card
[ ] 2. See:
   [ ] a. Explanation (cultural/exploratory framing)
   [ ] b. "Take photo of palm" button
[ ] 3. Click button:
   [ ] a. Camera activates
[ ] 4. Place palm in front of camera
[ ] 5. System detects palm lines:
   [ ] a. Shows detected lines overlaid
   [ ] b. Highlights major lines (heart, head, life, fate)
[ ] 6. Shows interpretation (palm reading guidance)
[ ] 7. "Does this resonate?" prompt
[ ] ✓ Expected: Palm detection works (OpenCV or similar)
[ ] ✓ Check: Graceful degradation if detection fails
```

#### Scenario 5.3: Hexagram / Daily Divination
```
[ ] 1. Click "Hexagram" / "เซียมซี" card
[ ] 2. See prompt: "What would you like to reflect on today?"
[ ] 3. User enters question (e.g., "Should I change jobs?")
[ ] 4. Click "Generate hexagram"
[ ] 5. See:
   [ ] a. 3D hexagram visualization (60 arrangements)
   [ ] b. Hexagram name + number (e.g., "天風姤")
   [ ] c. Interpretation text
[ ] 6. "How does this fit your situation?" reflection prompt
[ ] 7. User responds
[ ] ✓ Expected: Hexagram generated, interpretation shown
[ ] ✓ Check: Reflection loop triggered
```

---

### 6️⃣ Twin Experience (AI Growth)

**Goal:** Witness AI Twin learning over time  
**Time:** ~20 min (or multiple sessions)

#### Scenario 6.1: Twin Birth (First Time)
```
[ ] 1. First time user logs in (new account)
[ ] 2. Nova greets: "Let's get to know you..."
[ ] 3. Nova walks through onboarding:
   [ ] a. Questions about interests, values, goals
   [ ] b. User responses stored in Personal Model
   [ ] c. Completion: "I'm learning about you"
[ ] 4. After ~10 responses or 5 min:
   [ ] a. Nova: "I think I'm ready..."
   [ ] b. Twin Synthesis Experience begins (WOW moment):
      - Visual: Holographic body forming
      - Data streams flowing through silhouette
      - Particles coalescing
      - "Your Twin is being born..."
   [ ] c. Twin appears with name + avatar
   [ ] d. Twin greets: "I'm starting to understand you"
[ ] 5. User assigns name to Twin
   [ ] Or keep default (e.g., "Luna", "Alex")
[ ] ✓ Expected: Smooth, immersive experience (no glitches)
[ ] ✓ Check: CSS animations play correctly
[ ] ✓ Check: No console errors during synthesis
```

#### Scenario 6.2: Twin Evolves (Over Sessions)
```
[ ] 1. After Twin born, interact multiple times:
   [ ] a. Create 5+ journal entries
   [ ] b. Use Explore activities (fingerprint, hexagram, etc.)
   [ ] c. Reflect on insights
[ ] 2. Over time, Twin's understanding deepens:
   [ ] a. First session: "I'm learning about you"
   [ ] b. After 10 interactions: "I'm starting to see patterns"
   [ ] c. After 20+ interactions: "I understand your values"
[ ] 3. Twin suggests personalized insights:
   [ ] Based on patterns detected in journal
   [ ] Connected to your expressed values
   [ ] Offers relevant guidance
[ ] 4. Twin can discuss:
   [ ] a. Your journey (long-term changes)
   [ ] b. Your patterns (what Twin noticed)
   [ ] c. Recommendations (next steps)
[ ] ✓ Expected: Insights feel personalized, not generic
[ ] ✓ Check: Twin references specific user entries
```

#### Scenario 6.3: Talk to Twin (Chat)
```
[ ] 1. Click "Twin" / "AI ฝาแฝด" tab
[ ] 2. See chat interface:
   [ ] a. Twin's avatar + name
   [ ] b. Chat history (if previous conversations)
   [ ] c. Input field + send button
   [ ] d. Optional: Voice input button
[ ] 3. Type message: "I'm feeling uncertain about my path"
[ ] 4. Twin responds:
   [ ] a. Text appears in chat
   [ ] b. Voice option: click to hear Twin speak
   [ ] c. Response references something Twin learned
[ ] 5. Continue conversation (3-5 exchanges)
[ ] ✓ Expected: Responses feel connected to user's data
[ ] ✓ Check: No generic AI responses
```

---

### 7️⃣ Settings & User Preferences

**Goal:** User customizes experience  
**Time:** ~10 min

#### Scenario 7.1: Audio Preferences
```
[ ] 1. Go to Settings / "ตั้งค่า"
[ ] 2. Find "Audio" / "เสียง" section
[ ] 3. See toggles:
   [ ] a. Enable/disable background music
   [ ] b. Enable/disable voice (Twin speaks)
   [ ] c. Enable/disable sound effects
[ ] 4. Adjust volume sliders:
   [ ] a. Master volume (0-100)
   [ ] b. Twin voice volume
   [ ] c. Background music volume
[ ] 5. Choose voice personality (if available)
[ ] 6. Toggle "Speak important updates only" vs "Speak always"
[ ] 7. Save preferences
[ ] 8. Back to dashboard: Audio reflects new settings
[ ] ✓ Expected: Preferences persisted
[ ] ✓ Check: localStorage or DB has settings
```

#### Scenario 7.2: Profile & Privacy
```
[ ] 1. On Settings, click "Profile" / "บัญชี"
[ ] 2. See:
   [ ] a. Email address (read-only or editable)
   [ ] b. Display name
   [ ] c. Registered passkeys (list with "Remove" option)
   [ ] d. Session management (sign out all)
[ ] 3. Remove a passkey (if multiple registered)
[ ] 4. Confirm removal
[ ] 5. Try to sign in with removed passkey
[ ] ✓ Expected: Fails with "Credential not found"
[ ] ✓ Check: Credential removed from DB
```

#### Scenario 7.3: Subscription & Billing
```
[ ] 1. On Settings, click "Billing" / "ค่าสมาชิก"
[ ] 2. See:
   [ ] a. Current plan (Free / Pro / etc.)
   [ ] b. Next billing date
   [ ] c. "Manage subscription" link to Stripe portal
   [ ] d. "Cancel subscription" option
[ ] 3. Click "Manage subscription"
[ ] 4. Redirected to Stripe Customer Portal
   [ ] a. Can update payment method
   [ ] b. Can view invoices
   [ ] c. Can manage subscription
[ ] 5. Return to dashboard
[ ] ✓ Expected: Stripe Portal loads, then back to app
```

---

## 🐛 Error Scenarios & Fallbacks

### Test Network Failures
```
[ ] 1. DevTools → Network → Throttle to "Slow 3G"
[ ] 2. Try to:
   [ ] a. Load dashboard (should work, just slower)
   [ ] b. Play audio (should show loading, use cached if available)
   [ ] c. Create journal entry (should queue offline)
[ ] ✓ Expected: App remains responsive, doesn't crash

[ ] 3. Go fully offline
[ ] 4. Try to:
   [ ] a. Browse dashboard (from cache, works)
   [ ] b. Play audio (from IndexedDB cache)
   [ ] c. Read journal (from cache)
   [ ] d. Post journal (queued for sync)
[ ] ✓ Expected: No error pages, graceful degradation
```

### Test Invalid Inputs
```
[ ] 1. Try to register with:
   [ ] a. Empty email
   [ ] b. Invalid email (no @)
   [ ] c. Already registered email
[ ] ✓ Expected: Form validation errors, not server crash

[ ] 2. Try to:
   [ ] a. Submit journal with >10,000 chars (if limited)
   [ ] b. Create duplicate journal entry rapidly
[ ] ✓ Expected: Validation or debouncing, not crash
```

### Test Browser Compatibility
```
[ ] 1. Test in:
   [ ] a. Chrome (latest) ✓
   [ ] b. Edge (latest) ✓
   [ ] c. Firefox (latest) if time permits
[ ] 2. For each browser:
   [ ] a. Passkey registration (Windows Hello available)
   [ ] b. Audio playback
   [ ] c. Camera access (fingerprint/palm)
   [ ] d. Offline support (Service Worker)
[ ] ✓ Expected: Core features work across browsers
```

---

## 📊 Test Results Template

```
## E2E Test Results — [DATE]

**Tester:** [Name]  
**Platform:** Windows 11 / 10  
**Browser:** Chrome / Edge  
**Environment:** Local dev / staging  

### Summary
- Total scenarios: 7 sections × N scenarios = ~35
- Passed: [ ] / 35
- Failed: [ ] / 35
- Blocked: [ ] / 35

### Details

#### 1. Authentication [X/4 passed]
- [x] Sign up
- [x] Passkey registration
- [x] Passkey authentication
- [ ] Sign out (FAILED: button not visible)

#### 2. Pricing [X/4 passed]
- [x] View pricing page
- [x] Initiate checkout
- [x] Complete payment
- [x] Dashboard update post-payment

#### 3. Dashboard [X/5 passed]
- [x] Load dashboard
- [x] Audio playback (CDN)
- [x] Audio ducking
- [x] Period transitions
- [x] Offline audio caching

#### 4. Journal [X/3 passed]
- [x] Create entry
- [x] Offline sync queue
- [x] Reflection prompt

#### 5. Explore [X/3 passed]
- [x] Fingerprint
- [x] Palm
- [x] Hexagram

#### 6. Twin [X/3 passed]
- [x] Twin birth (WOW moment)
- [x] Twin learns
- [x] Chat interaction

#### 7. Settings [X/3 passed]
- [x] Audio preferences
- [x] Profile/passkeys
- [x] Billing management

### Known Issues
1. **[High]** Passkey button not visible on mobile (need responsive fix)
2. **[Medium]** Audio CDN fails if network slow (fallback works, but slow)
3. **[Low]** Hexagram visualization jittery on Intel integrated GPU

### Recommendations
1. Improve passkey button visibility (responsive design)
2. Add "skip audio" option if CDN times out
3. Test on better GPU or add low-power rendering mode

### Sign-off
- [x] Core user journey works end-to-end
- [x] Payment flow secure (Stripe)
- [x] Offline support functional
- [ ] (Optional) Performance optimized

**Approved for production:** [Yes/No with caveats]
```

---

## 🚀 Running E2E Tests (Automated)

If time permits, add Playwright or Cypress:

```bash
# Install Playwright
npm install -D @playwright/test

# Create test file: e2e/full-journey.spec.ts
# Run: npx playwright test
```

Example test:
```typescript
import { test, expect } from '@playwright/test';

test('Full user journey: sign up → passkey → pricing → audio', async ({ page }) => {
  // 1. Sign up
  await page.goto('http://localhost:5173');
  await page.click('text=Sign up');
  // ... rest of test
  
  // 2. Passkey registration
  // ... WebAuthn mocking
  
  // 3. Pricing
  // ... checkout flow
  
  // 4. Audio
  // ... play audio check
  
  expect(page.url()).toContain('/dashboard');
});
```

---

## 📞 Troubleshooting

| Issue | Cause | Fix |
|-------|-------|-----|
| Passkey not working | WebAuthn not available | Use Edge/Chrome, ensure Windows Hello enabled |
| Audio doesn't play | CDN URL not set | Check `.env.local` VITE_SOUNDSCAPE_CDN_URL |
| Journal offline queue missing | Service Worker not registered | Clear cache, `npm run dev` fresh |
| Stripe checkout fails | Missing API key | Check VITE_STRIPE_PUBLISHABLE_KEY in .env |
| Twin doesn't speak | Audio disabled or speaker muted | Check Settings → Audio, unmute browser |

---

**Created:** 2026-08-11  
**Status:** Ready for testing  
**Duration estimate:** 2-4 hours for full manual E2E  
**Automated testing:** Optional (Playwright setup 1-2 hours)
