import React, { useRef, useState } from 'react';
import { UploadCloudIcon, TrashIcon, ImageIcon, VideoIcon, AlertCircleIcon, XIcon } from './Icons';
import { formatFileSize } from '../utils/validation';

/**
 * MediaUploader Component
 * 
 * Handles file selection (drag-and-drop or file picker),
 * generates live previews with metadata (size, type),
 * and supports individual or batch file removal.
 */
export default function MediaUploader({
  mediaFiles = [],
  onAddMedia,
  onRemoveMedia,
  onClearMedia,
  maxMediaAllowed = 10,
  strictestMediaPlatform = null
}) {
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragError, setDragError] = useState(null);

  // Trigger system file picker
  const handleBrowseClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Process selected files
  const processFiles = (fileList) => {
    if (!fileList || fileList.length === 0) return;
    setDragError(null);

    const validFiles = [];
    const invalidFiles = [];

    Array.from(fileList).forEach(file => {
      // Validate basic MIME type (image or video)
      if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
        const previewUrl = URL.createObjectURL(file);
        const isVideo = file.type.startsWith('video/');
        validFiles.push({
          id: `${file.name}-${file.size}-${Date.now()}-${Math.random()}`,
          file,
          name: file.name,
          size: file.size,
          type: file.type,
          isVideo,
          previewUrl
        });
      } else {
        invalidFiles.push(file.name);
      }
    });

    if (invalidFiles.length > 0) {
      setDragError(`Unsupported file format: ${invalidFiles.join(', ')}. Please select images or videos.`);
    }

    if (validFiles.length > 0) {
      onAddMedia(validFiles);
    }

    // Reset input so same file can be re-selected if removed
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileChange = (e) => {
    processFiles(e.target.files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer && e.dataTransfer.files) {
      processFiles(e.dataTransfer.files);
    }
  };

  return (
    <section className="composer-card media-uploader-card" aria-labelledby="media-heading">
      <div className="card-header">
        <div>
          <h2 id="media-heading" className="card-title">
            3. Media Attachments
          </h2>
          <p className="card-subtitle">
            Upload images or videos (supports JPG, PNG, GIF, MP4)
          </p>
        </div>

        <div className="media-summary-header">
          {strictestMediaPlatform && (
            <span className="media-limit-hint">
              Max {strictestMediaPlatform.maxMedia} on {strictestMediaPlatform.name}
            </span>
          )}
          {mediaFiles.length > 0 && (
            <button
              type="button"
              className="text-action-btn danger-text"
              onClick={onClearMedia}
              title="Remove all media"
            >
              Clear All ({mediaFiles.length})
            </button>
          )}
        </div>
      </div>

      {/* Hidden Native File Input */}
      <input
        ref={fileInputRef}
        type="file"
        id="media-file-input"
        multiple
        accept="image/*,video/*"
        onChange={handleFileChange}
        style={{ display: 'none' }}
        aria-label="Upload media files"
      />

      {/* Dropzone */}
      <div
        className={`media-dropzone ${isDragging ? 'dragging' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleBrowseClick}
        role="button"
        tabIndex="0"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleBrowseClick();
          }
        }}
        aria-label="Click or drag media files here to upload"
      >
        <div className="dropzone-content">
          <div className="upload-icon-circle">
            <UploadCloudIcon size={26} color="#3b82f6" />
          </div>
          <div className="dropzone-text">
            <span className="dropzone-primary">
              <strong>Click to upload</strong> or drag & drop files here
            </span>
            <span className="dropzone-secondary">
              PNG, JPG, GIF, WebP or MP4 (Max {maxMediaAllowed} files recommended)
            </span>
          </div>
        </div>
      </div>

      {/* Drag & Drop error notice */}
      {dragError && (
        <div className="media-error-banner" role="alert">
          <AlertCircleIcon size={16} />
          <span>{dragError}</span>
          <button
            type="button"
            className="close-alert-btn"
            onClick={() => setDragError(null)}
            aria-label="Dismiss message"
          >
            <XIcon size={14} />
          </button>
        </div>
      )}

      {/* Selected Media Previews */}
      {mediaFiles.length > 0 && (
        <div className="media-previews-section">
          <div className="previews-header">
            <span className="previews-count">
              Attached Files ({mediaFiles.length})
            </span>
          </div>

          <div className="media-grid">
            {mediaFiles.map((media, index) => (
              <div key={media.id || index} className="media-preview-card">
                <div className="preview-thumbnail-wrapper">
                  {media.isVideo ? (
                    <div className="video-preview-wrapper">
                      <video
                        src={media.previewUrl}
                        className="preview-video-thumb"
                        muted
                        playsInline
                      />
                      <span className="media-type-badge video-badge">
                        <VideoIcon size={12} /> VIDEO
                      </span>
                    </div>
                  ) : (
                    <div className="image-preview-wrapper">
                      <img
                        src={media.previewUrl}
                        alt={`Preview ${media.name}`}
                        className="preview-img-thumb"
                      />
                      <span className="media-type-badge image-badge">
                        <ImageIcon size={12} /> {media.name.split('.').pop()?.toUpperCase() || 'IMG'}
                      </span>
                    </div>
                  )}

                  <button
                    type="button"
                    className="media-delete-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveMedia(index);
                    }}
                    title={`Remove ${media.name}`}
                    aria-label={`Remove file ${media.name}`}
                  >
                    <TrashIcon size={14} />
                  </button>
                </div>

                <div className="media-details">
                  <span className="media-filename" title={media.name}>
                    {media.name}
                  </span>
                  <span className="media-filesize">
                    {formatFileSize(media.size)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
