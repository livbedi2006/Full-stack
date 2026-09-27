import React from 'react';
import { useSelector } from 'react-redux';
import { selectPostCount } from '../features/posts/postsSlice';
import { selectDraftCount } from '../features/drafts/draftsSlice';
import { selectPlatformCount } from '../features/platforms/platformsSlice';
import { LayersIcon } from './Icons';

/**
 * Navbar Component (Experiment 2)
 * 
 * Demonstrates:
 * - Direct global state consumption via useSelector (No prop drilling!)
 * - Live entity counter badges derived instantly from normalized entity adapters
 */
export default function Navbar({ activeTab, onSelectTab }) {
  // Reading state directly from Redux Store without passing through props
  const postCount = useSelector(selectPostCount);
  const draftCount = useSelector(selectDraftCount);
  const platformCount = useSelector(selectPlatformCount);

  return (
    <header className="app-navbar">
      <div className="navbar-container">
        {/* Brand & Academic Experiment Meta */}
        <div className="navbar-brand-group">
          <div className="navbar-logo-badge">
            <LayersIcon size={20} color="#ffffff" />
          </div>
          <div>
            <div className="navbar-title-row">
              <h1 className="navbar-title">Redux Social Manager</h1>
              <span className="badge exp2-badge">EXPERIMENT 2</span>
            </div>
            <span className="navbar-subtext">
              Centralized State Management with Redux Toolkit & Entity Normalization
            </span>
          </div>
        </div>

        {/* Global Navigation Tabs with Direct Redux Counts */}
        <nav className="navbar-nav" role="tablist" aria-label="Main navigation">
          <button
            type="button"
            className={`nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => onSelectTab('dashboard')}
            role="tab"
            aria-selected={activeTab === 'dashboard'}
          >
            <span>Dashboard</span>
          </button>

          <button
            type="button"
            className={`nav-btn ${activeTab === 'posts' ? 'active' : ''}`}
            onClick={() => onSelectTab('posts')}
            role="tab"
            aria-selected={activeTab === 'posts'}
          >
            <span>Posts</span>
            <span className="nav-counter" title={`${postCount} total posts`}>
              {postCount}
            </span>
          </button>

          <button
            type="button"
            className={`nav-btn ${activeTab === 'drafts' ? 'active' : ''}`}
            onClick={() => onSelectTab('drafts')}
            role="tab"
            aria-selected={activeTab === 'drafts'}
          >
            <span>Drafts</span>
            <span className="nav-counter draft-counter" title={`${draftCount} saved drafts`}>
              {draftCount}
            </span>
          </button>

          <button
            type="button"
            className={`nav-btn ${activeTab === 'platforms' ? 'active' : ''}`}
            onClick={() => onSelectTab('platforms')}
            role="tab"
            aria-selected={activeTab === 'platforms'}
          >
            <span>Platforms</span>
            <span className="nav-counter platform-counter" title={`${platformCount} active platforms`}>
              {platformCount}
            </span>
          </button>
        </nav>
      </div>
    </header>
  );
}
