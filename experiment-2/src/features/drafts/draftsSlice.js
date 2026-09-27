import { createSlice, createAsyncThunk, createEntityAdapter } from '@reduxjs/toolkit';
import { mockApi } from '../../services/mockApi';
import { createPostThunk } from '../posts/postsSlice';

/**
 * ============================================================================
 * REDUX TOOLKIT: DRAFTS SLICE
 * ============================================================================
 * Concepts Demonstrated:
 * 1. Normalized Draft Entities:
 *    { ids: ['draft-1', ...], entities: { 'draft-1': { id, title, content, platformIds, ... } } }
 * 2. Cross-slice orchestration:
 *    convertDraftToPostThunk dispatches createPostThunk to publish the draft,
 *    then deletes the draft from the drafts entity adapter!
 */

// 1. Entity Adapter Configuration
export const draftsAdapter = createEntityAdapter({
  selectId: (draft) => draft.id,
  sortComparer: (a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt)
});

// 2. Initial State
const initialState = draftsAdapter.getInitialState({
  status: 'idle',
  error: null,
  operationLoading: false
});

// 3. Async Thunks
export const fetchDrafts = createAsyncThunk(
  'drafts/fetchDrafts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await mockApi.getDrafts();
      return response;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch drafts');
    }
  }
);

export const createDraftThunk = createAsyncThunk(
  'drafts/createDraft',
  async (draftData, { rejectWithValue }) => {
    try {
      const newDraft = await mockApi.createDraft(draftData);
      return newDraft;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to create draft');
    }
  }
);

export const updateDraftThunk = createAsyncThunk(
  'drafts/updateDraft',
  async ({ id, updates }, { rejectWithValue }) => {
    try {
      const updated = await mockApi.updateDraft(id, updates);
      return updated;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to update draft');
    }
  }
);

export const deleteDraftThunk = createAsyncThunk(
  'drafts/deleteDraft',
  async (id, { rejectWithValue }) => {
    try {
      await mockApi.deleteDraft(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to delete draft');
    }
  }
);

/**
 * Thunk to convert an existing draft into an active Post
 * Dispatches createPostThunk, and upon success, removes the draft.
 */
export const convertDraftToPostThunk = createAsyncThunk(
  'drafts/convertToPost',
  async (draftId, { getState, dispatch, rejectWithValue }) => {
    try {
      const state = getState();
      const draft = selectDraftById(state, draftId);
      if (!draft) {
        throw new Error(`Draft with ID "${draftId}" not found.`);
      }

      // 1. Create post in postsSlice
      await dispatch(createPostThunk({
        content: draft.content,
        platformIds: draft.platformIds || [],
        status: 'published'
      })).unwrap();

      // 2. Delete the draft from mockApi and draftsSlice
      await mockApi.deleteDraft(draftId);
      return draftId;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to convert draft to post');
    }
  }
);

// 4. Drafts Slice
const draftsSlice = createSlice({
  name: 'drafts',
  initialState,
  reducers: {
    addDraft: draftsAdapter.addOne,
    updateDraft: draftsAdapter.updateOne,
    deleteDraft: draftsAdapter.removeOne,
    clearDrafts: draftsAdapter.removeAll,
    setDrafts: draftsAdapter.setAll
  },
  extraReducers: (builder) => {
    builder
      // Fetch Drafts
      .addCase(fetchDrafts.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchDrafts.fulfilled, (state, action) => {
        state.status = 'succeeded';
        draftsAdapter.setAll(state, action.payload);
      })
      .addCase(fetchDrafts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error.message;
      })

      // Create Draft
      .addCase(createDraftThunk.pending, (state) => {
        state.operationLoading = true;
        state.error = null;
      })
      .addCase(createDraftThunk.fulfilled, (state, action) => {
        state.operationLoading = false;
        draftsAdapter.addOne(state, action.payload);
      })
      .addCase(createDraftThunk.rejected, (state, action) => {
        state.operationLoading = false;
        state.error = action.payload || action.error.message;
      })

      // Update Draft
      .addCase(updateDraftThunk.pending, (state) => {
        state.operationLoading = true;
        state.error = null;
      })
      .addCase(updateDraftThunk.fulfilled, (state, action) => {
        state.operationLoading = false;
        draftsAdapter.upsertOne(state, action.payload);
      })
      .addCase(updateDraftThunk.rejected, (state, action) => {
        state.operationLoading = false;
        state.error = action.payload || action.error.message;
      })

      // Delete Draft
      .addCase(deleteDraftThunk.pending, (state) => {
        state.operationLoading = true;
        state.error = null;
      })
      .addCase(deleteDraftThunk.fulfilled, (state, action) => {
        state.operationLoading = false;
        draftsAdapter.removeOne(state, action.payload);
      })
      .addCase(deleteDraftThunk.rejected, (state, action) => {
        state.operationLoading = false;
        state.error = action.payload || action.error.message;
      })

      // Convert Draft to Post
      .addCase(convertDraftToPostThunk.fulfilled, (state, action) => {
        draftsAdapter.removeOne(state, action.payload);
      });
  }
});

export const {
  addDraft,
  updateDraft,
  deleteDraft,
  clearDrafts,
  setDrafts
} = draftsSlice.actions;

// 5. Selectors
export const {
  selectAll: selectAllDrafts,
  selectById: selectDraftById,
  selectIds: selectDraftIds,
  selectTotal: selectDraftCount
} = draftsAdapter.getSelectors((state) => state.drafts);

export const selectDraftsStatus = (state) => state.drafts.status;
export const selectDraftsError = (state) => state.drafts.error;
export const selectDraftsOperationLoading = (state) => state.drafts.operationLoading;

export default draftsSlice.reducer;
