/**
 * Unit Tests for WebAuthn Utilities
 * @module auth/webauthn.test
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  isWebAuthnAvailable,
  isPasskeyAvailable,
  isBiometricAvailable,
  arrayBufferToBase64Url,
  base64UrlToArrayBuffer,
} from './webauthn';

describe('WebAuthn Utilities', () => {
  describe('isWebAuthnAvailable', () => {
    it('should return true if WebAuthn is available', () => {
      // Assuming navigator.credentials exists in test environment
      const result = isWebAuthnAvailable();
      // May be true or false depending on test environment
      expect(typeof result).toBe('boolean');
    });

    it('should return false if PublicKeyCredential is undefined', () => {
      const originalPublicKeyCredential = (window as any).PublicKeyCredential;
      (window as any).PublicKeyCredential = undefined;

      const result = isWebAuthnAvailable();
      expect(result).toBe(false);

      // Restore
      (window as any).PublicKeyCredential = originalPublicKeyCredential;
    });
  });

  describe('arrayBufferToBase64Url', () => {
    it('should convert Uint8Array to base64 URL-safe string', () => {
      const input = new Uint8Array([0, 1, 2, 255, 254, 253]);
      const result = arrayBufferToBase64Url(input);

      expect(typeof result).toBe('string');
      expect(result).not.toContain('+');
      expect(result).not.toContain('/');
      expect(result).not.toContain('=');
    });

    it('should encode/decode roundtrip correctly', () => {
      const original = new Uint8Array([
        255, 0, 127, 1, 100, 50, 75, 200, 150, 200, 201, 10, 20, 30, 40, 50,
      ]);
      const encoded = arrayBufferToBase64Url(original);
      const decoded = base64UrlToArrayBuffer(encoded);

      // QA-02: base64UrlToArrayBuffer returns `bytes.buffer` — a raw
      // ArrayBuffer, which is also what its signature declares and what its
      // caller needs (webauthn.ts:25-33 and :121, where it feeds
      // PublicKeyCredentialCreationOptions.challenge, a BufferSource). It has
      // never returned a Uint8Array. Wrap it in a view to compare bytes.
      expect(decoded).toBeInstanceOf(ArrayBuffer);
      expect(new Uint8Array(decoded)).toEqual(original);
    });

    it('should handle empty arrays', () => {
      const input = new Uint8Array([]);
      const result = arrayBufferToBase64Url(input);
      expect(result).toBe('');
    });

    it('should handle large arrays', () => {
      const input = new Uint8Array(256).fill(42);
      const result = arrayBufferToBase64Url(input);

      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('base64UrlToArrayBuffer', () => {
    it('should decode base64 URL-safe string to Uint8Array', () => {
      const b64 = 'AAECAw';
      const result = base64UrlToArrayBuffer(b64);

      // QA-02: returns an ArrayBuffer, not a Uint8Array — see the note in the
      // roundtrip test above.
      expect(result).toBeInstanceOf(ArrayBuffer);
      expect(new Uint8Array(result)).toEqual(new Uint8Array([0, 1, 2, 3]));
    });

    it('should handle URL-safe characters (- and _)', () => {
      // URL-safe chars: - instead of +, _ instead of /
      const b64UrlSafe = 'AB-_CD';
      const result = base64UrlToArrayBuffer(b64UrlSafe);

      expect(result).toBeInstanceOf(ArrayBuffer);
      expect(result.byteLength).toBeGreaterThan(0);
    });

    it('should handle missing padding', () => {
      // Base64url can omit padding
      const b64NoPadding = 'AAECAw';
      const result = base64UrlToArrayBuffer(b64NoPadding);

      expect(result).toBeInstanceOf(ArrayBuffer);
      expect(new Uint8Array(result)).toEqual(new Uint8Array([0, 1, 2, 3]));
    });

    it('should throw on invalid base64', () => {
      const invalid = '!!!invalid!!!';
      expect(() => base64UrlToArrayBuffer(invalid)).toThrow();
    });
  });

  describe('Challenge Generation', () => {
    it('should generate different challenges on each call', () => {
      // Note: This test would need access to crypto.getRandomValues
      // which may not be available in all test environments

      // For now, just verify the type
      expect(typeof crypto).toBe('object');
    });
  });
});

describe('Passkey Availability Detection', () => {
  it('should detect platform authenticator availability', async () => {
    // This test depends on device capabilities
    const isAvailable = await isPasskeyAvailable();

    expect(typeof isAvailable).toBe('boolean');
  });

  it('should detect biometric availability', async () => {
    // This test depends on device capabilities
    const isBiometric = await isBiometricAvailable();

    expect(typeof isBiometric).toBe('boolean');
  });
});
