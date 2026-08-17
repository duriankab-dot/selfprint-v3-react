# 🔐 Passkey (WebAuthn) Architecture Design
## § 34 — P2-HIGH Authentication

**Date:** 2026-08-10  
**Status:** Design Phase (Architecture Only - No Code Yet)  
**Priority:** P2 - HIGH (Authentication Enhancement)  

---

## 1️⃣ VISION

Passkey (WebAuthn) เป็นวิธี login ที่ปลอดภัยที่สุด ใช้ประตูชีววิทยา (Face ID, Touch ID, Windows Hello) แทนรหัสผ่าน

**Target Users:**
- ✅ Desktop: Windows Hello, macOS Face ID
- ✅ Mobile: iOS Face ID, Android Biometric
- ✅ Cross-device: Sync keychain (iCloud, Windows Sync)

---

## 2️⃣ Current Status (ตอนนี้มีแล้ว)

### ✅ Complete (Client-Side)
```
src/lib/auth/webauthn.ts
├─ isWebAuthnAvailable()
├─ isPasskeyAvailable() 
├─ isBiometricAvailable()
├─ createPasskeyCredential() [Registration]
├─ authenticateWithPasskey() [Authentication]
└─ Array buffer ↔ Base64 conversion

src/lib/auth/PasskeyProvider.ts
├─ getRegistrationOptions()
├─ registerPasskey()
├─ getAuthenticationOptions()
├─ authenticatePasskey()
├─ listCredentials()
├─ renameCredential()
├─ deleteCredential()
└─ deleteAllCredentials()

src/hooks/usePasskey.ts [React Hook]
src/components/auth/PasskeyLogin.tsx [UI Component]
src/context/AuthContext.tsx [Updated with Passkey methods]

Database: user_credentials table ✅
```

### ⏳ Needs Implementation (Backend)
```
Supabase Edge Functions (Deno):
1. auth-registration-options → TODO: Challenge storage
2. auth-register-passkey → TODO: Attestation verification
3. auth-authentication-options → TODO: Credential lookup
4. auth-verify-passkey → TODO: Signature verification + JWT
```

---

## 3️⃣ FLOW DIAGRAM

### Registration Flow
```
┌─────────────────────────────────────────┐
│ 1. User clicks "Register with Passkey"  │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│ 2. Check Device Support                 │
│    - WebAuthn available?                │
│    - Biometric available?               │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│ 3. Get Registration Challenge            │
│    POST /functions/v1/auth-registration-options
│    Input: { email }                     │
│    Output: RegistrationOptions          │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│ 4. Create Credential (Device)            │
│    - User authenticates with Face ID/   │
│      Touch ID/Windows Hello             │
│    - Device generates keypair           │
│    - Returns credential                 │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│ 5. Verify & Store                       │
│    POST /functions/v1/auth-register-passkey
│    Input: { email, credential }         │
│    - Verify attestation                 │
│    - Extract public key                 │
│    - Store in user_credentials          │
│    Output: VerifiedCredential           │
└──────────────┬──────────────────────────┘
               │
               ▼
        ✅ Passkey Registered
```

### Authentication Flow
```
┌─────────────────────────────────────────┐
│ 1. User clicks "Sign in with Passkey"   │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│ 2. Get Authentication Challenge          │
│    POST /functions/v1/auth-authentication-options
│    Input: { email? }                    │
│    Output: AuthenticationOptions        │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│ 3. Authenticate (Device)                 │
│    - Device prompts for biometric       │
│    - User confirms                      │
│    - Device signs challenge             │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│ 4. Verify Signature                     │
│    POST /functions/v1/auth-verify-passkey
│    - Verify signature                   │
│    - Check counter (prevent cloning)    │
│    - Create JWT session                 │
│    Output: { user, session }            │
└──────────────┬──────────────────────────┘
               │
               ▼
        ✅ User Logged In
```

---

## 4️⃣ DATABASE SCHEMA

### Table: `user_credentials` (Existing)
```sql
CREATE TABLE user_credentials (
  id UUID PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES auth.users(id),
  credential_id TEXT UNIQUE NOT NULL,  -- WebAuthn credential ID
  public_key TEXT NOT NULL,            -- Base64 encoded
  counter INT NOT NULL DEFAULT 0,      -- For cloning detection
  name TEXT,                           -- Display name
  transports TEXT[],                   -- ['internal', 'nfc', 'usb']
  created_at TIMESTAMP DEFAULT now(),
  last_used_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT now(),
  
  CONSTRAINT fk_user_id FOREIGN KEY (user_id) 
    REFERENCES auth.users(id) ON DELETE CASCADE
);

CREATE INDEX idx_user_credentials_user_id ON user_credentials(user_id);
CREATE INDEX idx_user_credentials_credential_id ON user_credentials(credential_id);

ALTER TABLE user_credentials ENABLE ROW LEVEL SECURITY;
```

### Add Table: `passkey_challenges` (New - for challenge storage)
```sql
CREATE TABLE passkey_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT,  -- NULL for registration flow
  challenge BYTEA NOT NULL,
  challenge_type ENUM ('registration', 'authentication'),
  created_at TIMESTAMP DEFAULT now(),
  expires_at TIMESTAMP DEFAULT now() + INTERVAL '5 minutes',
  used BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_passkey_challenges_expires ON passkey_challenges(expires_at);
```

---

## 5️⃣ IMPLEMENTATION ROADMAP

### Phase 1: Backend Challenge Management (Week 1)
**Effort:** 3-5 hours | **Tokens:** 5-8K

```
1.1) Implement challenge storage
     - Use Supabase cron to cleanup expired
     - Or use Upstash Redis

1.2) Update Edge Functions
     - auth-registration-options: store challenge
     - auth-authentication-options: store challenge
     - Add challenge validation in verify functions

1.3) Test with Postman/curl
```

### Phase 2: Signature Verification (Week 1-2)
**Effort:** 5-8 hours | **Tokens:** 8-12K

```
2.1) Implement cryptographic verification
     - Parse attestation object
     - Extract public key (ECDSA P-256, RSA)
     - Verify clientData hash
     - Verify signature

2.2) Use libraries:
     - @simplewebauthn/server (recommended)
     - Or @noble/curves + crypto

2.3) Test with real device
```

### Phase 3: Session Management (Week 1-2)
**Effort:** 3-5 hours | **Tokens:** 5-8K

```
3.1) Create JWT tokens
     - Map email → auth.users.id
     - Generate Supabase JWT
     - Set refresh token (httpOnly cookie)

3.2) Update AuthContext
     - Integrate with existing session flow
     - Handle fallback to Google/Apple/Magic Link

3.3) End-to-end test
```

### Phase 4: Testing & Docs (Week 2)
**Effort:** 4-6 hours | **Tokens:** 6-10K

```
4.1) Unit tests
     - Challenge generation/validation
     - Signature verification
     - Session creation

4.2) Integration tests
     - Full registration flow
     - Full authentication flow
     - Device synchronization (if applicable)

4.3) Documentation
     - User guide (Thai)
     - Developer guide
     - Recovery flow docs
```

---

## 6️⃣ RECOVERY & DEVICE MANAGEMENT

### Backup Codes (Important!)
```
On Registration Success:
- Generate 10 single-use recovery codes
- Show to user with "Save in safe place"
- Store hashed in user_recovery_codes table

On Login (Passkey unavailable):
- Show "Can't use Passkey?" link
- Allow recovery code entry
- Authenticate + force re-register
```

### Device Management UI
```
PasskeySettings Component:
├─ List registered devices
├─ Show last used date
├─ Rename device ("My iPhone", "Work MacBook")
├─ Delete device
├─ Delete all devices (nuclear option)
└─ View recovery codes
```

---

## 7️⃣ SECURITY CONSIDERATIONS

### ✅ Built-in Security
- Private key never leaves device ✅
- Server only stores public key
- Attestation verification (optional)
- Counter checking (prevent cloning)
- Challenge binding (CSRF protection)

### ⚠️ Must Implement
- Challenge expiration (5 min)
- HTTPS only (browsers enforce)
- Secure refresh token (httpOnly cookie)
- Rate limiting on verification endpoint
- Audit logging (who registered/authenticated when)

### 📋 Compliance
- FIDO2 compliant ✅
- No biometric data sent to server ✅
- User has device control (can delete)
- Recovery codes for account recovery

---

## 8️⃣ KNOWN LIMITATIONS & NOTES

### Platform Differences
```
Desktop:
- Windows Hello: ✅ Works
- macOS Face ID: ✅ Works
- Linux: ⚠️ FIDO key only (no built-in auth)

Mobile:
- iOS: ✅ Face ID, Touch ID (iCloud sync)
- Android: ✅ Biometric (but device-specific)
- Cross-device: 🟡 Limited (QR code auth)
```

### Third-party Dependencies
```
Recommended: @simplewebauthn/server
- Handles all cryptography
- Well-maintained
- Good TypeScript support

Alternative: @noble/curves + crypto
- More manual
- Smaller bundle
- Requires expertise
```

---

## 9️⃣ DEPENDENCY CHECK

### Client-Side (Already Available)
```
✅ @simplewebauthn/browser (for client)
✅ TypeScript support
✅ CSS variables (styling)
```

### Server-Side (Need to Add)
```
⏳ @simplewebauthn/server (Deno compatible?)
   Alternative: Manual crypto + @noble/curves

⏳ Redis or Supabase Storage (challenge storage)
   - Upstash Redis (serverless)
   - Or Supabase + cron cleanup

⏳ Audit logging (optional but recommended)
```

---

## 🔟 EFFORT ESTIMATE

| Phase | Task | Hours | Tokens | Status |
|-------|------|-------|--------|--------|
| 1 | Backend Challenge Management | 4 | 6K | ⏳ TODO |
| 2 | Signature Verification | 6 | 10K | ⏳ TODO |
| 3 | Session Management | 4 | 7K | ⏳ TODO |
| 4 | Testing + Docs | 5 | 8K | ⏳ TODO |
| **Total** | | **19** | **31K** | |

**Recommendation:** 
- Can split across 2 weeks
- Or focus sprint (1 week intensive)
- Needs dev account approval (separate)

---

## 🔗 RELATED COMPONENTS (Already Present)

```
src/pages/Login.tsx
- Shows Passkey button if available
- Shows email input (optional for discoverable credentials)

src/pages/PasskeySettings.tsx
- Device management
- Recovery codes view
- Delete credentials

src/context/AuthContext.tsx
- registerPasskey() ✅
- signInWithPasskey() ✅
```

---

## 📌 NEXT STEPS (Implementation Ready)

1. **Decision Point:** 
   - ✅ Use @simplewebauthn/server (easy)
   - ⚠️ Roll custom crypto (hard)

2. **Setup:**
   - Create Upstash Redis account (challenge storage)
   - Or add passkey_challenges table

3. **Start Phase 1:**
   - Implement challenge storage
   - Update Edge Functions

---

**Status:** ✅ Architecture Designed | ⏳ Ready for Phase 1 Implementation  
**Blocked By:** Apple/Google Developer Account (for production testing)  
**Effort:** ~19 hours (31K tokens) across 4 phases
