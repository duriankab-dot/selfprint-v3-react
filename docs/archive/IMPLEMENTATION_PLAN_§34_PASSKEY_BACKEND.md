# 🎯 Implementation Plan: §34 Passkey Backend (4 Supabase Functions)

**Status:** Ready for Development  
**Scope:** 4 Edge Functions + Challenge Table  
**Estimate:** 8-12 hours  
**Priority:** P1 (blocker for P2 features)  

---

## 📋 Prerequisite: Database Setup

### Migration File Created
✅ `supabase/migrations/20260811_create_passkey_challenges.sql`
- Table: `passkey_challenges` (user_id, challenge, type, expires_at)
- Indexes for user_id, challenge, expires_at
- Cleanup function for expired records

### Action
```bash
# Deploy migration to Supabase
# Via: Supabase Dashboard → SQL Editor → copy & run migration
# OR: `supabase db push` (if using CLI)
```

---

## 🔧 Implementation Order

### Phase 1: Challenge Generation (2 functions)
**Time:** 2-3 hours  
**Dependency:** passkey_challenges table migration deployed

#### 1. `auth-registration-options` (90% → 100%)
**Current:** Challenge generation, RP ID extraction ✅  
**Missing:** Challenge storage

**Changes Required:**
```typescript
// After generating challenge (line 59-60)
// Add: Store challenge in DB with 5-minute TTL
const expiresAt = new Date(Date.now() + 300000); // 5 minutes
await supabase
  .from('passkey_challenges')
  .insert({
    user_id: email,
    challenge: uint8ArrayToBase64Url(challenge),
    challenge_type: 'registration',
    expires_at: expiresAt.toISOString()
  });
```

**Pseudo-code:**
```typescript
serve(async (req) => {
  if (req.method !== 'POST') return 405;
  
  const { email } = await req.json();
  const challenge = generateChallenge();
  const rpId = extractRpIdFromOrigin(req.url);
  
  // ✨ NEW: Store challenge
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
  const { error } = await supabase
    .from('passkey_challenges')
    .insert([{
      user_id: email,
      challenge: uint8ArrayToBase64Url(challenge),
      challenge_type: 'registration',
      expires_at: expiresAt.toISOString()
    }]);
  
  if (error) throw error;
  
  return { challenge: uint8ArrayToBase64Url(challenge), rp, user, ... };
});
```

**Testing:**
```bash
curl -X POST http://localhost:54321/functions/v1/auth-registration-options \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'

# Should return: { challenge, rp, user, pubKeyCredParams, ... }
# DB should have one row in passkey_challenges
```

---

#### 2. `auth-authentication-options` (70% → 100%)
**Current:** Challenge generation, RP ID extraction ✅  
**Missing:** Query user credentials, store challenge

**Changes Required:**
```typescript
// After Supabase init (line 60)
// Query user's registered credentials
if (email) {
  const { data: credentials } = await supabase
    .from('user_credentials')
    .select('credential_id')
    .eq('user_id', email);
  
  if (credentials && credentials.length > 0) {
    allowCredentials = credentials.map(c => ({
      id: c.credential_id,
      type: 'public-key'
    }));
  }
}

// Store challenge in DB (same as registration-options)
const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
await supabase
  .from('passkey_challenges')
  .insert({
    user_id: email || 'discoverable',
    challenge: uint8ArrayToBase64Url(challenge),
    challenge_type: 'authentication',
    expires_at: expiresAt.toISOString()
  });
```

**Pseudo-code:**
```typescript
serve(async (req) => {
  const { email } = await req.json();
  const challenge = generateChallenge();
  const rpId = extractRpIdFromOrigin(req.url);
  
  // ✨ NEW: Query credentials
  let allowCredentials: Array<{ id: string; type: string }> = [];
  if (email) {
    const { data } = await supabase
      .from('user_credentials')
      .select('credential_id')
      .eq('user_id', email);
    
    if (data?.length) {
      allowCredentials = data.map(c => ({ id: c.credential_id, type: 'public-key' }));
    }
  }
  
  // ✨ NEW: Store challenge
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
  const { error } = await supabase
    .from('passkey_challenges')
    .insert([{
      user_id: email || 'discoverable',
      challenge: uint8ArrayToBase64Url(challenge),
      challenge_type: 'authentication',
      expires_at: expiresAt.toISOString()
    }]);
  
  if (error) throw error;
  
  return { challenge, timeout, userVerification, rpId, ...(allowCredentials.length && { allowCredentials }) };
});
```

**Testing:**
```bash
curl -X POST http://localhost:54321/functions/v1/auth-authentication-options \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'

# Should return: { challenge, timeout, userVerification, rpId, allowCredentials: [] (if no creds yet) }
```

---

### Phase 2: Credential Verification (2 functions)
**Time:** 6-9 hours (crypto-heavy)  
**Dependency:** Phase 1 complete

#### 3. `auth-register-passkey` (40% → 100%)
**Current:** Type definitions, Base64 decoder only  
**Missing:** Everything else

**Requirements:**
1. Verify challenge (lookup in passkey_challenges, check not expired)
2. Verify attestation object (CBOR decode, certificate chain validation)
3. Extract public key from attestation
4. Store credential in user_credentials
5. Return success + credential ID

**Implementation Steps:**

**Step A: Decode and Verify Challenge**
```typescript
// 1. Verify the challenge sent by client matches what we stored
const clientDataJSON = base64UrlToUint8Array(credential.response.clientDataJSON);
const clientDataText = new TextDecoder().decode(clientDataJSON);
const clientData = JSON.parse(clientDataText);

// 2. Lookup challenge in DB
const { data: challengeRow } = await supabase
  .from('passkey_challenges')
  .select('*')
  .eq('challenge', clientData.challenge)
  .eq('challenge_type', 'registration')
  .gt('expires_at', new Date().toISOString())
  .single();

if (!challengeRow) {
  throw new Error('Challenge not found or expired');
}

// 3. Verify origin
if (clientData.origin !== req.origin) {
  throw new Error('Origin mismatch');
}

// 4. Verify type
if (clientData.type !== 'webauthn.create') {
  throw new Error('Invalid client data type');
}
```

**Step B: Decode Attestation Object (CBOR)**
```typescript
// Requires: cbor library (deno-friendly: npm.jsr.io/@cfworker/cbor)
import * as CBOR from "https://cdn.jsdelivr.net/npm/@cfworker/cbor@1.0.0/dist/index.js";

const attestationObject = CBOR.decode(
  base64UrlToUint8Array(credential.response.attestationObject)
);

const { fmt, attStmt, authData } = attestationObject;

// Verify attestation format
if (fmt !== 'none') {
  // For 'none' attestation: skip cert chain verification
  // For 'packed', 'fido-u2f', etc.: verify certificate chain
  // For MVP: only support 'none' format
  if (fmt !== 'none') {
    throw new Error(`Attestation format '${fmt}' not yet supported`);
  }
}
```

**Step C: Extract Public Key from authData**
```typescript
// authData structure:
// - Bytes 0-32: RP ID Hash (32 bytes)
// - Bytes 33: Flags (1 byte)
// - Bytes 34-37: Sign count (4 bytes big-endian)
// - Bytes 38+: Credential data (if flags.UP and flags.UV)

const rpIdHash = authData.slice(0, 32);
const flags = authData[32];
const signCount = new DataView(authData.buffer, 33, 4).getUint32(0, false);

const userPresent = (flags & 0x01) !== 0;
const userVerified = (flags & 0x04) !== 0;
const hasAttData = (flags & 0x40) !== 0;

if (!userPresent) {
  throw new Error('User not present during registration');
}

if (!hasAttData) {
  throw new Error('Attestation data not present');
}

// Parse credential data
let offset = 37;
const credIdLength = new DataView(authData.buffer, offset, 2).getUint16(0, false);
offset += 2;

const credentialId = authData.slice(offset, offset + credIdLength);
offset += credIdLength;

// COSE public key (CBOR encoded)
const cosePublicKeyBytes = authData.slice(offset);
const cosePublicKey = CBOR.decode(cosePublicKeyBytes);

// Store public key as Base64 for later verification
const publicKeyB64 = uint8ArrayToBase64Url(new Uint8Array(cosePublicKeyBytes));
```

**Step D: Store in Database**
```typescript
const credentialB64 = uint8ArrayToBase64Url(credentialId);

const { error, data } = await supabase
  .from('user_credentials')
  .insert({
    user_id: body.email,
    credential_id: credentialB64,
    public_key: publicKeyB64,
    counter: signCount,
    transports: credential.transports || [],
    name: body.displayName || 'My Passkey',
  })
  .select()
  .single();

if (error) throw error;

// Delete challenge from DB (consumed)
await supabase
  .from('passkey_challenges')
  .delete()
  .eq('challenge', clientData.challenge);

return { success: true, credential_id: credentialB64 };
```

**Dependencies to Add (Deno):**
```typescript
import * as CBOR from "https://cdn.jsdelivr.net/npm/@cfworker/cbor@1.0.0/dist/index.js";
// or
import * as CBOR from "https://esm.sh/cbor";
```

**Testing:**
```typescript
// Use WebAuthn test in browser, capture response, send to this endpoint
const response = await navigator.credentials.create({ ... });
const body = {
  email: 'test@example.com',
  credential: {
    id: response.id,
    rawId: arrayBufferToBase64Url(response.rawId),
    type: response.type,
    response: {
      clientDataJSON: arrayBufferToBase64Url(response.response.clientDataJSON),
      attestationObject: arrayBufferToBase64Url(response.response.attestationObject)
    }
  }
};

const result = await fetch('/.../auth-register-passkey', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body)
});

console.log(await result.json()); // { success: true, credential_id: "..." }
```

---

#### 4. `auth-verify-passkey` (50% → 100%)
**Current:** Type definitions, authenticator data parser  
**Missing:** Signature verification, session creation

**Implementation Steps:**

**Step A: Verify Challenge (same as register)**
```typescript
const clientDataJSON = base64UrlToUint8Array(assertion.response.clientDataJSON);
const clientDataText = new TextDecoder().decode(clientDataJSON);
const clientData = JSON.parse(clientDataText);

// Verify challenge
const { data: challengeRow } = await supabase
  .from('passkey_challenges')
  .select('*')
  .eq('challenge', clientData.challenge)
  .eq('challenge_type', 'authentication')
  .gt('expires_at', new Date().toISOString())
  .single();

if (!challengeRow) {
  throw new Error('Challenge not found or expired');
}

// Verify origin + type
if (clientData.origin !== req.origin) {
  throw new Error('Origin mismatch');
}

if (clientData.type !== 'webauthn.get') {
  throw new Error('Invalid client data type');
}
```

**Step B: Lookup Credential**
```typescript
// Get credential by ID
const credentialIdB64 = assertion.rawId;

const { data: credential } = await supabase
  .from('user_credentials')
  .select('*')
  .eq('credential_id', credentialIdB64)
  .single();

if (!credential) {
  throw new Error('Credential not found');
}
```

**Step C: Verify Signature**
```typescript
// Requires: crypto library
import { verify } from "https://esm.sh/jose@4.14.4";
// or use Web Crypto API (native in Deno)

const authData = base64UrlToUint8Array(assertion.response.authenticatorData);
const signature = base64UrlToUint8Array(assertion.response.signature);
const clientDataHash = hashSHA256(clientDataJSON);

// Reconstruct signed data: authenticatorData + clientDataHash
const signedData = new Uint8Array([...authData, ...clientDataHash]);

// Verify signature using stored public key
const publicKeyDER = base64UrlToUint8Array(credential.public_key);
const cosePublicKey = CBOR.decode(publicKeyDER);

// COSE key format to Web Crypto format (depends on algorithm)
// For ES256: x, y coordinates of curve point
const publicKeyJwk = coseToJwk(cosePublicKey); // helper function

const publicKey = await crypto.subtle.importKey(
  'jwk',
  publicKeyJwk,
  { name: 'ECDSA', namedCurve: 'P-256', hash: 'SHA-256' },
  false,
  ['verify']
);

const isValid = await crypto.subtle.verify(
  'ECDSA',
  publicKey,
  signature,
  signedData
);

if (!isValid) {
  throw new Error('Signature verification failed');
}
```

**Step D: Update Counter (replay protection)**
```typescript
// Extract signCount from authData
const signCount = new DataView(authData.buffer, 33, 4).getUint32(0, false);

// Verify counter increased
if (signCount <= credential.counter) {
  throw new Error('Counter did not increase — possible clone attack');
}

// Update credential's counter
await supabase
  .from('user_credentials')
  .update({ counter: signCount, last_used_at: new Date().toISOString() })
  .eq('id', credential.id);
```

**Step E: Create Session / Return JWT**
```typescript
// Option A: Use Supabase Auth (if user exists in auth.users)
// const { data, error } = await supabase.auth.signInWithPassword({
//   email: credential.user_id,
//   password: 'dummy' // Passkey auth bypasses password
// });

// Option B: Create custom JWT
const jwt = await signJWT(
  {
    sub: credential.user_id,
    aud: 'authenticated',
    role: 'authenticated',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600
  },
  Deno.env.get('SUPABASE_JWT_SECRET')
);

// Delete challenge (consumed)
await supabase
  .from('passkey_challenges')
  .delete()
  .eq('challenge', clientData.challenge);

return {
  success: true,
  session: {
    access_token: jwt,
    token_type: 'bearer',
    expires_in: 3600
  }
};
```

**Helper Function: Hash SHA-256**
```typescript
async function hashSHA256(data: Uint8Array): Promise<Uint8Array> {
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return new Uint8Array(hashBuffer);
}

function coseToJwk(coseKey: any): JsonWebKey {
  // Convert COSE public key to Web Crypto JWK format
  // Depends on algorithm (ES256, RS256, etc.)
  // For ES256 (kty=2, crv=1):
  return {
    kty: 'EC',
    crv: 'P-256',
    x: uint8ArrayToBase64Url(new Uint8Array(coseKey.get(-2))), // x coordinate
    y: uint8ArrayToBase64Url(new Uint8Array(coseKey.get(-3))), // y coordinate
  };
}
```

**Testing:**
```typescript
// Use WebAuthn assertion in browser
const assertion = await navigator.credentials.get({ ... });
const body = {
  assertion: {
    id: assertion.id,
    rawId: arrayBufferToBase64Url(assertion.rawId),
    type: assertion.type,
    response: {
      clientDataJSON: arrayBufferToBase64Url(assertion.response.clientDataJSON),
      authenticatorData: arrayBufferToBase64Url(assertion.response.authenticatorData),
      signature: arrayBufferToBase64Url(assertion.response.signature),
    }
  }
};

const result = await fetch('/.../auth-verify-passkey', {
  method: 'POST',
  body: JSON.stringify(body)
});

console.log(await result.json()); // { success: true, session: { access_token, ... } }
```

---

## 🧪 E2E Test Workflow

### Full Registration → Authentication Flow
```typescript
// 1. Get registration options
const regOptions = await fetch('/.../auth-registration-options', {
  method: 'POST',
  body: JSON.stringify({ email: 'test@example.com' })
}).then(r => r.json());

// 2. Browser creates credential
const credential = await navigator.credentials.create({
  publicKey: regOptions
});

// 3. Register credential
const regResult = await fetch('/.../auth-register-passkey', {
  method: 'POST',
  body: JSON.stringify({
    email: 'test@example.com',
    credential: credential,
    displayName: 'My Phone'
  })
}).then(r => r.json());

console.assert(regResult.success, 'Registration failed');
console.assert(regResult.credential_id, 'No credential ID returned');

// 4. Get authentication options
const authOptions = await fetch('/.../auth-authentication-options', {
  method: 'POST',
  body: JSON.stringify({ email: 'test@example.com' })
}).then(r => r.json());

console.assert(authOptions.allowCredentials.length > 0, 'No credentials available');

// 5. Browser creates assertion
const assertion = await navigator.credentials.get({
  publicKey: authOptions
});

// 6. Verify assertion
const authResult = await fetch('/.../auth-verify-passkey', {
  method: 'POST',
  body: JSON.stringify({ assertion })
}).then(r => r.json());

console.assert(authResult.success, 'Authentication failed');
console.assert(authResult.session.access_token, 'No access token');
```

---

## 📈 Implementation Checklist

- [ ] Deploy migration: `20260811_create_passkey_challenges.sql`
- [ ] Implement `auth-registration-options` (add challenge storage)
- [ ] Test `auth-registration-options` with curl
- [ ] Implement `auth-authentication-options` (query + store challenge)
- [ ] Test `auth-authentication-options` with curl
- [ ] Implement `auth-register-passkey` (full CBOR + verification)
- [ ] Test `auth-register-passkey` (browser → endpoint)
- [ ] Implement `auth-verify-passkey` (signature verification + session)
- [ ] Test `auth-verify-passkey` (full e2e flow)
- [ ] Add error handling (all functions)
- [ ] Add logging/audit trail
- [ ] TypeScript strict check (tsc -b)
- [ ] Deploy to staging
- [ ] Windows E2E test (pricing → registration → authentication)

---

**Status:** Ready for development  
**Next:** Assign to developer, begin Phase 1 (challenge generation)  
**Review checkpoint:** After Phase 1 deployment & testing
