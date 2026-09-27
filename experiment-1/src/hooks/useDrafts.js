import { useReducer, useEffect, useCallback } from 'react';
import {
  mockGetDrafts,
  mockCreateDraft,
  mockUpdateDraft,
  mockDeleteDraft
} from '../utils/mockDraftApi';

/**
 * Reducer actions enum
 */
const ACTIONS = {
  FETCH_INIT: 'FETCH_INIT',
  FETCH_SUCCESS: 'FETCH_SUCCESS',
  FETCH_FAILURE: 'FETCH_FAILURE',
  SAVE_INIT: 'SAVE_INIT',
  ADD_DRAFT_SUCCESS: 'ADD_DRAFT_SUCCESS',
  UPDATE_DRAFT_SUCCESS: 'UPDATE_DRAFT_SUCCESS',
  SAVE_FAILURE: 'SAVE_FAILURE',
  DELETE_INIT: 'DELETE_INIT',
  DELETE_DRAFT_SUCCESS: 'DELETE_DRAFT_SUCCESS',
  DELETE_FAILURE: 'DELETE_FAILURE',
  CLEAR_MESSAGES: 'CLEAR_MESSAGES'
};

const initialState = {
  drafts: [],
  isLoading: true,
  isSaving: false,
  isDeleting: false,
  error: null,
  successMessage: null
};

function draftsReducer(state, action) {
  switch (action.type) {
    case ACTIONS.FETCH_INIT:
      return {
        ...state,
        isLoading: true,
        error: null
      };

    case ACTIONS.FETCH_SUCCESS:
      return {
        ...state,
        isLoading: false,
        drafts: action.payload,
        error: null
      };

    case ACTIONS.FETCH_FAILURE:
      return {
        ...state,
        isLoading: false,
        error: action.payload
      };

    case ACTIONS.SAVE_INIT:
      return {
        ...state,
        isSaving: true,
        error: null,
        successMessage: null
      };

    case ACTIONS.ADD_DRAFT_SUCCESS:
      return {
        ...state,
        isSaving: false,
        drafts: [action.payload, ...state.drafts],
        successMessage: action.message || 'Draft saved successfully.',
        error: null
      };

    case ACTIONS.UPDATE_DRAFT_SUCCESS:
      return {
        ...state,
        isSaving: false,
        drafts: state.drafts.map(d =>
          d.id === action.payload.id ? action.payload : d
        ),
        successMessage: action.message || 'Draft updated successfully.',
        error: null
      };

    case ACTIONS.SAVE_FAILURE:
      return {
        ...state,
        isSaving: false,
        error: action.payload
      };

    case ACTIONS.DELETE_INIT:
      return {
        ...state,
        isDeleting: true,
        error: null,
        successMessage: null
      };

    case ACTIONS.DELETE_DRAFT_SUCCESS:
      return {
        ...state,
        isDeleting: false,
        drafts: state.drafts.filter(d => d.id !== action.id),
        successMessage: action.message || 'Draft deleted successfully.',
        error: null
      };

    case ACTIONS.DELETE_FAILURE:
      return {
        ...state,
        isDeleting: false,
        error: action.payload
      };

    case ACTIONS.CLEAR_MESSAGES:
      return {
        ...state,
        successMessage: null,
        error: null
      };

    default:
      return state;
  }
}

/**
 * Custom Hook: useDrafts
 * 
 * Orchestrates draft state via useReducer, performs asynchronous operations
 * with simulated network latency, and manages loading/error feedback.
 */
export function useDrafts() {
  const [state, dispatch] = useReducer(draftsReducer, initialState);

  // Initial load on mount
  useEffect(() => {
    let isMounted = true;

    async function load() {
      dispatch({ type: ACTIONS.FETCH_INIT });
      try {
        const response = await mockGetDrafts();
        if (isMounted) {
          dispatch({ type: ACTIONS.FETCH_SUCCESS, payload: response.data });
        }
      } catch (err) {
        if (isMounted) {
          dispatch({
            type: ACTIONS.FETCH_FAILURE,
            payload: err.message || 'Error loading drafts.'
          });
        }
      }
    }

    load();

    return () => {
      isMounted = false;
    };
  }, []);

  /**
   * Save a new draft or update an existing one
   */
  const saveDraft = useCallback(async (draftData, isUpdate = false) => {
    dispatch({ type: ACTIONS.SAVE_INIT });

    try {
      if (isUpdate && draftData.id) {
        const response = await mockUpdateDraft(draftData.id, draftData);
        dispatch({
          type: ACTIONS.UPDATE_DRAFT_SUCCESS,
          payload: response.data,
          message: response.message
        });
        return response.data;
      } else {
        const response = await mockCreateDraft(draftData);
        dispatch({
          type: ACTIONS.ADD_DRAFT_SUCCESS,
          payload: response.data,
          message: response.message
        });
        return response.data;
      }
    } catch (err) {
      dispatch({
        type: ACTIONS.SAVE_FAILURE,
        payload: err.message || 'Failed to save draft.'
      });
      throw err;
    }
  }, []);

  /**
   * Delete a draft by ID
   */
  const deleteDraft = useCallback(async (id) => {
    dispatch({ type: ACTIONS.DELETE_INIT });

    try {
      const response = await mockDeleteDraft(id);
      dispatch({
        type: ACTIONS.DELETE_DRAFT_SUCCESS,
        id,
        message: response.message
      });
      return true;
    } catch (err) {
      dispatch({
        type: ACTIONS.DELETE_FAILURE,
        payload: err.message || 'Failed to delete draft.'
      });
      throw err;
    }
  }, []);

  /**
   * Clear active notification messages
   */
  const clearMessages = useCallback(() => {
    dispatch({ type: ACTIONS.CLEAR_MESSAGES });
  }, []);

  /**
   * Find draft by ID
   */
  const getDraftById = useCallback((id) => {
    return state.drafts.find(d => d.id === id) || null;
  }, [state.drafts]);

  return {
    drafts: state.drafts,
    isLoading: state.isLoading,
    isSaving: state.isSaving,
    isDeleting: state.isDeleting,
    error: state.error,
    successMessage: state.successMessage,
    saveDraft,
    deleteDraft,
    clearMessages,
    getDraftById
  };
}
