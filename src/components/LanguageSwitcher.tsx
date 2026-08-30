/**
 * LanguageSwitcher.tsx
 *
 * Component สำหรับสลับภาษา /en ↔ /th
 * - เก็บ query params ตอน redirect
 * - บันทึก preference ใน localStorage
 * - แสดง current language
 */

import { useLanguage } from '@/context/LanguageContext';
import { useLocation, useNavigate } from 'react-router-dom';

export function LanguageSwitcher() {
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
      }}
      title={language === 'en' ? 'Switch to ไทย' : 'สลับเป็น English'}
    >
      {language === 'en' ? '🇬🇧 EN' : '🇹🇭 TH'}
    </button>
  );
}

export default LanguageSwitcher;
