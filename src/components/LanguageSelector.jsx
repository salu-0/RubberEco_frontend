import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Check } from 'lucide-react';

const LanguageSelector = ({ 
  variant = 'dropdown', // 'dropdown' or 'buttons'
  size = 'medium', // 'small', 'medium', 'large'
  showFlags = true,
  showNativeNames = true,
  className = ''
}) => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const availableLanguages = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'ml', name: '', nativeName: 'മലയാളം', flag: '🇮🇳' }
  ];
  const currentLanguage = i18n.language;
  const currentLangInfo = availableLanguages.find(l => l.code === currentLanguage) || availableLanguages[0];

  const sizeClasses = {
    small: 'text-sm px-2 py-1',
    medium: 'text-base px-3 py-2',
    large: 'text-lg px-4 py-3'
  };

  const handleLanguageChange = (languageCode) => {
    try { localStorage.setItem('app_language', languageCode); } catch {}
    i18n.changeLanguage(languageCode);
    setIsOpen(false);
  };

  if (variant === 'buttons') {
    return (
      <div className={`flex gap-2 ${className}`}>
        {availableLanguages.map((lang) => (
          <motion.button
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            className={
              `
              ${sizeClasses[size]}
              flex items-center gap-2 rounded-lg border transition-all duration-200
              ${currentLanguage === lang.code
                ? 'bg-green-500 text-white border-green-500 shadow-lg'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-green-300'
              }
              ${size === 'small' ? 'px-2 py-1' : 'px-3 py-2'}
              `
            }
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {showFlags && <span className="text-lg">{lang.flag}</span>}
            <span className="font-medium">
              {showNativeNames ? lang.nativeName : lang.name}
            </span>
            {currentLanguage === lang.code && (
              <Check className="w-4 h-4" />
            )}
          </motion.button>
        ))}
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          ${sizeClasses[size]}
          flex items-center gap-2 rounded-lg border border-gray-300 bg-white text-gray-700
          hover:bg-gray-50 hover:border-green-300 transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent
        `}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Globe className="w-4 h-4" />
        {showFlags && <span className="text-lg">{currentLangInfo.flag}</span>}
        <span className="font-medium">
          {showNativeNames ? currentLangInfo.nativeName : currentLangInfo.name}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden"
          >
            {availableLanguages.map((lang) => (
              <motion.button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={`
                  w-full flex items-center gap-3 px-3 py-2 text-left transition-colors duration-200
                  ${currentLanguage === lang.code
                    ? 'bg-green-50 text-green-700'
                    : 'text-gray-700 hover:bg-gray-50'
                  }
                `}
                whileHover={{ backgroundColor: currentLanguage === lang.code ? '#f0fdf4' : '#f9fafb' }}
              >
                {showFlags && <span className="text-lg">{lang.flag}</span>}
                <div className="flex-1">
                  <div className="font-medium">
                    {showNativeNames ? lang.nativeName : lang.name}
                  </div>
                  {showNativeNames && (
                    <div className="text-sm text-gray-500">
                      {lang.name}
                    </div>
                  )}
                </div>
                {currentLanguage === lang.code && (
                  <Check className="w-4 h-4 text-green-600" />
                )}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default LanguageSelector;
