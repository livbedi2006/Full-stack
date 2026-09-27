/**
 * Multi-Platform Configuration Structure
 * 
 * Defines constraints, rules, limits, and visual metadata for each supported platform.
 * Easily extensible: to support a new platform (e.g., Threads, Mastodon, Bluesky),
 * simply add a new configuration object here.
 */

export const PLATFORMS = {
  twitter: {
    id: 'twitter',
    name: 'Twitter / X',
    shortName: 'X',
    brandColor: '#1DA1F2',
    accentColor: '#0c85d0',
    gradient: 'linear-gradient(135deg, #1DA1F2 0%, #0c85d0 100%)',
    characterLimit: 280,
    mediaSupported: true,
    maxMedia: 4,
    allowedMediaTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4'],
    maxFileSizeMB: 15,
    requiresMedia: false,
    hashtagRules: {
      maxRecommended: 3,
      hardLimit: null,
      notes: 'Optimal engagement with 1–3 relevant hashtags. Excessive tags trigger spam filters.'
    },
    tagline: 'Microblogging & Real-time Trends',
    specs: {
      charLimit: '280 chars',
      mediaLimit: 'Max 4 files',
      hashtags: '1-3 recommended'
    }
  },
  instagram: {
    id: 'instagram',
    name: 'Instagram',
    shortName: 'IG',
    brandColor: '#E1306C',
    accentColor: '#F56040',
    gradient: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
    characterLimit: 2200,
    mediaSupported: true,
    maxMedia: 10,
    allowedMediaTypes: ['image/jpeg', 'image/png', 'image/webp', 'video/mp4'],
    maxFileSizeMB: 30,
    requiresMedia: true, // Hard rule: Instagram is a visual platform requiring media
    hashtagRules: {
      maxRecommended: 15,
      hardLimit: 30,
      notes: 'Strict maximum of 30 hashtags allowed. 5-15 recommended for optimal reach.'
    },
    tagline: 'Visual Storytelling & Feeds',
    specs: {
      charLimit: '2,200 chars',
      mediaLimit: 'Required (Max 10)',
      hashtags: 'Max 30 tags'
    }
  },
  facebook: {
    id: 'facebook',
    name: 'Facebook',
    shortName: 'FB',
    brandColor: '#1877F2',
    accentColor: '#0d65d9',
    gradient: 'linear-gradient(135deg, #1877F2 0%, #0d65d9 100%)',
    characterLimit: 63206,
    mediaSupported: true,
    maxMedia: 10,
    allowedMediaTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4'],
    maxFileSizeMB: 25,
    requiresMedia: false,
    hashtagRules: {
      maxRecommended: 5,
      hardLimit: null,
      notes: 'Hashtags do not drive significant distribution; 1–3 recommended.'
    },
    tagline: 'Community & Long-form Updates',
    specs: {
      charLimit: '63,206 chars',
      mediaLimit: 'Max 10 files',
      hashtags: '2-5 recommended'
    }
  },
  linkedin: {
    id: 'linkedin',
    name: 'LinkedIn',
    shortName: 'IN',
    brandColor: '#0A66C2',
    accentColor: '#084e96',
    gradient: 'linear-gradient(135deg, #0A66C2 0%, #084e96 100%)',
    characterLimit: 3000,
    mediaSupported: true,
    maxMedia: 9,
    allowedMediaTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'application/pdf'],
    maxFileSizeMB: 20,
    requiresMedia: false,
    hashtagRules: {
      maxRecommended: 5,
      hardLimit: 10,
      notes: 'Professional industry hashtags. Max 10 tags before algorithm penalizes reach.'
    },
    tagline: 'Professional & Thought Leadership',
    specs: {
      charLimit: '3,000 chars',
      mediaLimit: 'Max 9 files',
      hashtags: '3-5 recommended'
    }
  }
};

export const DEFAULT_SELECTED_PLATFORMS = ['twitter', 'linkedin'];
