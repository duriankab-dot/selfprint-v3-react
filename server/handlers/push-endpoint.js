/**
 * push-endpoint.js — Cloudflare Worker
 *
 * Master Direction §26-27 — Push Infrastructure
 *
 * Routes:
 *   POST /api/push/subscribe   — save subscription (handled by client → Supabase directly)
 *   POST /api/push/send        — send notification to a user's subscriptions
 *
 * Environment secrets (set via: npx wrangler secret put <NAME>):
 *   VAPID_PRIVATE_KEY   — VAPID private key (PEM or base64url)
 *   VAPID_PUBLIC_KEY    — VAPID public key (base64url)
 *   VAPID_SUBJECT       — mailto: or https: for VAPID
 *   SUPABASE_URL        — project URL
 *   SUPABASE_SERVICE_KEY — service_role key (server-side only, never exposed to client)
 *
 * NOTE: subscription INSERT is done client-side (usePushSubscription.ts → Supabase RLS).
 * This Worker only handles SENDING notifications (needs service key to read push_subscriptions).
 *
 * VAPID key generation (run once locally):
 *   npx web-push generate-vapid-keys
 *   npx wrangler secret put VAPID_PRIVATE_KEY
 *   npx wrangler secret put VAPID_PUBLIC_KEY
 *   npx wrangler secret put VAPID_SUBJECT
 *   npx wrangler secret put SUPABASE_URL
 *   npx wrangler secret put SUPABASE_SERVICE_KEY
 */

// ─── Web Push (RFC 8291 / VAPID) ─────────────────────────────────────────────

/**
 * Build VAPID Authorization header using Web Crypto API (Cloudflare Workers native).
 * Implements RFC 8292 (Voluntary Application Server Identification for Web Push).
 */
async function buildVapidAuthHeader(endpoint, subject, publicKeyB64u, privateKeyB64u) {
  const url = new URL(endpoint);
  const audience = `${url.protocol}//${url.host}`;

  const now = Math.floor(Date.now() / 1000);
  const exp = now + 12 * 3600; // 12h

  // JWT header + claims
  const header = btoa(JSON.stringify({ typ: 'JWT', alg: 'ES256' })).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const payload = btoa(JSON.stringify({ aud: audience, exp, sub: subject })).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const signingInput = `${header}.${payload}`;

  // Import private key
  const rawPrivate = Uint8Array.from(atob(privateKeyB64u.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));
  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8',
    rawPrivate,
    { name: 'ECDSA', namedCurve: 'P-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign(
    { name: 'ECDSA', hash: 'SHA-256' },
    cryptoKey,
    new TextEncoder().encode(signingInput)
  );

  const sigB64u = btoa(String.fromCharCode(...new Uint8Array(signature))).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const jwt = `${signingInput}.${sigB64u}`;

  return `vapid t=${jwt}, k=${publicKeyB64u}`;
}

/**
 * Encrypt push message per RFC 8291 (AES-128-GCM + ECDH-ES).
 * Returns { ciphertext: ArrayBuffer, serverPublicKeyRaw: Uint8Array, salt: Uint8Array }
 */
async function encryptPushPayload(clientPublicKeyB64u, clientAuthB64u, plaintext) {
  const clientPubRaw = Uint8Array.from(atob(clientPublicKeyB64u.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));
  const clientAuth = Uint8Array.from(atob(clientAuthB64u.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));

  // Generate server ECDH key pair
  const serverKeyPair = await crypto.subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveBits']);
  const serverPubRaw = new Uint8Array(await crypto.subtle.exportKey('raw', serverKeyPair.publicKey));

  // Import client public key
  const clientPubKey = await crypto.subtle.importKey('raw', clientPubRaw, { name: 'ECDH', namedCurve: 'P-256' }, false, []);

  // ECDH shared secret
  const sharedBits = await crypto.subtle.deriveBits({ name: 'ECDH', public: clientPubKey }, serverKeyPair.privateKey, 256);

  // salt (16 bytes random)
  const salt = crypto.getRandomValues(new Uint8Array(16));

  // HKDF to derive PRK
  const ikm = await crypto.subtle.importKey('raw', sharedBits, 'HKDF', false, ['deriveKey', 'deriveBits']);

  const prk = await crypto.subtle.deriveBits(
    { name: 'HKDF', hash: 'SHA-256', salt: clientAuth, info: new TextEncoder().encode('Content-Encoding: auth\0') },
    ikm,
    256
  );

  const prkKey = await crypto.subtle.importKey('raw', prk, 'HKDF', false, ['deriveBits']);

  // Build keyinfo and cekinfo
  function concat(...arrays) {
    const len = arrays.reduce((a, b) => a + b.length, 0);
    const out = new Uint8Array(len);
    let offset = 0;
    for (const a of arrays) { out.set(a, offset); offset += a.length; }
    return out;
  }

  const context = concat(
    new TextEncoder().encode('P-256\0'),
    new Uint8Array([0, clientPubRaw.length]),
    clientPubRaw,
    new Uint8Array([0, serverPubRaw.length]),
    serverPubRaw
  );
  const cekInfo = concat(new TextEncoder().encode('Content-Encoding: aesgcm\0'), context);
  const nonceInfo = concat(new TextEncoder().encode('Content-Encoding: nonce\0'), context);

  const cekBits = await crypto.subtle.deriveBits({ name: 'HKDF', hash: 'SHA-256', salt, info: cekInfo }, prkKey, 128);
  const nonceBits = await crypto.subtle.deriveBits({ name: 'HKDF', hash: 'SHA-256', salt, info: nonceInfo }, prkKey, 96);

  const cekKey = await crypto.subtle.importKey('raw', cekBits, 'AES-GCM', false, ['encrypt']);
  const nonce = new Uint8Array(nonceBits);

  // Pad + encrypt
  const encoded = new TextEncoder().encode(typeof plaintext === 'string' ? plaintext : JSON.stringify(plaintext));
  const padded = concat(new Uint8Array(2), encoded); // 2-byte zero padding length
  const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv: nonce }, cekKey, padded);

  return { ciphertext, serverPublicKeyRaw: serverPubRaw, salt };
}

// ─── Supabase helper (no sdk — plain fetch) ──────────────────────────────────

async function getSubscriptionsForUser(supabaseUrl, serviceKey, userId) {
  const res = await fetch(
    `${supabaseUrl}/rest/v1/push_subscriptions?user_id=eq.${userId}&select=endpoint,keys_p256dh,keys_auth`,
    {
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        'Content-Type': 'application/json',
      },
    }
  );
  if (!res.ok) throw new Error(`Supabase error: ${res.status}`);
  return res.json();
}

// ─── Send push to one subscription ──────────────────────────────────────────

async function sendPushToSubscription(sub, payload, env) {
  const { ciphertext, serverPublicKeyRaw, salt } = await encryptPushPayload(
    sub.keys_p256dh,
    sub.keys_auth,
    payload
  );

  const serverPubB64u = btoa(String.fromCharCode(...serverPublicKeyRaw)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const saltB64u = btoa(String.fromCharCode(...salt)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

  const vapidAuth = await buildVapidAuthHeader(sub.endpoint, env.VAPID_SUBJECT, env.VAPID_PUBLIC_KEY, env.VAPID_PRIVATE_KEY);

  const res = await fetch(sub.endpoint, {
    method: 'POST',
    headers: {
      Authorization: vapidAuth,
      'Content-Type': 'application/octet-stream',
      'Content-Encoding': 'aesgcm',
      Encryption: `salt=${saltB64u}`,
      'Crypto-Key': `dh=${serverPubB64u}`,
      TTL: '86400',
    },
    body: ciphertext,
  });

  return res.status;
}

// ─── Main handler ─────────────────────────────────────────────────────────────

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // POST /api/push/send
    if (request.method === 'POST' && url.pathname === '/api/push/send') {
      let body;
      try {
        body = await request.json();
      } catch {
        return new Response('Invalid JSON', { status: 400 });
      }

      const { user_id, title, body: msgBody, type = 'general' } = body;
      if (!user_id || !title) {
        return new Response('user_id and title are required', { status: 400 });
      }

      const payload = { title, body: msgBody ?? '', type };

      try {
        const subs = await getSubscriptionsForUser(env.SUPABASE_URL, env.SUPABASE_SERVICE_KEY, user_id);
        if (!subs.length) {
          return Response.json({ sent: 0, message: 'No subscriptions found' });
        }

        const results = await Promise.allSettled(
          subs.map(sub => sendPushToSubscription(sub, payload, env))
        );

        const sent = results.filter(r => r.status === 'fulfilled' && r.value < 400).length;
        return Response.json({ sent, total: subs.length });
      } catch (err) {
        console.error('Push send error:', err);
        return new Response('Push send failed', { status: 500 });
      }
    }

    return new Response('Not found', { status: 404 });
  },
};
