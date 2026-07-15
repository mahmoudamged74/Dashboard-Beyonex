const REFRESHING_SLICES = [
  'hero',
  'services',
  'settings',
  'whyUs',
  'about',
  'roles',
  'admins',
  'profile',
  'messages',
];

export const selectIsRefreshing = (state) =>
  REFRESHING_SLICES.some((key) => Boolean(state[key]?.refreshing));
