import React from 'react';
import { AlertCircleIcon, AlertTriangleIcon, CheckIcon, HashIcon } from './Icons';

/**
 * CharacterCounter Component
 * 
 * Displays real-time character analytics, visual progress bars,
 * active platform thresholds, and identifies strictest constraint boundaries.
 */
export default function CharacterCounter({
  charCount = 0,
  strictestPlatform,
  platformResults = {},
  selectedPlatforms = [],
  hashtagCount = 0
}) {
  const hasSelectedPlatforms = selectedPlatforms.length > 0;
  const strictestLimit = strictestPlatform ? strictestPlatform.characterLimit : null;
  const strictestRemaining = strictestLimit !== null ? strictestLimit - charCount : null;
  const isOverStrictest = strictestRemaining !== null && strictestRemaining < 0;

  // Strictest percent (capped at 100 for visual bar)
  const percentUsed = strictestLimit ? Math.min(100, Math.round((charCount / strictestLimit) * 100)) : 0;

  // Determine counter status
  let counterStatusClass = 'status-valid';
  let statusIcon = <CheckIcon size={16} />;
  let statusText = 'Within all limits';

  // Check if any selected platform has errors
  const platformsInError = Object.values(platformResults).filter(res => res.isOverLimit);
  const platformsInWarning = Object.values(platformResults).filter(res => res.warnings.some(w => w.includes('limit')));

  if (platformsInError.length > 0) {
    counterStatusClass = 'status-error';
    statusIcon = <AlertCircleIcon size={16} />;
    const platformNames = platformsInError.map(p => p.platformName).join(', ');
    statusText = `Exceeds limit on: ${platformNames}`;
  } else if (platformsInWarning.length > 0) {
    counterStatusClass = 'status-warning';
    statusIcon = <AlertTriangleIcon size={16} />;
    statusText = 'Approaching character limit';
  } else if (!hasSelectedPlatforms) {
    counterStatusClass = 'status-neutral';
    statusIcon = null;
    statusText = 'Select platforms to see limits';
  }

  return (
    <div className={`character-counter-container ${counterStatusClass}`}>
      {/* Top Bar: Primary Counts & Hashtags */}
      <div className="counter-primary-row">
        <div className="count-display">
          <span className="current-chars">{charCount.toLocaleString()}</span>
          {strictestLimit !== null && (
            <span className="limit-divider"> / {strictestLimit.toLocaleString()}</span>
          )}
          <span className="count-label">
            {strictestPlatform
              ? `chars (Strictest: ${strictestPlatform.name})`
              : 'characters'}
          </span>
        </div>

        <div className="counter-meta-badges">
          <div className="meta-badge hashtags-badge" title={`${hashtagCount} hashtags detected in text`}>
            <HashIcon size={13} />
            <span>{hashtagCount} {hashtagCount === 1 ? 'hashtag' : 'hashtags'}</span>
          </div>

          {strictestRemaining !== null && (
            <div className={`meta-badge remaining-badge ${isOverStrictest ? 'over' : strictestRemaining <= 25 ? 'warning' : 'safe'}`}>
              {isOverStrictest
                ? `${Math.abs(strictestRemaining)} over limit`
                : `${strictestRemaining} left`}
            </div>
          )}
        </div>
      </div>

      {/* Progress Bar for Strictest Platform */}
      {strictestLimit !== null && (
        <div className="progress-bar-wrapper" role="progressbar" aria-valuenow={charCount} aria-valuemin="0" aria-valuemax={strictestLimit}>
          <div
            className={`progress-fill ${isOverStrictest ? 'fill-error' : percentUsed > 85 ? 'fill-warning' : 'fill-valid'}`}
            style={{ width: `${percentUsed}%` }}
          />
        </div>
      )}

      {/* Active Platforms Character Breakdown Pills */}
      {hasSelectedPlatforms && (
        <div className="platform-ratios-pills">
          <span className="breakdown-label">Per-Platform Limits:</span>
          <div className="pills-list">
            {selectedPlatforms.map(platformId => {
              const res = platformResults[platformId];
              if (!res) return null;
              const isOver = res.isOverLimit;
              const hasWarn = res.warnings.length > 0;
              const pillClass = isOver ? 'pill-error' : hasWarn ? 'pill-warning' : 'pill-valid';

              return (
                <div
                  key={platformId}
                  className={`platform-ratio-pill ${pillClass}`}
                  title={`${res.platformName}: ${charCount}/${res.charLimit} chars (${res.remaining >= 0 ? `${res.remaining} remaining` : `${Math.abs(res.remaining)} over limit`})`}
                >
                  <span className="pill-dot" style={{ backgroundColor: res.brandColor }}></span>
                  <span className="pill-platform">{res.platformName}:</span>
                  <span className="pill-numbers">
                    {charCount.toLocaleString()} / {res.charLimit.toLocaleString()}
                  </span>
                  {isOver && <span className="pill-alert-badge">Over!</span>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Status banner text */}
      <div className="counter-status-strip">
        <div className="status-indicator-flex">
          {statusIcon}
          <span className="status-text">{statusText}</span>
        </div>
        {strictestPlatform && selectedPlatforms.length > 1 && (
          <span className="strictest-notice">
            Targeting lowest constraint ({strictestPlatform.name} at {strictestPlatform.characterLimit} chars)
          </span>
        )}
      </div>
    </div>
  );
}
