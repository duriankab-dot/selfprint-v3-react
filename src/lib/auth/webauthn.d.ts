/**
 * WebAuthn/Passkey TypeScript Declarations
 * Provides type definitions for WebAuthn API
 * @module auth/webauthn.d.ts
 */

// Extend global namespace for WebAuthn API
declare global {
  interface PublicKeyCredentialCreationOptions {
    attestation?: 'none' | 'direct' | 'indirect' | 'enterprise';
    authenticatorSelection?: {
      authenticatorAttachment?: 'platform' | 'cross-platform';
      residentKey?: 'discouraged' | 'preferred' | 'required';
      userVerification?: 'required' | 'preferred' | 'discouraged';
    };
  }

  interface PublicKeyCredentialRequestOptions {
    userVerification?: 'required' | 'preferred' | 'discouraged';
  }

  interface AuthenticatorSelectionCriteria {
    authenticatorAttachment?: 'platform' | 'cross-platform';
    residentKey?: 'discouraged' | 'preferred' | 'required';
    userVerification?: 'required' | 'preferred' | 'discouraged';
  }
}

export {};
