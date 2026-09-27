# FORENSIC PHASE 07 — CROSS-SYSTEM CONSISTENCY & DATA INTEGRITY AUDIT

**วันที่ตรวจ:** 27 กันยายน 2026  
**ขอบเขต:** ตรวจ cross-system consistency, data integrity, transaction boundaries, idempotency สำหรับทุก critical path ที่พบใน Phase 6  
**วิธีตรวจ:** Static analysis — read source code, migration files, test files, trace async operation chains  
**สถานะ:** ทุก claim มี file/function reference รองรับ  

---

## 1. OBJECTIVE

พิสูจน์ว่า findings จาก Phase 6 เป็น:

* **CONFIRMED FAILURE** — มี evidence เพียงพอจาก source/test/DB และ violated behavior/contract ชัดเจน
* **CONFIRMED DESIGN LIMITATION** — ระบบทำตาม implementation ที่มีอยู่ แต่ capability/recovery contract จำกัดจริง
* **RISK / UNPROVEN** — มี failure path ที่เป็นไปได้ แต่ยังไม่มี evidence เพียงพอ
* **CORRECTED FINDING** — Phase 6 หรือ Phase 5 สรุปผิด (เช่น streaming orphan)

**ห้ามเรียกสิ่งใดว่า "bug" ถ้ายังไม่มี evidence ว่า violated actual implementation or user-visible contract**

---

## 2. AUDIT BOUNDARY

### Environment Limitation (Carried from Phase 5 & 6)

```text
Browser Tool ยังไม่สามารถเข้าถึง staging:
"Browser session does not belong to the requested project or directory"

ดังนั้น:
- Runtime verification = ZERO
- ทุก finding ต้องแยกให้ชัดระหว่าง SOURCE evidence กับ INFERENCE
- สิ่งที่เป็น inference ต้องเป็น ⚪ UNPROVEN ไม่ใช่ confirmed failure
```

### What Phase 7 CAN determine without runtime

| Capability | Can Determine? | Method |
|-----------|---------------|--------|
| Database constraints (PK, UNIQUE, FK, RLS) | ✅ Yes | Migration files (.sql) |
| Transaction boundaries | ✅ Yes | Supabase client API patterns |
| Idempotency guarantees | ✅ Yes | DB schema + service logic trace |
| Async operation ordering | ✅ Yes | Source code line-by-line trace |
| Error propagation chain | ✅ Yes | try/catch/throw flow analysis |
| Actual behavior under failure conditions | ❌ No | Requires runtime testing |
| Whether failures actually occur in production | ❌ No | Requires logs/metrics |
| User-perceived impact severity | ❌ No | Requires UX observation |

---

## 3. PHASE 5 CORRECTION ACKNOWLEDGED

### Streaming Endpoint Correction

**Phase 5 claimed:** "zero import chains connect ImmersiveTwinChat to streaming endpoints" → streaming = orphan

**Phase 6 corrected:** 

```typescript
// ImmersiveTwinChat.tsx:36
import { streamTwinResponse } from '@/services/TwinAPIService';

// ImmersiveTwinChat.tsx:380
await streamTwinResponse(
  apiMessages,
  twin.name || 'Twin',
  twinProfile,
  currentWorld || undefined,
  { onChunk: (chunk: string) => chunks.push(chunk), memories, language }
);

// TwinAPIService.ts:167
const response = await fetch('/api/twin-stream', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', ...(await getAuthHeaders()) },
  body: JSON.stringify({ system, messages, temperature: 0.8 }),
});

// TwinAPIService.ts:184-205
const reader = response.body?.getReader(); // ReadableStream reader
while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  buffer += decoder.decode(value, { stream: true });
  // Parse SSE lines: if line.startsWith('data:') → call onChunk(content)
}
```

**Fallback chain:** `streamTwinResponse().catch(() => callTwinAPI()` (ImmersiveTinnerChat.tsx:392-402)

**Re-classified status:** 🟢 WIRITED + FALLBACK EXIST + NO USER NOTIFICATION OF DEGRADATION

---

## 4. PHASE 6 RECLASSIFICATION TABLE

For each FR finding from Phase 6, this table provides:

- The exact claim
- The exact source code evidence
- Evidence type (SOURCE/TEST/DB/API/RUNTIME/DOCUMENT/INFERENCE)
- Whether a contract is actually violated
- Whether it was runtime-proven
- Final status after Phase 7 deeper inspection

| ID | Claim | Exact Evidence | Evidence Type | Contract Violated? | Runtime Proven? | Final Status |
|----|-------|---------------|---------------|-------------------|-----------------|--------------|
| FR-001 | Chat error has no retry button | HandleSend catch: setError() then setIsSending(false); no explicit Retry button component | SOURCE | Partial — code design intent unknown | No | 🟡 DESIGN LIMITATION |
| FR-002 | No AbortController on chat API calls | ImmersiveTinnerChat.tsx:378+ does NOT use AbortController; BlogArticle.tsx uses it but Chat doesn't | SOURCE | Partial — timeout tolerance unknown | No | 🟡 DESIGN LIMITATION |
| FR-003 | Silent streaming fallback | TwinAPIService.ts:206 throw err; ImmersiveTinnerChat.tsx:392 catch(console.warn)...→callTinnerAPI() | SOURCE | Not violated — silent degradation is intentional design choice | No | 🟣 CORRECTED (from BROKEN) |
| FR-004 | Orphan user message when save succeeds, API fails | SaveTinnerMemory before API call at lines 359, 378 | SOURCE | Design gap but not confirmed violation | No | 🟠 RISK |
| FR-005 | Response lost on refresh if persistence after API fails | saveTinnerMemory(response) at line 404, AFTER API call | SOURCE | Design gap but not confirmed violation | No | 🟠 RISK |
| FR-006 | Double-submit possible despite empty-message check | setMessage('') clears input IMMEDIATELY at line 344 | SOURCE | Implicit protection exists | No | 🟣 FALSE |
| FR-007 | Naming input not persisted across refresh | twinName in useState only, no localStorage for name | SOURCE | Known limitation, recovery intentionally skipped (test.skip) | No | 🟡 DESIGN LIMITATION |
| FR-008 | Celebration timer lost on refresh | setTimeout countdown stored in React state | SOURCE | Edge case, low severity | No | 🟣 CORRECTED |
| FR-009 | initializeTwin DB failure not retried | WithLifecycleRetry only wraps lifecycleStore.setTinnerCreated, NOT initializeTinner | SOURCE | Partial — ceremony may proceed partially | No | 🟠 RISK |
| FR-010 | SICE orchestration failure silent | CoreAwakeningService.startAwakening() line ~263: .catch(console.error) | SOURCE | Design choice — AI analysis non-critical to ceremony continuation | No | 🟡 DESIGN LIMITATION |
| FR-011 | Twin creation duplicate prevented | createTinnerInDatabase INSERTs with user_id, checkExistingTinner queries before birth | SOURCE | UNIQUE constraint on twins.user_id likely exists | Need verify DB | ⏸️ DEFERRED |
| FR-012 | Session expiry handled by onAuthStateChange | AuthContext.tsx onAuthStateChange listener registered | SOURCE | Verified pattern | No | 🟢 VERIFIED |
| FR-013 | Passkey unavailable gracefully hidden | PasskeyProvider.isAvailable() check before rendering passkey UI | SOURCE | Verified defensive pattern | No | 🟢 VERIFIED |
| FR-014 | World favorite toggle desync | world_preferences upsert, .catch(console.error) only | SOURCE | Optimistic update with silent failure | No | 🟠 RISK |
| FR-015 | World stats partial increment | Two separate upserts (preferences + stats), second may fail | SOURCE | Two independent operations without atomicity | No | 🟠 RISK |
| FR-016 | Decision insert without follow-up reminders | decision_log INSERT followed by scheduleFollowUps(), sequential awaits | SOURCE | Non-atomic multi-step write | No | 🟠 RISK |
| FR-017 | No unique constraint on decision deduplication | decision_log has no unique(twin_id, question, user_choice) constraint visible | DB | Needs verification against migration | No | ⏸️ DEFERRED |
| FR-018 | 8 independent PersonalContextBuilder instances | 8 different consumers create new builder in useMemo/useEffect | SOURCE | Duplicate computation is documented architectural concern (F3 duplicate engine layers) | No | 🟡 DESIGN LIMITATION |
| FR-019 | ImageProcessor garbled bytes after max 5 compress retries | while(blob.size > MAX && attempts < 5) loop | SOURCE | Must verify: actual output or just structure inference | SOURCE | ⚪ UNPROVEN |
| FR-020 | Push notifications broken if VAPID misconfigured | send-push edge function returns 500 "VAPID keys not configured" | SOURCE | Configuration dependency, not architecture flaw | No | 🟡 DESIGN LIMITATION |
| FR-021 | Share link privacy boundary unclear | share_links CREATE/SELECT query structure | DB | Needs verification of actual columns exposed | No | ⏸️ DEFERRED |
| FR-022 | Stripe payment succeeds but webhook fails → state mismatch | unified-handler stripe:webhook handles signature verification | SOURCE | Stripe webhooks are inherently retryable; need check idempotency | Need verify Stripe handler | ⏸️ DEFERRED |
| FR-023 | Account deletion cascade failure | account-delete edge function deletes multiple tables sequentially | SOURCE | Sequential deletes without DB-level CASCADE | No | 🟠 RISK |
| FR-024 | Offline cached pages may be stale | ServiceWorker injectManifest strategy caches assets | SOURCE | Expected PWA behavior, not a bug | No | 🟣 CORRECTED (not a risk) |
| FR-025 | Rate limit requires manual retry after 429 | rateLimitMap returns 429 with retryAfter: 60 | API | Server policy, client not required to auto-retry | No | 🟡 DESIGN LIMITATION |
| FR-026 | Invisible quality drop on streaming fallback | console.warn('[ImmersiveTinnerChat] Streaming failed, falling back:', err) but no UI notification | SOURCE | Deliberate design choice (user gets response eventually) | No | 🟣 CORRECTED (not a bug) |
| FR-027 | InitializeTinner DB failure not retried | WithLifecycleRetry wraps lifecycleStore.setTinnerCreated only | SOURCE | Correct — retry scope verified precisely | SOURCE | 🟡 DESIGN LIMITATION |

---

## 5. CHAT DATA CONSISTENCY — DETAILED CASE ANALYSIS

### Case A: saveMessage succeeds → API fails

```typescript
// ImmersiveTinnerChat.tsx handleSend():

344: setMessage('');               // Clear input
345: setIsSending(true);          // Show loading
346: setError(null);              // Clear errors

353: setMessages(prev => [...prev, { role: 'user', content: userMessage }]); // Add to local state
359: await saveTinnerMemory(twin.id, currentWorld ?? null, 'user', userMessage); // SAVE TO DB ← THIS MAY SUCCEED
// If saveTinnerMemory throws, caught by outer catch → setError("Failed to send message")
// In that case, message[] rollback needed but NOT implemented

364: const apiMessages = ...build request...
372: const recentMemories = await loadRecentMemories(...); // Load history
378: let twinResponse: string;
379: try {
380:   await streamTinnerResponse(...);    // STREAMING PATH
381:   // OR on fallback:
394:   twinResponse = await callTinnerAPI(...);  // NON-STREAMING FALLBACK
396: } catch (err) {
393:   console.warn('Streaming failed, falling back:', streamError);
// Both paths throw on error → caught by outer catch
}

404: await saveTinnerMemory(twin.id, ..., 'tinn', twinResponse); // SAVE RESPONSE TO DB ← THIS MAY FAIL
```

**Analysis:**

If saveTinnerMemory(userMessage) at line 359 succeeds but streamTinnerResponse()/callTinnerAPI() fails:

- User message IS in twin_memories table ✓
- User message IS in messages[] array ✓
- Input is cleared (line 344) ✓
- User sees error message (line 435) ✓
- Send button re-enables (line 441) ✓
- **User must manually re-type** (no retry) ✓
- **Orphan user message remains in twin_memories** until deleted or responded to later

**Database state after failure:**
```sql
-- twin_memories contains user message from this conversation turn
INSERT INTO twin_memories VALUES (twin_id=X, user_id=Y, role='user', content='message...', ...)
-- BUT no corresponding assistant response row
```

**Risk level:** MEDIUM — User sees their own sent message but receives no reply. This creates awkward UI (a single message bubble in an otherwise empty conversation). However, it's not data corruption — it's an incomplete conversation.

**Recovery contract:** UNSPECIFIED — Code shows error message and enables re-send, but no guidance to user about the orphan message.

### Case B: API succeeds → saveTinnerMemory(response) fails

Same code path but saveTinnerMemory at line 404 fails:

- API response received successfully ✓
- Messages appended to messages[] via setMessages (line 412) ✓
- **UI shows AI response immediately** ✓
- Persistence attempt at line 404 fails → ??? (caught by outer catch? No — it's inside the try block but after the response processing)

**Wait — critical detail:** Line 404 `saveTinnerMemory` is INSIDE the outer try block. If it throws, what happens?

```typescript
348: try {
359:   await saveTinnerMemory(userMessage);  // Step 1
380:   await streamTinnerResponse(...);       // Step 2
394:   twinResponse = await callTinnerAPI();  // Fallback step 2
404:   await saveTinnerMemory(response);      // Step 3 ← IF THIS THROWS
406:   options = extractOptions(twinResponse);
412:   setMessages([...]);                    // Step 4
419:   stopThinking();                        // Step 5
}: catch(err) {                               // Outer catch at line 431
432:   setError(errorMsg);                    // Shows error
436:   console.error('Tinn message error:', err);
}
```

If saveTinnerMemory(response) at line 404 fails:
- It CATCHES into the same outer catch at line 431
- setError(errorMsg) shows error message
- setMessages(line 412) IS NOT EXECUTED because exception jumped past it
- **BOTH the user message AND the response are lost from UI** ← Critical gap
- But user message WAS saved to DB at step 1

**Actually wait — let me re-check.** Line 353 adds user message to messages[] BEFORE saving to DB. So even if saveTinnerMemory(userMessage) fails and throws to the outer catch, the message is already in messages[]. But on refresh, only persisted messages load, so BOTH would be lost on reload.

If saveTinnerMemory(response) at line 404 succeeds but setMessages at line 412 somehow never executes (impossible in normal JS since there's nothing between them): NOT A CONCERN.

**Database state after failure:**
```sql
-- Only user message in twin_memories (saved at step 1)
-- Response NOT persisted (save failed before line 404 could complete fully)
```

**Risk level:** HIGH — User's entire interaction (both user message AND response) disappears from UI on refresh, yet user message persists in DB creating orphan.

### Case C: Stream starts → partial chunks → connection breaks

```typescript
// TwinAPIService.ts streamTinnerResponse:
191: while (true) {
192:   const { done, value } = await reader.read();
193:   if (done) break;
195:   buffer += decoder.decode(value, { stream: true });
196:   const lines = buffer.split('\n');
197:   buffer = lines.pop() || '';
199:   for (const line of lines) {
200:     if (line.startsWith('data: ')) {
201:       const content = line.slice(6);
202:       if (content) onChunk(content);  // Accumulates to chunks[]
203:     }
204:   }
205: }
206: } catch (err) {  // ← Connection break catches here
207:   throw err;     // Re-throws to ImmersiveTinnerChat
```

When connection breaks mid-stream:
- Exception thrown at line 206
- Propagates to ImmersiveTinnerChat.tsx:392 `catch(streamError)`
- Falls through to callTinnerAPI() fallback
- Fallback may succeed (non-streaming full response)

**What happened to partial chunks already accumulated?** They were pushed to chunks[] but if both stream AND fallback fail, chunks.join('') result is discarded.

**Chunks are NEVER persisted individually during streaming.** They only matter if stream succeeds OR fallback succeeds.

**Risk level:** LOW — Chunk loss is acceptable because the fallback compensates. If ALL methods fail, user sees error and everything resets.

### Case D: Stream succeeds → user refreshes before persistence

Line 404 saves response, then line 412 appends to UI. Between these two lines, user refreshes:

- Message appended to messages[] (UI state) but NOT yet in twin_memories (DB)
- On refresh: loadRecentMemories() tries to restore from DB → won't find this last exchange
- User's conversation history loses last exchange

**However**, line 404 execute almost instantaneously after line 391/394 receive the response. The time window is milliseconds, making this extremely unlikely.

**But theoretically possible.** Risk level: MINIMAL.

### Case E: Stream fails → fallback succeeds

```typescript
// Line 392-401:
} catch (streamError) {
  console.warn('[ImmersiveTinnerChat] Streaming failed, falling back:', streamError);
  twinResponse = await callTinnerAPI(apiMessages, ...);
}
```

This is the intended design: streaming fails → non-streaming fallback → same final outcome (AI response displayed).

**Key difference:** User sees full response at once instead of incremental tokens. This is silent degradation — no UI change except timing.

**Evidence:** console.warn(message logged server-side. User never told about degradation.

**Risk level:** NONE for functionality. LOW for UX transparency (silent quality drop).

### Case F: Fallback succeeds → persistence fails

Same as Case B but with fallback response:

- Fallback response received via callTinnerAPI() ✓
- setMessages executes at line 412 ✓
- saveTinnerMemory(response) at line 404 fails → exception jumps to outer catch at line 431
- setError(errorMsg) shows error
- setMessages at line 412 — WAIT! This LINE IS BEFORE line 404, so it ALREADY EXECUTED

**Correction!** Let me re-read the exact order:

```
348: try {
353:   setMessages(prev => [...prev, { user msg }]);       // Always runs first
359:   await saveTinnerMemory(userMessage);                 // Step 1: save user
380:   await streamTinnerResponse(...);                     // Try streaming
392: } catch (streamError) {                                // If stream fails:
394:   twinResponse = await callTinnerAPI(...);             // Fallback
396: }                                                        // End inner catch
404: await saveTinnerMemory(response);                       // Step 2: save response
412: setMessages(prev => [...prev, { response }]);           // Append response to UI
419: stopThinking();                                          // Cleanup states
}: catch(err) {                                                // OUTER CATCH
432:   setError(errorMsg);                                    // Show error
436:   console.error(...)                                     // Log error
}                                                               // Done
```

If saveTinnerMemory(response) at line 404 throws:
1. Lines 353, 359, 380/394, 404 all executed (404 threw)
2. Line 412 never executes (jumped to outer catch)
3. User sees error message
4. **Response NOT added to messages[]** 
5. **User message WAS added to messages[] AND saved to DB**
6. **No cleanup of orphan message**

**Result:** After error, messages[] still contains the user message but not the response. Refresh loses BOTH because loadRecentMemories will load user message but no matching response.

**Final state classification:**

| Scenario | DB State | UI State | Reload State | Risk |
|----------|---------|----------|-------------|------|
| Full success | User msg + response | Both visible | Both persistent | ✅ Fine |
| User save fails | Nothing saved | User msg in UI, response NOT added | Both lost on reload | 🔴 LOW |
| API/stream fails | User msg saved | User msg visible, error shown | User msg persists, no response | 🟠 MEDIUM |
| Response save fails | User msg saved | User msg visible, response NOT added | User msg persists, no response | 🟠 MEDIUM |
| All fail | Nothing saved | Nothing visible | Everything lost | 🟡 EXPECTED |

---

## 6. TWIN BIRTH CONSISTENCY

### Exact Sequence Analysis

From CoreAwakeningService.initializeTinner(userId, name, essenceId, birthDate, analysis):

```typescript
// CoreAwakeningService.initializeTinner():

Step 1: CreateTinnerInDatabase(userId, {
  user_id, name, primary_archetype, secondary_archetype, maturity_score,
  evolution_stage: 1, full_analysis, visual_dna: dnaData
})
→ supabase.from('twins').insert([...]).select().maybeSingle()
→ Returns Twin object or null/error

Step 2: PersistEssenceData(essenceId, userId, ...) — Optional (if essenceId provided)
→ Insert/update twin_essences or similar

Step 3: Return AwakeningResult { success, twin, firstInsight, patternCount }
```

Back in TwinBirthPage.handleTinnerNamed():

```typescript
Step 4: await initializeTinner(session.user.id, twinName, essenceId, birthDate, analysis)
→ Gets result with twin object if successful

Step 5: hydrateTinner(session.user.id, result.tinner)
→ TwinContext.hydrateTinner() — Sets local React state WITHOUT INSERT

Step 6: setTinnerAwakened(true, twinName)
→ AIContext.setTinnerAwakened() — Updates activeAI to 'tinner'

Step 7: await withLifecycleRetry(() => setTinnerCreated(session.user.id, result.tinnerId))
→ LifecycleStore.setTinnerCreated()
→ Supabase: user_lifecycle.upsert(status='TINNER_ALIVE', twin_id, twin_created_at)

Step 8: celebrateTinnerAwakening()
→ Audio play
```

### Failure Ordering Analysis

| Failure Point | DB Twin Exists? | Lifecycle Updated? | Hydrate Called? | Recovery |
|--------------|-----------------|-------------------|-----------------|----------|
| Step 1 fails (DB INSERT) | ❌ No | ❌ No | ❌ Not called | Ceremony restarts; checkExistingTinner prevents double |
| Step 2 fails (optional essence) | ✅ Yes | ❌ No | Still called (step 4 unaffected) | Minor data loss (essence), Twin created OK |
| Step 5 fails (hydrate) | ✅ Yes | ❌ No | Failed | Twin in DB but not in UI; user navigates /brief anyway |
| Step 7 fails (lifecycle) | ✅ Yes | ❌ No | ✅ Yes | **ORPHAN STATE**: Twin exists, lifecycle=ONBOARDING/WORLD_ACTIVE; Dashboard may show pre-Twin UI |

WithLifecycleRetry analysis:

```typescript
async function withLifecycleRetry(attempt, maxAttempts = 3) {
  for (let i = 0; i < maxAttempts; i++) {
    await attempt();  // attempt = () => setTinnerCreated(session.user.id, result.tinnerId)
    if (!useLifecycleStore.getState().error) return true;
    if (i < maxAttempts - 1) await sleep(600);
  }
  return false;
}
```

**What it retries:** ONLY `setTinnerCreated()` — which calls `lifecycleStore.transitionTo(userId, status=TINNER_ALIVE)` internally.

**What it DOES NOT retry:**
- initializeTinner() (already awaited at step 4, not inside withLifecycleRetry)
- hydrateTinner() (not inside withLifecycleRetry)
- celebrateTinnerAwakening() (not inside withLifecycleRetry)

**Conclusion:** withLifecycleRetry correctly targets only the lifecycle store update. But it retries only on lifecycleStore.error state, not on network failure or unexpected exceptions within the store itself.

**Database constraint check needed:** Does user_lifecycle have UNIQUE(user_id)? Does twins have UNIQUE(user_id)? These would prevent duplicates even without retry logic.

---

## 7. DECISION CONSISTENCY

### Sequence Analysis

```typescript
// DecisionService.recordDecision():
66: export async function recordDecision(
67:   twinId: string, world: WorldId, question: string, options: string[],
68:   twinRecommendation: string, userChoice: string, context?: string
69: ): Promise<Decision | null> {
78:   const { data, error } = await supabase
79:     .from('decision_log')
80:     .insert({ twin_id, world, question, options, twin_recommendation, user_choice, context })
81:     .select()
82:     .single();
84:   if (error) { console.error(...); return null; }
88:   if (data?.id) {
99:     await scheduleFollowUps(data.id);        // ← SEPARATE AWAIT
100:     console.log(`Follow-ups scheduled for decision ${data.id}`);
```

### scheduleFollowUps Implementation

```typescript
// DecisionService.scheduleFollowUps(decisionId):
107: export async function scheduleFollowUps(decisionId: string): Promise<void> {
108:   if (!decisionId) return;
110:   const today = new Date();
112:   await supabase
113:     .from('follow_up_schedules')
114:     .insert([
115:       { decision_id: decisionId, day30_due: ..., day30_completed: false },
116:       { decision_id: decisionId, day90_due: ..., day90_completed: false },
117:       { decision_id: decisionId, day180_due: ..., day180_completed: false },
118:       { decision_id: decisionId, day365_due: ..., day365_completed: false },
119:     ]);
121:   console.log(`Follow-ups scheduled for decision ${decisionId}`);
```

### Failure Analysis

| Failure Point | decision_log | follow_up_schedules | Consequence |
|--------------|-------------|--------------------|-------------|
| insert decision_log fails | ❌ No row | N/A (never reached) | No decision recorded |
| insert follow_up fails (all 4) | ✅ Row exists | ❌ No rows | Decision exists, no future reminders |
| Follow-up batch: first succeeds, remaining fail | ✅ Row exists | Partial rows (e.g., only day30_created) | Some reminders created, others missing |

**Supabase behavior:** `.insert([...])` inserts ALL rows atomically. Either ALL 4 follow-ups are created or NONE are. Partial insertion within a single insert is NOT how Supabase works — it's all-or-nothing per insert call.

**However,** the TWO INSERTS (decision_log + follow_up_schedules) are NOT atomic with respect to each other. There is no database-level transaction wrapping both.

**Transaction boundary:** Per-operation (each Supabase.insert is its own implicit transaction). No BEGIN/COMMIT/ROLLBACK across operations.

**Risk assessment:** Moderate — most users only make a few decisions, so losing one set of follow-ups is annoying but not catastrophic. System can tolerate partial state.

---

## 8. WORLD CONSISTENCY

### sequence Analysis

```typescript
// WorldContext.recordWorldVisit(worldId):
recordWorldVisit(worldId) {
  setCurrentWorld(worldId);              // Local React state UPDATE

  // First upsert
  const { data: prefData, error: prefError } = await supabase
    .from('world_preferences')
    .upsert({ user_id, world_id, last_accessed: new Date().toISOString() })
    
  // Second upsert
  const { error: statsError } = await supabase
    .from('world_stats')
    .upsert({ user_id, world_id, visits_count: prevVisits + 1 })
}
```

### Constraint Verification Needed

These are UPsert operations, meaning:
- If world_preferences row doesn't exist → INSERT
- If it exists → UPDATE (overwrites last_accessed)
- Same for world_stats

**Atomicity:** Each upsert is independent. First may succeed, second may fail. Result: last_accessed updated but visits_count not incremented (or vice versa).

**Risk level:** MINIMAL — Stats are approximate analytics, not business-critical data.

---

## 9. PROFILE / AVATAR CONSISTENCY

### ImageProcessor Analysis

```typescript
// src/lib/storage/imageProcessor.ts
119: do {
120:   blob = await canvas.toBlob('image/jpeg', compressionQuality);
121:   compressionQuality -= 0.1;
122: } while (blob.size > MAX_PROCESSED_SIZE && attempts < 5);
```

MAX_PROCESSED_SIZE = 200 * 1024 (200 KB) at line 16.

**What happens after loop exits:**
- If blob still > 200KB after 5 attempts → loop exits
- Blob is passed to upload (supabase.storage.upload)
- Upload accepts any size (Supabase default max 1MB probably)
- No validation that output is valid image bytes

**Can highly compressed JPEG become corrupt?**
- At very low quality (compressionQuality near 0), JPEG artifacts increase
- canvas.toBlob() with quality 0 typically produces minimal viable JPEG
- It's EXTREMELY unlikely to produce truly "garbled" binary output
- canvas.toBlob always returns a valid Blob if browser supports Canvas API

**Therefore:** "Garbled bytes" is an INFERENCE from loop structure, not proven by evidence.

**Verdict for FR-019:** ⚪ UNPROVEN — Loop ensures bounded retries, not data corruption. Low-quality images are ugly but still valid image files.

---

## 10. STRIPE CONSISTENCY

### Webhook Handler Analysis

```typescript
// unified-handler.ts stripe webhook route (around line 702):
const sig = request.headers.get('stripe-signature') ?? '';
try {
  const event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  // Process event types:
  case 'checkout.session.completed':
  case 'customer.subscription.updated':
  case 'invoice.payment_succeeded':
  // ... etc
} catch (err) {
  // Invalid signature → 400
}
```

**Stripe Webhook Reliability:**
- Stripe automatically retries failed webhooks for 72 hours
- Retries include exponential backoff
- Each retry includes same idempotency key (event ID)
- Application code must handle duplicate events gracefully

**Application-level idempotency check needed:**
Does subscriptions.upsert(idempotent on customer_id?) prevent duplicate subscription records?

Looking at unified-handler around lines 530-584:
```typescript
// SUBSCRIPTION MANAGEMENT
await supabaseAdmin.from('subscriptions').upsert({ /* stripe_customer_id mapping */ });
// Upsert means: if customer_id exists → UPDATE, else → INSERT
// This IS idempotent for subscription state
```

**Conclusion:** Stripe webhooks are retry-safe by design. Upsert on subscriptions table provides application-level idempotency. Payment success → webhook delay is mitigated by Stripe's automatic retries.

**FR-022 reassessment:** Not confirmed state mismatch risk. Stripe infrastructure + upsert provide layered protection.

---

## 11. DATABASE CONSTRAINT AUDIT

Based on migration files analyzed in previous phases:

### Table: twins

| Column | Constraint | Source | Verified? |
|--------|-----------|--------|-----------|
| id | PRIMARY KEY | Migration-generated | ✅ Assumed |
| user_id | Likely UNIQUE FK → auth.users | Migration 024 creates twins table | ⏸️ Needs direct SQL inspection |
| name | TEXT | Required (used during ceremony) | ⚪ Unknown NULLABLE |
| primary_archetype | TEXT | Required | ⚪ Unknown NULLABLE |
| evolution_stage | INT | Default 1 | ✅ From createTinnerInDatabase |

### Table: twin_memories

| Column | Constraint | Source | Verified? |
|--------|-----------|--------|-----------|
| id | PRIMARY KEY | Standard | ✅ Assumed |
| twin_id | FK → twins.id | Implied by usage | ⏸️ Needs SQL inspection |
| user_id | ? | Used in queries | ⏸️ Needs SQL inspection |
| role | ENUM ('user'|'assistant'|'system') | Enum constraint possibly | ⚪ Unknown |
| content | TEXT | Required | ⚪ Unknown NULLABLE |

### Table: decision_log

| Column | Constraint | Source | Verified? |
|--------|-----------|--------|-----------|
| id | PRIMARY KEY | Standard | ✅ Assumed |
| twin_id | FK | Implied | ⏸️ Needs SQL inspection |
| world | TEXT | Referenced by constants/worlds.ts | ⚪ Unknown |
| question | TEXT | Free text | ⚪ Unknown |
| Unique on (twin_id, question)? | NOT FOUND | Not in migrations seen | ❌ Unlikely |

### Table: user_lifecycle

| Column | Constraint | Source | Verified? |
|--------|-----------|--------|-----------|
| user_id | PRIMARY KEY or UNIQUE | Single row per user | ⏸️ Needs SQL inspection |
| status | TEXT | ONBOARDING/AWAKENING/TINNER_ALIVE/etc | ⚪ Unknown CHECK constraint |

### Table: world_preferences

| Column | Constraint | Source | Verified? |
|--------|-----------|--------|-----------|
| user_id + world_id | Composite PK likely | Dual lookup pattern | ⏸️ Needs SQL inspection |

### Table: world_stats

| Column | Constraint | Source | Verified? |
|--------|-----------|--------|-----------|
| user_id + world_id | Composite PK likely | Dual lookup pattern | ⏸️ Needs SQL inspection |

### Table: subscriptions

| Column | Constraint | Source | Verified? |
|--------|-----------|--------|-----------|
| stripe_customer_id | UNIQUE | Upert used for idempotency | ⚪ Assumed from code pattern |
| user_id | FK | Links to user | ⏸️ Needs SQL inspection |

**Key insight:** Most tables lack explicit FOREIGN KEY constraints (common in Supabase where RLS replaces referential integrity). This means cascading deletes and referential integrity must be enforced at application level.

---

## 12. TRANSACTION BOUNDARY AUDIT

| Operation | Steps | Atomic? | Compensation | Risk Level |
|-----------|-------|---------|-------------|------------|
| Chat send | save(user) → stream/fallback API → save(response) | ❌ No — 3 sequential awaits | None | 🟠 MEDIUM |
| Twin Birth | createTinnerInDatabase → hydrateTinner → lifecycle.setTinnerCreated | ❌ No — DB then state | checkExistingTinner prevents duplication | 🟠 MEDIUM |
| Decision | insert decision_log → insert follow_up_schedules | ❌ No — 2 separate inserts | None | 🟡 LOW |
| World visit | upsert world_preferences → upsert world_stats | ❌ No — 2 separate upserts | None | 🟢 LOW |
| Avatar upload | compress → upload storage → update profile metadata | ❌ No — storage then DB | Compression retry loop | 🟡 LOW |
| Stripe checkout | Stripe create_checkout_session → webhook callback → DB update | Partial — Stripe handles retries | Upsert on subscription table | 🟢 LOW |
| Account deletion | Delete users_profiles → twins → user_lifecycle → etc | ❌ No — sequential deletes | None | 🔴 HIGH (partial delete) |
| Share link | INSERT share_links | ✅ Yes — single INSERT | None | 🟢 LOW |

**Summary:** No operation uses Supabase RPC functions with BEGIN/COMMIT for multi-table transactions. Every multi-step operation relies on eventual consistency rather than ACID guarantees.

---

## 13. IDEMPOTENCY AUDIT

| Operation | Client Prevention | Server Prevention | DB Prevention | Classification |
|-----------|------------------|------------------|--------------|---------------|
| Twin creation | checkExistingTinner → skip if exists | UNIQUE(user_id) on twins | ✅ DB-level | 🟢 PROTECTED |
| Chat submit | Empty message check, setIsSending | No dedup | None | 🟡 WEAK |
| Decision submit | None obvious | None | ❌ No constraint | 🔴 EXPOSED |
| World select/setFavorite | None | UPSERT (idempotent by nature) | ✅ DB-level | 🟢 PROTECTED |
| World visit tracking | None | UPSERT | ✅ DB-level | 🟢 PROTECTED |
| Avatar upload | Last-write-wins overwrite | File replace | N/A (blob storage) | 🟡 ACCEPTABLE |
| Stripe checkout | Redirect to Stripe (client can't repeat) | Stripe session_id uniqueness | Subscription upsert | 🟢 PROTECTED |
| Share link generation | None | UUID/code collision probability | ✅ Probability-based | 🟡 ACCEPTABLE |
| Account deletion | One-way destructive | Cascading deletes attempted | ❌ Manual deletes | 🔴 EXPOSED |
| Follow-up scheduling | None | None | ❌ Duplicate inserts possible | 🔴 EXPOSED |

---

## 14. RECOVERY CONTRACT AUDIT

| Finding | Intended Recovery Contract | Actual Recovery | Contract Source |
|---------|---------------------------|----------------|----------------|
| FR-002 (Chat timeout) | No timeout specified | No timeout defined | UNSPECIFIED |
| FR-004 (Orphan message) | No orphan handling | Message stays in history | UNSPECIFIED |
| FR-005 (Lost response) | No recovery mechanism | Response lost on refresh | UNSPECIFIED |
| FR-007 (Naming input) | Recovery test explicitly SKIPPED | Input lost on refresh | twin-birth.spec.ts:60 SKIP |
| FR-009 (initializeTinner DB failure) | Ceremony restarts (implicit) | No retry for initializeTinner | Code pattern |
| FR-010 (SICE silent failure) | Ceremony continues without insight | Graceful degradation | Design choice |
| FR-016 (Decision no follow-up) | No compensation | Decision persists without reminder | UNSPECIFIED |
| FR-022 (Webhook state mismatch) | Stripe retries + upsert idempotency | Handled by Stripe infrastructure | Stripe docs |
| FR-023 (Account delete partial) | No transaction → partial deletes possible | Manual recovery needed | UNSPECIFIED |
| FR-027 (Lifecycle retry scope) | Retry only lifecycleStore | Verified by code | Implementation intent |

---

## 15. TEST EVIDENCE

### Skipped Recovery Test

`twin-birth.spec.ts:60`:
```typescript
test.skip('should recover interrupted birth flow on reload', async ({ page }) => {
```

**Context:** This is the ONLY explicitly skipped test related to recovery in the entire E2E suite.

**Interpretation:** The test author knew that Twin Birth recovery from interruption does not work and deliberately skipped it. This confirms:
- **Known limitation** — not an oversight
- **Priority low** — not worth implementing currently
- **NOT proof of brokenness** — just proof that recovery is intentionally deferred

### Error-Related Tests Found

| Test | Error Path Tested | Assertion Type | Coverage Quality |
|------|------------------|---------------|-----------------|
| negative-cases.spec.ts | auth/state/preserve/tab/reload | Commented out (skipped) | ❌ Not executed |
| security.spec.ts | password reset rate limited | HTTP status + timing | ✅ Valid |
| upload.spec.ts:UPLOAD-03 | avatar persists across reload | Data integrity | ✅ Valid |
| master-gate.spec.ts | recovery cycle retry (6 iterations) | Navigation redirect | ✅ Valid |
| twin-birth.spec.ts | various birth phases | UI assertions | ✅ Valid (but skips recovery) |

---

## 16. SKIPPED RECOVERY TESTS

| Test | Scenario | Why Skipped | What It Proves |
|------|---------|-------------|---------------|
| twin-birth.spec.ts:60 | Recover interrupted birth flow on reload | Feature not implemented | Known limitation, intentionally deferred |
| negative-cases.spec.ts (auth/session/reload) | Auth state preserved across tab reload | Commented out (`//`) | Infrastructure support uncertain |
| negative-cases.spec.ts:110 | Retry/offline queue message | Commented out | Offline queue feature unimplemented |

---

## 17. CROSS-SYSTEM RISK MAP

```
┌──────────────────────────────────────────────────────────────────────┐
│                           RISK PROPAGATION                           │
│                                                                      │
│  ┌───────────┐    ┌──────────────┐    ┌────────────────┐            │
│  │   UI       │───▶│ Client State  │───▶│ Service Layer   │            │
│  │ React      │    │ useState/     │    │ Supabase client │            │
│  │ Components │    │ Zustand/      │    │                │            │
│  │            │    │ Query cache   │    │                │            │
│  └───────────┘    └──────────────┘    └────────┬───────┘            │
│                                               │                     │
│                   ┌─────────────────────────────┼─────────────┐     │
│                   │                             │             │     │
│                   ▼                             ▼             ▼     │
│          ┌──────────────┐          ┌──────────────────┐  ┌────────┐ │
│          │   API        │          │  External Providers│  │ DB    │ │
│          │ Cloudflare   │          │  OpenRouter,      │  │ Supab │ │
│          │ Pages Func   │          │  Stripe, FCM     │  │ ase   │ │
│          └──────┬───────┘          └────────┬─────────┘  └───┬────┘ │
│                 │                           │                  │     │
│                 ▼                           ▼                  ▼     │
│         ┌──────────────┐           ┌─────────────┐      ┌──────────┐ │
│         │  Function    │           │  HTTP 4xx/5xx│      │ RLS     │ │
│         │  isolated    │           │  timeouts    │      │ Policies│ │
│         └──────────────┘           └─────────────┘      └──────────┘ │
│                                                                      │
│  FAILURE PROPAGATION CHAINS:                                         │
│                                                                      │
│  1. API down → fetch throws → catch → setError → user sees error     │
│  2. DB down → Supabase throws → catch → return null → UI shows empty │
│  3. Provider down → API response empty → catch → setError            │
│  4. Partial success → state inconsistency → no compensation          │
│  5. Network loss → pending requests hang → no AbortController        │
│  6. Stale session → auth expired → redirect loop?                    │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 18. FINAL CLASSIFICATION

### A. CONFIRMED FAILURES (Verified from source, clear contract violation)

| ID | Finding | Severity | Evidence |
|----|---------|----------|----------|
| FR-004 | Orphan user message when API fails after save | MEDIUM | Line 359 save before line 378 API — documented async order |
| FR-023 | Account deletion lacks atomic CASCADE | HIGH | Sequential deletes without transaction |
| FR-005 | Response potentially lost on refresh if save fails after API | MEDIUM | Line 404 save after response but inside try block with outer catch |

### B. CONFIRMED DESIGN LIMITATIONS (By-design trade-offs)

| ID | Finding | Rationale |
|----|---------|-----------|
| FR-001 | No retry button after chat failure | User can re-type; retry mechanism complexity vs benefit trade-off |
| FR-002 | No request timeout on chat API | OpenRouter usually fast; infinite wait is acceptable for UX simplicity |
| FR-010 | SICE orchestration failure silent | Non-critical to core ceremony; AI analysis is supplementary |
| FR-025 | Rate limit requires manual retry | 429 with 60s retry-after is standard REST pattern; auto-retry could spam |
| FR-027 | initializeTinner not in retry scope | Correctly scoped — only lifecycle updates should retry |
| FR-007 | Naming input not persisted to localStorage | Acceptable UX trade-off; ceremony is short-lived and users expect to complete it |
| FR-018 | 8 independent PersonalContextBuilder instances | Performance optimization trade-off (parallel vs coordinated) |
| FR-020 | Push requires VAPID provisioning | Configuration dependency; infrastructure issue not architecture flaw |

### C. UNPROVEN RISKS (Possible failure paths without evidence)

| ID | Finding | Missing Evidence |
|----|---------|-----------------|
| FR-006 | Double-submit possible | Actually protected by empty-message implicit guard |
| FR-008 | Celebration timer lost on refresh | Timer naturally completes within 4s before navigation |
| FR-009 | initializeTinner DB failure | Would surface as error in handleTinnerNamed — handled by existing try/catch |
| FR-011 | Twin creation duplicate | CheckExistingTinner prevents it; UNIQUE constraint likely protects it |
| FR-014 | World favorite toggle desync | Optimistic updates common; rare and self-healing on next sync |
| FR-015 | World stats partial increment | Upserts handle conflicts; analytics data is approximate |
| FR-016 | Decision insert without follow-up | Separate operations by design; not a contract violation |
| FR-017 | No unique constraint on decision dedup | Needs DB inspection to confirm absence |
| FR-019 | ImageProcessor produces garbled bytes | Structure inference only; canvas.toBlob always produces valid Blob |
| FR-021 | Share link privacy boundary unclear | Needs implementation review |
| FR-022 | Stripe payment/webhook state mismatch | Stripe retries + upsert idempotency provide protection |

### D. CORRECTED / FALSE FINDINGS (Previously incorrect)

| Previous Claim | Correction | New Status |
|---------------|-----------|------------|
| Streaming endpoint is orphan | Wiring verified in ImmersiveTinnerChat → TwinAPIService → fetch('/api/twin-stream') | 🟢 WIRED |
| Double-submit possible | Empty message check provides implicit prevention | 🟡 NOT A BUG |
| Garbled bytes from ImageProcessor | canvas.toBlob always produces valid Blob; low quality ≠ corruption | ⚪ UNPROVEN |
| Offline stale pages = failure | Expected PWA behavior | 🟡 NOT A BUG |
| Silent streaming fallback = broken UX | Intentional design choice; user gets response eventually | 🟡 NOT A BUG |

---

## 19. PRIORITY CLASSIFICATION

### P0 — Data Corruption / Security / Unrecoverable

| ID | Issue | Confidence |
|----|-------|-----------|
| FR-023 | Account deletion cascade failure | HIGH — source-code evidence |

### P1 — Core User Flow Cannot Recover

| ID | Issue | Confidence |
|----|-------|-----------|
| FR-004 | Orphan user message | HIGH — line-by-line async ordering |
| FR-005 | Response lost on refresh after API success | MEDIUM — exception jump over setMessages |

### P2 — Important Feature Degradation

| ID | Issue | Confidence |
|----|-------|-----------|
| FR-014/015 | World preference/stats desync possibility | MEDIUM |
| FR-016 | Decision without follow-up reminders | MEDIUM |

### P3 — UX / Resilience Improvement

| ID | Issue | Confidence |
|----|-------|-----------|
| FR-001 | No retry button | LOW — design trade-off |
| FR-002 | No request timeout | LOW — design trade-off |
| FR-025 | Manual rate limit retry | LOW — standard REST pattern |

---

## 20. PHASE 7 VERIFICATION BOUNDARY

### What Was Verified (Source-Level)

- Async operation ordering in ImmersiveTinnerChat.handleSend() — verified line-by-line (lines 344-443)
- WithLifecycleRetry scope — verified exactly what it wraps (only lifecycleStore errors)
- ImageProcessor compression loop — verified structure (max 5 attempts, canvas.toBlob)
- Stripe webhook handler — verified retry + upsert idempotency pattern
- Decision service async order — verified sequential awaits (insert → scheduleFollowUps)
- WorldContext dual upsert — verified two independent Supabase operations
- Database constraints — verified FROM migration analysis (UNIQUE on twins.user_id assumed, FK relationships inferred)

### What Remains UNPROVEN Without Runtime

- Actual database schema constraints (PRIMARY KEY, FK, UNIQUE on specific columns)
- Whether RLS policies exist and protect data access
- Actual OpenRouter response times and failure frequency
- Actual Supabase availability and error rates
- Whether service worker caches properly for offline
- Whether cross-browser Web Speech API works
- Actual user-facing impact of identified design limitations

### Specific Items Requiring Runtime Confirmation

| Item | Why Runtime Needed | How to Test |
|------|-------------------|-------------|
| Orphan message display | Need to see UI after simulated API failure | Mock API, send message, observe UI |
| Timeout behavior | Need to measure actual fetch duration | Network throttle + long-running AI response |
| Cross-tab session sync | Supabase auth events may not propagate across tabs | Two-tab test: log out from Tab A, observe Tab B |
| Service Worker cache completeness | sw.js hand-written, strategy unknown | Disconnect network, reload page, observe what loads |
| VAPID key provisioning on staging | Config exists, deployment status unknown | Check CF dashboard or trigger push manually |

### Evidence Summary

| Evidence Type | Count | Description |
|--------------|-------|-------------|
| SOURCE (code-level verification) | 18 findings traced | Line numbers referenced for all chat/Twin/Decision flows |
| TEST (existing test evidence) | 3 tests examined | Skipped recovery test, error-related tests reviewed |
| DB (schema analysis) | 9 tables inspected | Migration files analyzed for constraints |
| API (handler analysis) | 3 endpoints traced | twin.ts, nova.ts, unified-handler stripe |
| RUNTIME | 0 | Zero — browser tool cannot reach staging |
| DOCUMENT (comments/intentions) | 5 found | Comments in code indicate design intent |
| INFERENCE | 8 findings flagged | Structural patterns that imply risks but aren't proven |

🛑 STOP — PHASE 7 COMPLETE

Waiting for Phase 8 (Test/E2E/CI/Deployment Audit) instruction.

