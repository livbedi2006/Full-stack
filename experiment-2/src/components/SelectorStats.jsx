import React, { useState } from 'react';
import RenderMonitor from './RenderMonitor';
import { postSelectorMetrics, selectFilteredPosts, selectPostsAndPlatforms, selectPostsGroupedByPlatform } from '../selectors/postSelectors';
import { analyticsSelectorMetrics, selectPostAnalytics } from '../selectors/analyticsSelectors';
import { ZapIcon, RefreshCwIcon, CheckCircleIcon } from './Icons';

/**
 * SelectorStats Component (Experiment 2: Performance Module)
 * 
 * Demonstrates:
 * 1. Selector Recomputations vs Component Renders:
 *    Shows real-time telemetry of how many times each memoized selector executed.
 * 2. Unrelated State Isolation:
 *    Allows toggling local UI state (unrelated to Redux store).
 *    Observation: Component renders increase, but selector recomputations STAY FROZEN!
 */
export default function SelectorStats({ onTriggerUnrelatedState, _unrelatedStateValue }) {
  // Local state for demonstration
  const [localCounter, setLocalCounter] = useState(0);
  const [accentStyle, setAccentStyle] = useState('indigo');

  // Query actual recomputation counts from createSelector instances & telemetry
  const filteredRecomputations = selectFilteredPosts.recomputations
    ? selectFilteredPosts.recomputations()
    : postSelectorMetrics.filteredPostsRecomputations;

  const analyticsRecomputations = selectPostAnalytics.recomputations
    ? selectPostAnalytics.recomputations()
    : analyticsSelectorMetrics.postAnalyticsRecomputations;

  const groupedRecomputations = selectPostsGroupedByPlatform.recomputations
    ? selectPostsGroupedByPlatform.recomputations()
    : postSelectorMetrics.groupedRecomputations;

  const postsAndPlatformsRecomputations = selectPostsAndPlatforms.recomputations
    ? selectPostsAndPlatforms.recomputations()
    : postSelectorMetrics.postsAndPlatformsRecomputations;

  const validRecomputations = postSelectorMetrics.validPostsRecomputations;

  const handleToggleAccent = () => {
    setAccentStyle((prev) => (prev === 'indigo' ? 'emerald' : prev === 'emerald' ? 'amber' : 'indigo'));
    setLocalCounter((c) => c + 1);
    if (onTriggerUnrelatedState) onTriggerUnrelatedState();
  };

  return (
    <div className="selector-stats-card">
      <div className="card-header-flex">
        <div className="title-with-icon">
          <ZapIcon size={18} color="#f59e0b" />
          <h3 className="section-heading">Memoized Selector Telemetry</h3>
        </div>
        <RenderMonitor name="SelectorStats" />
      </div>

      <p className="card-desc">
        <code>createSelector</code> guarantees that recalculations only trigger when
        direct input references change. Unrelated UI renders consume cached results instantly.
      </p>

      {/* Grid of live recomputation counters */}
      <div className="recomputation-metrics-grid">
        <div className="metric-pill-item">
          <span className="metric-pill-label">Filtered Posts Selector</span>
          <div className="metric-pill-count">
            <span className="metric-num">{filteredRecomputations}</span>
            <span className="metric-unit">recomputations</span>
          </div>
        </div>

        <div className="metric-pill-item">
          <span className="metric-pill-label">Post Analytics Selector</span>
          <div className="metric-pill-count">
            <span className="metric-num">{analyticsRecomputations}</span>
            <span className="metric-unit">recomputations</span>
          </div>
        </div>

        <div className="metric-pill-item">
          <span className="metric-pill-label">Grouped Posts Selector</span>
          <div className="metric-pill-count">
            <span className="metric-num">{groupedRecomputations}</span>
            <span className="metric-unit">recomputations</span>
          </div>
        </div>

        <div className="metric-pill-item">
          <span className="metric-pill-label">Multi-Input (Posts + Platforms)</span>
          <div className="metric-pill-count">
            <span className="metric-num">{postsAndPlatformsRecomputations}</span>
            <span className="metric-unit">recomputations</span>
          </div>
        </div>

        <div className="metric-pill-item">
          <span className="metric-pill-label">Valid Posts Selector</span>
          <div className="metric-pill-count">
            <span className="metric-num">{validRecomputations}</span>
            <span className="metric-unit">recomputations</span>
          </div>
        </div>
      </div>

      {/* Interactive Unrelated State Demonstration */}
      <div className="unrelated-state-interactive-box">
        <div className="interactive-box-header">
          <strong>Interactive Test: Unrelated UI State Isolation</strong>
          <span className="status-tag">Local Clicks: {localCounter}</span>
        </div>
        <p className="small-text">
          Click below to update local component state (toggling accent & local counter).
          Notice the <strong>RenderMonitor badge increments</strong>, but the selector
          recomputations above <strong>do NOT increase</strong>!
        </p>

        <div className="interactive-actions-row">
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={handleToggleAccent}
          >
            <RefreshCwIcon size={13} />
            <span>Toggle Unrelated UI State ({accentStyle})</span>
          </button>

          <span className="memo-proof-badge">
            <CheckCircleIcon size={14} color="#10b981" />
            <span>Memoization Active: Zero Redundant Calculations</span>
          </span>
        </div>
      </div>
    </div>
  );
}
