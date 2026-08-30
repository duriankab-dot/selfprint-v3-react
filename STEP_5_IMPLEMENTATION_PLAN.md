# STEP 5: IMPLEMENTATION PLAN

**Status:** Verified, Ready to Code

## FIX ORDER & CHECKLIST

### FIX 1: P0-D/E — useChat() → callNovaAPI()

**File:** `src/features/chat/hooks/useChat.ts`

**Problem:**
- Line 18: imports dead `selfprintChat()`
- Line 74: calls `selfprintChat()` → `/api/chat` (404)

**Solution:**
```diff
- import { selfprintChat, type SelfprintChatResponse } from '@/lib/api/selfprintChat';
+ import { callNovaAPI } from '@/services/NovaAPIService';

- const response = await selfprintChat({...})
+ const response = await callNovaAPI(messages, undefined, {
+   hub: currentHub,
+   mood: currentMood,
+   // other context
+ })
```

**Steps:**
1. Replace import
2. Update sendMessage() to use callNovaAPI
3. Adapt response shape (selfprintChat returns SelfprintChatResponse, callNovaAPI returns string)
4. Test sendMessage() works

**Regression Risk:** callNovaAPI response is `string`, selfprintChat is structured object → may break message parsing

**Done?** [ ] Code changed [ ] TypeScript pass [ ] Test

---

### FIX 2: P0-B — fetchUserTwin() error separation

**File:** `src/services/TwinSupabaseService.ts`

**Problem:**
- Lines 27-35: catch() returns null for ALL errors
- Can't distinguish: not found / network / RLS / server error

**Solution:**
```typescript
export async function fetchUserTwin(userId: string): Promise<Twin | null> {
  // ... try block
  if (error) {
    if (error.code === 'PGRST116') return null; // 0 rows
    if (error.code === '42P01') throw new Error('Twin table missing');
    if (error.message?.includes('permission')) throw new Error('RLS failure');
    throw new Error(`DB error: ${error.code}`);
  }
}
```

**Uses:** TwinContext, Dashboard, CoreAwakening lifecycle routing

**Done?** [ ] Code changed [ ] Lifecycle updated [ ] Tests pass

---

### FIX 3: P0-A — Twin Birth critical operations check

**File:** `src/services/CoreAwakeningService.ts`

**Problem:**
- Line 408: Promise.allSettled (fail-soft)
- Line 551: return `success: true` regardless of failedOps

**Solution:**
```typescript
const failedOps = [...];
if (failedOps.length > 0) {
  console.error('Critical operations failed:', failedOps);
  // Option A: throw error (rollback)
  // Option B: mark incomplete state
  // Option C: return failure
  return {
    success: false,
    message: `Twin creation incomplete: ${failedOps.map(f => f.name).join(', ')}`,
  };
}
```

**Decision Needed:** Rollback strategy (transaction vs compensating)

**Done?** [ ] Strategy decided [ ] Code changed [ ] No partial Twin

---

### FIX 4: P0-C — Canonical Intelligence Context + World awareness

**Files:** getNovaPrompt.ts, selfprintChat.ts, useChat.ts

**Problem:**
- getNovaPrompt() has no worldContext parameter
- Nova prompt world-agnostic (same for all 12 worlds)

**Solution:**
1. Add worldContext to NovaPromptConfig
2. Pass world/expertise when calling getNovaPrompt
3. Include in system prompt

**World Context Source:** 
- TBD: SICE? local config? stored preferences?

**Done?** [ ] Contract defined [ ] Prompt updated [ ] Tests pass

---

### FIX 5: P0-B Integration — Dashboard lifecycle routing

**File:** `src/pages/Dashboard.tsx` (or wherever lifecycle decision happens)

**Problem:**
- If fetchUserTwin() returns null, don't know if Twin doesn't exist or error occurred
- Lifecycle may wrong-route user

**Solution:**
- Catch specific errors from fetchUserTwin()
- Route: error → retry/error page; null → onboarding; data → twin app

**Done?** [ ] Error handling [ ] Routing tested

---

## ❌ DO NOT

- [ ] restore `/api/chat`
- [ ] redirect Nova → Twin
- [ ] create wrapper route
- [ ] duplicate SICE pipeline
- [ ] hard-code world expertise
- [ ] return success: true on partial Twin
- [ ] create 12↔12 mapper by guessing

## ✅ VERIFICATION CHECKLIST

### Per Fix:

**P0-D/E:**
- [ ] useChat() calls callNovaAPI
- [ ] No /api/chat references
- [ ] Request shape correct
- [ ] Response parsing works
- [ ] NovaChat still works (independent test)

**P0-B:**
- [ ] fetchUserTwin throws specific errors
- [ ] Dashboard catches and handles
- [ ] Lifecycle doesn't drift
- [ ] "not found" vs "error" properly handled

**P0-A:**
- [ ] Twin Birth returns failure on critical op failure
- [ ] No partial Twin marked success
- [ ] Rollback/cleanup verified
- [ ] DB integrity maintained

**P0-C:**
- [ ] World context sources identified
- [ ] Passed to Nova prompt
- [ ] Example flow shows context flowing
- [ ] No hard-coded fallback

### Overall:
- [ ] npm run build passes
- [ ] TypeScript clean
- [ ] Unit tests (if exist)
- [ ] Integration E2E
- [ ] No dead code (selfprintChat unused)

---

## IMPLEMENTATION SEQUENCE

1. **FIX 1 (P0-D/E):** useChat() → callNovaAPI (lowest risk, isolated)
2. **FIX 2 (P0-B):** fetchUserTwin() errors (foundation for lifecycle)
3. **FIX 3 (P0-A):** Twin Birth checks (foundation for data integrity)
4. **FIX 5 (P0-B Integration):** Dashboard routing (uses FIX 2)
5. **FIX 4 (P0-C):** World context (uses foundation above)

---

**Progress:** Ready to START FIX 1

**Blocker:** None — proceed with fixes 1→5 in order
