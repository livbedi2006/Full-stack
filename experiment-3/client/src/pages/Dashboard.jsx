import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import UserProfile from '../components/UserProfile';
import TokenInfo from '../components/TokenInfo';
import ApiConsole from '../components/ApiConsole';
import AuthFlowVisualizer from '../components/AuthFlowVisualizer';
import SecurityNotes from '../components/SecurityNotes';
import { KeyIcon, TerminalIcon, LogOutIcon } from '../components/Icons';

/**
 * Dashboard Page (Experiment 3: JWT)
 */
export default function Dashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('all');

  return (
    <div className="dashboard-page-container">
      {/* Top Welcome Strip */}
      <section className="dashboard-welcome-banner">
        <div className="welcome-content">
          <div className="badge-row">
            <span className="badge exp3-badge">EXPERIMENT 3 DASHBOARD</span>
            <span className="badge badge-success">SESSION ACTIVE</span>
          </div>
          <h1 className="welcome-title">
            Welcome, {user?.name || 'Student'}
          </h1>
          <p className="welcome-desc">
            You are securely authenticated using a signed JSON Web Token stored in <code>sessionStorage</code>.
            Explore token decoding, test protected endpoints, and inspect security architecture below.
          </p>
        </div>

        <div className="welcome-actions">
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => setActiveTab('api')}
          >
            <TerminalIcon size={14} />
            <span>Test Protected API</span>
          </button>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => setActiveTab('token')}
          >
            <KeyIcon size={14} />
            <span>Inspect Token</span>
          </button>
          <button
            type="button"
            className="btn btn-danger-outline btn-sm"
            onClick={() => logout('Logged out from dashboard.')}
          >
            <LogOutIcon size={14} />
            <span>Logout</span>
          </button>
        </div>
      </section>

      {/* Navigation Filter Tabs */}
      <nav className="dashboard-tab-bar" aria-label="Dashboard views">
        <button
          type="button"
          className={`dash-tab-btn ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          All Modules
        </button>
        <button
          type="button"
          className={`dash-tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          User Profile
        </button>
        <button
          type="button"
          className={`dash-tab-btn ${activeTab === 'api' ? 'active' : ''}`}
          onClick={() => setActiveTab('api')}
        >
          Protected API Console
        </button>
        <button
          type="button"
          className={`dash-tab-btn ${activeTab === 'token' ? 'active' : ''}`}
          onClick={() => setActiveTab('token')}
        >
          JWT Token Inspector
        </button>
        <button
          type="button"
          className={`dash-tab-btn ${activeTab === 'flow' ? 'active' : ''}`}
          onClick={() => setActiveTab('flow')}
        >
          Auth Flow Diagram
        </button>
        <button
          type="button"
          className={`dash-tab-btn ${activeTab === 'security' ? 'active' : ''}`}
          onClick={() => setActiveTab('security')}
        >
          Security Notes
        </button>
      </nav>

      {/* Main Content Sections */}
      <div className="dashboard-sections-stack">
        {(activeTab === 'all' || activeTab === 'profile') && (
          <section className="section-block">
            <UserProfile />
          </section>
        )}

        {(activeTab === 'all' || activeTab === 'api') && (
          <section className="section-block">
            <ApiConsole />
          </section>
        )}

        {(activeTab === 'all' || activeTab === 'token') && (
          <section className="section-block">
            <TokenInfo />
          </section>
        )}

        {(activeTab === 'all' || activeTab === 'flow') && (
          <section className="section-block">
            <AuthFlowVisualizer />
          </section>
        )}

        {(activeTab === 'all' || activeTab === 'security') && (
          <section className="section-block">
            <SecurityNotes />
          </section>
        )}
      </div>
    </div>
  );
}
