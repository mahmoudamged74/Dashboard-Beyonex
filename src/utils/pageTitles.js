export const APP_TITLE = 'Beyonex Admin';

/** Maps route paths to i18n keys for the browser tab page segment. */
export const ROUTE_TITLE_KEYS = {
  '/': 'dashboard',
  '/home': 'home',
  '/about': 'about',
  '/services': 'services',
  '/why-us': 'why_us',
  '/partners': 'partners',
  '/profile': 'profile.title',
  '/roles': 'roles_manager',
  '/admins': 'admins_manager',
  '/settings': 'settings',
  '/messages': 'messages_manager',
  '/login': 'login.sign_in',
};

export function getRoutePathname(pathname) {
  const normalized = pathname.replace(/\/+$/, '');
  return normalized || '/';
}

export function buildDocumentTitle(pageTitle, appTitle = APP_TITLE) {
  if (!pageTitle) return appTitle;
  return `${pageTitle} | ${appTitle}`;
}
