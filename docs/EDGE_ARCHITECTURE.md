# SELFPRINT V3 — EDGE FUNCTIONS ARCHITECTURE

**Status:** 🟡 PARTIAL (12 functions, some incomplete)  
**Platform:** Supabase Edge Functions (Deno)  
**Total Functions:** 12 confirmed  
**Last Updated:** 2026-08-17  
**Verified By:** Phase 2 Audit

---

## 🏗️ EDGE FUNCTIONS STRATEGY

**Purpose:** Offload intelligence orchestration, security, and reliability from client  
**Benefits:**
- Reduce client JS bundle
- Secure API keys (don't expose to frontend)
- Parallel processing (Deno runtime)
- Scheduled tasks (follow-ups, daily briefs)
- Rate limiting & security gates

**Current Strategy:**
- Auth functions: Passkey verification (WebAuthn)
- Intelligence functions: Pattern detection, memory synthesis
- Notifications: Push scheduling (future)
- Data operations: Export, delete, recovery

---

## 📋 EDGE FUNCTIONS INVENTORY (12/12)

### 1️⃣ Auth: Registration Options
**Function:** `auth-registration-options`  
**Path:** `supabase/functions/auth-registration-options/index.ts`  
**Trigger:** HTTP POST  
**Purpose:** Start WebAuthn passkey registration ceremony  
**Input:**
```typescript
{
  email: string;
  username?: string;
  displayName?: string;
}
```
**Output:**
```typescript
{
  registrationOptions: {
    challenge: string;
    rp: { name: string; id: string };
    user: { id: string; email: string; displayName: string };
    pubKeyCredParams: Array<{type: string; alg: number}>;
    authenticatorSelection: {...};
  };
  sessionId: string;
}
```
**Security:**
- Challenge generation (random)
- Session ID for state tracking
- CORS validation
**Database:** auth.users (read email availability)  
**Status:** ✅ IMPLEMENTED  
**Error Handling:** 400 (invalid input), 409 (email exists), 500 (challenge generation failed)

---

### 2️⃣ Auth: Register Passkey
**Function:** `auth-register-passkey`  
**Path:** `supabase/functions/auth-register-passkey/index.ts`  
**Trigger:** HTTP POST  
**Purpose:** Verify WebAuthn credential and create user account  
**Input:**
```typescript
{
  email: string;
  credential: {
    id: string;
    rawId: string;
    response: {
      clientDataJSON: string;
      attestationObject: string;
    };
    type: string;
  };
  sessionId: string;
}
```
**Output:**
```typescript
{
  success: boolean;
  userId: string;
  message: string;
  session?: { token: string; expiresAt: string };
}
```
**Security:**
- Attestation verification
- Challenge validation
- Session binding
- Public key storage
**Database:**
  - auth.users (create)
  - passkey_credentials (store public key)
  - user_profiles (create)
**Status:** ✅ IMPLEMENTED  
**Error Handling:** 400 (invalid credential), 401 (challenge mismatch), 409 (account exists), 500 (DB error)

---

### 3️⃣ Auth: Authentication Options
**Function:** `auth-authentication-options`  
**Path:** `supabase/functions/auth-authentication-options/index.ts`  
**Trigger:** HTTP POST  
**Purpose:** Start WebAuthn login ceremony  
**Input:**
```typescript
{
  email: string;
}
```
**Output:**
```typescript
{
  assertionOptions: {
    challenge: string;
    timeout: number;
    userVerification: string;
    allowCredentials: Array<{type: string; id: string; transports: string[]}>;
  };
  sessionId: string;
}
```
**Security:**
- Challenge generation (random)
- Session ID for state tracking
- Credential lookup (email to credential ID)
**Database:** auth.users (read), passkey_credentials (read)  
**Status:** ✅ IMPLEMENTED  
**Error Handling:** 400 (invalid email), 404 (user not found), 500 (challenge generation failed)

---

### 4️⃣ Auth: Verify Passkey
**Function:** `auth-verify-passkey`  
**Path:** `supabase/functions/auth-verify-passkey/index.ts`  
**Trigger:** HTTP POST  
**Purpose:** Verify WebAuthn assertion and return session token  
**Input:**
```typescript
{
  email: string;
  assertion: {
    id: string;
    rawId: string;
    response: {
      clientDataJSON: string;
      authenticatorData: string;
      signature: string;
      userHandle: string;
    };
    type: string;
  };
  sessionId: string;
}
```
**Output:**
```typescript
{
  success: boolean;
  session: {
    token: string;
    expiresAt: string;
    refreshToken: string;
  };
  userId: string;
}
```
**Security:**
- Assertion verification (signature + challenge)
- Session binding
- Rate limiting (max attempts)
- Token generation (Supabase JWT)
**Database:**
  - auth.users (read, update last_sign_in)
  - passkey_credentials (read public key)
**Status:** ✅ IMPLEMENTED  
**Error Handling:** 400 (invalid assertion), 401 (verification failed), 429 (rate limited), 500 (token generation failed)

---

### 5️⃣ Push Notifications Scheduler
**Function:** `send-push`  
**Path:** `supabase/functions/send-push/index.ts`  
**Trigger:** HTTP POST (from frontend), Scheduled (Supabase Cron)  
**Purpose:** Send Web Push notifications to subscribed users  
**Input (direct call):**
```typescript
{
  userId: string;
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;  // Notification grouping
  actions?: Array<{action: string; title: string}>;
  data?: Record<string, string>;
}
```
**Output:**
```typescript
{
  success: boolean;
  sent: number;  // Number of subscriptions notified
  failed: number;
  message: string;
}
```
**Security:**
- User subscription validation
- Push service authentication
- Rate limiting
**Database:**
  - push_subscriptions (read)
  - notification_queue (read, update status)
**External Service:** Web Push API (browser notifications)  
**Status:** ✅ IMPLEMENTED (scheduled, but dispatch TODO at line 137)  
**Error Handling:** 400 (invalid input), 401 (auth), 404 (user not found), 500 (push service error)

---

### 6️⃣ Pattern Detection (SICE)
**Function:** `pattern-detect`  
**Path:** `supabase/functions/pattern-detect/index.ts`  
**Trigger:** HTTP POST (from SICE orchestrator)  
**Purpose:** Detect patterns in user data via Claude AI  
**Input:**
```typescript
{
  userId: string;
  twinId: string;
  dataType: 'decisions' | 'memories' | 'behaviors' | 'choices';
  timeRange?: { from: string; to: string };  // ISO dates
  limit?: number;  // Data points to analyze
}
```
**Output:**
```typescript
{
  patterns: Array<{
    pattern: string;
    confidence: number;  // 0-1
    evidence: string[];
    recommendation: string;
  }>;
  summary: string;
  insights: string[];
}
```
**Security:**
- User ownership validation
- Twin ownership validation
- Data isolation (no cross-user leaks)
**Database:**
  - decision_log (read)
  - twin_memories (read)
  - decision_patterns (write)
**External Service:** Claude API  
**Status:** ✅ IMPLEMENTED  
**Error Handling:** 400 (invalid input), 401 (auth), 403 (ownership), 500 (Claude API error)

---

### 7️⃣ Daily Brief Generator
**Function:** `daily-brief`  
**Path:** `supabase/functions/daily-brief/index.ts`  
**Trigger:** Scheduled (6 AM user's timezone)  
**Purpose:** Generate personalized daily brief for Twin  
**Input (scheduled trigger):**
```typescript
// Invoked by Supabase Cron — no manual input
// Reads: user timezone, Twin preferences, recent memories/decisions
```
**Output:**
```typescript
{
  userId: string;
  twinId: string;
  brief: {
    greeting: string;
    keyInsights: string[];
    todaysFocus: string;
    suggestedActions: Array<{action: string; context: string}>;
    motivationalMessage: string;
  };
  notificationId: string;
}
```
**Security:**
- User timezone validation
- Twin ownership check
**Database:**
  - user_profiles (read timezone)
  - twins (read preferences)
  - twin_memories (read recent, limit 10)
  - decision_log (read recent decisions)
  - notification_queue (write)
**External Service:** Claude API  
**Status:** ⚠️ PARTIAL (generation works, scheduling needs work)  
**Error Handling:** 400 (invalid user), 401 (auth), 404 (Twin not found), 500 (Claude API error)

---

### 8️⃣ Memory Manager
**Function:** `memory-manager`  
**Path:** `supabase/functions/memory-manager/index.ts`  
**Trigger:** HTTP POST (from Twin chat, services)  
**Purpose:** Store, retrieve, and relevance-score memories  
**Input (store):**
```typescript
{
  twinId: string;
  userId: string;
  action: 'store' | 'retrieve' | 'search' | 'relevance-update';
  world?: string;
  content?: string;
  role?: 'user' | 'twin' | 'system';
  metadata?: {
    eventType?: string;
    topic?: string;
  };
  query?: string;  // For search
  limit?: number;
}
```
**Output (retrieve):**
```typescript
{
  memories: Array<{
    id: string;
    content: string;
    world: string;
    role: string;
    relevance: number;
    createdAt: string;
  }>;
  relevanceScores: Record<string, number>;
}
```
**Security:**
- User ownership validation
- Twin ownership validation
- World context isolation
**Database:**
  - twin_memories (CRUD)
  - memory_relevance (read, write)
**Status:** ✅ IMPLEMENTED  
**Error Handling:** 400 (invalid action), 401 (auth), 403 (ownership), 500 (DB error)

---

### 9️⃣ Data Export (GDPR)
**Function:** `data-export`  
**Path:** `supabase/functions/data-export/index.ts`  
**Trigger:** HTTP POST (from account settings)  
**Purpose:** Export all user data as JSON file (GDPR compliance)  
**Input:**
```typescript
{
  userId: string;
  format?: 'json' | 'csv';  // Default: json
  includeMetadata?: boolean;  // Default: true
}
```
**Output:**
```typescript
{
  success: boolean;
  downloadUrl: string;  // Signed URL to exported file
  filename: string;
  expiresAt: string;  // URL expiration
  dataSize: number;  // Bytes
  message: string;
}
```
**Security:**
- User authentication required
- Signed download URL (expires in 7 days)
- No sensitive fields exposed (passwords, API keys)
**Database:** All tables (read-only)  
**Storage:** Supabase Storage (temporary file)  
**Status:** ✅ IMPLEMENTED  
**Error Handling:** 401 (auth), 403 (unauthorized), 500 (export failed)

---

### 🔟 Account Deletion (GDPR)
**Function:** `account-delete`  
**Path:** `supabase/functions/account-delete/index.ts`  
**Trigger:** HTTP POST (from account settings, with confirmation)  
**Purpose:** Permanently delete user account and all associated data  
**Input:**
```typescript
{
  userId: string;
  password: string;  // Verification (optional, email link preferred)
  confirmationToken: string;  // From email link
}
```
**Output:**
```typescript
{
  success: boolean;
  message: string;
  deletedAt: string;
}
```
**Security:**
- Confirmation token required (sent via email)
- Optional password re-confirmation
- User session invalidation
- Cascade deletion (user → profiles, Twins, memories, decisions, etc)
**Database:**
  - auth.users (delete)
  - user_profiles (delete)
  - twins (delete)
  - All user data (cascade delete)
**Status:** ✅ IMPLEMENTED  
**Error Handling:** 400 (invalid token), 401 (auth), 403 (unauthorized), 500 (deletion failed)

---

### 1️⃣1️⃣ Auth Rate Limiting
**Function:** `auth-rate-limit`  
**Path:** `supabase/functions/auth-rate-limit/index.ts`  
**Trigger:** HTTP Middleware (runs before auth endpoints)  
**Purpose:** Rate limit login attempts to prevent brute force  
**Input:**
```typescript
{
  userId: string;  // Or email for registration
  endpoint: string;  // '/auth/register' | '/auth/login' | etc
  ipAddress: string;
}
```
**Output:**
```typescript
{
  allowed: boolean;
  remaining: number;
  resetAt: string;  // ISO timestamp
  retryAfter?: number;  // Seconds to wait (if limited)
}
```
**Security:**
- Per-user rate limit (10 attempts / 15 minutes)
- Per-IP rate limit (20 attempts / hour)
- Exponential backoff
- Logged attempt tracking
**Database:** rate_limit_log (write attempts)  
**Status:** ✅ IMPLEMENTED  
**Error Handling:** 429 (rate limited), 500 (DB error)

---

### 1️⃣2️⃣ Account Recovery
**Function:** `account-recovery`  
**Path:** `supabase/functions/account-recovery/index.ts`  
**Trigger:** HTTP POST (from login page "Forgot password")  
**Purpose:** Generate recovery link and send via email  
**Input:**
```typescript
{
  email: string;
}
```
**Output:**
```typescript
{
  success: boolean;
  message: string;  // "Recovery email sent to..."
}
```
**Security:**
- Email verification (send recovery link)
- One-time use token (expires in 1 hour)
- Session creation after recovery
- User must re-verify identity
**Database:**
  - auth.users (read, update recovery_token)
  - recovery_tokens (write temporary token)
**Email Service:** Supabase Auth email
**Status:** ✅ IMPLEMENTED  
**Error Handling:** 400 (invalid email), 404 (user not found), 500 (email service error)

---

## 🔗 EDGE FUNCTION ORCHESTRATION

```
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                              │
└─────────────────────────────────────────────────────────────────┘
                      ↓ HTTPS
┌─────────────────────────────────────────────────────────────────┐
│                  API ROUTES (12 APIs)                            │
│  - /api/nova  - /api/twin  - /api/sice/process                 │
│  - /api/decision  - /api/notifications  - /api/stripe           │
│  - ... (6 more)                                                 │
└─────────────────────────────────────────────────────────────────┘
                      ↓ Internal calls
┌─────────────────────────────────────────────────────────────────┐
│            SUPABASE EDGE FUNCTIONS (12 functions)               │
│  ┌─ AUTH (4) ────────────────┐  ┌─ INTELLIGENCE (2) ────────┐ │
│  │ - registration-options    │  │ - pattern-detect          │ │
│  │ - register-passkey        │  │ - daily-brief             │ │
│  │ - authentication-options  │  └──────────────────────────┘ │
│  │ - verify-passkey          │  ┌─ DATA OPS (4) ────────────┐ │
│  └────────────────────────────┘  │ - memory-manager          │ │
│                                   │ - data-export             │ │
│                                   │ - account-delete          │ │
│                                   │ - account-recovery        │ │
│                                   └──────────────────────────┘ │
│  ┌─ NOTIFICATIONS (1) ───────┐  ┌─ SECURITY (1) ────────────┐ │
│  │ - send-push               │  │ - auth-rate-limit         │ │
│  └────────────────────────────┘  └──────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                      ↓ Supabase SDK
┌─────────────────────────────────────────────────────────────────┐
│              SUPABASE DATABASE (PostgreSQL)                      │
│  - auth.users  - user_profiles  - twins  - twin_memories        │
│  - decisions  - notifications  - recovery_tokens                │
│  - rate_limit_log  - passkey_credentials                        │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📊 EDGE FUNCTION STATUS SUMMARY

| # | Function | Status | Type | Purpose | DB | Tests | Error Handling |
|---|----------|--------|------|---------|----|----|--------|
| 1 | auth-registration-options | ✅ | WebAuthn | Register ceremony | ✅ | ⚠️ | ✅ |
| 2 | auth-register-passkey | ✅ | WebAuthn | Create account | ✅ | ⚠️ | ✅ |
| 3 | auth-authentication-options | ✅ | WebAuthn | Login ceremony | ✅ | ⚠️ | ✅ |
| 4 | auth-verify-passkey | ✅ | WebAuthn | Verify login | ✅ | ⚠️ | ✅ |
| 5 | send-push | ✅ | Notifications | Send notifications | ⚠️ | ⚠️ | ✅ |
| 6 | pattern-detect | ✅ | Intelligence | Pattern analysis | ✅ | ⚠️ | ✅ |
| 7 | daily-brief | ⚠️ | Intelligence | Daily personalization | ⚠️ | ❌ | ⚠️ |
| 8 | memory-manager | ✅ | Data Ops | Memory CRUD | ✅ | ⚠️ | ✅ |
| 9 | data-export | ✅ | GDPR | Export data | ✅ | ⚠️ | ✅ |
| 10 | account-delete | ✅ | GDPR | Delete account | ✅ | ⚠️ | ✅ |
| 11 | auth-rate-limit | ✅ | Security | Rate limiting | ⚠️ | ⚠️ | ✅ |
| 12 | account-recovery | ✅ | Recovery | Password recovery | ⚠️ | ⚠️ | ✅ |

---

## 🚀 OPTIMIZATION OPPORTUNITIES

### Functions to move from Frontend to Edge (Phase 3+)
- ✅ SICE Orchestration (parallel processing)
- ✅ Twin chat response generation (Claude API)
- ✅ Decision follow-up scheduling (reliability)
- ✅ Memory synthesis (compute-intensive)
- ✅ World context resolution (security)

### Functions to improve in Phase 10 (Testing)
- ⚠️ daily-brief (add unit tests)
- ⚠️ send-push (scheduler integration tests)
- ⚠️ memory-manager (edge case testing)

---

## ⚙️ DEPLOYMENT & MONITORING

**Deployment:**
- `supabase functions deploy <function-name>`
- Deploy via GitHub Actions CI/CD (recommended)
- Secret management via Supabase dashboard

**Monitoring:**
- Supabase functions logs (Supabase dashboard)
- Error tracking (Sentry integration optional)
- Performance monitoring (built-in metrics)

**Scalability:**
- Supabase Edge Functions auto-scale
- No cold-start issues (Deno)
- Built-in rate limiting

---

**Document:** EDGE_ARCHITECTURE.md  
**Last Verified:** Phase 2 (2026-08-17)  
**Next Review:** After Phase 7 (Decision Intelligence complete)
