import React, { createContext, useState, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/services/supabase-service';

interface AuthContextType {
  session: Session | null;
  loading: boolean;
  /** Check if Passkey is available on this device */
  isPasskeyAvailable: boolean;
  /** Check if device supports biometric unlock */
  hasBiometric: boolean;
  /** Register new Passkey (WebAuthn) */
  registerPasskey: (email: string, displayName?: string) => Promise<{ error?: string }>;
  /** Sign in with Passkey — supports biometric unlock */
  signInWithPasskey: (email?: string) => Promise<{ error?: string }>;
  /** ส่ง magic link ไปที่ email — ไม่ต้องใช้ password */
  signInWithMagicLink: (email: string) => Promise<{ error?: string }>;
  /** OAuth — redirects browser; provider: 'google' | 'apple' */
  signInWithOAuth: (provider: 'google' | 'apple') => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
}

// exported (นอกจาก useAuth ปกติ) ให้ context อื่นที่ไม่อยากบังคับว่าต้องอยู่
// ใต้ AuthProvider เสมอ (เช่น HubContext/EmotionContext ที่มีเทสยืนอิสระ)
// อ่านได้แบบ optional ผ่าน useContext(AuthContext) ตรงๆ โดยไม่ throw ถ้าไม่มี provider
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPasskeyAvailable, setIsPasskeyAvailable] = useState(false);
  const [hasBiometric, setHasBiometric] = useState(false);

  // Initialize Passkey availability on mount
  useEffect(() => {
    (async () => {
      try {
        const { passkeyProvider } = await import('@/lib/auth/PasskeyProvider');
        const available = await passkeyProvider.isAvailable();
        const biometric = await passkeyProvider.isBiometricAvailable();
        setIsPasskeyAvailable(available);
        setHasBiometric(biometric);
      } catch (error) {
        // Passkey not available
      }
    })();
  }, []);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data }: { data: { session: Session | null } }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event: string, newSession: Session | null) => {
      setSession(newSession);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const registerPasskey = useCallback(async (email: string, displayName?: string) => {
    try {
      if (!isPasskeyAvailable) {
        return { error: 'Passkey ไม่ได้รับการรองรับบนอุปกรณ์นี้' };
      }

      if (!supabase) {
        return { error: 'Supabase ยังไม่ได้ตั้งค่า' };
      }

      const { passkeyProvider } = await import('@/lib/auth/PasskeyProvider');

      // Step 1: Get registration options
      const options = await passkeyProvider.getRegistrationOptions(email);

      // Step 2: Create credential and register
      await passkeyProvider.registerPasskey(email, options, displayName);

      // Update session if needed
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        setSession(data.session);
      }

      return {};
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'ลงทะเบียน Passkey ล้มเหลว' };
    }
  }, [isPasskeyAvailable]);

  const signInWithPasskey = useCallback(async (email?: string) => {
    try {
      if (!isPasskeyAvailable) {
        return { error: 'Passkey ไม่ได้รับการรองรับบนอุปกรณ์นี้' };
      }

      const { passkeyProvider } = await import('@/lib/auth/PasskeyProvider');

      // Authenticate with Passkey (includes biometric prompt if available)
      const result = await passkeyProvider.authenticatePasskey(email);

      // Update session
      if (result.session) {
        setSession(result.session);
      }

      return {};
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'การรับรองความถูกต้องด้วย Passkey ล้มเหลว' };
    }
  }, [isPasskeyAvailable]);

  const signInWithMagicLink = useCallback(async (email: string) => {
    if (!supabase) {
      return { error: 'Supabase ยังไม่ได้ตั้งค่า' };
    }

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin,
      },
    });

    return { error: error?.message };
  }, []);

  const signInWithOAuth = useCallback(async (provider: 'google' | 'apple') => {
    if (!supabase) {
      return { error: 'Supabase ยังไม่ได้ตั้งค่า' };
    }
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });
    return { error: error?.message };
  }, []);

  const signOut = useCallback(async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
  }, []);

  const value: AuthContextType = {
    session,
    loading,
    isPasskeyAvailable,
    hasBiometric,
    registerPasskey,
    signInWithPasskey,
    signInWithMagicLink,
    signInWithOAuth,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
