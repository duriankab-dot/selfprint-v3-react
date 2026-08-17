import { useState } from 'react';
import { generateShareLink } from '@/features/viral/api/shareService';
import { useAuth } from '@/context/AuthContext';

export function ShareButton() {
  const { session } = useAuth();
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleShare = async () => {
    if (!session?.access_token) {
      setError('ต้อง login ก่อนถึงจะแชร์ได้');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const url = await generateShareLink(session.access_token);
      setShareUrl(url);
    } catch {
      setError('สร้างลิงก์ไม่สำเร็จ ลองใหม่อีกครั้ง');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!shareUrl) {
    return (
      <div>
        <button
          type="button"
          onClick={handleShare}
          disabled={loading}
          style={{
            padding: '10px 20px',
            borderRadius: '8px',
            border: 'none',
            background: 'var(--accent-primary)',
            color: 'white',
            fontWeight: 600,
            fontSize: '14px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1,
            transition: 'opacity 0.2s',
          }}
        >
          {loading ? 'กำลังสร้างลิงก์...' : 'แชร์ Twin'}
        </button>
        {error && (
          <p style={{ fontSize: '13px', color: '#ef5350', marginTop: '8px' }}>{error}</p>
        )}
      </div>
    );
  }

  return (
    <div
      style={{
        padding: '16px',
        background: 'var(--accent-light)',
        border: '1px solid var(--color-border)',
        borderRadius: '8px',
      }}
    >
      <p
        style={{
          fontSize: '13px',
          fontWeight: 600,
          color: 'var(--color-text-primary)',
          marginBottom: '8px',
        }}
      >
        แชร์ AI Twin ของคุณ:
      </p>
      <div style={{ display: 'flex', gap: '8px' }}>
        <input
          type="text"
          value={shareUrl}
          readOnly
          style={{
            flex: 1,
            padding: '10px 12px',
            borderRadius: '8px',
            border: '1px solid var(--color-border)',
            background: 'var(--color-bg-primary)',
            color: 'var(--color-text-primary)',
            fontSize: '13px',
          }}
        />
        <button
          type="button"
          onClick={handleCopy}
          style={{
            padding: '10px 16px',
            borderRadius: '8px',
            border: 'none',
            background: 'var(--accent-primary)',
            color: 'white',
            fontWeight: 600,
            fontSize: '13px',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          {copied ? 'คัดลอกแล้ว' : 'คัดลอก'}
        </button>
      </div>
    </div>
  );
}
