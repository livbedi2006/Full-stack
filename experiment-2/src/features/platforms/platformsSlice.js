import { createSlice, createAsyncThunk, createEntityAdapter } from '@reduxjs/toolkit';
import { mockApi } from '../../services/mockApi';

/**
 * ============================================================================
 * REDUX TOOLKIT: PLATFORMS SLICE
 * ============================================================================
 * Concepts Demonstrated:
 * 1. createEntityAdapter: Manages normalized state with pre-built CRUD operations
 *    and memoized selectors.
 * 2. Normalized State Structure: Stores entities by ID (dictionary) and an array of IDs.
 *    { ids: ['twitter', 'instagram', ...], entities: { twitter: {...}, ... } }
 * 3. createAsyncThunk: Handles asynchronous data fetching with pending/fulfilled/rejected lifecycle.
 */

// 1. Entity Adapter Configuration
export const platformsAdapter = createEntityAdapter({
  selectId: (platform) => platform.id,
  sortComparer: (a, b) => a.name.localeCompare(b.name)
});

// 2. Initial State: Adapter provides { ids: [], entities: {} }, plus custom status fields
const initialState = platformsAdapter.getInitialState({
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null
});

// 3. Async Thunk for fetching platforms
export const fetchPlatforms = createAsyncThunk(
  'platforms/fetchPlatforms',
  async (_, { rejectWithValue }) => {
    try {
      const response = await mockApi.getPlatforms();
      return response;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch platforms');
    }
  }
);

// 4. Platforms Slice
const platformsSlice = createSlice({
  name: 'platforms',
  initialState,
  reducers: {
    // Synchronous reducers using adapter methods
    addPlatform: platformsAdapter.addOne,
    updatePlatform: platformsAdapter.updateOne,
    setAllPlatforms: platformsAdapter.setAll
  },
  extraReducers: (builder) => {
    builder
      // Fetch platforms lifecycle
      .addCase(fetchPlatforms.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchPlatforms.fulfilled, (state, action) => {
        state.status = 'succeeded';
        // setAll normalizes the incoming array into { ids, entities }
        platformsAdapter.setAll(state, action.payload);
      })
      .addCase(fetchPlatforms.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error.message;
      });
  }
});

export const { addPlatform, updatePlatform, setAllPlatforms } = platformsSlice.actions;

// 5. Export Adapter Selectors
// Adapter generates memoized selectors bound to state.platforms
export const {
  selectAll: selectAllPlatforms,
  selectById: selectPlatformById,
  selectIds: selectPlatformIds,
  selectTotal: selectPlatformCount
} = platformsAdapter.getSelectors((state) => state.platforms);

export const selectPlatformsStatus = (state) => state.platforms.status;
export const selectPlatformsError = (state) => state.platforms.error;

export default platformsSlice.reducer;
