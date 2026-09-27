import React, { useState } from 'react';
import { EditIcon, TrashIcon, EyeIcon, ClockIcon, ImageIcon, SpinnerIcon, PlatformIcon } from '../Icons';
import { PLATFORMS } from '../../data/platforms';

/**
 * Formats ISO date string into readable academic format
 */
function formatDate(isoString) {
  if (!isoString) return 'Just now';
  try {
    const d = new Date(isoString);
    return d.toLocaleDateString(undefined, {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (err) {
    return isoString;
  }
}

/**
 * DraftCard Component
 * 
 * Renders an individual draft with content excerpt, platform badges,
 * character metrics, timestamps, and interactive CRUD actions (Edit, View, Delete).
 */
export default function DraftCard({
  draft,
  onEdit,
  onView,
  onDelete,
  isDeleting = false
}) {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const { id, title, content, platforms = [], media = [], createdAt, updatedAt } = draft;

  const charCount = content ? content.length : 0;
  const mediaCount = media.length;

  const handleDeleteClick = () => {
    setShowConfirmDelete(true);
  };

  const handleConfirmDelete = () => {
    setShowConfirmDelete(false);
    onDelete(id);
  };

  const handleCancelDelete = () => {
    setShowConfirmDelete(false);
  };

  return (
    <article className="draft-item-card" aria-label={`Draft: ${title || 'Untitled'}`}>
      <div className="draft-card-header">
        <div className="draft-title-row">
          <span className="draft-status-pill">Draft</span>
          <h4 className="draft-card-title">{title || 'Untitled Post Draft'}</h4>
        </div>

        <div className="draft-platforms-flex">
          {platforms.map(platformId => {
            const platform = PLATFORMS[platformId];
            if (!platform) return null;
            return (
              <span
                key={platformId}
                className="draft-platform-badge"
                style={{ '--platform-color': platform.brandColor }}
                title={platform.name}
              >
                <PlatformIcon platformId={platformId} size={13} color="#ffffff" />
                <span>{platform.shortName || platform.name}</span>
              </span>
            );
          })}
        </div>
      </div>

      {/* Content Preview */}
      <div className="draft-content-preview">
        <p className="draft-excerpt">
          {content ? (
            content.length > 180 ? `${content.slice(0, 180)}...` : content
          ) : (
            <em className="text-muted">No text content (Media-only post)</em>
          )}
        </p>
      </div>

      {/* Metadata Strip */}
      <div className="draft-card-meta">
        <div className="meta-stats-group">
          <span className="meta-stat-item" title="Character count">
            <strong>{charCount}</strong> chars
          </span>

          {mediaCount > 0 && (
            <span className="meta-stat-item" title={`${mediaCount} media files attached`}>
              <ImageIcon size={13} />
              <span>{mediaCount} {mediaCount === 1 ? 'file' : 'files'}</span>
            </span>
          )}
        </div>

        <div className="draft-timestamps">
          <span className="timestamp-item" title={`Created: ${formatDate(createdAt)}`}>
            <ClockIcon size={12} />
            Updated {formatDate(updatedAt || createdAt)}
          </span>
        </div>
      </div>

      {/* Actions / Delete Confirmation */}
      <div className="draft-card-footer">
        {showConfirmDelete ? (
          <div className="delete-confirm-box" role="alertdialog" aria-label="Confirm deletion">
            <span className="confirm-prompt">Permanently delete this draft?</span>
            <div className="confirm-btn-group">
              <button
                type="button"
                className="btn-danger-confirm"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? <SpinnerIcon size={13} /> : 'Yes, Delete'}
              </button>
              <button
                type="button"
                className="btn-cancel-confirm"
                onClick={handleCancelDelete}
                disabled={isDeleting}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="draft-actions-group">
            <button
              type="button"
              className="draft-action-btn btn-view"
              onClick={() => onView(draft)}
              title="Preview complete draft"
              aria-label={`View draft ${title}`}
            >
              <EyeIcon size={14} />
              <span>View</span>
            </button>

            <button
              type="button"
              className="draft-action-btn btn-edit"
              onClick={() => onEdit(draft)}
              title="Load draft into Composer for editing"
              aria-label={`Edit draft ${title}`}
            >
              <EditIcon size={14} />
              <span>Edit</span>
            </button>

            <button
              type="button"
              className="draft-action-btn btn-delete"
              onClick={handleDeleteClick}
              disabled={isDeleting}
              title="Delete draft"
              aria-label={`Delete draft ${title}`}
            >
              {isDeleting ? <SpinnerIcon size={14} /> : <TrashIcon size={14} />}
              <span>Delete</span>
            </button>
          </div>
        )}
      </div>
    </article>
  );
}
