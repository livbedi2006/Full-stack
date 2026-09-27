import React from 'react';
import { PLATFORMS } from '../data/platforms';
import { PlatformIcon, CheckIcon } from './Icons';

/**
 * PlatformSelector Component
 * 
 * Allows users to choose one or more target platforms.
 * Displays platform constraints (char limit, media limit, hashtags).
 */
export default function PlatformSelector({ selectedPlatforms, onTogglePlatform, onSelectAll, onDeselectAll }) {
  const platformKeys = Object.keys(PLATFORMS);
  const allSelected = platformKeys.length > 0 && selectedPlatforms.length === platformKeys.length;

  return (
    <section className="composer-card platform-selector-card" aria-labelledby="platform-selection-heading">
      <div className="card-header">
        <div>
          <h2 id="platform-selection-heading" className="card-title">
            1. Target Platforms
          </h2>
          <p className="card-subtitle">
            Select one or more destinations to evaluate concurrent constraint rules
          </p>
        </div>
        <div className="selector-actions">
          <button
            type="button"
            className="text-action-btn"
            onClick={allSelected ? onDeselectAll : onSelectAll}
            aria-label={allSelected ? 'Deselect all platforms' : 'Select all platforms'}
          >
            {allSelected ? 'Deselect All' : 'Select All (4)'}
          </button>
        </div>
      </div>

      <div className="platform-grid" role="group" aria-label="Social media platform selection">
        {platformKeys.map(key => {
          const platform = PLATFORMS[key];
          const isSelected = selectedPlatforms.includes(key);

          return (
            <button
              key={platform.id}
              type="button"
              id={`platform-btn-${platform.id}`}
              role="checkbox"
              aria-checked={isSelected}
              className={`platform-card ${isSelected ? 'selected' : ''}`}
              style={{
                '--brand-color': platform.brandColor,
                '--brand-gradient': platform.gradient
              }}
              onClick={() => onTogglePlatform(platform.id)}
            >
              <div className="platform-card-header">
                <div className="platform-avatar">
                  <PlatformIcon platformId={platform.id} size={22} color={isSelected ? '#ffffff' : platform.brandColor} />
                </div>
                <div className={`platform-checkbox-indicator ${isSelected ? 'checked' : ''}`}>
                  {isSelected && <CheckIcon size={14} color="#ffffff" />}
                </div>
              </div>

              <div className="platform-info">
                <span className="platform-name">{platform.name}</span>
                <span className="platform-tagline">{platform.tagline}</span>
              </div>

              <div className="platform-specs">
                <span className="spec-badge spec-char" title="Maximum character limit">
                  {platform.specs.charLimit}
                </span>
                <span className="spec-badge spec-media" title="Media upload constraint">
                  {platform.specs.mediaLimit}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {selectedPlatforms.length === 0 && (
        <div className="platform-warning-alert" role="alert">
          <span className="alert-dot"></span>
          No platform selected. Select at least one platform to start validation.
        </div>
      )}
    </section>
  );
}
