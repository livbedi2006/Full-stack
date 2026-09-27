import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  fetchProfileApi,
  fetchStudentPortalApi,
  fetchAdminConsoleApi
} from '../services/api';
import { TerminalIcon, ShieldIcon, AlertTriangleIcon, CheckCircleIcon } from './Icons';

/**
 * ApiConsole Component (Experiment 3: Protected Resource & RBAC Testing)
 */
export default function ApiConsole() {
  const { token, user } = useAuth();
  const [responseLog, setResponseLog] = useState(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [activeTest, setActiveTest] = useState(null);

  const handleTest = async (testName, apiCall, customToken = undefined) => {
    setActiveTest(testName);
    setIsExecuting(true);
    setResponseLog(null);

    const result = await apiCall(customToken);
    setResponseLog(result);
    setIsExecuting(false);
  };

  const testValidProfile = () => {
    handleTest('profile', fetchProfileApi);
  };

  const testStudentResource = () => {
    handleTest('student', fetchStudentPortalApi);
  };

  const testAdminResource = () => {
    handleTest('admin', fetchAdminConsoleApi);
  };

  const testTamperedToken = () => {
    // Deliberately tamper with the payload segment of the token
    const parts = (token || '').split('.');
    if (parts.length === 3) {
      // Modify last characters of payload to invalidate the HMAC signature
      const tampered = `${parts[0]}.${parts[1]}TAMPERED.${parts[2]}`;
      handleTest('tampered', fetchProfileApi, tampered);
    } else {
      handleTest('tampered', fetchProfileApi, 'invalid.dummy.token');
    }
  };

  const testMissingToken = () => {
    // Send request with empty token to trigger 401 AUTH_HEADER_MISSING
    handleTest('missing', fetchProfileApi, '');
  };

  return (
    <div className="api-console-card">
      <div className="console-header-flex">
        <div className="title-with-icon">
          <TerminalIcon size={18} color="#10b981" />
          <h3 className="section-heading">Protected Resource & RBAC Tester</h3>
        </div>
        <span className="user-role-indicator">
          Active Role: <strong>{user?.role?.toUpperCase()}</strong>
        </span>
      </div>

      <p className="card-desc">
        Click the buttons below to test server-side token validation and role authorization.
        Inspect HTTP status codes, latency, and response bodies in real-time.
      </p>

      {/* Button Toolbar */}
      <div className="console-actions-cluster">
        <button
          type="button"
          className="btn btn-primary"
          onClick={testValidProfile}
          disabled={isExecuting}
        >
          <ShieldIcon size={14} />
          <span>GET /api/protected/profile (Standard Auth)</span>
        </button>

        <button
          type="button"
          className="btn btn-secondary"
          onClick={testStudentResource}
          disabled={isExecuting}
        >
          <span>GET /api/protected/student (Student / Admin)</span>
        </button>

        <button
          type="button"
          className={`btn ${user?.role === 'admin' ? 'btn-primary' : 'btn-warning-outline'}`}
          onClick={testAdminResource}
          disabled={isExecuting}
          title={user?.role === 'admin' ? 'Access Admin Console' : 'Expect HTTP 403 Forbidden for Student role'}
        >
          <span>GET /api/protected/admin (Admin Only)</span>
          {user?.role !== 'admin' && <span className="pill-expected">Expect 403</span>}
        </button>

        <button
          type="button"
          className="btn btn-danger-outline"
          onClick={testTamperedToken}
          disabled={isExecuting}
          title="Modifies payload in flight to simulate cryptographic forgery"
        >
          <AlertTriangleIcon size={14} />
          <span>Test Tampered Signature (Expect 401)</span>
        </button>

        <button
          type="button"
          className="btn btn-danger-outline"
          onClick={testMissingToken}
          disabled={isExecuting}
        >
          <span>Test Missing Token (Expect 401)</span>
        </button>
      </div>

      {/* Interactive Terminal Output */}
      <div className="terminal-display-box" role="region" aria-label="API Response Output">
        <div className="terminal-top-bar">
          <div className="terminal-window-buttons">
            <span className="dot dot-red" />
            <span className="dot dot-yellow" />
            <span className="dot dot-green" />
          </div>
          <span className="terminal-title">
            HTTP Response Console {activeTest ? `• [${activeTest.toUpperCase()}]` : ''}
          </span>
          {responseLog && (
            <div className="terminal-metrics">
              <span className={`status-pill status-${responseLog.status}`}>
                {responseLog.status} {responseLog.statusText}
              </span>
              <span className="latency-pill">{responseLog.duration}ms</span>
            </div>
          )}
        </div>

        <div className="terminal-body">
          {isExecuting && (
            <div className="terminal-loading">
              <span className="spinner-sm" />
              <span>Transmitting request with Authorization: Bearer &lt;token&gt;...</span>
            </div>
          )}

          {!isExecuting && !responseLog && (
            <div className="terminal-placeholder">
              <p>Ready. Select any endpoint button above to execute a protected request.</p>
            </div>
          )}

          {!isExecuting && responseLog && (
            <div className="terminal-content">
              {/* Verdict Banner */}
              <div className={`verdict-strip ${responseLog.ok ? 'verdict-granted' : responseLog.status === 403 ? 'verdict-forbidden' : 'verdict-denied'}`}>
                {responseLog.ok ? (
                  <>
                    <CheckCircleIcon size={16} color="#10b981" />
                    <strong>✓ Access Granted:</strong>
                    <span>Valid token signature verified by server.</span>
                  </>
                ) : responseLog.status === 403 ? (
                  <>
                    <AlertTriangleIcon size={16} color="#f59e0b" />
                    <strong>⚠ Access Forbidden (HTTP 403):</strong>
                    <span>Token is authentic, but role '{user?.role}' lacks administrative permissions.</span>
                  </>
                ) : (
                  <>
                    <AlertTriangleIcon size={16} color="#ef4444" />
                    <strong>✗ Access Denied (HTTP 401):</strong>
                    <span>Token verification rejected by authMiddleware.</span>
                  </>
                )}
              </div>

              {/* Response JSON */}
              <pre className="terminal-json-output">
                {JSON.stringify(responseLog.data, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
