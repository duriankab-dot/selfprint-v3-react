import { createContext, useContext, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

export type Language = 'en' | 'th';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');
  const location = useLocation();

  // อ่านภาษาจาก URL path (/en/*, /th/*)
  useEffect(() => {
    const pathLang = location.pathname.split('/')[1];
    if (pathLang === 'th' || pathLang === 'en') {
      setLanguage(pathLang as Language);
    }
  }, [location.pathname]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
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
