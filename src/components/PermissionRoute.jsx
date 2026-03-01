import React from 'react';
import { Navigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import usePermission from '../hooks/usePermission';

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
  const token = localStorage.getItem('token');

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
