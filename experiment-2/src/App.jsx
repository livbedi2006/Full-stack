import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { fetchPlatforms } from './features/platforms/platformsSlice';
import { fetchPosts } from './features/posts/postsSlice';
import { fetchDrafts } from './features/drafts/draftsSlice';

import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import PostManager from './components/PostManager';
import DraftManager from './components/DraftManager';
import PlatformList from './components/PlatformList';

/**
 * Main Application Component (Experiment 2)
 * 
 * Centralized State Management Using Redux Toolkit
 * 
 * Demonstrates:
 * 1. Global Store Dispatch on Mount:
 *    Initializes normalized posts, platforms, and drafts via createAsyncThunk.
 * 2. Zero Prop Drilling:
 *    Components read and modify data directly via useSelector and useDispatch!
 */
export default function App() {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState('dashboard');

  // Load initial global data into Redux store on mount
  useEffect(() => {
    dispatch(fetchPlatforms());
    dispatch(fetchPosts());
    dispatch(fetchDrafts());
  }, [dispatch]);

  return (
    <div className="app-shell">
      {/* Top Redux Navbar */}
      <Navbar activeTab={activeTab} onSelectTab={setActiveTab} />

      {/* Main Tabbed Content Area */}
      <main className="main-content-container">
        {activeTab === 'dashboard' && <Dashboard onNavigateTab={setActiveTab} />}
        {activeTab === 'posts' && <PostManager />}
        {activeTab === 'drafts' && <DraftManager />}
        {activeTab === 'platforms' && <PlatformList />}
      </main>

      {/* Academic Experiment Footer */}
      <footer className="app-footer">
        <div className="footer-inner">
          <p className="footer-title">
            Experiment 2: Centralized State Management Using Redux Toolkit
          </p>
          <p className="footer-sub">
            Demonstrating createSlice, createEntityAdapter (Normalized State), createAsyncThunk, and createSelector (Reselect).
          </p>
        </div>
      </footer>
    </div>
  );
}
