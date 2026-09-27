import React from 'react';
import { SpinnerIcon, RefreshCwIcon } from './Icons';

/**
 * LoadingState & ErrorState Components
 */
export function LoadingState({ message = 'Loading data from Redux store...' }) {
  return (
    <div className="state-container loading-container" role="status" aria-live="polite">
      <SpinnerIcon size={32} color="#3b82f6" />
      <p className="state-message">{message}</p>
    </div>
  );
}

export function ErrorState({ message = 'An error occurred while loading state.', onRetry }) {
  return (
    <div className="state-container error-container" role="alert">
      <div className="error-icon-circle">✕</div>
      <p className="state-message error-message-text">{message}</p>
      {onRetry && (
        <button type="button" className="btn btn-secondary btn-sm" onClick={onRetry}>
          <RefreshCwIcon size={14} />
          <span>Retry Operation</span>
        </button>
      )}
    </div>
  );
}
