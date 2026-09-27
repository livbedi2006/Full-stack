import React from 'react';
import { CheckIcon, AlertCircleIcon, AlertTriangleIcon, SparklesIcon, XIcon } from './Icons';

/**
 * StatusMessage Component
 * 
 * Displays overall publication status alerts, publish success confirmations,
 * or global constraint blocking notifications.
 */
export default function StatusMessage({
  validationSummary,
  publishSuccess,
  onDismissPublishSuccess
}) {
  if (publishSuccess) {
    return (
      <div className="status-banner publish-success-banner" role="status" aria-live="polite">
        <div className="banner-content-flex">
          <div className="banner-icon-circle success-circle">
            <SparklesIcon size={20} color="#ffffff" />
          </div>
          <div className="banner-text">
            <h4 className="banner-heading">Ready for Cross-Platform Publishing!</h4>
            <p className="banner-description">
              {publishSuccess.message}
            </p>
            <div className="success-meta-row">
              <span className="success-tag">
                Platforms: {publishSuccess.platforms.join(', ')}
              </span>
              <span className="success-tag">
                {publishSuccess.charCount} chars
              </span>
              {publishSuccess.mediaCount > 0 && (
                <span className="success-tag">
                  {publishSuccess.mediaCount} media {publishSuccess.mediaCount === 1 ? 'file' : 'files'}
                </span>
              )}
              {publishSuccess.hashtagCount > 0 && (
                <span className="success-tag">
                  {publishSuccess.hashtagCount} hashtags
                </span>
              )}
            </div>
          </div>
        </div>

        <button
          type="button"
          className="banner-close-btn"
          onClick={onDismissPublishSuccess}
          aria-label="Dismiss success message"
        >
          <XIcon size={16} />
        </button>
      </div>
    );
  }

  const { overallStatus, globalErrors = [], isValid, canPublish, selectedCount } = validationSummary;

  if (selectedCount === 0) {
    return (
      <div className="status-banner banner-warning" role="alert">
        <AlertTriangleIcon size={18} color="#f59e0b" />
        <div className="banner-text">
          <span className="banner-title">No target platforms selected</span>
          <span className="banner-sub">Select at least one social network above to activate constraint validation.</span>
        </div>
      </div>
    );
  }

  if (globalErrors.length > 0 && !canPublish) {
    return (
      <div className="status-banner banner-error" role="alert">
        <AlertCircleIcon size={18} color="#ef4444" />
        <div className="banner-text">
          <span className="banner-title">Validation Issues Detected</span>
          <ul className="banner-list">
            {globalErrors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  if (canPublish) {
    return (
      <div className="status-banner banner-valid" role="status">
        <CheckIcon size={18} color="#10b981" />
        <div className="banner-text">
          <span className="banner-title">All Platform Constraints Satisfied</span>
          <span className="banner-sub">Your post content meets requirements across all {selectedCount} selected platforms.</span>
        </div>
      </div>
    );
  }

  return null;
}
