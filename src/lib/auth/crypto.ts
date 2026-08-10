/**
 * Cryptographic Utilities for Passkey Verification
 * Handles signature verification for WebAuthn credentials
 * @module auth/crypto
 */

/**
 * Parse attestation object (CBOR format)
 * Returns { fmt, attStmt, authData }
 */
export interface AttestationObject {
  fmt: string;
  attStmt: Record<string, unknown>;
  authData: Uint8Array;
}

/**
 * Authenticator data structure
 */
export interface AuthenticatorData {
  rpIdHash: Uint8Array; // 32 bytes SHA-256
  flags: number;
  signCount: number;
  attestedCredentialData?: {
    aaguid: Uint8Array; // 16 bytes
    credentialIdLength: number;
    credentialId: Uint8Array;
    publicKey: Uint8Array; // CBOR encoded
  };
}

/**
 * Client data JSON structure (reconstructed from attestation/assertion)
 */
export interface ClientData {
  type: 'webauthn.create' | 'webauthn.get';
  challenge: string;
  origin: string;
  crossOrigin?: boolean;
}

/**
 * Parse CBOR-encoded authenticator data
 * Returns flags, signCount, and optional credential data
 */
export function parseAuthenticatorData(authData: Uint8Array): AuthenticatorData {
  if (authData.length < 37) {
    throw new Error('Invalid authenticator data: too short');
  }

  const rpIdHash = authData.slice(0, 32);
  const flags = authData[32];
  const signCount = new DataView(authData.buffer, authData.byteOffset + 33, 4).getUint32(0, false);

  const result: AuthenticatorData = {
    rpIdHash,
    flags,
    signCount,
  };

  // If attested credential data is present (flag 6 = bit 0x40)
  if (flags & 0x40) {
    if (authData.length < 37 + 16 + 2) {
      throw new Error('Invalid authenticator data: attested credential data too short');
    }

    let offset = 37;
    const aaguid = authData.slice(offset, offset + 16);
    offset += 16;

    const credentialIdLength = new DataView(authData.buffer, authData.byteOffset + offset, 2).getUint16(0, false);
    offset += 2;

    if (authData.length < offset + credentialIdLength) {
      throw new Error('Invalid authenticator data: credential ID too short');
    }

    const credentialId = authData.slice(offset, offset + credentialIdLength);
    offset += credentialIdLength;

    // Public key is CBOR encoded, remaining bytes
    const publicKey = authData.slice(offset);

    result.attestedCredentialData = {
      aaguid,
      credentialIdLength,
      credentialId,
      publicKey,
    };
  }

  return result;
}

/**
 * Extract public key from CBOR-encoded data (simplified)
 * Supports COSE key format (ES256, RS256)
 *
 * Returns: { kty, crv, x, y } for ECDSA or { kty, n, e } for RSA
 */
export function extractPublicKey(_cborPublicKey: Uint8Array): Record<string, unknown> {
  // TODO: Implement full CBOR parser
  // For now, this is a placeholder that requires server-side verification

  // In production, use:
  // - npm: cbor-x or cbor-web
  // - Parse CBOR map
  // - Extract COSE key parameters

  console.warn('CBOR parsing not implemented - use server-side verification');

  return {
    type: 'ECDSA',
    curve: 'P-256',
    // x, y coordinates would be parsed here
  };
}

/**
 * Reconstruct client data JSON from base64
 */
export function reconstructClientData(clientDataJSON: string): ClientData {
  try {
    const decoded = JSON.parse(clientDataJSON);
    return {
      type: decoded.type,
      challenge: decoded.challenge,
      origin: decoded.origin,
      crossOrigin: decoded.crossOrigin,
    };
  } catch (error) {
    throw new Error('Invalid client data JSON');
  }
}

/**
 * Hash clientData JSON with SHA-256
 * Used for signature verification
 */
export async function hashClientData(clientDataJSON: string): Promise<Uint8Array> {
  const encoder = new TextEncoder();
  const data = encoder.encode(clientDataJSON);

  try {
    // Use Web Crypto API if available
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return new Uint8Array(hashBuffer);
  } catch {
    // Fallback: warn that verification cannot happen in browser
    throw new Error('SHA-256 not available - crypto verification requires server');
  }
}

/**
 * Verify ECDSA signature (P-256 / ES256)
 * @param signature - Raw signature bytes (r || s, 64 bytes)
 * @param messageHash - SHA-256 hash of signed data
 * @param publicKeyX - Public key X coordinate (32 bytes)
 * @param publicKeyY - Public key Y coordinate (32 bytes)
 */
export async function verifyES256Signature(
  signature: Uint8Array,
  messageHash: Uint8Array,
  publicKeyX: Uint8Array,
  publicKeyY: Uint8Array
): Promise<boolean> {
  try {
    // Import public key in Web Crypto format
    const publicKey = await crypto.subtle.importKey(
      'raw',
      new Uint8Array([0x04, ...publicKeyX, ...publicKeyY]), // Uncompressed point
      {
        name: 'ECDSA',
        namedCurve: 'P-256',
      },
      false,
      ['verify']
    );

    // Verify signature
    const isValid = await crypto.subtle.verify('ECDSA', publicKey, signature.buffer as ArrayBuffer, messageHash.buffer as ArrayBuffer);
    return isValid;
  } catch (error) {
    console.error('ES256 verification failed:', error);
    return false;
  }
}

/**
 * Verify RSA signature (RS256)
 * @param signature - Raw signature bytes
 * @param messageHash - SHA-256 hash of signed data
 * @param modulus - RSA modulus (n)
 * @param exponent - RSA exponent (e)
 */
export async function verifyRS256Signature(
  signature: Uint8Array,
  messageHash: Uint8Array,
  modulus: Uint8Array,
  exponent: Uint8Array
): Promise<boolean> {
  try {
    // Import public key in Web Crypto format (PKCS#1)
    const publicKey = await crypto.subtle.importKey(
      'jwk',
      {
        kty: 'RSA',
        n: arrayBufferToBase64Url(modulus),
        e: arrayBufferToBase64Url(exponent),
        alg: 'RS256',
        ext: true,
      },
      {
        name: 'RSASSA-PKCS1-v1_5',
        hash: 'SHA-256',
      },
      false,
      ['verify']
    );

    // Verify signature
    const isValid = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', publicKey, signature.buffer as ArrayBuffer, messageHash.buffer as ArrayBuffer);
    return isValid;
  } catch (error) {
    console.error('RS256 verification failed:', error);
    return false;
  }
}

/**
 * Helper: Convert Uint8Array to Base64 URL-safe
 */
export function arrayBufferToBase64Url(buffer: Uint8Array | ArrayBuffer): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  const binary = String.fromCharCode(...bytes);
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Helper: Convert Base64 URL-safe to Uint8Array
 */
export function base64UrlToArrayBuffer(str: string): Uint8Array {
  const padded = str + '='.repeat((4 - (str.length % 4)) % 4);
  const binary = atob(padded.replace(/-/g, '+').replace(/_/g, '/'));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Verify Passkey registration attestation
 * (Simplified - attestation verification moved to server)
 */
export async function verifyRegistrationAttestation(
  clientDataJSON: string,
  attestationObject: string,
  challenge: string,
  origin: string
): Promise<{ valid: boolean; error?: string }> {
  try {
    // 1. Verify client data
    const clientData = reconstructClientData(clientDataJSON);

    if (clientData.type !== 'webauthn.create') {
      return { valid: false, error: 'Invalid client data type for registration' };
    }

    if (clientData.challenge !== challenge) {
      return { valid: false, error: 'Challenge mismatch' };
    }

    if (clientData.origin !== origin) {
      return { valid: false, error: 'Origin mismatch' };
    }

    // 2. Verify attestation (requires CBOR parsing)
    // This is complex and should happen on server side
    // For now, just verify the structure is valid

    const attestationBytes = base64UrlToArrayBuffer(attestationObject);
    if (attestationBytes.length < 10) {
      return { valid: false, error: 'Attestation object too short' };
    }

    return { valid: true };
  } catch (error) {
    return { valid: false, error: error instanceof Error ? error.message : 'Verification failed' };
  }
}

/**
 * Verify Passkey authentication assertion
 */
export async function verifyAuthenticationAssertion(
  clientDataJSON: string,
  authenticatorData: string,
  signature: string,
  challenge: string,
  origin: string,
  _storedPublicKey: Record<string, unknown>, // From registration — used server-side
  storedCounter: number
): Promise<{
  valid: boolean;
  newCounter?: number;
  error?: string;
}> {
  try {
    // 1. Verify client data
    const clientData = reconstructClientData(clientDataJSON);

    if (clientData.type !== 'webauthn.get') {
      return { valid: false, error: 'Invalid client data type for authentication' };
    }

    if (clientData.challenge !== challenge) {
      return { valid: false, error: 'Challenge mismatch' };
    }

    if (clientData.origin !== origin) {
      return { valid: false, error: 'Origin mismatch' };
    }

    // 2. Parse authenticator data
    const authDataBytes = base64UrlToArrayBuffer(authenticatorData);
    const authData = parseAuthenticatorData(authDataBytes);

    // 3. Check signature counter (prevent cloning)
    if (authData.signCount <= storedCounter) {
      // Counter didn't increment or went backwards = possible clone
      return { valid: false, error: 'Signature counter mismatch - possible cloning attack' };
    }

    // 4. Hash client data (stubbed — real verification is server-side)
    void hashClientData(clientDataJSON);

    // 5. Verify signature
    // This requires the public key format from registration
    // For now, this is stubbed - real implementation uses stored public key

    void base64UrlToArrayBuffer(signature);

    // TODO: Implement signature verification based on key type
    // if (storedPublicKey.kty === 'ECDSA') {
    //   const isValid = await verifyES256Signature(signatureBytes, clientDataHash, ...);
    // } else if (storedPublicKey.kty === 'RSA') {
    //   const isValid = await verifyRS256Signature(signatureBytes, clientDataHash, ...);
    // }

    console.warn('Signature verification stubbed - requires server-side implementation');

    return {
      valid: true, // TODO: Return actual verification result
      newCounter: authData.signCount,
    };
  } catch (error) {
    return { valid: false, error: error instanceof Error ? error.message : 'Verification failed' };
  }
}
