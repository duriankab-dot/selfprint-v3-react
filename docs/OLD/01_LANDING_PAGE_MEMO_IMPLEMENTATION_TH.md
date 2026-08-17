# 📄 Landing Page MEMO V2 Implementation Specification

**Date:** 2026-08-07  
**Language:** ไทย  
**Phase:** Phase 3 Frontend  
**Component:** Landing Page (src/pages/LandingPage.tsx)  
**Duration:** 3 days (Aug 8-10)  
**Owner:** Frontend Lead  

---

## 🎯 OBJECTIVE

Refactor Landing Page จาก **form-first design** ไปเป็น **MEMO value-first design** ที่เน้นการสร้าง belief + emotion engagement ก่อน collect birth data

---

## ❌ CURRENT STATE (What's Wrong)

```
Current Flow:
  Hero Text
    ↓
  Birth Data Input Form (First Interaction) ❌
    ↓
  CTA "Create Twin"
```

**Problems:**
- Birth data ยิ่งใหญ่เกินไป (ผู้ใช้ยังไม่รู้ value)
- ไม่มี emotion selector (ไม่ personalized)
- ไม่ track context (ไม่ทราบ intent)
- ดูเหมือน survey, ไม่ใช่ journey

---

## ✅ TARGET STATE (MEMO V2)

```
Landing:
  Hero + Value Prop
    ↓
  Emotion Selector (6 Moods) - FIRST INTERACTION ✓
    ↓
  Section 1: Why (Feature value)
    ↓ Progressive CTA #1
  Section 2: How (Process value)
    ↓ Progressive CTA #2
  Section 3: Who (Success stories)
    ↓ Progressive CTA #3
  Section 4: Next (Call to Action)
    ↓ Progressive CTA #4
  Birth Data Input (END) ✓
    ↓
  Final CTA "Create Twin"
```

**Benefits:**
- Emotion selector = First interaction ✓
- Build belief ก่อนขอ data ✓
- Multiple entry points (CTAs) ✓
- Birth data optional + natural ✓
- Context aware (track CTA source) ✓

---

## 📋 REQUIREMENTS

### 1. Emotion Selector (MANDATORY)

**Location:** เพิ่มหลัง hero text area  
**UI Pattern:**
```
"How are you feeling right now?"

[😊 Ready]  [🎯 Focused]  [💪 Energetic]
[🤔 Curious]  [😌 Calm]  [💭 Reflective]
```

**Behavior:**
- Click mood → store ใน localStorage + React state
- Theme change immediately (data-mood attribute)
- Content sections reference mood (personalization)

**Implementation Example:**
```typescript
// src/components/MoodSelector.tsx
const MoodSelector = ({ onMoodSelect }) => {
  const moods = ['ready', 'focused', 'energetic', 'curious', 'calm', 'reflective'];
  
  const handleMoodClick = (mood) => {
    localStorage.setItem('mood', mood);
    document.documentElement.setAttribute('data-mood', mood);
    onMoodSelect(mood);
  };
  
  return (
    <div className="mood-selector">
      <h2>How are you feeling right now?</h2>
      <div className="mood-grid">
        {moods.map(mood => (
          <button key={mood} onClick={() => handleMoodClick(mood)}>
            {moodEmoji[mood]} {capitalize(mood)}
          </button>
        ))}
      </div>
    </div>
  );
};
```

**Acceptance Criteria:**
- [ ] 6 moods render
- [ ] Click mood → theme changes immediately
- [ ] localStorage persist mood
- [ ] Mobile responsive
- [ ] ARIA labels on buttons

---

### 2. Progressive CTAs (MANDATORY)

**4 Contextual CTAs:**

| Section | Heading | Button | data-cta-source |
|---------|---------|--------|-----------------|
| 1 | Why (Value) | "Let's Create Mine" | why |
| 2 | How (Process) | "Start Building" | how |
| 3 | Who (Social Proof) | "I'm Ready" | who |
| 4 | Next (Main CTA) | "Create Now" | next |

**Each CTA:**
- Stores `cta_source` in localStorage
- Text changes based on mood
- Navigate to Onboarding

**Acceptance Criteria:**
- [ ] 4 CTAs render
- [ ] Each stores cta_source
- [ ] Text mood-aware
- [ ] All navigate correctly
- [ ] Mobile: fullwidth

---

### 3. Birth Data (REPOSITIONING)

**Current:** Top  
**Target:** End (before final CTA)

```
Section 4: "Next"
  ↓
Birth Data Input (Optional)
  - Date of birth (required)
  - Time of birth (optional)
  - Place of birth (optional)
  ↓
Final CTA: "Create Twin"
```

**Why:**
- User understands value first
- Birth data feels natural
- Optional fields feel optional

**Acceptance Criteria:**
- [ ] Date required, time+place optional
- [ ] Data stored (not submitted)
- [ ] Form validation
- [ ] Mobile: 100% width inputs

---

### 4. Context Tracking (MANDATORY)

**Track & Store:**
```javascript
{
  mood: 'ready',
  ctaSource: 'who',
  birthData: {
    dob: '1990-01-15',
    time: '14:30',
    place: 'Bangkok'
  }
}
```

**Pass to Onboarding:**
```typescript
const landingContext = {
  mood: localStorage.getItem('mood'),
  ctaSource: localStorage.getItem('cta_source'),
  birthData: localStorage.getItem('birth_data'),
};

navigate('/onboarding', { state: landingContext });
```

**Acceptance Criteria:**
- [ ] Context stored in localStorage
- [ ] Passed to Onboarding
- [ ] Nova uses context ("From why section?")
- [ ] No data loss

---

### 5. CSS Theme Integration

**Root Element:**
```html
<html data-mood="ready">
```

**CSS Variables by Mood:**
```css
[data-mood="ready"] {
  --accent-color: #00c853;
  --text-primary: #1a1a1a;
  --bg-secondary: #f5f5f5;
}

[data-mood="calm"] {
  --accent-color: #1e88e5;
  --text-primary: #1a1a1a;
  --bg-secondary: #f0f4ff;
}
```

**Acceptance Criteria:**
- [ ] data-mood updates on click
- [ ] CSS vars apply immediately
- [ ] No flicker
- [ ] Dark mode compatible

---

## 📅 IMPLEMENTATION TIMELINE

| Day | Task | Deliverable |
|-----|------|-------------|
| 1 | MoodSelector + Theme | Emotion selector live + theme working |
| 2 | Progressive CTAs + Context | All CTAs + localStorage tracking |
| 3 | Birth Data + Polish | Full landing MEMO-compliant + tested |

---

## 🧪 TESTING CHECKLIST

**Functional:**
- [ ] All 6 moods clickable
- [ ] Theme changes on mood
- [ ] All CTAs navigate
- [ ] Form validation
- [ ] Context localStorage + passed

**Accessibility:**
- [ ] ARIA labels
- [ ] Color contrast WCAG AA
- [ ] Keyboard navigation
- [ ] Screen reader friendly

**Responsive:**
- [ ] Desktop: 1920×1080
- [ ] Tablet: 768×1024
- [ ] Mobile: 375×667

**Performance:**
- [ ] FCP < 2s
- [ ] LCP < 4s
- [ ] Zero console errors

---

## ✅ SUCCESS CRITERIA

**User Experience:**
- Mood selector = first interaction (not form)
- Mood selection feels engaging
- CTAs contextual + natural
- Birth data optional + natural
- < 30 sec to "Create Twin" button

**Technical:**
- All mood colors per design tokens
- Context flows to Onboarding
- Mobile responsive
- WCAG AA pass
- LCP < 4s, FCP < 2s

---

## 📝 FILES

**Create:**
- `src/components/MoodSelector.tsx`
- `src/components/ProgressiveCTA.tsx`
- `src/components/BirthDataInput.tsx`
- `src/styles/landing-page.module.css`

**Update:**
- `src/pages/LandingPage.tsx`
- `src/styles/tokens.css`
- `src/utils/context.ts`

---

**Prepared by:** jb_DEV  
**Status:** 📋 Ready for Frontend Implementation  
**Timeline:** Aug 8-10
