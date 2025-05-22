import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import all translations
import en from './en';
import he from './he';

const resources = {
  en,
  he
};

i18next
  .use(LanguageDetector)
  .use(initReactI18next) // passes i18n to react-i18next
  .init({
    resources,
    fallbackLng: 'en', // fallback language is English
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
  });

export default i18next;
