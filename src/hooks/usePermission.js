import { useAuth } from '../context/AuthContext';

/**
 * Convenient hook to check permissions.
 *
 * Usage:
 *   const { can } = usePermission();
 *   if (can('roles.create')) { ... }
 */
const usePermission = () => {
  const { hasPermission } = useAuth();
  return { can: hasPermission };
};

export default usePermission;
