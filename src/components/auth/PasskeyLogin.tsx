/**
 * Passkey Login Component
 * Handles Passkey authentication with biometric support
 * @component
 */

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/primitives/Button';
import { Input } from '@/components/primitives/Input';
import styles from './PasskeyLogin.module.css';

interface PasskeyLoginProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function PasskeyLogin({ onSuccess, onError }: PasskeyLoginProps) {
  const { isPasskeyAvailable, hasBiometric, signInWithPasskey } = useAuth();
  const { language } = useLanguage();
  const isTh = language === 'th';
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>();

  const handlePasskeyLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(undefined);

    try {
      const result = await signInWithPasskey(email || undefined);

      if (result.error) {
        const errorMsg = result.error;
        setError(errorMsg);
        onError?.(errorMsg);
      } else {
        onSuccess?.();
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isPasskeyAvailable) {
    return (
      <div className={styles.unavailable}>
        <p>{isTh ? '🔑 Passkey ไม่ได้รับการรองรับบนอุปกรณ์นี้' : '🔑 Passkey is not supported on this device'}</p>
        <p className={styles.hint}>{isTh ? 'ลองใช้ Google, Apple, หรือ Magic Link แทน' : 'Try Google, Apple, or a Magic Link instead'}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handlePasskeyLogin} className={styles.form}>
      <div className={styles.header}>
        <h2>🔑 {hasBiometric ? (isTh ? 'ลงชื่อเข้าใช้ด้วย Passkey' : 'Sign in with Passkey') : (isTh ? 'ลงชื่อเข้าใช้' : 'Sign in')}</h2>
        {hasBiometric && <p className={styles.subheader}>{isTh ? 'ใช้ Face ID, Touch ID, หรือ Windows Hello' : 'Use Face ID, Touch ID, or Windows Hello'}</p>}
      </div>

      {!hasBiometric && (
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
          className={styles.input}
          autoComplete="email"
          required={!hasBiometric}
        />
      )}

      <Button
        type="submit"
        disabled={isLoading || (!hasBiometric && !email)}
        className={styles.button}
        variant="primary"
      >
        {isLoading ? (
          <>
            <span className={styles.spinner}>⏳</span>
            {isTh ? 'กำลังตรวจสอบ...' : 'Verifying...'}
          </>
        ) : hasBiometric ? (
          <>
            <span>🔓</span>
            {isTh ? 'ลงชื่อเข้าใช้ด้วย Passkey' : 'Sign in with Passkey'}
          </>
        ) : (
          <>
            <span>🔑</span>
            {isTh ? 'ลงชื่อเข้าใช้' : 'Sign in'}
          </>
        )}
      </Button>

      {error && (
        <div className={styles.error} role="alert">
          {error}
        </div>
      )}

      {hasBiometric && (
        <div className={styles.info}>
          <p>{isTh ? '💡 Passkey ของคุณจะถูกปลดล็อกโดยใช้ชีวมิติของอุปกรณ์นี้' : '💡 Your Passkey unlocks using this device\'s biometrics'}</p>
        </div>
      )}
    </form>
  );
}
