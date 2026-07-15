import { useCallback } from 'react';
import { useAppSelector } from './useRedux';
import { selectPermissions } from '../redux/reducers/authReducer';

/**
 * Check permissions from Redux auth state.
 *
 * Usage:
 *   const { can } = usePermission();
 *   if (can('roles.create')) { ... }
 */
const usePermission = () => {
  const permissions = useAppSelector(selectPermissions);

  const can = useCallback(
    (key) => {
      if (!key) return true;
      if (!permissions.length) return false;
      return permissions.includes(key);
    },
    [permissions]
  );

  return { can, permissions };
};

export default usePermission;
