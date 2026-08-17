/**
 * Supabase Edge Function: Generate Passkey Registration Options
 * Called by client to get challenge for WebAuthn credential creation
 * @route POST /functions/v1/auth-registration-options
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { crypto } from 'https://deno.land/std@0.168.0/crypto/mod.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.1';

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

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Generate challenge
    const challenge = generateChallenge();
    const challengeB64 = uint8ArrayToBase64Url(challenge);

    // Extract domain from request origin
    const origin = new URL(req.url).origin;
    const rpId = new URL(origin).hostname;

    // Store challenge in DB (5 minute TTL)
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
    const { error: dbError } = await supabase
      .from('passkey_challenges')
      .insert({
        user_id: email,
        challenge: challengeB64,
        challenge_type: 'registration',
        expires_at: expiresAt.toISOString(),
      });

    if (dbError) {
      console.error('Failed to store challenge:', dbError);
      throw new Error(`Challenge storage failed: ${dbError.message}`);
    }

    // Return registration options
    const options = {
      challenge: challengeB64,
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
