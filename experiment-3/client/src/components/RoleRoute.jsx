import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { isRoleAllowed } from '../config/roles';

/**
 * RoleRoute Component (Experiment 3: RBAC Module)
 * 
 * Reusable route guard for role-based authorization.
 * 
 * Flow:
 * 1. Checks if user is authenticated -> If not, redirects to /login.
 * 2. Checks if user's role matches `allowedRoles` -> If not, redirects to /unauthorized.
 * 3. If authorized -> Renders child component.
 */
export default function RoleRoute({ children, allowedRoles = [] }) {
  const { isAuthenticated, isLoading, role } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="auth-loading-screen" role="status" aria-live="polite">
        <div className="spinner-lg" />
        <p className="loading-text">Verifying authorization permissions...</p>
      </div>
    );
  }

  // 1. Authentication check
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. Authorization check
  if (allowedRoles.length > 0 && !isRoleAllowed(role, allowedRoles)) {
    return (
      <Navigate
        to="/unauthorized"
        state={{
          requiredRole: allowedRoles.join(' or '),
          attemptedPath: location.pathname
        }}
        replace
      />
    );
  }

  return children;
}
