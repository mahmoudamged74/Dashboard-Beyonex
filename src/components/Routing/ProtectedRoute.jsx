import React from 'react';
import { Navigate } from 'react-router-dom';

import { getToken } from '../../utils/authStorage';

/**
 * Wraps routes that require authentication.
 * If no token → redirect to /login.
 */
const ProtectedRoute = ({ children }) => {
  const token = getToken();
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default ProtectedRoute;
