/**
 * PWAInstallPrompt.tsx
 * Phase B: PWA install banner
 *
 * Captures the browser's `beforeinstallprompt` event and shows a sticky
 * bottom banner so users know they can install SELFPRINT to their home screen.
 *
 * Rules:
 * - CSS: var(--...) only
 * - Only shown when browser emits `beforeinstallprompt` (Chrome/Edge/Android)
 * - Dismissed state stored in localStorage — won't re-appear after dismissal
 * - iOS: separate Apple banner (Add to Home Screen instruction) shown once
 */

import { useEffect, useState } from 'react';

// Extend Window to include the deferred prompt
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

function isIOS(): boolean {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as unknown as Record<string, unknown>).MSStream;
}

function isInStandaloneMode(): boolean {
  return window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as unknown as Record<string, unknown>).standalone === true;
}

const DISMISSED_KEY = 'selfprint_pwa_dismissed';

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIOSBanner, setShowIOSBanner] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Already installed — don't show
    if (isInStandaloneMode()) return;
    // User previously dismissed — don't show
    if (localStorage.getItem(DISMISSED_KEY)) return;

    // Android/Chrome: capture deferred prompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setVisible(true);
    };
    window.addEventListener('beforeinstallprompt', handler);

    // iOS Safari: show manual instruction once
    if (isIOS()) {
      setShowIOSBanner(true);
      setVisible(true);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const result = await deferredPrompt.userChoice;
    if (result.outcome === 'accepted') {
      localStorage.setItem(DISMISSED_KEY, '1');
    }
    setDeferredPrompt(null);
    setVisible(false);
  };

  const handleDismiss = () => {
    localStorage.setItem(DISMISSED_KEY, '1');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="ติดตั้ง SELFPRINT บนหน้าจอหลัก"
      style={{
        position: 'fixed',
        bottom: 72, // above BottomNav (56px) + gap
        left: 12,
        right: 12,
        zIndex: 9999,
        background: 'var(--color-bg-secondary)',
        border: '1px solid var(--color-accent-primary)',
        borderRadius: 20,
        padding: '16px 18px',
        boxShadow: 'var(--shadow-xl)',
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        maxWidth: 480,
        margin: '0 auto',
      }}
    >
      {/* App icon */}
      <img
        src="/icons/icon-192x192.png"
        alt="SELFPRINT icon"
        width={48}
        height={48}
        style={{ borderRadius: 12, flexShrink: 0 }}
      />

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 14,
          fontWeight: 700,
          color: 'var(--color-text-primary)',
          marginBottom: 3,
        }}>
          ติดตั้ง SELFPRINT
        </div>
        {showIOSBanner ? (
          <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
            กด <strong>Share</strong> → <strong>"Add to Home Screen"</strong> เพื่อติดตั้ง
          </div>
        ) : (
          <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
            ใช้งานได้เร็วขึ้น แม้ไม่มีอินเทอร์เน็ต
          </div>
        )}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
        {!showIOSBanner && (
          <button
            onClick={handleInstall}
            aria-label="ติดตั้งแอป"
            style={{
              background: 'var(--color-accent-primary)',
              color: '#fff',
              border: 'none',
              borderRadius: 10,
              padding: '8px 14px',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            ติดตั้ง
          </button>
        )}
        <button
          onClick={handleDismiss}
          aria-label="ปิดการแจ้งเตือน"
          style={{
            background: 'none',
            border: '1px solid var(--color-border)',
            borderRadius: 10,
            padding: '8px 10px',
            fontSize: 13,
            color: 'var(--color-text-secondary)',
            cursor: 'pointer',
          }}
        >
          ✕
        </button>
      </div>
    </div>
  );
}
