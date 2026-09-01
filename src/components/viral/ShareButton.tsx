import { useState, useRef, useEffect } from 'react';
import { generateShareLink } from '@/features/viral/api/shareService';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';

export function ShareButton() {
  const { session } = useAuth();
  const { language } = useLanguage();
  const isTh = language === 'th';
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    };
  }, []);

  const handleShare = async () => {
    if (!session?.access_token) {
      setError(isTh ? 'ต้อง login ก่อนถึงจะแชร์ได้' : 'You must sign in before sharing');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const url = await generateShareLink(session.access_token);
      setShareUrl(url);
    } catch {
      setError(isTh ? 'สร้างลิงก์ไม่สำเร็จ ลองใหม่อีกครั้ง' : 'Failed to create link, please try again');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    copyTimerRef.current = setTimeout(() => setCopied(false), 2000);
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
          {loading ? (isTh ? 'กำลังสร้างลิงก์...' : 'Creating link...') : (isTh ? 'แชร์ Twin' : 'Share Twin')}
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
        {isTh ? 'แชร์ AI Twin ของคุณ:' : 'Share your AI Twin:'}
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
          {copied ? (isTh ? 'คัดลอกแล้ว' : 'Copied') : (isTh ? 'คัดลอก' : 'Copy')}
        </button>
      </div>
    </div>
  );
}
