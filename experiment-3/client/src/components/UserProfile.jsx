import React from 'react';
import { useAuth } from '../context/AuthContext';
import { UserIcon, CheckCircleIcon } from './Icons';

/**
 * UserProfile Component (Experiment 3: JWT)
 */
export default function UserProfile() {
  const { user, decodedToken } = useAuth();

  if (!user) return null;

  const expiresAt = decodedToken?.payload?.exp
    ? new Date(decodedToken.payload.exp * 1000).toLocaleTimeString()
    : 'Unknown';

  return (
    <div className="user-profile-card">
      <div className="profile-header-strip">
        <div className="profile-avatar-wrap">
          <UserIcon size={24} color="#818cf8" />
        </div>
        <div className="profile-headline">
          <h3 className="profile-name">{user.name}</h3>
          <span className="profile-email">{user.email}</span>
        </div>
        <div className="profile-badges-cluster">
          <span className={`role-badge role-${user.role}`}>
            {user.role?.toUpperCase()}
          </span>
          <span className="auth-status-badge">
            <CheckCircleIcon size={12} color="#10b981" />
            <span>Authenticated</span>
          </span>
        </div>
      </div>

      <div className="profile-attributes-grid">
        <div className="attribute-item">
          <span className="attr-label">Subject ID (Claim: sub)</span>
          <span className="attr-val mono">{user.id}</span>
        </div>

        <div className="attribute-item">
          <span className="attr-label">Assigned Department</span>
          <span className="attr-val">{user.department || 'Computer Science'}</span>
        </div>

        <div className="attribute-item">
          <span className="attr-label">Token Storage</span>
          <span className="attr-val text-accent">sessionStorage (Isolated Tab)</span>
        </div>

        <div className="attribute-item">
          <span className="attr-label">Token Expiration</span>
          <span className="attr-val mono">{expiresAt} (15m window)</span>
        </div>
      </div>
    </div>
  );
}
