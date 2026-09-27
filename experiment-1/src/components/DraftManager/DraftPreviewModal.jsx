import React, { useEffect } from 'react';
import { XIcon, EditIcon, ClockIcon, ImageIcon, HashIcon, PlatformIcon } from '../Icons';
import { PLATFORMS } from '../../data/platforms';
import { extractHashtags } from '../../utils/validation';

/**
 * DraftPreviewModal Component
 * 
 * Displays complete draft details in an accessible modal dialog.
 */
export default function DraftPreviewModal({ draft, onClose, onEdit }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!draft) return null;

  const { title, content = '', platforms = [], media = [], createdAt, updatedAt } = draft;
  const hashtags = extractHashtags(content);

  const formatDate = (isoString) => {
    if (!isoString) return 'N/A';
    try {
      return new Date(isoString).toLocaleString(undefined, {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="preview-modal-title">
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <span className="modal-tag">Draft Inspector</span>
            <h3 id="preview-modal-title" className="modal-title">
              {title || 'Draft Preview'}
            </h3>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close preview modal"
          >
            <XIcon size={18} />
          </button>
        </div>

        <div className="modal-body">
          {/* Target Platforms */}
          <div className="modal-section">
            <span className="section-label">Target Destinations:</span>
            <div className="modal-platforms-row">
              {platforms.length > 0 ? (
                platforms.map(pId => {
                  const p = PLATFORMS[pId];
                  if (!p) return null;
                  return (
                    <div
                      key={pId}
                      className="modal-platform-chip"
                      style={{ '--platform-color': p.brandColor }}
                    >
                      <PlatformIcon platformId={pId} size={15} color="#ffffff" />
                      <span>{p.name}</span>
                      <span className="platform-limit-tag">{p.characterLimit} chars</span>
                    </div>
                  );
                })
              ) : (
                <span className="text-muted">No platforms selected</span>
              )}
            </div>
          </div>

          {/* Full Content */}
          <div className="modal-section">
            <div className="content-box-header">
              <span className="section-label">Post Content:</span>
              <span className="char-badge">{content.length} characters</span>
            </div>
            <div className="modal-content-box">
              {content ? (
                <p className="modal-content-text">{content}</p>
              ) : (
                <em className="text-muted">Empty content</em>
              )}
            </div>
          </div>

          {/* Detected Hashtags */}
          {hashtags.length > 0 && (
            <div className="modal-section">
              <span className="section-label">Hashtags ({hashtags.length}):</span>
              <div className="modal-tags-row">
                {hashtags.map((tag, i) => (
                  <span key={i} className="hashtag-chip">
                    <HashIcon size={12} />
                    {tag.replace(/^#/, '')}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Media Attachments */}
          {media.length > 0 && (
            <div className="modal-section">
              <span className="section-label">Attached Media ({media.length}):</span>
              <div className="modal-media-list">
                {media.map((item, idx) => (
                  <div key={item.id || idx} className="modal-media-item">
                    <ImageIcon size={16} />
                    <span className="media-item-name">{item.name || `Attachment ${idx + 1}`}</span>
                    {item.size && (
                      <span className="media-item-size">
                        {(item.size / (1024 * 1024)).toFixed(1)} MB
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div className="modal-meta-grid">
            <div className="meta-tile">
              <ClockIcon size={13} />
              <span>Created: {formatDate(createdAt)}</span>
            </div>
            <div className="meta-tile">
              <ClockIcon size={13} />
              <span>Last Modified: {formatDate(updatedAt || createdAt)}</span>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
          >
            Close
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              onClose();
              onEdit(draft);
            }}
          >
            <EditIcon size={15} />
            <span>Load into Composer</span>
          </button>
        </div>
      </div>
    </div>
  );
}
