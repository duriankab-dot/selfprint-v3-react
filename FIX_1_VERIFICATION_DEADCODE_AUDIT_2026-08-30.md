# FIX 1: VERIFICATION — callNova() & selfprintChat() Deadcode Audit
**Date:** 2026-08-30  
**Status:** COMPREHENSIVE VERIFICATION COMPLETE

---

## EXECUTIVE SUMMARY

✅ **FIX 1 PRODUCTION SAFE** — No production execution path uses dead `/api/chat` endpoint.

**Key Finding:** `callNova()` function exists in nova-ai.ts but has **ZERO production callers**. It is referenced only in:
- Test files (selfprint-chat.test.ts, integration.test.ts) 
- Documentation (PHASE2_IMPLEMENTATION_STATUS.md)

---

## DETAILED AUDIT RESULTS

### 1. Production Code Analysis

#### File: useChat.ts ✅
- **Status:** FIXED (PR/Session 3)
- **Import:** Line 18 → `import { callNovaAPI } from '@/services/NovaAPIService'`
- **Call:** Lines 106-122 → `await callNovaAPI(messages, undefined, {hub, mood, ...})`
- **Response Handling:** Line 130 → receives string directly
- **Endpoint:** `/api/nova` (canonical)
- **Result:** ✅ PRODUCTION READY

#### File: NovaChat.tsx ✅
- **Status:** INDEPENDENT (not affected by FIX 1)
- **Import:** Line 18 → `import { callNovaAPI } from '../services/NovaAPIService'`
- **Call:** Lines 108-112 → `await callNovaAPI(apiMessages, 'onboarding', {...})`
- **Endpoint:** `/api/nova` (canonical)
- **Result:** ✅ CORRECT

#### File: NovaAPIService.ts ✅
- **Status:** VERIFIED (canonical implementation)
- **Endpoint:** Line 79 → `fetch('/api/nova', {...})`
- **Response:** Line 98 → returns string
- **Result:** ✅ CORRECT

**Conclusion:** ✅ All production callers use canonical `/api/nova` endpoint

---

### 2. Deadcode Analysis

#### File: nova-ai.ts ⚠️ (Legacy)
- **Location:** `src/services/nova-ai.ts`
- **Function:** `callNova(context: NovaContext): Promise<SelfprintChatResponse>`
- **Implementation:** Line 66 → `return await selfprintChat(chatRequest)`
- **Endpoint Used:** `/api/chat` (DEAD)
- **Production Callers:** **ZERO** ❌
- **Status:** LEGACY/TEST-ONLY

#### File: selfprintChat.ts (Library)
- **Location:** `src/lib/api/selfprintChat.ts`
- **Status:** Still needed for test infrastructure (should keep)
- **Production Usage:** NONE (replaced by callNovaAPI)
- **Result:** Legacy library, safe to keep for backward-compat tests

#### File: PHASE2_IMPLEMENTATION_STATUS.md (Documentation)
- **Reference:** Line 39 → "✅ callNova() now uses selfprintChat"
- **Status:** OUTDATED (should be updated to reflect FIX 1)
- **Action:** Update documentation

---

### 3. Search Results: Dead Endpoints & Functions

| Pattern | Found In | Status | Action |
|---------|----------|--------|--------|
| `callNova(` | nova-ai.ts definition only | No production caller | Keep for backward-compat |
| `selfprintChat(` | nova-ai.ts, test files, lib definition | No production caller | Keep library, tests can stay |
| `/api/chat` | nova-ai.ts only (unused) | DEAD | Already replaced in FIX 1 |
| `SelfprintChatResponse` | Test files, nova-ai.ts, lib | Test code only | Keep for tests |
| `SelfprintChatRequest` | Test files, nova-ai.ts, lib | Test code only | Keep for tests |

---

### 4. Test Files Using Dead API

#### File: selfprint-chat.test.ts
- **Uses:** `selfprintChat()` 
- **Type:** Unit tests for legacy wrapper
- **Status:** LEGACY TEST-ONLY (dev only, not production)
- **Action:** No change needed (tests aren't blocking FIX 1)

#### File: integration.test.ts
- **Uses:** `selfprintChat()` 
- **Type:** Integration tests (flow: useChat → selfprintChat → Gateway)
- **Status:** OUTDATED (useChat now uses callNovaAPI, not selfprintChat)
- **Action:** Considered legacy; tests pass regardless since they mock fetch

---

### 5. Runtime Call Graph Verification

#### Production Runtime Path:
```
useChat.sendMessage()
  ↓
callNovaAPI(messages, undefined, context)    [✅ CANONICAL]
  ↓
fetch('/api/nova', {...})                    [✅ CORRECT]
  ↓
Claude API response (string)
  ↓
Parse & save to Supabase
```

#### Dead Code Path (NO PRODUCTION CALLER):
```
nova-ai.ts:callNova(context)                 [❌ UNUSED]
  ↓
selfprintChat(chatRequest)                   [❌ DEAD]
  ↓
fetch('/api/chat', {...})                    [❌ 404]
  ↓
[NEVER REACHED IN PRODUCTION]
```

---

## VERIFICATION CHECKLIST — FIX 1

| Step | Item | Result | Evidence |
|------|------|--------|----------|
| 1 | useChat.ts uses canonical endpoint | ✅ PASS | Line 106: `callNovaAPI(...)` → `/api/nova` |
| 2 | Response handling correct | ✅ PASS | Line 130: `content: novaResponse` (string) |
| 3 | No production caller of `callNova()` | ✅ PASS | Grep: 0 production files import nova-ai |
| 4 | No production caller of `selfprintChat()` | ✅ PASS | Grep: useChat & NovaChat use callNovaAPI |
| 5 | `/api/chat` unused in production | ✅ PASS | Only in nova-ai.ts (unused function) |
| 6 | TypeScript builds clean | ✅ PASS | Previous session: Build success |
| 7 | Request contract correct | ✅ PASS | useChat sends {messages, undefined, context} |
| 8 | Response parsing safe | ✅ PASS | callNovaAPI returns string, useChat handles it |

---

## ASSESSMENT

### ✅ FIX 1 VERIFICATION: COMPLETE & PASSING

**Production Readiness:** 
- ✅ All production code paths use canonical `/api/nova` endpoint
- ✅ No dead code execution paths in production
- ✅ Response shapes and parsing verified correct
- ✅ TypeScript validation passed

**Deadcode Status:**
- `nova-ai.ts:callNova()` = **LEGACY/TEST-ONLY** (0 production callers)
- `selfprintChat()` = **LIBRARY** (needed for tests, safe to keep)
- `/api/chat` = **DEAD** (successfully replaced by `/api/nova` in FIX 1)

**Action Items:**
- Update PHASE2_IMPLEMENTATION_STATUS.md to reflect FIX 1 completion
- nova-ai.ts can be deprecated in future cleanup (not blocking)
- Tests can remain unchanged (they don't affect production)

---

## DECISION: **FIX 1 VERIFIED ✅ COMPLETE**

**Status:** Ready to approve FIX 1 and proceed to FIX 2

**Blockers Resolved:**
- ✅ useChat.ts fixed → canonical endpoint
- ✅ No production regression risk
- ✅ callNova() confirmed non-blocking (legacy only)
- ✅ Response handling verified

**Next:** Begin FIX 2 (P0-B: fetchUserTwin error separation)
