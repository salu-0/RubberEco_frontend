import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import ml from './locales/ml.json';

// Determine initial language: saved preference -> browser -> English
const STORAGE_KEY = 'app_language';
let initialLng = 'en';
try {
  const saved = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
  if (saved === 'ml' || saved === 'en') {
    initialLng = saved;
  } else if (typeof navigator !== 'undefined') {
    const nav = (navigator.language || navigator.userLanguage || '').toLowerCase();
    if (nav.startsWith('ml')) initialLng = 'ml';
  }
} catch { /* ignore storage errors */ }

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ml: { translation: ml }
    },
    lng: initialLng,
    fallbackLng: 'en',
    interpolation: { escapeValue: false }
  });

// Persist language changes and update <html lang>
try {
  i18n.on('languageChanged', (lng) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, lng);
      document.documentElement.setAttribute('lang', lng);
    }
  });
  // Set lang attribute initially as well
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('lang', i18n.language || initialLng);
  }
} catch { /* no-op */ }

export default i18n;
