/**
 * Login.tsx
 *
 * Master Direction §34 — Passkey (WebAuthn) + OAuth + Magic Link
 *
 * หน้า Login สำหรับผู้ใช้ที่มีบัญชีอยู่แล้ว (กลับมา)
 * ลำดับการแสดงผล:
 *  1. Passkey (ถ้าอุปกรณ์รองรับ)
 *  2. Google OAuth
 *  3. Apple OAuth
 *  4. Magic Link (email)
 *  5. ลิงก์ไป /onboarding ถ้าเพิ่งเริ่มใช้งาน
 *
 * กฎ:
 *  - CSS ใช้ var(--...) เท่านั้น — ห้าม hardcode สี
 *  - userId มาจาก useAuth().session?.user?.id เท่านั้น
 *  - ถ้า Passkey ไม่พร้อม → ซ่อน Passkey section, แสดง fallback
 *  - หลัง login สำเร็จ → redirect ไป /dashboard
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLangNavigate as useNavigate } from '../hooks/useLangNavigate';
import { useAuth } from '@/context/AuthContext';
import { PasskeyLogin } from '@/components/auth/PasskeyLogin';

// ─── Icon SVGs (inline, zero deps) ───────────────────────────────────────────

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/>
    <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
    <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05"/>
    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335"/>
  </svg>
);

const AppleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M12.63 9.37c-.02-2.04 1.67-3.02 1.74-3.07-.95-1.38-2.42-1.57-2.94-1.59-1.26-.13-2.46.74-3.1.74-.64 0-1.63-.72-2.68-.7-1.38.02-2.66.8-3.37 2.04-1.44 2.49-.37 6.18 1.03 8.2.69 1 1.5 2.12 2.57 2.08 1.03-.04 1.42-.67 2.67-.67 1.25 0 1.6.67 2.7.65 1.11-.02 1.81-.99 2.48-2 .79-1.14 1.11-2.25 1.13-2.31-.03-.01-2.18-.84-2.23-3.37ZM10.55 3.3c.57-.69.95-1.65.84-2.6-.82.03-1.8.54-2.38 1.22-.52.6-.98 1.57-.86 2.5.91.07 1.84-.46 2.4-1.12Z"/>
  </svg>
);

const PasskeyIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="8" cy="15" r="4"/>
    <path d="M15 7l-6 6"/>
    <path d="M20 2l-5 5"/>
    <path d="M15 2l5 5"/>
  </svg>
);

// ─── Component ────────────────────────────────────────────────────────────────

export default function Login() {
  const navigate = useNavigate();
  const { session, isPasskeyAvailable, hasBiometric, signInWithOAuth, signInWithMagicLink } = useAuth();

  const [email, setEmail]           = useState('');
  const [magicSent, setMagicSent]   = useState(false);
  const [error, setError]           = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<'google' | 'apple' | null>(null);
  const [showPasskey, setShowPasskey] = useState(false);

  // ถ้า login อยู่แล้ว → redirect ไป dashboard ทันที
  useEffect(() => {
    if (session) {
      navigate('/dashboard', { replace: true });
    }
  }, [session, navigate]);

  // ─── Handlers ───────────────────────────────────────────────────────────────

  const handleOAuth = async (provider: 'google' | 'apple') => {
    setOauthLoading(provider);
    setError(null);
    const result = await signInWithOAuth(provider);
    if (result.error) {
      setError(result.error);
      setOauthLoading(null);
    }
    // ถ้าสำเร็จ browser จะ redirect — ไม่ต้อง setLoading(false)
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitting(true);
    setError(null);
    const result = await signInWithMagicLink(email.trim());
    setSubmitting(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setMagicSent(true);
  };

  const handlePasskeySuccess = () => {
    navigate('/dashboard', { replace: true });
  };

  // ─── Styles (all via CSS vars) ───────────────────────────────────────────────

  const container: React.CSSProperties = {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '48px 24px',
    background: 'var(--color-bg-primary)',
  };

  const card: React.CSSProperties = {
    maxWidth: '440px',
    width: '100%',
    textAlign: 'center',
  };

  const heading: React.CSSProperties = {
    fontSize: '28px',
    fontWeight: 700,
    marginBottom: '8px',
    color: 'var(--color-text-primary)',
  };

  const subtext: React.CSSProperties = {
    fontSize: '14px',
    color: 'var(--color-text-secondary)',
    lineHeight: 1.6,
    marginBottom: '32px',
  };

  const oauthBtn = (disabled: boolean): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    width: '100%',
    padding: '11px 16px',
    borderRadius: '10px',
    border: '1.5px solid var(--color-border)',
    background: 'var(--color-bg-secondary)',
    color: 'var(--color-text-primary)',
    fontWeight: 600,
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontSize: '14px',
    opacity: disabled ? 0.5 : 1,
    transition: 'opacity 0.2s, transform 0.1s',
  });

  const divider: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    margin: '20px 0',
  };

  const dividerLine: React.CSSProperties = {
    flex: 1,
    height: '1px',
    background: 'var(--color-border)',
  };

  const dividerText: React.CSSProperties = {
    fontSize: '12px',
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 16px',
    borderRadius: '10px',
    border: '1.5px solid var(--color-border)',
    fontSize: '15px',
    marginBottom: '12px',
    background: 'var(--color-bg-primary)',
    color: 'var(--color-text-primary)',
    boxSizing: 'border-box',
  };

  const primaryBtn = (disabled: boolean): React.CSSProperties => ({
    width: '100%',
    padding: '12px 24px',
    borderRadius: '10px',
    border: 'none',
    background: 'var(--color-accent-primary)',
    color: 'var(--color-bg-primary)',
    fontWeight: 700,
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontSize: '15px',
    opacity: disabled ? 0.7 : 1,
    transition: 'opacity 0.2s',
  });

  const passkeyToggleBtn: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    width: '100%',
    padding: '11px 16px',
    borderRadius: '10px',
    border: '1.5px solid var(--color-accent-primary)',
    background: 'transparent',
    color: 'var(--color-accent-primary)',
    fontWeight: 600,
    cursor: 'pointer',
    fontSize: '14px',
    marginBottom: '12px',
    transition: 'background 0.2s',
  };

  const errorStyle: React.CSSProperties = {
    color: 'var(--color-error, #E24B4A)',
    fontSize: '13px',
    marginBottom: '12px',
    textAlign: 'left',
  };

  const footerLink: React.CSSProperties = {
    marginTop: '32px',
    fontSize: '13px',
    color: 'var(--color-text-secondary)',
  };

  // ─── Render ───────────────────────────────────────────────────────────────────

  return (
    <div style={container}>
      <div style={card}>

        {/* Logo / Brand */}
        <div style={{ marginBottom: '24px' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: 'var(--color-accent-primary)',
              margin: '0 auto 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '28px',
            }}
          >
            ✦
          </div>
          <h1 style={heading}>กลับสู่ Selfprint</h1>
          <p style={subtext}>
            เข้าสู่ระบบเพื่อดู AI ฝาแฝด ของคุณ
          </p>
        </div>

        {/* ── Magic Sent Confirmation ───────────────────────────────────────── */}
        {magicSent ? (
          <div style={{ padding: '24px', borderRadius: '12px', border: '1.5px solid var(--color-border)', background: 'var(--color-bg-secondary)' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>📬</div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px', color: 'var(--color-text-primary)' }}>
              เช็คอีเมลของคุณ
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
              ส่งลิงก์เข้าสู่ระบบไปที่ <strong>{email}</strong> แล้ว<br />
              คลิกลิงก์ในอีเมลเพื่อเข้าสู่ระบบโดยอัตโนมัติ
            </p>
            <button
              onClick={() => setMagicSent(false)}
              style={{ marginTop: '16px', background: 'none', border: 'none', color: 'var(--color-text-secondary)', fontSize: '13px', cursor: 'pointer', textDecoration: 'underline' }}
            >
              ใช้วิธีอื่น
            </button>
          </div>
        ) : (
          <>
            {/* ── Passkey Section (if available) ───────────────────────────── */}
            {isPasskeyAvailable && (
              <>
                {showPasskey ? (
                  <div style={{ marginBottom: '16px', padding: '20px', borderRadius: '12px', border: '1.5px solid var(--color-border)', background: 'var(--color-bg-secondary)', textAlign: 'left' }}>
                    <PasskeyLogin onSuccess={handlePasskeySuccess} />
                    <button
                      onClick={() => setShowPasskey(false)}
                      style={{ marginTop: '12px', background: 'none', border: 'none', color: 'var(--color-text-secondary)', fontSize: '13px', cursor: 'pointer', textDecoration: 'underline', display: 'block', width: '100%', textAlign: 'center' }}
                    >
                      ← ใช้วิธีอื่น
                    </button>
                  </div>
                ) : (
                  <button
                    style={passkeyToggleBtn}
                    onClick={() => setShowPasskey(true)}
                  >
                    <PasskeyIcon />
                    {hasBiometric ? '🔓 ล๊อกอินด้วย Face ID / Biometric' : '🔑 ล๊อกอินด้วย Passkey'}
                  </button>
                )}

                {!showPasskey && (
                  <div style={divider}>
                    <div style={dividerLine} />
                    <span style={dividerText}>หรือ</span>
                    <div style={dividerLine} />
                  </div>
                )}
              </>
            )}

            {/* ── OAuth Buttons ─────────────────────────────────────────────── */}
            {!showPasskey && (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '8px' }}>
                  <button
                    type="button"
                    disabled={!!oauthLoading}
                    onClick={() => handleOAuth('google')}
                    style={oauthBtn(!!oauthLoading)}
                  >
                    <GoogleIcon />
                    {oauthLoading === 'google' ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบด้วย Google'}
                  </button>
                  <button
                    type="button"
                    disabled={!!oauthLoading}
                    onClick={() => handleOAuth('apple')}
                    style={{
                      ...oauthBtn(!!oauthLoading),
                      background: 'var(--color-text-primary)',
                      color: 'var(--color-bg-primary)',
                      border: '1.5px solid var(--color-text-primary)',
                    }}
                  >
                    <AppleIcon />
                    {oauthLoading === 'apple' ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบด้วย Apple'}
                  </button>
                </div>

                {/* ── Divider ─────────────────────────────────────────────────── */}
                <div style={divider}>
                  <div style={dividerLine} />
                  <span style={dividerText}>หรือใช้ Magic Link</span>
                  <div style={dividerLine} />
                </div>

                {/* ── Magic Link Form ──────────────────────────────────────────── */}
                <form onSubmit={handleMagicLink}>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="อีเมลของคุณ"
                    autoComplete="email"
                    style={inputStyle}
                  />
                  {error && <p style={errorStyle}>{error}</p>}
                  <button
                    type="submit"
                    disabled={submitting || !email.trim()}
                    style={primaryBtn(submitting || !email.trim())}
                  >
                    {submitting ? 'กำลังส่ง...' : 'ส่ง Magic Link'}
                  </button>
                </form>
              </>
            )}
          </>
        )}

        {/* ── Footer ────────────────────────────────────────────────────────── */}
        <div style={footerLink}>
          ยังไม่มีบัญชีใช่ไหม?{' '}
          <Link
            to="/onboarding"
            style={{ color: 'var(--color-accent-primary)', textDecoration: 'none', fontWeight: 600 }}
          >
            สร้าง AI ฝาแฝด ของคุณ →
          </Link>
        </div>
      </div>
    </div>
  );
}
