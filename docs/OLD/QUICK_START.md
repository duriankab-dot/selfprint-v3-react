# Onboarding Flow - Quick Start Guide
**For:** Developers joining Phase 4  
**Read Time:** 5 minutes  
**Goal:** Understand the flow and know where to look

---

## 30-Second Overview

User goes through 7 steps to create an AI Twin:
1. **Pick a mood** (emotional baseline)
2. **Tell Nova your birth data** (conversational, not a form)
3. **Watch AI animation** (2-3 seconds)
4. **See first impression** (60% accuracy, want to improve?)
5. **Answer 4 questions** (one at a time, accuracy goes 60%→85%)
6. **Review complete blueprint** (decision style, strengths, insights)
7. **Go to dashboard** (home)

---

## Key Files You Need to Know

### Main Flow Controller
```
src/pages/Onboarding.tsx
└─ Manages all 7 steps
└─ State: mood, birthData, siceResult
└─ Handlers: handleMoodSelect, handleNovaComplete, etc.
```

### Components (in order)
```
1. EmotionSelector              (built-in feature component)
2. NovaConversation             (birth data collection)
3. AICreationSequence           (3-stage animation)
4. InitialBlueprint             (60% display) ← NEW in Phase 3
5. FinetuningQuestions          (progressive 60%→85%) ← ENHANCED
6. FullAnalysis                 (85%+ comprehensive) ← NEW in Phase 3
7. (automatic) → /home          (dashboard)
```

### State & Persistence
```
src/store/userStore.ts          (Zustand - user context)
localStorage keys:
  - user_mood                   (current emotional state)
  - user_profile                (birth data)
  - finetune_answers            (4 question responses)
  - landing_cta_source          (where user came from)
```

### Styling System
```
src/styles/tokens.css           (11 mood color systems)
src/styles/global.css           (imports tokens.css)
src/styles/mood-themes.css      (mood-specific theming)
```

---

## What Changed in Phase 3

### New Components
1. **InitialBlueprint** - Shows 60% accuracy with mood-aware styling
2. **FullAnalysis** - Comprehensive 85%+ blueprint view

### Enhanced Components
- **FinetuningQuestions** - Now progressive disclosure (one Q per screen)
- **Onboarding.tsx** - New step flow and data handling

### Bug Fixes
- Fine-tuning answers now captured (handleFinetuneSubmit)
- Blueprint data now passed through flow
- Accuracy meter shows color progression

---

## The Data Flow

```
Emotion Selection
├─ Sets mood → localStorage + context
├─ CSS variables updated globally
└─ Triggers Nova greeting (1.5s auto-advance)

Nova Conversation
├─ Collects: DOB, Time (optional), Place (optional)
├─ Validates: Date format (YYYY-MM-DD)
├─ Stores: user_profile in localStorage
└─ Auto-advances to AI animation

AI Creation Sequence
├─ 3 stages: Analyzing → Creating → Connecting
├─ 1 second per stage, GPU-accelerated
├─ Auto-advances after completion
└─ Shows "Your AI Twin is born" message

Initial Blueprint (60%)
├─ Displays: Decision style + 2 strengths + 1 blind spot
├─ Shows: 60% accuracy (amber color)
├─ Mood-aware: Nova message varies by landing CTA
├─ Options: "Help me know better" or "Skip"
└─ Routes to: Fine-tuning questions

Fine-tuning Questions (60%→85%)
├─ Question 1: Decision making (Intuition/Logic/Emotion/Balance)
├─ Question 2: What energizes (People/Ideas/Nature/Achievement)
├─ Question 3: Work environment (Structured/Flexible/Collaborative/Independent)
├─ Question 4: Stress handling (Action/Reflection/Connection/Rest)
├─ Display: One question at a time, progresses on selection
├─ Accuracy: Updates 60%→63%→69%→75%→85%
├─ Color: Amber→Yellow→Green
└─ Routes to: Full Analysis

Full Analysis (85%+)
├─ Left column: Decision style + 4 strengths
├─ Right column: 3 insights + 3 growth opportunities
├─ Shows: Green accuracy meter (85%+)
├─ Displays: Nova closing message
└─ Routes to: /home (dashboard)
```

---

## Testing What Works

### Run the App
```bash
npm run dev
# Open http://localhost:5173/onboarding
```

### Try the Flow
1. Pick "Ready" mood → see blue accent color
2. Enter birthdate as "1990-01-15"
3. Skip time/place (optional)
4. Watch 3-second animation
5. See 60% blueprint with mood-aware message
6. Click "Help me know better"
7. Answer questions one at a time
8. See accuracy go 60%→85% with color change
9. Review full blueprint
10. Click "Dashboard" button

### Run Tests
```bash
npm test                                    # All tests
npm test Onboarding.test.tsx               # E2E flow
npm test components.test.tsx               # Component units
```

---

## Understanding the State

### userStore (Zustand)
```typescript
// From src/store/userStore.ts
{
  mood: 'ready',                           // Current mood
  profile: {
    dateOfBirth: '1990-01-15',
    timeOfBirth?: '09:30',
    placeOfBirth?: 'New York'
  },
  landingContext: {
    mood: 'ready',                         // Which mood when landing click
    ctaSource: 'why',                      // From which section
    timestamp: '2026-08-07T12:34:56Z'
  }
}
```

### localStorage
```javascript
// Persisted data
user_mood = 'ready'
user_profile = { dateOfBirth, timeOfBirth, placeOfBirth }
finetune_answers = {
  q1: 'Logic',
  q2: 'People',
  q3: 'Collaborative',
  q4: 'Connection'
}
landing_cta_source = 'why'  // 'why' | 'how' | 'who' | 'next'
```

---

## Mood System Explained

### 10 Moods Available
```
🔵 Reflective (default)  - Thoughtful, introspective
🟢 Ready                 - Energized, willing
🔷 Calm                  - Peaceful, focused
🟣 Focused               - Concentrated, driven
🟨 Energetic             - Enthusiastic, vibrant
🟠 Curious               - Inquisitive, exploring
🔴 Stressed              - Tense, pressured
🟣 Confused              - Uncertain, searching
✨ Confident             - Self-assured, capable
⬜ Drained               - Exhausted, depleted
```

### CSS Variables per Mood
Each mood has:
```css
--accent-primary              /* Main color */
--accent-secondary            /* Secondary color */
--accent-light                /* Light variant */
--accent-dark                 /* Dark variant */
--mood-bg-secondary           /* Background tint */
--mood-animation-duration     /* Speed (200-700ms) */
--mood-animation-delay        /* Start delay */
```

### How It Works
```javascript
// 1. User selects mood in EmotionSelector
// 2. useEmotion hook updates context
// 3. CSS variables automatically update
// 4. All components use var(--accent-primary) etc.
// 5. Instant theme change across app
```

---

## Common Tasks for Phase 4

### Add Brain Gateway Integration
```typescript
// In handleFinetuneSubmit (Onboarding.tsx)
const response = await fetch('/api/chat', {
  method: 'POST',
  body: JSON.stringify({
    messages: [{ role: 'user', content: `Answers: ${JSON.stringify(answers)}` }],
    system: 'Analyze these fine-tuning responses...',
    model: 'claude-3-5-sonnet-20241022'
  })
});

// Parse response and update siceResult
```

### Pass Blueprint to Dashboard
```typescript
// In handleComplete (Onboarding.tsx)
navigate('/home', {
  state: { blueprint: siceResult }
});
```

### Connect Real SICE Data
```typescript
// In FullAnalysis component
<FullAnalysis
  profile={{
    decisionStyle: siceResult.disciplines.decisionStyle,
    strengths: siceResult.disciplines.strengths,
    insights: siceResult.disciplines.insights,
    opportunities: siceResult.disciplines.opportunities
  }}
  accuracy={siceResult.accuracy}
  onHome={handleComplete}
/>
```

---

## Debugging Tips

### Check Current Mood
```javascript
// In browser console
localStorage.getItem('user_mood')           // Returns: 'ready'
```

### See Fine-tuning Answers
```javascript
// In browser console
JSON.parse(localStorage.getItem('finetune_answers'))
```

### Watch State Changes
```javascript
// In React DevTools → Zustand tab
// Shows userStore updates in real-time
```

### Verify Styling
```javascript
// Right-click element → Inspect
// Check "Styles" tab for CSS variables
// Should see: background: var(--accent-primary) etc.
```

---

## Common Mistakes to Avoid

### ❌ Hardcoding Blueprint Data
```typescript
// DON'T
<FullAnalysis profile={{ decisionStyle: 'Strategic Planner' }} />
```

```typescript
// DO
<FullAnalysis profile={siceResult.disciplines} />
```

### ❌ Forgetting to Update Accuracy
```typescript
// DON'T
setSiceResult(prev => ({ ...prev }))  // No accuracy change
```

```typescript
// DO
setSiceResult(prev => ({ ...prev, accuracy: 85 }))
```

### ❌ Losing Data on Refresh
```typescript
// DON'T - Only use state
const [data, setData] = useState()
```

```typescript
// DO - Use localStorage backup
const data = userStore.profile || JSON.parse(localStorage.getItem('user_profile'))
```

### ❌ Not Handling Null Data
```typescript
// DON'T
<FullAnalysis profile={siceResult.disciplines} />  // Crashes if null
```

```typescript
// DO
{siceResult && <FullAnalysis profile={siceResult.disciplines} />}
```

---

## Need to Understand More?

### Quick Deep Dives
- **Emotion system:** See `src/context/EmotionContext.tsx`
- **State management:** See `src/store/userStore.ts`
- **Component props:** See JSDoc comments in each component
- **Test examples:** See `src/pages/Onboarding.test.tsx`
- **Styling:** See `src/styles/tokens.css`

### Full Documentation
- **Technical details:** `PHASE4_TECHNICAL_HANDOFF.md`
- **Testing coverage:** `TESTING_REPORT.md`
- **Session work:** `SESSION_SUMMARY.md`

### Ask Questions
1. Check component JSDoc comments
2. Look at test files for usage examples
3. Review this quick start guide
4. Check full technical handoff
5. Ask in team chat if still unclear

---

## TL;DR (Too Long; Didn't Read)

**The Flow:**
Emotion → Birth Data → Animation → 60% Blueprint → 4 Questions → 85% Blueprint → Home

**Key Files:**
- Main: `src/pages/Onboarding.tsx`
- Components: `InitialBlueprint.tsx`, `FinetuningQuestions.tsx`, `FullAnalysis.tsx`
- State: `src/store/userStore.ts`
- Styling: `src/styles/tokens.css`

**What's New:**
- ✨ `InitialBlueprint` (60% display)
- ✨ `FullAnalysis` (85% display)
- 🔄 `FinetuningQuestions` (one Q per screen now)
- 🐛 Fine-tuning answers captured
- 🐛 Blueprint data flows through

**Phase 4 Todo:**
- Connect Brain Gateway API
- Build home dashboard
- Persist to database
- Show loading states

**Tests:** 75+ cases all passing ✅

---

**Happy coding! Questions? See `PHASE4_TECHNICAL_HANDOFF.md` for integration details.**
