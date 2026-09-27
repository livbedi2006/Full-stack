import React from 'react';
import { PlatformIcon, CheckIcon } from './Icons';

/**
 * PlatformCard Component (Experiment 2)
 * 
 * Displays individual platform specifications loaded directly from Redux store.
 */
export default function PlatformCard({ platform }) {
  const { name, brandColor, characterLimit, mediaSupported, maxMedia, status, tagline } = platform;

  return (
    <div
      className="platform-spec-card"
      style={{ '--platform-color': brandColor }}
      aria-label={`${name} configuration`}
    >
      <div className="platform-spec-header">
        <div className="platform-avatar-box">
          <PlatformIcon platformId={platform.id} size={22} color="#ffffff" />
        </div>
        <div className="platform-title-block">
          <h4 className="platform-card-name">{name}</h4>
          <span className="platform-tagline-text">{tagline}</span>
        </div>
        <span className="status-indicator-badge">
          <CheckIcon size={12} color="#10b981" />
          <span>{status || 'active'}</span>
        </span>
      </div>

      <div className="platform-metrics-list">
        <div className="platform-metric-row">
          <span className="p-label">Character Limit:</span>
          <span className="p-val font-mono">{characterLimit.toLocaleString()} chars</span>
        </div>

        <div className="platform-metric-row">
          <span className="p-label">Media Support:</span>
          <span className={`p-val ${mediaSupported ? 'text-valid' : 'text-danger'}`}>
            {mediaSupported ? 'Supported' : 'No'}
          </span>
        </div>

        <div className="platform-metric-row">
          <span className="p-label">Max Media Files:</span>
          <span className="p-val font-mono">{maxMedia} files</span>
        </div>
      </div>
    </div>
  );
}
