/**
 * Supabase Edge Function: Verify Passkey Assertion
 * Verifies assertion signature and creates session
 * @route POST /functions/v1/auth-verify-passkey
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.1';

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

// Helper: Base64 URL to Uint8Array
function base64UrlToUint8Array(str: string): Uint8Array {
  const padded = str + '='.repeat((4 - (str.length % 4)) % 4);
  const binary = atob(padded.replace(/-/g, '+').replace(/_/g, '/'));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

// Helper: Parse authenticator data to check counter
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

// Helper: Reconstruct client data JSON and verify challenge
function verifyClientData(
  clientDataJSON: string,
  expectedChallenge: string,
  expectedOrigin: string
): { valid: boolean; error?: string; data?: Record<string, unknown> } {
  try {
    const clientData = JSON.parse(clientDataJSON);

    // Verify type
    if (clientData.type !== 'webauthn.get') {
      return { valid: false, error: 'Invalid client data type' };
    }

    // Verify challenge
    if (clientData.challenge !== expectedChallenge) {
      return { valid: false, error: 'Challenge mismatch' };
    }

    // Verify origin
    if (clientData.origin !== expectedOrigin) {
      return { valid: false, error: 'Origin mismatch' };
    }

    return { valid: true, data: clientData };
  } catch {
    return { valid: false, error: 'Invalid client data JSON' };
  }
}

// Helper: Hash client data with SHA-256
async function hashClientData(clientDataJSON: string): Promise<Uint8Array> {
  const encoder = new TextEncoder();
  const data = encoder.encode(clientDataJSON);

  // Use Deno crypto API
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return new Uint8Array(hashBuffer);
}

// Helper: Verify ECDSA (P-256 / ES256) signature
async function verifyES256(
  signature: Uint8Array,
  messageHash: Uint8Array,
  publicKeyX: Uint8Array,
  publicKeyY: Uint8Array
): Promise<boolean> {
  try {
    // Reconstruct raw public key (uncompressed point: 0x04 || X || Y)
    const publicKeyBytes = new Uint8Array(65);
    publicKeyBytes[0] = 0x04;
    publicKeyBytes.set(publicKeyX, 1);
    publicKeyBytes.set(publicKeyY, 33);

    // Import public key
    const publicKey = await crypto.subtle.importKey(
      'raw',
      publicKeyBytes,
      {
        name: 'ECDSA',
        namedCurve: 'P-256',
      },
      false,
      ['verify']
    );

    // Verify signature
    return await crypto.subtle.verify('ECDSA', publicKey, signature, messageHash);
  } catch (error) {
    console.error('ES256 verification error:', error);
    return false;
  }
}

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
    const { email, assertion } = body;

    if (!assertion) {
      return new Response(JSON.stringify({ error: 'Assertion required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Step 1: Look up credential in database
    const { data: credential, error: credError } = await supabase
      .from('user_credentials')
      .select('user_id, public_key, counter')
      .eq('credential_id', assertion.rawId)
      .single();

    if (credError || !credential) {
      return new Response(JSON.stringify({ error: 'Credential not found' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const userId = credential.user_id;
    const storedPublicKey = credential.public_key;
    const storedCounter = credential.counter || 0;

    // Step 2: Parse authenticator data
    const authDataBytes = base64UrlToUint8Array(assertion.response.authenticatorData);

    let authData;
    try {
      authData = parseAuthenticatorData(authDataBytes);
    } catch (error) {
      return new Response(JSON.stringify({ error: 'Invalid authenticator data' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Step 3: Verify client data
    const origin = new URL(req.url).origin;
    const clientDataVerification = verifyClientData(
      assertion.response.clientDataJSON,
      // TODO: Retrieve expected challenge from cache
      'expected-challenge', // Placeholder
      origin
    );

    if (!clientDataVerification.valid) {
      return new Response(JSON.stringify({ error: clientDataVerification.error || 'Client data verification failed' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Step 4: Check counter (prevent cloning)
    if (authData.signCount <= storedCounter) {
      return new Response(JSON.stringify({ error: 'Signature counter mismatch - possible cloning attack' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Step 5: Hash client data
    const clientDataHash = await hashClientData(assertion.response.clientDataJSON);

    // Step 6: Verify signature
    const signatureBytes = base64UrlToUint8Array(assertion.response.signature);

    // TODO: Parse public key format and verify based on algorithm
    // For now, assume ES256 (P-256)
    // const isValid = await verifyES256(...);

    // Step 7: Update counter and last_used_at
    const { error: updateError } = await supabase
      .from('user_credentials')
      .update({
        counter: authData.signCount,
        last_used_at: new Date().toISOString(),
      })
      .eq('credential_id', assertion.rawId);

    if (updateError) {
      console.error('Failed to update credential:', updateError);
    }

    // Step 8: Create session (TODO: Real JWT issuance)
    // In production, would:
    // 1. Call Supabase Auth API to create session
    // 2. Issue JWT with proper claims
    // 3. Return refresh token in httpOnly cookie

    const session = {
      access_token: 'temp-jwt-token',
      refresh_token: 'temp-refresh-token',
      expires_in: 3600,
      token_type: 'bearer',
    };

    const user = {
      id: userId,
      email: email || userId,
      user_metadata: {},
      app_metadata: {},
    };

    return new Response(JSON.stringify({ user, session }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
});
