# § 34: Passkey (WebAuthn) Implementation Guide

**Status:** ✅ Core Implementation Complete | ⏳ Backend Edge Functions (Stub)  
**Date Started:** 2026-08-10  
**Priority:** P2  

---

## Overview

Passkey (WebAuthn) implementation per Master Direction § 34:
- **P0 Goal:** Primary login method for Selfprint
- **Fallback Chain:** Passkey → Google → Apple → Magic Link
- **Device Support:** Desktop (Windows Hello, Face ID), Mobile (Biometric)
- **Security:** Private key never leaves device; only public key stored on server

---

## ✅ What's Implemented

### 1. Client-Side Libraries

#### `src/lib/auth/webauthn.ts`
Core WebAuthn utilities — all public API present and production-ready:
- `isWebAuthnAvailable()` - Check if browser supports WebAuthn
- `isPasskeyAvailable()` - Check if device has platform authenticator
- `isBiometricAvailable()` - Check for Face ID / Touch ID / Windows Hello
- `createPasskeyCredential()` - Create new Passkey (registration)
- `authenticateWithPasskey()` - Authenticate using existing Passkey
- Array buffer ↔ Base64 URL conversion helpers

#### `src/lib/auth/PasskeyProvider.ts`
Service layer for Passkey flows:
- `getRegistrationOptions()` - Fetch server challenge for registration
- `registerPasskey()` - Register new Passkey credential
- `getAuthenticationOptions()` - Fetch server challenge for auth
- `authenticatePasskey()` - Authenticate and get session
- `listCredentials()` - List user's registered Passkeys
- `renameCredential()` - Rename a Passkey
- `deleteCredential()` - Delete specific Passkey
- `deleteAllCredentials()` - Delete all Passkeys (account cleanup)

#### `src/hooks/usePasskey.ts`
React hook for component-level Passkey management:
- `checkAvailability()` - Detect device support
- `startRegistration()` - Initiate registration flow
- `authenticate()` - Initiate authentication flow
- State management: `isAvailable`, `isBiometric`, `isRegistering`, `isAuthenticating`, errors

#### `src/context/AuthContext.tsx` (Updated)
Added to existing auth flow:
- `isPasskeyAvailable` - Boolean flag
- `hasBiometric` - Boolean flag  
- `registerPasskey(email, displayName?)` - Register new Passkey
- `signInWithPasskey(email?)` - Sign in with Passkey
- Supports discoverable credentials (email optional)
- Falls back gracefully if Passkey unavailable

#### `src/components/auth/PasskeyLogin.tsx`
UI component for Passkey login:
- Shows Passkey button if device supports it
- Displays biometric prompt explanation
- Email input (optional for discoverable credentials)
- Loading state + error handling
- Styled with CSS vars, reduced-motion safe

---

### 2. Backend Edge Functions (Stubs)

Four Supabase Edge Functions (Deno, TypeScript):

#### `supabase/functions/auth-registration-options/index.ts`
**POST** `/functions/v1/auth-registration-options`
- Input: `{ email: string }`
- Output: `RegistrationOptions` (challenge + RP config)
- TODO: Store challenge in Redis/cache for verification

#### `supabase/functions/auth-register-passkey/index.ts`
**POST** `/functions/v1/auth-register-passkey`
- Input: `{ email, credential, displayName }`
- Output: `VerifiedCredential`
- TODO: Full attestation verification
- TODO: Store in `user_credentials` table
- TODO: Link to auth.users

#### `supabase/functions/auth-authentication-options/index.ts`
**POST** `/functions/v1/auth-authentication-options`
- Input: `{ email?: string }` (optional for discoverable credentials)
- Output: `AuthenticationOptions` (challenge + RP config)
- TODO: Query existing credentials for the user
- TODO: Store challenge in cache for verification

#### `supabase/functions/auth-verify-passkey/index.ts`
**POST** `/functions/v1/auth-verify-passkey`
- Input: `{ email?, assertion }`
- Output: `{ user, session }`
- TODO: Cryptographic signature verification
- TODO: Counter checking (prevent cloning)
- TODO: Create/return JWT session
- TODO: Set secure refresh token cookie

---

### 3. Database Migration

#### `supabase/migrations/20260810_create_user_credentials.sql`
Table: `user_credentials`
- `id` (UUID primary key)
- `user_id` (TEXT, links to auth.users)
- `credential_id` (TEXT, unique — WebAuthn credential ID)
- `public_key` (TEXT, base64 encoded)
- `counter` (INT, for cloning detection)
- `name` (TEXT, display name for Passkey)
- `transports` (TEXT[], e.g., 'internal', 'nfc', 'usb')
- `created_at`, `last_used_at`, `updated_at`
- Indexes on `user_id`, `credential_id`
- RLS enabled (users see only own credentials)
- Trigger for `updated_at` auto-update

---

### 4. Type Definitions

#### `src/lib/auth/webauthn.d.ts`
Global WebAuthn API type augmentation for TypeScript

---

## ⏳ What Still Needs To Be Done

### High Priority (Blocking Authentication)

1. **Cryptographic Signature Verification** (auth-verify-passkey)
   - [ ] Parse attestation object from registration
   - [ ] Extract public key in proper format (JWK or PEM)
   - [ ] Implement ECDSA (P-256) signature verification
   - [ ] Implement RSA (RS256) signature verification
   - [ ] Validate clientData hash

2. **Challenge Storage & Validation**
   - [ ] Store registration challenges in Redis/Upstash
   - [ ] Store authentication challenges in Redis/Upstash
   - [ ] Validate challenge matches on verification
   - [ ] Implement 5-minute expiration

3. **User & Session Management**
   - [ ] Map `email` → `auth.users.id` (or create user if not exists)
   - [ ] Issue JWT tokens via Supabase Auth API
   - [ ] Return secure refresh token (httpOnly cookie)
   - [ ] Update `last_used_at` on successful auth

4. **Full Attestation Verification**
   - [ ] Verify attestation format (none, direct, indirect, enterprise)
   - [ ] Validate attestation chain if applicable
   - [ ] Check AAGUID if needed

### Medium Priority (User Experience)

5. **Passkey Management UI**
   - [ ] List registered Passkeys (`/settings/passkeys`)
   - [ ] Rename Passkey
   - [ ] Delete individual Passkey
   - [ ] Show creation date, last used, device info

6. **Registration Flow UI**
   - [ ] Onboarding: "Register your Passkey" step
   - [ ] Account settings: "Add Another Passkey"
   - [ ] Success/error messages

7. **Account Recovery**
   - [ ] If user loses all Passkeys → fall back to Magic Link
   - [ ] Set up recovery codes (optional)
   - [ ] Re-register Passkey after recovery

### Lower Priority

8. **Error Handling & Logging**
   - [ ] Proper error messages per failure type
   - [ ] Audit logging for security events
   - [ ] Rate limiting on verification attempts

9. **Testing**
   - [ ] Unit tests for WebAuthn utilities
   - [ ] E2E tests for registration flow
   - [ ] E2E tests for authentication flow
   - [ ] Test on multiple devices/browsers

10. **Documentation**
    - [ ] User guide for setting up Passkey
    - [ ] Troubleshooting common issues
    - [ ] Security best practices doc

---

## Integration with Existing Code

### Login Flow Hierarchy (Master Direction § 34)

```
1. Check Passkey availability
   ├─ YES → Show Passkey button first
   │        (+ biometric if available)
   │
   └─ NO → Skip to next option
           
2. Google OAuth
   ├─ Connected → Show button
   └─ Not connected → Skip

3. Apple OAuth
   ├─ Connected → Show button
   └─ Not connected → Skip

4. Magic Link (Always available)
   └─ Show email input + link button
```

### How to Use in Components

```tsx
import { useAuth } from '@/context/AuthContext';

function LoginPage() {
  const { isPasskeyAvailable, hasBiometric, signInWithPasskey } = useAuth();

  return (
    <>
      {isPasskeyAvailable && (
        <button onClick={() => signInWithPasskey()}>
          🔑 {hasBiometric ? 'Login with Biometric' : 'Login with Passkey'}
        </button>
      )}
      {/* Other login methods... */}
    </>
  );
}
```

---

## Configuration Checklist

### Environment Variables Needed

```bash
# .env (already set up for Supabase)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Supabase Setup Required

1. [ ] Create `user_credentials` table (run migration)
2. [ ] Deploy Edge Functions:
   ```bash
   supabase functions deploy auth-registration-options
   supabase functions deploy auth-register-passkey
   supabase functions deploy auth-authentication-options
   supabase functions deploy auth-verify-passkey
   ```
3. [ ] Set up Redis/Upstash for challenge storage
4. [ ] Configure Supabase Auth (JWT secret, redirect URLs)

---

## Browser & Device Compatibility

| Device | Platform | Biometric | Status |
|--------|----------|-----------|--------|
| iPhone | Safari | Face ID | ✅ (iOS 14+) |
| Android | Chrome | Fingerprint | ✅ (Android 9+) |
| Windows | Chrome/Edge | Windows Hello | ✅ |
| macOS | Safari | Touch ID | ✅ (Big Sur+) |
| Older Devices | Any | None | ⚠️ (Fallback to Magic Link) |

---

## Security Notes

- ✅ Private key never leaves device
- ✅ Passkey can be used with Biometric lock
- ✅ No passwords transmitted over network
- ✅ Resistant to phishing (origin binding)
- ✅ Resistant to man-in-the-middle
- ⚠️ Counter validation prevents cloning (TODO)
- ⚠️ Challenge must be cryptographically random (partially done)
- ⚠️ Signature verification critical (TODO — currently stubbed)

---

## Next Steps (Priority Order)

1. **Implement crypto verification** in `auth-verify-passkey` edge function
2. **Set up challenge storage** (Redis/Upstash)
3. **Connect to Supabase Auth** for JWT issuance
4. **Test end-to-end** registration + login
5. **Build UI** for Passkey management
6. **Implement account recovery** flow
7. **Add to onboarding** flow
8. **Testing & hardening** against known attacks

---

## Files Modified/Created

```
src/
  lib/auth/
    ├─ webauthn.ts ✅ (NEW)
    ├─ webauthn.d.ts ✅ (NEW)
    ├─ PasskeyProvider.ts ✅ (NEW)
  hooks/
    ├─ usePasskey.ts ✅ (NEW)
  context/
    ├─ AuthContext.tsx ⚠️ (UPDATED — added Passkey methods)
  components/auth/
    ├─ PasskeyLogin.tsx ✅ (NEW)
    ├─ PasskeyLogin.module.css ✅ (NEW)
    ├─ index.ts ✅ (NEW)
supabase/
  functions/
    ├─ deno.jsonc ✅ (NEW)
    ├─ auth-registration-options/index.ts ✅ (NEW)
    ├─ auth-register-passkey/index.ts ✅ (NEW)
    ├─ auth-authentication-options/index.ts ✅ (NEW)
    ├─ auth-verify-passkey/index.ts ✅ (NEW)
  migrations/
    ├─ 20260810_create_user_credentials.sql ✅ (NEW)
```

---

## Related Master Direction Sections

- **§ 34:** Login Architecture — Passkey as P0
- **§ 38:** PDPA / Privacy-by-Design — Consider credential data sensitivity
- **§ 40:** Security — Encryption, access control
- **§ 41:** Architecture — Flows through Auth layer
