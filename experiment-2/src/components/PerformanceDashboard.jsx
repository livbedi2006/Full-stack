import React, { useState, useMemo, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  selectAllPosts,
  selectFilteredPosts,
  selectPostsOperationLoading
} from '../selectors/postSelectors';
import {
  updatePostStatus,
  deletePostThunk,
  addSamplePosts,
  clearSamplePosts
} from '../features/posts/postsSlice';
import { selectAllPlatforms } from '../selectors/platformSelectors';
import MemoizedPostCard from './MemoizedPostCard';
import SelectorStats from './SelectorStats';
import DerivedAnalytics from './DerivedAnalytics';
import RenderMonitor from './RenderMonitor';
import {
  ZapIcon,
  SearchIcon,
  XIcon,
  PlusIcon,
  TrashIcon
} from './Icons';

/**
 * PerformanceDashboard Component (Experiment 2: Performance Module)
 * 
 * Title: "Optimizing State Access and Rendering Using Memoized Selectors"
 * 
 * Demonstrates:
 * 1. createSelector (Reselect): Memoized derived state caching.
 * 2. Unrelated state isolation: Component renders vs selector recomputations.
 * 3. React.memo(): Selective re-rendering of presentational post cards.
 * 4. useMemo(): Component-local pagination calculation.
 * 5. useCallback(): Referential stability for action handlers passed to memoized children.
 * 6. High-volume in-memory dataset handling (500+ items) with zero UI lag.
 */
export default function PerformanceDashboard() {
  const dispatch = useDispatch();

  // 1. Efficient Redux State Access (Only select required state slices)
  const allPosts = useSelector(selectAllPosts);
  const platforms = useSelector(selectAllPlatforms);
  const isOperating = useSelector(selectPostsOperationLoading);

  // 2. Filter & Sort State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [platformFilter, setPlatformFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  // 3. Local Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  // 4. Unrelated UI State (For testing selector memoization)
  const [unrelatedState, setUnrelatedState] = useState(0);

  // Pack filter criteria into memoized input
  const filterCriteria = useMemo(() => ({
    searchTerm,
    status: statusFilter,
    platform: platformFilter,
    sortBy
  }), [searchTerm, statusFilter, platformFilter, sortBy]);

  // Memoized Selector call: recomputes ONLY when posts or filterCriteria change!
  const filteredPosts = useSelector((state) => selectFilteredPosts(state, filterCriteria));

  // 5. Component-local useMemo for pagination slice
  // (Appropriate use of useMemo for local view windowing)
  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / pageSize));
  const effectivePage = Math.min(currentPage, totalPages);

  const paginatedPosts = useMemo(() => {
    const start = (effectivePage - 1) * pageSize;
    return filteredPosts.slice(start, start + pageSize);
  }, [filteredPosts, effectivePage, pageSize]);

  // 6. useCallback for event handlers passed to MemoizedPostCard
  // Guarantees referential equality across parent renders so React.memo works!
  const handleStatusChange = useCallback((id, status) => {
    dispatch(updatePostStatus({ id, status }));
  }, [dispatch]);

  const handleDeletePost = useCallback((id) => {
    dispatch(deletePostThunk(id));
  }, [dispatch]);

  // 7. Bulk Sample Data Generator (500 items in memory)
  const handleGenerateSampleData = () => {
    const platformPool = ['twitter', 'instagram', 'facebook', 'linkedin'];
    const statuses = ['published', 'draft', 'scheduled'];
    const templates = [
      'Mastering Reselect memoization: cached derived state prevents redundant array sweeps and keeps UI 60fps.',
      'React.memo avoids re-rendering child components when sibling states or parent states change.',
      'Normalized state with createEntityAdapter ensures O(1) lookups and eliminates deep object clones.',
      'Cross-entity join selector connects post references with live platform constraints on the fly.',
      'Modern state architecture for React 19 apps: functional composition, immutability, and zero boilerplate.',
      'Short update.'
    ];

    const now = Date.now();
    const batch = [];

    for (let i = 1; i <= 500; i++) {
      const template = templates[i % templates.length];
      const pCount = (i % 3) + 1;
      const assigned = platformPool.slice(0, pCount);
      // Create some deliberately long posts to test platform constraint validation
      const isLong = i % 15 === 0;
      const content = isLong
        ? `[#${i}] ${template} This deliberately extended content exceeds Twitter character limits to demonstrate memoized constraint validation in selectValidPosts. Adding extra detailed architectural explanations for performance benchmarking.`.repeat(2)
        : `[#${i}] ${template} #Dev${i % 10}`;

      batch.push({
        id: `sample-${i}`,
        content,
        platformIds: assigned,
        status: statuses[i % statuses.length],
        createdAt: new Date(now - i * 120000).toISOString(),
        updatedAt: new Date(now - i * 60000).toISOString()
      });
    }

    dispatch(addSamplePosts(batch));
    setCurrentPage(1);
  };

  const handleClearSampleData = () => {
    dispatch(clearSamplePosts());
    setCurrentPage(1);
  };

  const sampleCount = allPosts.filter((p) => String(p.id).startsWith('sample-')).length;

  return (
    <div className="performance-dashboard-container">
      {/* Module Banner */}
      <header className="performance-hero-banner">
        <div className="hero-content">
          <div className="badge-row">
            <span className="badge exp2-badge">EXPERIMENT 2 — MODULE 2</span>
            <span className="badge badge-accent">PERFORMANCE & MEMOIZATION</span>
          </div>
          <h2 className="hero-title">
            Optimizing State Access and Rendering Using Memoized Selectors
          </h2>
          <p className="hero-description">
            Demonstrating derived state computation, <code>createSelector</code> (Reselect) caching,
            <code>React.memo</code> render suppression, and scalable in-memory datasets.
          </p>
        </div>

        {/* Global Render Monitor for the Dashboard View */}
        <div className="hero-actions-panel">
          <RenderMonitor name="PerformanceDashboard" />
        </div>
      </header>

      {/* Dataset Scenario Controls */}
      <section className="dataset-scenario-panel">
        <div className="scenario-info-col">
          <div className="title-row">
            <ZapIcon size={18} color="#10b981" />
            <h3 className="panel-title">Large Dataset Benchmark (500+ Items)</h3>
          </div>
          <p className="panel-desc">
            Stress-test memoized selectors with hundreds of in-memory entities.
            Notice instant filtering, zero UI freeze, and smooth pagination.
          </p>
        </div>

        <div className="scenario-buttons-col">
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleGenerateSampleData}
          >
            <PlusIcon size={15} />
            <span>Generate 500 Sample Posts</span>
          </button>

          {sampleCount > 0 && (
            <button
              type="button"
              className="btn btn-danger-outline"
              onClick={handleClearSampleData}
            >
              <TrashIcon size={15} />
              <span>Clear Sample Data ({sampleCount})</span>
            </button>
          )}

          <div className="dataset-status-pill">
            <span>Total Entities:</span>
            <strong>{allPosts.length}</strong>
          </div>
        </div>
      </section>

      {/* Selector Telemetry Card */}
      <section className="dashboard-section-block">
        <SelectorStats
          onTriggerUnrelatedState={() => setUnrelatedState((prev) => prev + 1)}
          unrelatedStateValue={unrelatedState}
        />
      </section>

      {/* Derived Analytics Section */}
      <section className="dashboard-section-block">
        <DerivedAnalytics />
      </section>

      {/* Search, Filter & Paginated Post List */}
      <section className="dashboard-section-block">
        <div className="filter-controls-card">
          <div className="filter-card-header">
            <div className="filter-title-group">
              <SearchIcon size={18} color="#6366f1" />
              <h4>Memoized Post Filter (selectFilteredPosts)</h4>
            </div>
            <RenderMonitor name="FilterBar" compact={true} />
          </div>

          {/* Search Box */}
          <div className="search-bar-flex">
            <SearchIcon size={16} className="search-icon-svg" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by keywords or hashtags (e.g., Reselect, React 19)..."
              className="search-input-field"
            />
            {searchTerm && (
              <button
                type="button"
                className="search-clear-btn"
                onClick={() => {
                  setSearchTerm('');
                  setCurrentPage(1);
                }}
              >
                <XIcon size={14} />
              </button>
            )}
          </div>

          {/* Status Tabs, Platform Dropdown & Sorting */}
          <div className="filter-row">
            <div className="status-tabs-strip">
              {['all', 'published', 'draft', 'scheduled'].map((status) => (
                <button
                  key={status}
                  type="button"
                  className={`tab-filter-btn ${statusFilter === status ? 'active' : ''}`}
                  onClick={() => {
                    setStatusFilter(status);
                    setCurrentPage(1);
                  }}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>

            <div className="dropdowns-group">
              {/* Platform Filter */}
              <select
                value={platformFilter}
                onChange={(e) => {
                  setPlatformFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="platform-select-dropdown"
              >
                <option value="all">All Platforms</option>
                {platforms.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>

              {/* Sort Order */}
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setCurrentPage(1);
                }}
                className="platform-select-dropdown sort-select"
              >
                <option value="newest">Sort: Newest First</option>
                <option value="oldest">Sort: Oldest First</option>
                <option value="shortest">Sort: Shortest Content</option>
                <option value="longest">Sort: Longest Content</option>
              </select>

              {(searchTerm || statusFilter !== 'all' || platformFilter !== 'all' || sortBy !== 'newest') && (
                <button
                  type="button"
                  className="btn-clear-filters"
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                    setPlatformFilter('all');
                    setSortBy('newest');
                    setCurrentPage(1);
                  }}
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* Results Summary */}
          <div className="results-count-strip">
            <span>
              Showing {paginatedPosts.length} on page {effectivePage} of {totalPages} ({filteredPosts.length} matching of {allPosts.length} total)
            </span>
          </div>
        </div>

        {/* Posts Cards Grid with React.memo */}
        {filteredPosts.length === 0 ? (
          <div className="empty-posts-card">
            <h4>No matching posts found</h4>
            <p>Try modifying your search or filters to see posts.</p>
          </div>
        ) : (
          <>
            <div className="posts-cards-grid">
              {paginatedPosts.map((post) => (
                <MemoizedPostCard
                  key={post.id}
                  post={post}
                  onStatusChange={handleStatusChange}
                  onDeletePost={handleDeletePost}
                  isOperating={isOperating}
                />
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="pagination-bar" aria-label="Pagination Navigation">
                <button
                  type="button"
                  className="btn-page-nav"
                  disabled={effectivePage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                >
                  ← Previous
                </button>

                <div className="page-numbers-cluster">
                  <span className="page-indicator-text">
                    Page <strong>{effectivePage}</strong> of <strong>{totalPages}</strong>
                  </span>
                </div>

                <button
                  type="button"
                  className="btn-page-nav"
                  disabled={effectivePage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {/* Educational Information Section (Requirement 21) */}
      <section className="educational-guide-section">
        <h3 className="guide-main-title">Lab Reference: State Access & Performance Optimization</h3>
        <div className="guide-cards-grid">
          <article className="guide-card">
            <h4 className="guide-card-title">1. What is Derived State?</h4>
            <p className="guide-card-text">
              Derived state is any value that can be computed from raw state (e.g., total count,
              averages, filtered lists). Storing derived state in Redux creates redundancy, synchronization
              bugs, and unnecessary reducer code. Instead, compute derived values dynamically using selectors!
            </p>
          </article>

          <article className="guide-card">
            <h4 className="guide-card-title">2. Why use Memoized Selectors?</h4>
            <p className="guide-card-text">
              Normal functions re-filter and re-sort on every render. <code>createSelector</code> (Reselect)
              memoizes the calculation: it checks if input references changed; if unchanged, it returns the
              cached result in O(1) time without executing the function body.
            </p>
          </article>

          <article className="guide-card">
            <h4 className="guide-card-title">3. How React.memo Reduces Rendering</h4>
            <p className="guide-card-text">
              <code>React.memo</code> wraps functional components. When the parent component re-renders
              (e.g., when search query or theme toggles), <code>React.memo</code> performs shallow comparison
              on props. If props are unchanged, the component skips re-rendering entirely!
            </p>
          </article>

          <article className="guide-card">
            <h4 className="guide-card-title">4. Why Avoid Selecting the Entire Redux Store?</h4>
            <p className="guide-card-text">
              Writing <code>useSelector(state =&gt; state)</code> subscribes the component to EVERY state
              change anywhere in the application. Any draft edit or counter increment triggers a full
              re-render of that component. Selecting narrow slices prevents this cascading re-render problem.
            </p>
          </article>
        </div>
      </section>
    </div>
  );
}
