# Experiment 2: Centralized State Management Using Redux Toolkit

## Aim
To design and implement a centralized, scalable state management system using **Redux Toolkit** and **React-Redux** for managing social posts, target platform specifications, and drafts with normalized data structures and asynchronous thunk workflows.

---

## Objectives
1. **Understand Global State Management**: Replace local component state and eliminate prop drilling using a single centralized source of truth.
2. **Implement Redux Toolkit (RTK)**: Configure the global store with `configureStore`, create feature slices using `createSlice`, and handle asynchronous operations with `createAsyncThunk`.
3. **Design a Normalized State Architecture**: Utilize `createEntityAdapter` to structure state as relational tables (`{ ids: [], entities: {} }`), preventing duplicate nested data and ensuring $O(1)$ lookups.
4. **Master Asynchronous Workflows**: Simulate backend REST APIs with pending, fulfilled, and rejected lifecycles.
5. **Optimize Performance with Memoized Selectors**: Use `createSelector` (Reselect) for derived business computations (filtering, search, and dashboard analytics) without unnecessary recalculations.

---

## Technologies Used
- **Frontend Framework**: React.js 19 (Functional Components & React Hooks)
- **State Management**: Redux Toolkit (`@reduxjs/toolkit` v2.x)
- **React-Redux Bindings**: `react-redux` v9.x (`useSelector`, `useDispatch`, `Provider`)
- **Build Tooling**: Vite 8.3
- **Language**: JavaScript (ES6+ / Modern JS)
- **Styling**: Vanilla CSS (Custom Design System with CSS variables and responsive glassmorphism)
- **Runtime Environment**: Node.js v18+ and npm v9+

---

## Theory & Redux Core Concepts

### 1. Global State
In large applications, managing state across deeply nested components leads to **prop drilling** (passing props through intermediaries that don't need them). Global state provides a centralized repository accessible by any component.

### 2. Redux & Redux Toolkit (RTK)
Redux is a predictable state container based on unidirectional data flow. **Redux Toolkit** is the official, opinionated toolset that eliminates boilerplate:
- Eliminates manual action creator and action type definition.
- Includes Immer automatically to write clean "mutative" code that produces immutable updates safely.
- Preconfigures Redux Thunk middleware and Redux DevTools Extension.

### 3. Store (`src/app/store.js`)
The single object that holds the entire state tree. Configured via `configureStore()`.

### 4. Slices (`src/features/*/*Slice.js`)
A collection of Redux reducer logic and actions for a single application domain (e.g., `posts`, `platforms`, `drafts`) defined using `createSlice()`.

### 5. Actions & Reducers
- **Action**: A plain JavaScript object with a `type` and an optional `payload`.
- **Reducer**: A pure function `(state, action) => newState` computing the next state based on the dispatched action.

### 6. Dispatch (`useDispatch()`)
The React-Redux hook used by components to trigger actions and async thunks:
```javascript
const dispatch = useDispatch();
dispatch(createPostThunk({ content: "Hello", platformIds: ["twitter"] }));
```

### 7. Selectors & Memoization (`useSelector()`, `createSelector()`)
Functions that extract and derive slices of state. `createSelector` memoizes derived computations so they are only recalculated when input parameters change:
```javascript
export const selectPublishedPosts = createSelector(
  [selectAllPosts],
  (posts) => posts.filter(post => post.status === 'published')
);
```

### 8. Normalized State Architecture (`createEntityAdapter`)
Storing relational data without nested duplication. Entities are indexed by ID in a lookup table:
```javascript
// BAD (Nested / Duplicate data):
posts: [{ id: 1, platform: { id: "twitter", name: "Twitter/X", limit: 280 } }]

// GOOD (Normalized relational data):
posts: {
  ids: ["post-1"],
  entities: {
    "post-1": { id: "post-1", content: "...", platformIds: ["twitter"] }
  }
},
platforms: {
  ids: ["twitter"],
  entities: {
    "twitter": { id: "twitter", name: "Twitter/X", characterLimit: 280 }
  }
}
```

### 9. Async Thunks (`createAsyncThunk`)
Abstracts asynchronous requests by automatically dispatching three actions:
- `[thunk]/pending`: Sets loading state.
- `[thunk]/fulfilled`: Updates state with returned payload.
- `[thunk]/rejected`: Captures error messages.

---

## Architecture & Redux Data Flow

```text
┌────────────────────────────────────────────────────────┐
│                     React Component                     │
│  (PostForm / PostCard / DraftManager / Dashboard)       │
└────────────────────────────────────────────────────────┘
          │                                  ▲
  useDispatch()                        useSelector()
          ▼                                  │
┌────────────────────────┐         ┌────────────────────────┐
│     Async Thunk /      │         │     Redux Store        │
│     Action Creator     │         │  (Normalized State)    │
└────────────────────────┘         └────────────────────────┘
          │                                  ▲
       dispatches                            │
          ▼                                  │
┌────────────────────────────────────────────────────────┐
│                     Redux Reducer                       │
│    (postsSlice / platformsSlice / draftsSlice)         │
│          via createEntityAdapter CRUD methods           │
└────────────────────────────────────────────────────────┘
```

---

## Normalized State Schema

```json
{
  "posts": {
    "ids": ["post-1", "post-2"],
    "entities": {
      "post-1": {
        "id": "post-1",
        "content": "Mastering Redux Toolkit!",
        "platformIds": ["twitter", "linkedin"],
        "status": "published",
        "createdAt": "2026-09-28T00:00:00.000Z",
        "updatedAt": "2026-09-28T00:00:00.000Z"
      }
    },
    "status": "succeeded",
    "error": null,
    "operationLoading": false
  },
  "platforms": {
    "ids": ["twitter", "instagram", "facebook", "linkedin"],
    "entities": {
      "twitter": {
        "id": "twitter",
        "name": "Twitter/X",
        "brandColor": "#1DA1F2",
        "characterLimit": 280,
        "mediaSupported": true,
        "maxMedia": 4
      }
    },
    "status": "succeeded",
    "error": null
  },
  "drafts": {
    "ids": ["draft-1"],
    "entities": {
      "draft-1": {
        "id": "draft-1",
        "title": "Product Launch",
        "content": "Drafting launch copy...",
        "platformIds": ["twitter", "linkedin"],
        "createdAt": "2026-09-28T00:00:00.000Z",
        "updatedAt": "2026-09-28T00:00:00.000Z"
      }
    },
    "status": "succeeded",
    "error": null,
    "operationLoading": false
  }
}
```

---

## Project Structure

```text
experiment-2/
├── index.html                   # HTML entry point with fonts & metadata
├── package.json                 # Dependencies: @reduxjs/toolkit, react-redux
├── vite.config.js               # Vite build configuration
├── README.md                    # Detailed documentation and lab experiment report
└── src/
    ├── main.jsx                 # Mounts App wrapped with <Provider store={store}>
    ├── App.jsx                  # Main tabbed view orchestrator and initial thunk dispatcher
    ├── index.css                # CSS design system with dark mode & responsive layouts
    ├── app/
    │   └── store.js             # Centralized Redux store with configureStore()
    ├── features/
    │   ├── posts/
    │   │   └── postsSlice.js    # Normalized posts entity adapter & CRUD thunks
    │   ├── platforms/
    │   │   └── platformsSlice.js# Normalized platforms entity adapter & fetchPlatforms thunk
    │   └── drafts/
    │       └── draftsSlice.js   # Normalized drafts adapter & convertDraftToPost thunk
    ├── selectors/
    │   └── selectors.js         # Memoized cross-slice selectors & dashboard metrics
    ├── services/
    │   └── mockApi.js           # Async API simulation using Promises & setTimeout
    └── components/
        ├── Navbar.jsx           # Global navbar reading live entity counts via useSelector
        ├── Dashboard.jsx        # Derived statistics & platform distribution breakdown
        ├── PostManager.jsx      # Coordinates PostForm and PostList
        ├── PostForm.jsx         # Controlled form dispatching create/update thunks
        ├── PostList.jsx         # Search and status filtering across Redux posts
        ├── PostCard.jsx         # Post card resolving normalized platform entities
        ├── DraftManager.jsx     # Drafts vault with "Convert to Post" cross-slice workflow
        ├── PlatformList.jsx     # Lists platform constraints directly from Redux store
        ├── PlatformCard.jsx     # Individual platform spec card
        ├── LoadingState.jsx     # Spinner and error recovery components
        └── Icons.jsx            # SVG icon library
```

---

## CRUD Operations Implemented

| Entity | Operation | Action / Thunk | Description |
| :--- | :--- | :--- | :--- |
| **Posts** | **CREATE** | `dispatch(createPostThunk(postData))` | Adds new post to store via adapter `addOne` |
| **Posts** | **READ** | `useSelector(selectAllPosts)` | Reads posts array from normalized lookup table |
| **Posts** | **UPDATE** | `dispatch(updatePostThunk({ id, updates }))` | Updates post via adapter `updateOne` |
| **Posts** | **DELETE** | `dispatch(deletePostThunk(id))` | Removes post via adapter `removeOne` |
| **Posts** | **STATUS** | `dispatch(updatePostStatus({ id, status }))` | Toggles status between published, draft, scheduled |
| **Drafts** | **CREATE** | `dispatch(createDraftThunk(draftData))` | Adds draft to store via adapter `addOne` |
| **Drafts** | **READ** | `useSelector(selectAllDrafts)` | Reads drafts array from normalized lookup table |
| **Drafts** | **UPDATE** | `dispatch(updateDraftThunk({ id, updates }))` | Updates draft via adapter `updateOne` |
| **Drafts** | **DELETE** | `dispatch(deleteDraftThunk(id))` | Removes draft via adapter `removeOne` |
| **Drafts** | **CONVERT** | `dispatch(convertDraftToPostThunk(draftId))` | Publishes draft as post and deletes draft |
| **Platforms** | **READ** | `useSelector(selectAllPlatforms)` | Reads platforms without local hardcoding |

---

## Installation & How to Run

### Step 1: Navigate to the `experiment-2` directory
```bash
cd experiment-2
```

### Step 2: Install dependencies
```bash
npm install
```

### Step 3: Run the development server
```bash
npm run dev
```

Open `http://localhost:5173` in your browser.

### Step 4: Build for Production
```bash
npm run build
```

---

## Expected Outcome
1. **Centralized Store**: All posts, platforms, and drafts are stored in Redux; components access data via `useSelector` and dispatch actions with `useDispatch`.
2. **Normalized Data**: Posts and drafts reference platforms by ID (`platformIds: ['twitter', 'linkedin']`), with full platform entities joined on-the-fly via memoized selectors.
3. **Automatic UI Reactivity**: Adding, updating, or deleting a post instantly updates the navbar counter, dashboard metrics, and platform distribution charts without manual state synchronizations.
4. **Async Lifecycle Feedback**: Operations display loading spinners during simulated network latency and handle failures with retry mechanisms.

---

## Performance Optimization Using Memoized Selectors

### Aim
To optimize state access and improve application performance using memoized selectors (`createSelector` / Reselect) and efficient rendering strategies (`React.memo`, `useMemo`, `useCallback`).

### Objectives
1. Understand the concept of **derived state** and why derived values should never be duplicated as separate Redux state slices.
2. Implement memoized selectors using `createSelector` from `@reduxjs/toolkit` (Reselect).
3. Reduce unnecessary component re-renders using granular `useSelector` subscriptions and `React.memo`.
4. Demonstrate high performance in large-scale applications with large in-memory datasets (500+ items).
5. Use efficient Redux state access patterns, avoiding monolithic store selections (`state => state`).
6. Measure and demonstrate the difference between basic selectors and memoized selectors with real recomputation telemetry.

### The Redux Performance Data Flow
```text
┌────────────────────────────────────────────────────────┐
│                      Redux Store                       │
│             (Normalized Entity Lookup Tables)          │
└────────────────────────────────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│                    Input Selectors                     │
│      (selectAllPosts, selectAllPlatforms, etc.)        │
└────────────────────────────────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│             createSelector (Reselect Cache)            │
│  - Checks referential equality of input arguments      │
│  - Returns cached reference if inputs unchanged [O(1)] │
│  - Executes result function only on input mutations    │
└────────────────────────────────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│                     Derived State                      │
│ (Filtered Posts, Platform Grouping, Post Analytics)   │
└────────────────────────────────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│                    React Component                     │
│      (MemoizedPostCard, SelectorStats, Dashboard)      │
└────────────────────────────────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│                  Optimized Rendering                   │
│   (React.memo skips render if props shallowly equal)   │
└────────────────────────────────────────────────────────┘
```

### Derived State
**Derived state** is any data that can be calculated from existing raw state.
Examples include:
- `totalPosts = posts.length`
- `publishedPosts = posts.filter(p => p.status === 'published')`
- `averageCharacterCount = Math.round(totalCharacters / posts.length)`
- `validPosts = posts.filter(p => p.content.length <= platformLimit)`

#### Why Derived State Should NOT be Duplicated in Redux:
1. **Synchronization Hazards**: If you store `postCount` or `filteredPosts` as separate slice fields, every add, edit, or delete action must remember to manually update them. Missing a single dispatch causes state divergence.
2. **State Bloat**: Caching duplicate arrays (like full copies of filtered posts) balloons memory usage unnecessarily.
3. **Complex Reducers**: Reducers become bloated with repetitive arithmetic and filter logic.
4. **Reselect Advantage**: Memoized selectors calculate derived data on-the-fly and cache the result. When raw state doesn't change, the derivation costs virtually zero execution time!

### Memoization
Memoization is an optimization technique where a function caches the result of an expensive calculation based on its inputs. If the function is called again with the identical inputs, it bypasses the calculation and returns the cached result immediately.

### createSelector & Reselect
`createSelector` (provided by `@reduxjs/toolkit` and built upon **Reselect**) generates memoized selector functions:
- It accepts one or more **input selectors** and a **result computation function**.
- It uses shallow reference equality (`===`) to determine whether input selectors returned new values.
- If and only if an input selector returns a new reference, the result function executes and the internal recomputation counter increments.
- Otherwise, it immediately returns the memoized output reference.

Example implemented in `src/selectors/postSelectors.js`:
```javascript
export const selectPublishedPosts = createSelector(
  [selectAllPosts],
  (posts) => posts.filter((p) => p.status === 'published')
);
```

### Advanced Multi-Input Selectors
In `src/selectors/postSelectors.js`, `selectPostsAndPlatforms` combines posts with platforms to evaluate platform-specific character limits without saving any validation flags in the database:
```javascript
export const selectPostsAndPlatforms = createSelector(
  [selectAllPosts, selectPlatformMap],
  (posts, platformMap) => {
    return posts.map((post) => {
      const platforms = (post.platformIds || []).map((id) => platformMap.get(id)).filter(Boolean);
      const charCount = post.content ? post.content.length : 0;
      const isValid = platforms.length > 0 && platforms.every((p) => charCount <= p.characterLimit);
      return { ...post, charCount, platforms, isValid };
    });
  }
);
```

### React.memo
`React.memo` is a higher-order component that memoizes functional components:
- If a parent component re-renders (for example, due to unrelated search input typing or theme toggles), child components wrapped in `React.memo` will **not** re-render if their props remain shallowly equal (`prevProps === nextProps`).
- In this project, `MemoizedPostCard` is wrapped with `React.memo`, preventing unchanged post cards from re-rendering when sibling items update or unrelated UI state toggles.

### useMemo
`useMemo` is used for expensive calculations that are strictly local to a component:
- In `PerformanceDashboard.jsx`, `useMemo` is utilized to compute the paginated view window (`paginatedPosts = filteredPosts.slice(start, start + pageSize)`) based on `currentPage`.
- It avoids unnecessary array slicing on re-renders when neither the page nor the filtered list changed.

### useCallback
When passing callback functions to child components wrapped in `React.memo`, normal inline functions create new memory references on every render, which inadvertently breaks `React.memo`.
- `useCallback` caches the function reference:
```javascript
const handleStatusChange = useCallback((id, status) => {
  dispatch(updatePostStatus({ id, status }));
}, [dispatch]);
```
This ensures the props passed to `MemoizedPostCard` maintain referential equality across parent renders.

### Efficient useSelector Patterns
**Avoid this anti-pattern:**
```javascript
// BAD: Subscribes to the entire Redux store!
const state = useSelector((state) => state);
```
Subscribing to the root state causes the component to re-render whenever ANY slice of state in the entire application changes.

**Adopt specific, targeted selectors:**
```javascript
// GOOD: Subscribes ONLY to normalized posts array
const posts = useSelector(selectAllPosts);

// GOOD: Subscribes ONLY to derived analytics
const analytics = useSelector(selectPostAnalytics);
```

### Avoiding Unnecessary Re-renders
Across the codebase, re-renders are minimized through:
1. **Targeted Subscriptions**: Selecting narrow entity slices.
2. **Stable Selector Outputs**: Memoized selectors returning identical array references unless the underlying data mutates.
3. **Presentational Component Memoization**: Wrapping card components in `React.memo`.
4. **Stable Handlers**: Preserving event handler references with `useCallback`.

### Selector Recomputation Telemetry
The application includes live recomputation telemetry (`SelectorStats.jsx`):
- Tracks actual invocations of each selector's result function.
- An interactive **"Toggle Unrelated UI State"** button proves memoization in action:
  - Clicking the button triggers a component re-render (monitored by `RenderMonitor`).
  - The selector recomputation counters **remain completely frozen**, proving that the memoized cache intercepted the request and returned the cached result in $O(1)$ time.

### Large Dataset Optimization (500+ Items Benchmark)
To demonstrate performance under real-world conditions:
- **"Generate 500 Sample Posts"** dispatches batch entities via `postsAdapter.addMany` into normalized state in milliseconds without blocking the browser.
- **Client-Side Pagination**: Windowed rendering (12 items per page) avoids flooding the browser DOM with 500+ heavy elements simultaneously.
- **Instant Search & Sort**: Memoized filtering over 500 items operates smoothly with zero UI lag.
- **"Clear Sample Data"**: Safely strips out sample records while preserving custom user posts.

### Performance Verification Summary
- **No Console Errors**: Clean browser execution verified via automated browser subagents.
- **Full Backward Compatibility**: All base Experiment 2 features (Posts CRUD, Drafts CRUD, Platforms, Thunks, Mock API) remain 100% operational.

