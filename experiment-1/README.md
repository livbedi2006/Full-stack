# Full-Stack Web Development Experiments

This repository contains full-stack laboratory experiments built with React.js, modern web standards, and decoupled frontend architecture.

---

# Experiment 1.1.1: Dynamic Post Composer Interface Supporting Multiple Platforms with Constraint Validation

## Aim
To design and develop a dynamic post composer interface supporting multiple platforms with real-time constraint validation using React.js and modern web standards.

## Objectives
1. **Multi-Platform Content Handling**: Manage unified social media content targeting diverse platforms with distinct formatting rules, media capabilities, and size limits.
2. **Real-Time Validation Engine**: Implement client-side validation mechanisms that evaluate content concurrently against individual and composite platform constraints as the user types or attaches media.
3. **Responsive and Accessible UI**: Construct a modular, accessible, and user-friendly interface that communicates constraint states through unambiguous visual indicators (colors, icons, progress bars, and descriptive text).

## Technology Stack
- **Library/Framework**: React.js 19 (Functional Components & React Hooks)
- **Language**: JavaScript (ES6+ / Modern JS)
- **Markup & Styling**: HTML5, Semantic Elements, Vanilla CSS with CSS Custom Properties (CSS variables)
- **Build Tooling**: Vite 8.3
- **Runtime Environment**: Node.js (v18+) and npm (v9+)
- **Architecture**: Decoupled, data-driven constraint architecture (frontend-only, zero external UI libraries)

## Platform Constraints & Configuration Schema

All platform constraints are maintained in a centralized, extensible data structure inside [`src/data/platforms.js`](src/data/platforms.js).

| Platform | Character Limit | Media Supported | Max Media | Media Required | Hashtag Constraint Rules |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **Twitter / X** | `280` | Yes | 4 files | No | 1–3 recommended; warning if excessive |
| **Instagram** | `2,200` | Yes | 10 files | **Yes** (visual platform) | Hard limit: 30 tags; 5–15 recommended |
| **Facebook** | `63,206` | Yes | 10 files | No | Moderate usage (2–5 tags recommended) |
| **LinkedIn** | `3,000` | Yes | 9 files | No | Hard limit: 10 tags; 3–5 recommended |

## Validation Logic & Workflow
1. **Character Validation**: Computes `charCount` and `remaining`. Displays warning threshold when $\le 20$ chars remain or $\ge 85\%$ of the limit is consumed. Exceeding triggers an error.
2. **Strictest Limit Calculation**: Identifies the strictest boundary across all selected destinations to govern primary progress displays.
3. **Multi-Platform Simultaneous Evaluation**: If one platform fails (e.g. Twitter exceeds 280), it flags an error while other platforms stay valid, and overall publishing is disabled.
4. **Media Constraints**: Validates max files, MIME types, file sizes, and mandates media on visual networks (Instagram).
5. **Hashtags**: Detects hashtags via Unicode regex and checks hard limits and recommended quotas.

---

# Experiment 1.1.2: Draft Management System

## Aim
To implement a draft management system that allows users to save, retrieve, edit, and delete post drafts within the frontend, with local persistence, memoized derived state, and mock asynchronous backend workflows.

## Objectives
1. **Frontend State Management**: Manage draft lifecycles using React's `useReducer` and custom hooks for predictable state transitions.
2. **Full CRUD Operations**: Implement Create, Read, Update, and Delete actions with seamless synchronization between memory and persistent storage.
3. **Asynchronous UI Workflows**: Simulate network latency, request lifecycles, loading indicators, and error boundaries using Promises.
4. **Performance Optimization with Memoized Selectors**: Compute derived metrics, multi-criteria filtering, and searches efficiently with `useMemo` to eliminate unnecessary re-renders.
5. **Seamless Exp 1.1.1 Integration**: Enable bidirectional editing where saved drafts load directly into the Post Composer for editing and update without data duplication.

## Technology Stack
- **React.js 19**: `useState`, `useReducer`, `useMemo`, `useCallback`, `useEffect`, `useRef`, `lazy`, `Suspense`
- **Storage**: Browser `localStorage` with error handling, schema validation, and recovery
- **Asynchronous Architecture**: Promise-based simulated API latency (`setTimeout`)
- **Code Splitting**: Dynamic lazy-loading of the Draft Management module

## Key Features & CRUD Operations

### 1. CREATE (Save Draft)
- User writes content in Post Composer and clicks **"Save Draft"**.
- Validates that text content or media attachments exist.
- Generates a unique draft identifier (`id`), captures creation timestamp (`createdAt`), last modified timestamp (`updatedAt`), and preserves platform selections.
- Triggers simulated async network delay with button spinner (`"Saving Draft..."`), displays success toast, and increments vault badge.

### 2. READ (Drafts Vault & Inspection)
- Retrieves stored drafts on initial app boot via `getStoredDrafts()`.
- Responsive card grid displaying title, excerpt, platform badges, character counts, and timestamps.
- **View Modal**: Clicking **"View"** opens an accessible modal dialog showing full post content, tags, platform limits, and media attachments.

### 3. UPDATE (Edit Draft)
- Clicking **"Edit"** on a draft loads its content, platforms, and media into the existing Post Composer.
- Renders an **"Editing Saved Draft"** ribbon with draft title and a **"Cancel Edit"** action.
- Action button dynamically converts to **"Update Draft"**.
- Updates the existing draft in `localStorage` and reducer state while preserving its original `createdAt` timestamp.

### 4. DELETE (Safe Draft Removal)
- Clicking **"Delete"** prompts an inline two-step confirmation (`"Permanently delete this draft?"`).
- Confirming triggers simulated async deletion (`"Deleting..."`), removes item from `localStorage` and state, and updates analytics.

## Performance Optimization & Memoized Selectors

Pure selector functions in [`src/selectors/draftSelectors.js`](src/selectors/draftSelectors.js) compute derived state memoized with `useMemo`:

- `selectFilteredDrafts(drafts, searchTerm, platformFilter, sortBy)`:
  - **Search Query**: Real-time content, title, and tag matching.
  - **Platform Filter**: Filters by All, Twitter/X, Instagram, Facebook, or LinkedIn.
  - **Sorting**: Newest first, oldest first, longest draft, or shortest draft.
- `selectDraftStatistics(drafts)`:
  - Aggregates total drafts, average character count, max character count, attached media files, distribution counts across all 4 platforms, and drafts updated in the last 24 hours.

## Asynchronous Architecture & Mock API Simulation

[`src/utils/mockDraftApi.js`](src/utils/mockDraftApi.js) provides Promise-wrapped simulated endpoints:
- `mockGetDrafts()`: Simulates `GET /api/drafts` (~300ms latency)
- `mockCreateDraft(data)`: Simulates `POST /api/drafts` (~450ms latency)
- `mockUpdateDraft(id, updates)`: Simulates `PUT /api/drafts/:id` (~400ms latency)
- `mockDeleteDraft(id)`: Simulates `DELETE /api/drafts/:id` (~350ms latency)

---

## Project Structure

```text
experiment-1/
├── index.html                   # HTML entry point with Google Fonts & SEO metadata
├── package.json                 # Project configuration, scripts, and dependencies
├── vite.config.js               # Vite build configuration
├── README.md                    # Comprehensive documentation and experiment report
└── src/
    ├── main.jsx                 # React root mounting script
    ├── App.jsx                  # Main application orchestrator & lazy loader
    ├── index.css                # Central design system, tokens, and responsive styles
    ├── components/
    │   ├── Header.jsx           # Unified header, module nav tabs & test presets
    │   ├── PostComposer.jsx     # Main composer layout coordinating inputs & feedback
    │   ├── PlatformSelector.jsx # Multi-select platform cards with real-time badges
    │   ├── CharacterCounter.jsx # Dynamic progress bar, breakdown pills & strictest limits
    │   ├── MediaUploader.jsx    # Drag-and-drop file uploader & media thumbnail previews
    │   ├── ValidationCard.jsx   # Individual platform constraint cards with metric grids
    │   ├── StatusMessage.jsx    # Global validation alerts and publish confirmation banner
    │   ├── Icons.jsx            # SVG icon library for platforms & UI controls
    │   └── DraftManager/        # Experiment 1.1.2: Draft Management Module (Lazy Loaded)
    │       ├── DraftManager.jsx # Coordinator for analytics, filters, list, and preview
    │       ├── DraftList.jsx    # Responsive grid of draft cards with loading states
    │       ├── DraftCard.jsx    # Individual draft card with CRUD action controls
    │       ├── DraftFilters.jsx # Search bar, platform tabs, and sort selectors
    │       ├── DraftAnalytics.jsx # Derived statistical cards and platform distribution
    │       └── DraftPreviewModal.jsx # Full-content modal inspector and composer loader
    ├── hooks/
    │   └── useDrafts.js         # useReducer hook managing async draft lifecycles
    ├── selectors/
    │   └── draftSelectors.js    # Pure selectors for memoized searching and analytics
    ├── data/
    │   └── platforms.js         # Extensible platform configuration & constraint rules
    └── utils/
        ├── validation.js        # Multi-platform constraint validation engine
        ├── draftStorage.js      # Resilient localStorage CRUD persistence layer
        └── mockDraftApi.js      # Mock async backend API with simulated network latency
```

---

## Installation & How to Run

### Step 1: Navigate to the project directory
```bash
cd experiment-1
```

### Step 2: Install dependencies
```bash
npm install
```

### Step 3: Start the local development server
```bash
npm run dev
```

Open `http://localhost:5173` in your browser.

### Step 4: Build for Production
```bash
npm run build
```

---

## Expected Outcomes
- **Experiment 1.1.1**: Composing social content with instant constraint feedback across Twitter/X, Instagram, Facebook, and LinkedIn.
- **Experiment 1.1.2**: Saving drafts to local storage, inspecting them in a dedicated Drafts Vault, filtering/searching with instant memoized responses, loading them back into the Post Composer for editing, and deleting with safety confirmations.
