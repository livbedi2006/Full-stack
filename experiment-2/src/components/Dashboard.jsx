import React from 'react';
import { useSelector } from 'react-redux';
import { selectDashboardStats } from '../selectors/selectors';
import { PlusIcon, RocketIcon, PlatformIcon } from './Icons';

/**
 * Dashboard Component (Experiment 2)
 * 
 * Demonstrates:
 * - Complex state aggregation calculated purely via memoized Redux createSelector
 * - Zero duplicated counters: values stay synchronized automatically across operations
 */
export default function Dashboard({ onNavigateTab }) {
  // Reading derived statistics calculated on-the-fly via createSelector
  const stats = useSelector(selectDashboardStats);

  const {
    totalPosts,
    totalDrafts,
    totalPlatforms,
    publishedCount,
    draftStatusCount,
    scheduledCount,
    platformDistribution = {},
    recentPosts = []
  } = stats;

  return (
    <div className="dashboard-layout">
      {/* Educational Architecture Callout */}
      <div className="edu-banner">
        <div className="edu-badge">ACADEMIC OBJECTIVE DEMONSTRATION</div>
        <h2 className="edu-title">Centralized Redux Toolkit Architecture</h2>
        <p className="edu-text">
          All application data is maintained in a single Redux store using normalized entity adapters
          (<code>createEntityAdapter</code>). The metrics below are computed via memoized selectors
          (<code>createSelector</code>) rather than duplicated component state, eliminating prop drilling!
        </p>
      </div>

      {/* Primary Metrics Grid */}
      <div className="metrics-summary-grid">
        <div className="metric-summary-card">
          <span className="summary-label">Total Posts</span>
          <span className="summary-number">{totalPosts}</span>
          <span className="summary-sub">Across all statuses</span>
        </div>

        <div className="metric-summary-card">
          <span className="summary-label">Published</span>
          <span className="summary-number text-published">{publishedCount}</span>
          <span className="summary-sub">Active live posts</span>
        </div>

        <div className="metric-summary-card">
          <span className="summary-label">Drafts Vault</span>
          <span className="summary-number text-drafts">{totalDrafts}</span>
          <span className="summary-sub">Pending review</span>
        </div>

        <div className="metric-summary-card">
          <span className="summary-label">Platforms</span>
          <span className="summary-number text-platforms">{totalPlatforms}</span>
          <span className="summary-sub">Target networks</span>
        </div>
      </div>

      {/* Content Grid: Distribution + Quick Actions & Recent Posts */}
      <div className="dashboard-content-split">
        {/* Left: Platform Distribution */}
        <div className="dash-card">
          <div className="dash-card-header">
            <h3 className="dash-card-title">Platform Publishing Distribution</h3>
            <span className="dash-card-meta">Normalized entity references</span>
          </div>

          <div className="platform-dist-list">
            {Object.keys(platformDistribution).map((platformId) => {
              const item = platformDistribution[platformId];
              const percentage = totalPosts > 0 ? Math.round((item.postCount / totalPosts) * 100) : 0;

              return (
                <div key={platformId} className="dist-item">
                  <div className="dist-item-top">
                    <div className="dist-item-name-flex">
                      <PlatformIcon platformId={platformId} size={16} color={item.color} />
                      <span className="dist-name">{item.name}</span>
                    </div>
                    <span className="dist-count">
                      <strong>{item.postCount}</strong> posts ({percentage}%)
                    </span>
                  </div>
                  <div className="dist-track">
                    <div
                      className="dist-bar"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: item.color
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Quick Actions & Recent Posts */}
        <div className="dash-card">
          <div className="dash-card-header">
            <h3 className="dash-card-title">Quick Actions & Recent Activity</h3>
            <button
              type="button"
              className="text-btn"
              onClick={() => onNavigateTab('posts')}
            >
              View All Posts →
            </button>
          </div>

          {/* Action Quick Launchers */}
          <div className="quick-actions-strip">
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => onNavigateTab('posts')}
            >
              <PlusIcon size={14} />
              <span>Create New Post</span>
            </button>

            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => onNavigateTab('drafts')}
            >
              <RocketIcon size={14} />
              <span>Manage Drafts ({totalDrafts})</span>
            </button>
          </div>

          {/* Recent Activity List */}
          <div className="recent-posts-list">
            {recentPosts.length === 0 ? (
              <p className="empty-subtext">No posts available in the store yet.</p>
            ) : (
              recentPosts.map((post) => (
                <div key={post.id} className="recent-post-row">
                  <span className={`status-badge-mini status-${post.status}`}>
                    {post.status}
                  </span>
                  <p className="recent-post-excerpt">
                    {post.content.length > 90 ? `${post.content.slice(0, 90)}...` : post.content}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
