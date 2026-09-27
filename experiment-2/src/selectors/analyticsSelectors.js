import { createSelector } from '@reduxjs/toolkit';
import { selectAllPosts, selectPostsAndPlatforms } from './postSelectors';
import { selectAllDrafts } from './draftSelectors';
import { selectAllPlatforms } from './platformSelectors';

/**
 * ============================================================================
 * ANALYTICS SELECTORS (Experiment 2: Performance Module)
 * ============================================================================
 * Concepts:
 * 1. Fully Derived State:
 *    Zero separate counters maintained in Redux slice state.
 *    Counters, averages, min/max calculations are computed purely on-demand
 *    via createSelector.
 * 2. Caching & Efficiency:
 *    Only re-runs when posts, drafts, or platforms entity references change.
 */

export const analyticsSelectorMetrics = {
  postAnalyticsRecomputations: 0,
  dashboardStatsRecomputations: 0
};

// 1. Comprehensive Post Analytics Selector (Requirement 7)
export const selectPostAnalytics = createSelector(
  [selectAllPosts, selectAllDrafts, selectPostsAndPlatforms],
  (posts, drafts, postsWithPlatforms) => {
    analyticsSelectorMetrics.postAnalyticsRecomputations += 1;

    const total = posts.length;
    const published = posts.filter((p) => p.status === 'published').length;
    const draftsCount = drafts.length;

    let totalLength = 0;
    let longestPost = 0;
    let shortestPost = total > 0 ? Infinity : 0;

    posts.forEach((post) => {
      const len = post.content ? post.content.length : 0;
      totalLength += len;
      if (len > longestPost) longestPost = len;
      if (len < shortestPost) shortestPost = len;
    });

    const averageLength = total > 0 ? Math.round(totalLength / total) : 0;
    if (shortestPost === Infinity) shortestPost = 0;

    const validPosts = postsWithPlatforms.filter((p) => p.isValid).length;
    const invalidPosts = postsWithPlatforms.filter((p) => !p.isValid).length;

    return {
      total,
      published,
      drafts: draftsCount,
      averageLength,
      longestPost,
      shortestPost,
      validPosts,
      invalidPosts
    };
  }
);

// 2. Dashboard Aggregate Stats (Preserved for Dashboard.jsx)
export const selectDashboardStats = createSelector(
  [selectAllPosts, selectAllDrafts, selectAllPlatforms],
  (posts, drafts, platforms) => {
    analyticsSelectorMetrics.dashboardStatsRecomputations += 1;

    const totalPosts = posts.length;
    const totalDrafts = drafts.length;
    const totalPlatforms = platforms.length;

    const publishedCount = posts.filter((p) => p.status === 'published').length;
    const draftStatusCount = posts.filter((p) => p.status === 'draft').length;
    const scheduledCount = posts.filter((p) => p.status === 'scheduled').length;

    // Platform distribution
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
