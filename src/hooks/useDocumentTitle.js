import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  APP_TITLE,
  ROUTE_TITLE_KEYS,
  buildDocumentTitle,
  getRoutePathname,
} from '../utils/pageTitles';

export function useDocumentTitle() {
  const { pathname } = useLocation();
  const { t, i18n } = useTranslation();

  useEffect(() => {
    const path = getRoutePathname(pathname);
    const titleKey = ROUTE_TITLE_KEYS[path];
    const pageTitle = titleKey ? t(titleKey) : null;
    document.title = buildDocumentTitle(pageTitle, APP_TITLE);
  }, [pathname, t, i18n.language]);
}
