import React, { useState, useMemo } from 'react';
import DraftAnalytics from './DraftAnalytics';
import DraftFilters from './DraftFilters';
import DraftList from './DraftList';
import DraftPreviewModal from './DraftPreviewModal';
import { selectFilteredDrafts, selectDraftStatistics } from '../../selectors/draftSelectors';
import { SparklesIcon, CheckIcon, AlertCircleIcon, XIcon } from '../Icons';

/**
 * DraftManager Component (Experiment 1.1.2)
 * 
 * Main coordinator for the Draft Management System:
 * - Employs memoized selectors for real-time filtering, search, and analytics
 * - Integrates asynchronous CRUD handling with feedback toasts
 * - Manages preview modal dialogs and transitions to the composer
 */
export default function DraftManager({
  drafts = [],
  isLoading = false,
  isDeleting = false,
  successMessage = null,
  error = null,
  onClearMessages,
  onEditDraft,
  onDeleteDraft,
  onOpenComposer
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [platformFilter, setPlatformFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [previewDraft, setPreviewDraft] = useState(null);

  // Performance Optimization: Memoized Filtered Drafts Selection
  const filteredDrafts = useMemo(() => {
    return selectFilteredDrafts(drafts, searchTerm, platformFilter, sortBy);
  }, [drafts, searchTerm, platformFilter, sortBy]);

  // Performance Optimization: Memoized Analytics Computation
  const stats = useMemo(() => {
    return selectDraftStatistics(drafts);
  }, [drafts]);

  const handleClearFilters = () => {
    setSearchTerm('');
    setPlatformFilter('all');
    setSortBy('newest');
  };

  const handleViewDraft = (draft) => {
    setPreviewDraft(draft);
  };

  const handleClosePreview = () => {
    setPreviewDraft(null);
  };

  const hasActiveFilters = searchTerm.trim().length > 0 || platformFilter !== 'all' || sortBy !== 'newest';

  return (
    <section className="draft-manager-section" aria-labelledby="draft-manager-heading">
      {/* Section Header */}
      <div className="section-title-bar">
        <div>
          <div className="section-badge-row">
            <span className="badge experiment-badge">EXPERIMENT 1.1.2</span>
            <span className="badge tech-badge">Async State & Memoized Selectors</span>
          </div>
          <h2 id="draft-manager-heading" className="section-main-heading">
            Draft Management System
          </h2>
          <p className="section-subheading">
            Review, filter, inspect, and retrieve saved cross-platform social post drafts.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary btn-compose-new"
          onClick={onOpenComposer}
        >
          <SparklesIcon size={16} />
          <span>New Post</span>
        </button>
      </div>

      {/* Global Feedback Banner */}
      {successMessage && (
        <div className="draft-alert draft-alert-success" role="status" aria-live="polite">
          <div className="alert-content-flex">
            <CheckIcon size={16} color="#10b981" />
            <span>{successMessage}</span>
          </div>
          <button
            type="button"
            className="alert-dismiss-btn"
            onClick={onClearMessages}
            aria-label="Dismiss notification"
          >
            <XIcon size={14} />
          </button>
        </div>
      )}

      {error && (
        <div className="draft-alert draft-alert-error" role="alert">
          <div className="alert-content-flex">
            <AlertCircleIcon size={16} color="#ef4444" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            className="alert-dismiss-btn"
            onClick={onClearMessages}
            aria-label="Dismiss error"
          >
            <XIcon size={14} />
          </button>
        </div>
      )}

      {/* Analytics Summary */}
      <DraftAnalytics stats={stats} />

      {/* Interactive Search & Filters Bar */}
      <DraftFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        platformFilter={platformFilter}
        onPlatformFilterChange={setPlatformFilter}
        sortBy={sortBy}
        onSortChange={setSortBy}
        onClearFilters={handleClearFilters}
        totalResults={filteredDrafts.length}
      />

      {/* Drafts Grid */}
      <DraftList
        drafts={filteredDrafts}
        isLoading={isLoading}
        isDeleting={isDeleting}
        onEdit={onEditDraft}
        onView={handleViewDraft}
        onDelete={onDeleteDraft}
        onClearFilters={handleClearFilters}
        hasActiveFilters={hasActiveFilters}
        onOpenComposer={onOpenComposer}
      />

      {/* View Detail Modal */}
      {previewDraft && (
        <DraftPreviewModal
          draft={previewDraft}
          onClose={handleClosePreview}
          onEdit={(draftToEdit) => {
            handleClosePreview();
            onEditDraft(draftToEdit);
          }}
        />
      )}
    </section>
  );
}
