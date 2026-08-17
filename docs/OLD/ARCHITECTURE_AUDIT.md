# 🔍 Architecture Audit — Phase 3 Landing Page

## ⚡ Checklist: Component Integration

### 1️⃣ Context Providers (`App.tsx`)
```
ThemeProvider
  ├─ EmotionProvider ✓
  ├─ HubProvider ✓
  └─ Router
      └─ Routes
          ├─ "/" → LandingPage ✓
          ├─ "/onboarding" → Onboarding ✓
          └─ ...
```

**Verify in browser console:**
```javascript
// Check if contexts are working
console.log('Emotion context:', window.__REACT_DEVTOOLS_GLOBAL_HOOK__);
```

---

### 2️⃣ LandingPage Component Structure
**File:** `src/pages/LandingPage.tsx`

- [ ] Import EmotionSelector ✓
- [ ] Import HubSwitcher ✓
- [ ] Export default ✓
- [ ] All CSS variables use correct tokens ✓

**Sections:**
```
<div> (root container)
  ├─ <nav> (NAVIGATION) 
  ├─ <section> (HERO) — minHeight: 100vh
  ├─ <section> (EMOTION) — EmotionSelector
  ├─ <section> (HUB) — HubSwitcher
  ├─ <section> (PROBLEM)
  └─ <section> (FINAL CTA)
```

---

### 3️⃣ Component Rendering Issues — Debug Steps

**If only "Problem section" shows:**

#### A. Check DevTools Console
1. Open Chrome DevTools (F12)
2. Click "Console" tab
3. Look for errors like:
   - `Uncaught Error: useEmotion must be used within EmotionProvider`
   - `Cannot find module '@/components/features/EmotionSelector'`
   - Component render errors

#### B. Check React DevTools
1. Install React DevTools Chrome extension (if not installed)
2. Open DevTools → Components tab
3. Inspect component tree:
   ```
   <App>
     <ThemeProvider>
       <EmotionProvider>
         <HubProvider>
           <Router>
             <Routes>
               <LandingPage> ← Should be here
                 ├─ nav
                 ├─ section (HERO)
                 ├─ section (EMOTION)
                 │   └─ EmotionSelector ← Check if renders
                 ├─ section (HUB)
                 │   └─ HubSwitcher ← Check if renders
                 ├─ section (PROBLEM)
                 └─ section (FINAL CTA)
   ```

#### C. Check CSS Loading
```css
/* Should see in DevTools > Elements > Styles */
--color-accent-primary: #0F1F3F;
--color-bg-primary: #FFFFFF;
--color-text-primary: #0F172A;
--color-text-secondary: #4B5563;
```

---

### 4️⃣ Integration Points — CTA Flow

#### Landing Page CTAs → Onboarding
```
CTA Button Click
  ↓
handleStartOnboarding()
  ↓
onStartOnboarding() [from props]
  └─ window.location.href = '/onboarding'
  ↓
App.tsx routes ["/onboarding"]
  ↓
<Onboarding /> component
```

**Test:**
1. Click "สร้าง AI Twin ฟรี" (nav)
2. Click "สร้าง AI Twin ของฉัน" (hero)
3. Click "สร้าง AI Twin ของฉัน" (final)
4. **Expected:** Navigate to `/onboarding`

---

### 5️⃣ Data Flow — Context → Components

```
Mood/Hub Selection
  ↓
EmotionContext / HubContext (state update)
  ↓
localStorage.setItem('selfprint_mood', mood)
localStorage.setItem('selfprint_hub', hub)
  ↓
Component re-render with new state
  ↓
[Ready for Onboarding integration]
```

---

### 6️⃣ Responsive Layout Check

**Desktop (1200px+):**
- Hero: 2-column grid ✓
- Emotion: 6 buttons in single row
- Hub: 4x3 grid (12 buttons)

**Tablet (768px):**
- Hero: 1-column (stacked)
- Emotion: 3 buttons per row
- Hub: 2-3 buttons per row

**Mobile (320px):**
- All: 1-column
- Nav: flex with wrap
- Buttons: full-width or 2 per row

---

## 🔧 Troubleshooting

### Problem: Only "Problem section" visible

**Likely cause:** CSS or component rendering issue

**Fix:**
1. Open DevTools Console
2. Check for errors
3. If `"EmotionSelector is not defined"`:
   - Verify export in `EmotionSelector.tsx`
   - Check import path in `LandingPage.tsx`
   - Verify `@/components/features/` alias works

4. If context error:
   - Verify `<EmotionProvider>` wraps route
   - Check `useEmotion()` called inside provider

5. If CSS issue:
   - Verify `src/styles/tokens.css` imports
   - Check `--color-*` variables defined
   - Clear browser cache (Ctrl+Shift+Delete)

### Problem: Onboarding navigation not working

**Test:**
1. Click CTA → Check URL (should show `/onboarding`)
2. If URL changes but component doesn't load:
   - Check `<Route path="/onboarding" element={<Onboarding />} />`
   - Verify Onboarding component exists and exports

3. If URL doesn't change:
   - Check console for `handleStartOnboarding` errors
   - Verify button `onClick` handler connected

---

## ✅ Sign-off Checklist

- [ ] All sections render (Hero → Emotion → Hub → Problem → CTA)
- [ ] No console errors
- [ ] Component tree correct in React DevTools
- [ ] CSS variables applied correctly
- [ ] Emotion selector works (click mood → highlight + state)
- [ ] Hub switcher works (click hub → highlight + state)
- [ ] All CTAs navigate to `/onboarding`
- [ ] Responsive layout tested (320px → 1400px)
- [ ] localStorage persists mood/hub selection
- [ ] Ready for Phase 4 (Brain integration)

---

**Next Step:** Run these tests and report any errors from DevTools console
