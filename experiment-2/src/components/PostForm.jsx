import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createPostThunk, updatePostThunk, selectPostsOperationLoading } from '../features/posts/postsSlice';
import { selectAllPlatforms } from '../features/platforms/platformsSlice';
import { PlatformIcon, CheckIcon, SpinnerIcon } from './Icons';

/**
 * PostForm Component (Experiment 2)
 * 
 * Demonstrates:
 * 1. useSelector: Retrieves target platforms dynamically from Redux store.
 *    Platforms are NOT hardcoded in this component!
 * 2. useDispatch: Dispatches createPostThunk and updatePostThunk directly to the store.
 * 3. Loading state prevention: Disables submissions while async thunk is in-flight.
 */
export default function PostForm({ editingPost = null, onCancelEdit }) {
  const dispatch = useDispatch();

  // Reading platforms directly from the Redux store
  const platforms = useSelector(selectAllPlatforms);
  const isOperating = useSelector(selectPostsOperationLoading);

  // Local component form state
  const [content, setContent] = useState('');
  const [selectedPlatformIds, setSelectedPlatformIds] = useState(['twitter', 'linkedin']);
  const [status, setStatus] = useState('published');
  const [feedback, setFeedback] = useState(null);

  // Populate form when editing an existing post
  useEffect(() => {
    if (editingPost) {
      setContent(editingPost.content || '');
      setSelectedPlatformIds(Array.isArray(editingPost.platformIds) ? editingPost.platformIds : []);
      setStatus(editingPost.status || 'published');
      setFeedback(null);
    } else {
      setContent('');
      setSelectedPlatformIds(['twitter', 'linkedin']);
      setStatus('published');
    }
  }, [editingPost]);

  // Toggle platform selection
  const handleTogglePlatform = (platformId) => {
    setSelectedPlatformIds((prev) =>
      prev.includes(platformId)
        ? prev.filter((id) => id !== platformId)
        : [...prev, platformId]
    );
  };

  // Find strictest character limit among selected platforms
  const selectedPlatformObjs = platforms.filter((p) => selectedPlatformIds.includes(p.id));
  const strictestLimit = selectedPlatformObjs.length > 0
    ? Math.min(...selectedPlatformObjs.map((p) => p.characterLimit))
    : 280;

  const charCount = content.length;
  const isOverLimit = charCount > strictestLimit;

  // Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    if (selectedPlatformIds.length === 0) return;

    try {
      if (editingPost) {
        // Dispatch update thunk
        await dispatch(
          updatePostThunk({
            id: editingPost.id,
            updates: {
              content: content.trim(),
              platformIds: selectedPlatformIds,
              status
            }
          })
        ).unwrap();

        setFeedback('Post updated successfully in Redux store!');
        if (onCancelEdit) onCancelEdit();
      } else {
        // Dispatch create thunk
        await dispatch(
          createPostThunk({
            content: content.trim(),
            platformIds: selectedPlatformIds,
            status
          })
        ).unwrap();

        setContent('');
        setFeedback('Post created and stored in Redux store!');
      }

      setTimeout(() => setFeedback(null), 3000);
    } catch (err) {
      setFeedback(`Error: ${err}`);
    }
  };

  return (
    <form className="post-form-card" onSubmit={handleSubmit}>
      <div className="form-header">
        <h3 className="form-title">
          {editingPost ? 'Edit Post (Redux Update)' : 'Create New Post (Redux Dispatch)'}
        </h3>
        {editingPost && (
          <button
            type="button"
            className="btn-cancel-link"
            onClick={onCancelEdit}
          >
            Cancel Edit
          </button>
        )}
      </div>

      {feedback && (
        <div className={`form-feedback-banner ${feedback.startsWith('Error') ? 'banner-err' : 'banner-ok'}`}>
          {feedback}
        </div>
      )}

      {/* Target Platforms Selector (populated from Redux store) */}
      <div className="form-field">
        <label className="field-label">
          Target Platforms ({selectedPlatformIds.length} selected):
        </label>
        <div className="platform-checkbox-group">
          {platforms.map((platform) => {
            const isSelected = selectedPlatformIds.includes(platform.id);
            return (
              <button
                key={platform.id}
                type="button"
                className={`platform-toggle-chip ${isSelected ? 'active' : ''}`}
                style={{ '--platform-color': platform.brandColor }}
                onClick={() => handleTogglePlatform(platform.id)}
                aria-pressed={isSelected}
              >
                <div className="chip-avatar">
                  <PlatformIcon platformId={platform.id} size={15} color={isSelected ? '#ffffff' : platform.brandColor} />
                </div>
                <span className="chip-name">{platform.name}</span>
                {isSelected && <CheckIcon size={12} color="#ffffff" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Post Content Textarea */}
      <div className="form-field">
        <div className="field-label-row">
          <label htmlFor="post-content-input" className="field-label">
            Post Content:
          </label>
          <span className={`char-meter ${isOverLimit ? 'over' : ''}`}>
            {charCount} / {strictestLimit} chars (Strictest selected limit)
          </span>
        </div>
        <textarea
          id="post-content-input"
          rows={4}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Compose cross-platform message to dispatch into Redux..."
          className="form-textarea"
          required
        />
      </div>

      {/* Status Selection and Submit Button */}
      <div className="form-actions-row">
        <div className="status-select-wrapper">
          <label htmlFor="post-status-select" className="status-label">Status:</label>
          <select
            id="post-status-select"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="status-dropdown"
          >
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="scheduled">Scheduled</option>
          </select>
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={isOperating || !content.trim() || selectedPlatformIds.length === 0}
        >
          {isOperating ? (
            <>
              <SpinnerIcon size={16} />
              <span>Saving to Store...</span>
            </>
          ) : (
            <span>{editingPost ? 'Update Post' : 'Add Post to Redux'}</span>
          )}
        </button>
      </div>
    </form>
  );
}
