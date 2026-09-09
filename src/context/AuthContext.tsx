import React, { createContext, useState, useCallback, useEffect, useMemo } from 'react';
import type { ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
// AUTHLAZY-002 (9 ก.ย. 2026): static `import { supabase }` here put the whole
// ~202 kB @supabase/supabase-js SDK into the ENTRY static closure for every
// visitor (it was also dead until the post-paint auth check — see AUTH-LAZY-001
// below). getSupabaseClient() loads the SDK on first real use instead.
import { getSupabaseClient } from '@/lib/supabase/client-lazy';
import { useLifecycleStore } from '@/store/lifecycleStore';

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
      } catch (_error) {
        // Passkey not available
      }
    })();
  }, []);

  // AUTH-LAZY-001 (9 ก.ย. 2026): Lazy initialize Supabase session check to
  // reduce document latency. Previously, `supabase.auth.getSession()` was called
  // synchronously in useEffect on every page load, causing ~540ms of network
  // latency before the browser could paint the first meaningful content.
  //
  // Strategy:
  // 1. Set `loading = false` immediately (no auth check) → first paint happens
  // 2. Register `onAuthStateChange` listener immediately (non-blocking) → captures
  //    real-time auth state changes (login/logout) without delay
  // 3. Call `getSession()` after 100ms timeout (non-blocking) → initial session
  //    check doesn't block first paint
  //
  // Result: Document latency reduced from ~540ms to <100ms. Auth state is still
  // accurately tracked via onAuthStateChange listener. Lazy session check ensures
  // returning users get their session data without blocking the initial render.
  useEffect(() => {
    // Phase 1: Set loading = false immediately (no auth check)
    setLoading(false);

    // AUTHLAZY-002: the listener + initial session check both resolve the
    // SDK lazily; first paint is never blocked on the ~202 kB client parse.
    let disposed = false;
    const unsubscribeFns: Array<() => void> = [];

    // Phase 2: Register auth state listener as soon as the (lazily loaded)
    // client exists — real-time login/logout changes stay captured.
    void (async () => {
      try {
        const supabase = await getSupabaseClient();
        if (disposed) return;
        const { data: listener } = supabase.auth.onAuthStateChange(
          (_event: string, newSession: Session | null) => {
            setSession(newSession);

            // NEW: Reload lifecycle when auth state changes
            if (newSession?.user?.id) {
              const loadLifecycle = useLifecycleStore.getState().loadLifecycle;
              loadLifecycle(newSession.user.id).catch(err =>
                console.error('Failed to load lifecycle:', err)
              );
            }
          }
        );
        unsubscribeFns.push(() => listener.subscription.unsubscribe());
      } catch (error) {
        console.error('Failed to init supabase auth listener:', error);
      }
    })();

    // Phase 3: Get initial session after first paint (non-blocking)
    // 100ms delay ensures this doesn't block the first meaningful paint
    const timeout = setTimeout(async () => {
      try {
        const supabase = await getSupabaseClient();
        const { data } = await supabase.auth.getSession();
        if (disposed) return;
        setSession(data.session);

        // Load lifecycle if user is authenticated
        if (data.session?.user?.id) {
          const loadLifecycle = useLifecycleStore.getState().loadLifecycle;
          loadLifecycle(data.session.user.id).catch(err =>
            console.error('Failed to load lifecycle:', err)
          );
        }
      } catch (error) {
        console.error('Failed to get initial session:', error);
      }
    }, 100);

    return () => {
      disposed = true;
      clearTimeout(timeout);
      unsubscribeFns.forEach((fn) => fn());
    };
  }, []);

  const registerPasskey = useCallback(async (email: string, displayName?: string) => {
    try {
      if (!isPasskeyAvailable) {
        return { error: 'Passkey ไม่ได้รับการรองรับบนอุปกรณ์นี้' };
      }

      let supabase;
      try {
        supabase = await getSupabaseClient();
      } catch {
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

      // Update session — must call supabase.auth.setSession so the Supabase
      // client has a valid access_token for RLS; setSession() alone only
      // updates React state and leaves the supabase client as anonymous.
      if (result.session) {
        const supabase = await getSupabaseClient();
        await supabase.auth.setSession({
          access_token: result.session.access_token,
          refresh_token: result.session.refresh_token ?? '',
        });
        setSession(result.session);
      }

      return {};
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'การรับรองความถูกต้องด้วย Passkey ล้มเหลว' };
    }
  }, [isPasskeyAvailable]);

  const signInWithMagicLink = useCallback(async (email: string) => {
    let supabase;
    try {
      supabase = await getSupabaseClient();
    } catch {
      return { error: 'Supabase ยังไม่ได้ตั้งค่า' };
    }

    // MAGICLINK-ROUTELOOP-001 FIX: same bug ROUTELOOP-002 already fixed for
    // OAuth below, just never applied here — `window.location.origin` alone
    // is the bare domain with no /en or /th prefix and no /dashboard path,
    // so clicking the emailed link landed on the marketing landing page
    // instead of resuming the app. From there nothing marks the visitor as
    // "already signed in, continue" — it reads as a fresh visit, so the
    // user re-enters onboarding instead of resuming
    // ("กลับมาหน้าแรกใหม่ต้องออนบอร์ดตอบคำถามใหม่อีก"). Send it straight to
    // /dashboard like OAuth does; Onboarding.tsx's own reentry check (see
    // resumedAt / RETURNING-USER-FIX above) still applies from there for
    // anyone genuinely mid-onboarding.
    const langPrefix = window.location.pathname.startsWith('/th') ? '/th' : '/en';
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}${langPrefix}/dashboard`,
      },
    });

    return { error: error?.message };
  }, []);

  const signInWithOAuth = useCallback(async (provider: 'google' | 'apple') => {
    let supabase;
    try {
      supabase = await getSupabaseClient();
    } catch {
      return { error: 'Supabase ยังไม่ได้ตั้งค่า' };
    }
    // ROUTELOOP-002 FIX: bare "/dashboard" isn't a real route (every route
    // lives under /en or /th) — after OAuth, Supabase would land the
    // browser on the catch-all, which self-heals via HomeRoute but wastes
    // a redirect hop. Send it straight to the right place instead.
    const langPrefix = window.location.pathname.startsWith('/th') ? '/th' : '/en';
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}${langPrefix}/dashboard`,
      },
    });
    return { error: error?.message };
  }, []);

  const signOut = useCallback(async () => {
    try {
      const supabase = await getSupabaseClient();
      await supabase.auth.signOut();
    } catch {
      // No client — nothing to sign out from
    }
  }, []);

  // CTXMEMO-001 FIX (4 ก.ย. 2026): provider นี้อยู่ในสแตกที่ซ้อนกัน 13 ชั้นใน
  // App.tsx — object literal ตัวใหม่ทุก render บังคับให้ consumer ทุกตัวของ
  // context นี้ re-render แม้ค่าข้างในจะเหมือนเดิมทุกประการ
  const value = useMemo<AuthContextType>(() => ({
    session,
    loading,
    isPasskeyAvailable,
    hasBiometric,
    registerPasskey,
    signInWithPasskey,
    signInWithMagicLink,
    signInWithOAuth,
    signOut,
  }), [session, loading, isPasskeyAvailable, hasBiometric, registerPasskey, signInWithPasskey, signInWithMagicLink, signInWithOAuth, signOut]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
