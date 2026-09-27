import React from 'react';
import { useSelector } from 'react-redux';
import { selectPostAnalytics } from '../selectors/analyticsSelectors';
import { selectPostsGroupedByPlatform } from '../selectors/postSelectors';
import { selectAllPlatforms } from '../selectors/platformSelectors';
import RenderMonitor from './RenderMonitor';
import { PlatformIcon, BarChartIcon } from './Icons';

/**
 * DerivedAnalytics Component (Experiment 2: Performance Module)
 * 
 * Demonstrates:
 * 1. Pure Derived State:
 *    Calculates totals, averages, min/max lengths, and validity statistics on the fly.
 *    No duplicated numeric counters stored in the Redux store!
 * 2. Grouped Posts Memoization:
 *    Displays distribution calculated by `selectPostsGroupedByPlatform`.
 * 3. Render Count Monitoring:
 *    Shows when the analytics section renders.
 */
export default function DerivedAnalytics() {
  // Efficient Redux state access via targeted memoized selectors
  const analytics = useSelector(selectPostAnalytics);
  const groupedPosts = useSelector(selectPostsGroupedByPlatform);
  const platforms = useSelector(selectAllPlatforms);

  return (
    <div className="derived-analytics-card">
      <div className="card-header-flex">
        <div className="title-with-icon">
          <BarChartIcon size={18} color="#3b82f6" />
          <h3 className="section-heading">Derived State & Platform Grouping</h3>
        </div>
        <RenderMonitor name="AnalyticsSection" />
      </div>

      <p className="card-desc">
        All figures below are computed purely in memory through memoized selectors.
        Zero counter fields exist in Redux state!
      </p>

      {/* Top Aggregation Cards */}
      <div className="analytics-stat-row">
        <div className="derived-stat-card">
          <span className="stat-label">Total Posts</span>
          <span className="stat-value">{analytics.total}</span>
          <span className="stat-note">Normalized Entities</span>
        </div>

        <div className="derived-stat-card">
          <span className="stat-label">Published</span>
          <span className="stat-value text-success">{analytics.published}</span>
          <span className="stat-note">Derived Filter</span>
        </div>

        <div className="derived-stat-card">
          <span className="stat-label">Draft Posts</span>
          <span className="stat-value text-warning">{analytics.drafts}</span>
          <span className="stat-note">Cross-Slice Joint</span>
        </div>

        <div className="derived-stat-card">
          <span className="stat-label">Valid Posts</span>
          <span className="stat-value text-accent">{analytics.validPosts}</span>
          <span className="stat-note">Satisfy Platform Limits</span>
        </div>

        <div className="derived-stat-card">
          <span className="stat-label">Invalid Posts</span>
          <span className="stat-value text-danger">{analytics.invalidPosts}</span>
          <span className="stat-note">Exceed Constraints</span>
        </div>
      </div>

      {/* Character Metrics Strip */}
      <div className="derived-character-metrics">
        <div className="char-metric-box">
          <span className="char-metric-label">Average Post Length</span>
          <strong className="char-metric-value">{analytics.averageLength}</strong>
          <span className="char-metric-unit">characters</span>
        </div>

        <div className="char-metric-box">
          <span className="char-metric-label">Longest Post</span>
          <strong className="char-metric-value">{analytics.longestPost}</strong>
          <span className="char-metric-unit">characters</span>
        </div>

        <div className="char-metric-box">
          <span className="char-metric-label">Shortest Post</span>
          <strong className="char-metric-value">{analytics.shortestPost}</strong>
          <span className="char-metric-unit">characters</span>
        </div>
      </div>

      {/* Grouped Posts By Platform Breakdown */}
      <div className="grouped-platforms-section">
        <h4 className="sub-heading">Posts Grouped by Platform (selectPostsGroupedByPlatform)</h4>
        <div className="grouped-platform-grid">
          {platforms.map((p) => {
            const count = (groupedPosts[p.id] || []).length;
            return (
              <div key={p.id} className="platform-group-card" style={{ '--accent-border': p.brandColor }}>
                <div className="platform-group-top">
                  <div className="platform-icon-wrap" style={{ backgroundColor: p.brandColor }}>
                    <PlatformIcon platformId={p.id} size={15} color="#ffffff" />
                  </div>
                  <div>
                    <span className="platform-group-name">{p.name}</span>
                    <span className="platform-group-limit">Max: {p.characterLimit.toLocaleString()} ch</span>
                  </div>
                </div>
                <div className="platform-group-count">
                  <span className="count-number">{count}</span>
                  <span className="count-label">Assigned Posts</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
