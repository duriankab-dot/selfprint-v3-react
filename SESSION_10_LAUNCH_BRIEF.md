# SESSION 10 — TD-04 + CG-03 FINAL PUSH
**Launch Brief for Next AI Dev Session**

---

## 🎯 Objective
Complete remaining 40% of tech debt (TD-04 + CG-03) → Production-ready, 0 stubs/placeholders.

## 📊 Current State

### ✅ Completed (Session 9)
| Task | Files | Status | Deploy |
|------|-------|--------|--------|
| TD-01 Sentry DSN | SentryService.ts | ✅ Live | Ready |
| TD-05 Schema | structuredData.ts + .env.example | ✅ Live | Ready |
| TD-03 KV | functions/api/rate-limiter.ts + wrangler.toml | ✅ Code ready | *Needs CF KV setup* |

### ⏳ Pending (This Session)
| Task | Scope | Est. Time | Complexity |
|------|-------|-----------|------------|
| **TD-04** | Remove `as any` from SICE (48 occurrences) | 30 min | **Medium** |
| **CG-03** | Thai language full audit (20 .tsx files) | 90 min | **Medium** |
| **Deploy** | Build verify + git commit + push | 10 min | **Low** |

---

## 🔧 TD-04: Remove `as any` from SICE Layer

### Root Cause
`src/types/sice.ts` line 20: `result: unknown` → all engines cast `as any`

### Solution (Step-by-Step)

**Step 1: Create Engine Result Types** (5 min)
```typescript
// Add to src/types/sice.ts after line 100:

export interface PersonalContextResult extends PersonalContext {}
export interface PatternResult extends Array<DetectedPattern> {}
export interface InsightResult extends Array<Insight> {}
export interface AIFeedbackResult {
  feedbackCount: number;
  averageSentiment: number;
  recommendedAdjustment: string;
}
// ... repeat for all 12 engines (copy/paste from existing interfaces)

// Then update SICEOutput:
export interface SICEOutput {
  engineId: number;
  engineName: string;
  result: 
    | PersonalContextResult
    | PatternResult
    | InsightResult
    | AIFeedbackResult
    | TwinStateResult
    | ExperienceResult
    | EnvironmentResult
    | BadgeResult
    | BehavioralForecastResult
    | FutureSelfResult
    | MemoryManagerResult
    | DecisionIntelligenceResult;
  confidence: number;
  executionTime: number;
  error?: string;
}
```

**Step 2: Update SICEOrchestrator** (10 min)
```typescript
// Replace case 1: in extractThemesFromEngine():
case 1: // PersonalContextBuilder
  {
    const context = result.result as PersonalContextResult;  // typed!
    if (context.emotionalState) themes.push(...)
    // No more `as any`
  }
  break;
// Repeat for remaining 11 cases
```

**Step 3: Update Engine Files** (15 min)
- `TwinStateEngine.ts` line 51: `(input as any).personalContext` → `(input as PersonalContextResult).emotionalState`
- `InsightEngine.ts` line 29: same pattern
- `BehavioralForecastEngine.ts` line 54: nested destructure
- Etc. (7 files total, ~2-3 min each)

### Files to Modify
1. `src/types/sice.ts` — Add union types + update SICEOutput
2. `src/services/sice/SICEOrchestrator.ts` — Update extractThemesFromEngine() switch cases (12 cases)
3. `src/services/sice/SICEBridge.ts` — 1 occurrence
4. Engine files (7): TwinStateEngine, MemoryManagerEngine, InsightEngine, FutureSelfEngine, ExperienceEngine, EnvironmentEngine, DecisionIntelligenceEngineAdapter, BadgeEngine, AIFeedbackLoop

### Verification
```bash
npx tsc -b --noEmit  # Must be 0 errors
grep -r "as any" src/services/sice  # Should return only test files
```

---

## 🌍 CG-03: Thai Language Audit Full System

### Strategy: Grep → Component-by-component fix

**Step 1: Identify all hardcoded English** (10 min)
```bash
grep -r "Analysis\|Settings\|Continue\|Click\|Explore" src/*.tsx \
  | grep -v Dashboard  # Skip (already done)
```

**Step 2: Component Priority** (by frequency of hardcoding)
1. **LandingPage.tsx** (877 LOC) — ~8 English phrases
2. **Onboarding.tsx** (768 LOC) — ~6 phrases
3. **AnalysisPage.tsx** (699 LOC) — ~10 phrases (framework + insights)
4. **TwinChat.tsx** (751 LOC) — ~5 phrases
5. **TarotPage.tsx** (670 LOC) — ~7 phrases
6. **ExplorePage.tsx** (938 LOC) — ~12 phrases
7. **PrivacyCenter.tsx** (655 LOC) — ~4 phrases
8. **ChatPage.tsx** (615 LOC) — ~3 phrases
9. Remaining pages + components — ~10 phrases

**Total:** ~65 hardcoded English strings across ~20 files

### Replacement Patterns

**Pattern A: Hardcoded in component**
```typescript
// Before
return <h1>Analysis Results</h1>

// After
import { useLanguage } from '../context/LanguageContext';
const { language } = useLanguage();
const text = language === 'th' ? 'ผลการวิเคราะห์' : 'Analysis Results';
return <h1>{text}</h1>
```

**Pattern B: In config/constants** (preferred)
```typescript
// Add to src/constants/translations.ts (create if not exists)
export const TRANSLATIONS = {
  th: {
    analysisTitle: 'ผลการวิเคราะห์',
    continueButton: 'ดำเนินการต่อ',
    settings: 'การตั้งค่า',
  },
  en: {
    analysisTitle: 'Analysis Results',
    continueButton: 'Continue',
    settings: 'Settings',
  },
};

// Use in component
import { TRANSLATIONS } from '../constants/translations';
const t = TRANSLATIONS[language];
return <h1>{t.analysisTitle}</h1>
```

### Files to Update (in priority order)
1. LandingPage.tsx
2. Onboarding.tsx
3. AnalysisPage.tsx
4. TwinChat.tsx
5. TarotPage.tsx
6. ExplorePage.tsx
7. PrivacyCenter.tsx
8. ChatPage.tsx
9. Remaining (< 5 phrases each)

### Verification
```bash
grep -r "[A-Z][a-z]*\s[A-Za-z]" src/**/*.tsx \
  | grep -v "Dashboard\|// \|import\|const " \
  | head -20  # Show first 20 hardcoded English strings
# Should be 0 after CG-03
```

---

## ✅ Deployment Checklist

### Before Build
- [ ] TD-04: All `as any` removed, TypeScript passes
- [ ] CG-03: All user-visible text is Thai
- [ ] No console errors in dev
- [ ] No TypeScript errors: `tsc -b --noEmit`

### Git Commit (3 commands)
```bash
git add -A
git commit -m "TD-04 + CG-03: Remove as any from SICE, Thai language complete audit"
git push origin master  # Auto-deploy to CF Pages
```

### CF Dashboard (Post-Deploy)
1. Create KV namespace: `RATE_LIMIT_KV` (production + preview)
2. Bind in Functions settings (for TD-03 to work)
3. Add env vars:
   - `VITE_BUSINESS_PHONE`: Real business phone
   - `VITE_BUSINESS_ADDRESS_STREET`: Real address
   - `VITE_BUSINESS_ADDRESS_POSTAL`: Real postal code
   - `VITE_SENTRY_DSN`: Sentry DSN (already set)

### Final Verification
- [ ] `npm run build` passes
- [ ] `tsc -b --noEmit` = 0 errors
- [ ] `npm run lint` = 0 errors (219 warnings OK)
- [ ] CF Pages deployment successful
- [ ] selfprint.one loads without errors
- [ ] Thai UI renders correctly (test browser with `?lang=th`)

---

## 🚀 Actionable Next Steps (Copy-Paste Ready)

### For AI Dev (Session 10)
1. Load `selfprint-senior-dev` skill
2. Create TaskCreate for TD-04 + CG-03 (2 tasks)
3. Start with TD-04:
   - Edit `src/types/sice.ts`: Add all result type interfaces + union
   - Edit `src/services/sice/SICEOrchestrator.ts`: Replace `as any` casts in extractThemesFromEngine() (12 switch cases)
   - Edit engine files: Remove `as any` casts (7 files, 1-2 per file)
   - Verify: `npx tsc -b --noEmit` → 0 errors
4. Then CG-03:
   - Create `src/constants/translations.ts` with TRANSLATIONS object
   - Update 9 major .tsx files: replace hardcoded English with Thai
   - Verify: `grep -r "hardcoded_english" src/**/*.tsx` → 0 results
5. Final:
   - `npm run build` (expect Rolldown binding error on Linux, but tsc -b should pass)
   - `git add -A && git commit && git push`
   - Verify deployment live on selfprint.one

### Time Budget
- TD-04: 30 min (tight, no detours)
- CG-03: 90 min (scan + replace, 5 min per major file)
- Deploy: 10 min
- **Total: 130 min** (sufficient for ~30K tokens at normal rate)

---

## 📌 Critical Notes

1. **No Stubs/Placeholders:** This is production code → all strings must be real Thai translations, not placeholders
2. **Type Safety:** After TD-04, zero `as any` casts in SICE layer
3. **Language Consistency:** Thai text should use established terminology (see Session 5 notes for SICE engine string translations — reuse those)
4. **Test in Browser:** Open CF deployment, set lang query param, verify all UI is Thai
5. **Do NOT Refactor:** Only fix English strings + `as any` — no cosmetic changes

---

## 📂 File Inventory

**Ready to Deploy (no changes needed):**
- ✅ SentryService.ts (TD-01)
- ✅ structuredData.ts (TD-05)
- ✅ functions/api/rate-limiter.ts (TD-03)
- ✅ wrangler.toml (TD-03)

**To Modify (TD-04):**
- src/types/sice.ts (add types)
- src/services/sice/SICEOrchestrator.ts (switch cases)
- 8 engine files (1-2 lines each)

**To Modify (CG-03):**
- src/constants/translations.ts (create new)
- 9 major .tsx files (hardcoded string replacements)

---

## 💡 Pro Tips

- **Token Efficiency:** CG-03 can be done in parallel batch edits if all files follow same pattern
- **Testing:** Run `npm run dev`, navigate through each page, verify Thai text renders
- **Rollback:** If anything breaks, `git reset HEAD~1` reverts the commit
- **Sentry DSN:** Won't error if blank, so missing env var is non-blocking

---

**Status:** 60% complete. Session 10 = final 40% push to production-ready.  
**Target:** All tech debt resolved by end of Session 10, deployment live.

---

*Prepared for: AI Dev (Claude) → jb_DEV (SELFPRINT Senior Developer)*  
*Date: 3 September 2026*  
*Next Session: 3 September 2026 (immediate) or 4 September (new day)*
