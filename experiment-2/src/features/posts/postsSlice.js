import { createSlice, createAsyncThunk, createEntityAdapter } from '@reduxjs/toolkit';
import { mockApi } from '../../services/mockApi';

/**
 * ============================================================================
 * REDUX TOOLKIT: POSTS SLICE
 * ============================================================================
 * Concepts Demonstrated:
 * 1. Normalized State Architecture:
 *    Stores posts in a lookup table indexed by ID.
 *    Referential platform relationship: post.platformIds: ['twitter', 'instagram']
 *    eliminates duplicate platform data objects inside each post!
 * 2. createEntityAdapter: Provides optimized CRUD operations:
 *    - addOne / setAll / updateOne / removeOne / removeAll
 * 3. createAsyncThunk: Implements async action creators for server communication:
 *    - pending -> loading state
 *    - fulfilled -> updates normalized entities
 *    - rejected -> sets error message
 */

// 1. Entity Adapter Configuration
export const postsAdapter = createEntityAdapter({
  selectId: (post) => post.id,
  sortComparer: (a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt)
});

// 2. Initial Normalized State
const initialState = postsAdapter.getInitialState({
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
  operationLoading: false // Tracks mutation in-flight status for UI buttons
});

// 3. Async Thunks
export const fetchPosts = createAsyncThunk(
  'posts/fetchPosts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await mockApi.getPosts();
      return response;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch posts');
    }
  }
);

export const createPostThunk = createAsyncThunk(
  'posts/createPost',
  async (postData, { rejectWithValue }) => {
    try {
      const newPost = await mockApi.createPost(postData);
      return newPost;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to create post');
    }
  }
);

export const updatePostThunk = createAsyncThunk(
  'posts/updatePost',
  async ({ id, updates }, { rejectWithValue }) => {
    try {
      const updated = await mockApi.updatePost(id, updates);
      return updated;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to update post');
    }
  }
);

export const deletePostThunk = createAsyncThunk(
  'posts/deletePost',
  async (id, { rejectWithValue }) => {
    try {
      await mockApi.deletePost(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to delete post');
    }
  }
);

// 4. Posts Slice Definition
const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    // Direct synchronous reducers using Immer (built into Redux Toolkit)
    addPost: postsAdapter.addOne,
    updatePost: postsAdapter.updateOne,
    deletePost: postsAdapter.removeOne,
    clearPosts: postsAdapter.removeAll,
    setPosts: postsAdapter.setAll,
    addSamplePosts: (state, action) => {
      postsAdapter.addMany(state, action.payload);
    },
    clearSamplePosts: (state) => {
      const sampleIds = state.ids.filter(id => String(id).startsWith('sample-'));
      postsAdapter.removeMany(state, sampleIds);
    },
    updatePostStatus: (state, action) => {
      const { id, status } = action.payload;
      postsAdapter.updateOne(state, {
        id,
        changes: { status, updatedAt: new Date().toISOString() }
      });
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Posts Lifecycle
      .addCase(fetchPosts.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.status = 'succeeded';
        postsAdapter.setAll(state, action.payload);
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error.message;
      })

      // Create Post Lifecycle
      .addCase(createPostThunk.pending, (state) => {
        state.operationLoading = true;
        state.error = null;
      })
      .addCase(createPostThunk.fulfilled, (state, action) => {
        state.operationLoading = false;
        postsAdapter.addOne(state, action.payload);
      })
      .addCase(createPostThunk.rejected, (state, action) => {
        state.operationLoading = false;
        state.error = action.payload || action.error.message;
      })

      // Update Post Lifecycle
      .addCase(updatePostThunk.pending, (state) => {
        state.operationLoading = true;
        state.error = null;
      })
      .addCase(updatePostThunk.fulfilled, (state, action) => {
        state.operationLoading = false;
        postsAdapter.upsertOne(state, action.payload);
      })
      .addCase(updatePostThunk.rejected, (state, action) => {
        state.operationLoading = false;
        state.error = action.payload || action.error.message;
      })

      // Delete Post Lifecycle
      .addCase(deletePostThunk.pending, (state) => {
        state.operationLoading = true;
        state.error = null;
      })
      .addCase(deletePostThunk.fulfilled, (state, action) => {
        state.operationLoading = false;
        postsAdapter.removeOne(state, action.payload);
      })
      .addCase(deletePostThunk.rejected, (state, action) => {
        state.operationLoading = false;
        state.error = action.payload || action.error.message;
      });
  }
});

export const {
  addPost,
  updatePost,
  deletePost,
  clearPosts,
  setPosts,
  addSamplePosts,
  clearSamplePosts,
  updatePostStatus
} = postsSlice.actions;

// 5. Selectors generated by createEntityAdapter
export const {
  selectAll: selectAllPosts,
  selectById: selectPostById,
  selectIds: selectPostIds,
  selectTotal: selectPostCount
} = postsAdapter.getSelectors((state) => state.posts);

export const selectPostsStatus = (state) => state.posts.status;
export const selectPostsError = (state) => state.posts.error;
export const selectPostsOperationLoading = (state) => state.posts.operationLoading;

export default postsSlice.reducer;
