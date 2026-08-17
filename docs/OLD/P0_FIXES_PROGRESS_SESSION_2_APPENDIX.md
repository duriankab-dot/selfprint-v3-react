# P0-2 Plan: Mock Data Replacement

**Status:** Ready to execute  
**Scope:** Replace 3 hard-coded mock data patterns with API calls  
**Time:** ~45-60 min  

---

## 📋 Mock Data Items Found

| File | Line | Type | Current (Mock) | Target (API) |
|------|------|------|---|---|
| **DecisionForm.tsx** | 62-69 | Create Decision | Return mock object | POST `/api/decisions` or Supabase |
| **DecisionLogger.tsx** | 77-79 | Fetch Decisions | Return `[]` | GET `/api/decisions` or Supabase select |
| **TwinChat.tsx** | 14 | Send Message | TODO comment (no-op) | POST `/api/chat` or Supabase |

---

## 🔧 Implementation Strategy

### Option A: Use Supabase (Recommended)
- Follow existing pattern in `supabase-service.ts`
- Add helper functions: `saveDecision()`, `getUserDecisions()`, `saveTwinMessage()`
- Benefit: Type-safe, centralized, consistent with codebase

### Option B: Use REST API
- Create/use backend endpoints
- Call via `fetch()` with Bearer token
- Benefit: Decoupled from DB, flexible

### Selected: **Option A (Supabase)**
Reasoning: Project already uses Supabase for auth, chat_messages, etc.

---

## ✅ Checklist: Files to Update

- [ ] **1. src/services/supabase-service.ts**
  - Add `saveDecision(userId, data)`
  - Add `getUserDecisions(userId, limit?)`
  - Add `saveTwinMessage(userId, message)`

- [ ] **2. src/components/features/DecisionForm.tsx**
  - Replace `mutationFn` to call `saveDecision()`
  - Remove TODO comment

- [ ] **3. src/components/features/DecisionLogger.tsx**
  - Replace `queryFn` to call `getUserDecisions()`
  - Remove TODO comment

- [ ] **4. src/pages/TwinChat.tsx**
  - Implement message send logic
  - Call `saveTwinMessage()`
  - Remove TODO comment

---

## 🏗️ Function Signatures (to add to supabase-service.ts)

```typescript
/**
 * Save a decision to Supabase
 */
export async function saveDecision(
  userId: string,
  data: { title: string; context: string; expectedOutcome: string; confidence: number }
): Promise<{ id: string } | null>

/**
 * Fetch user's decisions from Supabase
 */
export async function getUserDecisions(
  userId: string,
  limit?: number
): Promise<DecisionInfo[]>

/**
 * Save Twin chat message to Supabase
 */
export async function saveTwinMessage(
  userId: string,
  message: string,
  role: 'user' | 'twin'
): Promise<boolean>
```

---

## 📊 Expected Changes

- **Lines modified:** ~15-20 (mostly in query/mutation functions)
- **Files touched:** 4
- **Breaking changes:** None (API compatible)
- **Build impact:** None (no structural changes)

---

## ⚠️ Notes

1. **Database schema:** Assumes Supabase tables exist:
   - `decisions` (id, user_id, title, context, expected_outcome, confidence, created_at)
   - `twin_messages` (id, user_id, message, role, created_at)
   
2. **Error handling:** Keep existing error UI (Alert component)

3. **No cache invalidation:** React Query will handle via existing `queryClient.invalidateQueries()`

