import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getPairAnalysis } from '@/features/viral/api/shareService';
import type { PairPreview } from '@/features/viral/api/shareService';
import { NavBar } from '@/components/layout/NavBar';
import { Footer } from '@/components/layout/Footer';
import { BottomNav } from '@/components/layout/BottomNav';

export default function SharePage() {
  const { code } = useParams<{ code: string }>();
  const [data, setData] = useState<PairPreview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!code) {
      setLoading(false);
      return;
    }
    getPairAnalysis(code).then((result) => {
      setData(result);
      setLoading(false);
    });
  }, [code]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <NavBar />
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: `linear-gradient(135deg, var(--accent-light, var(--color-bg-secondary)) 0%, var(--color-bg-primary) 100%)`,
          padding: '48px 24px',
        }}
      >
      <div
        style={{
          maxWidth: '440px',
          width: '100%',
          background: 'var(--color-bg-secondary)',
          borderRadius: '12px',
          border: '2px solid var(--accent-light)',
          padding: '32px',
          textAlign: 'center',
        }}
      >
        <h1
          style={{
            fontSize: '24px',
            fontWeight: 700,
            marginBottom: '12px',
            color: 'var(--color-text-primary)',
          }}
        >
          เข้าร่วม SelfPrint
        </h1>
        <p
          style={{
            fontSize: '14px',
            color: 'var(--color-text-secondary)',
            lineHeight: 1.6,
            marginBottom: '24px',
          }}
        >
          เพื่อนของคุณชวนให้มาค้นพบ AI Twin ของตัวเอง
        </p>

        {loading && (
          <p
            style={{
              fontSize: '13px',
              color: 'var(--color-text-secondary)',
              marginBottom: '24px',
            }}
          >
            กำลังโหลด...
          </p>
        )}

        {!loading && data?.found && (
          <div
            style={{
              background: 'var(--accent-light)',
              borderLeft: '4px solid var(--accent-primary)',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '24px',
              textAlign: 'left',
            }}
          >
            <p
              style={{
                fontSize: '16px',
                fontWeight: 700,
                color: 'var(--color-text-primary)',
                margin: '0 0 4px 0',
              }}
            >
              {data.decisionStyle || 'AI Twin ของเขา'}
            </p>
            <p
              style={{
                fontSize: '13px',
                color: 'var(--color-text-secondary)',
                margin: 0,
              }}
            >
              ความแม่นยำ {data.accuracyLevel}%
            </p>
          </div>
        )}

        {!loading && !data?.found && (
          <div
            style={{
              background: 'var(--color-bg-tertiary)',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '24px',
            }}
          >
            <p
              style={{
                fontSize: '13px',
                color: 'var(--color-text-secondary)',
                margin: 0,
              }}
            >
              ลิงก์แชร์นี้ไม่ถูกต้องหรือหมดอายุแล้ว
            </p>
          </div>
        )}

        <a
          href="/onboarding"
          style={{
            display: 'block',
            width: '100%',
            padding: '14px 24px',
            borderRadius: '8px',
            border: 'none',
            background: 'var(--accent-primary)',
            color: 'white',
            fontWeight: 600,
            fontSize: '16px',
            textDecoration: 'none',
            boxSizing: 'border-box',
            transition: 'opacity 0.3s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.8')}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
        >
          รับโปรไฟล์ของคุณฟรี
        </a>
      </div>
      </div>
      <Footer />
      <BottomNav />
    </div>
  );
}
