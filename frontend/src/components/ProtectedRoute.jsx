import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { token, user, role, isAuthenticated, isAdmin } = useAuth();

  if (!isAuthenticated && !token) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !isAdmin && role !== 'admin' && user?.role !== 'admin') {
    return <Navigate to="/classes" replace />;
  }

  return children;
};

export default ProtectedRoute;
