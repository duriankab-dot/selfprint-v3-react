import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';

export type Language = 'en' | 'th';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

/**
 * LANGINIT-001 FIX (4 ก.ย. 2026): state เริ่มต้นเดิมคือ `'en'` แล้วค่อยแก้ให้ถูก
 * ใน useEffect หลัง mount — แต่ App.tsx redirect `/` → `/th/` และตลาดหลักคือไทย
 * ผู้ใช้ไทยจึงเห็นเฟรมภาษาอังกฤษแวบหนึ่งทุกครั้งที่โหลดหน้า (FOUC ของภาษา)
 * อ่าน path ตั้งแต่ตอน initialise state เลย ไม่ต้องรอ effect
 */
function readLanguageFromPath(pathname?: string): Language {
  try {
    const p = pathname ?? window.location.pathname;
    const seg = p.split('/')[1];
    if (seg === 'th' || seg === 'en') return seg;
  } catch {
    // SSR / test env ที่ไม่มี window — ตกไปใช้ค่า default ด้านล่าง
  }
  return 'th'; // ตลาดหลักคือไทย และ `/` redirect ไป `/th/` อยู่แล้ว
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [language, setLanguage] = useState<Language>(() =>
    readLanguageFromPath(location.pathname)
  );

  // อ่านภาษาจาก URL path (/en/*, /th/*) เมื่อผู้ใช้เปลี่ยนหน้า
  useEffect(() => {
    const pathLang = location.pathname.split('/')[1];
    if (pathLang === 'th' || pathLang === 'en') {
      setLanguage(pathLang as Language);
    }
  }, [location.pathname]);

  // CTXMEMO-001: memo ค่า context — provider นี้ถูกซ้อนอยู่ในสแตก 14 ชั้น
  // ถ้าไม่ memo object ใหม่ทุก render จะบังคับให้ consumer ทุกตัว re-render
  const value = useMemo(() => ({ language, setLanguage }), [language]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}
