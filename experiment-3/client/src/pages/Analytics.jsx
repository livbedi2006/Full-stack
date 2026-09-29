import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { fetchAnalyticsApi } from "../services/api";

const MOCK_ANALYTICS = {
  totalPosts: 24,
  publishedPosts: 18,
  draftPosts: 4,
  archivedPosts: 2,
  engagement: "87%",
  platforms: [
    { name: "Twitter / X", posts: 10, reach: "12.4K" },
    { name: "LinkedIn", posts: 7, reach: "8.9K" },
    { name: "Instagram", posts: 5, reach: "15.2K" },
    { name: "Facebook", posts: 2, reach: "3.1K" },
  ],
  recentActivity: [
    { action: "Post Published", target: "Product Launch 2025", time: "2 hrs ago" },
    { action: "Draft Saved", target: "Q4 Report Summary", time: "5 hrs ago" },
    { action: "Post Edited", target: "Team Introduction", time: "1 day ago" },
  ]
};

function StatCard({ label, value, accent }) {
  return (
    <div className="stat-card" style={{ borderTopColor: accent }}>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

export default function Analytics() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [backendMsg, setBackendMsg] = useState("");

  useEffect(() => {
    const load = async () => {
      const result = await fetchAnalyticsApi();
      if (result.ok) {
        setBackendMsg(result.data?.message || "Analytics data fetched from backend.");
        setData(MOCK_ANALYTICS);
      } else {
        setBackendMsg(result.data?.message || "Backend returned error.");
        setData(MOCK_ANALYTICS);
      }
      setLoading(false);
    };
    load();
  }, []);

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <div className="badge-row">
            <span className="badge exp3-badge">RBAC MODULE</span>
            <span className="badge badge-info">ANALYTICS</span>
            <span className="badge badge-success">Admin + Editor</span>
          </div>
          <h1 className="page-title">Analytics Dashboard</h1>
          <p className="page-subtitle">Role <strong>{user?.role?.toUpperCase()}</strong> has view_analytics permission. Viewer role is blocked (HTTP 403).</p>
        </div>
      </div>

      {backendMsg && (
        <div className="info-strip">
          <span className="info-icon">🔒</span>
          <span>Backend: {backendMsg}</span>
        </div>
      )}

      {loading ? (
        <div className="loading-state"><span className="spinner-lg" /><p>Loading analytics...</p></div>
      ) : (
        <>
          <div className="stats-grid">
            <StatCard label="Total Posts" value={data.totalPosts} accent="#6366f1" />
            <StatCard label="Published" value={data.publishedPosts} accent="#22c55e" />
            <StatCard label="Drafts" value={data.draftPosts} accent="#f59e0b" />
            <StatCard label="Engagement" value={data.engagement} accent="#0ea5e9" />
          </div>

          <div className="analytics-grid">
            <div className="data-card">
              <h3 className="card-title">Posts by Platform</h3>
              <table className="data-table">
                <thead>
                  <tr><th>Platform</th><th>Posts</th><th>Reach</th><th>Bar</th></tr>
                </thead>
                <tbody>
                  {data.platforms.map(p => (
                    <tr key={p.name}>
                      <td>{p.name}</td>
                      <td><strong>{p.posts}</strong></td>
                      <td>{p.reach}</td>
                      <td>
                        <div className="progress-bar-wrap">
                          <div className="progress-bar-fill" style={{ width: `${(p.posts / data.totalPosts) * 100}%` }} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="data-card">
              <h3 className="card-title">Recent Activity</h3>
              <ul className="activity-list">
                {data.recentActivity.map((item, i) => (
                  <li key={i} className="activity-item">
                    <div className="activity-dot" />
                    <div>
                      <div className="activity-action">{item.action}</div>
                      <div className="activity-target">{item.target}</div>
                      <div className="activity-time">{item.time}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="data-card rbac-note-card">
            <h3 className="card-title">RBAC Authorization Note</h3>
            <p>This page requires the <code>view_analytics</code> permission:</p>
            <ul className="rbac-note-list">
              <li><span className="perm-allowed">✓ Admin</span> — has view_analytics permission</li>
              <li><span className="perm-allowed">✓ Editor</span> — has view_analytics permission</li>
              <li><span className="perm-denied">✗ Viewer</span> — redirected to /unauthorized (HTTP 403)</li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
