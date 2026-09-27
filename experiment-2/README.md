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
