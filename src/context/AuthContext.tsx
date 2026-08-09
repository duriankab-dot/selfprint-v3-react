import React, { createContext, useState, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/services/supabase-service';

interface AuthContextType {
  session: Session | null;
  loading: boolean;
  /** ส่ง magic link ไปที่ email — ไม่ต้องใช้ password */
  signInWithMagicLink: (email: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
}

// exported (นอกจาก useAuth ปกติ) ให้ context อื่นที่ไม่อยากบังคับว่าต้องอยู่
// ใต้ AuthProvider เสมอ (เช่น HubContext/EmotionContext ที่มีเทสยืนอิสระ)
// อ่านได้แบบ optional ผ่าน useContext(AuthContext) ตรงๆ โดยไม่ throw ถ้าไม่มี provider
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

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

  const signOut = useCallback(async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
  }, []);

  const value: AuthContextType = { session, loading, signInWithMagicLink, signOut };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
