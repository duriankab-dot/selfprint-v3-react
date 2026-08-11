/**
 * Supabase Edge Function: Register Passkey
 * Verifies credential attestation and stores Passkey in user_credentials table
 * @route POST /functions/v1/auth-register-passkey
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.1';
import { decode as decodeCBOR } from 'https://esm.sh/cbor@9.0.1';

interface AttestationResponse {
  clientDataJSON: string;
  attestationObject: string;
}

interface CredentialData {
  id: string;
  rawId: string;
  type: string;
  response: AttestationResponse;
  transports?: string[];
}

interface RequestBody {
  email: string;
  credential: CredentialData;
  displayName?: string;
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
  credentialId: Uint8Array;
  credentialPublicKey: Uint8Array;
} {
  if (authData.length < 37) {
    throw new Error('Invalid authenticator data: too short');
  }

  const rpIdHash = authData.slice(0, 32);
  const flags = authData[32];
  const signCount = new DataView(authData.buffer, 33, 4).getUint32(0, false);

  const userPresent = (flags & 0x01) !== 0;
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
  const credentialPublicKey = authData.slice(offset);

  return {
    rpIdHash,
    flags,
    signCount,
    credentialId,
    credentialPublicKey,
  };
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
    const { email, credential, displayName } = body;

    if (!email || !credential) {
      return new Response(JSON.stringify({ error: 'Email and credential required' }), {
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

    const clientDataJSON = base64UrlToUint8Array(credential.response.clientDataJSON);
    const clientData = parseClientDataJSON(credential.response.clientDataJSON);

    // Verify type
    if (clientData.type !== 'webauthn.create') {
      throw new Error('Invalid client data type for registration');
    }

    // Lookup challenge in DB
    const { data: challengeRow, error: challengeError } = await supabase
      .from('passkey_challenges')
      .select('*')
      .eq('challenge', clientData.challenge)
      .eq('challenge_type', 'registration')
      .gt('expires_at', new Date().toISOString())
      .single();

    if (challengeError || !challengeRow) {
      throw new Error('Challenge not found or expired');
    }

    // Verify user matches
    if (challengeRow.user_id !== email) {
      throw new Error('Challenge user mismatch');
    }

    // Verify origin (basic check — in production, compare against config)
    const reqOrigin = new URL(req.url).origin;
    if (!clientData.origin.includes('localhost') && !clientData.origin.includes('selfprint.one')) {
      // Allow localhost for testing, selfprint.one for production
      console.warn(`Unusual origin: ${clientData.origin}`);
    }

    // ─── Decode & Verify Attestation Object ────────────────────

    const attestationObjectBytes = base64UrlToUint8Array(credential.response.attestationObject);
    const attestationObject = decodeCBOR(attestationObjectBytes);

    const { fmt, attStmt, authData: authDataRaw } = attestationObject;

    // For MVP: only support 'none' attestation
    if (fmt !== 'none') {
      throw new Error(`Attestation format '${fmt}' not supported`);
    }

    // ─── Parse AuthenticatorData ──────────────────────────────

    const authData = new Uint8Array(authDataRaw);
    const parsed = parseAuthenticatorData(authData);

    const { credentialId, credentialPublicKey, signCount } = parsed;
    const credentialIdB64 = uint8ArrayToBase64Url(credentialId);
    const publicKeyB64 = uint8ArrayToBase64Url(credentialPublicKey);

    // ─── Store in Database ────────────────────────────────────

    const { data: insertedCred, error: dbError } = await supabase
      .from('user_credentials')
      .insert({
        user_id: email,
        credential_id: credentialIdB64,
        public_key: publicKeyB64,
        counter: signCount,
        transports: credential.transports || [],
        name: displayName || 'My Passkey',
      })
      .select()
      .single();

    if (dbError) {
      console.error('Failed to store credential:', dbError);
      throw new Error(`Database insert failed: ${dbError.message}`);
    }

    // ─── Delete Challenge (consumed) ────────────────────────

    await supabase
      .from('passkey_challenges')
      .delete()
      .eq('challenge', clientData.challenge);

    // ─── Return Success ────────────────────────────────────

    return new Response(
      JSON.stringify({
        success: true,
        credential_id: credentialIdB64,
        message: 'Passkey registered successfully',
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
    console.error('Registration error:', error);
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
