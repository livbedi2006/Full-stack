/**
 * Pure Selector Functions for Social Media Drafts
 * 
 * Centralizes derived computations for search, filtering, platform indexing,
 * and statistical analytics to be consumed with React's `useMemo`.
 */

/**
 * Filter drafts based on text search query, target platform, and sorting strategy.
 * 
 * @param {Array} drafts - List of drafts
 * @param {string} searchTerm - Search query
 * @param {string} platformFilter - Filter by platform ('all' or platform id)
 * @param {string} sortBy - Sort order ('newest', 'oldest', 'longest', 'shortest')
 * @returns {Array} Filtered and ordered list of drafts
 */
export function selectFilteredDrafts(
  drafts = [],
  searchTerm = '',
  platformFilter = 'all',
  sortBy = 'newest'
) {
  if (!Array.isArray(drafts)) return [];

  const query = searchTerm.trim().toLowerCase();

  return drafts
    .filter(draft => {
      // 1. Text Search Filter (content, title, or platform names)
      if (query) {
        const matchesContent = draft.content?.toLowerCase().includes(query);
        const matchesTitle = draft.title?.toLowerCase().includes(query);
        const matchesPlatform = draft.platforms?.some(p => p.toLowerCase().includes(query));
        if (!matchesContent && !matchesTitle && !matchesPlatform) {
          return false;
        }
      }

      // 2. Platform Selection Filter
      if (platformFilter && platformFilter !== 'all') {
        const hasPlatform = draft.platforms?.includes(platformFilter);
        if (!hasPlatform) {
          return false;
        }
      }

      return true;
    })
    .sort((a, b) => {
      // 3. Sorting Strategies
      switch (sortBy) {
        case 'oldest':
          return new Date(a.updatedAt || a.createdAt) - new Date(b.updatedAt || b.createdAt);
        case 'longest':
          return (b.content?.length || 0) - (a.content?.length || 0);
        case 'shortest':
          return (a.content?.length || 0) - (b.content?.length || 0);
        case 'newest':
        default:
          return new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt);
      }
    });
}

/**
 * Calculates aggregate draft statistics and analytics.
 * 
 * @param {Array} drafts - List of drafts
 * @returns {Object} Comprehensive analytics breakdown
 */
export function selectDraftStatistics(drafts = []) {
  if (!Array.isArray(drafts) || drafts.length === 0) {
    return {
      totalDrafts: 0,
      totalCharacters: 0,
      averageCharacters: 0,
      longestDraftChars: 0,
      shortestDraftChars: 0,
      platformCounts: {
        twitter: 0,
        instagram: 0,
        facebook: 0,
        linkedin: 0
      },
      mediaAttachmentCount: 0,
      recentlyUpdatedCount: 0
    };
  }

  const totalDrafts = drafts.length;
  let totalCharacters = 0;
  let longestDraftChars = 0;
  let shortestDraftChars = Infinity;
  let mediaAttachmentCount = 0;

  const platformCounts = {
    twitter: 0,
    instagram: 0,
    facebook: 0,
    linkedin: 0
  };

  const now = Date.now();
  const ONE_DAY_MS = 86400000;
  let recentlyUpdatedCount = 0;

  drafts.forEach(draft => {
    const len = draft.content ? draft.content.length : 0;
    totalCharacters += len;

    if (len > longestDraftChars) longestDraftChars = len;
    if (len < shortestDraftChars) shortestDraftChars = len;

    if (Array.isArray(draft.media)) {
      mediaAttachmentCount += draft.media.length;
    }

    if (Array.isArray(draft.platforms)) {
      draft.platforms.forEach(p => {
        if (platformCounts[p] !== undefined) {
          platformCounts[p] += 1;
        } else {
          platformCounts[p] = 1;
        }
      });
    }

    // Check if updated in the last 24 hours
    const updatedTime = new Date(draft.updatedAt || draft.createdAt).getTime();
    if (now - updatedTime <= ONE_DAY_MS) {
      recentlyUpdatedCount += 1;
    }
  });

  const averageCharacters = Math.round(totalCharacters / totalDrafts);

  return {
    totalDrafts,
    totalCharacters,
    averageCharacters,
    longestDraftChars,
    shortestDraftChars: shortestDraftChars === Infinity ? 0 : shortestDraftChars,
    platformCounts,
    mediaAttachmentCount,
    recentlyUpdatedCount
  };
}

/**
 * Filter drafts targeting a specific social platform.
 * 
 * @param {Array} drafts 
 * @param {string} platformId 
 * @returns {Array}
 */
export function selectDraftsByPlatform(drafts = [], platformId) {
  if (!Array.isArray(drafts) || !platformId) return [];
  return drafts.filter(draft => draft.platforms?.includes(platformId));
}
