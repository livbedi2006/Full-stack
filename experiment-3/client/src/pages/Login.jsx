import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoginForm from '../components/LoginForm';
import { ShieldIcon, KeyIcon, LockIcon } from '../components/Icons';

/**
 * Login Page (Experiment 3: JWT)
 */
export default function Login() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // If already authenticated, redirect straight to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="login-page-container">
      {/* Page Header */}
      <div className="login-hero-block">
        <div className="badge-row">
          <span className="badge exp3-badge">EXPERIMENT 3</span>
          <span className="badge badge-accent">TOKEN-BASED SECURITY</span>
        </div>
        <h1 className="page-hero-title">
          Secure Authentication Using JSON Web Tokens (JWT)
        </h1>
        <p className="page-hero-sub">
          A full-stack implementation demonstrating cryptographic token issuance,
          <code>sessionStorage</code> persistence, stateless verification, and role-based access control.
        </p>
      </div>

      {/* Main Login Form Component */}
      <LoginForm />

      {/* Footer Lab Meta */}
      <div className="login-footer-meta">
        <div className="meta-card">
          <ShieldIcon size={16} color="#818cf8" />
          <span>Stateless Sessions • Zero Server Database Polling</span>
        </div>
        <div className="meta-card">
          <LockIcon size={16} color="#34d399" />
          <span>Bcrypt Salted Hashing • Passwords Never Stored in Plaintext</span>
        </div>
        <div className="meta-card">
          <KeyIcon size={16} color="#f59e0b" />
          <span>HMAC-SHA256 Cryptographic Signatures</span>
        </div>
      </div>
    </div>
  );
}
