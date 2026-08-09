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

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

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
  const { session, signInWithMagicLink } = useAuth();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // ถ้า login อยู่แล้ว (กลับมาทำ onboarding ซ้ำ) ไม่ต้องถามอีเมลอีก
  if (session) {
    localStorage.setItem('pending_onboarding_save', JSON.stringify(data));
    onDone();
    return null;
  }

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
              เช็คอีเมลของคุณ 📬
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
              เราส่งลิงก์เข้าสู่ระบบไปที่ <strong>{email}</strong> แล้ว
              คลิกลิงก์ในอีเมลเพื่อบันทึก AI Twin ของคุณไว้ถาวร
            </p>
            <button
              onClick={onDone}
              style={{
                marginTop: '24px',
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
              ไปต่อก่อน (บันทึกอัตโนมัติเมื่อคลิกลิงก์)
            </button>
          </>
        ) : (
          <>
            <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '12px' }}>
              บันทึก AI Twin ของคุณไว้ 💾
            </h2>
            <p
              style={{
                fontSize: '14px',
                color: 'var(--color-text-secondary)',
                lineHeight: 1.6,
                marginBottom: '24px',
              }}
            >
              ใส่อีเมลเพื่อรับลิงก์เข้าสู่ระบบ ไม่ต้องตั้งรหัสผ่าน —
              กลับมาใช้ AI Twin นี้ได้อีกทุกครั้งที่ต้องการ
            </p>
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
                {submitting ? 'กำลังส่ง...' : 'ส่งลิงก์เข้าสู่ระบบ'}
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
              ข้ามไปก่อน (ผลลัพธ์จะไม่ถูกบันทึก)
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default ClaimAccount;
