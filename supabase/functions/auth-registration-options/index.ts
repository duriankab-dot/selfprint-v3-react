/**
 * Supabase Edge Function: Generate Passkey Registration Options
 * Called by client to get challenge for WebAuthn credential creation
 * @route POST /functions/v1/auth-registration-options
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { crypto } from 'https://deno.land/std@0.168.0/crypto/mod.ts';

interface RequestBody {
  email: string;
}

// Helper: generate random challenge
function generateChallenge(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(32));
}

// Helper: convert Uint8Array to Base64 URL-safe
function uint8ArrayToBase64Url(arr: Uint8Array): string {
  const binary = String.fromCharCode(...arr);
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
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
    const { email } = body;

    if (!email) {
      return new Response(JSON.stringify({ error: 'Email required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Generate challenge
    const challenge = generateChallenge();

    // Extract domain from request origin
    const origin = new URL(req.url).origin;
    const rpId = new URL(origin).hostname;

    // Return registration options
    const options = {
      challenge: uint8ArrayToBase64Url(challenge),
      rp: {
        name: 'Selfprint',
        id: rpId,
      },
      user: {
        id: email, // User ID - can be email or UUID
        name: email,
        displayName: email.split('@')[0],
      },
      pubKeyCredParams: [
        { alg: -7, type: 'public-key' }, // ES256
        { alg: -257, type: 'public-key' }, // RS256
      ],
      timeout: 60000,
      attestation: 'none' as const,
    };

    // TODO: Store challenge in cache/DB for verification
    // challenge_store[email] = { challenge, expires_at: Date.now() + 300000 }

    return new Response(JSON.stringify(options), {
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
