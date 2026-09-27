import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LockIcon, UserIcon, AlertTriangleIcon, ArrowRightIcon } from './Icons';

/**
 * LoginForm Component (Experiment 3: JWT Authentication)
 */
export default function LoginForm() {
  const { login, sessionNotice, clearSessionNotice } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Target route after successful login
  const from = location.state?.from?.pathname || '/dashboard';

  const validate = () => {
    const errs = {};
    if (!email.trim()) {
      errs.email = 'Email or username is required.';
    } else if (!email.includes('@') && email.length < 3) {
      errs.email = 'Please provide a valid email or username.';
    }

    if (!password) {
      errs.password = 'Password is required.';
    } else if (password.length < 4) {
      errs.password = 'Password must be at least 4 characters.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    clearSessionNotice();

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const result = await login(email.trim(), password);
      if (result.success) {
        navigate(from, { replace: true });
      } else {
        setServerError(result.error || 'Authentication failed. Please check credentials.');
      }
    } catch {
      setServerError('An unexpected network error occurred. Ensure backend is running.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillCredentials = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setErrors({});
    setServerError('');
  };

  return (
    <div className="login-card-wrapper">
      {/* Session Expired / Logged Out Notice */}
      {sessionNotice && (
        <div className="alert-banner alert-warning" role="alert">
          <AlertTriangleIcon size={16} color="#f59e0b" />
          <span>{sessionNotice}</span>
        </div>
      )}

      {/* Server Authentication Error Alert */}
      {serverError && (
        <div className="alert-banner alert-danger" role="alert">
          <AlertTriangleIcon size={16} color="#ef4444" />
          <span>{serverError}</span>
        </div>
      )}

      {/* Login Card */}
      <div className="login-card">
        <div className="login-card-header">
          <div className="login-icon-badge">
            <LockIcon size={24} color="#6366f1" />
          </div>
          <h2 className="login-heading">Student & Faculty Portal</h2>
          <p className="login-subtext">
            Authenticate to receive a signed, stateless JSON Web Token (JWT).
          </p>
        </div>

        <form onSubmit={handleSubmit} className="login-form-body" noValidate>
          {/* Email / Username Input */}
          <div className="form-group">
            <label htmlFor="login-email" className="form-label">
              <span>Email / Username</span>
              <span className="required-star">*</span>
            </label>
            <div className="input-with-icon">
              <UserIcon size={16} className="input-icon" />
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors((prev) => ({ ...prev, email: null }));
                }}
                placeholder="student@example.com"
                className={`form-input ${errors.email ? 'input-error' : ''}`}
                autoComplete="email"
                disabled={isSubmitting}
              />
            </div>
            {errors.email && <span className="field-error-text">{errors.email}</span>}
          </div>

          {/* Password Input */}
          <div className="form-group">
            <div className="label-with-toggle">
              <label htmlFor="login-password" className="form-label">
                <span>Password</span>
                <span className="required-star">*</span>
              </label>
              <button
                type="button"
                className="btn-toggle-pass"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            <div className="input-with-icon">
              <LockIcon size={16} className="input-icon" />
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors((prev) => ({ ...prev, password: null }));
                }}
                placeholder="••••••••••••"
                className={`form-input ${errors.password ? 'input-error' : ''}`}
                autoComplete="current-password"
                disabled={isSubmitting}
              />
            </div>
            {errors.password && <span className="field-error-text">{errors.password}</span>}
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            className="btn btn-primary btn-block btn-lg"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="spinner-sm" />
                <span>Authenticating & Signing JWT...</span>
              </>
            ) : (
              <>
                <span>Secure Login</span>
                <ArrowRightIcon size={16} />
              </>
            )}
          </button>
        </form>

        {/* Academic Demo Presets */}
        <div className="demo-credentials-section">
          <div className="demo-divider">
            <span>LAB DEMO CREDENTIALS</span>
          </div>

          <p className="demo-explainer-text">
            For academic demonstration, mock passwords are saved as salted <code>bcrypt</code> hashes on the Node server.
          </p>

          <div className="demo-buttons-grid">
            <button
              type="button"
              className="demo-btn student-demo"
              onClick={() => fillCredentials('student@example.com', 'student123')}
              disabled={isSubmitting}
            >
              <span className="demo-role">Student Role</span>
              <span className="demo-user">student@example.com</span>
              <span className="demo-pwd">student123</span>
            </button>

            <button
              type="button"
              className="demo-btn admin-demo"
              onClick={() => fillCredentials('admin@example.com', 'admin123')}
              disabled={isSubmitting}
            >
              <span className="demo-role">Admin Role</span>
              <span className="demo-user">admin@example.com</span>
              <span className="demo-pwd">admin123</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
