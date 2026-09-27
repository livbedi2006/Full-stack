import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  selectAllPlatforms,
  selectPlatformsStatus,
  selectPlatformsError,
  fetchPlatforms
} from '../features/platforms/platformsSlice';
import PlatformCard from './PlatformCard';
import { LoadingState, ErrorState } from './LoadingState';

/**
 * PlatformList Component (Experiment 2)
 * 
 * Demonstrates:
 * - useSelector(selectAllPlatforms): Directly consumes platform metadata from Redux.
 * - Zero duplicated platform definitions in local component state!
 */
export default function PlatformList() {
  const dispatch = useDispatch();
  const platforms = useSelector(selectAllPlatforms);
  const status = useSelector(selectPlatformsStatus);
  const error = useSelector(selectPlatformsError);

  if (status === 'loading') {
    return <LoadingState message="Fetching normalized platforms from Redux..." />;
  }

  if (status === 'failed') {
    return (
      <ErrorState
        message={`Failed to load platforms: ${error}`}
        onRetry={() => dispatch(fetchPlatforms())}
      />
    );
  }

  return (
    <div className="platforms-section-layout">
      <div className="platforms-header-block">
        <h2 className="section-title">Connected Social Platforms</h2>
        <p className="section-subtitle">
          All platform specifications and constraint rules are stored centrally in the Redux <code>platforms</code> slice.
        </p>
      </div>

      <div className="platforms-cards-grid">
        {platforms.map((platform) => (
          <PlatformCard key={platform.id} platform={platform} />
        ))}
      </div>
    </div>
  );
}
