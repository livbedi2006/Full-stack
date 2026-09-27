import React, { useState } from 'react';
import RenderMonitor from './RenderMonitor';
import { EditIcon, TrashIcon, SpinnerIcon, PlatformIcon, CheckCircleIcon, AlertTriangleIcon } from './Icons';

/**
 * MemoizedPostCard Component (Experiment 2: Performance Module)
 * 
 * Demonstrates:
 * 1. React.memo(): Higher-order component that memoizes the rendered output.
 *    Re-renders ONLY when props (post, callbacks) change.
 * 2. Unnecessary Re-render Prevention:
 *    When unrelated state in parent (like search query or theme) changes,
 *    React.memo skips re-rendering unchanged post cards!
 * 3. RenderMonitor Integration:
 *    Shows real-time render count badge for this individual item.
 */
function MemoizedPostCardInner({ post, onStatusChange, onDeletePost, onEditPost, isOperating }) {
  const [showConfirm, setShowConfirm] = useState(false);

  const formatDate = (iso) => {
    if (!iso) return '';
    try {
      return new Date(iso).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return iso;
    }
  };

  const platforms = post.platforms || [];
  const charCount = post.charCount ?? (post.content ? post.content.length : 0);
  const isValid = post.isValid ?? true;

  return (
    <article className="post-entity-card memoized-post-card" aria-label={`Post ${post.id}`}>
      {/* Top Strip: Status & Render Monitor Badge */}
      <div className="card-top-row">
        <div className="status-badge-container">
          <select
            value={post.status}
            onChange={(e) => onStatusChange && onStatusChange(post.id, e.target.value)}
            className={`status-pill status-${post.status}`}
            title="Change post status"
          >
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="scheduled">Scheduled</option>
          </select>

          {/* Validation Indicator derived via memoized selector */}
          <span
            className={`validation-chip ${isValid ? 'valid' : 'invalid'}`}
            title={isValid ? 'Valid: Satisfies all platform character limits' : 'Invalid: Exceeds platform limits or has no platforms'}
          >
            {isValid ? (
              <>
                <CheckCircleIcon size={12} color="#10b981" />
                <span>Valid ({charCount} ch)</span>
              </>
            ) : (
              <>
                <AlertTriangleIcon size={12} color="#f59e0b" />
                <span>Invalid ({charCount} ch)</span>
              </>
            )}
          </span>
        </div>

        {/* Live Card Render Counter */}
        <RenderMonitor name="Card" compact={true} />
      </div>

      {/* Target Platforms Badges */}
      <div className="platform-badges-cluster">
        {platforms.map((p) => (
          <span
            key={p.id}
            className="platform-micro-badge"
            style={{ '--platform-color': p.brandColor }}
            title={`${p.name} (Limit: ${p.characterLimit} chars)`}
          >
            <PlatformIcon platformId={p.id} size={12} color="#ffffff" />
            <span>{p.name}</span>
          </span>
        ))}
      </div>

      {/* Post Text Body */}
      <div className="post-text-body">
        <p className="post-content-p">{post.content}</p>
      </div>

      {/* Card Footer: Metadata and Actions */}
      <div className="card-bottom-row">
        <span className="post-time-meta">
          ID: {post.id} • {formatDate(post.updatedAt || post.createdAt)}
        </span>

        {showConfirm ? (
          <div className="inline-confirm">
            <span className="confirm-text">Delete?</span>
            <button
              type="button"
              className="btn-confirm-yes"
              onClick={() => {
                setShowConfirm(false);
                if (onDeletePost) onDeletePost(post.id);
              }}
              disabled={isOperating}
            >
              {isOperating ? <SpinnerIcon size={12} /> : 'Yes'}
            </button>
            <button
              type="button"
              className="btn-confirm-no"
              onClick={() => setShowConfirm(false)}
            >
              No
            </button>
          </div>
        ) : (
          <div className="actions-cluster">
            {onEditPost && (
              <button
                type="button"
                className="card-btn btn-edit"
                onClick={() => onEditPost(post)}
                title="Edit this post"
              >
                <EditIcon size={13} />
                <span>Edit</span>
              </button>
            )}

            {onDeletePost && (
              <button
                type="button"
                className="card-btn btn-delete"
                onClick={() => setShowConfirm(true)}
                title="Delete this post"
              >
                <TrashIcon size={13} />
                <span>Delete</span>
              </button>
            )}
          </div>
        )}
      </div>
    </article>
  );
}

// React.memo prevents this component from re-rendering
// when its props remain shallowly equal!
export const MemoizedPostCard = React.memo(MemoizedPostCardInner);
export default MemoizedPostCard;
