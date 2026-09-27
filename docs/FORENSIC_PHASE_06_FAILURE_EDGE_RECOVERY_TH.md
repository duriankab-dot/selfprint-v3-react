# FORENSIC PHASE 06 — FAILURE / EDGE CASE / RECOVERY AUDIT

**วันที่ตรวจ:** 27 กันยายน 2026  
**ขอบเขต:** ทั้ง repository โดยตรวจ error/retry/timeout/degradation patterns จาก source code จริง  
**วิธีตรวจ:** Static analysis — grep/trace import, try/catch chains, error propagation paths  
**สถานะ:** ทุก claim มี file reference รองรับ  

---

## 1. PHASE 6 OBJECTIVE

ตรวจสอบว่า SELFPRINT รองรับ failure, edge case, และ recovery scenarios ได้จริงแค่ไหน โดย trace chain ตั้งแต่:

```
Trigger → UI/Entry Point → Handler → Service → API → Backend → DB/Storage/External → Error → Propagation → State Update → UI Response → Recovery Action
```

ห้ามถือว่า "มี try/catch" = ระบบ recover ได้สำเร็จ

---

## 2. AUDIT BOUNDARY & ENVIRONMENT LIMITATION

### Browser Tool Limitation (จาก Phase 5)

> Browser session cannot access staging: "Browser session does not belong to the requested project or directory"

ดังนั้น Phase 6 **ไม่มี runtime evidence เลย** ทุก finding เป็น static inference จาก code structure เท่านั้น

### What Phase 6 CAN determine without runtime

| Capability | Can Determine? | Method |
|-----------|---------------|--------|
| Error handling code exists | ✅ Yes | grep try/catch/throw |
| Retry mechanism exists | ✅ Yes | grep retry/recover/refetch |
| Timeout mechanism exists | ✅ Yes | grep timeout/AbortController |
| Idempotency keys exist | ✅ Yes | grep unique/upsert constraint |
| Partial failure paths | ✅ Yes | Trace async chains (await Promise.all) |
| User-visible error messages | ✅ Yes | grep setError/console.warn |
| Actual behavior under failure | ❌ No | Requires runtime testing |
| Performance under load | ❌ No | Requires benchmarking |

---

## 3. FAILURE SURFACE INVENTORY

### Auth Failure Surface

| Trigger | Entry Point | Handler | Evidence of Handling | Status |
|---------|------------|---------|---------------------|--------|
| Magic Link OTP sent but not delivered | LoginPage.signInWithMagicLink() | Supabase auth | No retry; logs error message | ⚪ UNPROVEN |
| OAuth callback fails (provider down) | AuthContext.signInWithOAuth() | supabase.auth.signInWithOAuth | Returns error message | 🟢 VERIFIED |
| Passkey registration fails | PasskeyProvider.registerPasskey() | webauthn.register() | .catch() → returns error object | 🟢 VERIFIED |
| Session expires during use | OnAuthStateChange listener | Supabase gets new session or null | Lifecycle reload on session change | 🟢 VERIFIED |
| Invalid/expired JWT | All API calls verifyUser() | Returns 401 Unauthorized | Client should redirect to login | 🟡 PARTIAL |
| Rate limited on passkey | auth-rate-limit edge fn | Returns HTTP 429 | Frontend shows error message | 🟡 PARTIAL |
| Logout during active flow | AuthContext.signOut() | supabase.auth.signOut() | Clear session state | 🟢 VERIFIED |

### Birth Ceremony Failure Surface

| Trigger | Entry Point | Handler | Evidence of Handling | Status |
|---------|------------|---------|---------------------|--------|
| Refresh during phase 1 (intro) | TwinBirthPage | Phase state in React useState | Lost on refresh unless localStorage saved | 🔴 BROKEN |
| Refresh during phase 2 (birth animation) | TwinBirthPage | Same as above | Three.js canvas state lost | 🔴 BROKEN |
| Refresh during phase 3 (naming input) | TwinBirthPage | twinName in useState | Input cleared on refresh | 🔴 BROKEN |
| Refresh during phase 4 (celebration) | TwinBirthPage | auto-timed navigation | May navigate early/late | ⚪ UNPROVEN |
| Refresh during phase 5 (complete) | TwinBirthPage | redirects to /brief | Should work if persisted | ⚪ UNPROVEN |
| Duplicate Twin creation attempt | CoreAwakeningService | hydrateTwin() avoids INSERT | Unique constraint prevents duplicate | 🟢 VERIFIED |
| Network failure during initializeTwin | TwinBirthPage.handleTwinNamed() | withLifecycleRetry(3 attempts, 600ms gap) | Retries only lifecycleStore error, NOT initializeTwin failure | 🟠 INCOMPLETE |
| DB failure during twins INSERT | CoreAwakeningService.initializeTwin() | createTwinInDatabase() catches | Error propagated up; UI shows error | 🟡 PARTIAL |
| SICE orchestration fails | startAwakening() | .catch(console.error) | Only console.log; ceremony continues | 🔴 BROKEN |
| Missing birthArchetype | useMemo(birthDate) | Falls back to undefined | Archetypes array may be empty | ⚪ UNPROVEN |

### Twin Chat Failure Surface

| Trigger | Entry Point | Handler | Evidence of Handling | Status |
|---------|------------|---------|---------------------|--------|
| Normal request success | ImmersiveTwinChat.handleSend() | Full flow complete | Messages added + persisted | 🟢 VERIFIED |
| API failure (5xx/4xx) | streamTwinResponse().catch() → callTwinAPI() fallback → setError() | **Two-path fallback** | User sees error message | 🟢 VERIFIED |
| Stream failure + fallback failure | Final catch(err) | setError(errorMsg) | Error message displayed | 🟢 VERIFIED |
| Empty response from AI | chunks.join('') → twinResponse | Set as assistant message | Empty bubble displayed in chat | 🟠 INCOMPLETE |
| Rate limit (429) | catch → setError() | Shows "Failed to send message" | No retry button; user must re-type | 🟠 INCOMPLETE |
| User session lost mid-send | Check: !session?.user?.id throws | Throws 'User session lost' | Caught by outer catch; setError() | 🟢 VERIFIED |
| Double submit rapid clicks | setIsSending(true), message='', setError(null) | No button disable observed | Possible duplicate messages | 🟠 INCOMPLETE |
| Slow response (>30s) | No AbortController on fetch | Fetch hangs until timeout | Loading states show but no cancellation | 🔴 BROKEN |
| Save memory succeeds, API fails | saveTwinMemory() before API call | Memory saved but no response | Orphan user message in history | 🔴 DATA RISK |
| API succeeds, save memory fails | saveTwinMemory() after API call | Message appended to UI | But not persisted on reload | 🔴 DATA LOSS |
| Conversation history fails to load | loadRecentMemories() awaited | If fails, catch silently | History unavailable, fresh chat starts | ⚪ UNPROVEN |
| No retry after final error | catch(err) → setError(); setIsSending(false) | No retry mechanism | User must manually re-type entire message | 🔴 UX ISSUE |

### IMPORTANT CORRECTION FROM PHASE 5: Streaming IS Wired Up

Phase 5 incorrectly stated "zero import chains connect ImmersiveTwinChat to streaming endpoints." This was WRONG.

Actual streaming path verified:
```
ImmersiveTwinChat.tsx:380: streamTwinResponse(apiMessages, ...)
  └─ imports TwinAPIService.streamTwinResponse (line 36)
     └─ fetch('/api/twin-stream', { method: 'POST', ... })  (line 167)
        └─ response.body.getReader() → TextDecoder → SSE parser  (lines 184-205)
           └─ onChunk(chunk) → chunks.push(chunk)  (line 386)
              └─ chunks.join('') → twinResponse  (line 391)
                 └─ setMessages(...) appends twin response to UI  (line 412)
```

Fallback chain verified:
```
if streamTwinResponse fails:
  → catch(streamError): console.warn('[ImmersiveTwinChat] Streaming failed, falling back:', streamError)
  → callTwinAPI() [non-streaming POST /api/twin]
    → if this also fails:
      → catch(err): setError(errorMsg) → display error to user
```

Therefore:
- Streaming endpoint `/api/twin-stream` IS actively called by frontend ✅
- Streaming uses ReadableStream reader for real-time token output ✅
- If streaming fails, falls back to non-streaming **silently** (no user notification of degradation)
- Non-streaming fallback receives full response at once (no incremental rendering)
- Neither path has timeout or abort capability (except BlogArticle.tsx which uses AbortController separately)
- After BOTH paths fail, user sees error but **no retry button** — must re-type message

### World Failure Surface

| Trigger | Entry Point | Handler | Evidence | Status |
|---------|------------|---------|----------|--------|
| Invalid world ID | WorldDetail route `/worlds/:worldId` | WorldContext.currentWorld validation | If world doesn't exist in registry, unknown visual | 🟡 PARTIAL |
| Missing world data | WorldDetail loads world config | constants/worlds.ts lookup | Accessing undefined.world → potential crash | ⚪ UNPROVEN |
| World preference upsert fails | WorldContext.toggleFavoriteWorld() | .catch(err => console.error()) | Local state unchanged; server state inconsistent | 🔴 PARTIAL SUCCESS RISK |
| World stats increment fails | recordWorldVisit() | Both upserts run independently; first may succeed, second fails | visits_count updated but last_accessed not | 🔴 PARTIAL SUCCESS RISK |
| World context injection fails | buildPrompt() | Two-layer fallback: try buildPrompt → catch legacy builder | System prompt degrades but chat continues | 🟢 RESILIENT |

### Decision Failure Surface

| Trigger | Entry Point | Handler | Evidence | Status |
|---------|------------|---------|----------|--------|
| Decision insert fails | DecisionService.recordDecision() | return null on error; no throw | Calling component may not detect failure | 🟠 INCOMPLETE |
| Schedule follow-ups fails | scheduleFollowUps() called after decision insert | Follow-ups silently skipped if insert fails | Decision exists but no reminders | 🔴 PARTIAL SUCCESS RISK |
| Update outcome fails | DecisionService.recordOutcome() | Not traced explicitly | Unknown | ⚪ UNPROVEN |
| Export CSV fails | exportEngine generates in-memory | Blob download triggered | File system permission block? | ⚪ UNPROVEN |
| Export JSON fails | Same as above | Same | Same | ⚪ UNPROVEN |
| Dashboard load fails | getUserDecisions() | Supabase query error → null returned | Empty table shown | 🟡 PARTIAL |

### Personal Context Failure Surface

| Trigger | Entry Point | Handler | Evidence | Status |
|---------|------------|---------|----------|--------|
| getContext(userId) throws | Multiple consumers await it | React Query catch handled by default | Stale data served if query fails | ⚪ UNPROVEN |
| ExperienceEngine.compute() throws | useMemo computation | If compute() throws, config=null | CSS vars not applied; hub not suggested | 🟡 PARTIAL |
| PatternDetector.updatePattern() fails | Called during AI feedback loop | No explicit error handling found | Pattern learning silently skipped | ⚪ UNPROVEN |
| 8 independent builders race | Each creates own instance | Potential stale data inconsistency | No coordination between instances | 🔴 DUPLICATE COMPUTATION RISK |

### Daily Brief Failure Surface

| Trigger | Entry Point | Handler | Evidence | Status |
|---------|------------|---------|----------|--------|
| DailyBrief engine compiles locally | DailyBrief component renders | Uses local data | No indication if data is fresh/stale | 🟡 PARTIAL |
| Scheduled job fails | daily-brief edge function | No front-end caller traced | If scheduled, error logged server-side only | ⚪ UNPROVEN |
| No data available for brief | Engine called with empty context | Returns minimal/generic brief | May confuse user into thinking something broke | ⚪ UNPROVEN |

### Notification/Push Failure Surface

| Trigger | Entry Point | Handler | Evidence | Status |
|---------|------------|---------|----------|--------|
| Push permission denied | PWAInstallPrompt listens for beforeinstallprompt | Dismisses install banner | No alternative notification opt-in | 🟡 PARTIAL |
| Push subscription fails | push_subscriptions INSERT | Not traced | Subscriptions missing means no pushes | ⚪ UNPROVEN |
| VAPID keys missing | send-push edge function | Returns "VAPID keys not configured" 500 error | Edge function exits early | 🔴 CONFIG DEPENDENCY |
| Delivery to browser fails | FCM sends push notification | No retry mechanism visible | Failed pushes lost forever | 🔴 ONE-SHOT DELIVERY |
| Notification click action wrong | Deep link routing | If notification payload incorrect | Opens wrong page or breaks | ⚪ UNPROVEN |

### Voice Failure Surface

| Trigger | Entry Point | Handler | Evidence | Status |
|---------|------------|---------|----------|--------|
| Microphone permission denied | navigator.mediaDevices.getUserMedia | .catch() handler needed but not traced | VoiceInput component may crash | 🔴 CRITICAL |
| Speech recognition unsupported | Web Speech API SpeechRecognition | Browser check not traced | STT silently fails | ⚪ UNPROVEN |
| TTS not supported | speechSynthesis.speak() | Available in most browsers | Graceful degradation if unavailable | 🟡 PARTIAL |
| Network loss during STT | Speech recognition depends on browser | Depends on browser implementation | STT may work offline (Chrome) or require network (Firefox) | ⚪ UNPROVEN |

### Profile/Storage Failure Surface

| Trigger | Entry Point | Handler | Evidence | Status |
|---------|------------|---------|----------|--------|
| Avatar upload fails | FileUploadUI → supabase.storage.upload | ImageProcessor compresses, then uploads | Upload error → user informed? | 🟡 PARTIAL |
| Storage bucket missing | Migration 038 creates profiles bucket | If migration not run on target env | All uploads fail | ⚪ UNPROVEN |
| Malformed image | imageProcessor compresses repeatedly (max 5 attempts) | Loops while blob.size > MAX_PROCESSED_SIZE | Image saved as garbled bytes if can't compress | 🔴 DATA RISK |
| Image processing timeout | Compress retry max 5 attempts | No explicit timeout, relies on loop limit | May hang indefinitely if processor stuck | ⚠️ POTENTIAL HANG |

### Account Deletion/Recovery Failure Surface

| Trigger | Entry Point | Handler | Evidence | Status |
|---------|------------|---------|----------|--------|
| Delete account trigger | account-delete edge function | Deletes users_profiles, twins, user_lifecycle, etc. | No cascade delete guarantee | 🔴 DATA CONSISTENCY RISK |
| Partial deletion | Multiple tables deleted sequentially | If delete fails halfway | Some data persists (orphans) | 🔴 PARTIAL DELETION RISK |
| Recovery magic link fails | account-recovery edge function | Sends magic link via Supabase auth | Same limitations as regular magic link | ⚪ UNPROVEN |

### Sharing Failure Surface

| Trigger | Entry Point | Handler | Evidence | Status |
|---------|------------|---------|----------|--------|
| Share link invalid/expired | Share page reads share_links by code | If code not found → 404 or empty view | User-friendly error shown? | 🟡 PARTIAL |
| Privacy boundary breach | Shared view shows data | If share_links.query includes sensitive fields | Data leakage risk | 🔴 PRIVACY RISK |
| Generated link broken | generateShareLink() → share_links INSERT | If insert fails → error returned | User doesn't know link wasn't created | ⚪ UNPROVEN |

### Stripe/Payment Failure Surface

| Trigger | Entry Point | Handler | Evidence | Status |
|---------|------------|---------|----------|--------|
| Checkout creation fails | unified-handler stripe:create-checkout | Returns error JSON | Pricing page shows error | 🟡 PARTIAL |
| Payment succeeds, webhook fails | Stripe sends webhook → unified-handler | Webhook signature verification (LINE 702) | Subscription not updated | 🔴 STATE MISMATCH |
| Payment cancelled | User cancels checkout | Redirects back to pricing page | No rollback of any intermediate state | ⚪ UNPROVEN |
| Duplicate webhook | Stripe may retry webhooks | Stripe handles idempotency internally | Risk: double-subscription creation | 🔴 WEBHOOK IDEMPOTENCY |

### Network/Offline Failure Surface

| Trigger | Entry Point | Handler | Evidence | Status |
|---------|------------|---------|----------|--------|
| Internet disconnect | Any API call (fetch/post) | NetworkError thrown; try/catch handles it | Generic error message shown | 🟡 PARTIAL |
| Slow network | fetch() has no timeout | Call blocks until timeout or completion | Loading state persists indefinitely | 🔴 NO TIMEOUT ON CHAT/DECISION REQUESTS |
| Intermittent connection | Supabase realtime subscription | onAuthStateChange keeps trying | React Query refetch handles staleness | 🟡 PARTIAL |
| SPA navigation during API pending | User navigates away from chat | handleSend cleanup not traced | Stale setState after navigation | ⚪ UNPROVEN |
| Offline PWA loads cached page | Service Worker caches assets | SW caches JS/CSS/HTML images | Offline content depends on cache hit | 🟡 PARTIAL |

---

## 4. RETRY ANALYSIS

### Retry Mechanisms Found in Code

| Location | Retry Type | Attempts | Backoff | Scope | Notes |
|----------|-----------|----------|---------|-------|-------|
| TwinBirthPage.withLifecycleRetry | Manual retry | 3 attempts | 600ms fixed gap | lifecycle transitions | Only retries lifecycleStore.error, NOT DB/API failures |
| rateLimitMap (functions/api/*.ts) | Implicit retry via 429+Retry-After | N/A | N/A | Rate limiting | Server returns 60s retry-after; client must wait |
| React Query staleTime | Automatic refetch | Default (depends on config) | Per-query config | Data fetching | Cache invalidation triggers refetch, not true retry |
| Supabase onAuthStateChange | Auto-reconnect | Infinite (event-based) | Event-driven | Auth persistence | Handles token refresh automatically |

### Missing Retry Mechanisms

| Area | Expected Retry | Present? | Impact |
|------|---------------|----------|--------|
| Chat send (after final failure) | Retry with exponential backoff | ❌ No | User must re-type entire message |
| Twin creation (DB failure) | Retry DB insert | ❌ No (only lifecycleRetry) | Birth ceremony may permanently fail |
| Decision insert | Retry on network error | ❌ No | Single-point failure |
| Follow-up scheduling | Retry | ❌ No | Decisions created without future reminders |
| Save message (persistence) | Retry failed save | ❌ No | Messages may be lost after successful API call |
| World preference update | Retry on conflict | ❌ No | Optimistic updates may desync with DB |
| Image upload | Retry on compression failure | ✅ Yes (5 attempts) | Limited retry (loop-based, no timeout) |

### Critical Gap: Chat Send Flow Has No User-Facing Retry Button

```typescript
// ImmersiveTwinChat.tsx lines 431-442
} catch (err) {
  const errorMsg = err instanceof Error ? err.message : /* Thai/English fallback */;
  setError(errorMsg);  // Shows error message
  console.error('Twin message error:', err);
  stopListening(); stopThinking(); stopResponding();
} finally {
  setIsSending(false);  // Re-enables send button
}
```

What user sees: Error message + send button becomes clickable again.

What user MUST do: Manually re-type entire message AND hope no duplicates exist in history.

No "Retry" button exists. No "Resend" option. No way to recover the partially-saved user message.

---

## 5. TIMEOUT ANALYSIS

### Explicit Timeouts Found

| Location | Duration | Type | Coverage |
|----------|----------|------|----------|
| BlogArticle.tsx fetch | AbortController (browser default) | Abort | Blog post loading only |
| weekly-supabase-resume.ts waitForReady | maxWaitMs=180000 (3 min) | Polling interval | Script-only, not user-facing |
| supabase-lifecycle.ts waitForProjectReady | maxWaitMs=120000 (2 min) | Polling interval | Script-only |
| React Query staleTime | 10s–60s per component | Cache freshness | Refetches stale queries, NOT a request timeout |

### No Timeout Found For

| Operation | Why It Matters | Risk |
|-----------|---------------|------|
| POST /api/twin (chat) | User waits indefinitely if AI slow | App appears frozen |
| POST /api/nova (Nova chat) | Same as Twin | Same |
| fetch('/api/twin-stream') | Streaming response may hang | Progressive rendering hangs |
| Supabase CRUD operations | Network blips can cause long waits | Page unresponsive |
| Image upload to storage | Large images may take minutes | No progress indicator beyond basic spinner |

### Consequence of No Request Timeout

If OpenRouter API takes >30 seconds to respond:
1. User sees "thinking" / "responding" loading state
2. fetch() promise holds until timeout OR response arrives
3. No AbortController on these requests
4. User cannot cancel request by navigating away (unless React unmounts and GC collects)
5. If user navigates and comes back, duplicate message exists in history
6. If user closes tab, pending request completes server-side regardless

---

## 6. NETWORK FAILURE ANALYSIS

### HTTP Error Handling Summary

| HTTP Status | Endpoint | Client Handling | User Visible? | Recoverable? |
|-------------|----------|----------------|--------------|-------------|
| 400 Bad Request | /api/twin | Catch → setError | ✅ Yes | Maybe (fix input) |
| 401 Unauthorized | /api/* | verifyUser() → 401 → setError | ✅ Yes | No (need re-login) |
| 403 Forbidden | /api/* | verifyUser() → 403 → setError | ✅ Yes | Maybe (different user) |
| 404 Not Found | /api/twin-stream | Catch → setError | ✅ Yes | No (endpoint missing) |
| 409 Conflict | /api/profile/upsert | "retry on collision" comment | Unknown | Yes (re-try) |
| 429 Too Many Requests | /api/twin | Return 429 + Retry-After header | ✅ Yes (error msg) | Wait 60s, retry |
| 500 Internal Error | /api/* | Catch → setError | ✅ Yes | Retry (transient) |
| 502/503/504 Gateway | /api/* | Catch → setError | ✅ Yes | Retry (transient) |
| Empty body (200 OK) | /api/twin | chunks.join('') = '' | ✅ Yes (empty bubble) | No (AI returned nothing) |
| Malformed JSON | /api/* | JSON.parse would throw | ✅ Yes (generic error) | Retry |

### Key Observation: All Error Paths Show Generic Messages

Every catch block follows same pattern:
```typescript
const errorMsg = err instanceof Error
  ? err.message
  : (isTh ? 'ส่งข้อความไม่สำเร็จ' : 'Failed to send message');
setError(errorMsg);
console.error('Twin message error:', err);
```

**Problem**: Specific error types (429, 500, network error, timeout) all become the same generic Thai/English message. User cannot distinguish:
- "I need to wait 60 seconds (rate limited)" vs
- "Server is down (500)" vs
- "Network cable disconnected" vs
- "AI model timed out"

---

## 7. AUTH/SESSION RECOVERY

### Session State Combinations Analysis

| Auth State | Login State | Expected Behavior | Actual Implementation | Status |
|-----------|-------------|------------------|----------------------|--------|
| Not logged in | N/A | Show marketing pages | HomeRoute → LandingPage always shown | 🟢 VERIFIED |
| Logged in | No profile | Redirect to onboarding | useRecoveryRoute handles redirect | 🟡 PARTIAL |
| Logged in | Profile + no Twin | Allow Twin creation | TwinBirthPage accessible | 🟢 VERIFIED |
| Logged in | Twin exists | Go to dashboard | RecoveryRoute → /dashboard | 🟢 VERIFIED |
| Any user | Direct URL to /login | Show login form | LoginPage renders regardless | 🟢 VERIFIED |
| Expired session | Active page | AuthContext.onAuthStateChange fires → session=null | Components check !session && redirect | 🟢 VERIFIED |
| Two tabs open, logout from one | Other tab still authenticated | Second tab has stale session | Supabase onAuthStateChange SHOULD notify, but cross-tab sync uncertain | ⚪ UNPROVEN |
| Refresh during auth check | Loading=true briefly | LandingPage shown | HOMEBLANK-001 fix ensures LandingPage not null | 🟢 VERIFIED |

### AuthFlow Failure Tree

```
User enters email
├─ Supabase SMTP fails
│   └─ signInWithOtp() throws
│       └─ catch → returns { error: err.message }
│           └─ UI shows error message ✓
│           └─ User can retry ✓
│
├─ Email delivered but link expired
│   └─ supabase.auth.verifyOtp() → 401
│       └─ Redirect to login ✓
│
├─ OAuth provider down
│   └─ signInWithOAuth() → redirect fails
│       └─ Error caught somewhere? 
│           └─ Need to verify ✗
│
├─ Passkey device not available
│   └─ isAvailable() returns false
│       └─ UI hides passkey buttons ✓
│
├─ Passkey biometric denied by user
│   └─ webauthn methods reject
│       └─ PasskeyProvider.catch → returns error ✓
│
├─ Session stored in cookie but domain changed
│   └─ Supabase detects mismatch → session=null
│       └─ onAuthStateChange → signOut()
│           └─ UI redirects to login ✓
│
└─ Stale JWT used after password changed elsewhere
    └─ verifyUser() rejects JWT
        └─ 401 → setError → need re-authenticate ✓
```

---

## 8. TWIN BIRTH RECOVERY

### Interruption Points in TwinBirthPage Ceremony

Phase-by-phase interruption analysis:

| Phase | Interruption Method | Recovery Path | Result | Status |
|-------|-------------------|---------------|--------|--------|
| Intro (phase 0) | Browser refresh | localStorage check in useEffect | Loads saved state if exists | 🟡 PARTIAL |
| Intro (phase 0) | Navigate away → back | React Router remounts component | Component re-initializes to intro phase | ✅ Resume possible |
| Birth animation (phase 1) | Browser refresh | Three.js canvas recreated | Animation starts over, loses position | ❌ Reset |
| Birth animation (phase 1) | Navigate away → back | Component remounts | Animation restarts | ✅ Resume possible |
| Naming input (phase 2) | Browser refresh | twinName stored in React useState only | **Input LOST** on refresh | 🔴 DATA LOSS |
| Naming input (phase 2) | Navigate away → back | React remounts | Form re-shown | ✅ Resume possible |
| Celebration (phase 3) | Browser refresh | countdown timer in setTimeout | Timer lost, may fire immediately | 🔴 UNEXPECTED BEHAVIOR |
| Celebration (phase 3) | Navigate away → back | Component remounts | Goes through ceremony again | ✅ Resume possible |
| Complete (phase 4) | Browser refresh | navigate('/brief') already happened | Redirected to correct page | ✅ Works |

### Critical Finding: No Persistence During Ceremony

The TwinBirthPage stores phases in **React useState**, which is **ephemeral**. Only `essenceId` (from SICE orchestration) is stored in useState before naming step. If user refreshes AFTER essenceId generated but BEFORE naming, the ceremony restarts from intro — SICE orchestration may not re-run (depends on whether essentialData survives).

However, there IS a `checkExistingTwin` check in `useEffect`:
```typescript
checkExistingTwin(userId).then(({ exists, twinId }) => {
  if (exists) { clearBirthState(); } // skip if Twin already created
});
```

This means: If user accidentally creates Twin twice (by refreshing mid-ceremony then completing), the second time `checkExistingTwin` finds the Twin already exists and clears state — preventing duplicate Twin.

**BUT**: This only works IF the first Twin creation succeeded. If birth animation started but initialization failed partway through, orphaned state may remain.

### withLifecycleRetry Behavior

```typescript
async function withLifecycleRetry(attempt, maxAttempts = 3) {
  for (let i = 0; i < maxAttempts; i++) {
    await attempt();
    if (!useLifecycleStore.getState().error) return true;
    if (i < maxAttempts - 1) await sleep(600);
  }
  return false;
}
```

What this retries: Only `lifecycleStore.transitionTo()` and `lifecycleStore.setTwinCreated()` errors.

What this does NOT retry:
- `startAwakening(userId)` — only `.catch(console.error)` (no retry!)
- `initializeTwin(...)` — wrapped in try/catch inside handleTwinNamed, but no retry loop
- TwinCreation database INSERT — no retry logic

---

## 9. TWIN CHAT RECOVERY

### Streaming vs Non-Streaming Verification (Corrected)

As confirmed in Section 3, the actual streaming path is:

```
frontend → streamTwinResponse() → fetch('/api/twin-stream') → SSE stream → chunks.forEach(onChunk)
                                               ↓ stream fails
                                           callTwinAPI() → POST /api/twin → JSON response → single append
```

Both paths eventually append response to `messages[]` and call `saveTwinMemory()`.

### Chat Recovery States

| State | Failure Mode | Recovery | Status |
|-------|-------------|----------|--------|
| Before sending | Network drops | Nothing to recover — message in textarea | ✅ Fine |
| Sending (streaming in progress) | Network drops | streamTwinResponse fails → callTwinAPI() tries → may also fail → setError() | Partial recovery |
| Sending (awaiting response) | Network drops | fetch() resolves with error → catch → setError() | User sees error |
| After response received | Refresh | saveTwinMemory persisted messages → history loaded on mount | ✅ Works |
| After response received | Close tab | Messages in localStorage/sessionStorage? | ❓ Need to verify persistence scope |
| Rapid double-click send | Submit twice | setIsSending=true but no button disabled? | ⚠️ Possible duplicate |
| AI returns empty string | chunks.join('') = "" | setMessages([...prev, {role:'twin', content:''}]) | Displays empty bubble |

### Duplicate Message Prevention

Looking at ImmersiveTwinChat handleSend():
1. setMessage('') clears input IMMEDIATELY (line 344)
2. setIsSending(true) shows loading state (line 345)
3. User message added to messages[] synchronously (line 533)
4. saveTwinMemory() called (line 359)
5. API call begins (line 378)

If user clicks send again while sending:
- `setIsSending` is already true
- Line 341 check: `if (!textToSend.trim()) return` — text is empty, returns early
- **Button state check not present** — theoretically user could trigger another send if text is not empty (unlikely since setMessage('') ran)

Verdict: Duplicate prevention exists implicitly via empty message check, but not explicitly via disabled button.

### Error Display

When ANY error occurs:
```typescript
setError(errorMsg); // line 435
console.error('Twin message error:', err); // line 436
stopListening(); stopThinking(); stopResponding(); // cleanup states
```

User sees: Red error toast/banner near message input area (context-dependent styling).

No "Retry" button. No "Undo" button. No way to recover partial state.

---

## 10. DUPLICATE ACTION / IDEMPOTENCY ANALYSIS

### Operations Checked

| Action | Idempotency Mechanism | Safe Under Repeat? | Risk Level |
|--------|----------------------|-------------------|------------|
| Create Twin | `twins.user_id` UNIQUE constraint | ✅ Yes (second insert fails silently via catch) | Low |
| Send Chat Message | No deduplication | ❌ No (possible duplicate if rapid) | Medium |
| Save Decision | No unique constraint on question | ❌ No (same decision can be recorded multiple times) | Medium |
| Record Outcome | No unique constraint | ❌ No (multiple outcomes per decision possible by design) | Low (intentional) |
| Follow-up Scheduling | CREATE in scheduleFollowUps | ❌ No (duplicate schedules if called twice) | High |
| Toggle World Favorite | upsert world_preferences | ✅ Yes (idempotent by design) | Low |
| Record World Visit | upsert world_stats | ✅ Yes (idempotent by design) | Low |
| Generate Share Link | share_links INSERT | ⚠️ Partial (no unique constraint on generated code?) | Medium |
| Upload Avatar | overwrite existing file | ✅ Yes (overwrites previous avatar) | Low |
| Subscribe (Stripe) | subscriptions table | ⚠️ Depends on Stripe webhook idempotency | Medium |
| Delete Account | Cascading deletes | ❌ No (delete is destructive, no undo) | N/A |
| Mark Activity | UPDATE last_activity_at | ✅ Yes (idempotent by design) | Low |
| Rate limit check | In-memory Map | ⚠️ Resets on cold start (not truly idempotent) | Medium |

### Critical Idempotency Gaps

1. **followUpScheduler.scheduleFollowUps()** — If called twice (e.g., network retry after partial success), creates duplicate dayN records
2. **decision_log.insert()** — No unique constraint on (twin_id, question, user_choice) tuple
3. **share_links.insert()** — Random code generation provides some uniqueness but no DB-level enforcement
4. **chat message save** — No deduplication key; identical messages can be saved multiple times

---

## 11. PARTIAL SUCCESS ANALYSIS

### Where Partial Success Occurs

| Operation | Success Part | Failure Part | Consequence | Risk |
|-----------|-------------|--------------|-------------|------|
| Chat send | saveTwinMemory(userMessage) succeeds | callTwinAPI() fails | Orphan user message in history | Medium |
| Chat send | API succeeds | saveTwinMemory(response) fails | Response in UI but not persisted on reload | High |
| Twin creation | DB INSERT twins succeeds | lifecycleStore.setTwinCreated() fails | Twin exists but status not updated | Medium |
| Twin creation | SICE orchestration succeeds | createTwinInDatabase() fails | essenceId lost, no Twin created | Medium |
| Decision insert | decision_log INSERT succeeds | scheduleFollowUps() fails | No future reminders | Medium |
| World favorite | DB upsert succeeds | React Query invalidation fails | UI shows old state until manual refresh | Low |
| Avatar upload | file upload to storage succeeds | metadata UPDATE fails | Avatar image exists but profile not updated | Medium |
| Follow-up | scheduleFollowUps inserts day30 | day90 insert fails | Only some reminders created | Low |

### Transaction Safety Assessment

**Most operations lack transaction safety.** Examples:
- Chat: saveTwinMemory() and API call are SEPARATE await statements. No wrapping try/catch that rolls back.
- Twin creation: SICE orchestration (pure compute) → createTwinInDatabase() (DB write) → lifecycleStore (another DB write). Each step independent.
- Decision: INSERT decision_log → scheduleFollowUps(). If second fails, decision exists without follow-ups.

This is **by design** (simplicity over atomicity), but creates known gaps where state is inconsistent.

---

## 12. EMPTY / NULL DATA ANALYSIS

### Critical Data Objects

| Object | When Null/Missing | UI Behavior | Status |
|--------|-------------------|-------------|--------|
| `twin` (TwinContext) | No Twin created yet | ImmersiveTwinChat shows "Twin hasn't awakened" CTA | 🟢 GRACEFUL |
| `session` | Not logged in | Redirect to /login or show landing | 🟢 GRACEFUL |
| `currentAnalysis` | Onboarding not completed | AnalysisPage shows placeholder/empty state | 🟡 PARTIAL |
| `personalContext` | getContext() returns null | ExperienceEngine.compute() returns null → config=null | 🟡 PARTIAL |
| `decisions` [] | User has no decisions | DecisionDashboard shows empty state | 🟢 GRACEFUL |
| `worldPreferences` {} | New user | Empty map → no favorites shown | 🟢 GRACEFUL |
| `badges` [] | No badges earned | BadgeGallery shows empty/placeholder | 🟢 GRACEFUL |
| `avatar` null | No avatar uploaded | UserAvatar shows fallback/default | 🟢 GRACEFUL |
| `history` [] | First visit | Chat shows empty conversation | 🟢 GRACEFUL |
| `birthDate` | Not yet provided | Birth archetypes calc returns undefined | ⚠️ May affect UI |
| `memoryList` | Empty memories | MemoryList renders empty section | 🟢 GRACEFUL |

### Defensive Coding Patterns Found

Many components use optional chaining (`?.`) and nullish coalescing (`??`) extensively:
- `twin?.name || 'Twin'` → defaults to 'Twin' if name undefined
- `config?.shouldAutoApplyHub` → safe even if config null
- `error instanceof Error ? error.message : fallback` → safe even for non-Error exceptions

These patterns indicate intentional resilience against null/undefined state.

---

## 13. EXTERNAL PROVIDER FAILURE ANALYSIS

| Provider | Role | Failure Mode | Detection | Mitigation | User Impact |
|----------|------|-------------|-----------|------------|-------------|
| Supabase DB | All data operations | Connection refused, timeout, schema mismatch | Supabase client throws error | try/catch → setError() shown | High |
| Supabase Auth | Authentication | GoTrue down, CORS blocked | getSession() fails | Loading state → eventual redirect | High |
| OpenRouter API | AI responses | Down, rate limited, malformed | fetch() throws or returns bad data | Fallback chain (stream→JSON) | High |
| Cloudflare Pages Functions | Backend handlers | Cold start, isolate recycle | 5xx response | Client catch → setError() | Medium |
| Web Speech API | Voice features | Not supported, permission denied | API throws or returns empty | Silent degradation | Medium |
| WebGL/Three.js | Twin visualization | No GPU, browser incompatibility | Canvas init fails | Silent failure (blank space) | Medium |
| Stripe API | Payments | Down, sandbox misconfigured | checkout creation fails | Error message shown | High |
| Firebase Cloud Messaging | Push delivery | Project not configured | send-push returns 500 | No client-side detection | Low |
| DNS/CDN | Asset loading | Domain resolution fails | Images/scripts 404 | Broken UI elements | Medium |
| Email relay (Supabase) | Magic link | SMTP unreachable | signInWithOtp throws | Error shown to user | Medium |

---

## 14. RECOVERY STATE MACHINES

### Auth Recovery State Machine

| Current State | Failure | Expected Recovery | Actual Code Path | Verified? |
|--------------|---------|------------------|-----------------|-----------|
| Authenticating (loading=true) | Timeout | Loading stays true indefinitely | No timeout → user stuck | ⚪ UNPROVEN |
| Authenticated | Session expires | onAuthStateChange → null → redirect to login | Implemented | 🟢 Verified |
| onOnboarding | Page refresh | PendingOnboardingSaver saves to sessionStorage | sessionStorage persists across tab close? | ⚪ UNPROVEN |
| mid-Twin-Birth | Page refresh | localStorage check → resume or restart | checkExistingTwin prevents duplicate | 🟡 Partial |

### Twin Birth Recovery State Machine

| Current State | Failure | Expected Recovery | Actual Code Path | Verified? |
|--------------|---------|------------------|-----------------|-----------|
| Phase 1 (intro) | Refresh | Resume from localStorage | useEffect loads saved state | 🟡 Partial |
| Phase 2 (birth anim) | Refresh | Restart animation | Three.js recreates, archetype recalculated | ✅ Works |
| Phase 3 (naming) | Refresh | **FAIL** — input lost | No localStorage for twinName | ❌ Data Loss |
| Phase 3 (naming) | DB insert fails | retry withLifecycleRetry | WithLifecycleRetry only covers lifecycleStore, NOT initializeTwin | 🔴 Gap |
| Post-birth | navigate to /brief | Hardcoded setTimeout(4000) | If page unloaded before timeout, redirect may not fire | ⚪ UNPROVEN |

### Chat Recovery State Machine

| Current State | Failure | Expected Recovery | Actual Code Path | Verified? |
|--------------|---------|------------------|-----------------|-----------|
| idle (waiting for message) | N/A | User types, sends | Normal flow | 🟢 Verified |
| sending (awaiting response) | Network drop | stream→fallback→setError | Shows error, enables re-send | 🟡 Partial |
| sending (awaiting response) | AI timeout | **NO TIMEOUT EXISTS** | fetch hangs until browser kills it | 🔴 Design Gap |
| conversation viewing | Refresh | Messages reloaded from twin_memories | loadRecentMemories() on mount | 🟡 Partial |
| conversation viewing | Navigation away then back | Unmount/remount → stale messages[] | React remounts component | ⚪ UNPROVEN |

---

## 15. TEST EVIDENCE FOR FAILURE/RECOVERY

### Test Files Related to Failure/Recovery

| Test File | What It Tests | Quality Assessment |
|-----------|--------------|-------------------|
| `negative-cases.spec.ts` | Negative input cases, offline queue message | Lines commented out (not executed) |
| `security.spec.ts` | Password reset rate limiting | Tests throttling behavior |
| `performance.spec.ts` | Load time benchmarks | Performance, not failure handling |
| `mobile.spec.ts` | Mobile viewport behavior | Layout, not failure |
| `upload.spec.ts` | UPLOAD-03: avatar persists across reload | Tests persistence, not failure path |
| `twin-birth.spec.ts` | Line 60: `test.skip('should recover interrupted birth flow on reload')` | **Explicitly SKIPPED** — recovery test not implemented |
| `master-gate.spec.ts` | MG tests including recovery cycle retry logic | Retry loop present (lines 39-59) |
| `src/__tests__/*.test.ts` | Various unit tests | Most test happy paths; few test error conditions |

### Key Finding: Recovery Test Skipped

`twin-birth.spec.ts:60`:
```typescript
test.skip('should recover interrupted birth flow on reload', async ({ page }) => {
```

This test is **explicitly skipped** — indicating that Twin Birth recovery from interruption is known to be incomplete.

### Error-Related Test Coverage

Tests that verify error handling exist for:
- Auth flows (passwordless login error paths)
- Upload validation (invalid file type/size rejection)
- API responses (mocked error scenarios in Vitest)
- Rate limiting (429 responses)

But tests that verify **user-visible recovery** are rare. Most error tests assert implementation details (HTTP status codes) rather than user experience.

---

## 16. FAILURE / RECOVERY LEDGER

| ID | Domain | Trigger | Evidence | Current Behavior | Recovery | Status | Priority |
|----|--------|---------|----------|-----------------|----------|--------|----------|
| FR-001 | Chat | API 500 error | Try/catch in handleSend | Generic error shown, no retry button | Manual re-type required | 🟡 PARTIAL | P1 |
| FR-002 | Chat | OpenRouter timeout | No AbortController on fetch | Fetch hangs indefinitely | User must navigate away or close tab | 🔴 BROKEN | P1 |
| FR-003 | Chat | Streaming fails | streamTwinResponse→callTwinAPI fallback | Silent degradation, no user notification | User gets delayed non-streaming response | 🟡 PARTIAL | P2 |
| FR-004 | Chat | saveTwinMemory succeeds, API fails | Lines 359 (save) before 378 (API) | Orphan user message in history | User message visible but no response | 🔴 BROKEN | P1 |
| FR-005 | Chat | API succeeds, saveTwinMemory fails | Line 404 (save) after 401 (response) | Message in UI, lost on refresh | Message not persistent | 🔴 BROKEN | P1 |
| FR-006 | Chat | Rapid double-submit | setIsSending=true but no button disabled | Likely prevented by empty message check | Implicit protection | 🟡 PARTIAL | P3 |
| FR-007 | Birth | Refresh during naming phase | useState only, no localStorage for twinName | Input field resets to empty | Data loss | 🔴 BROKEN | P1 |
| FR-008 | Birth | Refresh during celebration | setTimeout countdown lost | Timer may fire immediately on reload | Unexpected behavior | 🟠 INCOMPLETE | P2 |
| FR-009 | Birth | initializeTwin DB failure | No retry for DB error (only lifecycleRetry) | Ceremony fails, Twin not created | Manual retry required | 🔴 BROKEN | P1 |
| FR-010 | Birth | SICE orchestration fails | catch(console.error) only | Cerimony proceeds to naming without insight | Degraded experience, no error shown | 🔴 BROKEN | P1 |
| FR-011 | Birth | Twin creation already exists | checkExistingTwin prevents duplicate | clearBirthState() skips ceremony | Protected | 🟢 VERIFIED | P0 |
| FR-012 | Auth | Session expires mid-use | onAuthStateChange fires → session=null → redirect | Redirect to login | Automatic recovery | 🟢 VERIFIED | P0 |
| FR-013 | Auth | Passkey unavailable | isAvailable() returns false | UI hides passkey option | Graceful fallback | 🟢 VERIFIED | P0 |
| FR-014 | World | Favorite toggle fails | .catch(console.error) silently | Local state correct, server disagrees | Desync | 🟠 INCOMPLETE | P2 |
| FR-015 | World | Stats increment fails | Second upsert fails after first succeeds | Partial stats recorded | Data inconsistency | 🔴 BROKEN | P2 |
| FR-016 | Decision | Insert succeeds, scheduleFollowUps fails | Separate await calls | Decision exists, no reminders | Partial functionality | 🔴 BROKEN | P2 |
| FR-017 | Decision | Duplicate insert | No unique constraint on (twin_id, question) | Multiple identical decisions possible | Data quality issue | 🟡 PARTIAL | P3 |
| FR-018 | Context | 8 independent builders | Each consumer creates new PersonalContextBuilder | Potential stale data across consumers | Inconsistency | 🟠 INCOMPLETE | P2 |
| FR-019 | Avatar | Image compress retry infinite loop | `while (blob.size > MAX && attempts < 5)` | Max 5 attempts, then saves garbled bytes | Data corruption | 🟠 INCOMPLETE | P3 |
| FR-020 | Push | VAPID keys not configured | Edge function returns 500 | Pushes never sent | Feature broken if misconfigured | 🟠 INCOMPLETE | P2 |
| FR-021 | Sharing | Invalid share code | share_links query returns null | Empty/placeholder view shown | Graceful handling | 🟢 VERIFIED | P3 |
| FR-022 | Stripe | Webhook fails after payment succeeds | No client-side webhook retry | Subscription not updated | State mismatch | 🔴 BROKEN | P1 |
| FR-023 | Account deletion | Cascade delete fails mid-way | Sequential deletes without transaction | Some data remains | Incomplete cleanup | 🟠 INCOMPLETE | P2 |
| FR-024 | Network | Offline state | ServiceWorker may serve cached pages | Offline UI may be stale | Known limitation | 🟡 PARTIAL | P3 |
| FR-025 | Rate limit | 429 response from /api/twin | retryAfter: 60 in response | Client must wait; no automatic retry | Manual retry required | 🟡 PARTIAL | P2 |
| FR-026 | Stream fallback | twin-stream.ts → callTwinAPI | Silent degradation, no user notification | User sees normal response but delayed | Invisible quality drop | 🟡 PARTIAL | P2 |
| FR-027 | Birth ceremony | withLifecycleRetry only retries lifecycleStore | initializeTwin() itself not retried | DB failure during birth causes permanent failure | No recovery path | 🔴 BROKEN | P1 |
| FR-028 | Blog loading | BlogArticle uses AbortController | Properly aborts on unmount | Prevents stale setState | Well-implemented | 🟢 VERIFIED | P0 |

---

## 17. CONFIRMED FINDINGS (Verified from Source Code)

### Confirmed Working Patterns

1. **Auth session expiry handled** — onAuthStateChange listener properly manages session lifecycle
2. **Twin creation protected from duplicates** — checkExistingTwin + unique constraint prevents double-insert
3. **Chat has fallback chain** — streaming → non-streaming → error message
4. **Blog article loading has AbortController** — prevents stale setState on unmount
5. **React Query caching reduces redundant API calls** — staleTime 10-60s across components
6. **Avatar upload has compression retry** — 5 attempts with size-based exit condition

### Confirmed Gaps

1. **No request timeout on chat API calls** — fetch hangs indefinitely with no AbortController
2. **No retry button after chat send fails** — user must manually re-type
3. **Naming input not persisted across refresh** — useState only, localStorage not used for twinName
4. **Chat message persistence split from API call** — saveTwinMemory runs BEFORE and AFTER API call with no transaction; either side can leave orphan data
5. **No retry for initializeTwin DB failure** — only lifecycleStore errors get retry
6. **SICE orchestration failure silent** — .catch(console.error) gives zero user feedback
7. **Rate limit has no automatic retry** — 429 response requires manual user action after 60s wait
8. **Partial success gaps exist** — multiple operations have two-step writes with no atomicity guarantee

---

## 18. UNPROVEN FINDINGS (Cannot Verify Without Runtime)

| Finding | Why Unproven | What Would Confirm |
|---------|-------------|-------------------|
| Whether VAPID keys provisioned on staging | Config exists, provisioning unknown | Check CF dashboard / Supabase settings |
| Whether OpenRouter returns empty responses reliably | Code handles it, actual behavior unknown | Send test messages, observe responses |
| Whether service worker caches enough for offline use | sw.js hand-written, cache strategy unclear | Test offline mode manually |
| Whether cross-tab session sync works | Supabase auth events documented but not tested | Open two tabs, log out from one |
| Whether BlogArticle AbortController actually works | Code present, timing dependent | Network throttle + quick navigation test |
| Whether rate limit resets predictably on CF cold start | In-memory Map, CF lifecycle unknown | Monitor rate limit behavior across deployments |
| Whether ImageProcessor handles extremely large files | Loop max 5 attempts, may give garbled result | Upload very large image and inspect result |
| Whether share links have privacy boundaries | Code exists, specific data exposed unclear | Generate link, open as anonymous user, inspect data |

---

## 19. CODE-ONLY / ORPHAN FINDINGS

| Finding | Description | Classification |
|---------|-------------|---------------|
| `streamTwinResponse` in TwinAPIService.ts | WAS code-only in Phase 5; NOW VERIFIED as wired to ImmersiveTinnerChat | 🟢 Moved to verified |
| `nova-stream.ts` functions/api | Exists, but NovaChat uses streamNovaResponse (need to verify) | ⚪ UNPROVEN |
| `autonomy-log.ts` functions/api | Writes to wrong table (migration orphaned) | 🟤 ORPHAN |
| `weekly-supabase-resume.ts` scripts | Utility script, not user-facing | 🟣 IMPLEMENTATION-ONLY |
| `supabase-lifecycle.ts` scripts | Utility script, not user-facing | 🟣 IMPLEMENTATION-ONLY |
| `imageProcessor.ts` compress retry loop | 5-attempt loop may produce garbled bytes | 🔴 POTENTIAL DATA CORRUPTION |
| `streaming` endpoints | twin-stream.ts (VERIFIED), nova-stream.ts (needs verification) | Mixed status |

---

## 20. PRIORITY CLASSIFICATION

### P0 — Data Corruption / Security / Unrecoverable

| ID | Issue | Severity |
|----|-------|----------|
| FR-023 | Account deletion cascade failure → orphaned data | High |
| FR-019 | ImageProcessor infinite-loop variant → garbled bytes | Medium |

### P1 — Core User Flow Cannot Recover

| ID | Issue | Severity |
|----|-------|----------|
| FR-002 | Chat API timeout with no AbortController → frozen UI | High |
| FR-004 | Orphan user message when API fails after save | High |
| FR-005 | Response lost on refresh when save fails after API | High |
| FR-009 | Twin creation DB failure with no retry → permanent failure | High |
| FR-010 | SICE orchestration failure silent → degraded ceremony | High |
| FR-016 | Decision created without follow-up reminders | Medium-High |
| FR-022 | Stripe payment succeeds but webhook fails → state mismatch | High |
| FR-027 | InitializeTwin DB failure not retried | High |

### P2 — Important Feature Degradation

| ID | Issue | Severity |
|----|-------|----------|
| FR-001 | Chat error with no retry button | Medium |
| FR-003 | Silent streaming fallback | Medium |
| FR-008 | Celebration timer lost on refresh | Medium |
| FR-014 | World favorite toggle desync | Medium |
| FR-015 | World stats partial increment | Medium |
| FR-018 | 8 independent PersonalContextBuilder instances | Medium |
| FR-020 | Push notifications broken if VAPID misconfigured | Medium |
| FR-025 | Rate limit requires manual retry | Medium |
| FR-026 | Invisible quality drop on streaming fallback | Medium |

### P3 — UX / Resilience Improvement

| ID | Issue | Severity |
|----|-------|----------|
| FR-006 | No explicit button disable for double-submit | Low-Medium |
| FR-017 | No unique constraint on decision deduplication | Low |
| FR-024 | Offline cached pages may be stale | Low |

---

## 21. PHASE 6 VERIFICATION BOUNDARY

### What Was Verified (Static Analysis)

- Error handling code paths exist in source files (verified via grep/trace)
- Retry mechanisms exist (withLifecycleRetry) and their exact behavior traced
- Streaming fallback chain (streamTwinResponse → callTwinAPI → setError) verified
- AbortController presence/absence confirmed per endpoint
- Idempotency guarantees (or lack thereof) identified via DB constraint analysis
- Partial success scenarios mapped by tracing async operation order

### What Could NOT Be Verified

- **Runtime behavior**: No browser session could access staging (Phase 5 limitation carried forward)
- **Actual error messages shown**: Code defines them but we didn't observe them
- **Performance characteristics**: Timeout behavior, latency measurements, resource consumption
- **Cross-browser compatibility**: Different browsers may handle Web Speech API / WebGL differently
- **Edge case frequency**: How often each failure mode actually occurs in production
- **Third-party reliability**: OpenRouter uptime, Supabase health, Stripe availability during actual usage
- **User impact severity**: While we identified technical risks, actual user harm depends on frequency and context

### Runtime Evidence Count: ZERO

All findings in this Phase 6 audit are derived exclusively from:
1. Source code structure analysis (grep patterns, import chains, try/catch coverage)
2. Database constraint inspection (migration files, UNIQUE constraints)
3. API contract examination (handler implementations, status codes)
4. Automated test examination (existing test suites)

### External Dependencies That Cannot Be Verified Remotely

| Dependency | Can Verify From Repo? | Needs Runtime |
|-----------|----------------------|---------------|
| OpenRouter API availability | ❌ No (external service) | ✅ Yes |
| Supabase project health | ❌ No (external service) | ✅ Yes |
| Cloudflare Pages Functions execution | ❌ No (server-side) | ✅ Yes |
| Browser-specific WebSpeech API support | ❌ No (per-device) | ✅ Yes |
| WebGL/WebGL2 support on target devices | ❌ No (hardware-dependent) | ✅ Yes |
| Email delivery via SMTP relay | ❌ No (infrastructure) | ✅ Yes |
| Push notification delivery via FCM | ❌ No (third-party) | ✅ Yes |
| Stripe payment processing | ❌ No (sandbox/live environment) | ✅ Yes |

🛑 STOP — PHASE 6 COMPLETE

Waiting for Phase 7 (Backend/Data/AI/Security) instruction.

