import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AlertTriangleIcon, ArrowRightIcon } from '../components/Icons';

/**
 * Unauthorized Page (HTTP 403 Forbidden Demonstration)
 */
export default function Unauthorized() {
  const { user } = useAuth();
  const location = useLocation();
  const requiredRole = location.state?.requiredRole || 'admin';

  return (
    <div className="unauthorized-page-container">
      <div className="unauthorized-card">
        <div className="unauthorized-icon-badge">
          <AlertTriangleIcon size={32} color="#f59e0b" />
        </div>

        <span className="badge badge-warning">HTTP 403 FORBIDDEN</span>

        <h2 className="unauthorized-title">Access Denied: Insufficient Privileges</h2>

        <p className="unauthorized-text">
          Your active session token is cryptographically valid, but your assigned role
          (<strong>{user?.role || 'unknown'}</strong>) does not grant permission to access this resource.
        </p>

        <div className="unauthorized-details-box">
          <div><span>Authenticated Identity:</span> <strong>{user?.email}</strong></div>
          <div><span>Current Role:</span> <strong className="role-chip">{user?.role}</strong></div>
          <div><span>Required Role:</span> <strong className="role-chip role-required">{requiredRole}</strong></div>
        </div>

        <div className="unauthorized-actions">
          <Link to="/dashboard" className="btn btn-primary">
            <span>Return to Safe Dashboard</span>
            <ArrowRightIcon size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}
