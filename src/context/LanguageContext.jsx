import React, { createContext, useContext, useState, useEffect } from 'react';

// Import language files
import enTranslations from '../locales/en.json';
import mlTranslations from '../locales/ml.json';

const LanguageContext = createContext();

// Available languages
export const LANGUAGES = {
  en: {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸'
  },
  ml: {
    code: 'ml',
    name: 'Malayalam',
    nativeName: 'മലയാളം',
    flag: '🇮🇳'
  }
};

// Translation function with English fallback
const translate = (key, translations, fallback = key) => {
  const keys = key.split('.');
  let value = translations;

  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      // Try fallback to English if not already English
      if (translations !== enTranslations) {
        let enValue = enTranslations;
        for (const k2 of keys) {
          if (enValue && typeof enValue === 'object' && k2 in enValue) {
            enValue = enValue[k2];
          } else {
            return fallback;
          }
        }
        if (typeof enValue === 'string' || Array.isArray(enValue) || (typeof enValue === 'object' && enValue !== null)) {
          return enValue;
        }
      }
      return fallback;
    }
  }

  // Return value as-is if it's a string, array, or object (for non-string translations)
  if (typeof value === 'string' || Array.isArray(value) || (typeof value === 'object' && value !== null)) {
    return value;
  }
  return fallback;
};

export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [translations, setTranslations] = useState(enTranslations);

  // Load saved language preference on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('rubberEco_language') || 'en';
    setCurrentLanguage(savedLanguage);
    setTranslations(savedLanguage === 'ml' ? mlTranslations : enTranslations);
  }, []);

  // Function to change language
  const changeLanguage = (languageCode) => {
    if (LANGUAGES[languageCode]) {
      setCurrentLanguage(languageCode);
      setTranslations(languageCode === 'ml' ? mlTranslations : enTranslations);
      localStorage.setItem('rubberEco_language', languageCode);
      
      // Update document direction for RTL languages if needed
      document.documentElement.dir = languageCode === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.lang = languageCode;
    }
  };

  // Translation function
  const t = (key, fallback) => {
    return translate(key, translations, fallback);
  };

  // Get current language info
  const getCurrentLanguageInfo = () => {
    return LANGUAGES[currentLanguage];
  };

  // Get all available languages
  const getAvailableLanguages = () => {
    return Object.values(LANGUAGES);
  };

  const value = {
    currentLanguage,
    translations,
    changeLanguage,
    t,
    getCurrentLanguageInfo,
    getAvailableLanguages,
    isRTL: currentLanguage === 'ar' // For future RTL language support
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

// Custom hook to use language context
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// Higher-order component for easy translation
export const withTranslation = (WrappedComponent) => {
  return function TranslatedComponent(props) {
    const { t } = useLanguage();
    return <WrappedComponent {...props} t={t} />;
  };
};

export default LanguageContext;
