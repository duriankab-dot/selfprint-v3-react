# P0 #1: Fix Twin Persistence (sessionStorage → Supabase)
**Handoff Document**  
**Date:** 2026-08-17  
**Status:** IN_PROGRESS  
**Token Used:** ~80K/200K  

---

## 📋 **Current State Analysis**

### ✅ What's Done
1. **CoreAwakeningService.ts** (PARTIAL FIX)
   - ✅ Borrow lines 106-127: Saves essence to `awakening_essence` table
   - ✅ Lines 157-195: Retrieves essence from Supabase (not sessionStorage)
   - ✅ Lines 215-228: Updates essence status to 'used' when Twin created
   - **CAVEAT:** Code references table `awakening_essence` which **doesn't exist in schema.sql**

### ❌ What's NOT Done (Still sessionStorage hack)
1. **AICreationSequence.tsx** (MAJOR ISSUE)
   - ❌ Lines 83-86: Still stores `initialPersonalContext` in sessionStorage
   ```typescript
   sessionStorage.setItem('initialPersonalContext', JSON.stringify(context));
   ```
   - ❌ Persists as browser session only — LOST on page refresh/tab close

2. **Missing Database Schema**
   - ❌ Table `awakening_essence` referenced but **NOT in supabase-schema.sql**
   - ❌ No table for `personal_context` storage

---

## 🎯 **Work Breakdown (P0 #1)**

### **Phase A: Database Schema (BLOCKING)**

#### A1. Add `awakening_essence` table to schema.sql
**File:** `src/services/supabase-schema.sql`

```sql
-- Awakening Essence (Twin birth seed data)
CREATE TABLE IF NOT EXISTS awakening_essence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  personal_intelligence jsonb NOT NULL,
  sice_results jsonb NOT NULL,
  synthesis jsonb,
  execution_time integer, -- milliseconds
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'used')),
  twin_id uuid REFERENCES twins(id) ON DELETE SET NULL,
  used_at timestamp,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- Index for fast lookup
CREATE INDEX IF NOT EXISTS idx_awakening_essence_user_id ON awakening_essence(user_id);
CREATE INDEX IF NOT EXISTS idx_awakening_essence_status ON awakening_essence(status);
```

**Action Required:**
- [ ] Insert SQL into supabase-schema.sql
- [ ] Add RLS policy (user can access own essence)
- [ ] Test migration in Supabase console

#### A2. Add `personal_context` table for onboarding context
**File:** `src/services/supabase-schema.sql`

```sql
-- Personal Context (from onboarding, stored for initialization)
CREATE TABLE IF NOT EXISTS personal_contexts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  awakening_essence_id uuid REFERENCES awakening_essence(id) ON DELETE CASCADE,
  context_data jsonb NOT NULL, -- PersonalContext object from PersonalContextInitializer
  initialized_at timestamp,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_personal_contexts_user_id ON personal_contexts(user_id);
CREATE INDEX IF NOT EXISTS idx_personal_contexts_essence ON personal_contexts(awakening_essence_id);
```

**Action Required:**
- [ ] Insert SQL into supabase-schema.sql
- [ ] Add RLS policy
- [ ] Test in Supabase

---

### **Phase B: Remove sessionStorage hack (CODE CHANGES)**

#### B1. Fix AICreationSequence.tsx
**File:** `src/components/onboarding/AICreationSequence.tsx`  
**Lines to Change:** 83-86

**BEFORE (sessionStorage hack):**
```typescript
// In-app notification (would integrate with notification store if available)
// This is handled by the UI layer via toast/alert component

// Email notification would be handled by backend/Supabase edge function
// Not implemented here as it requires email service configuration
```

**AFTER (save to Supabase):**
```typescript
try {
  const { data: savedContext, error } = await supabase
    .from('personal_contexts')
    .insert({
      user_id: onboardingData.userId,
      context_data: context,
      initialized_at: new Date().toISOString(),
    })
    .select('id')
    .single();

  if (error) {
    console.error('Failed to save PersonalContext to Supabase:', error);
    // Fallback: still use sessionStorage if Supabase fails
    sessionStorage.setItem(
      'initialPersonalContext',
      JSON.stringify(context)
    );
  }

  setInitState({ isInitializing: false, error: null, isSuccessful: true });
} catch (err) {
  console.error('Error initializing PersonalContext:', err);
  // Fallback to sessionStorage
  sessionStorage.setItem(
    'initialPersonalContext',
    JSON.stringify(context)
  );
  setInitState({
    isInitializing: false,
    error: null, // don't fail the ceremony over persistence
    isSuccessful: true,
  });
}
```

**Key Changes:**
- [ ] Import supabase (already imported likely, check imports)
- [ ] Save context to `personal_contexts` table
- [ ] Keep sessionStorage as fallback only (not primary)
- [ ] Don't fail ceremony if Supabase save fails

#### B2. Update CoreAwakeningService.initializeTwin()
**File:** `src/services/CoreAwakeningService.ts`  
**Lines:** 157-195

**Needed Addition:** Link `personal_context` to essence when Twin is created

```typescript
// After essence is retrieved (line 195), add:
// Link personal context to essence (if exists)
const { data: personalContext } = await supabase
  .from('personal_contexts')
  .select('id')
  .eq('user_id', userId)
  .order('created_at', { ascending: false })
  .limit(1)
  .single();

if (personalContext) {
  await supabase
    .from('personal_contexts')
    .update({
      awakening_essence_id: essence.id,
    })
    .eq('id', personalContext.id);
}
```

**Action Required:**
- [ ] Add code after line 195
- [ ] Test that personal context links to essence correctly

---

### **Phase C: Testing**

#### C1. Unit Tests
**File:** `src/services/__tests__/CoreAwakeningService.integration.ts`

**Test Cases Needed:**
- [ ] Test essence created in Supabase (not sessionStorage)
- [ ] Test essence retrieved correctly
- [ ] Test essence marked as 'used' after Twin creation
- [ ] Test personal context saved and linked to essence
- [ ] Test that refreshing page still has essence available (persistence check)

#### C2. E2E Test
**File:** Create `src/__tests__/TwinPersistence.e2e.ts`

```typescript
test('Twin Persistence: sessionStorage → Supabase', async () => {
  // 1. Create user
  // 2. Start Awakening → essence should be in Supabase
  // 3. Refresh page → essence still accessible
  // 4. Name Twin → essence linked and marked 'used'
  // 5. Refresh again → Twin still exists
});
```

---

### **Phase D: Database RLS Policies**

**File:** `src/services/supabase-schema.sql`  
**Add at end:**

```sql
-- RLS for awakening_essence
ALTER TABLE awakening_essence ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can access own essence" ON awakening_essence
  FOR ALL USING (auth.uid() = user_id);

-- RLS for personal_contexts
ALTER TABLE personal_contexts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can access own context" ON personal_contexts
  FOR ALL USING (auth.uid() = user_id);
```

---

## 🛠️ **Implementation Checklist**

- [ ] **A1:** Add `awakening_essence` table + index + RLS
- [ ] **A2:** Add `personal_contexts` table + index + RLS
- [ ] **B1:** Fix AICreationSequence.tsx (remove primary sessionStorage usage)
- [ ] **B2:** Update CoreAwakeningService.initializeTwin() (link personal context)
- [ ] **C1:** Write unit tests for essence persistence
- [ ] **C2:** Write E2E test for full persistence flow
- [ ] **D:** Apply RLS policies to new tables
- [ ] **VERIFY:** `tsc -b && npm run build` passes
- [ ] **GIT:** `git add` + `git commit` + `git push`

---

## 🚀 **Next Steps for Session 2**

1. **Read this document** to understand context
2. **Run schema migrations** in Supabase (A1 + A2)
3. **Fix AICreationSequence.tsx** (B1)
4. **Update CoreAwakeningService.ts** (B2)
5. **Write tests** (C1 + C2)
6. **Deploy & verify** on staging
7. **Mark P0 #1 COMPLETE** when all checklist done

---

## 📌 **Key Principles (from selfprint-senior-dev skill)**

- ✅ **DO:** Persist essence to Supabase (replace all sessionStorage for Twin data)
- ✅ **DO:** Fallback to sessionStorage only as last resort (not primary)
- ✅ **DO:** Add comprehensive tests before marking done
- ✅ **DO:** Verify `tsc -b && npm run build` passes
- ❌ **DON'T:** Leave sessionStorage as primary storage
- ❌ **DON'T:** Skip tests "to save time"
- ❌ **DON'T:** Commit broken code (always verify build)

---

## 📊 **Impact If Not Fixed**

- 🔴 Twin essence lost on page refresh → Core Awakening ceremony breaks
- 🔴 Personal context evaporates → SICE engines have no input data
- 🔴 Decision Intelligence depends on Twin persistence → blocked until fixed
- 🔴 Personal Intelligence quality degrades → affects entire platform

---

## 🎯 **Definition of Done (P0 #1)**

✅ All sessionStorage references for Twin/essence data removed  
✅ Essence persists to Supabase (awakening_essence table)  
✅ Personal context persists to Supabase (personal_contexts table)  
✅ Refresh page → Twin essence still accessible  
✅ Refresh page → Personal context still accessible  
✅ Unit tests pass  
✅ E2E test passes  
✅ `tsc -b && npm run build` clean  
✅ Code committed and pushed  

---

**Created by:** AI Development  
**For:** SELFPRINT V3 Production Completion  
**Effort Estimate:** 2-3 hours
