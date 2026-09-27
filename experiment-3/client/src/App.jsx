import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Unauthorized from './pages/Unauthorized';

/**
 * Main Application Component (Experiment 3: JWT Authentication)
 */
export default function App() {
  return (
    <AuthProvider>
      <div className="app-shell">
        <Navbar />

        <main className="main-content-container">
          <Routes>
            {/* Public Login Route */}
            <Route path="/login" element={<Login />} />

            {/* Protected Dashboard Route */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            {/* Role-Based Unauthorized Route */}
            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* Default & Catch-All Redirections */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>

        <footer className="app-footer">
          <div className="footer-inner">
            <p className="footer-title">
              Experiment 3: Secure Authentication Using JSON Web Tokens (JWT)
            </p>
            <p className="footer-sub">
              Demonstrating bcrypt password hashing, HMAC-SHA256 token signing, stateless verification, and role-based access control.
            </p>
          </div>
        </footer>
      </div>
    </AuthProvider>
  );
}
