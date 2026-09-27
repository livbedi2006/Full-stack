import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldIcon, UserIcon, LogOutIcon, KeyIcon } from './Icons';

/**
 * Navbar Component (Experiment 3: JWT)
 */
export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout('You have been logged out successfully.');
    navigate('/login');
  };

  return (
    <header className="app-navbar">
      <div className="navbar-container">
        {/* Brand Group */}
        <Link to="/" className="navbar-brand-link">
          <div className="navbar-logo-badge">
            <ShieldIcon size={20} color="#ffffff" />
          </div>
          <div>
            <div className="navbar-title-row">
              <span className="navbar-title">JWT Auth Guard</span>
              <span className="badge exp3-badge">EXPERIMENT 3</span>
            </div>
            <span className="navbar-subtext">
              Secure JSON Web Token Authentication & RBAC
            </span>
          </div>
        </Link>

        {/* Right Action / Auth State */}
        <div className="navbar-user-actions">
          {isAuthenticated && user ? (
            <div className="auth-profile-pill">
              <div className="user-avatar-circle" title={user.name}>
                <UserIcon size={14} color="#a5b4fc" />
              </div>
              <div className="user-details-mini">
                <span className="user-name-display">{user.name}</span>
                <span className={`role-badge role-${user.role}`}>
                  {user.role?.toUpperCase()}
                </span>
              </div>

              <button
                type="button"
                className="btn-logout"
                onClick={handleLogout}
                title="Log out and destroy session token"
              >
                <LogOutIcon size={15} />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <Link to="/login" className="btn btn-primary btn-sm">
              <KeyIcon size={14} />
              <span>Login Portal</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
