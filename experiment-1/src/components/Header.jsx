import React from 'react';
import { ShieldCheckIcon, SparklesIcon, FolderIcon, EditIcon } from './Icons';

/**
 * Header Component (Experiment 1.1.1 + Experiment 1.1.2)
 * 
 * Displays unified academic header, module navigation tabs (Composer vs Drafts Vault),
 * and quick-test scenario presets for testing platform boundaries.
 */
export default function Header({
  activeTab = 'composer',
  onSelectTab,
  draftCount = 0,
  onLoadPreset
}) {
  return (
    <header className="app-header">
      <div className="header-container">
        {/* Top Experiment Badges Strip */}
        <div className="header-meta-strip">
          <span className="badge experiment-badge">EXPERIMENT 1.1.1 & 1.1.2</span>
          <span className="badge tech-badge">React 19 Hooks + LocalStorage + Selectors</span>
          <span className="badge status-badge-online">Live Constraints & Async Drafts</span>
        </div>

        {/* Title & Navigation */}
        <div className="header-main-content">
          <div className="header-title-group">
            <h1 className="header-title">
              Social Media Post & Draft Management Suite
            </h1>
            <p className="header-description">
              Unified cross-platform post composing with real-time constraint validation and local draft persistence.
            </p>
          </div>

          {/* Module Navigation Tabs */}
          <nav className="header-nav-tabs" role="tablist" aria-label="Application modules">
            <button
              type="button"
              id="tab-composer"
              role="tab"
              aria-selected={activeTab === 'composer'}
              className={`nav-tab-btn ${activeTab === 'composer' ? 'active' : ''}`}
              onClick={() => onSelectTab('composer')}
            >
              <EditIcon size={16} />
              <span>Post Composer</span>
              <span className="nav-tab-subtag">Exp 1.1.1</span>
            </button>

            <button
              type="button"
              id="tab-drafts"
              role="tab"
              aria-selected={activeTab === 'drafts'}
              className={`nav-tab-btn ${activeTab === 'drafts' ? 'active' : ''}`}
              onClick={() => onSelectTab('drafts')}
            >
              <FolderIcon size={16} />
              <span>Drafts Vault</span>
              <span className="draft-counter-badge">{draftCount}</span>
              <span className="nav-tab-subtag">Exp 1.1.2</span>
            </button>
          </nav>
        </div>

        {/* Quick Scenario Test Presets (Visible when composer is active) */}
        {activeTab === 'composer' && (
          <div className="header-sub-strip">
            <div className="presets-box">
              <div className="presets-label">
                <SparklesIcon size={14} color="#38bdf8" />
                <span>Quick Test Scenarios:</span>
              </div>
              <div className="preset-buttons">
                <button
                  type="button"
                  className="preset-btn"
                  onClick={() => onLoadPreset('validShort')}
                  title="Loads a short post that satisfies all platforms"
                >
                  ✓ Valid Short Post
                </button>
                <button
                  type="button"
                  className="preset-btn"
                  onClick={() => onLoadPreset('overTwitter')}
                  title="Loads a post >280 chars to test Twitter/X overflow while LinkedIn stays valid"
                >
                  ⚠ Exceeds Twitter (280+)
                </button>
                <button
                  type="button"
                  className="preset-btn"
                  onClick={() => onLoadPreset('manyHashtags')}
                  title="Loads 32 hashtags to trigger Instagram and Twitter hashtag warnings"
                >
                  # Hashtag Overflow
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
