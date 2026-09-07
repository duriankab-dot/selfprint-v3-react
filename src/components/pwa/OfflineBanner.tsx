/**
 * OfflineBanner.tsx
 * Phase 1.1: PWA — global "you're offline" banner
 *
 * Listens to the browser's `online`/`offline` events and shows a sticky
 * top banner while `navigator.onLine === false`. Same global-mount pattern
 * as PWAInstallPrompt.tsx (mounted once in App.tsx, renders nothing until
 * needed).
 *
 * Rules:
 * - CSS: var(--...) only, no hardcoded colors
 * - No localStorage dismissal — offline state is transient and re-appears
 *   automatically whenever connectivity actually drops
 */

import { useEffect, useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';

export function OfflineBanner() {
  const { language } = useLanguage();
  const isTh = language === 'th';
  const [isOffline, setIsOffline] = useState(
    typeof navigator !== 'undefined' && !navigator.onLine
  );

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={isTh ? 'คุณกำลังออฟไลน์' : 'You are offline'}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        padding: '10px 16px',
        paddingTop: 'calc(10px + env(safe-area-inset-top))',
        background: 'var(--color-bg-tertiary)',
        borderBottom: '1px solid var(--color-border-dark)',
        color: 'var(--color-text-secondary)',
        fontSize: 13,
        fontWeight: 600,
        textAlign: 'center',
      }}
    >
      <span aria-hidden="true">📡</span>
      {isTh
        ? 'ออฟไลน์อยู่ — ข้อมูลที่บันทึกไว้ยังใช้งานได้ จะซิงก์อัตโนมัติเมื่อกลับมาออนไลน์'
        : "You're offline — saved data still works and will sync once you're back online"}
    </div>
  );
}
