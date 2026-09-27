import React from 'react';
import { SearchIcon, FilterIcon, XIcon, PlatformIcon } from '../Icons';
import { PLATFORMS } from '../../data/platforms';

/**
 * DraftFilters Component
 * 
 * Provides interactive search input, platform-specific filters,
 * and sort order options for the drafts collection.
 */
export default function DraftFilters({
  searchTerm,
  onSearchChange,
  platformFilter,
  onPlatformFilterChange,
  sortBy,
  onSortChange,
  onClearFilters,
  totalResults = 0
}) {
  const hasActiveFilters = searchTerm.trim().length > 0 || platformFilter !== 'all' || sortBy !== 'newest';

  return (
    <div className="draft-filters-bar" role="search" aria-label="Filter drafts">
      {/* Search Bar */}
      <div className="search-input-wrapper">
        <SearchIcon size={16} className="search-icon" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search drafts by text, title, or tags..."
          className="search-input"
          aria-label="Search drafts"
        />
        {searchTerm && (
          <button
            type="button"
            className="clear-search-btn"
            onClick={() => onSearchChange('')}
            aria-label="Clear search"
          >
            <XIcon size={14} />
          </button>
        )}
      </div>

      {/* Platform Filter Buttons */}
      <div className="filters-control-group">
        <div className="platform-filter-tabs" role="tablist" aria-label="Platform filter">
          <button
            type="button"
            className={`filter-tab ${platformFilter === 'all' ? 'active' : ''}`}
            onClick={() => onPlatformFilterChange('all')}
            role="tab"
            aria-selected={platformFilter === 'all'}
          >
            All Platforms
          </button>

          {Object.keys(PLATFORMS).map(key => {
            const p = PLATFORMS[key];
            const isActive = platformFilter === key;
            return (
              <button
                key={key}
                type="button"
                className={`filter-tab ${isActive ? 'active' : ''}`}
                style={{ '--active-color': p.brandColor }}
                onClick={() => onPlatformFilterChange(key)}
                role="tab"
                aria-selected={isActive}
              >
                <PlatformIcon platformId={key} size={14} color={isActive ? '#ffffff' : p.brandColor} />
                <span>{p.shortName || p.name}</span>
              </button>
            );
          })}
        </div>

        {/* Sort Dropdown */}
        <div className="sort-select-wrapper">
          <label htmlFor="draft-sort-select" className="sr-only">
            Sort drafts
          </label>
          <select
            id="draft-sort-select"
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="sort-select"
          >
            <option value="newest">Recently Updated</option>
            <option value="oldest">Oldest First</option>
            <option value="longest">Longest Draft</option>
            <option value="shortest">Shortest Draft</option>
          </select>
        </div>

        {/* Reset Filter Button */}
        {hasActiveFilters && (
          <button
            type="button"
            className="btn-reset-filters"
            onClick={onClearFilters}
            title="Reset search and filters"
          >
            Reset
          </button>
        )}
      </div>

      <div className="filters-results-count">
        Showing {totalResults} {totalResults === 1 ? 'draft' : 'drafts'}
      </div>
    </div>
  );
}
