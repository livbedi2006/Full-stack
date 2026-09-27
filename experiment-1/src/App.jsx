import React, { useState, useMemo, useEffect, lazy, Suspense } from 'react';
import Header from './components/Header';
import PostComposer from './components/PostComposer';
import { PLATFORMS, DEFAULT_SELECTED_PLATFORMS } from './data/platforms';
import { validatePost } from './utils/validation';
import { useDrafts } from './hooks/useDrafts';
import { SpinnerIcon } from './components/Icons';

// Lazy loading DraftManager for optimal code-splitting and performance (Requirement 18)
const DraftManager = lazy(() => import('./components/DraftManager/DraftManager'));

/**
 * Main Application Component
 * 
 * Experiment 1.1.1: Dynamic Post Composer with Multi-Platform Constraint Validation
 * Experiment 1.1.2: Draft Management System with Asynchronous CRUD & Memoized Selectors
 */
export default function App() {
  // Navigation tab state: 'composer' | 'drafts'
  const [activeTab, setActiveTab] = useState('composer');

  // Post composer content state
  const [content, setContent] = useState(
    'Excited to launch our dynamic multi-platform post composer! Built with real-time constraint validation for social networks. 🚀 #ReactJS #WebDev'
  );

  // Attached media state: array of { id, file, name, size, type, isVideo, previewUrl }
  const [mediaFiles, setMediaFiles] = useState([]);

  // Selected platforms state
  const [selectedPlatforms, setSelectedPlatforms] = useState(DEFAULT_SELECTED_PLATFORMS);

  // Publishing feedback state (Exp 1.1.1)
  const [publishSuccess, setPublishSuccess] = useState(null);

  // Experiment 1.1.2: Drafts management hook
  const {
    drafts,
    isLoading: isLoadingDrafts,
    isSaving: isSavingDraft,
    isDeleting: isDeletingDraft,
    error: draftError,
    successMessage: draftSuccessMessage,
    saveDraft,
    deleteDraft,
    clearMessages: clearDraftMessages
  } = useDrafts();

  // Active draft being edited in composer (null = creating fresh post)
  const [editingDraft, setEditingDraft] = useState(null);
  const [draftOperationFeedback, setDraftOperationFeedback] = useState(null);

  // Compute live validation summary via useMemo
  const validationSummary = useMemo(() => {
    return validatePost(content, mediaFiles, selectedPlatforms, PLATFORMS);
  }, [content, mediaFiles, selectedPlatforms]);

  // Clean up object URLs when mediaFiles are removed or component unmounts
  useEffect(() => {
    return () => {
      mediaFiles.forEach(media => {
        if (media.previewUrl) {
          URL.revokeObjectURL(media.previewUrl);
        }
      });
    };
  }, [mediaFiles]);

  // Platform selection handlers
  const handleTogglePlatform = (platformId) => {
    setPublishSuccess(null);
    setDraftOperationFeedback(null);
    setSelectedPlatforms(prev =>
      prev.includes(platformId)
        ? prev.filter(id => id !== platformId)
        : [...prev, platformId]
    );
  };

  const handleSelectAllPlatforms = () => {
    setPublishSuccess(null);
    setDraftOperationFeedback(null);
    setSelectedPlatforms(Object.keys(PLATFORMS));
  };

  const handleDeselectAllPlatforms = () => {
    setPublishSuccess(null);
    setDraftOperationFeedback(null);
    setSelectedPlatforms([]);
  };

  // Content change handler
  const handleChangeContent = (newText) => {
    setContent(newText);
    setPublishSuccess(null);
    setDraftOperationFeedback(null);
  };

  // Media handlers
  const handleAddMedia = (newFiles) => {
    setPublishSuccess(null);
    setDraftOperationFeedback(null);
    setMediaFiles(prev => [...prev, ...newFiles]);
  };

  const handleRemoveMedia = (indexToRemove) => {
    setPublishSuccess(null);
    setDraftOperationFeedback(null);
    setMediaFiles(prev => {
      const fileToRemove = prev[indexToRemove];
      if (fileToRemove?.previewUrl) {
        URL.revokeObjectURL(fileToRemove.previewUrl);
      }
      return prev.filter((_, idx) => idx !== indexToRemove);
    });
  };

  const handleClearMedia = () => {
    setPublishSuccess(null);
    setDraftOperationFeedback(null);
    mediaFiles.forEach(media => {
      if (media.previewUrl) {
        URL.revokeObjectURL(media.previewUrl);
      }
    });
    setMediaFiles([]);
  };

  // Reset Functionality (Exp 1.1.1)
  const handleReset = () => {
    mediaFiles.forEach(media => {
      if (media.previewUrl) {
        URL.revokeObjectURL(media.previewUrl);
      }
    });
    setContent('');
    setMediaFiles([]);
    setSelectedPlatforms([]);
    setPublishSuccess(null);
    setEditingDraft(null);
    setDraftOperationFeedback(null);
  };

  // Publish / Post Functionality (Exp 1.1.1)
  const handlePublish = () => {
    if (!validationSummary.canPublish) {
      return;
    }

    const platformNames = selectedPlatforms.map(id => PLATFORMS[id]?.name || id);
    let formattedNames = '';
    if (platformNames.length === 1) {
      formattedNames = platformNames[0];
    } else if (platformNames.length === 2) {
      formattedNames = `${platformNames[0]} and ${platformNames[1]}`;
    } else {
      formattedNames = `${platformNames.slice(0, -1).join(', ')} and ${platformNames[platformNames.length - 1]}`;
    }

    setPublishSuccess({
      message: `Post is ready to publish to ${formattedNames}.`,
      platforms: platformNames,
      charCount: content.length,
      mediaCount: mediaFiles.length,
      hashtagCount: validationSummary.hashtagCount,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
  };

  const handleDismissPublishSuccess = () => {
    setPublishSuccess(null);
  };

  // Quick preset loader (Exp 1.1.1)
  const handleLoadPreset = (presetType) => {
    setPublishSuccess(null);
    setEditingDraft(null);
    setDraftOperationFeedback(null);

    if (presetType === 'validShort') {
      setSelectedPlatforms(['twitter', 'facebook', 'linkedin']);
      setContent(
        'Excited to launch our dynamic post composer! Built with real-time constraint validation. 🚀 #ReactJS #WebDev'
      );
    } else if (presetType === 'overTwitter') {
      setSelectedPlatforms(['twitter', 'linkedin']);
      setContent(
        'We are thrilled to present our multi-platform social composer with real-time constraint validation. Unlike single-platform tools, our architecture evaluates simultaneous limits across microblogging, professional feeds, and media-rich networks. While this paragraph comfortably meets LinkedIn and Facebook character allowances, it purposely exceeds Twitter’s strict 280-character boundary so you can observe live constraint degradation! #Architecture #Engineering'
      );
    } else if (presetType === 'manyHashtags') {
      setSelectedPlatforms(['twitter', 'instagram', 'linkedin']);
      setContent(
        'Exploring the infinite frontier of modern frontend design systems! #tech #coding #dev #web #react #javascript #css #html #frontend #backend #fullstack #cloud #devops #design #ui #ux #node #nextjs #vite #docker #python #api #testing #agile #scrum #ci #cd #software #security #performance #architecture #systems'
      );
    }
  };

  // =========================================================================
  // Experiment 1.1.2 Draft Actions Handlers
  // =========================================================================

  /**
   * Save Draft (Create or Update)
   */
  const handleSaveDraft = async () => {
    if (!content.trim() && mediaFiles.length === 0) {
      return;
    }

    const titleExcerpt = content.trim()
      ? content.trim().slice(0, 32) + (content.trim().length > 32 ? '...' : '')
      : 'Media Post Draft';

    const draftPayload = {
      id: editingDraft?.id,
      title: editingDraft?.title || titleExcerpt,
      content,
      platforms: selectedPlatforms,
      media: mediaFiles.map(m => ({
        id: m.id || `${Date.now()}-${Math.random()}`,
        name: m.name,
        size: m.size,
        type: m.type,
        isVideo: m.isVideo
      }))
    };

    try {
      const isUpdating = Boolean(editingDraft);
      const saved = await saveDraft(draftPayload, isUpdating);

      // Keep editing the newly saved draft
      setEditingDraft(saved);
      setDraftOperationFeedback(
        isUpdating ? 'Draft updated successfully.' : 'Draft saved to vault successfully.'
      );
    } catch (err) {
      console.error('Error saving draft:', err);
    }
  };

  /**
   * Edit a draft from DraftManager: loads into Composer and switches view
   */
  const handleEditDraft = (draftToEdit) => {
    if (!draftToEdit) return;

    // Populate composer fields with draft data
    setContent(draftToEdit.content || '');
    setSelectedPlatforms(Array.isArray(draftToEdit.platforms) ? draftToEdit.platforms : []);
    
    // Media restoration
    if (Array.isArray(draftToEdit.media)) {
      setMediaFiles(draftToEdit.media.map(m => ({
        id: m.id || `${Date.now()}-${Math.random()}`,
        name: m.name,
        size: m.size,
        type: m.type,
        isVideo: m.isVideo,
        previewUrl: null
      })));
    } else {
      setMediaFiles([]);
    }

    setEditingDraft(draftToEdit);
    setPublishSuccess(null);
    setDraftOperationFeedback(`Editing draft: "${draftToEdit.title || 'Untitled'}"`);
    setActiveTab('composer');
  };

  /**
   * Cancel active draft edit mode
   */
  const handleCancelEdit = () => {
    setEditingDraft(null);
    setDraftOperationFeedback(null);
  };

  /**
   * Delete a draft
   */
  const handleDeleteDraft = async (draftId) => {
    try {
      await deleteDraft(draftId);
      // If currently editing this deleted draft, reset edit mode
      if (editingDraft && editingDraft.id === draftId) {
        setEditingDraft(null);
      }
    } catch (err) {
      console.error('Error deleting draft:', err);
    }
  };

  return (
    <div className="app-root">
      {/* Experiment Header & Scenarios */}
      <Header
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        draftCount={drafts.length}
        onLoadPreset={handleLoadPreset}
      />

      {/* Main Content Workspace */}
      <main className="main-content-wrapper">
        {activeTab === 'composer' ? (
          <PostComposer
            content={content}
            onChangeContent={handleChangeContent}
            mediaFiles={mediaFiles}
            onAddMedia={handleAddMedia}
            onRemoveMedia={handleRemoveMedia}
            onClearMedia={handleClearMedia}
            selectedPlatforms={selectedPlatforms}
            onTogglePlatform={handleTogglePlatform}
            onSelectAllPlatforms={handleSelectAllPlatforms}
            onDeselectAllPlatforms={handleDeselectAllPlatforms}
            validationSummary={validationSummary}
            publishSuccess={publishSuccess}
            onPublish={handlePublish}
            onReset={handleReset}
            onDismissPublishSuccess={handleDismissPublishSuccess}
            // Exp 1.1.2 props
            editingDraft={editingDraft}
            onSaveDraft={handleSaveDraft}
            onCancelEdit={handleCancelEdit}
            isSavingDraft={isSavingDraft}
            draftFeedback={draftOperationFeedback}
            onDismissDraftFeedback={() => setDraftOperationFeedback(null)}
          />
        ) : (
          <Suspense
            fallback={
              <div className="drafts-loading-state" role="status">
                <SpinnerIcon size={36} color="#38bdf8" />
                <p className="loading-text">Loading Draft Manager module...</p>
              </div>
            }
          >
            <DraftManager
              drafts={drafts}
              isLoading={isLoadingDrafts}
              isDeleting={isDeletingDraft}
              successMessage={draftSuccessMessage}
              error={draftError}
              onClearMessages={clearDraftMessages}
              onEditDraft={handleEditDraft}
              onDeleteDraft={handleDeleteDraft}
              onOpenComposer={() => setActiveTab('composer')}
            />
          </Suspense>
        )}
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <div className="footer-content">
          <p>
            Experiment 1.1.1 (Dynamic Composer) & Experiment 1.1.2 (Draft Management System)
          </p>
          <p className="footer-sub">
            Engineered with React 19 functional hooks, useReducer, localStorage persistence, and memoized selectors.
          </p>
        </div>
      </footer>
    </div>
  );
}
