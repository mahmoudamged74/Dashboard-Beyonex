const TOKEN_KEY = 'token';
const PERMISSIONS_KEY = 'permissions';
const REMEMBER_KEY = 'rememberMe';
const EMAIL_KEY = 'rememberedEmail';

export const getRememberMe = () => localStorage.getItem(REMEMBER_KEY) === '1';

export const getRememberedEmail = () => {
  if (!getRememberMe()) return '';
  return localStorage.getItem(EMAIL_KEY) || '';
};

export const getToken = () =>
  localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);

export const getPermissionsRaw = () =>
  localStorage.getItem(PERMISSIONS_KEY) || sessionStorage.getItem(PERMISSIONS_KEY);

export const saveAuthSession = ({ token, permissions, rememberMe, email }) => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(PERMISSIONS_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(PERMISSIONS_KEY);

  const storage = rememberMe ? localStorage : sessionStorage;
  storage.setItem(TOKEN_KEY, token);
  storage.setItem(PERMISSIONS_KEY, JSON.stringify(permissions));

  localStorage.setItem(REMEMBER_KEY, rememberMe ? '1' : '0');

  if (rememberMe && email) {
    localStorage.setItem(EMAIL_KEY, email);
  } else {
    localStorage.removeItem(EMAIL_KEY);
  }
};

export const clearAuthSession = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(PERMISSIONS_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(PERMISSIONS_KEY);
};
