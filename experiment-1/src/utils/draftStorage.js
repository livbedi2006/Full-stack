/**
 * LocalStorage Persistence Layer for Social Media Drafts
 * 
 * Provides safe, fault-tolerant persistence with schema validation,
 * corrupted data recovery, and serialization.
 */

const STORAGE_KEY = 'social_media_drafts';

/**
 * Initial sample drafts to showcase the interface on fresh start
 */
const SEED_DRAFTS = [
  {
    id: 'draft-seed-1',
    title: 'Product Launch Announcement',
    content: 'Excited to announce the public beta of our new developer tools platform! Built for speed, collaboration, and high productivity. Check out the link in bio. 🚀 #TechLaunch #DevCommunity #SoftwareEngineering',
    platforms: ['twitter', 'linkedin'],
    media: [
      {
        id: 'seed-media-1',
        name: 'architecture-preview.png',
        size: 1420500,
        type: 'image/png',
        isVideo: false
      }
    ],
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 4).toISOString()
  },
  {
    id: 'draft-seed-2',
    title: 'Weekend Design Insights',
    content: 'Great design is about eliminating the unnecessary so that the necessary may speak. Clean typography and whitespace never go out of style. #UIUX #DesignSystem #WebDesign',
    platforms: ['instagram', 'facebook'],
    media: [
      {
        id: 'seed-media-2',
        name: 'typography-guide.jpg',
        size: 890000,
        type: 'image/jpeg',
        isVideo: false
      }
    ],
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 1).toISOString()
  }
];

/**
 * Retrieves all stored drafts from localStorage safely.
 * Returns seed drafts if storage is empty on first load.
 * 
 * @returns {Array} List of draft objects
 */
export function getStoredDrafts() {
  try {
    const rawData = localStorage.getItem(STORAGE_KEY);
    if (!rawData) {
      // Seed initial data for first-time user exploration
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_DRAFTS));
      return SEED_DRAFTS;
    }

    const parsed = JSON.parse(rawData);
    if (!Array.isArray(parsed)) {
      console.warn('Drafts data in localStorage was not an array; resetting to default.');
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_DRAFTS));
      return SEED_DRAFTS;
    }

    return parsed;
  } catch (err) {
    console.error('Failed to read or parse drafts from localStorage:', err);
    return SEED_DRAFTS;
  }
}

/**
 * Saves entire list of drafts to localStorage.
 * 
 * @param {Array} drafts 
 * @returns {boolean} Success status
 */
export function setStoredDrafts(drafts) {
  try {
    if (!Array.isArray(drafts)) {
      throw new Error('Drafts payload must be an array.');
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(drafts));
    return true;
  } catch (err) {
    console.error('Failed to save drafts to localStorage:', err);
    return false;
  }
}

/**
 * Saves a single new draft to localStorage.
 * 
 * @param {Object} draftData 
 * @returns {Object} Newly created draft with id and timestamps
 */
export function createStoredDraft(draftData) {
  const drafts = getStoredDrafts();
  const now = new Date().toISOString();
  
  const newDraft = {
    id: draftData.id || `draft-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
    title: draftData.title || (draftData.content ? draftData.content.slice(0, 32).trim() + '...' : 'Untitled Draft'),
    content: draftData.content || '',
    platforms: Array.isArray(draftData.platforms) ? draftData.platforms : [],
    media: Array.isArray(draftData.media) ? draftData.media : [],
    createdAt: draftData.createdAt || now,
    updatedAt: now
  };

  drafts.unshift(newDraft);
  setStoredDrafts(drafts);
  return newDraft;
}

/**
 * Updates an existing draft in localStorage.
 * 
 * @param {string} id 
 * @param {Object} updates 
 * @returns {Object|null} Updated draft or null if not found
 */
export function updateStoredDraft(id, updates) {
  const drafts = getStoredDrafts();
  const index = drafts.findIndex(d => d.id === id);

  if (index === -1) {
    console.warn(`Draft with id ${id} not found.`);
    return null;
  }

  const existing = drafts[index];
  const updatedDraft = {
    ...existing,
    ...updates,
    id: existing.id,
    createdAt: existing.createdAt, // Preserve creation timestamp
    updatedAt: new Date().toISOString() // Refresh last modified
  };

  drafts[index] = updatedDraft;
  setStoredDrafts(drafts);
  return updatedDraft;
}

/**
 * Deletes a draft by id from localStorage.
 * 
 * @param {string} id 
 * @returns {boolean} True if deleted, false if not found
 */
export function deleteStoredDraft(id) {
  const drafts = getStoredDrafts();
  const filtered = drafts.filter(d => d.id !== id);

  if (filtered.length === drafts.length) {
    return false; // Nothing deleted
  }

  setStoredDrafts(filtered);
  return true;
}

/**
 * Retrieves a single draft by ID.
 * 
 * @param {string} id 
 * @returns {Object|null}
 */
export function getStoredDraftById(id) {
  const drafts = getStoredDrafts();
  return drafts.find(d => d.id === id) || null;
}
