/** Request lifecycle status for async Redux state */
export const REQUEST_STATUS = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCEEDED: 'succeeded',
  FAILED: 'failed',
};

/** Slice name prefixes — used by createAsyncThunk type strings */
export const SLICE = {
  AUTH: 'auth',
  HERO: 'hero',
  SERVICES: 'services',
  SETTINGS: 'settings',
  WHY_US: 'whyUs',
  ABOUT: 'about',
  ROLES: 'roles',
  ADMINS: 'admins',
  PROFILE: 'profile',
  MESSAGES: 'messages',
  PARTNERS: 'partners',
};

/** API resource endpoints */
export const ENDPOINTS = {
  LOGIN: 'admin/login',
  LOGOUT: 'admin/logout',
  HERO: 'admin/hero-section',
  SERVICES: 'admin/services',
  SETTINGS: 'admin/settings',
  WHY_US: 'admin/why-us',
  ABOUT_PAGE: 'admin/about-page',
  HERO_FEATURES: 'admin/about/hero-features',
  MILESTONES: 'admin/about/milestones',
  ACHIEVEMENTS: 'admin/about/achievements',
  CORE_VALUES: 'admin/about/core-values',
  TEAM_MEMBERS: 'admin/team-members',
  ROLES: 'admin/roles',
  ROLE_PERMISSIONS: 'admin/roles/permissions',
  ADMINS: 'admin/admins',
  PROFILE: 'admin/profile',
  MESSAGES: 'admin/messages',
  PARTNERS: 'admin/partners',
  PUBLIC_ABOUT: 'about',
};
