import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectAllDrafts,
  createDraftThunk,
  updateDraftThunk,
  deleteDraftThunk,
  convertDraftToPostThunk,
  selectDraftsOperationLoading
} from '../features/drafts/draftsSlice';
import { selectAllPlatforms } from '../features/platforms/platformsSlice';
import { EditIcon, TrashIcon, RocketIcon, PlusIcon, SpinnerIcon, PlatformIcon, CheckIcon } from './Icons';

/**
 * DraftManager Component (Experiment 2)
 * 
 * Demonstrates:
 * 1. Global Drafts Management via Redux Toolkit:
 *    Drafts are stored in `state.drafts` normalized entity adapter.
 * 2. Cross-Slice Action:
 *    "Convert to Post" dispatches convertDraftToPostThunk, which creates a post
 *    in postsSlice and automatically removes the draft from draftsSlice!
 */
export default function DraftManager() {
  const dispatch = useDispatch();

  // Read data from Redux Store
  const drafts = useSelector(selectAllDrafts);
  const platforms = useSelector(selectAllPlatforms);
  const isOperating = useSelector(selectDraftsOperationLoading);

  // Form local state
  const [editingDraftId, setEditingDraftId] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedPlatformIds, setSelectedPlatformIds] = useState(['twitter']);
  const [feedback, setFeedback] = useState(null);

  const platformMap = new Map(platforms.map((p) => [p.id, p]));

  // Toggle platform selection
  const handleTogglePlatform = (pId) => {
    setSelectedPlatformIds((prev) =>
      prev.includes(pId) ? prev.filter((id) => id !== pId) : [...prev, pId]
    );
  };

  // Start editing a draft
  const handleStartEdit = (draft) => {
    setEditingDraftId(draft.id);
    setTitle(draft.title || '');
    setContent(draft.content || '');
    setSelectedPlatformIds(Array.isArray(draft.platformIds) ? draft.platformIds : []);
    setFeedback(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingDraftId(null);
    setTitle('');
    setContent('');
    setSelectedPlatformIds(['twitter']);
  };

  // Handle Form Submit (Create or Update Draft)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      if (editingDraftId) {
        await dispatch(
          updateDraftThunk({
            id: editingDraftId,
            updates: {
              title: title.trim() || content.trim().slice(0, 30),
              content: content.trim(),
              platformIds: selectedPlatformIds
            }
          })
        ).unwrap();

        setFeedback('Draft updated in Redux store!');
        handleCancelEdit();
      } else {
        await dispatch(
          createDraftThunk({
            title: title.trim() || content.trim().slice(0, 30),
            content: content.trim(),
            platformIds: selectedPlatformIds
          })
        ).unwrap();

        setTitle('');
        setContent('');
        setFeedback('New draft added to Redux store!');
      }

      setTimeout(() => setFeedback(null), 3000);
    } catch (err) {
      setFeedback(`Error: ${err}`);
    }
  };

  // Delete Draft
  const handleDelete = async (id) => {
    await dispatch(deleteDraftThunk(id));
    if (editingDraftId === id) handleCancelEdit();
  };

  // Convert Draft to Post (Cross-slice workflow!)
  const handleConvertToPost = async (draftId) => {
    try {
      await dispatch(convertDraftToPostThunk(draftId)).unwrap();
      setFeedback('Draft converted into a published post!');
      setTimeout(() => setFeedback(null), 3500);
    } catch (err) {
      setFeedback(`Failed to convert draft: ${err}`);
    }
  };

  return (
    <div className="draft-manager-container">
      {/* Top Banner */}
      <div className="draft-manager-header">
        <div>
          <h2 className="section-title">Drafts Vault (Redux Slices Integration)</h2>
          <p className="section-subtitle">
            Manage pre-publication drafts. Convert any draft directly into an active post via cross-slice thunk!
          </p>
        </div>
      </div>

      {feedback && (
        <div className={`form-feedback-banner ${feedback.startsWith('Error') || feedback.startsWith('Failed') ? 'banner-err' : 'banner-ok'}`}>
          {feedback}
        </div>
      )}

      {/* Draft Composition Form */}
      <form className="draft-form-card" onSubmit={handleSubmit}>
        <div className="form-header">
          <h3 className="form-title">
            {editingDraftId ? 'Edit Draft (Redux Update)' : 'Create New Draft (Redux Dispatch)'}
          </h3>
          {editingDraftId && (
            <button
              type="button"
              className="btn-cancel-link"
              onClick={handleCancelEdit}
            >
              Cancel Edit
            </button>
          )}
        </div>

        <div className="form-row-grid">
          <div className="form-field">
            <label htmlFor="draft-title-input" className="field-label">Draft Title (Optional):</label>
            <input
              id="draft-title-input"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Q4 Launch Notes..."
              className="form-input"
            />
          </div>

          <div className="form-field">
            <label className="field-label">Target Platforms:</label>
            <div className="platform-checkbox-group">
              {platforms.map((p) => {
                const isSelected = selectedPlatformIds.includes(p.id);
                return (
                  <button
                    key={p.id}
                    type="button"
                    className={`platform-toggle-chip ${isSelected ? 'active' : ''}`}
                    style={{ '--platform-color': p.brandColor }}
                    onClick={() => handleTogglePlatform(p.id)}
                  >
                    <PlatformIcon platformId={p.id} size={14} color={isSelected ? '#ffffff' : p.brandColor} />
                    <span>{p.name}</span>
                    {isSelected && <CheckIcon size={12} color="#ffffff" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="form-field">
          <label htmlFor="draft-content-input" className="field-label">Draft Content:</label>
          <textarea
            id="draft-content-input"
            rows={3}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write draft content..."
            className="form-textarea"
            required
          />
        </div>

        <div className="form-actions-right">
          <button
            type="submit"
            className="btn btn-primary btn-sm"
            disabled={isOperating || !content.trim()}
          >
            {isOperating ? (
              <>
                <SpinnerIcon size={14} />
                <span>Saving Draft...</span>
              </>
            ) : (
              <span>{editingDraftId ? 'Update Draft' : 'Save as Draft in Redux'}</span>
            )}
          </button>
        </div>
      </form>

      {/* Drafts Grid */}
      <div className="drafts-section-list">
        <h3 className="sub-heading">Saved Drafts in Redux Store ({drafts.length})</h3>

        {drafts.length === 0 ? (
          <div className="empty-posts-card">
            <h4>No drafts currently stored in Redux</h4>
            <p>Save notes, unpolished thoughts, or announcements using the form above.</p>
          </div>
        ) : (
          <div className="drafts-cards-grid">
            {drafts.map((draft) => {
              const resolvedPlatforms = (draft.platformIds || [])
                .map((id) => platformMap.get(id))
                .filter(Boolean);

              return (
                <article key={draft.id} className="draft-redux-card">
                  <div className="draft-card-top">
                    <span className="draft-pill">DRAFT ENTITY</span>
                    <div className="draft-platforms-flex">
                      {resolvedPlatforms.map((p) => (
                        <span
                          key={p.id}
                          className="platform-micro-badge"
                          style={{ '--platform-color': p.brandColor }}
                        >
                          <PlatformIcon platformId={p.id} size={12} color="#ffffff" />
                          <span>{p.name}</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  <h4 className="draft-title-display">{draft.title || 'Untitled Draft'}</h4>
                  <p className="draft-content-display">{draft.content}</p>

                  <div className="draft-card-actions">
                    <button
                      type="button"
                      className="btn-convert-post"
                      onClick={() => handleConvertToPost(draft.id)}
                      disabled={isOperating}
                      title="Convert this draft into a published post via Redux thunk"
                    >
                      <RocketIcon size={14} />
                      <span>Convert to Post</span>
                    </button>

                    <div className="draft-actions-sub">
                      <button
                        type="button"
                        className="card-btn btn-edit"
                        onClick={() => handleStartEdit(draft)}
                        title="Edit draft"
                      >
                        <EditIcon size={13} />
                        <span>Edit</span>
                      </button>

                      <button
                        type="button"
                        className="card-btn btn-delete"
                        onClick={() => handleDelete(draft.id)}
                        title="Delete draft"
                      >
                        <TrashIcon size={13} />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
