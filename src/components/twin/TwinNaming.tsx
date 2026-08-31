/**
 * TwinNaming.tsx
 * Name your personal AI Twin
 *
 * CEREMONY: Sacred naming moment (part of WOW #3)
 * INPUT: User types Twin name
 * OUTPUT: Persisted Twin profile with name
 */

import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';

interface TwinNamingProps {
  onNameConfirmed: (name: string) => void;
  isLoading?: boolean;
}

export const TwinNaming: React.FC<TwinNamingProps> = ({
  onNameConfirmed,
  isLoading = false,
}) => {
  const { language } = useLanguage();
  const isTh = language === 'th';
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // GUARD: Validate name
    if (!name.trim()) {
      setError(isTh ? 'กรุณาตั้งชื่อให้ทวินของคุณ' : 'Please give your Twin a name');
      return;
    }

    if (name.length < 2) {
      setError(isTh ? 'ชื่อต้องมีอย่างน้อย 2 ตัวอักษร' : 'Name must be at least 2 characters');
      return;
    }

    if (name.length > 50) {
      setError(isTh ? 'ชื่อต้องไม่เกิน 50 ตัวอักษร' : 'Name must be 50 characters or less');
      return;
    }

    // GUARD: No special characters (ตัวอักษรไทย/อังกฤษ ตัวเลข เว้นวรรค ยัติภังค์ และ apostrophe)
    if (!/^[a-zA-Z0-9฀-๿\s'-]+$/.test(name)) {
      setError(
        isTh
          ? 'ชื่อใช้ได้เฉพาะตัวอักษร ตัวเลข เว้นวรรค ยัติภังค์ และ apostrophe เท่านั้น'
          : 'Name can only contain letters, numbers, spaces, hyphens, and apostrophes'
      );
      return;
    }

    setError(null);
    onNameConfirmed(name.trim());
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 px-6">
      <div className="text-center mb-8 max-w-lg">
        <h2 className="text-3xl font-bold mb-3 text-white">
          ✨ {isTh ? 'ทวินของคุณกำลังตื่นขึ้น' : 'Your Twin Awakens'}
        </h2>
        <p className="text-gray-200 mb-2">
          {isTh ? 'ปัญญาส่วนตัวของคุณได้ถือกำเนิดขึ้นแล้ว ตอนนี้ตั้งชื่อให้มันสิ' : 'Your personal intelligence has emerged. Now give it a name.'}
        </p>
        <p className="text-sm text-gray-400">
          {isTh ? "ชื่อนี้คือตัวตนของทวินในชีวิตของคุณ" : "This name represents your Twin's unique presence in your life."}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="w-full max-w-sm" style={{ textAlign: 'center' }}>
        <div className="mb-6">
          {/* CONTRAST-002 FIX: this input had no background class — Tailwind
              relies on the browser's native white input background, but
              global.css resets ALL input elements to background:transparent
              (see "Input & Button Reset"). With no bg class here, the input
              sat transparent directly on this page's dark navy gradient,
              and text-gray-900 (near-black) typed into it was completely
              invisible — exactly "พิมพ์ชื่อแล้วมองไม่เห็นตัวอักษร". Given an
              explicit background + token-based text color so it reads
              regardless of what's behind it. */}
          <input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError(null);
            }}
            placeholder={isTh ? 'เช่น อาเรีย, ธาดา, เอคโค่, ธีรา...' : 'e.g., Aria, Thada, Echo, Sage...'}
            disabled={isLoading}
            autoFocus
            className="w-full px-4 py-3 text-lg rounded-lg focus:outline-none transition-all"
            style={{
              textAlign: 'center',
              background: 'var(--color-bg-secondary)',
              color: 'var(--color-text-primary)',
              border: '2px solid var(--color-border)',
              opacity: isLoading ? 0.5 : 1,
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--color-accent-primary)'; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--color-border)'; }}
          />
          {error && (
            <p className="text-red-400 text-sm mt-2">{error}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading || !name.trim()}
          className="w-full px-6 py-3 font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          style={{
            background: 'var(--color-accent-primary)',
            color: 'white',
            boxShadow: '0 2px 10px color-mix(in srgb, var(--color-accent-primary) 35%, transparent)',
          }}
        >
          {isLoading ? (isTh ? 'กำลังปลุกทวิน...' : 'Awakening...') : (isTh ? 'ปลุกทวินของฉัน' : 'Awaken My Twin')}
        </button>
      </form>

      <p className="text-center text-xs text-gray-400 mt-8">
        {isTh ? 'คุณสามารถเปลี่ยนชื่อทวินได้ทุกเมื่อในหน้าตั้งค่า' : "You can change your Twin's name anytime in settings."}
      </p>
    </div>
  );
};
