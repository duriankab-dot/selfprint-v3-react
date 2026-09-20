/**
 * Supabase Edge Function: Verify Passkey Assertion
 * Verifies assertion signature and creates session
 * @route POST /functions/v1/auth-verify-passkey
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.1';
import { decode as decodeCBOR } from 'https://esm.sh/cbor@9.0.1';

interface AssertionResponse {
  clientDataJSON: string;
  authenticatorData: string;
  signature: string;
  userHandle?: string;
}

interface AssertionData {
  id: string;
  rawId: string;
  type: string;
  response: AssertionResponse;
}

interface RequestBody {
  email?: string;
  assertion: AssertionData;
}

// ─── Helpers ──────────────────────────────────────────────────

function base64UrlToUint8Array(str: string): Uint8Array {
  const padded = str + '='.repeat((4 - (str.length % 4)) % 4);
  const binary = atob(padded.replace(/-/g, '+').replace(/_/g, '/'));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function uint8ArrayToBase64Url(arr: Uint8Array): string {
  const binary = String.fromCharCode(...arr);
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

async function hashSHA256(data: Uint8Array): Promise<Uint8Array> {
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return new Uint8Array(hashBuffer);
}

function parseClientDataJSON(clientDataJSON: string): {
  type: string;
  challenge: string;
  origin: string;
} {
  const decoded = new TextDecoder().decode(base64UrlToUint8Array(clientDataJSON));
  return JSON.parse(decoded);
}

function parseAuthenticatorData(authData: Uint8Array): {
  rpIdHash: Uint8Array;
  flags: number;
  signCount: number;
} {
  if (authData.length < 37) {
    throw new Error('Invalid authenticator data: too short');
  }

  const rpIdHash = authData.slice(0, 32);
  const flags = authData[32];
  const signCount = new DataView(authData.buffer, authData.byteOffset + 33, 4).getUint32(0, false);

  return { rpIdHash, flags, signCount };
}

// Convert COSE public key to JWK (for ES256 / P-256)
function coseToJwk(coseKey: any): JsonWebKey {
  // COSE keys have structure:
  // 1 (kty): 2 = EC
  // 3 (alg): -7 = ES256
  // -1 (crv): 1 = P-256
  // -2 (x): x coordinate
  // -3 (y): y coordinate

  const kty = coseKey.get(1);
  const alg = coseKey.get(3);
  const crv = coseKey.get(-1);
  const x = coseKey.get(-2);
  const y = coseKey.get(-3);

  if (kty !== 2 || alg !== -7 || crv !== 1) {
    throw new Error(`Unsupported COSE key: kty=${kty}, alg=${alg}, crv=${crv}`);
  }

  return {
    kty: 'EC',
    crv: 'P-256',
    x: uint8ArrayToBase64Url(new Uint8Array(x)),
    y: uint8ArrayToBase64Url(new Uint8Array(y)),
  };
}

// Create JWT token (for session)
async function createJWT(
  userId: string,
  expiresIn: number = 3600 // 1 hour
): Promise<string> {
  // For MVP: create a simple JWT-like object
  // In production: use proper JWT library with signing key

  const now = Math.floor(Date.now() / 1000);
  const payload = {
    sub: userId,
    aud: 'authenticated',
    role: 'authenticated',
    iat: now,
    exp: now + expiresIn,
  };

  const header = { alg: 'HS256', typ: 'JWT' };
  const headerB64 = uint8ArrayToBase64Url(
    new TextEncoder().encode(JSON.stringify(header))
  );
  const payloadB64 = uint8ArrayToBase64Url(
    new TextEncoder().encode(JSON.stringify(payload))
  );

  // Sign with HMAC-SHA256 using SUPABASE_JWT_SECRET
  const jwtSecret = Deno.env.get('SUPABASE_JWT_SECRET');
  if (!jwtSecret) {
    throw new Error('SUPABASE_JWT_SECRET environment variable is not set');
  }
  const signingInput = `${headerB64}.${payloadB64}`;
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(jwtSecret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sigBytes = await crypto.subtle.sign('HMAC', keyMaterial, new TextEncoder().encode(signingInput));
  const signature = uint8ArrayToBase64Url(new Uint8Array(sigBytes));

  return `${headerB64}.${payloadB64}.${signature}`;
}

// ─── Main Handler ─────────────────────────────────────────────

serve(async (req) => {
  // PASSKEY-DISABLED-001: Passkey subsystem disabled pending rebuild with
  // @simplewebauthn/server. The current implementation has a design flaw
  // (no authentication required for registration, hand-rolled JWT minting).
  return new Response(
    JSON.stringify({ error: 'Passkey verification temporarily disabled' }),
    {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    }
  );
});
