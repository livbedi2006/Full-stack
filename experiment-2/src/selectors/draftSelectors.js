import { createSelector } from '@reduxjs/toolkit';
import {
  selectAllDrafts as selectAllDraftsBase,
  selectDraftById as selectDraftByIdBase,
  selectDraftIds as selectDraftIdsBase,
  selectDraftCount as selectDraftCountBase,
  selectDraftsStatus,
  selectDraftsError
} from '../features/drafts/draftsSlice';

/**
 * ============================================================================
 * DRAFT SELECTORS (Experiment 2: Performance Module)
 * ============================================================================
 * Concepts:
 * 1. Basic Selectors: Direct read from normalized drafts entity adapter.
 * 2. Memoized createSelector: Computes draft statistics without storing
 *    derived totals/averages in Redux state.
 */

export const draftSelectorMetrics = {
  draftStatsRecomputations: 0,
  draftsByPlatformRecomputations: 0
};

// 1. Basic Selectors
export const selectAllDrafts = selectAllDraftsBase;
export const selectDraftById = selectDraftByIdBase;
export const selectDraftIds = selectDraftIdsBase;
export const selectDraftCount = selectDraftCountBase;
export { selectDraftsStatus, selectDraftsError };

// 2. Memoized Selector: Draft Statistics (Derived State)
export const selectDraftStatistics = createSelector(
  [selectAllDrafts],
  (drafts) => {
    draftSelectorMetrics.draftStatsRecomputations += 1;
    const total = drafts.length;
    let totalLength = 0;

    drafts.forEach((d) => {
      totalLength += (d.content ? d.content.length : 0);
    });

    const averageLength = total > 0 ? Math.round(totalLength / total) : 0;

    return {
      total,
      averageLength,
      recentDrafts: drafts.slice(0, 3)
    };
  }
);

// 3. Memoized Selector: Filter Drafts by Platform
export const selectDraftsByPlatform = createSelector(
  [selectAllDrafts, (_, platformId) => platformId],
  (drafts, platformId) => {
    draftSelectorMetrics.draftsByPlatformRecomputations += 1;
    if (!platformId || platformId === 'all') return drafts;
    return drafts.filter((d) => d.platformIds?.includes(platformId));
  }
);
