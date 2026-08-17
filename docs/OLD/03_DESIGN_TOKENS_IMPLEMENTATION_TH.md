# 📄 Design Tokens + Theme System Implementation

**Date:** 2026-08-07  
**Language:** ไทย  
**Phase:** Phase 3 Frontend  
**Component:** CSS Tokens (src/styles/tokens.css)  
**Duration:** 2 days (Aug 8-9)  
**Owner:** Design + Frontend  

---

## 🎯 OBJECTIVE

สร้าง CSS variable system ที่ support **11 Hubs × 6 Moods = 66 combinations** โดยไม่ต้องเขียน CSS 66 ครั้ง

---

## 📐 TOKEN STRUCTURE

### Level 1: Base Variables (Shared)

```css
/* src/styles/tokens.css */

/* Typography */
--font-size-sm: 12px;
--font-size-base: 16px;
--font-size-lg: 20px;
--font-size-xl: 24px;
--font-weight-regular: 400;
--font-weight-medium: 500;
--font-weight-bold: 700;

/* Spacing */
--spacing-xs: 4px;
--spacing-sm: 8px;
--spacing-md: 16px;
--spacing-lg: 24px;
--spacing-xl: 32px;

/* Radius */
--radius-sm: 4px;
--radius-md: 8px;
--radius-lg: 12px;

/* Shadow */
--shadow-sm: 0 2px 4px rgba(0,0,0,0.1);
--shadow-md: 0 4px 8px rgba(0,0,0,0.12);
--shadow-lg: 0 8px 16px rgba(0,0,0,0.15);
```

---

### Level 2: Color Tokens by Mood (6 sets)

```css
/* Ready (Green energy) */
[data-mood="ready"] {
  --accent-primary: #00C853;
  --accent-secondary: #4CAF50;
  --accent-light: #C8E6C9;
  --accent-dark: #2E7D32;
  
  --text-primary: #1a1a1a;
  --text-secondary: #666666;
  --text-light: #999999;
  
  --bg-primary: #FFFFFF;
  --bg-secondary: #F5F5F5;
  --bg-tertiary: #EEEEEE;
  
  --animation-duration: 300ms;
  --animation-delay: 0ms;
}

/* Calm (Blue serenity) */
[data-mood="calm"] {
  --accent-primary: #1E88E5;
  --accent-secondary: #2196F3;
  --accent-light: #BBDEFB;
  --accent-dark: #0D47A1;
  
  --text-primary: #1a1a1a;
  --text-secondary: #555555;
  --text-light: #888888;
  
  --bg-primary: #FFFFFF;
  --bg-secondary: #F0F4FF;
  --bg-tertiary: #E3F2FD;
  
  --animation-duration: 500ms;
  --animation-delay: 100ms;
}

/* Focused (Purple depth) */
[data-mood="focused"] {
  --accent-primary: #6F42C1;
  --accent-secondary: #7E57C2;
  --accent-light: #E1BEE7;
  --accent-dark: #4527A0;
  
  --text-primary: #1a1a1a;
  --text-secondary: #555555;
  --text-light: #888888;
  
  --bg-primary: #FFFFFF;
  --bg-secondary: #F3E5F5;
  --bg-tertiary: #EDE7F6;
  
  --animation-duration: 400ms;
  --animation-delay: 50ms;
}

/* Energetic (Orange vitality) */
[data-mood="energetic"] {
  --accent-primary: #FF6D00;
  --accent-secondary: #FF9100;
  --accent-light: #FFE0B2;
  --accent-dark: #E65100;
  
  --text-primary: #1a1a1a;
  --text-secondary: #555555;
  --text-light: #888888;
  
  --bg-primary: #FFFFFF;
  --bg-secondary: #FFF3E0;
  --bg-tertiary: #FFE0B2;
  
  --animation-duration: 250ms;
  --animation-delay: 0ms;
}

/* Curious (Cyan exploration) */
[data-mood="curious"] {
  --accent-primary: #00BCD4;
  --accent-secondary: #00ACC1;
  --accent-light: #B2EBF2;
  --accent-dark: #0097A7;
  
  --text-primary: #1a1a1a;
  --text-secondary: #555555;
  --text-light: #888888;
  
  --bg-primary: #FFFFFF;
  --bg-secondary: #E0F2F1;
  --bg-tertiary: #B2DFDB;
  
  --animation-duration: 300ms;
  --animation-delay: 75ms;
}

/* Reflective (Indigo introspection) */
[data-mood="reflective"] {
  --accent-primary: #5E35B1;
  --accent-secondary: #673AB7;
  --accent-light: #EDE7F6;
  --accent-dark: #3F2C70;
  
  --text-primary: #1a1a1a;
  --text-secondary: #555555;
  --text-light: #888888;
  
  --bg-primary: #FFFFFF;
  --bg-secondary: #F3E5F5;
  --bg-tertiary: #EDE7F6;
  
  --animation-duration: 600ms;
  --animation-delay: 150ms;
}
```

---

### Level 3: Hub Tokens (11 sets, per Hub type)

Hub types: Identity, Decision, Emotion, Growth, Relationship, Creativity, Career, Finance, Health, Spirituality, Purpose

**Example: Identity Hub**
```css
/* Identity Hub Overrides */
[data-hub="identity"] {
  --hub-icon: "🔍";
  --hub-focus-area: "Who am I?";
  --hub-depth: "Profound";
  
  /* Override accent if needed */
  /* (Usually combined with mood for full effect) */
}

/* Calm + Identity = Serene self-discovery */
[data-mood="calm"][data-hub="identity"] {
  /* Combines calm colors + identity focus */
  --section-emphasis: "soft";
}
```

---

## 🎨 USAGE IN COMPONENTS

### Button Example
```tsx
<button className="cta-btn">
  Create Twin
</button>

// CSS
.cta-btn {
  background-color: var(--accent-primary);
  color: var(--bg-primary);
  padding: var(--spacing-md) var(--spacing-lg);
  border-radius: var(--radius-md);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-bold);
  border: none;
  cursor: pointer;
  
  transition: all var(--animation-duration) ease;
}

.cta-btn:hover {
  background-color: var(--accent-secondary);
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}
```

### Card Example
```tsx
<div className="blueprint-card">
  <h3>Your AI Twin</h3>
  <p>Information here</p>
</div>

// CSS
.blueprint-card {
  background-color: var(--bg-primary);
  border: 2px solid var(--accent-light);
  padding: var(--spacing-lg);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  
  transition: all var(--animation-duration) ease;
}

.blueprint-card:hover {
  border-color: var(--accent-primary);
  box-shadow: var(--shadow-md);
}

.blueprint-card h3 {
  color: var(--text-primary);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  margin-bottom: var(--spacing-md);
}

.blueprint-card p {
  color: var(--text-secondary);
  font-size: var(--font-size-base);
  line-height: 1.5;
}
```

### Progress Meter Example
```tsx
<div className="progress-meter">
  <div className="bar" style={{ width: '60%' }} />
  <span>60%</span>
</div>

// CSS
.progress-meter {
  width: 100%;
  height: 8px;
  background-color: var(--bg-tertiary);
  border-radius: var(--radius-lg);
  overflow: hidden;
  position: relative;
  margin: var(--spacing-md) 0;
}

.progress-meter .bar {
  height: 100%;
  background: linear-gradient(
    to right,
    var(--accent-primary),
    var(--accent-secondary)
  );
  transition: width 1s ease;
  border-radius: var(--radius-lg);
}

.progress-meter span {
  position: absolute;
  right: var(--spacing-sm);
  top: -24px;
  font-size: 12px;
  font-weight: bold;
  color: var(--accent-primary);
}
```

---

## 🔧 IMPLEMENTATION CHECKLIST

### Day 1: Base + Mood Tokens

**Tasks:**
- [ ] Create `src/styles/tokens.css` base file
- [ ] Add all 6 mood token sets
- [ ] Test: Change `[data-mood]` attribute → colors update
- [ ] Add to HTML root: `<html data-mood="ready">`

**Verification:**
```bash
# In browser console
document.documentElement.setAttribute('data-mood', 'calm');
// Should see immediate color change
```

---

### Day 2: Hub Tokens + Component Integration

**Tasks:**
- [ ] Add 11 hub token overrides (if needed)
- [ ] Update all components to use var() instead of hardcoded colors
- [ ] Import tokens.css in main.tsx
- [ ] Test all 66 combinations (spot check 10+)

**Files to Update:**
- `src/pages/LandingPage.tsx` (use CSS vars)
- `src/pages/Onboarding.tsx` (use CSS vars)
- `src/components/MoodSelector.tsx` (use CSS vars)
- `src/components/Button.tsx` (use CSS vars)
- `src/components/Card.tsx` (use CSS vars)

---

## 🧪 TESTING STRATEGY

### Manual Test Plan

```javascript
// Test 1: Mood switching
document.documentElement.setAttribute('data-mood', 'ready');
// Verify: Green accent
document.documentElement.setAttribute('data-mood', 'calm');
// Verify: Blue accent
document.documentElement.setAttribute('data-mood', 'energetic');
// Verify: Orange accent

// Test 2: Component colors
const button = document.querySelector('.cta-btn');
const computed = getComputedStyle(button);
console.log(computed.backgroundColor); 
// Should match var(--accent-primary) for current mood

// Test 3: Dark mode
document.documentElement.setAttribute('data-theme', 'dark');
// Should apply dark-specific tokens
```

### Automated Tests
```typescript
// src/styles/__tests__/tokens.test.ts
import { render } from '@testing-library/react';

describe('Design Tokens', () => {
  test('mood variables change background color', () => {
    const { container } = render(<div className="test-card" />);
    
    document.documentElement.setAttribute('data-mood', 'ready');
    const card = container.querySelector('.test-card');
    
    expect(getComputedStyle(card).backgroundColor)
      .toBe('rgb(245, 245, 245)'); // ready mood secondary bg
  });
  
  test('all 6 moods have accent colors', () => {
    const moods = ['ready', 'calm', 'focused', 'energetic', 'curious', 'reflective'];
    
    moods.forEach(mood => {
      document.documentElement.setAttribute('data-mood', mood);
      const style = getComputedStyle(document.documentElement);
      const accent = style.getPropertyValue('--accent-primary');
      
      expect(accent.trim()).toBeTruthy();
    });
  });
});
```

---

## 📊 TOKEN REFERENCE TABLE

| Category | Token | Ready | Calm | Focused | Energetic | Curious | Reflective |
|----------|-------|-------|------|---------|-----------|---------|------------|
| **Accent** | --accent-primary | #00C853 | #1E88E5 | #6F42C1 | #FF6D00 | #00BCD4 | #5E35B1 |
| **Light** | --accent-light | #C8E6C9 | #BBDEFB | #E1BEE7 | #FFE0B2 | #B2EBF2 | #EDE7F6 |
| **BG** | --bg-secondary | #F5F5F5 | #F0F4FF | #F3E5F5 | #FFF3E0 | #E0F2F1 | #F3E5F5 |
| **Animation** | --animation-duration | 300ms | 500ms | 400ms | 250ms | 300ms | 600ms |

---

## ✅ SUCCESS CRITERIA

**Technical:**
- [ ] All 6 mood colors render correctly
- [ ] CSS variables update on `data-mood` change
- [ ] No hardcoded colors in components
- [ ] Dark mode support
- [ ] Accessibility: Color contrast WCAG AA

**Testing:**
- [ ] 10+ combinations spot-checked
- [ ] Components responsive
- [ ] Performance: No layout shift on theme change

**Deliverables:**
- [ ] `src/styles/tokens.css` complete (all 6 moods)
- [ ] All components using `var()` for colors
- [ ] Documentation in this file

---

## 📝 FILES

**Create:**
- `src/styles/tokens.css` (complete)

**Update:**
- `src/main.tsx` (import tokens.css)
- All component files (use var() instead of hardcoded colors)

---

## 🔗 REFERENCES

- [CSS Custom Properties (MDN)](https://developer.mozilla.org/en-US/docs/Web/CSS/--*)
- [WCAG Color Contrast](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html)

---

**Prepared by:** jb_DEV  
**Status:** 📋 Ready for Design + Frontend Implementation  
**Timeline:** Aug 8-9
