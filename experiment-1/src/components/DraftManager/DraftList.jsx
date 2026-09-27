import React from 'react';
import DraftCard from './DraftCard';
import { FolderIcon, SearchIcon, SpinnerIcon } from '../Icons';

/**
 * DraftList Component
 * 
 * Renders a responsive grid of draft cards with empty and loading states.
 */
export default function DraftList({
  drafts = [],
  isLoading = false,
  isDeleting = false,
  onEdit,
  onView,
  onDelete,
  onClearFilters,
  hasActiveFilters = false,
  onOpenComposer
}) {
  if (isLoading) {
    return (
      <div className="drafts-loading-state" role="status" aria-live="polite">
        <SpinnerIcon size={32} className="spin" color="#38bdf8" />
        <p className="loading-text">Loading drafts from storage...</p>
      </div>
    );
  }

  if (drafts.length === 0) {
    if (hasActiveFilters) {
      return (
        <div className="drafts-empty-card" role="region" aria-label="No drafts found">
          <div className="empty-icon-circle">
            <SearchIcon size={28} color="#94a3b8" />
          </div>
          <h4 className="empty-title">No Drafts Match Your Criteria</h4>
          <p className="empty-desc">
            Try adjusting your search terms or platform filter settings.
          </p>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={onClearFilters}
          >
            Clear Filters
          </button>
        </div>
      );
    }

    return (
      <div className="drafts-empty-card" role="region" aria-label="No drafts available">
        <div className="empty-icon-circle">
          <FolderIcon size={28} color="#94a3b8" />
        </div>
        <h4 className="empty-title">Your Drafts Vault is Empty</h4>
        <p className="empty-desc">
          Save your work in progress while composing to manage it here later.
        </p>
        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={onOpenComposer}
        >
          Create Your First Draft
        </button>
      </div>
    );
  }

  return (
    <div className="drafts-grid" role="region" aria-label="Saved drafts list">
      {drafts.map(draft => (
        <DraftCard
          key={draft.id}
          draft={draft}
          onEdit={onEdit}
          onView={onView}
          onDelete={onDelete}
          isDeleting={isDeleting}
        />
      ))}
    </div>
  );
}
