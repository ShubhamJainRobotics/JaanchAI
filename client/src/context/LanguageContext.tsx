import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Language, Translations, translations } from "../i18n/translations";

interface LanguageContextType {
  currentLang: Language;
  setLang: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = "jaanch_language";

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [currentLang, setCurrentLangState] = useState<Language>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "en" || stored === "hi" || stored === "kn") {
        return stored;
      }
    } catch {
      // Ignore localStorage errors (e.g. private mode)
    }
    return "en";
  });

  const setLang = (lang: Language) => {
    setCurrentLangState(lang);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // Ignore storage errors
    }
  };

  useEffect(() => {
    document.documentElement.lang = currentLang;
  }, [currentLang]);

  const value: LanguageContextType = {
    currentLang,
    setLang,
    t: translations[currentLang],
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
