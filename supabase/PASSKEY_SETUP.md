# § 34 Passkey Backend Setup Guide

**Status:** Edge functions scaffolded, ready for production deployment  
**Estimated Setup Time:** 30-45 minutes

---

## Prerequisites

1. Supabase project already created
2. Supabase CLI installed locally
3. Upstash Redis account (free tier available)
4. Git configured

---

## Step 1: Set Up Challenge Storage (Redis)

### 1a. Create Upstash Redis Account
1. Go to https://console.upstash.com
2. Sign up (free tier available)
3. Create new Redis database
4. Copy credentials:
   - **REST URL** (e.g., `https://project-123.upstash.io`)
   - **REST Token** (keep secret!)

### 1b. Add to Supabase Secrets
```bash
cd /path/to/selfprint-v3-react

# Create .env.local with your Upstash credentials
cat > supabase/.env.local << EOF
UPSTASH_REDIS_REST_URL=https://your-project.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-rest-token
CHALLENGE_EXPIRY_SECONDS=300
EOF

# Deploy secrets to Supabase
supabase secrets set --env-file supabase/.env.local --project-ref YOUR_PROJECT_REF
```

---

## Step 2: Deploy Database Migration

```bash
# Run migration to create user_credentials table
supabase db push

# Verify table was created
psql $SUPABASE_DB_URL -c "SELECT * FROM user_credentials LIMIT 0;"
# Should show columns: id, user_id, credential_id, public_key, counter, name, etc.
```

---

## Step 3: Deploy Edge Functions

```bash
# Deploy all 4 Passkey functions
supabase functions deploy auth-registration-options --project-ref YOUR_PROJECT_REF
supabase functions deploy auth-register-passkey --project-ref YOUR_PROJECT_REF
supabase functions deploy auth-authentication-options --project-ref YOUR_PROJECT_REF
supabase functions deploy auth-verify-passkey --project-ref YOUR_PROJECT_REF

# Verify deployment
supabase functions list --project-ref YOUR_PROJECT_REF
# Should show 4 functions with ✓ status
```

---

## Step 4: Update Edge Functions (Challenge Storage)

Edit each function to add challenge store/retrieve logic:

### `auth-registration-options/index.ts` — Add Redis storage
```typescript
// After generating challenge, store it:
const redisUrl = Deno.env.get('UPSTASH_REDIS_REST_URL');
const redisToken = Deno.env.get('UPSTASH_REDIS_REST_TOKEN');
const expiry = parseInt(Deno.env.get('CHALLENGE_EXPIRY_SECONDS') || '300');

const key = `challenge:registration:${email}`;
const challengeB64 = uint8ArrayToBase64Url(challenge);

// Store in Redis (TTL = expiry)
await fetch(`${redisUrl}/set/${key}`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${redisToken}`,
  },
  body: JSON.stringify({
    value: challengeB64,
    ex: expiry,
  }),
});
```

### `auth-authentication-options/index.ts` — Similar pattern
```typescript
const key = `challenge:auth:${email || 'discoverable'}`;
// Store challenge with TTL
```

### `auth-verify-passkey/index.ts` — Retrieve & verify challenge
```typescript
// Retrieve challenge from Redis
const redisUrl = Deno.env.get('UPSTASH_REDIS_REST_URL');
const redisToken = Deno.env.get('UPSTASH_REDIS_REST_TOKEN');

const key = `challenge:auth:${email || 'discoverable'}`;
const response = await fetch(`${redisUrl}/get/${key}`, {
  headers: {
    'Authorization': `Bearer ${redisToken}`,
  },
});

const storedChallenge = await response.json();
if (!storedChallenge || storedChallenge.value !== assertion.response.challenge) {
  throw new Error('Challenge mismatch or expired');
}

// Delete challenge after use (one-time use)
await fetch(`${redisUrl}/del/${key}`, {
  method: 'DELETE',
  headers: {
    'Authorization': `Bearer ${redisToken}`,
  },
});
```

---

## Step 5: Implement Signature Verification

Edit `auth-verify-passkey/index.ts` to add real signature verification:

```typescript
// After verifying client data and counter:

// Parse public key from stored credential
const publicKeyData = JSON.parse(storedPublicKey);

// Hash client data
const clientDataHash = await hashClientData(assertion.response.clientDataJSON);

// Verify signature based on key type
let isValid = false;

if (publicKeyData.kty === 'ECDSA') {
  // P-256 / ES256
  isValid = await verifyES256(
    signatureBytes,
    clientDataHash,
    publicKeyData.x,  // Base64 URL
    publicKeyData.y   // Base64 URL
  );
} else if (publicKeyData.kty === 'RSA') {
  // RS256
  isValid = await verifyRS256(
    signatureBytes,
    clientDataHash,
    publicKeyData.n,  // Modulus
    publicKeyData.e   // Exponent
  );
}

if (!isValid) {
  return new Response(JSON.stringify({ error: 'Signature verification failed' }), {
    status: 401,
    headers: { 'Content-Type': 'application/json' },
  });
}
```

---

## Step 6: Link to Supabase Auth

Update `auth-verify-passkey` to create real sessions:

```typescript
// After successful verification:

// Get or create user in auth.users
const { data: user, error: authError } = await supabase.auth.admin.createUser({
  email: email || userId,
  email_confirm: true,
  user_metadata: {
    auth_method: 'passkey',
    registered_at: new Date().toISOString(),
  },
});

if (authError && authError.status !== 422) { // 422 = user exists
  throw authError;
}

// Create session (Supabase Auth)
const { data: session, error: sessionError } = await supabase.auth.admin.generateLink({
  type: 'recovery',
  email: email || userId,
});

if (sessionError) throw sessionError;

// Or use custom JWT (requires JWT_SECRET in secrets)
const jwtSecret = Deno.env.get('JWT_SECRET');
const accessToken = await createJWT(userId, jwtSecret);

return new Response(JSON.stringify({
  user: { id: userId, email: email || userId },
  session: {
    access_token: accessToken,
    expires_in: 3600,
    token_type: 'bearer',
  },
}), {
  status: 200,
  headers: { 'Content-Type': 'application/json' },
});
```

---

## Step 7: Test End-to-End

### Test Registration
```bash
# 1. Get registration options
curl -X POST https://YOUR_PROJECT.supabase.co/functions/v1/auth-registration-options \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# Response should include:
# { "challenge": "...", "rp": {...}, "user": {...}, ... }

# 2. In browser, complete registration with biometric
# - Navigate to http://localhost:5173/login
# - Click "🔑 Register Passkey"
# - Complete biometric
# - Check database: SELECT * FROM user_credentials WHERE user_id = 'test@example.com';
```

### Test Authentication
```bash
# 1. Get auth options
curl -X POST https://YOUR_PROJECT.supabase.co/functions/v1/auth-authentication-options \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# 2. In browser, complete authentication
# - Navigate to http://localhost:5173/login
# - Click "🔑 Login with Passkey"
# - Complete biometric
# - Should redirect to /dashboard with session
```

---

## Step 8: Verify Deployment

### Check Function Logs
```bash
supabase functions logs auth-verify-passkey --project-ref YOUR_PROJECT_REF

# Check for errors like:
# - "Challenge mismatch"
# - "Signature counter mismatch"
# - "Signature verification failed"
```

### Check Database
```bash
# List registered Passkeys
psql $SUPABASE_DB_URL -c "SELECT user_id, name, created_at, last_used_at FROM user_credentials;"

# Check counter increments
psql $SUPABASE_DB_URL -c "SELECT user_id, counter FROM user_credentials WHERE user_id = 'test@example.com';"
```

---

## Troubleshooting

### "Credential not found"
- Check if registration completed successfully
- Verify `user_credentials` table has the credential
- Check `credential_id` matches

### "Challenge mismatch"
- Verify Redis is connected and accessible
- Check challenge expiry (default 5 min)
- Make sure challenge is one-time use

### "Signature counter mismatch"
- Possible cloning attack - check logs
- Counter should increment with each authentication
- Disallow authentication if counter doesn't increase

### "Signature verification failed"
- Check public key format matches algorithm (ES256 vs RS256)
- Verify signature bytes are correct base64 URL encoding
- Check client data hash is SHA-256 of original JSON

---

## Security Checklist

- [ ] Redis connection uses HTTPS + Bearer token
- [ ] Secrets stored in Supabase (not in code)
- [ ] CORS restricted to your domain(s)
- [ ] Challenge one-time use (delete after verification)
- [ ] Challenge expires after 5 minutes
- [ ] Counter validation prevents cloning
- [ ] Signature verification enabled
- [ ] Rate limiting on failed attempts
- [ ] Audit logging for security events

---

## Next Steps

1. ✅ Core infrastructure deployed
2. ✅ Edge functions running
3. ✅ Challenge storage configured
4. ✅ Signature verification enabled
5. 🔜 UI testing in development
6. 🔜 Production deployment (Vercel)
7. 🔜 Monitor and debug in production

---

## Commands Quick Reference

```bash
# View function logs
supabase functions logs auth-verify-passkey --project-ref YOUR_PROJECT_REF

# Update function
supabase functions deploy auth-verify-passkey --project-ref YOUR_PROJECT_REF

# Run local emulation
supabase start

# Deploy all at once
for fn in auth-registration-options auth-register-passkey auth-authentication-options auth-verify-passkey; do
  supabase functions deploy $fn --project-ref YOUR_PROJECT_REF
done
```

---

**Need help?**
- Check [Master Direction § 34](../docs/Master%20Direction%20ของ%20Selfprint%20เวอร์ชันใหม่.md)
- See [Implementation Guide](../docs/IMPLEMENTATION_PASSKEY_34.md)
- Review [Edge Function docs](https://supabase.com/docs/guides/functions)
