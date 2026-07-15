import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const normalizeLanguage = (lng) => (String(lng).startsWith('ar') ? 'ar' : 'en');

const getSavedLanguage = () => {
  const savedLang = localStorage.getItem('i18nextLng');
  if (savedLang) {
    return normalizeLanguage(savedLang);
  }
  localStorage.setItem('i18nextLng', 'ar');
  return 'ar';
};

const applyDocumentDirection = (lng) => {
  const normalized = normalizeLanguage(lng);
  document.documentElement.dir = normalized === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.lang = normalized;
};

const loadTranslation = async (lang) => {
  const normalized = normalizeLanguage(lang);
  if (normalized === 'ar') {
    const mod = await import('../public/locales/ar/translation.json');
    return mod.default;
  }
  const mod = await import('../public/locales/en/translation.json');
  return mod.default;
};

const savedLang = getSavedLanguage();
const initialTranslation = await loadTranslation(savedLang);

i18n
  .use(initReactI18next)
  .init({
    resources: {
      [savedLang]: { translation: initialTranslation },
    },
    fallbackLng: 'ar',
    lng: savedLang,
    supportedLngs: ['ar', 'en'],
    nonExplicitSupportedLngs: true,
    load: 'languageOnly',
    debug: false,
    react: {
      useSuspense: false,
    },
    interpolation: {
      escapeValue: false,
    },
  });

i18n.on('languageChanged', async (lng) => {
  const normalized = normalizeLanguage(lng);
  localStorage.setItem('i18nextLng', normalized);
  applyDocumentDirection(normalized);

  if (!i18n.hasResourceBundle(normalized, 'translation')) {
    const translation = await loadTranslation(normalized);
    i18n.addResourceBundle(normalized, 'translation', translation, true, true);
  }
});

applyDocumentDirection(savedLang);

export const getAppLanguage = (lng = i18n.language) => normalizeLanguage(lng);

export const setAppLanguage = (lang) => {
  const normalized = normalizeLanguage(lang);
  localStorage.setItem('i18nextLng', normalized);
  window.location.reload();
};

export const toggleAppLanguage = () => {
  const current = getAppLanguage();
  setAppLanguage(current === 'ar' ? 'en' : 'ar');
};

export { normalizeLanguage };

export default i18n;
