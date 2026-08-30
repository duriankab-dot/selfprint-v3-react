/**
 * ClaimAccount.tsx
 *
 * ขั้นตอนสุดท้ายของ onboarding — ให้ผู้ใช้ใส่อีเมลเพื่อรับ magic link
 * แล้วบันทึกผล AI Twin (profile + blueprint) ที่เก็บระหว่าง onboarding
 * ไว้จริงใน Supabase แทนที่จะหายไปตอนปิด browser
 *
 * ข้อมูลที่เก็บมาระหว่าง onboarding จะถูกเก็บไว้ใน localStorage
 * (`pending_onboarding_save`) แล้วบันทึกจริงหลัง login สำเร็จ
 * ผ่าน <PendingOnboardingSaver /> (ดู src/components/PendingOnboardingSaver.tsx)
 */

import { useRef, useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';

// ─── Icon SVGs (inline, no deps) ─────────────────────────────────────────────
const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/>
    <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
    <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05"/>
    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335"/>
  </svg>
);

const AppleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M12.63 9.37c-.02-2.04 1.67-3.02 1.74-3.07-0.95-1.38-2.42-1.57-2.94-1.59-1.26-.13-2.46.74-3.1.74-.64 0-1.63-.72-2.68-.7-1.38.02-2.66.8-3.37 2.04-1.44 2.49-.37 6.18 1.03 8.2.69 1 1.5 2.12 2.57 2.08 1.03-.04 1.42-.67 2.67-.67 1.25 0 1.6.67 2.7.65 1.11-.02 1.81-.99 2.48-2 .79-1.14 1.11-2.25 1.13-2.31-.03-.01-2.18-.84-2.23-3.37ZM10.55 3.3c.57-.69.95-1.65.84-2.6-.82.03-1.8.54-2.38 1.22-.52.6-.98 1.57-.86 2.5.91.07 1.84-.46 2.4-1.12Z"/>
  </svg>
);

export interface PendingOnboardingData {
  profile: {
    dateOfBirth?: string;
    timeOfBirth?: string;
    placeOfBirth?: string;
    initialMood?: string;
  };
  blueprint: {
    accuracyLevel: number;
    decisionStyle?: string;
    strengths?: string[];
    insights?: string[];
    opportunities?: string[];
    blindSpots?: string[];
    prototypeCore?: string;
    source?: 'initial' | 'refined';
  };
}

interface ClaimAccountProps {
  data: PendingOnboardingData;
  onDone: () => void;
}

export function ClaimAccount({ data, onDone }: ClaimAccountProps) {
  const { language } = useLanguage();
  const isTh = language === 'th';
  const { session, signInWithMagicLink, signInWithOAuth } = useAuth();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<'google' | 'apple' | null>(null);
  const [resendCountdown, setResendCountdown] = useState(0);

  // ONBOARDING-LOOP-001: guards against calling onDone() more than once —
  // `session` can get a new object reference (e.g. on a token-refresh tick)
  // and re-trigger this render-time branch while onDone() (now an async,
  // retrying lifecycle write — see Onboarding.tsx) is still in flight from
  // the first call, which would fire a redundant concurrent write.
  const hasCalledOnDone = useRef(false);

  // HOOKS-RULE: useEffect must be declared before any early return so React
  // always calls Hooks in the same order. Previously this was declared after
  // `if (session) { return null }` — a rules-of-hooks violation.
  useEffect(() => {
    if (resendCountdown <= 0) return;
    const timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCountdown]);

  // ถ้า login อยู่แล้ว (กลับมาทำ onboarding ซ้ำ) ไม่ต้องถามอีเมลอีก
  if (session) {
    if (!hasCalledOnDone.current) {
      hasCalledOnDone.current = true;
      localStorage.setItem('pending_onboarding_save', JSON.stringify(data));
      onDone();
    }
    return null;
  }

  const handleOAuth = async (provider: 'google' | 'apple') => {
    setOauthLoading(provider);
    setError(null);
    // บันทึก pending data ก่อน redirect
    localStorage.setItem('pending_onboarding_save', JSON.stringify(data));
    const result = await signInWithOAuth(provider);
    if (result.error) {
      setError(result.error);
      setOauthLoading(null);
    }
    // ถ้าสำเร็จ browser จะ redirect ไป /dashboard — ไม่ต้อง setLoading(false)
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setSubmitting(true);
    setError(null);

    localStorage.setItem('pending_onboarding_save', JSON.stringify(data));

    const result = await signInWithMagicLink(email.trim());
    setSubmitting(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    setSent(true);
    setResendCountdown(60); // 60-second cooldown
  };

  // Handle resend email
  const handleResend = async () => {
    if (resendCountdown > 0 || !email.trim()) return;

    setSubmitting(true);
    setError(null);

    const result = await signInWithMagicLink(email.trim());
    setSubmitting(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    setResendCountdown(60);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 24px',
      }}
    >
      <div style={{ maxWidth: '440px', width: '100%', textAlign: 'center' }}>
        {sent ? (
          <>
            <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '12px' }}>
              {isTh ? 'เช็คอีเมลของคุณ 📬' : 'Check your email 📬'}
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
              {isTh ? (
                <>
                  เราส่งลิงก์เข้าสู่ระบบไปที่ <strong>{email}</strong> แล้ว
                  คลิกลิงก์ในอีเมลเพื่อบันทึก AI Twin ของคุณไว้ถาวร
                </>
              ) : (
                <>
                  We sent a sign-in link to <strong>{email}</strong>.
                  Click the link in the email to save your AI Twin permanently.
                </>
              )}
            </p>
            {error && (
              <p style={{ color: '#E24B4A', fontSize: '13px', marginBottom: '12px' }}>{error}</p>
            )}
            <button
              onClick={() => handleResend()}
              disabled={resendCountdown > 0 || submitting}
              style={{
                marginTop: '16px',
                padding: '10px 24px',
                borderRadius: '8px',
                border: '2px solid var(--color-accent-primary)',
                background: 'transparent',
                color: resendCountdown > 0 ? 'var(--color-text-secondary)' : 'var(--color-accent-primary)',
                fontWeight: 600,
                cursor: resendCountdown > 0 ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                opacity: resendCountdown > 0 ? 0.5 : 1,
              }}
            >
              {isTh
                ? submitting
                  ? 'กำลังส่ง...'
                  : resendCountdown > 0
                    ? `ส่งใหม่ใน ${resendCountdown}s`
                    : 'ส่งลิงก์ใหม่'
                : submitting
                  ? 'Sending...'
                  : resendCountdown > 0
                    ? `Resend in ${resendCountdown}s`
                    : 'Resend link'}
            </button>
            <button
              onClick={onDone}
              style={{
                marginTop: '12px',
                display: 'block',
                width: '100%',
                padding: '10px 24px',
                borderRadius: '8px',
                border: '2px solid var(--color-border)',
                background: 'transparent',
                color: 'var(--color-text-primary)',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: '14px',
              }}
            >
              {isTh ? 'ไปต่อก่อน (บันทึกอัตโนมัติเมื่อคลิกลิงก์)' : 'Continue for now (saves automatically once you click the link)'}
            </button>
          </>
        ) : (
          <>
            <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '12px' }}>
              {isTh ? 'บันทึก AI Twin ของคุณไว้ 💾' : 'Save your AI Twin 💾'}
            </h2>
            <p
              style={{
                fontSize: '14px',
                color: 'var(--color-text-secondary)',
                lineHeight: 1.6,
                marginBottom: '24px',
              }}
            >
              {isTh
                ? 'ใส่อีเมลเพื่อรับลิงก์เข้าสู่ระบบ ไม่ต้องตั้งรหัสผ่าน — กลับมาใช้ AI Twin นี้ได้อีกทุกครั้งที่ต้องการ'
                : "Enter your email to get a sign-in link — no password needed. Come back to this AI Twin anytime."}
            </p>
            {/* ── OAuth Buttons ─────────────────────────────────────────── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
              <button
                type="button"
                disabled={!!oauthLoading}
                onClick={() => handleOAuth('google')}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                  width: '100%', padding: '11px 16px', borderRadius: '8px',
                  border: '2px solid var(--color-border)',
                  background: 'var(--color-bg-secondary, #fff)',
                  color: 'var(--color-text-primary)', fontWeight: 600,
                  cursor: oauthLoading ? 'not-allowed' : 'pointer',
                  fontSize: '14px', opacity: oauthLoading && oauthLoading !== 'google' ? 0.5 : 1,
                  transition: 'opacity 0.2s',
                }}
              >
                <GoogleIcon />
                {oauthLoading === 'google'
                  ? (isTh ? 'กำลังเข้าสู่ระบบ...' : 'Signing in...')
                  : (isTh ? 'เข้าสู่ระบบด้วย Google' : 'Continue with Google')}
              </button>
              <button
                type="button"
                disabled={!!oauthLoading}
                onClick={() => handleOAuth('apple')}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                  width: '100%', padding: '11px 16px', borderRadius: '8px',
                  border: '2px solid var(--color-border)',
                  background: 'var(--color-bg-secondary, #000)',
                  color: '#fff', fontWeight: 600,
                  cursor: oauthLoading ? 'not-allowed' : 'pointer',
                  fontSize: '14px', opacity: oauthLoading && oauthLoading !== 'apple' ? 0.5 : 1,
                  transition: 'opacity 0.2s',
                }}
              >
                <AppleIcon />
                {oauthLoading === 'apple'
                  ? (isTh ? 'กำลังเข้าสู่ระบบ...' : 'Signing in...')
                  : (isTh ? 'เข้าสู่ระบบด้วย Apple' : 'Continue with Apple')}
              </button>
            </div>

            {/* ── Divider ────────────────────────────────────────────────── */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div style={{ flex: 1, height: '1px', background: 'var(--color-border)' }} />
              <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', whiteSpace: 'nowrap' }}>
                {isTh ? 'หรือใช้ Magic Link' : 'Or use a Magic Link'}
              </span>
              <div style={{ flex: 1, height: '1px', background: 'var(--color-border)' }} />
            </div>

            <form onSubmit={handleSubmit}>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: '2px solid var(--color-border)',
                  fontSize: '14px',
                  marginBottom: '12px',
                  background: 'var(--color-bg-primary)',
                  color: 'var(--color-text-primary)',
                }}
              />
              {error && (
                <p style={{ color: '#E24B4A', fontSize: '13px', marginBottom: '12px' }}>{error}</p>
              )}
              <button
                type="submit"
                disabled={submitting}
                style={{
                  width: '100%',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'var(--color-accent-primary)',
                  color: 'white',
                  fontWeight: 600,
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  fontSize: '15px',
                  opacity: submitting ? 0.7 : 1,
                }}
              >
                {isTh ? (submitting ? 'กำลังส่ง...' : 'ส่งลิงก์เข้าสู่ระบบ') : (submitting ? 'Sending...' : 'Send sign-in link')}
              </button>
            </form>
            <button
              onClick={onDone}
              style={{
                marginTop: '16px',
                background: 'none',
                border: 'none',
                color: 'var(--color-text-secondary)',
                fontSize: '13px',
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              {isTh ? 'ข้ามไปก่อน (ผลลัพธ์จะไม่ถูกบันทึก)' : 'Skip for now (results won\'t be saved)'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default ClaimAccount;
