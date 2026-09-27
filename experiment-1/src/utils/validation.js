/**
 * Multi-Platform Post Validation Utilities
 * 
 * Centralized, reusable validation logic evaluating content against
 * data-driven platform constraints.
 */

/**
 * Extracts all hashtags from post content.
 * Matches standard alphanumeric and unicode hashtags (e.g., #webdev, #react2026, #AI).
 * 
 * @param {string} text - Post content
 * @returns {string[]} Array of detected hashtags (e.g. ['#react', '#javascript'])
 */
export function extractHashtags(text = '') {
  if (!text || typeof text !== 'string') return [];
  // Matches # followed by word characters or unicode letters
  const matches = text.match(/(?:^|\s)(#[a-zA-Z0-9_\u0080-\uffff]+)/g);
  if (!matches) return [];
  return matches.map(match => match.trim());
}

/**
 * Formats byte size into human readable string (KB / MB).
 * 
 * @param {number} bytes 
 * @returns {string} Formatted size (e.g. "2.4 MB")
 */
export function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/**
 * Validates post content and media against a specific platform's constraints.
 * 
 * @param {Object} platform - Platform configuration object from platforms.js
 * @param {string} text - Current post text
 * @param {Array} mediaFiles - Array of attached media objects/files
 * @returns {Object} Platform validation result
 */
export function validatePlatform(platform, text = '', mediaFiles = []) {
  if (!platform) {
    throw new Error('Platform configuration object is required for validation.');
  }

  const errors = [];
  const warnings = [];

  const charCount = text.length;
  const charLimit = platform.characterLimit;
  const remaining = charLimit - charCount;
  const percentUsed = Math.min(100, Math.round((charCount / charLimit) * 100));

  const hashtags = extractHashtags(text);
  const hashtagCount = hashtags.length;
  const mediaCount = mediaFiles.length;

  // 1. Content Presence Validation
  const hasText = text.trim().length > 0;
  const hasMedia = mediaCount > 0;

  if (!hasText && !hasMedia) {
    errors.push('Post content is empty. Add text or media to proceed.');
  }

  // 2. Character Limit Validation
  if (remaining < 0) {
    const overCount = Math.abs(remaining);
    errors.push(
      `Character limit exceeded by ${overCount} ${overCount === 1 ? 'character' : 'characters'}. (${charCount.toLocaleString()} / ${charLimit.toLocaleString()})`
    );
  } else if (remaining === 0 && charCount > 0) {
    warnings.push(`Exactly at character limit (${charLimit.toLocaleString()} characters).`);
  } else if (charCount > 0) {
    // Dynamic warning thresholds:
    // If under 25 chars remaining or >= 88% limit used on shorter platforms
    const warningBuffer = Math.min(30, Math.max(10, Math.floor(charLimit * 0.1)));
    if (remaining <= warningBuffer) {
      warnings.push(`Approaching limit: only ${remaining} ${remaining === 1 ? 'character' : 'characters'} remaining.`);
    }
  }

  // 3. Media Validation
  if (hasMedia && !platform.mediaSupported) {
    errors.push(`${platform.name} does not support media attachments.`);
  }

  if (platform.requiresMedia && !hasMedia) {
    errors.push(`${platform.name} is a visual platform and requires at least 1 image or video.`);
  }

  if (platform.mediaSupported && mediaCount > platform.maxMedia) {
    errors.push(
      `Too many media items attached. ${platform.name} allows a maximum of ${platform.maxMedia} ${platform.maxMedia === 1 ? 'item' : 'items'} (currently ${mediaCount}).`
    );
  }

  // Check individual file constraints (size & type)
  if (hasMedia && platform.mediaSupported) {
    mediaFiles.forEach((media, idx) => {
      const file = media.file || media;
      // Size check
      if (file && file.size && platform.maxFileSizeMB) {
        const maxBytes = platform.maxFileSizeMB * 1024 * 1024;
        if (file.size > maxBytes) {
          errors.push(
            `File #${idx + 1} (${file.name || 'attachment'}) is ${formatFileSize(file.size)}, exceeding ${platform.name}'s ${platform.maxFileSizeMB}MB limit.`
          );
        }
      }

      // MIME type check
      if (file && file.type && platform.allowedMediaTypes && platform.allowedMediaTypes.length > 0) {
        const isAllowed = platform.allowedMediaTypes.some(type => {
          if (type.endsWith('/*')) {
            const prefix = type.split('/')[0];
            return file.type.startsWith(`${prefix}/`);
          }
          return file.type === type;
        });

        if (!isAllowed) {
          errors.push(
            `File #${idx + 1} format (${file.type || 'unknown'}) is not supported by ${platform.name}.`
          );
        }
      }
    });
  }

  // 4. Hashtag Validation
  if (platform.hashtagRules) {
    const { hardLimit, maxRecommended, notes } = platform.hashtagRules;

    if (hardLimit !== null && hashtagCount > hardLimit) {
      errors.push(
        `Exceeds maximum ${hardLimit} hashtags for ${platform.name} (detected ${hashtagCount}).`
      );
    } else if (maxRecommended !== null && hashtagCount > maxRecommended) {
      warnings.push(
        `High hashtag count (${hashtagCount}). ${platform.name} recommendation: ${maxRecommended} or fewer. (${notes})`
      );
    }
  }

  // Determine overall status for this platform
  let status = 'valid';
  if (errors.length > 0) {
    status = 'error';
  } else if (warnings.length > 0) {
    status = 'warning';
  }

  return {
    platformId: platform.id,
    platformName: platform.name,
    brandColor: platform.brandColor,
    status,
    isValid: errors.length === 0,
    charCount,
    charLimit,
    remaining,
    percentUsed,
    isOverLimit: remaining < 0,
    mediaCount,
    maxMedia: platform.maxMedia,
    requiresMedia: platform.requiresMedia,
    hashtagCount,
    hashtags,
    errors,
    warnings
  };
}

/**
 * Validates post across all currently selected platforms.
 * 
 * @param {string} text - Post text
 * @param {Array} mediaFiles - Array of media items
 * @param {string[]} selectedPlatformIds - Array of active platform IDs
 * @param {Object} platformsConfig - Map of all platform configs
 * @returns {Object} Global validation summary
 */
export function validatePost(text = '', mediaFiles = [], selectedPlatformIds = [], platformsConfig = {}) {
  const globalErrors = [];
  const globalWarnings = [];

  // No platform selected
  if (!selectedPlatformIds || selectedPlatformIds.length === 0) {
    globalErrors.push('Please select at least one platform to publish to.');
    return {
      isValid: false,
      canPublish: false,
      overallStatus: 'error',
      globalErrors,
      globalWarnings,
      platformResults: {},
      selectedCount: 0,
      strictestPlatform: null,
      charCount: text.length,
      mediaCount: mediaFiles.length,
      hashtagCount: extractHashtags(text).length
    };
  }

  const platformResults = {};
  const selectedPlatforms = selectedPlatformIds
    .map(id => platformsConfig[id])
    .filter(Boolean);

  let hasErrors = false;
  let hasWarnings = false;

  // Find strictest platform constraint for characters
  let strictestPlatform = selectedPlatforms[0];
  selectedPlatforms.forEach(p => {
    if (p.characterLimit < strictestPlatform.characterLimit) {
      strictestPlatform = p;
    }
  });

  // Validate each selected platform
  selectedPlatforms.forEach(platform => {
    const result = validatePlatform(platform, text, mediaFiles);
    platformResults[platform.id] = result;

    if (!result.isValid) {
      hasErrors = true;
    } else if (result.warnings.length > 0) {
      hasWarnings = true;
    }
  });

  // General empty check notification
  const hasText = text.trim().length > 0;
  const hasMedia = mediaFiles.length > 0;
  if (!hasText && !hasMedia) {
    globalErrors.push('Post is empty. Add content or media before publishing.');
    hasErrors = true;
  }

  let overallStatus = 'valid';
  if (hasErrors) {
    overallStatus = 'error';
  } else if (hasWarnings) {
    overallStatus = 'warning';
  }

  const isValid = !hasErrors && (hasText || hasMedia);
  const canPublish = isValid && selectedPlatforms.length > 0;

  return {
    isValid,
    canPublish,
    overallStatus,
    globalErrors,
    globalWarnings,
    platformResults,
    selectedCount: selectedPlatforms.length,
    strictestPlatform,
    charCount: text.length,
    mediaCount: mediaFiles.length,
    hashtagCount: extractHashtags(text).length,
    hashtags: extractHashtags(text)
  };
}
