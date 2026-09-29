import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { fetchSettingsApi } from "../services/api";

const SETTINGS_SECTIONS = [
  {
    title: "Application Settings",
    icon: "⚙️",
    items: [
      { key: "app_name", label: "Application Name", value: "JWT Auth Guard — Experiment 3", type: "text" },
      { key: "app_env", label: "Environment", value: "Development", type: "select", options: ["Development", "Staging", "Production"] },
      { key: "debug_mode", label: "Debug Mode", value: true, type: "toggle" },
    ]
  },
  {
    title: "Security Settings",
    icon: "🔐",
    items: [
      { key: "jwt_expiry", label: "JWT Token Expiry", value: "1h", type: "select", options: ["15m", "30m", "1h", "4h", "24h"] },
      { key: "bcrypt_rounds", label: "bcrypt Salt Rounds", value: "10", type: "text" },
      { key: "require_https", label: "Require HTTPS", value: false, type: "toggle" },
    ]
  },
  {
    title: "User Management Settings",
    icon: "👥",
    items: [
      { key: "allow_registration", label: "Allow Registration", value: false, type: "toggle" },
      { key: "default_role", label: "Default New User Role", value: "viewer", type: "select", options: ["viewer", "editor", "admin"] },
      { key: "session_timeout", label: "Session Timeout (minutes)", value: "60", type: "text" },
    ]
  }
];

export default function Settings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState(() => {
    const init = {};
    SETTINGS_SECTIONS.forEach(s => s.items.forEach(i => { init[i.key] = i.value; }));
    return init;
  });
  const [backendStatus, setBackendStatus] = useState("");
  const [saveMsg, setSaveMsg] = useState("");

  useEffect(() => {
    const verify = async () => {
      const result = await fetchSettingsApi();
      setBackendStatus(result.ok
        ? "Backend confirmed admin access: GET /api/protected/settings → HTTP 200 OK."
        : `Backend returned HTTP ${result.status}: ${result.data?.message || "Access denied."}`
      );
    };
    verify();
  }, []);

  const handleSave = () => {
    setSaveMsg("Settings saved (demo — not persisted to backend in this experiment).");
    setTimeout(() => setSaveMsg(""), 3000);
  };

  const handleToggle = (key) => setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  const handleChange = (key, val) => setSettings(prev => ({ ...prev, [key]: val }));

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <div className="badge-row">
            <span className="badge exp3-badge">RBAC MODULE</span>
            <span className="badge badge-danger">ADMIN ONLY</span>
          </div>
          <h1 className="page-title">System Settings</h1>
          <p className="page-subtitle">Only <strong>Admin</strong> can access this route. All other roles are forbidden (HTTP 403).</p>
        </div>
        <button className="btn btn-primary" onClick={handleSave}>Save Settings</button>
      </div>

      {backendStatus && (
        <div className="info-strip">
          <span className="info-icon">🔒</span>
          <span>{backendStatus}</span>
        </div>
      )}

      {saveMsg && <div className="alert-banner alert-success">{saveMsg}</div>}

      <div className="settings-grid">
        {SETTINGS_SECTIONS.map(section => (
          <div key={section.title} className="data-card settings-card">
            <h3 className="card-title">{section.icon} {section.title}</h3>
            <div className="settings-items">
              {section.items.map(item => (
                <div key={item.key} className="settings-row">
                  <div className="settings-label-col">
                    <label className="form-label" htmlFor={`setting-${item.key}`}>{item.label}</label>
                  </div>
                  <div className="settings-control-col">
                    {item.type === "toggle" ? (
                      <button
                        id={`setting-${item.key}`}
                        className={`toggle-btn ${settings[item.key] ? "toggle-on" : "toggle-off"}`}
                        onClick={() => handleToggle(item.key)}
                        aria-pressed={settings[item.key]}
                      >
                        {settings[item.key] ? "ON" : "OFF"}
                      </button>
                    ) : item.type === "select" ? (
                      <select
                        id={`setting-${item.key}`}
                        className="form-input form-select settings-select"
                        value={settings[item.key]}
                        onChange={e => handleChange(item.key, e.target.value)}
                      >
                        {item.options.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    ) : (
                      <input
                        id={`setting-${item.key}`}
                        className="form-input settings-text"
                        value={settings[item.key]}
                        onChange={e => handleChange(item.key, e.target.value)}
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="data-card rbac-note-card" style={{ marginTop: "1.5rem" }}>
        <h3 className="card-title">Admin-Only Access — RBAC Demonstration</h3>
        <p>What happens when a non-admin tries to access /settings:</p>
        <div className="flow-steps">
          <div className="flow-step"><span className="flow-num">1</span> User navigates to /settings</div>
          <div className="flow-arrow">↓</div>
          <div className="flow-step"><span className="flow-num">2</span> RoleRoute checks role from AuthContext</div>
          <div className="flow-arrow">↓</div>
          <div className="flow-step"><span className="flow-num">3</span> Role not in allowedRoles=["admin"]</div>
          <div className="flow-arrow">↓</div>
          <div className="flow-step flow-denied"><span className="flow-num">4</span> Redirect to /unauthorized (HTTP 403)</div>
        </div>
      </div>
    </div>
  );
}
