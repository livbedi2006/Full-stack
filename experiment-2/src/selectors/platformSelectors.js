import { createSelector } from '@reduxjs/toolkit';
import {
  selectAllPlatforms as selectAllPlatformsBase,
  selectPlatformById as selectPlatformByIdBase,
  selectPlatformIds as selectPlatformIdsBase,
  selectPlatformCount as selectPlatformCountBase,
  selectPlatformsStatus,
  selectPlatformsError
} from '../features/platforms/platformsSlice';

/**
 * ============================================================================
 * PLATFORM SELECTORS (Experiment 2: Performance Module)
 * ============================================================================
 * Concepts:
 * 1. Basic Selectors: Direct read from normalized entity state.
 * 2. Memoized createSelector: Computes O(1) platform lookup Map without
 *    reallocating map on every component render.
 */

// Tracking real selector executions
export const platformSelectorMetrics = {
  platformMapRecomputations: 0
};

// 1. Basic Selectors (Zero duplication, read directly from normalized store)
export const selectAllPlatforms = selectAllPlatformsBase;
export const selectPlatformById = selectPlatformByIdBase;
export const selectPlatformIds = selectPlatformIdsBase;
export const selectPlatformCount = selectPlatformCountBase;
export { selectPlatformsStatus, selectPlatformsError };

// 2. Memoized Selector: O(1) Platform Map Lookup
// Recomputes ONLY when platforms array reference changes
export const selectPlatformMap = createSelector(
  [selectAllPlatforms],
  (platforms) => {
    platformSelectorMetrics.platformMapRecomputations += 1;
    return new Map(platforms.map((p) => [p.id, p]));
  }
);
