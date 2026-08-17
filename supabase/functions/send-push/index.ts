/**
 * Supabase Edge Function: send-push
 *
 * ส่ง Web Push notification ไปยัง subscription ของ user
 * ใช้ VAPID auth + AES-128-GCM payload encryption (RFC 8291 + RFC 8188)
 *
 * @route POST /functions/v1/send-push
 * Body: { userId, title, body, type?, url?, icon? }
 *
 * Environment vars required:
 *   VAPID_PUBLIC_KEY   - base64url-encoded P-256 public key
 *   VAPID_PRIVATE_KEY  - base64url-encoded P-256 private key (PKCS8)
 *   VAPID_SUBJECT      - mailto: or https: contact URL
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.1';

// ─── CORS ─────────────────────────────────────────────────────────────────────

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });
}

// ─── Crypto helpers ───────────────────────────────────────────────────────────

function base64UrlToBytes(str: string): Uint8Array {
  const padded = str + '='.repeat((4 - (str.length % 4)) % 4);
  const binary = atob(padded.replace(/-/g, '+').replace(/_/g, '/'));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function bytesToBase64Url(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function concat(...arrays: Uint8Array[]): Uint8Array {
  const total = arrays.reduce((s, a) => s + a.length, 0);
  const result = new Uint8Array(total);
  let offset = 0;
  for (const a of arrays) { result.set(a, offset); offset += a.length; }
  return result;
}

/** HKDF-Expand using HMAC-SHA-256 */
async function hkdfExpand(
  prk: Uint8Array,
  info: Uint8Array,
  length: number
): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey(
    'raw', prk, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const result = new Uint8Array(length);
  let t = new Uint8Array(0);
  let offset = 0;
  for (let i = 1; offset < length; i++) {
    const block = new Uint8Array(await crypto.subtle.sign(
      'HMAC', key, concat(t, info, new Uint8Array([i]))
    ));
    t = block;
    result.set(block.slice(0, Math.min(block.length, length - offset)), offset);
    offset += block.length;
  }
  return result;
}

/** HKDF-Extract using HMAC-SHA-256 */
async function hkdfExtract(salt: Uint8Array, ikm: Uint8Array): Promise<Uint8Array> {
  const saltKey = await crypto.subtle.importKey(
    'raw', salt, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  return new Uint8Array(await crypto.subtle.sign('HMAC', saltKey, ikm));
}

// ─── Web Push Payload Encryption (RFC 8291 + RFC 8188 aes128gcm) ──────────────

async function encryptPayload(
  plaintext: string,
  p256dh: string,
  auth: string
): Promise<{ ciphertext: Uint8Array; salt: Uint8Array; serverPublicKey: Uint8Array }> {
  const plaintextBytes = new TextEncoder().encode(plaintext);

  // 1. Import subscriber's public key
  const subscriberPublicKey = await crypto.subtle.importKey(
    'raw',
    base64UrlToBytes(p256dh),
    { name: 'ECDH', namedCurve: 'P-256' },
    false,
    []
  );

  // 2. Generate ephemeral key pair
  const ephemeralKeyPair = await crypto.subtle.generateKey(
    { name: 'ECDH', namedCurve: 'P-256' },
    true,
    ['deriveBits']
  );

  // 3. ECDH shared secret
  const sharedSecretBits = await crypto.subtle.deriveBits(
    { name: 'ECDH', public: subscriberPublicKey },
    ephemeralKeyPair.privateKey,
    256
  );
  const sharedSecret = new Uint8Array(sharedSecretBits);

  // 4. Export ephemeral public key (65 bytes, uncompressed)
  const serverPublicKey = new Uint8Array(
    await crypto.subtle.exportKey('raw', ephemeralKeyPair.publicKey)
  );

  // 5. subscriber public key raw bytes
  const subscriberPublicRaw = base64UrlToBytes(p256dh);
  const authBytes = base64UrlToBytes(auth);

  // 6. PRK_key = HKDF-Extract(salt=auth, IKM=sharedSecret)
  const prkKey = await hkdfExtract(authBytes, sharedSecret);

  // 7. key_info = "WebPush: info\0" || subscriber_public || server_public
  const keyInfo = concat(
    new TextEncoder().encode('WebPush: info\0'),
    subscriberPublicRaw,
    serverPublicKey
  );

  // 8. IKM = HKDF-Expand(prkKey, info=keyInfo||0x01, L=32)
  const ikm = await hkdfExpand(prkKey, concat(keyInfo, new Uint8Array([0x01])), 32);

  // 9. Random salt (16 bytes)
  const salt = crypto.getRandomValues(new Uint8Array(16));

  // 10. CEK = HKDF(IKM, salt, "Content-Encoding: aes128gcm\0\x01", 16)
  const cekPrk = await hkdfExtract(salt, ikm);
  const cekInfo = concat(
    new TextEncoder().encode('Content-Encoding: aes128gcm\0'),
    new Uint8Array([0x01])
  );
  const cek = await hkdfExpand(cekPrk, cekInfo, 16);

  // 11. Nonce = HKDF(IKM, salt, "Content-Encoding: nonce\0\x01", 12)
  const nonceInfo = concat(
    new TextEncoder().encode('Content-Encoding: nonce\0'),
    new Uint8Array([0x01])
  );
  const nonce = await hkdfExpand(cekPrk, nonceInfo, 12);

  // 12. Pad plaintext: plaintext || 0x02 || padding (default rs=4096)
  const rs = 4096;
  const paddingLength = rs - plaintextBytes.length - 17 - 1; // 17 = tag + salt+rs+idlen
  const padded = concat(
    plaintextBytes,
    new Uint8Array([0x02]), // delimiter
    new Uint8Array(Math.max(0, paddingLength))
  );

  // 13. AES-128-GCM encrypt
  const cekKey = await crypto.subtle.importKey(
    'raw', cek, { name: 'AES-GCM', length: 128 }, false, ['encrypt']
  );
  const encrypted = new Uint8Array(
    await crypto.subtle.encrypt({ name: 'AES-GCM', iv: nonce }, cekKey, padded)
  );

  // 14. Build RFC 8188 header: salt(16) || rs(4, big-endian) || idlen(1) || keyid(serverPublicKey)
  const rsBytes = new Uint8Array(4);
  new DataView(rsBytes.buffer).setUint32(0, rs, false);
  const header = concat(salt, rsBytes, new Uint8Array([serverPublicKey.length]), serverPublicKey);

  return { ciphertext: concat(header, encrypted), salt, serverPublicKey };
}

// ─── VAPID JWT ────────────────────────────────────────────────────────────────

async function buildVapidAuthHeader(
  audience: string,
  vapidPublicKey: string,
  vapidPrivateKeyPkcs8: string,
  subject: string
): Promise<string> {
  const header = bytesToBase64Url(new TextEncoder().encode(JSON.stringify({ typ: 'JWT', alg: 'ES256' })));
  const payload = bytesToBase64Url(new TextEncoder().encode(JSON.stringify({
    aud: audience,
    exp: Math.floor(Date.now() / 1000) + 43200, // 12h
    sub: subject,
  })));
  const unsigned = `${header}.${payload}`;

  const privateKeyBytes = base64UrlToBytes(vapidPrivateKeyPkcs8);
  const privateKey = await crypto.subtle.importKey(
    'pkcs8',
    privateKeyBytes,
    { name: 'ECDSA', namedCurve: 'P-256' },
    false,
    ['sign']
  );
  const signatureBytes = new Uint8Array(
    await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, privateKey, new TextEncoder().encode(unsigned))
  );
  const token = `${unsigned}.${bytesToBase64Url(signatureBytes)}`;

  return `vapid t=${token},k=${vapidPublicKey}`;
}

// ─── Main handler ─────────────────────────────────────────────────────────────

interface PushPayload {
  userId: string;
  title: string;
  body: string;
  type?: 'reflection' | 'pattern' | 'journey' | 'milestone';
  url?: string;
  icon?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS });
  if (req.method !== 'POST') return json({ error: 'POST only' }, 405);

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY');
  const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY');
  const vapidSubject = Deno.env.get('VAPID_SUBJECT') || 'mailto:hello@selfprint.one';

  if (!supabaseUrl || !serviceKey) return json({ error: 'Supabase not configured' }, 500);
  if (!vapidPublicKey || !vapidPrivateKey) return json({ error: 'VAPID keys not configured' }, 500);

  try {
    const body = (await req.json()) as PushPayload;
    if (!body.userId || !body.title || !body.body) {
      return json({ error: 'userId, title, body required' }, 400);
    }

    const supabase = createClient(supabaseUrl, serviceKey);

    // Get active subscriptions for user
    const { data: subs, error: subErr } = await supabase
      .from('push_subscriptions')
      .select('endpoint, keys_p256dh, keys_auth')
      .eq('user_id', body.userId)
      .eq('is_active', true);

    if (subErr) throw new Error(`DB error: ${subErr.message}`);
    if (!subs || subs.length === 0) return json({ success: true, sent: 0 });

    const pushMessage = JSON.stringify({
      title: body.title,
      body: body.body,
      type: body.type || 'reflection',
      url: body.url || '/',
      icon: body.icon || '/icon-192.png',
      timestamp: Date.now(),
    });

    let sent = 0;
    const errors: string[] = [];

    for (const sub of subs) {
      try {
        const { ciphertext } = await encryptPayload(pushMessage, sub.keys_p256dh, sub.keys_auth);
        const audience = new URL(sub.endpoint).origin;
        const vapidAuth = await buildVapidAuthHeader(audience, vapidPublicKey, vapidPrivateKey, vapidSubject);

        const pushRes = await fetch(sub.endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/octet-stream',
            'Content-Encoding': 'aes128gcm',
            'Authorization': vapidAuth,
            'TTL': '86400',
            'Urgency': 'normal',
          },
          body: ciphertext,
        });

        if (pushRes.ok || pushRes.status === 201) {
          sent++;
        } else if (pushRes.status === 410 || pushRes.status === 404) {
          // Subscription expired/gone
          await supabase
            .from('push_subscriptions')
            .update({ is_active: false })
            .eq('endpoint', sub.endpoint)
            .eq('user_id', body.userId);
        } else {
          errors.push(`HTTP ${pushRes.status} for ${sub.endpoint.slice(-30)}`);
        }
      } catch (e) {
        errors.push(e instanceof Error ? e.message : String(e));
      }
    }

    return json({ success: true, sent, total: subs.length, errors });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error('[send-push]', msg);
    return json({ error: msg }, 500);
  }
});
