import React, { createContext, useContext, useState, useCallback } from 'react';

const AuthContext = createContext(null);

/**
 * Reads permissions saved in localStorage (as JSON array of keys).
 */
const loadPermissions = () => {
  try {
    const raw = localStorage.getItem('permissions');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const AuthProvider = ({ children }) => {
  const [permissions, setPermissionsState] = useState(loadPermissions);

  const setPermissions = useCallback((permArray) => {
    localStorage.setItem('permissions', JSON.stringify(permArray));
    setPermissionsState(permArray);
  }, []);

  const clearPermissions = useCallback(() => {
    localStorage.removeItem('permissions');
    setPermissionsState([]);
  }, []);

  /**
   * Check if the logged-in admin has a specific permission key.
   * Pass '*' to check if ANY permissions exist (i.e., logged in).
   */
  const hasPermission = useCallback(
    (key) => {
      if (!key) return true;        // no restriction
      if (permissions.length === 0) return false;
      return permissions.includes(key);
    },
    [permissions]
  );

  return (
    <AuthContext.Provider value={{ permissions, hasPermission, setPermissions, clearPermissions }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};

export default AuthContext;
