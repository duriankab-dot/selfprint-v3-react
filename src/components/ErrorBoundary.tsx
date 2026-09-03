/**
 * ErrorBoundary.tsx
 *
 * ERRBOUND-001 FIX: before this file existed there was NO error boundary
 * anywhere in the app (verified: zero matches for componentDidCatch /
 * getDerivedStateFromError across src/). `<Suspense fallback={null}>` in
 * App.tsx catches *loading*, never *throwing* — so any render-time throw
 * (a missing provider, a stale lazy chunk 404 after a deploy, a null field
 * from the DB) unmounted the entire React tree and left a blank white page
 * with nothing but a console trace.
 *
 * Deliberately dependency-free: it must be able to render when the app's
 * providers are exactly what failed, so it uses inline styles and reads the
 * language from the URL rather than from LanguageContext.
 */

import { Component, type ErrorInfo, type ReactNode } from 'react';
import { captureException } from '../services/error-tracking';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

function isThai(): boolean {
  try {
    return !window.location.pathname.startsWith('/en');
  } catch {
    return true;
  }
}

/**
 * A lazy chunk that 404s after a deploy throws a distinctive error. That case
 * is fixed by reloading (the new index.html references the new hashes), so we
 * offer a reload as the primary action rather than a generic "try again".
 */
function isStaleChunkError(error: Error): boolean {
  const msg = `${error.name} ${error.message}`;
  return /Failed to fetch dynamically imported module|Importing a module script failed|ChunkLoadError/i.test(msg);
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // captureException falls back to console.error when Sentry is not
    // initialised, so this is safe with or without VITE_SENTRY_DSN.
    captureException(error, {
      componentStack: info.componentStack,
      pathname: typeof window !== 'undefined' ? window.location.pathname : undefined,
    });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleHome = () => {
    window.location.href = isThai() ? '/th/' : '/en/';
  };

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    const th = isThai();
    const stale = isStaleChunkError(error);

    return (
      <div
        role="alert"
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem',
          padding: '2rem',
          textAlign: 'center',
          fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif',
          background: '#0b0d17',
          color: '#e8eaf2',
        }}
      >
        <h1 style={{ fontSize: '1.25rem', fontWeight: 600, margin: 0 }}>
          {stale
            ? th
              ? 'มีเวอร์ชันใหม่ กรุณาโหลดหน้านี้ใหม่'
              : 'A new version is available — please reload'
            : th
              ? 'เกิดข้อผิดพลาดที่ไม่คาดคิด'
              : 'Something went wrong'}
        </h1>
        <p style={{ margin: 0, opacity: 0.75, maxWidth: '32rem', lineHeight: 1.6 }}>
          {stale
            ? th
              ? 'ระบบเพิ่งอัปเดต ไฟล์เก่าในเครื่องจึงโหลดไม่ได้ กดโหลดใหม่แล้วจะใช้งานได้ตามปกติ'
              : 'The app was just updated, so a cached file could not load. Reloading will fix it.'
            : th
              ? 'เราบันทึกข้อผิดพลาดนี้ไว้แล้ว ลองโหลดหน้านี้ใหม่ หรือกลับไปหน้าแรก'
              : 'The error has been logged. Try reloading this page, or go back home.'}
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button
            type="button"
            onClick={this.handleReload}
            style={{
              padding: '0.6rem 1.4rem',
              borderRadius: '999px',
              border: 'none',
              cursor: 'pointer',
              background: '#6c5ce7',
              color: '#fff',
              fontSize: '0.95rem',
            }}
          >
            {th ? 'โหลดใหม่' : 'Reload'}
          </button>
          <button
            type="button"
            onClick={this.handleHome}
            style={{
              padding: '0.6rem 1.4rem',
              borderRadius: '999px',
              border: '1px solid rgba(232,234,242,0.3)',
              cursor: 'pointer',
              background: 'transparent',
              color: '#e8eaf2',
              fontSize: '0.95rem',
            }}
          >
            {th ? 'กลับหน้าแรก' : 'Go home'}
          </button>
        </div>
        {import.meta.env.DEV && (
          <pre
            style={{
              marginTop: '1.5rem',
              maxWidth: '48rem',
              overflowX: 'auto',
              textAlign: 'left',
              fontSize: '0.75rem',
              opacity: 0.6,
              whiteSpace: 'pre-wrap',
            }}
          >
            {error.stack || error.message}
          </pre>
        )}
      </div>
    );
  }
}

export default ErrorBoundary;
