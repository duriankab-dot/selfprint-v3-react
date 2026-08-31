/**
 * BackButton.tsx
 *
 * BACKBUTTON-001 FIX: "ทุกหน้าต้องมีปุ่มย้อนกลับไปจุดที่เข้ามาจากหน้าที่แล้ว" —
 * every page needs a way back to wherever the user actually came from, not
 * just a fixed link to Dashboard. Uses real browser history (navigate(-1))
 * when there is any to go back to; falls back to a fixed destination only
 * for a page opened fresh (deep link, new tab, PWA cold start) where there
 * is nothing behind it to go back to.
 */

import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';

interface BackButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Where to go if there's no real browser history to go back to. */
  fallbackTo?: string;
  /** Override the label (defaults to "ย้อนกลับ" / "Back"). */
  label?: string;
}

export function BackButton({ fallbackTo = '/dashboard', className, style, label, ...rest }: BackButtonProps) {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const isTh = language === 'th';

  const handleBack = () => {
    // window.history.length is 1 for a page opened fresh with nothing
    // behind it (occasionally 2 in some embedders counting an initial
    // blank entry) — in that case there's nowhere real to go back to, so
    // use the fallback destination instead of navigate(-1) leaving the app.
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate(`/${language}${fallbackTo}`);
    }
  };

  return (
    <button
      type="button"
      onClick={handleBack}
      aria-label={isTh ? 'ย้อนกลับ' : 'Back'}
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        border: 'none',
        background: 'none',
        color: 'var(--color-text-secondary)',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: 600,
        padding: '6px 8px',
        borderRadius: 8,
        ...style,
      }}
      {...rest}
    >
      <span aria-hidden="true">←</span>
      {label ?? (isTh ? 'ย้อนกลับ' : 'Back')}
    </button>
  );
}

export default BackButton;
