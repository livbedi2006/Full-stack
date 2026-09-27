/**
 * Mock Asynchronous Draft API
 * 
 * Simulates real-world backend API communication with latency,
 * response packaging, and failure boundary testing via Promises and setTimeout.
 */

import {
  getStoredDrafts,
  createStoredDraft,
  updateStoredDraft,
  deleteStoredDraft,
  getStoredDraftById
} from './draftStorage';

// Configurable network latency simulation (ms)
const DEFAULT_DELAY_MS = 380;

/**
 * Helper to simulate network latency
 * @param {number} ms 
 * @returns {Promise<void>}
 */
const delay = (ms = DEFAULT_DELAY_MS) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Fetch all drafts from simulated server
 * @returns {Promise<{ success: boolean, data: Array, timestamp: string }>}
 */
export async function mockGetDrafts() {
  await delay(300);
  const drafts = getStoredDrafts();
  return {
    success: true,
    data: drafts,
    timestamp: new Date().toISOString()
  };
}

/**
 * Fetch a single draft by ID
 * @param {string} id 
 * @returns {Promise<{ success: boolean, data: Object }>}
 */
export async function mockGetDraftById(id) {
  await delay(200);
  const draft = getStoredDraftById(id);
  if (!draft) {
    throw new Error(`Draft with ID "${id}" was not found.`);
  }
  return {
    success: true,
    data: draft
  };
}

/**
 * Create a new draft on simulated backend
 * @param {Object} draftData 
 * @returns {Promise<{ success: boolean, data: Object, message: string }>}
 */
export async function mockCreateDraft(draftData) {
  await delay(450);

  // Validate required content
  if (!draftData || (!draftData.content?.trim() && (!draftData.media || draftData.media.length === 0))) {
    throw new Error('Draft must contain text content or media attachments.');
  }

  const newDraft = createStoredDraft(draftData);
  return {
    success: true,
    data: newDraft,
    message: 'Draft saved successfully.'
  };
}

/**
 * Update an existing draft on simulated backend
 * @param {string} id 
 * @param {Object} updates 
 * @returns {Promise<{ success: boolean, data: Object, message: string }>}
 */
export async function mockUpdateDraft(id, updates) {
  await delay(400);

  if (!id) {
    throw new Error('Draft ID is required for update.');
  }

  const updatedDraft = updateStoredDraft(id, updates);
  if (!updatedDraft) {
    throw new Error(`Draft with ID "${id}" was not found.`);
  }

  return {
    success: true,
    data: updatedDraft,
    message: 'Draft updated successfully.'
  };
}

/**
 * Delete a draft on simulated backend
 * @param {string} id 
 * @returns {Promise<{ success: boolean, id: string, message: string }>}
 */
export async function mockDeleteDraft(id) {
  await delay(350);

  if (!id) {
    throw new Error('Draft ID is required for deletion.');
  }

  const success = deleteStoredDraft(id);
  if (!success) {
    throw new Error(`Draft with ID "${id}" could not be deleted or does not exist.`);
  }

  return {
    success: true,
    id,
    message: 'Draft deleted successfully.'
  };
}
