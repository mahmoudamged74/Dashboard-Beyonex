import React from 'react';
import { Navigate } from 'react-router-dom';
import toast from '../../utils/toast';
import { usePermission } from '../../hooks';
import { getToken } from '../../utils/authStorage';

/**
 * Wraps a route and checks a permission key before rendering.
 * If the user lacks the permission, redirects to "/" with an error toast.
 *
 * Usage:
 *   <PermissionRoute permKey="roles.view">
 *     <RolesManager />
 *   </PermissionRoute>
 */
const PermissionRoute = ({ permKey, children }) => {
  const { can } = usePermission();
  const token = getToken();

  // If no token, wait for ProtectedRoute or logout logic to redirect (silent redirect to login)
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (!can(permKey)) {
    toast.error('ليس لديك صلاحية للوصول إلى هذه الصفحة');
    return <Navigate to="/" replace />;
  }

  return children;
};

export default PermissionRoute;
