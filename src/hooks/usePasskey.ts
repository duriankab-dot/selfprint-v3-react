/**
 * usePasskey hook
 * Manages Passkey registration and authentication
 * @module hooks/usePasskey
 */

import { useState, useCallback, useEffect } from 'react';
import { passkeyProvider } from '@/lib/auth/PasskeyProvider';

export interface UsePasskeyState {
  isAvailable: boolean;
  isBiometricAvailable: boolean;
  isRegistering: boolean;
  isAuthenticating: boolean;
  registrationError?: string;
  authenticationError?: string;
}

export interface UsePasskeyActions {
  checkAvailability: () => Promise<void>;
  startRegistration: (email: string, displayName?: string) => Promise<void>;
  authenticate: (email?: string) => Promise<void>;
  listCredentials: () => Promise<Array<{ id: string; name: string; createdAt: string }>>;
  renameCredential: (credentialId: string, name: string) => Promise<void>;
  deleteCredential: (credentialId: string) => Promise<void>;
  deleteAllCredentials: () => Promise<void>;
}

/**
 * Hook for Passkey registration and authentication
 */
export function usePasskey(): UsePasskeyState & UsePasskeyActions {
  const [isAvailable, setIsAvailable] = useState(false);
  const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [registrationError, setRegistrationError] = useState<string>();
  const [authenticationError, setAuthenticationError] = useState<string>();

  const checkAvailability = useCallback(async () => {
    try {
      const available = await passkeyProvider.isAvailable();
      const biometricAvailable = await passkeyProvider.isBiometricAvailable();

      setIsAvailable(available);
      setIsBiometricAvailable(biometricAvailable);
    } catch (error) {
      console.error('Error checking Passkey availability:', error);
    }
  }, []);

  // Check availability on mount
  useEffect(() => {
    checkAvailability();
  }, [checkAvailability]);

  const startRegistration = useCallback(
    async (email: string, displayName?: string) => {
      setIsRegistering(true);
      setRegistrationError(undefined);

      try {
        // Step 1: Get registration options from server
        const options = await passkeyProvider.getRegistrationOptions(email);

        // Step 2: Create credential and register
        await passkeyProvider.registerPasskey(email, options, displayName);

        // Success — caller should handle session/redirect
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Registration failed';
        setRegistrationError(message);
        throw error;
      } finally {
        setIsRegistering(false);
      }
    },
    []
  );

  const authenticate = useCallback(async (email?: string) => {
    setIsAuthenticating(true);
    setAuthenticationError(undefined);

    try {
      // Step 1: Get auth options
      // Step 2: Authenticate and get session
      await passkeyProvider.authenticatePasskey(email);

      // Success — caller should handle session/redirect
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Authentication failed';
      setAuthenticationError(message);
      throw error;
    } finally {
      setIsAuthenticating(false);
    }
  }, []);

  const listCredentials = useCallback(async () => {
    try {
      return await passkeyProvider.listCredentials();
    } catch (error) {
      console.error('Error listing credentials:', error);
      return [];
    }
  }, []);

  const renameCredential = useCallback(async (credentialId: string, name: string) => {
    try {
      await passkeyProvider.renameCredential(credentialId, name);
    } catch (error) {
      console.error('Error renaming credential:', error);
      throw error;
    }
  }, []);

  const deleteCredential = useCallback(async (credentialId: string) => {
    try {
      await passkeyProvider.deleteCredential(credentialId);
    } catch (error) {
      console.error('Error deleting credential:', error);
      throw error;
    }
  }, []);

  const deleteAllCredentials = useCallback(async () => {
    try {
      await passkeyProvider.deleteAllCredentials();
    } catch (error) {
      console.error('Error deleting all credentials:', error);
      throw error;
    }
  }, []);

  return {
    isAvailable,
    isBiometricAvailable,
    isRegistering,
    isAuthenticating,
    registrationError,
    authenticationError,
    checkAvailability,
    startRegistration,
    authenticate,
    listCredentials,
    renameCredential,
    deleteCredential,
    deleteAllCredentials,
  };
}
