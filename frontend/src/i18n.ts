import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import trTranslations from './locales/tr/translation.json';
import enTranslations from './locales/en/translation.json';

const resources = {
  en: {
    translation: enTranslations
  },
  tr: {
    translation: trTranslations
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem('language') || 'tr', // Varsayılan veya kaydedilmiş dil
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false // React zaten XSS'e karşı korumalıdır
    }
  });

export default i18n;
