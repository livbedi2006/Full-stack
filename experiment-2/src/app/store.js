import { configureStore } from '@reduxjs/toolkit';
import postsReducer from '../features/posts/postsSlice';
import platformsReducer from '../features/platforms/platformsSlice';
import draftsReducer from '../features/drafts/draftsSlice';

/**
 * ============================================================================
 * CENTRALIZED REDUX TOOLKIT STORE (Experiment 2)
 * ============================================================================
 * Concepts Demonstrated:
 * 1. configureStore: Simplifies store setup with sensible defaults:
 *    - Automatically configures Redux Thunk middleware for async actions
 *    - Automatically turns on Redux DevTools extension integration
 *    - Automatically adds development checks (e.g. mutation detector, serializability check)
 * 2. Root Reducer Composition:
 *    - posts: postsReducer (Normalized posts entity adapter)
 *    - platforms: platformsReducer (Normalized platforms entity adapter)
 *    - drafts: draftsReducer (Normalized drafts entity adapter)
 */

export const store = configureStore({
  reducer: {
    posts: postsReducer,
    platforms: platformsReducer,
    drafts: draftsReducer
  }
});

export default store;
