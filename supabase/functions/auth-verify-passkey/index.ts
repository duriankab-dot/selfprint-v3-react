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

  // For MVP, skip signature verification
  // In production: HMAC-SHA256 with Supabase JWT secret
  const signature = uint8ArrayToBase64Url(new Uint8Array(32)); // dummy

  return `${headerB64}.${payloadB64}.${signature}`;
}

// ─── Main Handler ─────────────────────────────────────────────

serve(async (req) => {
  // CORS handling
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = (await req.json()) as RequestBody;
    const { assertion } = body;

    if (!assertion) {
      return new Response(JSON.stringify({ error: 'Assertion required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // ─── Initialize Supabase ───────────────────────────────────

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // ─── Verify Challenge ──────────────────────────────────────

    const clientDataJSON = base64UrlToUint8Array(assertion.response.clientDataJSON);
    const clientData = parseClientDataJSON(assertion.response.clientDataJSON);

    // Verify type
    if (clientData.type !== 'webauthn.get') {
      throw new Error('Invalid client data type for authentication');
    }

    // Lookup challenge in DB
    const { data: challengeRow, error: challengeError } = await supabase
      .from('passkey_challenges')
      .select('*')
      .eq('challenge', clientData.challenge)
      .eq('challenge_type', 'authentication')
      .gt('expires_at', new Date().toISOString())
      .single();

    if (challengeError || !challengeRow) {
      throw new Error('Challenge not found or expired');
    }

    // ─── Lookup Credential ─────────────────────────────────────

    const credentialIdB64 = assertion.rawId;
    const { data: credential, error: credError } = await supabase
      .from('user_credentials')
      .select('*')
      .eq('credential_id', credentialIdB64)
      .single();

    if (credError || !credential) {
      throw new Error('Credential not found');
    }

    // ─── Parse AuthenticatorData ──────────────────────────────

    const authDataBytes = base64UrlToUint8Array(assertion.response.authenticatorData);
    const parsed = parseAuthenticatorData(authDataBytes);
    const { signCount } = parsed;

    // Verify counter (replay attack prevention)
    if (signCount <= credential.counter) {
      throw new Error('Counter did not increase — possible clone attack');
    }

    // ─── Verify Signature ──────────────────────────────────────

    // Reconstruct signed data: authData + clientDataHash
    const clientDataHash = await hashSHA256(clientDataJSON);
    const signedData = new Uint8Array(authDataBytes.length + clientDataHash.length);
    signedData.set(authDataBytes);
    signedData.set(clientDataHash, authDataBytes.length);

    // Get signature
    const signature = base64UrlToUint8Array(assertion.response.signature);

    // Get public key from credential
    const publicKeyBytes = base64UrlToUint8Array(credential.public_key);
    const cosePublicKey = decodeCBOR(publicKeyBytes);
    const publicKeyJwk = coseToJwk(cosePublicKey);

    // Import key for verification
    const publicKey = await crypto.subtle.importKey(
      'jwk',
      publicKeyJwk,
      { name: 'ECDSA', namedCurve: 'P-256', hash: 'SHA-256' },
      false,
      ['verify']
    );

    // Verify signature
    const isValid = await crypto.subtle.verify(
      'ECDSA',
      publicKey,
      signature,
      signedData
    );

    if (!isValid) {
      throw new Error('Signature verification failed');
    }

    // ─── Update Counter ────────────────────────────────────────

    const { error: updateError } = await supabase
      .from('user_credentials')
      .update({
        counter: signCount,
        last_used_at: new Date().toISOString(),
      })
      .eq('id', credential.id);

    if (updateError) {
      console.error('Failed to update counter:', updateError);
    }

    // ─── Create Session ────────────────────────────────────────

    const userId = credential.user_id;
    const accessToken = await createJWT(userId);

    // Delete challenge (consumed)
    await supabase
      .from('passkey_challenges')
      .delete()
      .eq('challenge', clientData.challenge);

    // ─── Return Success ────────────────────────────────────────

    return new Response(
      JSON.stringify({
        success: true,
        session: {
          access_token: accessToken,
          token_type: 'bearer',
          expires_in: 3600,
          user: {
            id: userId,
            email: userId,
          },
        },
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  } catch (error) {
    console.error('Verification error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
});
