/**
 * LanguageSwitcher.tsx
 *
 * Component สำหรับสลับภาษา /en ↔ /th
 * - เก็บ query params ตอน redirect
 * - บันทึก preference ใน localStorage
 * - แสดง current language
 * - variant="compact": แสดงแค่ TH/EN เรียบ ไม่มี label
 */

import { useLanguage } from '@/context/LanguageContext';
import { useLocation, useNavigate } from 'react-router-dom';

export interface LanguageSwitcherProps {
  variant?: 'full' | 'compact';
  style?: React.CSSProperties;
}

export function LanguageSwitcher({ variant = 'full', style }: LanguageSwitcherProps) {
  const { language } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();

  const toggleLanguage = () => {
    const newLang = language === 'en' ? 'th' : 'en';
    const currentPath = location.pathname;

    // สกัด query string
    const queryString = location.search;

    // แทนที่ /en/ หรือ /th/ ด้วย language ใหม่
    let newPath = currentPath.replace(/^\/(en|th)/, `/${newLang}`);

    // ถ้า path ไม่มี /en หรือ /th prefix เพิ่มเข้าไป
    if (!newPath.startsWith(`/${newLang}/`)) {
      newPath = `/${newLang}${currentPath}`;
    }

    // บันทึก preference
    try {
      localStorage.setItem('preferredLanguage', newLang);
    } catch (e) {
      // Fallback ถ้า localStorage ไม่พร้อม
      console.warn('localStorage ไม่พร้อม:', e);
    }

    // Navigate พร้อม query params
    navigate(`${newPath}${queryString}`);
  };

  if (variant === 'compact') {
    return (
      <div style={{ display: 'flex', gap: '2px', background: 'var(--color-bg-secondary)', borderRadius: '6px', padding: '2px', border: '1px solid var(--color-border)', ...style }}>
        {['th', 'en'].map(lang => (
          <button
            key={lang}
            onClick={() => toggleLanguage()}
            style={{
              padding: '4px 10px',
              borderRadius: '4px',
              fontSize: '11px',
              fontWeight: 700,
              background: language === lang ? 'var(--color-accent-primary)' : 'transparent',
              color: language === lang ? 'white' : 'var(--color-text-secondary)',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            title={lang === 'th' ? 'ไทย' : 'English'}
          >
            {lang.toUpperCase()}
          </button>
        ))}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      className="sp-language-switcher"
      style={{
        padding: '8px 12px',
        borderRadius: '6px',
        border: '1px solid var(--color-border)',
        background: 'transparent',
        color: 'var(--color-text-primary)',
        fontWeight: 600,
        fontSize: '13px',
        cursor: 'pointer',
        transition: 'border-color 0.2s, background 0.2s',
        minWidth: '50px',
        ...style,
      }}
      title={language === 'en' ? 'Switch to ไทย' : 'สลับเป็น English'}
    >
      {language === 'en' ? '🇬🇧 EN' : '🇹🇭 TH'}
    </button>
  );
}

export default LanguageSwitcher;
