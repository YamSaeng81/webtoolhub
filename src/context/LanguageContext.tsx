import React, { createContext, useContext, useState, useEffect } from 'react';
import { TRANSLATIONS } from '../config/i18n';
import type { Language, TranslationDictionary } from '../config/i18n';

interface LanguageContextProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: TranslationDictionary;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

/**
 * 접속 유저의 브라우저/시스템 Locale(navigator.language)을 감지하여 
 * 지원 언어(ko, es, zh, ja)이면 자동 변경하고, 그 외는 기본 '영어(en)'로 설정하는 함수
 */
function detectBrowserLanguage(): Language {
  if (typeof window === 'undefined' || !navigator) return 'en';

  const browserLang = (navigator.language || (navigator as any).userLanguage || 'en').toLowerCase();

  if (browserLang.startsWith('ko')) return 'ko';
  if (browserLang.startsWith('es')) return 'es';
  if (browserLang.startsWith('zh')) return 'zh';
  if (browserLang.startsWith('ja')) return 'ja';
  if (browserLang.startsWith('en')) return 'en';

  // 지원하지 않는 언어 지역(예: 프랑스어, 독일어 등)은 디폴트 영어(en) 반환
  return 'en';
}

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    // 최초 방문 시 브라우저 접속 지역 언어 자동 감지
    const savedLang = localStorage.getItem('webtoolhub_lang') as Language | null;
    if (savedLang) {
      setLanguageState(savedLang);
      document.documentElement.lang = savedLang;
    } else {
      const detected = detectBrowserLanguage();
      setLanguageState(detected);
      document.documentElement.lang = detected;
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('webtoolhub_lang', lang);
    document.documentElement.lang = lang;
  };

  const t = TRANSLATIONS[language];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextProps => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
