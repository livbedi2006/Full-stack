import { createSelector } from '@reduxjs/toolkit';
import {
  selectAllPosts as selectAllPostsBase,
  selectPostById as selectPostByIdBase,
  selectPostIds as selectPostIdsBase,
  selectPostCount as selectPostCountBase,
  selectPostsStatus,
  selectPostsError,
  selectPostsOperationLoading
} from '../features/posts/postsSlice';
import { selectAllPlatforms, selectPlatformMap } from './platformSelectors';

/**
 * ============================================================================
 * POST SELECTORS (Experiment 2: Performance Module)
 * ============================================================================
 * Concepts:
 * 1. Basic Selectors: Reads direct normalized entities without duplication.
 * 2. Multi-Input Selectors: Combines posts + platforms to calculate derived
 *    platform constraints without writing redundant data to the Redux store.
 * 3. Filtered Posts Selector: Memoized search, filter, and sorting.
 * 4. Grouped Posts Selector: Groups posts by platform cleanly in memoized memory.
 * 5. Recomputation Tracking: Verifiable telemetry proving memoization prevents
 *    re-running heavy calculations on unrelated state changes.
 */

// Live execution counters for educational demonstration
export const postSelectorMetrics = {
  filteredPostsRecomputations: 0,
  groupedRecomputations: 0,
  validPostsRecomputations: 0,
  postsAndPlatformsRecomputations: 0,
  publishedPostsRecomputations: 0
};

// 1. Basic Selectors
export const selectAllPosts = selectAllPostsBase;
export const selectPostById = selectPostByIdBase;
export const selectPostIds = selectPostIdsBase;
export const selectPostCount = selectPostCountBase;
export { selectPostsStatus, selectPostsError, selectPostsOperationLoading };

// 2. Status-specific Memoized Selectors
export const selectPublishedPosts = createSelector(
  [selectAllPosts],
  (posts) => {
    postSelectorMetrics.publishedPostsRecomputations += 1;
    return posts.filter((p) => p.status === 'published');
  }
);

export const selectDraftStatusPosts = createSelector(
  [selectAllPosts],
  (posts) => posts.filter((p) => p.status === 'draft')
);

export const selectDraftPosts = selectDraftStatusPosts;

export const selectScheduledPosts = createSelector(
  [selectAllPosts],
  (posts) => posts.filter((p) => p.status === 'scheduled')
);

// 3. Platform Filter Selector
export const selectPostsByPlatform = createSelector(
  [selectAllPosts, (_, platformId) => platformId],
  (posts, platformId) => {
    if (!platformId || platformId === 'all') return posts;
    return posts.filter((p) => p.platformIds?.includes(platformId));
  }
);

// 4. Advanced Multi-Input Selector: selectPostsAndPlatforms
// Joins normalized posts with normalized platform entities on-the-fly.
// Computes length, character limit validation, and resolved platform badges.
export const selectPostsAndPlatforms = createSelector(
  [selectAllPosts, selectPlatformMap],
  (posts, platformMap) => {
    postSelectorMetrics.postsAndPlatformsRecomputations += 1;
    return posts.map((post) => {
      const pIds = post.platformIds || [];
      const platforms = pIds.map((id) => platformMap.get(id)).filter(Boolean);
      const charCount = post.content ? post.content.length : 0;

      // Validate post length against all assigned platforms
      let isValid = platforms.length > 0;
      let minCharLimit = Infinity;
      let constrainingPlatform = null;

      platforms.forEach((p) => {
        if (p.characterLimit < minCharLimit) {
          minCharLimit = p.characterLimit;
          constrainingPlatform = p;
        }
        if (charCount > p.characterLimit) {
          isValid = false;
        }
      });

      if (minCharLimit === Infinity) minCharLimit = 0;

      return {
        ...post,
        charCount,
        platforms,
        platformNames: platforms.map((p) => p.name).join(', '),
        isValid,
        minCharLimit,
        constrainingPlatform
      };
    });
  }
);

// 5. Derived Selectors: Valid vs Invalid Posts
export const selectValidPosts = createSelector(
  [selectPostsAndPlatforms],
  (postsWithPlatforms) => {
    postSelectorMetrics.validPostsRecomputations += 1;
    return postsWithPlatforms.filter((p) => p.isValid);
  }
);

export const selectInvalidPosts = createSelector(
  [selectPostsAndPlatforms],
  (postsWithPlatforms) => postsWithPlatforms.filter((p) => !p.isValid)
);

// 6. Grouped Posts Selector
// Produces { twitter: [...], instagram: [...], facebook: [...], linkedin: [...] }
export const selectPostsGroupedByPlatform = createSelector(
  [selectAllPosts, selectAllPlatforms],
  (posts, platforms) => {
    postSelectorMetrics.groupedRecomputations += 1;
    const grouped = {};
    platforms.forEach((p) => {
      grouped[p.id] = [];
    });

    posts.forEach((post) => {
      if (Array.isArray(post.platformIds)) {
        post.platformIds.forEach((pid) => {
          if (grouped[pid]) {
            grouped[pid].push(post);
          } else {
            grouped[pid] = [post];
          }
        });
      }
    });

    return grouped;
  }
);

// Helper for single post with platform details
export const selectPostWithPlatforms = createSelector(
  [selectAllPlatforms, (_, post) => post],
  (platforms, post) => {
    if (!post || !post.platformIds) return { ...post, platforms: [] };
    const platformMap = new Map(platforms.map((p) => [p.id, p]));
    const resolvedPlatforms = post.platformIds
      .map((id) => platformMap.get(id))
      .filter(Boolean);

    return {
      ...post,
      platforms: resolvedPlatforms
    };
  }
);

// 7. Filtered Posts Selector (Multi-Criteria Memoized Search & Filter)
// Recomputes ONLY when posts or filter arguments change.
export const selectFilteredPosts = createSelector(
  [
    selectPostsAndPlatforms,
    (_, filters) => filters?.searchTerm || '',
    (_, filters) => filters?.status || 'all',
    (_, filters) => filters?.platform || 'all',
    (_, filters) => filters?.sortBy || 'newest'
  ],
  (posts, searchTerm, status, platform, sortBy) => {
    postSelectorMetrics.filteredPostsRecomputations += 1;

    let result = posts;

    // 1. Keyword search (case-insensitive)
    if (searchTerm && searchTerm.trim()) {
      const query = searchTerm.toLowerCase().trim();
      result = result.filter((p) => p.content?.toLowerCase().includes(query));
    }

    // 2. Status filter
    if (status && status !== 'all') {
      result = result.filter((p) => p.status === status);
    }

    // 3. Platform filter
    if (platform && platform !== 'all') {
      result = result.filter((p) => p.platformIds?.includes(platform));
    }

    // 4. Sort criteria (without mutating original state array)
    if (sortBy === 'newest') {
      result = [...result].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortBy === 'oldest') {
      result = [...result].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else if (sortBy === 'shortest') {
      result = [...result].sort((a, b) => (a.charCount || 0) - (b.charCount || 0));
    } else if (sortBy === 'longest') {
      result = [...result].sort((a, b) => (b.charCount || 0) - (a.charCount || 0));
    }

    return result;
  }
);
