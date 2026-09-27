import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute Component (Experiment 3: JWT)
 * 
 * Demonstrates:
 * 1. Client-side route protection based on authentication state in AuthContext.
 * 2. Redirection: Unauthenticated users are redirected to `/login`, preserving
 *    the intended target route in location state.
 * 3. Role-Based Access Control (RBAC): If `requiredRole` is specified and user's role
 *    doesn't match, redirects to `/unauthorized`.
 */
export default function ProtectedRoute({ children, requiredRole = null }) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  // If session is still verifying on mount, show accessible spinner
  if (isLoading) {
    return (
      <div className="auth-loading-screen" role="status" aria-live="polite">
        <div className="spinner-lg" />
        <p className="loading-text">Verifying security token with server...</p>
      </div>
    );
  }

  // If not authenticated, redirect to login page
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If role is required and user does not match, redirect to unauthorized page
  if (requiredRole && user?.role !== requiredRole && user?.role !== 'admin') {
    return <Navigate to="/unauthorized" state={{ requiredRole }} replace />;
  }

  return children;
}
