/**
 * Supabase Edge Function: Register Passkey
 * Verifies credential attestation and stores Passkey in user_credentials table
 * @route POST /functions/v1/auth-register-passkey
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.1';

interface AttestationResponse {
  clientDataJSON: string;
  attestationObject: string;
}

interface CredentialData {
  id: string;
  rawId: string;
  type: string;
  response: AttestationResponse;
}

interface RequestBody {
  email: string;
  credential: CredentialData;
  displayName?: string;
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

// Helper: Verify attestation object (simplified — no deep verification)
async function verifyAttestation(attestationObject: string): Promise<boolean> {
  // TODO: Implement full attestation verification
  // For now, just check if it's valid base64
  try {
    base64UrlToUint8Array(attestationObject);
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
    const { email, credential, displayName } = body;

    if (!email || !credential) {
      return new Response(JSON.stringify({ error: 'Email and credential required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Verify attestation
    const attestationValid = await verifyAttestation(credential.response.attestationObject);
    if (!attestationValid) {
      return new Response(JSON.stringify({ error: 'Invalid attestation' }), {
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

    // TODO: Find user by email and get their ID
    // For now, use email as user ID (in production, match to existing auth user)

    // Store credential in database
    const { data, error } = await supabase.from('user_credentials').insert({
      user_id: email, // TODO: Use actual user ID
      credential_id: credential.rawId,
      public_key: credential.response.attestationObject,
      counter: 0,
      name: displayName || 'My Passkey',
      created_at: new Date().toISOString(),
      last_used_at: null,
    });

    if (error) {
      throw error;
    }

    return new Response(
      JSON.stringify({
        id: credential.rawId,
        publicKey: credential.response.attestationObject,
        counter: 0,
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
