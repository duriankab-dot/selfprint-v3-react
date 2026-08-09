# 🐛 Debug: Landing Page Only Shows "Problem Section"

## 🔴 Problem Description
- ✗ Hero section NOT visible
- ✗ Emotion selector NOT visible
- ✗ Hub switcher NOT visible
- ✓ Problem section (⚡) visible
- ✓ Final CTA section visible

**Expected:** All 5 sections should render
**Actual:** Only sections 4 & 5 (bottom half) render

---

## 🔍 Step 1: Check Browser Console

**DO THIS FIRST:**
1. Open DevTools: `F12`
2. Click "Console" tab
3. Look for RED errors (not warnings)

**Likely errors to find:**
```
❌ "EmotionSelector is not defined"
❌ "useEmotion must be used within EmotionProvider"
❌ "Maximum call stack exceeded"
❌ Failed to compile / chunk error
```

**If you see errors, copy & paste them here.**

---

## 🔍 Step 2: Check Network Tab

1. DevTools → "Network" tab
2. Reload page (`F5`)
3. Look for:
   - ✓ `localhost:5173` (main page) — should be 200
   - ✓ `main.js` or bundle file — should load
   - ✗ Any red X = failed request

**Report any 404s or failures.**

---

## 🔍 Step 3: Verify CSS Variables Loaded

**In browser console, paste:**
```javascript
// Check if CSS variables are defined
const root = document.documentElement;
console.log('--color-accent-primary:', getComputedStyle(root).getPropertyValue('--color-accent-primary'));
console.log('--color-bg-primary:', getComputedStyle(root).getPropertyValue('--color-bg-primary'));
console.log('--color-text-primary:', getComputedStyle(root).getPropertyValue('--color-text-primary'));
```

**Expected output:**
```
--color-accent-primary:  #0F1F3F
--color-bg-primary:  #FFFFFF
--color-text-primary:  #0F172A
```

**If empty/undefined:** CSS not loading → check `src/styles/global.css`

---

## 🔍 Step 4: Check React Component Tree

1. Open DevTools → "Components" tab (React DevTools extension)
2. Look for:
   ```
   <LandingPage>
     ├─ [other JSX...]
     ├─ section
     │   └─ EmotionSelector  ← Should be here!
     └─ section
         └─ HubSwitcher      ← Should be here!
   ```

**If components missing:**
- Import statement broken
- Component export broken
- Component throws error during render

---

## 🔍 Step 5: Check Individual Component Files

### ✓ EmotionSelector.tsx
```bash
# Should have:
# - Line 55: export const EmotionSelector: React.FC<...>
# - Line 125: export default EmotionSelector;
```

### ✓ HubSwitcher.tsx
```bash
# Should have:
# - Line 91: export const HubSwitcher: React.FC<...>
# - Line 155: export default HubSwitcher;
```

### ✓ LandingPage.tsx
```bash
# Line 11: import { EmotionSelector } from '@/components/features/EmotionSelector';
# Line 12: import { HubSwitcher } from '@/components/features/HubSwitcher';
# Line 229: <EmotionSelector />
# Line 267: <HubSwitcher />
```

---

## 🔍 Step 6: Test CSS Variable Replacement

**Search in LandingPage.tsx for:**
```
var(--primary)           ← SHOULD be var(--color-accent-primary)
var(--text-primary)      ← SHOULD be var(--color-text-primary)
var(--text-secondary)    ← SHOULD be var(--color-text-secondary)
var(--bg-gray)           ← SHOULD be var(--color-bg-secondary)
var(--border-soft)       ← SHOULD be var(--color-border)
```

**If found any:** Missing replacements!

---

## 🔍 Step 7: Context Provider Check

**Verify in App.tsx:**
```typescript
<ThemeProvider>
  <EmotionProvider>    ← Must wrap everything!
    <HubProvider>      ← Must wrap everything!
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage ... />} />
```

**If providers wrong order or missing:**
- Components can't use `useEmotion()` or `useHub()`
- Will throw error: "useEmotion must be used within EmotionProvider"

---

## 📋 Reporting Template

Copy & paste this, fill in answers, send back:

```
## Debug Report

### Console Errors?
[ ] Yes / [ ] No
Error message (if yes):
```
<copy error here>
```

### CSS Variables Check
--color-accent-primary: 
--color-bg-primary: 
--color-text-primary: 

### React DevTools - Component Tree
Is EmotionSelector in tree? [ ] Yes / [ ] No
Is HubSwitcher in tree? [ ] Yes / [ ] No

### Page URL
Current URL: _______________

### What changed recently?
[ ] Reloaded page
[ ] Hard refresh (Ctrl+Shift+R)
[ ] Cleared cache
[ ] Other: _______________
```

---

## 🚀 If Everything Checks Out

**Do a hard refresh:**
```
Windows/Linux: Ctrl + Shift + R
Mac: Cmd + Shift + R
```

This clears cache and reloads everything.

---

## 💡 Common Fixes

| Issue | Fix |
|-------|-----|
| "Only Problem shows" | Check console errors first |
| CSS not applying | Hard refresh browser |
| Components not found | Check import/export statements |
| Context not working | Verify providers in App.tsx |
| Styling broken | Verify CSS variables in tokens.css |

---

**👉 Send this debug report to continue troubleshooting.**
