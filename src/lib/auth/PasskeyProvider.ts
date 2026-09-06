/**
 * Passkey / WebAuthn Service Provider
 * Handles Passkey registration and authentication flows
 * @module auth/PasskeyProvider
 */

import { supabase } from '@/lib/supabase/client';
import type {
  RegistrationOptions,
  AuthenticationOptions,
  VerifiedCredential,
} from './webauthn';
import {
  createPasskeyCredential,
  authenticateWithPasskey,
  isPasskeyAvailable,
  isBiometricAvailable,
} from './webauthn';

export interface PasskeyProviderConfig {
  rpId: string;
  rpName: string;
  origin: string;
}

export class PasskeyProvider {
  config: PasskeyProviderConfig;

  constructor(config: PasskeyProviderConfig) {
    this.config = config;
  }

  /**
   * Check if Passkey is available on this device
   */
  async isAvailable(): Promise<boolean> {
    return isPasskeyAvailable();
  }

  /**
   * Check if biometric is available for unlocking
   */
  async isBiometricAvailable(): Promise<boolean> {
    return isBiometricAvailable();
  }

  /**
   * Initiate Passkey registration flow
   * Step 1: Server generates challenge
   */
  async getRegistrationOptions(email: string): Promise<RegistrationOptions> {
    const { data, error } = await supabase.functions.invoke('auth-registration-options', {
      body: { email },
    });

    if (error) {
      throw new Error(`Failed to get registration options: ${error.message}`);
    }

    return data;
  }

  /**
   * Register Passkey
   * Step 2: Client creates credential, server verifies
   */
  async registerPasskey(
    email: string,
    options: RegistrationOptions,
    displayName?: string
  ): Promise<VerifiedCredential> {
    // Create credential on device
    const credential = await createPasskeyCredential(options);

    // Verify on server
    const { data, error } = await supabase.functions.invoke('auth-register-passkey', {
      body: {
        email,
        credential,
        displayName: displayName || email.split('@')[0],
      },
    });

    if (error) {
      throw new Error(`Failed to register Passkey: ${error.message}`);
    }

    return data as VerifiedCredential;
  }

  /**
   * Initiate Passkey authentication flow
   * Step 1: Server generates challenge
   */
  async getAuthenticationOptions(email?: string): Promise<AuthenticationOptions> {
    const { data, error } = await supabase.functions.invoke('auth-authentication-options', {
      body: { email },
    });

    if (error) {
      throw new Error(`Failed to get authentication options: ${error.message}`);
    }

    return data;
  }

  /**
   * Authenticate with Passkey
   * Step 2: Client authenticates, server verifies and returns session
   */
  async authenticatePasskey(email?: string): Promise<{ user: any; session: any }> {
    // Get authentication options
    const options = await this.getAuthenticationOptions(email);

    // Authenticate on device
    const assertion = await authenticateWithPasskey(options);

    // Verify on server and get session
    const { data, error } = await supabase.functions.invoke('auth-verify-passkey', {
      body: {
        email,
        assertion,
      },
    });

    if (error) {
      throw new Error(`Failed to authenticate with Passkey: ${error.message}`);
    }

    return data;
  }

  /**
   * List user's registered Passkeys
   */
  /**
   * List registered Passkeys
   * NOTE: auth-list-credentials Edge Function not yet deployed.
   * Credential management UI should check this before rendering.
   */
  async listCredentials(): Promise<
    Array<{
      id: string;
      name: string;
      createdAt: string;
      lastUsed?: string;
    }>
  > {
    throw new Error(
      'Passkey credential management is not yet available. ' +
      'Core login/registration flow works. Management (list/rename/delete) coming soon.'
    );
  }

  /**
   * Rename a Passkey — not yet implemented (Edge Function not deployed)
   */
  async renameCredential(_credentialId: string, _name: string): Promise<void> {
    throw new Error('Passkey rename is not yet available.');
  }

  /**
   * Delete a specific Passkey — not yet implemented (Edge Function not deployed)
   */
  async deleteCredential(_credentialId: string): Promise<void> {
    throw new Error('Passkey delete is not yet available.');
  }

  /**
   * Delete all Passkeys — not yet implemented (Edge Function not deployed)
   */
  async deleteAllCredentials(): Promise<void> {
    throw new Error('Passkey delete-all is not yet available.');
  }
}

/**
 * Create singleton instance
 */
export function createPasskeyProvider(): PasskeyProvider {
  const config: PasskeyProviderConfig = {
    rpId: new URL(window.location.origin).hostname,
    rpName: 'Selfprint',
    origin: window.location.origin,
  };

  return new PasskeyProvider(config);
}

export const passkeyProvider = createPasskeyProvider();
