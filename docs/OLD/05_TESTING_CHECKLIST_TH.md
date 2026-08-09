# 📄 Phase 3 Testing Checklist

**Date:** 2026-08-07  
**Language:** ไทย  
**Phase:** Phase 3 (Aug 8-21)  
**Owner:** QA + Frontend + Backend  

---

## 🎯 TEST STRATEGY

**Approach:** Progressive (unit → integration → E2E)  
**Timeline:** Continuous (throughout Week 1-2)  
**Success:** All items ✅ before launch

---

## 🧪 WEEK 1: FOUNDATION TESTING

### Day 1: Brain Gateway (Astrovera)

**Unit Tests (Backend)**
```javascript
// Test 1: System parameter optional
[ ] Request without system param → 200 OK
[ ] Response has text, tokens, metadata
[ ] No error in console

// Test 2: System parameter present
[ ] Request with system param → 200 OK  
[ ] System param forwarded to Claude
[ ] Response metadata.hasSystemPrompt = true

// Test 3: Error handling
[ ] Invalid JSON → 400 Bad Request
[ ] Missing API key → 401 Unauthorized
[ ] Claude timeout → 500 with error message

// Test 4: Performance
[ ] Response time < 3s (p95)
[ ] Token count reasonable (600-850)
```

**Smoke Test (Frontend)**
```bash
[ ] POST /api/chat works
[ ] Response shape: { text, tokens, metadata }
[ ] localStorage stores mood
[ ] No console errors
```

---

### Day 2-3: Landing Page (Frontend)

**Functional Testing**

**Emotion Selector**
```
[ ] All 6 moods display (ready, calm, focused, energetic, curious, reflective)
[ ] Clicking mood → theme changes immediately
[ ] data-mood attribute updates
[ ] localStorage.mood = selected mood
[ ] Mobile: 2-3 cols, touch-friendly
[ ] Accessibility: aria-label on each button
```

**Progressive CTAs**
```
[ ] Section 1 "Why" → CTA renders (let's Create Mine)
[ ] Section 2 "How" → CTA renders (Start Building)
[ ] Section 3 "Who" → CTA renders (I'm Ready)
[ ] Section 4 "Next" → CTA renders (Create Now)
[ ] Each CTA has data-cta-source attribute
[ ] Click CTA → localStorage.cta_source updates
[ ] CTA text changes based on mood
```

**Birth Data Input**
```
[ ] Date input appears at end
[ ] Date validation: YYYY-MM-DD format
[ ] Time input optional (can skip)
[ ] Place input optional (can skip)
[ ] Form submit stores data
[ ] Mobile: fullwidth inputs
[ ] Error message for invalid date
```

**Responsive Testing**
```
[ ] Desktop (1920×1080): All content visible
[ ] Tablet (768×1024): Stacks properly, CTAs fullwidth
[ ] Mobile (375×667): Text readable, buttons tap-friendly
[ ] No horizontal scroll
[ ] Images responsive
```

**Performance Testing**
```
[ ] FCP < 2 seconds
[ ] LCP < 4 seconds
[ ] No layout shift (CLS < 0.1)
[ ] Zero 404s in network
[ ] CSS + JS bundle size acceptable
```

---

### Day 4-5: Design Tokens (CSS)

**Theme Switching**
```
[ ] Set data-mood="ready" → accent #00C853
[ ] Set data-mood="calm" → accent #1E88E5
[ ] Set data-mood="focused" → accent #6F42C1
[ ] Set data-mood="energetic" → accent #FF6D00
[ ] Set data-mood="curious" → accent #00BCD4
[ ] Set data-mood="reflective" → accent #5E35B1
```

**Component Integration**
```
[ ] Button colors use var(--accent-primary)
[ ] Card backgrounds use var(--bg-secondary)
[ ] Text colors use var(--text-primary)
[ ] Shadow uses var(--shadow-md)
[ ] Animation duration uses var(--animation-duration)
```

**Accessibility**
```
[ ] Color contrast WCAG AA (4.5:1 minimum)
[ ] Dark mode: tokens adapt
[ ] Focus indicators visible
[ ] No color-only information
```

---

## 🧪 WEEK 2: FULL FLOW TESTING

### Day 1-2: Onboarding (Frontend)

**Nova Conversation (Step 2)**
```
[ ] Nova prompt appears: "Tell me, when were you born?"
[ ] User input: Date → Nova responds
[ ] User input: Time (optional) → Nova responds
[ ] User input: Place (optional) → Nova responds
[ ] Data stored in state
[ ] Proceed to Step 3
[ ] Keyboard navigation works (Tab, Enter)
```

**AI Creation Animation (Step 3)**
```
[ ] 3-stage animation plays (analyze → create → connect)
[ ] Each stage shows correct text
[ ] Duration ~3 seconds
[ ] No jank/flicker
[ ] Auto-advances to Step 4
[ ] Mobile: responsive size
```

**Initial Blueprint (Step 4)**
```
[ ] Decision Style displays
[ ] 2 Strengths display
[ ] 1 Blind Spot displays
[ ] Meter shows 60% (amber color)
[ ] Nova prompt appears: "I'm 60% clear..."
[ ] Buttons: "Yes, Help Me" + "Skip for Now"
[ ] Both buttons functional
```

**Fine-tuning Flow (Step 5)**
```
[ ] Question 1 displays with 4 options
[ ] User selects option → stores answer
[ ] Meter animates 60% → 65%
[ ] Next question appears
[ ] Repeat for 4 questions
[ ] After Question 4 → Meter animates 60% → 85%
[ ] Nova: "Thanks! I'm 85% clear now"
```

**Full Analysis (Step 6)**
```
[ ] Full blueprint displays
[ ] All strengths show
[ ] All blind spots show
[ ] Meter animates 85% → 95%
[ ] Button: "Go to Home" works
```

---

### Day 3-4: E2E Integration

**Full User Flow (Happy Path)**
```
Landing:
  [ ] User lands on /
  [ ] Sees emotion selector
  [ ] Clicks "ready" mood
  [ ] Theme changes immediately
  [ ] Reads sections (why, how, who, next)
  [ ] Clicks CTA "From why section: Let's Create Mine"
  [ ] ✓ localStorage: mood=ready, cta_source=why

Onboarding:
  [ ] User redirected to /onboarding
  [ ] mood pre-filled: "ready"
  [ ] Selects emotion (continues to Step 2)
  [ ] Nova: "Tell me when born?"
  [ ] User: "1990-01-15"
  [ ] Nova: "What time?"
  [ ] User: "14:30" (optional)
  [ ] Nova: "Where?"
  [ ] User: "Bangkok" (optional)
  [ ] ✓ localStorage: birthData={dob, time, place}
  
  [ ] Animation plays (3 sec)
  [ ] Blueprint shows: 60%, Decision Style, 2 Strengths, 1 Blind Spot
  [ ] Nova: "Help me with 4 questions?"
  [ ] User answers 4 questions
  [ ] Meter: 60% → 85% (animated)
  [ ] Full blueprint: 85% → 95%
  [ ] Button: "Go to Home"
  
Home:
  [ ] User in /home
  [ ] Twin ready
  [ ] Can chat with Nova
```

**10+ Spot-Check Combinations**
```
Ready + Why CTA:
  [ ] Nova greets: "From why section, let me show you..."
  [ ] Twin personality reflects ready mood
  
Calm + How CTA:
  [ ] Nova greets: "From how section..."
  [ ] Responses calm + methodical
  
Energetic + Who CTA:
  [ ] Nova greets: "From social proof section..."
  [ ] Energetic tone
  
Focused + Next CTA:
  [ ] Nova guides deeply
  [ ] Focused, no diversions

Curious + Direct:
  [ ] Curiosity-driven questions
  [ ] Exploration-focused responses
  
[4 more combos...]
```

---

### Day 5-6: Error Scenarios

**Invalid Inputs**
```
Birth Data:
  [ ] Invalid date (e.g., "1990-13-01") → Error message
  [ ] Future date → Error message
  [ ] Missing date → Error message
  [ ] Valid date accepted

Brain Gateway:
  [ ] Timeout (>3s) → Retry logic
  [ ] 500 error → User-friendly message
  [ ] Network failure → Offline message
```

**Edge Cases**
```
[ ] Very old birth date (1900) → Handled
[ ] Time without date → Skipped gracefully
[ ] Place too long → Truncated
[ ] Rapid clicks on mood → Debounced
[ ] Rapid CTA clicks → Single navigation
[ ] Browser tab in background → No issues
[ ] Mobile rotation → Layout recalculates
```

**Accessibility**
```
[ ] Screen reader: Emotion options announced
[ ] Keyboard: Tab through all buttons
[ ] Keyboard: Enter to submit
[ ] Focus: Always visible
[ ] Color blindness: Options distinguishable beyond color
[ ] WCAG AA: All text > 4.5:1 contrast
```

---

### Day 7: Final Polish + Regression

**Visual Regression**
```
[ ] Landing: No layout shifts
[ ] Onboarding: Animation smooth
[ ] Blueprint: Colors correct for mood
[ ] Meter: Animation linear, no stutters
[ ] Mobile: No horizontal scroll
```

**Performance Regression**
```
[ ] FCP: Still < 2s
[ ] LCP: Still < 4s
[ ] Console: Zero errors/warnings
[ ] Network: No unnecessary requests
[ ] Battery: No excessive CPU usage
```

**Smoke Test (All Flows)**
```
[ ] 5-minute happy path on desktop
[ ] 5-minute happy path on mobile
[ ] Error scenario recovery
[ ] Context persistence (refresh page mid-flow)
```

---

## 📋 TEST CASES

### Landing Page

| Test | Input | Expected | Status |
|------|-------|----------|--------|
| Mood Selection | Click "ready" | Theme green, localStorage.mood="ready" | ⬜ |
| CTA Why | Click "Let's Create" | Navigate to /onboarding, cta_source="why" | ⬜ |
| Birth Date | Enter 1990-01-15 | Form accepts, data stored | ⬜ |
| Birth Date Invalid | Enter "abc" | Error: "Invalid date" | ⬜ |
| Mobile Emotion | 2-3 cols | Responsive, touch > 48px | ⬜ |

### Onboarding

| Test | Input | Expected | Status |
|------|-------|----------|--------|
| Nova Conversation | Date + Time + Place | All inputs accepted | ⬜ |
| Animation | Auto-play | 3 sec, 3 stages | ⬜ |
| Blueprint 60% | No user action | Decision + 2 Strength + Blind Spot show | ⬜ |
| Fine-tuning | Answer 4 Q | Meter 60%→85% animated | ⬜ |
| Full Analysis | Complete | Meter 85%→95% + Go Home | ⬜ |

### Integration

| Test | Flow | Expected | Status |
|------|------|----------|--------|
| Landing→Onboarding | Full path | Context flows, Nova has mood+CTA info | ⬜ |
| Mood Persistence | Refresh page | mood retained from localStorage | ⬜ |
| Offline | Disconnect | Graceful error message | ⬜ |

---

## ✅ LAUNCH CRITERIA

**All items must be ✅ before go-live:**

```
Functional:
☐ Landing emotion selector working
☐ All 4 CTAs navigate correctly
☐ Birth data validation working
☐ Brain Gateway system param accepted
☐ Onboarding full flow end-to-end
☐ Blueprint displays (60%, 85%, 95%)
☐ Fine-tuning 4 questions working
☐ Context passes Landing → Onboarding → Home
☐ Nova personalized by mood + hub + archetype

Technical:
☐ FCP < 2s
☐ LCP < 4s
☐ P95 latency < 3s
☐ Zero console errors
☐ Mobile responsive (tested on 3+ devices)
☐ WCAG AA accessibility
☐ 10+ combinations tested
☐ Error handling working
☐ Fallbacks in place

QA Sign-off:
☐ All test cases passing
☐ No known blockers
☐ Ready for production
```

---

## 📊 TEST EXECUTION PLAN

| Phase | Duration | Owner | Status |
|-------|----------|-------|--------|
| Unit (Brain Gateway) | Day 1 | Astrovera | ⬜ |
| Landing Page | Day 2-3 | Frontend | ⬜ |
| Design Tokens | Day 4-5 | Design+Frontend | ⬜ |
| Onboarding | Day 8-9 | Frontend | ⬜ |
| E2E Integration | Day 10-11 | QA | ⬜ |
| Error + Accessibility | Day 12-13 | QA | ⬜ |
| Final Regression | Day 14 | QA | ⬜ |

---

## 🔄 REGRESSION TESTING

**After Each Deployment:**
```
[ ] Landing loads
[ ] 3 moods tested (ready, calm, energetic)
[ ] Onboarding flow works
[ ] No console errors
[ ] Brain Gateway responsive
```

**Weekly (or per feature):**
```
[ ] Full E2E happy path (desktop)
[ ] Full E2E happy path (mobile)
[ ] All 10 mood combinations (spot check)
[ ] Error scenarios (5 cases)
[ ] Accessibility scan
```

---

## 📝 BUG TEMPLATE

```
Title: [Component] Issue description

Severity: 🔴 Critical / 🟠 High / 🟡 Medium / 🟢 Low

Steps to Reproduce:
1. ...
2. ...
3. ...

Expected:
[What should happen]

Actual:
[What actually happens]

Environment:
- Device: Desktop / Mobile
- Browser: Chrome / Safari / etc.
- OS: Windows / iOS / etc.

Screenshot: [if applicable]
```

---

## 🎯 DAILY TEST SUMMARY

**Template for QA to fill each day:**

```
Date: Aug [X]
Feature: [Landing / Onboarding / Integration]
Tests Planned: [N]
Tests Passed: [N] ✅
Tests Failed: [N] ❌
Blockers: [None / List]
Notes: [Any observations]

Sign-off: [QA name]
```

---

**Prepared by:** jb_DEV  
**Status:** 📋 Ready for QA Execution  
**Timeline:** Aug 8-21 (concurrent with development)
