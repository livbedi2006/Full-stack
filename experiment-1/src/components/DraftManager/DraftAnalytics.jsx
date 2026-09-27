import React from 'react';
import { BarChartIcon, ClockIcon, FolderIcon, PlatformIcon } from '../Icons';
import { PLATFORMS } from '../../data/platforms';

/**
 * DraftAnalytics Component
 * 
 * Displays derived statistics and platform distribution calculated from active drafts.
 */
export default function DraftAnalytics({ stats }) {
  const {
    totalDrafts,
    averageCharacters,
    longestDraftChars,
    platformCounts = {},
    mediaAttachmentCount,
    recentlyUpdatedCount
  } = stats;

  return (
    <div className="draft-analytics-card" aria-label="Draft system statistics">
      <div className="analytics-header">
        <div className="analytics-title-group">
          <BarChartIcon size={18} color="#38bdf8" />
          <h3 className="analytics-title">Draft Metrics & Analytics</h3>
        </div>
        <span className="analytics-badge">
          {recentlyUpdatedCount} updated in last 24h
        </span>
      </div>

      <div className="analytics-metrics-grid">
        <div className="analytics-metric-tile">
          <span className="metric-tile-label">Total Drafts</span>
          <span className="metric-tile-value">{totalDrafts}</span>
          <span className="metric-tile-sub">Active in storage</span>
        </div>

        <div className="analytics-metric-tile">
          <span className="metric-tile-label">Avg Characters</span>
          <span className="metric-tile-value">{averageCharacters}</span>
          <span className="metric-tile-sub">Max: {longestDraftChars} chars</span>
        </div>

        <div className="analytics-metric-tile">
          <span className="metric-tile-label">Media Items</span>
          <span className="metric-tile-value">{mediaAttachmentCount}</span>
          <span className="metric-tile-sub">Attached files</span>
        </div>
      </div>

      {/* Platform Allocation Distribution */}
      <div className="analytics-distribution">
        <span className="distribution-label">Distribution Across Platforms:</span>
        <div className="distribution-chips">
          {Object.keys(PLATFORMS).map(platformId => {
            const platform = PLATFORMS[platformId];
            const count = platformCounts[platformId] || 0;
            return (
              <div
                key={platformId}
                className="dist-chip"
                style={{ '--platform-color': platform.brandColor }}
              >
                <div className="dist-chip-icon">
                  <PlatformIcon platformId={platformId} size={14} color="#ffffff" />
                </div>
                <span className="dist-chip-name">{platform.name}:</span>
                <span className="dist-chip-count">{count}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
