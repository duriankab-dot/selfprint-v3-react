/**
 * Passkey Login Component
 * Handles Passkey authentication with biometric support
 * @component
 */

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/primitives/Button';
import { Input } from '@/components/primitives/Input';
import styles from './PasskeyLogin.module.css';

interface PasskeyLoginProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function PasskeyLogin({ onSuccess, onError }: PasskeyLoginProps) {
  const { isPasskeyAvailable, hasBiometric, signInWithPasskey } = useAuth();
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
        <p>🔑 Passkey ไม่ได้รับการรองรับบนอุปกรณ์นี้</p>
        <p className={styles.hint}>ลองใช้ Google, Apple, หรือ Magic Link แทน</p>
      </div>
    );
  }

  return (
    <form onSubmit={handlePasskeyLogin} className={styles.form}>
      <div className={styles.header}>
        <h2>🔑 {hasBiometric ? 'ลงชื่อเข้าใช้ด้วย Passkey' : 'ลงชื่อเข้าใช้'}</h2>
        {hasBiometric && <p className={styles.subheader}>ใช้ Face ID, Touch ID, หรือ Windows Hello</p>}
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
            กำลังตรวจสอบ...
          </>
        ) : hasBiometric ? (
          <>
            <span>🔓</span>
            ลงชื่อเข้าใช้ด้วย Passkey
          </>
        ) : (
          <>
            <span>🔑</span>
            ลงชื่อเข้าใช้
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
          <p>💡 Passkey ของคุณจะถูกปลดล็อกโดยใช้ชีวมิติของอุปกรณ์นี้</p>
        </div>
      )}
    </form>
  );
}
