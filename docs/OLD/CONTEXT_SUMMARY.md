# 📦 Context Summary — Phase 3 Architecture

## 🎯 Phase 3 Context (for Phase 4)

### What We Built
**Landing Page** with 12-hub + 6-mood selection → seamless flow to Onboarding

### Architecture Blueprint

```
App.tsx
  └─ ThemeProvider
      └─ EmotionProvider
          └─ HubProvider
              └─ Router
                  ├─ Route "/" → LandingPage ✓ (complete)
                  └─ Route "/onboarding" → Onboarding (ready for Phase 4)
```

### 3 Core Contexts

#### 1. **EmotionContext** (src/context/EmotionContext.tsx)
```typescript
type Mood = 'stressed' | 'confused' | 'confident' | 'drained' | 'ready' | 'reflective'

Interface:
- mood: Mood (current selection)
- moodHistory: MoodLog[] (timestamps)
- updateMood(newMood: Mood) → void
- localStorage: selfprint_mood
```

#### 2. **HubContext** (src/context/HubContext.tsx)
```typescript
type Hub = 'identity' | 'decision' | 'relationship' | 'career' | 'health' | 'money' 
         | 'ai-twin' | 'learning' | 'creativity' | 'spirituality' | 'impact' | 'activity'

Interface:
- currentHub: Hub (current selection)
- hubHistory: HubLog[] (timestamps)
- switchHub(newHub: Hub) → void
- localStorage: selfprint_hub
- Sets data-hub attribute on <html>
```

#### 3. **ThemeContext** (src/context/ThemeContext.tsx)
```typescript
type Mode = 'light' | 'dark'

Interface:
- currentMode: Mode
- toggleMode() → void
- mood-based CSS variables applied
- localStorage: selfprint_mode
```

---

## 💾 Data Flow

### User Action → State → Persistence

```
User clicks mood (e.g., "confident")
  ↓
EmotionContext.updateMood('confident')
  ├─ setMood('confident')
  ├─ document.documentElement.setAttribute('data-mood', 'confident')
  ├─ localStorage.setItem('selfprint_mood', 'confident')
  └─ Re-render all useEmotion() consumers
  ↓
EmotionSelector highlights selection
  ↓
User navigates away + returns
  ↓
localStorage['selfprint_mood'] recovered on mount
  ↓
State preserved ✓
```

### Same for Hub Selection
- Key: `data-hub` attribute
- Storage: `selfprint_hub`
- Consumers: HubSwitcher, Nova AI Twin personalization

---

## 🎨 Design Tokens Integration

### CSS Variables (src/styles/tokens.css)

Every component uses:
```css
--color-accent-primary: #0F1F3F
--color-text-primary: #0F172A
--color-text-secondary: #4B5563
--color-bg-primary: #FFFFFF
--color-bg-secondary: #F9FAFB
--color-border: #E5E7EB
```

**No custom variables:** Use standard `--color-*` naming

### Color by Role

| Variable | Used For |
|----------|----------|
| `--color-accent-primary` | Hub selection highlight, primary buttons |
| `--color-accent-secondary` | Mood selection highlight |
| `--color-text-primary` | Main text, labels |
| `--color-text-secondary` | Descriptions, helper text |
| `--color-bg-primary` | Page background |
| `--color-bg-secondary` | Section backgrounds (Problem) |
| `--color-border` | Button borders, dividers |

---

## 🎯 Component Hierarchy

### Landing Page Structure
```
LandingPage
  ├─ <nav> (Navigation)
  ├─ <section> Hero
  │   ├─ H1 + P
  │   ├─ Button[Primary] → handleStartOnboarding()
  │   └─ Button[Secondary] → scroll to hub-section
  ├─ <section> Emotion
  │   └─ EmotionSelector
  │       ├─ useEmotion() hook
  │       └─ 6 mood buttons (grid)
  ├─ <section> Hub
  │   └─ HubSwitcher
  │       ├─ useHub() hook
  │       └─ 12 hub buttons (4x3 grid, responsive)
  ├─ <section> Problem
  │   └─ Static content
  └─ <section> Final CTA
      └─ Button → handleStartOnboarding()
```

### State Hooks Used
```typescript
// In EmotionSelector
const { mood, updateMood } = useEmotion();

// In HubSwitcher
const { currentHub, switchHub } = useHub();

// In LandingPage (if needed in future)
// const { mood } = useEmotion();
// const { currentHub } = useHub();
```

---

## 🚀 Handoff to Phase 4

### What Onboarding Needs to Do:

1. **Read User Selection**
```typescript
const { mood } = useEmotion();     // e.g., "confident"
const { currentHub } = useHub();    // e.g., "decision"
```

2. **Call Brain API**
```typescript
// Pseudo-code
const twin = await astrovera.initializeTwin({
  userMood: mood,
  selectedHub: currentHub,
  userId: generateId(),
  // ...other params
});
```

3. **Load Nova AI Twin**
```typescript
// Nova personality depends on:
// - mood (affects tone/style)
// - hub (affects domain knowledge)
// 
// nova-ai.ts has HUB_PROMPTS + starters for each combo
const novaNarrative = generateNovaPrompt(currentHub, mood);
```

4. **Render Chat Interface**
```typescript
// Connect to ChatWindow component
<ChatWindow character="nova" siceContext={currentHub} />
```

---

## 📋 Key Files for Phase 4

**Read First:**
1. `src/context/EmotionContext.tsx` → understand mood state
2. `src/context/HubContext.tsx` → understand hub state
3. `src/pages/LandingPage.tsx` → see CTA flow
4. `src/services/nova-ai.ts` → understand Nova personalization

**Will Need to Create:**
1. `src/pages/Onboarding.tsx` → main flow
2. `src/services/astrovera.ts` → Brain API integration
3. Chat setup (extend ChatWindow component)
4. Integration tests

---

## ⚠️ Common Pitfalls to Avoid

### 1. CSS Variable Names
❌ `var(--primary)` → ✅ `var(--color-accent-primary)`
❌ `var(--tx)` → ✅ `var(--color-text-primary)`

### 2. Context Wrapping
❌ Router inside providers → ✅ Router outside, Providers inside

### 3. Component Imports
❌ `import EmotionSelector` (default) → ✅ `import { EmotionSelector }` (named export exists)

### 4. localStorage Keys
❌ Custom keys → ✅ Use standard: `selfprint_mood`, `selfprint_hub`

### 5. Type Safety
❌ `string` for mood/hub → ✅ Use `Mood | Hub` types from context

---

## 🔧 Quick Reference

### How to Use Contexts in Phase 4

**In Onboarding component:**
```typescript
import { useEmotion } from '@/context/EmotionContext';
import { useHub } from '@/context/HubContext';

export default function Onboarding() {
  const { mood } = useEmotion();
  const { currentHub } = useHub();

  // Now you have:
  // mood: 'confident' | 'stressed' | etc.
  // currentHub: 'decision' | 'identity' | etc.

  return (
    <div>
      <h1>Creating your AI Twin...</h1>
      <p>Mood: {mood}</p>
      <p>Hub: {currentHub}</p>
      {/* Call Brain API here */}
    </div>
  );
}
```

---

## 📊 Metrics Achieved

| Item | Status |
|------|--------|
| Landing page sections | 6/6 ✅ |
| Mood options | 6/6 ✅ |
| Hub options | 12/12 ✅ |
| TypeScript errors | 0/0 ✅ |
| CSS variable consistency | 100% ✅ |
| Responsive breakpoints | 5+ ✅ |
| localStorage integration | ✅ |
| CTA routing | ✅ |
| Context providers | 3/3 ✅ |

---

## 🎯 Phase 4 Entrance Criteria

✅ All met. Ready to:
1. Build Onboarding flow
2. Integrate Astrovera Brain API
3. Initialize Nova AI Twin
4. Setup ChatWindow + conversation flow
5. Test complete user journey

---

**Phase 3 Context: COMPLETE & DOCUMENTED** 📦
