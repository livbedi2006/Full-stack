/* eslint-disable */
import React, { useRef } from 'react';

/**
 * RenderMonitor Component (Experiment 2: Performance Module)
 * 
 * Demonstrates:
 * - Tracking component render cycles using `useRef`.
 * - `useRef` maintains a mutable value across renders without triggering a re-render itself.
 * - Used educationally to show how `React.memo` and memoized selectors prevent
 *   wasteful component re-renders.
 */
export default function RenderMonitor({ name = 'Component', compact = false }) {
  const renderCount = useRef(0);
  renderCount.current += 1;

  return (
    <span
      className={`render-monitor-badge ${compact ? 'compact' : ''}`}
      title={`${name} has rendered ${renderCount.current} time${renderCount.current === 1 ? '' : 's'}`}
    >
      <span className="render-pulse-dot" aria-hidden="true" />
      <span className="render-label">
        {compact ? 'Renders:' : `${name} Render Count:`}
      </span>
      <strong className="render-value">{renderCount.current}</strong>
    </span>
  );
}
