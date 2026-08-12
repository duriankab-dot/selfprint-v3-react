# 🔐 AUDIT: §34 Passkey Authentication (WebAuthn)
**วันที่:** 2026-08-11  
**สถานะ:** Frontend ✅ COMPLETE | Backend ⏳ INCOMPLETE (4/4 functions skeleton only)

---

## 📊 Current Inventory (KEEP / MODIFY / EXTEND / NEW)

### ✅ KEEP — Frontend WebAuthn Utilities (Complete)
**File:** `src/lib/auth/webauthn.ts` (160+ lines)

**Implemented:**
- ✅ `arrayBufferToBase64Url()` — encoding helper
- ✅ `base64UrlToArrayBuffer()` — decoding helper  
- ✅ `isWebAuthnAvailable()` — browser capability check
- ✅ `isPasskeyAvailable()` — platform authenticator detection
- ✅ `createPasskeyCredential()` — credential generation
- ✅ Interfaces: `RegistrationOptions`, `VerifiedCredential`, etc.

**Quality:** TypeScript strict, well-documented  
**Action:** No changes needed

---

### ⏳ MODIFY — Supabase Edge Functions (Skeleton → Complete)

#### 1️⃣ `auth-registration-options`
**File:** `supabase/functions/auth-registration-options/index.ts`  
**Status:** 90% complete (missing challenge storage)

**Implemented:**
- ✅ POST endpoint + CORS handling
- ✅ Challenge generation (crypto.getRandomValues)
- ✅ RP (relying party) ID extraction from origin
- ✅ User object creation from email
- ✅ Base64URL encoding

**TODO:**
```typescript
// Line 85: Challenge storage for verification
// TODO: Store challenge in cache/DB for verification
// challenge_store[email] = { challenge, expires_at: Date.now() + 300000 }
```

**Action Required:** Add Redis/Supabase cache for challenge (5 min TTL)

---

#### 2️⃣ `auth-authentication-options`
**File:** `supabase/functions/auth-authentication-options/index.ts`  
**Status:** 70% complete (missing DB query, challenge storage)

**Implemented:**
- ✅ POST endpoint + CORS
- ✅ Challenge generation
- ✅ RP ID extraction
- ✅ Optional allow-credentials filtering

**TODO:**
```typescript
// Line 72-84: Query user credentials from DB
if (email) {
  // TODO: Query user_credentials table for email
  // const { data: credentials } = await supabase
  //   .from('user_credentials')
  //   .select('credential_id')
  //   .eq('user_id', email);
}

// Line 96: Challenge storage
// TODO: Store challenge in cache/DB for verification
```

**Action Required:**
- Query `user_credentials` table for email
- Store challenge + TTL

---

#### 3️⃣ `auth-register-passkey`
**File:** `supabase/functions/auth-register-passkey/index.ts`  
**Status:** 40% complete (skeleton only)

**Implemented:**
- ✅ Type definitions (AttestationResponse, CredentialData)
- ✅ Base64URL decoder
- ✅ Attestation verification stub

**NOT Implemented:**
- ❌ Challenge verification (verify against stored challenge)
- ❌ Attestation object parsing (CBOR decoding)
- ❌ Certificate chain verification
- ❌ Public key extraction
- ❌ Database insertion (user_credentials table)
- ❌ Session creation

**Line 40-49:** Attestation verification is stub:
```typescript
// TODO: Implement full attestation verification
// For now, just check if it's valid base64
```

**Action Required:** Full implementation (see plan below)

---

#### 4️⃣ `auth-verify-passkey`
**File:** `supabase/functions/auth-verify-passkey/index.ts`  
**Status:** 50% complete (parsing only)

**Implemented:**
- ✅ Type definitions (AssertionResponse, AssertionData)
- ✅ Base64URL decoder
- ✅ Authenticator data parser (Line 41-50)

**NOT Implemented:**
- ❌ Challenge verification
- ❌ Credential lookup from DB
- ❌ Public key retrieval
- ❌ Signature verification (verify assertion signature against public key)
- ❌ Counter increment check (replay protection)
- ❌ Session creation

**Action Required:** Full implementation (see plan below)

---

## 🚀 Implementation Priority (Per Master Direction)

### Database Schema (Prerequisite)
Before implementing functions, must exist in Supabase:

```sql
-- user_credentials table
CREATE TABLE user_credentials (
  id UUID PRIMARY KEY,
  user_id TEXT NOT NULL,
  credential_id TEXT NOT NULL UNIQUE,
  public_key BYTEA NOT NULL,
  sign_count INT DEFAULT 0,
  transports TEXT[],
  created_at TIMESTAMP DEFAULT NOW(),
  last_used_at TIMESTAMP
);

-- passkey_challenges table (for verification)
CREATE TABLE passkey_challenges (
  id UUID PRIMARY KEY,
  user_id TEXT NOT NULL,
  challenge TEXT NOT NULL UNIQUE,
  type TEXT, -- 'registration' or 'authentication'
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 4 Functions — Execution Order

| # | Function | Depends On | Estimate |
|---|----------|-----------|----------|
| 1 | `auth-registration-options` | DB schema | 1-2 hrs (add cache) |
| 2 | `auth-authentication-options` | DB schema | 1-2 hrs (add query) |
| 3 | `auth-register-passkey` | (1) (2), CBOR lib | 3-4 hrs (attestation verify) |
| 4 | `auth-verify-passkey` | (1) (2), crypto | 3-4 hrs (signature verify) |

**Total Backend:** 8-12 hours

---

## 🔒 Security Checklist (Not Yet Implemented)

- [ ] Challenge generation (32 bytes random) ✅ Done
- [ ] Challenge storage + TTL (5 min) ⏳ Missing
- [ ] Challenge verification (constant-time compare) ⏳ Missing
- [ ] Attestation validation (certificate chain) ⏳ Missing
- [ ] Public key extraction (CBOR + ASN.1 parsing) ⏳ Missing
- [ ] Signature verification (ECDSA / RSA) ⏳ Missing
- [ ] Counter check (sign_count increment) ⏳ Missing
- [ ] CORS origin validation ✅ Done
- [ ] Rate limiting (prevent brute force) ⏳ Not yet
- [ ] Logging/audit trail ⏳ Not yet

---

## 📋 Discrepancy from Handoff

**Handoff states:** "§34 Passkey (Backend) — ⏳ 8 Supabase Functions Pending"  
**Audit found:** 4 Supabase Functions (registration + authentication + verify x2)

**Possible explanations:**
- "8" could refer to 4 functions × 2 (registration + authentication flows)?
- Or there are 4 additional functions (email verification, credential management, etc.)
- Or "8" is estimate of subtasks per function

**Action:** Clarify with jb_DEV. For now, assume 4 core functions.

---

## 📝 Next Steps

1. **Create DB schema** (user_credentials + passkey_challenges)
2. **Implement function 1 & 2** (options generators with challenge caching)
3. **Implement function 3** (registration with attestation verification)
4. **Implement function 4** (authentication with signature verification)
5. **Add e2e tests** (Passkey flow: register → authenticate)
6. **Windows E2E Testing** (full pricing + passkey flow)

---

**Audit completed:** 2026-08-11  
**Token used this phase:** ~40k  
**Remaining budget:** ~95k  
**Ready for implementation:** Yes (schema first, then functions)
