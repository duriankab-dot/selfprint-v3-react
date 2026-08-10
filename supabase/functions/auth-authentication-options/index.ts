/**
 * Supabase Edge Function: Generate Passkey Authentication Options
 * Called by client to get challenge for WebAuthn assertion
 * @route POST /functions/v1/auth-authentication-options
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { crypto } from 'https://deno.land/std@0.168.0/crypto/mod.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.1';

interface RequestBody {
  email?: string;
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

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Generate challenge
    const challenge = generateChallenge();

    // Extract domain from request origin
    const origin = new URL(req.url).origin;
    const rpId = new URL(origin).hostname;

    // If email provided, get user's registered credentials
    let allowCredentials: Array<{ id: string; type: string }> = [];

    if (email) {
      // TODO: Query user_credentials table for email
      // const { data: credentials } = await supabase
      //   .from('user_credentials')
      //   .select('credential_id')
      //   .eq('user_id', email);

      // if (credentials) {
      //   allowCredentials = credentials.map(c => ({
      //     id: c.credential_id,
      //     type: 'public-key'
      //   }));
      // }
    }

    // Return authentication options
    const options = {
      challenge: uint8ArrayToBase64Url(challenge),
      timeout: 60000,
      userVerification: 'preferred' as const,
      rpId: rpId,
      ...(allowCredentials.length > 0 && { allowCredentials }),
    };

    // TODO: Store challenge in cache/DB for verification
    // challenge_store[email || 'discoverable'] = { challenge, expires_at: Date.now() + 300000 }

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
