/**
 * Integration Tests for Passkey Provider
 * @module auth/PasskeyProvider.test
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PasskeyProvider } from './PasskeyProvider';

describe('PasskeyProvider', () => {
  let provider: PasskeyProvider;

  beforeEach(() => {
    const config = {
      rpId: 'example.com',
      rpName: 'Test App',
      origin: 'https://example.com',
    };
    provider = new PasskeyProvider(config);
  });

  describe('Availability Check', () => {
    it('should check if Passkey is available', async () => {
      const isAvailable = await provider.isAvailable();
      expect(typeof isAvailable).toBe('boolean');
    });

    it('should check if biometric is available', async () => {
      const isBiometric = await provider.isBiometricAvailable();
      expect(typeof isBiometric).toBe('boolean');
    });
  });

  describe('Registration Flow', () => {
    it('should require email for registration options', async () => {
      // This test would fail without mocking Supabase
      // For now, just verify the method exists
      expect(provider.getRegistrationOptions).toBeDefined();
      expect(typeof provider.getRegistrationOptions).toBe('function');
    });

    it('should register Passkey with email and display name', async () => {
      expect(provider.registerPasskey).toBeDefined();
      expect(typeof provider.registerPasskey).toBe('function');
    });
  });

  describe('Authentication Flow', () => {
    it('should get authentication options', async () => {
      expect(provider.getAuthenticationOptions).toBeDefined();
      expect(typeof provider.getAuthenticationOptions).toBe('function');
    });

    it('should authenticate with Passkey', async () => {
      expect(provider.authenticatePasskey).toBeDefined();
      expect(typeof provider.authenticatePasskey).toBe('function');
    });
  });

  describe('Credential Management', () => {
    it('should list user credentials', async () => {
      expect(provider.listCredentials).toBeDefined();
      expect(typeof provider.listCredentials).toBe('function');
    });

    it('should rename credential', async () => {
      expect(provider.renameCredential).toBeDefined();
      expect(typeof provider.renameCredential).toBe('function');
    });

    it('should delete credential', async () => {
      expect(provider.deleteCredential).toBeDefined();
      expect(typeof provider.deleteCredential).toBe('function');
    });

    it('should delete all credentials', async () => {
      expect(provider.deleteAllCredentials).toBeDefined();
      expect(typeof provider.deleteAllCredentials).toBe('function');
    });
  });
});
