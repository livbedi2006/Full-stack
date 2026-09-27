import React, { useRef } from 'react';
import PlatformSelector from './PlatformSelector';
import CharacterCounter from './CharacterCounter';
import MediaUploader from './MediaUploader';
import ValidationCard from './ValidationCard';
import StatusMessage from './StatusMessage';
import {
  SendIcon,
  RefreshCwIcon,
  HashIcon,
  ShieldCheckIcon,
  AlertCircleIcon,
  SaveIcon,
  SpinnerIcon,
  EditIcon,
  XIcon,
  CheckIcon
} from './Icons';
import { PLATFORMS } from '../data/platforms';

/**
 * PostComposer Component (Experiment 1.1.1 + Experiment 1.1.2)
 * 
 * Coordinates the full composing and draft workflow:
 * - Content input textarea with real-time feedback
 * - Platform selection & multi-constraint validation
 * - Media uploads and live previews
 * - Reset, Publish, and Draft (Create/Update) actions with accessible states
 */
export default function PostComposer({
  content,
  onChangeContent,
  mediaFiles,
  onAddMedia,
  onRemoveMedia,
  onClearMedia,
  selectedPlatforms,
  onTogglePlatform,
  onSelectAllPlatforms,
  onDeselectAllPlatforms,
  validationSummary,
  publishSuccess,
  onPublish,
  onReset,
  onDismissPublishSuccess,
  // Experiment 1.1.2 Integration Props
  editingDraft = null,
  onSaveDraft,
  onCancelEdit,
  isSavingDraft = false,
  draftFeedback = null,
  onDismissDraftFeedback
}) {
  const textareaRef = useRef(null);

  const {
    canPublish,
    isValid,
    overallStatus,
    platformResults = {},
    strictestPlatform,
    charCount,
    hashtagCount,
    selectedCount
  } = validationSummary;

  // Insert hashtag helper
  const handleInsertHashtag = (tag) => {
    const textToAdd = content.endsWith(' ') || content.length === 0 ? `#${tag} ` : ` #${tag} `;
    onChangeContent(content + textToAdd);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  // Find strictest media platform among selected
  const selectedPlatformObjs = selectedPlatforms
    .map(id => PLATFORMS[id])
    .filter(Boolean);

  let strictestMediaPlatform = selectedPlatformObjs.length > 0 ? selectedPlatformObjs[0] : null;
  selectedPlatformObjs.forEach(p => {
    if (p.maxMedia < strictestMediaPlatform.maxMedia) {
      strictestMediaPlatform = p;
    }
  });

  const hasMeaningfulContent = content.trim().length > 0 || mediaFiles.length > 0;

  return (
    <div className="composer-layout-grid">
      {/* LEFT COLUMN: Input & Composer Controls */}
      <div className="composer-main-column">
        {/* Active Draft Editing Ribbon */}
        {editingDraft && (
          <div className="editing-draft-banner" role="status">
            <div className="editing-banner-content">
              <EditIcon size={16} color="#38bdf8" />
              <div>
                <span className="editing-banner-title">
                  Editing Saved Draft: <strong>{editingDraft.title || 'Untitled Draft'}</strong>
                </span>
                <span className="editing-banner-sub">
                  Modifications will update this draft without creating a duplicate.
                </span>
              </div>
            </div>
            <button
              type="button"
              className="btn-cancel-edit"
              onClick={onCancelEdit}
              title="Cancel editing and create a new draft"
            >
              Cancel Edit
            </button>
          </div>
        )}

        {/* Draft Operation Toast / Feedback */}
        {draftFeedback && (
          <div className="draft-operation-toast" role="status" aria-live="polite">
            <div className="toast-content-flex">
              <CheckIcon size={16} color="#10b981" />
              <span>{draftFeedback}</span>
            </div>
            {onDismissDraftFeedback && (
              <button
                type="button"
                className="toast-close-btn"
                onClick={onDismissDraftFeedback}
                aria-label="Dismiss feedback"
              >
                <XIcon size={14} />
              </button>
            )}
          </div>
        )}

        {/* Step 1: Platform Selection */}
        <PlatformSelector
          selectedPlatforms={selectedPlatforms}
          onTogglePlatform={onTogglePlatform}
          onSelectAll={onSelectAllPlatforms}
          onDeselectAll={onDeselectAllPlatforms}
        />

        {/* Step 2: Content Creation */}
        <section className="composer-card content-editor-card" aria-labelledby="post-content-heading">
          <div className="card-header">
            <div>
              <h2 id="post-content-heading" className="card-title">
                2. Compose Content
              </h2>
              <p className="card-subtitle">
                Write message, insert tags, and review real-time limits
              </p>
            </div>

            {/* Quick Hashtag Suggestions */}
            <div className="quick-tags">
              <span className="quick-tags-label">Quick Tags:</span>
              {['TechNews', 'WebDev', 'ReactJS', 'Design'].map(tag => (
                <button
                  key={tag}
                  type="button"
                  className="quick-tag-chip"
                  onClick={() => handleInsertHashtag(tag)}
                  title={`Insert #${tag}`}
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>

          {/* Text Area */}
          <div className="textarea-container">
            <label htmlFor="post-textarea" className="sr-only">
              Post Content
            </label>
            <textarea
              ref={textareaRef}
              id="post-textarea"
              rows={6}
              value={content}
              onChange={(e) => onChangeContent(e.target.value)}
              placeholder="What's happening? Share thoughts, updates, announcements, or insights..."
              className="post-textarea"
              aria-describedby="char-counter"
            />
          </div>

          {/* Live Character Counter */}
          <div id="char-counter">
            <CharacterCounter
              charCount={charCount}
              strictestPlatform={strictestPlatform}
              platformResults={platformResults}
              selectedPlatforms={selectedPlatforms}
              hashtagCount={hashtagCount}
            />
          </div>
        </section>

        {/* Step 3: Media Attachment */}
        <MediaUploader
          mediaFiles={mediaFiles}
          onAddMedia={onAddMedia}
          onRemoveMedia={onRemoveMedia}
          onClearMedia={onClearMedia}
          maxMediaAllowed={strictestMediaPlatform ? strictestMediaPlatform.maxMedia : 10}
          strictestMediaPlatform={strictestMediaPlatform}
        />

        {/* Actions Bar (Reset, Save Draft, Publish) */}
        <div className="composer-actions-bar">
          <div className="actions-left-group">
            <button
              type="button"
              id="reset-post-button"
              className="btn btn-secondary"
              onClick={onReset}
              title="Reset text, media, and platform selection"
            >
              <RefreshCwIcon size={16} />
              <span>Clear / Reset</span>
            </button>

            {/* Experiment 1.1.2: Save / Update Draft Button */}
            {onSaveDraft && (
              <button
                type="button"
                id="save-draft-button"
                className="btn btn-draft"
                onClick={onSaveDraft}
                disabled={isSavingDraft || !hasMeaningfulContent}
                title={
                  !hasMeaningfulContent
                    ? 'Enter text or add media to save a draft'
                    : editingDraft
                    ? 'Update this draft in storage'
                    : 'Save draft to local storage'
                }
              >
                {isSavingDraft ? (
                  <>
                    <SpinnerIcon size={16} />
                    <span>{editingDraft ? 'Updating Draft...' : 'Saving Draft...'}</span>
                  </>
                ) : (
                  <>
                    <SaveIcon size={16} />
                    <span>{editingDraft ? 'Update Draft' : 'Save Draft'}</span>
                  </>
                )}
              </button>
            )}
          </div>

          <button
            type="button"
            id="publish-post-button"
            className={`btn btn-primary ${canPublish ? 'btn-publish-ready' : 'btn-disabled'}`}
            onClick={onPublish}
            disabled={!canPublish}
            title={canPublish ? 'Ready to publish post' : 'Resolve validation errors to enable publishing'}
          >
            <SendIcon size={16} />
            <span>
              {canPublish
                ? `Publish to ${selectedCount} ${selectedCount === 1 ? 'Platform' : 'Platforms'}`
                : 'Publish (Fix Errors)'}
            </span>
          </button>
        </div>

        {/* Status / Publish Message Banner */}
        <StatusMessage
          validationSummary={validationSummary}
          publishSuccess={publishSuccess}
          onDismissPublishSuccess={onDismissPublishSuccess}
        />
      </div>

      {/* RIGHT COLUMN: Live Multi-Platform Validation Dashboard */}
      <aside className="composer-sidebar-column" aria-label="Platform constraint validation panel">
        <div className="validation-panel-header">
          <div className="panel-title-flex">
            <ShieldCheckIcon size={20} color="#3b82f6" />
            <div>
              <h2 className="panel-title">Multi-Platform Validation</h2>
              <span className="panel-subtitle">
                {selectedCount} of {Object.keys(PLATFORMS).length} platforms monitored
              </span>
            </div>
          </div>
        </div>

        {selectedPlatforms.length === 0 ? (
          <div className="empty-validation-state">
            <div className="empty-icon-circle">
              <AlertCircleIcon size={32} color="#94a3b8" />
            </div>
            <h3>No Platforms Active</h3>
            <p>Select one or more platforms on the left to review constraint validation in real-time.</p>
          </div>
        ) : (
          <div className="validation-cards-stack">
            {selectedPlatforms.map(platformId => {
              const result = platformResults[platformId];
              const config = PLATFORMS[platformId];
              return (
                <ValidationCard
                  key={platformId}
                  platformResult={result}
                  platformConfig={config}
                />
              );
            })}
          </div>
        )}
      </aside>
    </div>
  );
}
