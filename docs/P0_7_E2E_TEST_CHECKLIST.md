# P0 #7 E2E Test Checklist — Day 20

**Manual Testing Guide for Onboarding → Worlds → Chat → Personality**

---

## Test Environment Setup

- [ ] Browser: Chrome/Firefox/Safari (latest)
- [ ] Device: Desktop + Mobile (iOS/Android)
- [ ] Network: Fast 3G (DevTools throttling)
- [ ] Clear cookies/localStorage before each test
- [ ] Dev Console open (check for errors)

---

## Test 1: Onboarding → Auth Flow

### Test 1.1: Magic Link Sign Up
- [ ] Navigate to `/` (landing page)
- [ ] Click "Get Started" or "Start" button
- [ ] Enter email address
- [ ] Click "Send Magic Link"
- [ ] Check console: no errors
- [ ] Redirect to `/onboarding` after auth
- [ ] User appears in Supabase auth.users

### Test 1.2: Google OAuth (if configured)
- [ ] Click "Sign in with Google"
- [ ] Complete Google consent flow
- [ ] Auto-redirected to `/onboarding`
- [ ] user_metadata populated
- [ ] Check Supabase: user created

### Test 1.3: Apple OAuth (if configured)
- [ ] Click "Sign in with Apple"
- [ ] Complete Apple consent flow
- [ ] Auto-redirected to `/onboarding`
- [ ] user_metadata populated

### Test 1.4: Onboarding Form
- [ ] Fill in name field
- [ ] Select interests (checkboxes)
- [ ] Select timezone
- [ ] Click "Complete Setup"
- [ ] Data saved to user_metadata
- [ ] Redirect to `/core-awakening`

---

## Test 2: Core Awakening Flow

### Test 2.1: Core Awakening Page Load
- [ ] Page loads `/core-awakening`
- [ ] Spinner shows (loading SICE engines)
- [ ] No console errors
- [ ] TwinEvolution component ready

### Test 2.2: SICE Orchestration
- [ ] All 4 engines process (1-5s total)
- [ ] PersonalIntelligence generated
- [ ] Results visible in page
- [ ] No 500 errors from Supabase

### Test 2.3: Twin Evolution Overlay
- [ ] Overlay appears after SICE completes
- [ ] Shows: "Twin Awakening" badge
- [ ] Ring animation plays
- [ ] Auto-dismisses after 4s OR click to dismiss
- [ ] user_metadata.twin_state updated

---

## Test 3: Explore Worlds Flow

### Test 3.1: WorldsHub Page
- [ ] Navigate to `/worlds` (from menu/dashboard)
- [ ] Page loads 12 world cards (grid layout)
- [ ] Each card shows: emoji + name + tagline
- [ ] Cards are clickable
- [ ] No console errors

### Test 3.2: World Selection
- [ ] Click on "Self" world card
- [ ] Redirect to `/chat/twin?world=self`
- [ ] TwinChat loads with world context
- [ ] WorldNav component visible (3 tabs: Chat, Personality, Settings)
- [ ] Current tab highlighted: "Chat"

### Test 3.3: World Switching
- [ ] Click on different world card
- [ ] URL updates: `?world=mind`
- [ ] Chat history reset (world-specific)
- [ ] Twin personality responds to new world
- [ ] Badge progress shows for current world

### Test 3.4: Favorite Worlds
- [ ] Click ❤️ icon on world card
- [ ] Heart toggles (filled/empty)
- [ ] Data persists on reload
- [ ] Favorites appear at top of list

---

## Test 4: Chat Twin Flow

### Test 4.1: TwinChat Page Load
- [ ] `/chat/twin?world=self` loads
- [ ] Message history visible (empty for new user)
- [ ] Input field focused
- [ ] World context applied
- [ ] WorldNav shows current world

### Test 4.2: Send Message
- [ ] Type message in input field
- [ ] Click send or press Enter
- [ ] Message appears as "user" role
- [ ] Input cleared
- [ ] Twin responds (via mock/API)
- [ ] Message saved to journal_queue (offline support)

### Test 4.3: World-Aware Responses
- [ ] In "Self" world: Twin is reflective, exploratory
- [ ] In "Mind" world: Twin is analytical, logical
- [ ] In "Love" world: Twin is warm, tender
- [ ] Response adapts based on world context
- [ ] No hardcoded responses

### Test 4.4: World Filter (DecisionDashboard)
- [ ] Open "Decisions" page (if accessible)
- [ ] Filter dropdown shows 12 worlds + "All Worlds"
- [ ] Select "Self" → shows only self-world decisions
- [ ] Select "Mind" → shows only mind-world decisions
- [ ] "All Worlds" shows all decisions

---

## Test 5: Twin Settings Flow

### Test 5.1: Settings Page Load
- [ ] Click "Settings" tab in WorldNav
- [ ] Navigate to `/twin/settings`
- [ ] Page loads: "Twin Settings" header
- [ ] No console errors

### Test 5.2: Personality Tone
- [ ] Radio buttons for 4 tones: warm, analytical, playful, supportive
- [ ] Select "playful" tone
- [ ] Check/uncheck reverses state

### Test 5.3: Notification Frequency
- [ ] Radio buttons: high, medium, low, none
- [ ] Select "low" frequency
- [ ] Uncheck reverses state

### Test 5.4: Feature Toggles
- [ ] 3 checkboxes: Voice Chat, Daily Brief, Personality Evolution
- [ ] Toggle each on/off
- [ ] State persists on reload

### Test 5.5: Default World
- [ ] Text input for default world
- [ ] Enter "career"
- [ ] Save and reload: value persists

### Test 5.6: Save Changes
- [ ] Click "Save Changes" button
- [ ] Button shows "Saving..." state
- [ ] Data saved to user_metadata
- [ ] Success message or toast (if implemented)
- [ ] Reload page: settings persist

### Test 5.7: Reset
- [ ] Modify settings
- [ ] Click "Reset" button
- [ ] Form reverts to saved state

---

## Test 6: Twin Personality Flow

### Test 6.1: Personality Page Load
- [ ] Click "Personality" tab in WorldNav
- [ ] Navigate to `/twin/personality`
- [ ] Page loads: "Twin Personality" header
- [ ] No console errors

### Test 6.2: Mood Display
- [ ] Shows "Current Mood" card
- [ ] Mood icon displayed (🤔 ✨ ⚡ 🌟)
- [ ] Mood emoji animates (pulse effect)
- [ ] Mood text shows (e.g., "balanced")

### Test 6.3: Personality Metrics
- [ ] 4 metric cards show: Emotional State, Growth Momentum, Self-Awareness, Adaptability
- [ ] Each card shows: percentage (0-100) + progress bar
- [ ] Colors: gradient from blue to green
- [ ] Metrics calculated from personal context

### Test 6.4: Evolution Timeline
- [ ] 5 evolution items show (Stage 1-5)
- [ ] Unlocked stages: ✓ checkmark + filled circle
- [ ] Locked stages: empty circle
- [ ] Current stage: highlighted with shadow/glow
- [ ] Each stage shows: name + description + criteria

### Test 6.5: Evolution Progression
- [ ] Stage 1 (Awakening) always unlocked
- [ ] Unlock stages by increasing maturity score
- [ ] Stage badges appear as unlocked
- [ ] Next milestone shows below timeline

### Test 6.6: Mobile Responsiveness
- [ ] On iPhone SE (<375px): all elements stack vertically
- [ ] Charts readable on small screens
- [ ] No horizontal scrolling
- [ ] Touch targets ≥ 48×48px

---

## Test 7: Cross-World Integration

### Test 7.1: World Personality Adaptation
- [ ] Visit `/chat/twin?world=self` → mood = "reflective"
- [ ] Visit `/chat/twin?world=mind` → mood = "confident"
- [ ] Visit `/chat/twin?world=love` → mood = "playful"
- [ ] Personality changes based on world

### Test 7.2: World Stats Tracking
- [ ] In each world: visit, journal entry, decision recorded
- [ ] In WorldsHub: engagement_score increases per world
- [ ] Favorites persist per world
- [ ] Last accessed timestamp updates

### Test 7.3: Badges Per World
- [ ] In Settings: display badges for current world
- [ ] Badge icon + name + rarity shown
- [ ] "Unlocked" badge shows date
- [ ] "Locked" badge shows unlock criteria
- [ ] Progress bar shows % complete

### Test 7.4: World Mastery
- [ ] World mastery = (unlocked badges / total badges) × 100
- [ ] Mastery displayed per world
- [ ] Max mastery = 100% (all 7 badges unlocked)
- [ ] Mastery persists per world

---

## Test 8: Data Persistence

### Test 8.1: Supabase Integration
- [ ] User data saved to auth.users
- [ ] user_metadata populated (preferences, default_world, etc.)
- [ ] world_preferences table has entries
- [ ] world_stats table tracks visits/entries/decisions

### Test 8.2: Session Persistence
- [ ] Reload page: user still logged in
- [ ] Close browser: session persists (Supabase Session)
- [ ] Logout: session cleared, redirect to landing
- [ ] Clear cookies: requires re-login

### Test 8.3: Offline Support (if applicable)
- [ ] Turn off network (DevTools)
- [ ] Offline shell loads (PWA)
- [ ] Messages queue in IndexedDB
- [ ] Online again: auto-sync

---

## Test 9: Error Handling

### Test 9.1: Network Errors
- [ ] Slow network (3G throttle): spinner shows
- [ ] Failed Supabase query: error message + retry button
- [ ] 500 error: graceful error UI (not blank page)

### Test 9.2: Auth Errors
- [ ] Invalid magic link: error message
- [ ] OAuth cancel: redirect to login
- [ ] Session expired: redirect to login + message

### Test 9.3: Validation
- [ ] Empty message: send button disabled
- [ ] Invalid settings: validation feedback
- [ ] Type errors: dev console reports (no runtime crash)

---

## Test 10: Performance

### Test 10.1: Page Load Times
- [ ] Landing page: < 2s (LCP)
- [ ] Onboarding: < 2s
- [ ] Core Awakening: < 3s (SICE processing)
- [ ] WorldsHub: < 1.5s
- [ ] TwinChat: < 1s
- [ ] Settings: < 1s

### Test 10.2: Runtime Performance
- [ ] Type message: < 100ms to appear
- [ ] Switch world: < 500ms to load
- [ ] Settings save: < 1s
- [ ] No jank (60 FPS) on interactions

### Test 10.3: Bundle Size
- [ ] Main JS: < 250 KB (gzipped)
- [ ] CSS: < 30 KB
- [ ] Images: < 100 KB total
- [ ] Run Lighthouse: score ≥ 90

---

## Test 11: Mobile Testing (iOS)

### Test 11.1: Responsiveness
- [ ] Safari on iPhone: all pages render
- [ ] No horizontal scrolling
- [ ] Text readable (≥ 16px)
- [ ] Buttons tappable (≥ 48×48px)

### Test 11.2: Input
- [ ] Keyboard appears on input tap
- [ ] No zoom on double-tap
- [ ] Submit button accessible

### Test 11.3: Storage
- [ ] Preferences persist across app kill + reopen
- [ ] Supabase session preserved

---

## Test 12: Mobile Testing (Android)

### Test 12.1: Chrome Android
- [ ] All responsive tests pass
- [ ] Orientation change: layout adjusts
- [ ] Back button: navigate correctly

### Test 12.2: PWA Features
- [ ] "Add to Home Screen" option appears
- [ ] App opens fullscreen
- [ ] Offline page loads

---

## Test 13: Accessibility

### Test 13.1: Keyboard Navigation
- [ ] Tab key cycles through focusable elements
- [ ] Shift+Tab goes backward
- [ ] Enter/Space activates buttons
- [ ] Focus outline visible (not hidden)

### Test 13.2: Screen Reader (NVDA/JAWS/VoiceOver)
- [ ] Page title announced
- [ ] Headings announced with level
- [ ] Buttons announced as buttons
- [ ] Form labels associated with inputs
- [ ] Error messages announced

### Test 13.3: Color Contrast
- [ ] Text ≥ 4.5:1 contrast (WCAG AA)
- [ ] Use contrast checker: WebAIM
- [ ] Not relying on color alone

---

## ✅ Test Summary Template

**Date:** _______________  
**Tester:** _______________  
**Browser/Device:** _______________  

### Results
- [ ] All 13 tests passed
- [ ] No critical bugs found
- [ ] No console errors
- [ ] Performance acceptable
- [ ] Mobile responsive

### Issues Found (if any)
1. _______________
2. _______________
3. _______________

### Sign-Off
**Approved for deployment:** YES / NO  
**Tester signature:** _______________

---

**Last Updated:** 2026-08-16  
**Status:** Ready for QA
