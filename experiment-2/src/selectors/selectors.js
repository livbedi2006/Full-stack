import { createSelector } from '@reduxjs/toolkit';
import { selectAllPosts, selectPostById, selectPostCount } from '../features/posts/postsSlice';
import { selectAllPlatforms, selectPlatformById } from '../features/platforms/platformsSlice';
import { selectAllDrafts, selectDraftById, selectDraftCount } from '../features/drafts/draftsSlice';

/**
 * ============================================================================
 * MEMOIZED REDUX SELECTORS (Experiment 2)
 * ============================================================================
 * Concepts Demonstrated:
 * 1. createSelector (Reselect): Generates memoized selector functions.
 *    Computations are cached and only recalculated if input selectors' outputs change.
 * 2. Cross-Entity Selectors:
 *    Resolves normalized relationships without mutating or duplicating nested data in state.
 * 3. Derived Business Logic:
 *    Calculates dashboard statistics and status filtering directly from normalized state.
 */

// 1. Post Status Filter Selectors
export const selectPublishedPosts = createSelector(
  [selectAllPosts],
  (posts) => posts.filter((post) => post.status === 'published')
);

export const selectDraftStatusPosts = createSelector(
  [selectAllPosts],
  (posts) => posts.filter((post) => post.status === 'draft')
);

export const selectScheduledPosts = createSelector(
  [selectAllPosts],
  (posts) => posts.filter((post) => post.status === 'scheduled')
);

// Generic filtered selector by status
export const selectPostsByStatus = createSelector(
  [selectAllPosts, (_, status) => status],
  (posts, status) => {
    if (!status || status === 'all') return posts;
    return posts.filter((post) => post.status === status);
  }
);

// 2. Cross-Entity Selector: Resolves a post's platform IDs into full platform entities
// Notice how normalized referential keys (platformIds) are joined on the fly!
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

// 3. Drafts Filtering by Platform
export const selectDraftsByPlatform = createSelector(
  [selectAllDrafts, (_, platformId) => platformId],
  (drafts, platformId) => {
    if (!platformId || platformId === 'all') return drafts;
    return drafts.filter((d) => d.platformIds?.includes(platformId));
  }
);

// 4. Dashboard Aggregate Metrics Selector
export const selectDashboardStats = createSelector(
  [selectAllPosts, selectAllDrafts, selectAllPlatforms],
  (posts, drafts, platforms) => {
    const totalPosts = posts.length;
    const totalDrafts = drafts.length;
    const totalPlatforms = platforms.length;

    const publishedCount = posts.filter((p) => p.status === 'published').length;
    const draftStatusCount = posts.filter((p) => p.status === 'draft').length;
    const scheduledCount = posts.filter((p) => p.status === 'scheduled').length;

    // Platform distribution in published posts
    const platformDistribution = {};
    platforms.forEach((p) => {
      platformDistribution[p.id] = {
        name: p.name,
        color: p.brandColor,
        postCount: 0
      };
    });

    posts.forEach((p) => {
      if (Array.isArray(p.platformIds)) {
        p.platformIds.forEach((pId) => {
          if (platformDistribution[pId]) {
            platformDistribution[pId].postCount += 1;
          }
        });
      }
    });

    // Recent 5 posts
    const recentPosts = posts.slice(0, 5);

    return {
      totalPosts,
      totalDrafts,
      totalPlatforms,
      publishedCount,
      draftStatusCount,
      scheduledCount,
      platformDistribution,
      recentPosts
    };
  }
);

// Re-export base selectors for unified consumer imports
export {
  selectAllPosts,
  selectPostById,
  selectPostCount,
  selectAllPlatforms,
  selectPlatformById,
  selectAllDrafts,
  selectDraftById,
  selectDraftCount
};
