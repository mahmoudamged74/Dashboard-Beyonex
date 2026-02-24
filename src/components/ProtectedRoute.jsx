import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * Wraps routes that require authentication.
 * If no token in localStorage → redirect to /login.
 */
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default ProtectedRoute;
