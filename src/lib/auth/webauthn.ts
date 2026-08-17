/**
 * WebAuthn / Passkey Utilities
 * Helpers for Passkey registration and authentication
 * @module auth/webauthn
 */

/**
 * Convert ArrayBuffer to Base64 URL-safe string
 */
export function arrayBufferToBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Convert Base64 URL-safe string to ArrayBuffer
 */
export function base64UrlToArrayBuffer(str: string): ArrayBuffer {
  const padded = str + '='.repeat((4 - (str.length % 4)) % 4);
  const binary = atob(padded.replace(/-/g, '+').replace(/_/g, '/'));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Check if WebAuthn is available in this browser
 */
export function isWebAuthnAvailable(): boolean {
  return (
    window.PublicKeyCredential !== undefined &&
    navigator.credentials !== undefined &&
    typeof navigator.credentials.create === 'function' &&
    typeof navigator.credentials.get === 'function'
  );
}

/**
 * Check if device is capable of resident key (discoverable credential)
 * Used to detect Passkey support
 */
export async function isPasskeyAvailable(): Promise<boolean> {
  if (!isWebAuthnAvailable()) {
    return false;
  }

  try {
    const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    return available;
  } catch {
    return false;
  }
}

/**
 * Registration options response from server
 */
export interface RegistrationOptions {
  challenge: string;
  rp: {
    name: string;
    id: string;
  };
  user: {
    id: string;
    name: string;
    displayName: string;
  };
  pubKeyCredParams: { alg: number; type: string }[];
  timeout: number;
  attestation: 'none' | 'direct' | 'indirect';
}

/**
 * Verified credential from server after registration
 */
export interface VerifiedCredential {
  id: string;
  publicKey: string;
  counter: number;
  transports?: string[];
}

/**
 * Create Passkey credential
 * Step 1 of registration flow
 */
export async function createPasskeyCredential(
  options: RegistrationOptions
): Promise<{
  id: string;
  rawId: string;
  type: string;
  response: {
    clientDataJSON: string;
    attestationObject: string;
  };
}> {
  if (!isWebAuthnAvailable()) {
    throw new Error('WebAuthn not available');
  }

  const credentialCreationOptions: CredentialCreationOptions = {
    publicKey: {
      challenge: base64UrlToArrayBuffer(options.challenge),
      rp: options.rp,
      user: {
        id: new TextEncoder().encode(options.user.id),
        name: options.user.name,
        displayName: options.user.displayName,
      },
      pubKeyCredParams: options.pubKeyCredParams as PublicKeyCredentialParameters[],
      timeout: options.timeout,
      attestation: options.attestation,
      authenticatorSelection: {
        authenticatorAttachment: 'platform', // Only resident/discoverable
        residentKey: 'preferred',
        userVerification: 'preferred',
      },
    },
  };

  const credential = await navigator.credentials.create(credentialCreationOptions);

  if (!credential || credential.type !== 'public-key') {
    throw new Error('Failed to create Passkey');
  }

  const publicKeyCredential = credential as PublicKeyCredential;
  const response = publicKeyCredential.response as AuthenticatorAttestationResponse;

  return {
    id: publicKeyCredential.id,
    rawId: arrayBufferToBase64Url(publicKeyCredential.rawId),
    type: publicKeyCredential.type,
    response: {
      clientDataJSON: arrayBufferToBase64Url(response.clientDataJSON),
      attestationObject: arrayBufferToBase64Url(response.attestationObject),
    },
  };
}

/**
 * Authentication options response from server
 */
export interface AuthenticationOptions {
  challenge: string;
  timeout: number;
  userVerification: 'required' | 'preferred' | 'discouraged';
  rpId: string;
  allowCredentials?: {
    id: string;
    type: string;
    transports?: string[];
  }[];
}

/**
 * Authenticate with Passkey
 * Returns assertion for verification on server
 */
export async function authenticateWithPasskey(
  options: AuthenticationOptions,
  allowedCredentialIds?: string[]
): Promise<{
  id: string;
  rawId: string;
  type: string;
  response: {
    clientDataJSON: string;
    authenticatorData: string;
    signature: string;
    userHandle?: string;
  };
}> {
  if (!isWebAuthnAvailable()) {
    throw new Error('WebAuthn not available');
  }

  let allowCredentials: PublicKeyCredentialDescriptor[] | undefined;

  if (allowedCredentialIds && allowedCredentialIds.length > 0) {
    allowCredentials = allowedCredentialIds.map((id) => ({
      type: 'public-key',
      id: base64UrlToArrayBuffer(id),
      transports: ['internal'],
    }));
  }

  const credentialRequestOptions: CredentialRequestOptions = {
    publicKey: {
      challenge: base64UrlToArrayBuffer(options.challenge),
      timeout: options.timeout,
      userVerification: options.userVerification,
      rpId: options.rpId,
      ...(allowCredentials && { allowCredentials }),
    },
  };

  const assertion = await navigator.credentials.get(credentialRequestOptions);

  if (!assertion || assertion.type !== 'public-key') {
    throw new Error('Failed to authenticate with Passkey');
  }

  const publicKeyCredential = assertion as PublicKeyCredential;
  const response = publicKeyCredential.response as AuthenticatorAssertionResponse;

  return {
    id: publicKeyCredential.id,
    rawId: arrayBufferToBase64Url(publicKeyCredential.rawId),
    type: publicKeyCredential.type,
    response: {
      clientDataJSON: arrayBufferToBase64Url(response.clientDataJSON),
      authenticatorData: arrayBufferToBase64Url(response.authenticatorData),
      signature: arrayBufferToBase64Url(response.signature),
      userHandle: response.userHandle ? arrayBufferToBase64Url(response.userHandle) : undefined,
    },
  };
}

/**
 * Biometric unlock for Passkey
 * Uses device biometric (Face ID, Touch ID, Windows Hello) to unlock platform authenticator
 * This is automatically handled by authenticateWithPasskey with userVerification: 'preferred'
 *
 * Returns true if biometric is available on device
 */
export async function isBiometricAvailable(): Promise<boolean> {
  if (!isWebAuthnAvailable()) {
    return false;
  }

  try {
    // Platform authenticator = device's built-in biometric
    const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    return available;
  } catch {
    return false;
  }
}
