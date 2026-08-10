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

// Helper: Verify signature (simplified — real implementation needs crypto verification)
async function verifySignature(
  _clientDataJSON: string,
  _authenticatorData: string,
  _signature: string,
  _publicKey: string
): Promise<boolean> {
  // TODO: Implement real cryptographic signature verification
  // This would require:
  // 1. Parse attestationObject to get public key
  // 2. Recreate clientData hash
  // 3. Verify signature using public key

  // For now, just validate format
  try {
    base64UrlToUint8Array(_clientDataJSON);
    base64UrlToUint8Array(_authenticatorData);
    base64UrlToUint8Array(_signature);
    return true;
  } catch {
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

    // TODO: Verify assertion
    // 1. Look up credential in database
    // 2. Verify signature using stored public key
    // 3. Check counter to prevent cloning
    // 4. Update last_used_at and counter

    // For now, just simulate verification
    const signatureValid = await verifySignature(
      assertion.response.clientDataJSON,
      assertion.response.authenticatorData,
      assertion.response.signature,
      'temp-public-key'
    );

    if (!signatureValid) {
      return new Response(JSON.stringify({ error: 'Invalid assertion' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // TODO: Get user ID from credential lookup
    // const { data: credential } = await supabase
    //   .from('user_credentials')
    //   .select('user_id')
    //   .eq('credential_id', assertion.rawId)
    //   .single();

    // if (!credential) {
    //   throw new Error('Credential not found');
    // }

    // const userId = credential.user_id;

    // For now, use email as user ID
    const userId = email || assertion.response.userHandle;

    if (!userId) {
      return new Response(JSON.stringify({ error: 'User ID not found' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // TODO: Create session using Supabase Auth
    // This would typically involve:
    // 1. Finding or creating user in auth.users
    // 2. Issuing JWT tokens
    // 3. Setting refresh token in secure cookie

    // Simulate session response
    const session = {
      access_token: 'temp-jwt-token',
      refresh_token: 'temp-refresh-token',
      expires_in: 3600,
      token_type: 'bearer',
    };

    const user = {
      id: userId,
      email: userId,
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
