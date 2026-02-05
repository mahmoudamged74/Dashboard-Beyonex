import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';

// Get saved language from localStorage or default to Arabic
const getSavedLanguage = () => {
  const savedLang = localStorage.getItem('i18nextLng');
  if (savedLang && (savedLang === 'ar' || savedLang === 'en')) {
    return savedLang;
  }
  // Default to Arabic
  localStorage.setItem('i18nextLng', 'ar');
  return 'ar';
};

i18n
  .use(Backend)
  .use(initReactI18next)
  .init({
    fallbackLng: 'ar',
    lng: getSavedLanguage(),
    debug: false,
    
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
  });

// Save language changes to localStorage and update document direction
i18n.on('languageChanged', (lng) => {
  localStorage.setItem('i18nextLng', lng);
  // Update document direction for RTL support
  document.documentElement.dir = lng === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.lang = lng;
});

// Set initial direction
const initialLang = getSavedLanguage();
document.documentElement.dir = initialLang === 'ar' ? 'rtl' : 'ltr';
document.documentElement.lang = initialLang;

export default i18n;
