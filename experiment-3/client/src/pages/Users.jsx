import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { fetchUsersApi } from "../services/api";

const ROLE_COLORS = { admin: "role-admin", editor: "role-editor", viewer: "role-viewer", student: "role-student" };

export default function Users() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [backendStatus, setBackendStatus] = useState("");

  useEffect(() => {
    const load = async () => {
      const result = await fetchUsersApi();
      if (result.ok) {
        setUsers(result.data.users || []);
        setBackendStatus("Backend confirmed: Admin-only endpoint (HTTP 200 OK).");
      } else {
        setError(result.data?.message || "Failed to load users.");
        setBackendStatus(`Backend returned HTTP ${result.status}`);
      }
      setLoading(false);
    };
    load();
  }, []);

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <div className="badge-row">
            <span className="badge exp3-badge">RBAC MODULE</span>
            <span className="badge badge-danger">ADMIN ONLY</span>
          </div>
          <h1 className="page-title">User Management</h1>
          <p className="page-subtitle">Only <strong>Admin</strong> can access this route. Editor and Viewer are redirected to /unauthorized.</p>
        </div>
      </div>

      {backendStatus && (
        <div className="info-strip">
          <span className="info-icon">🔐</span>
          <span>{backendStatus}</span>
        </div>
      )}

      <div className="filter-bar">
        <input className="form-input search-input" placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div className="loading-state"><span className="spinner-lg" /><p>Loading users...</p></div>
      ) : error ? (
        <div className="alert-banner alert-danger">{error}</div>
      ) : (
        <>
          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u, i) => (
                  <tr key={u.id || i} className={u.email === user?.email ? "current-user-row" : ""}>
                    <td>{i + 1}</td>
                    <td>
                      <div className="user-name-cell">
                        <div className="user-avatar-sm">{u.name?.charAt(0)?.toUpperCase()}</div>
                        <span>{u.name}{u.email === user?.email && <span className="you-badge"> (You)</span>}</span>
                      </div>
                    </td>
                    <td>{u.email}</td>
                    <td>
                      <span className={`role-badge ${ROLE_COLORS[u.role] || ""}`}>{u.role?.toUpperCase()}</span>
                    </td>
                    <td><span className="badge badge-success">Active</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="data-card rbac-note-card" style={{ marginTop: "1.5rem" }}>
            <h3 className="card-title">RBAC Security Note</h3>
            <p>This page is protected at two levels:</p>
            <ol className="rbac-note-list">
              <li><strong>Frontend:</strong> RoleRoute redirects non-admins to /unauthorized before the page renders.</li>
              <li><strong>Backend:</strong> GET /api/protected/users checks the JWT role claim and returns HTTP 403 Forbidden if role !== admin.</li>
            </ol>
            <p className="text-muted text-sm">Even if an attacker bypasses the UI, the backend API rejects the request.</p>
          </div>
        </>
      )}
    </div>
  );
}
