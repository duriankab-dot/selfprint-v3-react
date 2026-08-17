# P0-B: PRODUCTION SECURITY VERIFICATION CHECKLIST

**Date:** 2026-08-17  
**Status:** PARTIAL → Target: VERIFIED  
**Effort:** 6-8 hours  
**Blocker Level:** CRITICAL (Release Gate)

---

## 📋 OVERVIEW

This checklist identifies and resolves security gaps blocking production deployment. Based on audit dated 2026-08-17, Selfprint has security hardening (input validation, error handling) but lacks comprehensive verification and middleware integration.

**Target State:** All 7 security areas VERIFIED + TESTED

---

## 1. SESSION POLICY & AUTH MIDDLEWARE

### Current State
- ✅ Passkey/WebAuthn support exists
- ✅ Supabase Auth integration
- ⏳ TODO: Auth middleware integration on API endpoints (noted in Phase G handoff)

### Implementation Checklist

#### 1.1 Session Lifecycle
- [ ] Create `src/middleware/auth-middleware.ts`
  - Validate JWT token on every API request
  - Check token expiry, refresh if needed
  - Reject expired or invalid tokens with 401
  - Log all auth failures for audit trail

```typescript
// Pseudocode pattern
async function authMiddleware(req: Request): Promise<User | null> {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return null;
  
  const decoded = verifyJWT(token);
  if (expired) {
    try { token = await refreshToken(); }
    catch { return null; }
  }
  return decoded.user;
}
```

**Files to modify:**
- `server/index.ts` (express middleware)
- All API routes in `api/` directory

**Test:** `npm run test -- auth-middleware.test.ts`

#### 1.2 Session Timeout
- [ ] Implement 30-minute idle timeout
  - Track last activity timestamp
  - Auto-logout after timeout
  - Warn user at 25-minute mark

**Files:**
- `src/contexts/AuthContext.tsx` - add idle detection
- `src/middleware/session-timeout.ts` - new

#### 1.3 Concurrent Session Management
- [ ] Limit to 1 active session per user (or configurable)
- [ ] On login: Invalidate previous tokens
- [ ] Enforce: "New login revokes old session"

**Database:** Update sessions table with invalidation logic

#### 1.4 CSRF Protection
- [ ] Generate CSRF token on every state-changing operation
- [ ] Validate token on: POST, PUT, PATCH, DELETE
- [ ] Store token in memory (not localStorage for security)
- [ ] Regenerate after every login

**Pattern:**
```typescript
const csrfToken = crypto.randomBytes(32).toString('hex');
// Include in POST body or X-CSRF-Token header
// Validate on server: hash(provided) === hash(stored)
```

---

## 2. ENDPOINT AUTHORIZATION & RLS

### Current State
- ✅ Input validation on decision endpoints
- ✅ Supabase RLS architecture exists
- ⏳ RLS rules: Not fully verified against actual data

### Implementation Checklist

#### 2.1 API Endpoint Authorization
- [ ] Audit all `/api/*` endpoints for access control
  - `GET /api/twins/{twinId}` — Only owner can read
  - `POST /api/decisions` — Only authenticated user
  - `PUT /api/profile/{userId}` — Only self or admin
  - `DELETE /api/decisions/{id}` — Only owner or admin

**Verification pattern:**
```typescript
const userId = await getUserFromToken(req);
if (userId !== req.body.userId) {
  return res.status(403).json({ error: 'Forbidden' });
}
```

**Files to review:**
- `api/unified-handler.ts` (main API entry)
- `server/index.ts` (all route definitions)
- Each service: `TwinSupabaseService`, `DecisionService`, etc.

#### 2.2 Row-Level Security (RLS) Testing
- [ ] Test each RLS policy in Supabase console
  - Set user_id = 'test-user-123'
  - Attempt unauthorized access
  - Verify 403/Forbidden response
  
**Tables to test:**
- `twins` — Only user can read own twin
- `chat_messages` — Only user can read own messages
- `decisions` — Only user can read own decisions
- `notifications` — Only user can read own notifications

**Test script:**
```sql
-- As authenticated user 'user-123', can I read user-456's data?
SELECT * FROM twins WHERE user_id = 'user-456';
-- Should return 0 rows (RLS blocks it)
```

#### 2.3 World Context Isolation
- [ ] Verify world-scoped queries
  - User can only see expertise scores for THEIR worlds
  - User can only modify own world context
  - No leakage of other users' world data

**Files:**
- `WorldExpertiseService.ts`
- `WorldRoutingService.ts`

---

## 3. RATE LIMITING & ABUSE PROTECTION

### Current State
- ✅ TODO noted in Phase G
- ⏳ No rate limiting implemented

### Implementation Checklist

#### 3.1 API Rate Limiting
- [ ] Implement rate limiter (express-rate-limit or custom)
  - Per-IP: 100 requests/minute
  - Per-user: 1000 requests/hour
  - Per-endpoint: Stricter limits for expensive ops

**Pattern:**
```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests'
});

app.post('/api/decisions', limiter, handlerFunction);
```

**Endpoints to protect:**
- POST `/api/twins` (expensive AI processing)
- POST `/api/chat` (AI inference)
- POST `/api/decisions` (batch inserts)
- POST `/api/stripe/webhook` (sensitive)

#### 3.2 Brute Force Protection
- [ ] Login attempt throttling
  - Max 5 failed attempts per 15 minutes
  - Progressive backoff (1s, 2s, 4s, 8s, 16s)
  - Lock account for 30 minutes after 10 failures

**Files:**
- `src/lib/auth/PasskeyProvider.ts` — Add rate limiting
- New: `src/middleware/brute-force-protection.ts`

#### 3.3 DDoS Protection
- [ ] Cloudflare or similar (configured on Vercel)
- [ ] Request size limits (1MB max payload)
- [ ] Connection pooling limits

**Configuration:**
```typescript
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ limit: '1mb' }));
```

---

## 4. INPUT VALIDATION & SANITIZATION

### Current State
- ✅ Input validation implemented on decision endpoints (Phase G)
- ✅ Error handling improved (removed console.error)
- ⏳ Validation not comprehensive across all endpoints

### Implementation Checklist

#### 4.1 Comprehensive Input Validation
- [ ] Create validation schema for all inputs
  - User IDs: UUID format only
  - Emails: Valid email format
  - Text: Max length, no HTML/script
  - Numbers: Range checks
  - Dates: ISO 8601 format

**Pattern (Zod or similar):**
```typescript
import { z } from 'zod';

const DecisionSchema = z.object({
  userId: z.string().uuid(),
  twinId: z.string().uuid(),
  decision: z.string().min(1).max(5000).trim(),
  worldId: z.enum(['work', 'personal', 'relationships']),
  timestamp: z.string().datetime(),
});

// Validate: DecisionSchema.parse(data); // throws on invalid
```

**Files to update:**
- `src/services/DecisionService.ts`
- `src/services/TwinSupabaseService.ts`
- All decision endpoints
- All user input routes

#### 4.2 SQL Injection Prevention
- [ ] Use only parameterized queries (Supabase does this ✅)
- [ ] Never concatenate user input into SQL
- [ ] Test: Attempt SQL injection in form fields
  - Input: `'; DROP TABLE twins; --`
  - Expected: Treated as literal string, not executed

#### 4.3 XSS Prevention
- [ ] Sanitize all user-generated content before display
  - Use React's built-in escaping (good ✅)
  - For HTML content: use DOMPurify library
  - Test: Inject `<script>alert('xss')</script>` in chat
  - Expected: Rendered as text, not executed

```typescript
import DOMPurify from 'dompurify';

const cleanHTML = DOMPurify.sanitize(userInput);
```

**Files:**
- `src/components/intelligence/MemoryRecorder.tsx`
- `src/components/TwinChat.tsx`
- Any display of user-submitted content

#### 4.4 JSONP Injection Prevention
- [ ] Disable JSONP parsing (not typically needed)
- [ ] Return `Content-Type: application/json` (not text/javascript)

---

## 5. SECRETS MANAGEMENT

### Current State
- ✅ No hardcoded secrets found in codebase (verified Phase G)
- ✅ Environment variables used (.env files)
- ⏳ Verification: Are secrets properly isolated?

### Implementation Checklist

#### 5.1 Environment Variable Audit
- [ ] Review all `.env` variables
  - SUPABASE_URL, SUPABASE_KEY (public/private split)
  - ANTHROPIC_API_KEY (never in frontend!)
  - STRIPE_SECRET_KEY (only backend)
  - JWT_SECRET (backend only)

**Pattern:**
```typescript
// GOOD: Backend only
const anthropicKey = process.env.ANTHROPIC_API_KEY;

// BAD: Exposed to frontend
const stripeSecret = process.env.STRIPE_SECRET_KEY; // ❌ Never!
```

#### 5.2 Frontend vs Backend Separation
- [ ] Frontend can only access `VITE_PUBLIC_*` variables
- [ ] Verify: No secret keys exposed in React code
  - Scan codebase: `grep -r 'STRIPE_SECRET\|API_KEY\|JWT_SECRET' src/`
  - Should find: 0 matches

**Whitelist for frontend:**
- `VITE_PUBLIC_SUPABASE_URL`
- `VITE_PUBLIC_SUPABASE_ANON_KEY` (safe, anon only)
- `VITE_PUBLIC_ANTHROPIC_KEY` (safe, if org-scoped)

#### 5.3 Secrets Scanning in CI/CD
- [ ] Add pre-commit hook: `npm audit --secrets` (or npm-audit-ci-wrapper)
- [ ] Add CI check: Reject commits with hardcoded secrets
- [ ] Rotate secrets if any leaked

**Pre-commit hook:**
```bash
#!/bin/bash
# .git/hooks/pre-commit
git diff --cached | grep -E '(SECRET|API_KEY|password|token)' && {
  echo "❌ Secrets detected in staged files!"
  exit 1
}
```

---

## 6. DATA PRIVACY & ENCRYPTION

### Current State
- ✅ Privacy boundary service exists (`privacy-boundary.ts`)
- ✅ GDPR compliance framework (export, deletion)
- ⏳ Verification: Not tested end-to-end

### Implementation Checklist

#### 6.1 Data in Transit (HTTPS/TLS)
- [ ] Verify all connections use HTTPS
  - Test: curl without -k flag should succeed
  - Self-signed certs should fail
  - Vercel deployment: HTTPS auto-enforced ✅

#### 6.2 Data at Rest Encryption
- [ ] Supabase: Enable encryption at rest (default ✅)
- [ ] Sensitive fields: Encrypt before storing
  - Fingerprint data: Encrypt with user-specific key
  - Full names: Consider hashing

**Pattern:**
```typescript
import crypto from 'crypto';

function encryptSensitive(data: string, userSecret: string): string {
  const cipher = crypto.createCipher('aes-256-cbc', userSecret);
  return cipher.update(data) + cipher.final('hex');
}

// Store encrypted value in DB
await supabase.from('profiles').update({
  fingerprint_encrypted: encryptSensitive(fingerprint, userId)
});
```

#### 6.3 Data Minimization
- [ ] Collect only necessary data
  - Audit all tables for unnecessary columns
  - Delete unused PII fields
  - Document retention policy per field

**Audit checklist:**
```
table: profiles
  - user_id ✓ Necessary (auth)
  - email ✓ Necessary (login, notifications)
  - phone_number ⚠ Not used — DELETE
  - birthdate ⚠ Not used — DELETE
  - self_print_answers ✓ Necessary (Twin context)
```

#### 6.4 GDPR Compliance
- [ ] Implement data export endpoint: GET `/api/privacy/export`
  - Returns user's full data as JSON
  - User can download for portability

- [ ] Implement data deletion endpoint: POST `/api/privacy/delete`
  - Permanently delete all user data
  - Cascade delete: twins, messages, decisions, etc.
  - Return confirmation

**Files:**
- New: `src/api/privacy-export.ts`
- New: `src/api/privacy-delete.ts`
- Test: `src/__tests__/privacy-compliance.test.ts`

---

## 7. STRIPE PAYMENT SECURITY

### Current State
- ✅ Stripe service exists (`stripeService.ts`)
- ✅ Webhook handling (Phase G)
- ⏳ Verification: Webhook validation not verified

### Implementation Checklist

#### 7.1 Webhook Signature Validation
- [ ] Verify Stripe webhook signature on every webhook
  - Stripe signs with HMAC-SHA256
  - Reject unsigned webhooks
  - Never trust `request.body` without signature

**Pattern:**
```typescript
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

app.post('/api/stripe/webhook', express.raw({type: 'application/json'}), (req, res) => {
  const sig = req.headers['stripe-signature'];
  
  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
    
    // Handle event: event.type
    // Only THEN update database
    
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
});
```

**Webhook events to validate:**
- `checkout.session.completed` — Create subscription
- `customer.subscription.updated` — Sync tier changes
- `customer.subscription.deleted` — Downgrade user
- `charge.failed` — Notify user of payment failure

#### 7.2 PCI Compliance
- [ ] Never store raw card data ✅ (Stripe handles)
- [ ] Use Stripe Elements for payment form (not custom form)
- [ ] Verify: No card numbers in logs
  - Grep codebase: `grep -r '\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b' src/`
  - Should find: 0 matches

#### 7.3 Subscription State Sync
- [ ] Database subscription_tier must match Stripe state
- [ ] Webhook updates Supabase on Stripe changes
- [ ] Cron job: Sync every hour (fallback)

**Sync logic:**
```typescript
async function syncSubscriptionState(userId: string) {
  const customer = await stripe.customers.retrieve(userId);
  const subscription = customer.subscriptions.data[0];
  
  // Update Supabase
  await supabase.from('subscriptions').update({
    stripe_subscription_id: subscription.id,
    tier: subscription.metadata.tier,
    status: subscription.status,
    current_period_end: subscription.current_period_end,
  }).eq('user_id', userId);
}
```

---

## VERIFICATION WORKFLOW

### Step 1: Code Review (2 hours)
- [ ] Review each file listed above
- [ ] Document current implementation
- [ ] Identify gaps vs. this checklist

### Step 2: Implementation (4-6 hours)
- [ ] Implement missing security controls
- [ ] Write unit tests for each control
- [ ] Update error handling

### Step 3: Testing (2-3 hours)
- [ ] Manual penetration testing
  - Attempt SQL injection, XSS, CSRF
  - Test auth bypass scenarios
  - Verify rate limiting works
  
- [ ] Automated testing
  - Run security scan: `npm audit`
  - Check for known vulnerabilities: `npm audit --fix`
  - Verify no secrets: `git secrets scan`

### Step 4: Documentation (1 hour)
- [ ] Security architecture document
- [ ] Incident response runbook
- [ ] Security testing procedures

---

## 🎯 SUCCESS CRITERIA

**ALL of these must be TRUE:**

1. ✅ Auth middleware on all `/api/*` routes
2. ✅ Session timeout implemented (30 min idle)
3. ✅ CSRF tokens on state-changing operations
4. ✅ RLS verified on all user tables
5. ✅ Rate limiting active on expensive endpoints
6. ✅ Input validation on all user inputs
7. ✅ No hardcoded secrets in codebase
8. ✅ Data encryption for sensitive fields
9. ✅ Stripe webhook signature validation
10. ✅ Data export & deletion endpoints working
11. ✅ Security tests passing (npm run test)
12. ✅ npm audit: 0 critical vulnerabilities

**Status:** ⏳ Not yet complete

---

## NEXT SESSION HANDOFF

When P0-B is VERIFIED:
- Create `HANDOFF_2026-08-18_P0-B_SECURITY_VERIFIED.md`
- Update task status to COMPLETED
- Move to P0-C: Observability

**Estimated Timeline:** 6-8 hours of focused work
