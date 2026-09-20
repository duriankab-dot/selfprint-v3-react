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
  // PASSKEY-DISABLED-001: Passkey subsystem disabled pending rebuild with
  // @simplewebauthn/server. The current implementation has a design flaw
  // (no authentication required for registration, hand-rolled JWT minting).
  // Re-enabled when the migration is complete.
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 503,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  return new Response(
    JSON.stringify({ error: 'Passkey registration temporarily disabled' }),
    {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    }
  );
});
