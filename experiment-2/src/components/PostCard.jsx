import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { deletePostThunk, updatePostStatus, selectPostsOperationLoading } from '../features/posts/postsSlice';
import { selectAllPlatforms } from '../features/platforms/platformsSlice';
import { EditIcon, TrashIcon, SpinnerIcon, PlatformIcon } from './Icons';

/**
 * PostCard Component (Experiment 2)
 * 
 * Demonstrates:
 * 1. Normalized Entity Resolution:
 *    Post only stores platform IDs: `post.platformIds = ['twitter', 'instagram']`.
 *    The component maps these IDs to rich platform metadata from the Redux platforms slice!
 * 2. useDispatch:
 *    Directly dispatches `deletePostThunk` and `updatePostStatus` without passing callbacks up through parent components.
 */
export default function PostCard({ post, onEdit }) {
  const dispatch = useDispatch();
  const platforms = useSelector(selectAllPlatforms);
  const isOperating = useSelector(selectPostsOperationLoading);
  const [showConfirm, setShowConfirm] = useState(false);

  // Map normalized ID references to full platform entities from Redux store
  const platformMap = new Map(platforms.map((p) => [p.id, p]));
  const resolvedPlatforms = (post.platformIds || [])
    .map((id) => platformMap.get(id))
    .filter(Boolean);

  const handleDelete = async () => {
    await dispatch(deletePostThunk(post.id));
    setShowConfirm(false);
  };

  const handleStatusChange = (e) => {
    const newStatus = e.target.value;
    dispatch(updatePostStatus({ id: post.id, status: newStatus }));
  };

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

  return (
    <article className="post-entity-card" aria-label={`Post ${post.id}`}>
      {/* Top Meta Strip: Status & Platform Badges */}
      <div className="card-top-row">
        <div className="status-badge-container">
          <select
            value={post.status}
            onChange={handleStatusChange}
            className={`status-pill status-${post.status}`}
            title="Change status directly in Redux store"
          >
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="scheduled">Scheduled</option>
          </select>
        </div>

        {/* Resolved Platform Tags from Normalized IDs */}
        <div className="platform-badges-cluster">
          {resolvedPlatforms.map((p) => (
            <span
              key={p.id}
              className="platform-micro-badge"
              style={{ '--platform-color': p.brandColor }}
              title={p.name}
            >
              <PlatformIcon platformId={p.id} size={13} color="#ffffff" />
              <span>{p.name}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Post Text Content */}
      <div className="post-text-body">
        <p className="post-content-p">{post.content}</p>
      </div>

      {/* Timestamps & Actions */}
      <div className="card-bottom-row">
        <span className="post-time-meta">
          Updated {formatDate(post.updatedAt || post.createdAt)}
        </span>

        {showConfirm ? (
          <div className="inline-confirm">
            <span className="confirm-text">Delete?</span>
            <button
              type="button"
              className="btn-confirm-yes"
              onClick={handleDelete}
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
            <button
              type="button"
              className="card-btn btn-edit"
              onClick={() => onEdit(post)}
              title="Edit this post"
            >
              <EditIcon size={13} />
              <span>Edit</span>
            </button>

            <button
              type="button"
              className="card-btn btn-delete"
              onClick={() => setShowConfirm(true)}
              title="Delete this post"
            >
              <TrashIcon size={13} />
              <span>Delete</span>
            </button>
          </div>
        )}
      </div>
    </article>
  );
}
