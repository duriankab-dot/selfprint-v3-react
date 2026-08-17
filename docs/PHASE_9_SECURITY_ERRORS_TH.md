# PHASE 9 — Security + Error Handling (ภาษาไทย)

**วันที่:** 2026-08-17 | **Status:** 🔧 AUDIT | **Token:** Managed

---

## 🔴 Phase 9 ต้องทำ

### 1️⃣ Authentication Security

**File:** `AuthContext.tsx` ✅ **MOSTLY DONE**

```typescript
// ✅ DONE: Passkey (WebAuthn) registration + login
// ✅ DONE: Magic link signin
// ✅ DONE: OAuth (Google/Apple)
// ✅ DONE: Biometric unlock support

// ❌ TODO: Session timeout
// Sessions need auto-logout after 30 min inactivity
const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

// ❌ TODO: CSRF token validation
// Every form mutation needs CSRF token
async function validateCSRFToken(token: string): Promise<boolean> {
  const { data } = await supabase
    .from('csrf_tokens')
    .select('*')
    .eq('token', token)
    .eq('user_id', userId)
    .gt('expires_at', new Date().toISOString())
    .single();
  
  return !!data;
}

// ❌ TODO: Rate limiting on auth endpoints
// /api/auth/register — max 5 attempts per IP per hour
// /api/auth/signin — max 10 attempts per IP per hour
// /api/auth/magic-link — max 3 per email per hour
```

**Status:** ⚠️ PARTIAL (70% — auth works, need session timeout + CSRF + rate limits)

---

### 2️⃣ RLS (Row-Level Security) Policies

**Status:** ✅ VERIFIED (RLS enabled on key tables)

```sql
-- ✅ VERIFIED TABLES WITH RLS:
-- • world_preferences (user_id scoped)
-- • twin_memories (twin_id + user_id scoped)
-- • decision_log (user_id scoped)
-- • chat_messages (user_id scoped)

-- ❌ TODO: Audit all tables for RLS
-- Tables to verify:
-- □ users_profiles
-- □ stripe_sessions
-- □ blog_articles (public read, auth write)
-- □ testimonials (public read approved, auth write)
-- □ awakening_essence (user-scoped, auto-expire)
-- □ sice_results (user+twin scoped)

-- Example policy needed:
CREATE POLICY "Users can only see their own Twin data"
  ON public.twins
  FOR SELECT
  USING (auth.uid() = user_id);
```

**Status:** ⚠️ PARTIAL (70% of tables have RLS, need audit of remaining 30%)

---

### 3️⃣ Input Validation + Sanitization

**Status:** ❌ NOT STARTED (0%)

```typescript
// ❌ TODO: Create validation schema
import { z } from 'zod';

// Validate Twin message
const TwinChatSchema = z.object({
  twinId: z.string().uuid('Invalid Twin ID'),
  message: z.string().min(1, 'Message required').max(2000, 'Message too long'),
  world: z.enum(['self', 'health', 'wealth', 'career', 'relationships', 'learning', 'creativity', 'spirituality', 'adventure', 'legacy', 'joy', 'integration']),
});

// Validate decision input
const DecisionSchema = z.object({
  title: z.string().max(200),
  options: z.array(z.string()).min(2).max(10),
  context: z.string().max(1000).optional(),
  world: z.string(),
});

// Use in API
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validated = TwinChatSchema.parse(body);
    
    // Process validated data
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
  }
}

// Sanitize output (XSS prevention)
import DOMPurify from 'isomorphic-dompurify';

function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, { ALLOWED_TAGS: ['b', 'i', 'em', 'strong'] });
}
```

**Status:** ❌ NOT STARTED

---

### 4️⃣ Error Boundaries + Logging

**Status:** ❌ NOT STARTED (0%)

```typescript
// ❌ TODO: Error boundary component
import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error
    console.error('Error caught by boundary:', error, errorInfo);
    
    // Send to monitoring (Sentry, etc.)
    await logErrorToService({
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      userId: getCurrentUserId(),
      timestamp: new Date(),
    });
    
    this.setState({ hasError: true, error });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-page">
          <h1>Something went wrong</h1>
          <p>Please try refreshing the page. If the issue persists, contact support.</p>
          <button onClick={() => window.location.reload()}>Reload</button>
        </div>
      );
    }

    return this.props.children;
  }
}

// ❌ TODO: API error handling
const apiErrorHandler = (error: any) => {
  if (error.response?.status === 401) {
    // Unauthorized — redirect to login
  } else if (error.response?.status === 403) {
    // Forbidden — show permission error
  } else if (error.response?.status === 429) {
    // Rate limited — show backoff message
  } else {
    // Generic error — log and show user-friendly message
  }
};
```

**Status:** ❌ NOT STARTED

---

### 5️⃣ Data Encryption (Sensitive Fields)

**Status:** ⚠️ PARTIAL (20%)

```typescript
// ✅ DONE: Supabase edge encryption at rest
// Handled by Supabase infrastructure

// ❌ TODO: Encrypt sensitive fields in transit
// Stripe payment data (PCI compliance)
const stripeConfig = {
  apiKey: process.env.STRIPE_SECRET_KEY, // ✅ env var
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET, // ✅ env var
  // ✅ HTTPS enforced
};

// ❌ TODO: Encrypt Twin memories (optional user privacy feature)
// Needed: End-to-end encryption for memory export
async function exportTwinMemoriesEncrypted(
  userId: string,
  encryptionKey: string
): Promise<EncryptedMemories> {
  const memories = await fetchTwinMemories(userId);
  
  // Encrypt using user's key
  const encrypted = await encryptAES256(
    JSON.stringify(memories),
    encryptionKey
  );
  
  return { encrypted, algorithm: 'AES-256-GCM' };
}
```

**Status:** ⚠️ PARTIAL (Supabase SSL in transit, need Stripe PCI + optional E2E)

---

## 📋 Phase 9 Checklist

### Authentication (Priority P0)
- [ ] Session timeout (30 min inactivity)
- [ ] CSRF token generation & validation
- [ ] Rate limiting on auth endpoints
- [ ] Logout on session expire
- [ ] Secure cookie settings (HttpOnly, Secure, SameSite)
- [ ] Test: Login → 30 min idle → auto logout

### RLS Verification (Priority P0)
- [ ] Audit all tables for RLS enabled
- [ ] Verify user_id scope on all user-owned data
- [ ] Verify twin_id scope on Twin-owned data
- [ ] Test: User A cannot read User B's data
- [ ] Test: Twin A cannot read Twin B's data

### Input Validation (Priority P0)
- [ ] Create Zod schemas for all inputs
- [ ] Validate on API endpoints
- [ ] Sanitize string outputs (XSS prevention)
- [ ] Reject oversized payloads
- [ ] Test: Invalid input → 400 error

### Error Handling (Priority P1)
- [ ] Create ErrorBoundary component
- [ ] Implement API error handler
- [ ] Send errors to logging service
- [ ] Show user-friendly error messages
- [ ] Avoid exposing stack traces to client

### PCI Compliance (Priority P0 — Stripe)
- [ ] Never log credit card data
- [ ] Never store full card numbers
- [ ] Use Stripe tokenization (handling card data)
- [ ] HTTPS enforced on all payment endpoints
- [ ] Webhook signature verification
- [ ] Test: Payment flow → PCI compliant

### Data Encryption (Priority P2)
- [ ] Review all transit encryption (HTTPS)
- [ ] Implement optional E2E memory encryption
- [ ] Secure API keys in environment variables
- [ ] Test: Intercepted traffic is unreadable

---

## 🚨 Security Risks (Current)

| Risk | Severity | Status |
|------|----------|--------|
| No session timeout | 🔴 High | ❌ Not implemented |
| CSRF not validated | 🔴 High | ❌ Not implemented |
| Rate limiting missing | 🟡 Medium | ❌ Not implemented |
| No error boundary | 🟡 Medium | ❌ Not implemented |
| RLS incomplete | 🟡 Medium | ⚠️ 70% done |
| No input validation | 🟡 Medium | ❌ Not implemented |
| Stripe webhook unverified | 🔴 High | ❌ Not implemented |

---

## 📍 Files

```
src/context/AuthContext.tsx ⚠️ (auth done, session timeout missing)
src/services/CSRFService.ts ❌ (not created)
src/services/RateLimiterService.ts ❌ (not created)
src/components/ErrorBoundary.tsx ❌ (not created)
src/middleware/inputValidation.ts ❌ (not created)
src/api/stripe/webhook.ts ⚠️ (signature verification missing)
src/lib/encryption.ts ❌ (optional E2E)

Database:
├── All tables need RLS audit
└── csrf_tokens table needed
```

---

## ⏭️ After Phase 9

✅ Authentication secure (timeout + CSRF)  
✅ Data isolation enforced (RLS complete)  
✅ Inputs validated (no XSS/injection)  
✅ Errors logged safely (no stack traces)  
✅ Payments PCI-compliant  
✅ Ready for Phase 10 Testing

---

**Document:** PHASE_9_SECURITY_ERRORS_TH.md  
**Language:** ภาษาไทย | **Concise:** ✅ | **Token:** Managed
