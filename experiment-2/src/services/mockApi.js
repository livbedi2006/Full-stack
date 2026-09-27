/**
 * Mock API Service (Experiment 2: Redux Toolkit Architecture)
 * 
 * Simulates asynchronous REST endpoints using native Promises and setTimeout.
 * Demonstrates async data flows for createAsyncThunk without requiring a real backend.
 */

const LATENCY = 350;

const delay = (ms = LATENCY) => new Promise(resolve => setTimeout(resolve, ms));

// Initial seed data demonstrating normalized references
const INITIAL_PLATFORMS = [
  {
    id: 'twitter',
    name: 'Twitter/X',
    brandColor: '#1DA1F2',
    characterLimit: 280,
    mediaSupported: true,
    maxMedia: 4,
    status: 'active',
    tagline: 'Fast updates & real-time trends'
  },
  {
    id: 'instagram',
    name: 'Instagram',
    brandColor: '#E1306C',
    characterLimit: 2200,
    mediaSupported: true,
    maxMedia: 10,
    status: 'active',
    tagline: 'Visual stories & reels'
  },
  {
    id: 'facebook',
    name: 'Facebook',
    brandColor: '#1877F2',
    characterLimit: 63206,
    mediaSupported: true,
    maxMedia: 10,
    status: 'active',
    tagline: 'Communities & long-form posts'
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    brandColor: '#0A66C2',
    characterLimit: 3000,
    mediaSupported: true,
    maxMedia: 9,
    status: 'active',
    tagline: 'Professional network & insights'
  }
];

const INITIAL_POSTS = [
  {
    id: 'post-1',
    content: 'Mastering Redux Toolkit: Clean entity adapters, memoized selectors, and scalable global state management! 🚀 #ReactJS #ReduxToolkit #WebDev',
    platformIds: ['twitter', 'linkedin'],
    status: 'published',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString()
  },
  {
    id: 'post-2',
    content: 'Design systems bridge the gap between engineering and user experience. Typography, consistent spacing, and subtle micro-animations matter. #UIUX #DesignSystem',
    platformIds: ['instagram', 'facebook'],
    status: 'published',
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 12).toISOString()
  },
  {
    id: 'post-3',
    content: 'Drafting our upcoming full-stack workshop roadmap. Topics will include React 19, REST & GraphQL APIs, and normalized data caching.',
    platformIds: ['linkedin'],
    status: 'draft',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 1).toISOString()
  }
];

const INITIAL_DRAFTS = [
  {
    id: 'draft-1',
    title: 'Product Launch Teaser',
    content: 'Sneak peek into our next-gen developer productivity suite. Faster builds, zero config, intelligent diagnostics. Stay tuned! #SoftwareEngineering #DevTools',
    platformIds: ['twitter', 'linkedin'],
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 4).toISOString()
  },
  {
    id: 'draft-2',
    title: 'Weekly Tech Digest #42',
    content: 'Highlighting top engineering breakthroughs this week: state normalization patterns, WebAssembly runtimes, and accessible component architectures.',
    platformIds: ['twitter', 'facebook', 'linkedin'],
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 6).toISOString()
  }
];

// LocalStorage helpers for persistence
const STORAGE_PREFIX = 'redux_exp2_';

function getStored(key, fallback) {
  try {
    const data = localStorage.getItem(STORAGE_PREFIX + key);
    return data ? JSON.parse(data) : fallback;
  } catch {
    return fallback;
  }
}

function setStored(key, data) {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(data));
  } catch (err) {
    console.error('LocalStorage write error:', err);
  }
}

// In-memory / persistent mock database
let dbPlatforms = getStored('platforms', INITIAL_PLATFORMS);
let dbPosts = getStored('posts', INITIAL_POSTS);
let dbDrafts = getStored('drafts', INITIAL_DRAFTS);

export const mockApi = {
  // Platform Endpoints
  async getPlatforms() {
    await delay(250);
    return [...dbPlatforms];
  },

  // Post Endpoints
  async getPosts() {
    await delay(350);
    return [...dbPosts];
  },

  async createPost(postData) {
    await delay(400);
    if (!postData.content?.trim()) {
      throw new Error('Post content cannot be empty.');
    }
    if (!postData.platformIds || postData.platformIds.length === 0) {
      throw new Error('Please select at least one target platform.');
    }

    const now = new Date().toISOString();
    const newPost = {
      id: postData.id || `post-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      content: postData.content.trim(),
      platformIds: [...postData.platformIds],
      status: postData.status || 'published',
      createdAt: postData.createdAt || now,
      updatedAt: now
    };

    dbPosts = [newPost, ...dbPosts];
    setStored('posts', dbPosts);
    return newPost;
  },

  async updatePost(id, updates) {
    await delay(350);
    const index = dbPosts.findIndex(p => p.id === id);
    if (index === -1) {
      throw new Error(`Post with id "${id}" not found.`);
    }

    const updated = {
      ...dbPosts[index],
      ...updates,
      id: dbPosts[index].id,
      createdAt: dbPosts[index].createdAt,
      updatedAt: new Date().toISOString()
    };

    dbPosts[index] = updated;
    setStored('posts', dbPosts);
    return updated;
  },

  async deletePost(id) {
    await delay(300);
    const index = dbPosts.findIndex(p => p.id === id);
    if (index === -1) {
      throw new Error(`Post with id "${id}" not found.`);
    }
    dbPosts = dbPosts.filter(p => p.id !== id);
    setStored('posts', dbPosts);
    return id;
  },

  // Draft Endpoints
  async getDrafts() {
    await delay(300);
    return [...dbDrafts];
  },

  async createDraft(draftData) {
    await delay(350);
    if (!draftData.content?.trim()) {
      throw new Error('Draft content cannot be empty.');
    }

    const now = new Date().toISOString();
    const newDraft = {
      id: draftData.id || `draft-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      title: draftData.title || (draftData.content.slice(0, 30) + '...'),
      content: draftData.content.trim(),
      platformIds: Array.isArray(draftData.platformIds) ? draftData.platformIds : [],
      createdAt: draftData.createdAt || now,
      updatedAt: now
    };

    dbDrafts = [newDraft, ...dbDrafts];
    setStored('drafts', dbDrafts);
    return newDraft;
  },

  async updateDraft(id, updates) {
    await delay(300);
    const index = dbDrafts.findIndex(d => d.id === id);
    if (index === -1) {
      throw new Error(`Draft with id "${id}" not found.`);
    }

    const updated = {
      ...dbDrafts[index],
      ...updates,
      id: dbDrafts[index].id,
      createdAt: dbDrafts[index].createdAt,
      updatedAt: new Date().toISOString()
    };

    dbDrafts[index] = updated;
    setStored('drafts', dbDrafts);
    return updated;
  },

  async deleteDraft(id) {
    await delay(300);
    dbDrafts = dbDrafts.filter(d => d.id !== id);
    setStored('drafts', dbDrafts);
    return id;
  }
};
