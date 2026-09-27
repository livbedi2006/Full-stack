import React, { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { selectAllPosts, selectFilteredPosts } from '../selectors/postSelectors';
import { selectAllPlatforms } from '../selectors/platformSelectors';
import PostCard from './PostCard';
import { SearchIcon, XIcon } from './Icons';

/**
 * PostList Component (Experiment 2)
 * 
 * Demonstrates:
 * 1. selectFilteredPosts: Uses memoized selector (createSelector / Reselect)
 *    rather than filtering directly inside the component on every render!
 * 2. Pure Derived State: Filtered posts are derived on the fly without duplicating in Redux.
 */
export default function PostList({ onEditPost }) {
  const posts = useSelector(selectAllPosts);
  const platforms = useSelector(selectAllPlatforms);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [platformFilter, setPlatformFilter] = useState('all');

  // Input filter criteria memoized for selector stability
  const filterCriteria = useMemo(() => ({
    searchTerm: searchQuery,
    status: statusFilter,
    platform: platformFilter,
    sortBy: 'newest'
  }), [searchQuery, statusFilter, platformFilter]);

  // Read filtered posts derived via createSelector
  const filteredPosts = useSelector((state) => selectFilteredPosts(state, filterCriteria));

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setPlatformFilter('all');
  };

  const hasActiveFilters = searchQuery.trim() !== '' || statusFilter !== 'all' || platformFilter !== 'all';

  return (
    <div className="post-list-section">
      {/* Search & Filter Header */}
      <div className="filter-controls-card">
        {/* Search Bar */}
        <div className="search-bar-flex">
          <SearchIcon size={16} className="search-icon-svg" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search posts in Redux store by keywords or hashtags..."
            className="search-input-field"
          />
          {searchQuery && (
            <button
              type="button"
              className="search-clear-btn"
              onClick={() => setSearchQuery('')}
            >
              <XIcon size={14} />
            </button>
          )}
        </div>

        {/* Filter Dropdowns and Status Tabs */}
        <div className="filter-row">
          <div className="status-tabs-strip">
            {['all', 'published', 'draft', 'scheduled'].map((status) => (
              <button
                key={status}
                type="button"
                className={`tab-filter-btn ${statusFilter === status ? 'active' : ''}`}
                onClick={() => setStatusFilter(status)}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>

          <div className="platform-filter-wrapper">
            <select
              value={platformFilter}
              onChange={(e) => setPlatformFilter(e.target.value)}
              className="platform-select-dropdown"
            >
              <option value="all">All Target Platforms</option>
              {platforms.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>

            {hasActiveFilters && (
              <button
                type="button"
                className="btn-clear-filters"
                onClick={clearFilters}
              >
                Reset
              </button>
            )}
          </div>
        </div>

        <div className="results-count-strip">
          Showing {filteredPosts.length} of {posts.length} posts from Redux store
        </div>
      </div>

      {/* Posts Cards Grid */}
      {filteredPosts.length === 0 ? (
        <div className="empty-posts-card">
          <h4>No posts found</h4>
          <p>Try modifying your search or filter settings, or add a new post above.</p>
          {hasActiveFilters && (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={clearFilters}
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div className="posts-cards-grid">
          {filteredPosts.map((post) => (
            <PostCard key={post.id} post={post} onEdit={onEditPost} />
          ))}
        </div>
      )}
    </div>
  );
}
