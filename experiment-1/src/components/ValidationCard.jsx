import React from 'react';
import { PlatformIcon, CheckIcon, AlertCircleIcon, AlertTriangleIcon, ImageIcon, HashIcon } from './Icons';

/**
 * ValidationCard Component
 * 
 * Displays individual platform constraint evaluation:
 * - Real-time character counts, limits, and remaining budget
 * - Media attachment rules and current quota
 * - Hashtag analysis
 * - Specific error and warning messages with distinct accessible icons
 */
export default function ValidationCard({ platformResult, platformConfig }) {
  if (!platformResult || !platformConfig) return null;

  const {
    platformName,
    status,
    isValid,
    charCount,
    charLimit,
    remaining,
    percentUsed,
    isOverLimit,
    mediaCount,
    maxMedia,
    requiresMedia,
    hashtagCount,
    errors = [],
    warnings = []
  } = platformResult;

  // Status configuration
  const statusMeta = {
    valid: {
      badgeClass: 'status-badge-valid',
      cardClass: 'card-valid',
      icon: <CheckIcon size={14} color="#10b981" />,
      label: 'Valid'
    },
    warning: {
      badgeClass: 'status-badge-warning',
      cardClass: 'card-warning',
      icon: <AlertTriangleIcon size={14} color="#f59e0b" />,
      label: 'Warning'
    },
    error: {
      badgeClass: 'status-badge-error',
      cardClass: 'card-error',
      icon: <AlertCircleIcon size={14} color="#ef4444" />,
      label: 'Action Required'
    }
  }[status] || {
    badgeClass: 'status-badge-neutral',
    cardClass: '',
    icon: null,
    label: 'Checking...'
  };

  return (
    <article
      className={`platform-validation-card ${statusMeta.cardClass}`}
      style={{ '--platform-color': platformConfig.brandColor }}
      aria-label={`${platformName} validation status: ${statusMeta.label}`}
    >
      {/* Top Banner: Identity & Status */}
      <div className="card-top-bar">
        <div className="platform-meta-flex">
          <div
            className="platform-mini-icon"
            style={{ backgroundColor: platformConfig.brandColor }}
          >
            <PlatformIcon platformId={platformConfig.id} size={16} color="#ffffff" />
          </div>
          <div>
            <h3 className="platform-title">{platformName}</h3>
            <span className="platform-tag">{platformConfig.tagline}</span>
          </div>
        </div>

        <div className={`platform-status-badge ${statusMeta.badgeClass}`}>
          {statusMeta.icon}
          <span>{statusMeta.label}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="char-progress-track" title={`${percentUsed}% of character limit used`}>
        <div
          className={`char-progress-bar ${isOverLimit ? 'bar-error' : percentUsed > 85 ? 'bar-warning' : 'bar-valid'}`}
          style={{ width: `${percentUsed}%` }}
        />
      </div>

      {/* Metrics Grid */}
      <div className="metrics-grid">
        {/* Characters Metric */}
        <div className="metric-box">
          <span className="metric-label">Characters</span>
          <div className="metric-value-row">
            <span className="metric-main-val">
              {charCount.toLocaleString()}
            </span>
            <span className="metric-limit"> / {charLimit.toLocaleString()}</span>
          </div>
          <span className={`metric-sub ${isOverLimit ? 'text-danger' : remaining <= 20 ? 'text-warning' : 'text-muted'}`}>
            {isOverLimit
              ? `${Math.abs(remaining).toLocaleString()} over limit`
              : `${remaining.toLocaleString()} remaining`}
          </span>
        </div>

        {/* Media Metric */}
        <div className="metric-box">
          <span className="metric-label">Media Files</span>
          <div className="metric-value-row">
            <ImageIcon size={14} className="metric-icon" />
            <span className="metric-main-val">{mediaCount}</span>
            <span className="metric-limit"> / {maxMedia} max</span>
          </div>
          <span className="metric-sub text-muted">
            {requiresMedia ? 'Required for post' : 'Optional'}
          </span>
        </div>

        {/* Hashtags Metric */}
        <div className="metric-box">
          <span className="metric-label">Hashtags</span>
          <div className="metric-value-row">
            <HashIcon size={14} className="metric-icon" />
            <span className="metric-main-val">{hashtagCount}</span>
            {platformConfig.hashtagRules?.hardLimit && (
              <span className="metric-limit"> / {platformConfig.hashtagRules.hardLimit}</span>
            )}
          </div>
          <span className="metric-sub text-muted">
            {platformConfig.hashtagRules?.maxRecommended
              ? `Best: ≤${platformConfig.hashtagRules.maxRecommended}`
              : 'Unrestricted'}
          </span>
        </div>
      </div>

      {/* Issues & Warnings List */}
      {(errors.length > 0 || warnings.length > 0) && (
        <div className="card-messages-container">
          {errors.map((err, idx) => (
            <div key={`err-${idx}`} className="feedback-message error-message" role="alert">
              <AlertCircleIcon size={14} color="#ef4444" />
              <span>{err}</span>
            </div>
          ))}

          {warnings.map((warn, idx) => (
            <div key={`warn-${idx}`} className="feedback-message warning-message">
              <AlertTriangleIcon size={14} color="#f59e0b" />
              <span>{warn}</span>
            </div>
          ))}
        </div>
      )}

      {/* Valid State Confirmation */}
      {isValid && warnings.length === 0 && (
        <div className="feedback-message valid-message">
          <CheckIcon size={14} color="#10b981" />
          <span>Post meets all {platformName} formatting constraints.</span>
        </div>
      )}
    </article>
  );
}
