import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { KeyIcon, InfoIcon } from './Icons';

/**
 * TokenInfo Component (Experiment 3: JWT Structure & Decoding)
 */
export default function TokenInfo() {
  const { token, decodedToken } = useAuth();
  const [secondsRemaining, setSecondsRemaining] = useState(0);

  // Live countdown to expiration
  useEffect(() => {
    if (!decodedToken?.payload?.exp) return;

    const updateTimer = () => {
      const now = Math.floor(Date.now() / 1000);
      const remaining = Math.max(0, decodedToken.payload.exp - now);
      setSecondsRemaining(remaining);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [decodedToken]);

  if (!token || !decodedToken) {
    return (
      <div className="token-empty-state">
        <p>No active JWT token present in sessionStorage.</p>
      </div>
    );
  }

  const { header, payload, rawParts } = decodedToken;
  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const timeFormatted = `${minutes}m ${seconds < 10 ? '0' : ''}${seconds}s`;

  return (
    <div className="token-info-card">
      <div className="token-info-header">
        <div className="title-with-icon">
          <KeyIcon size={18} color="#f59e0b" />
          <h3 className="section-heading">JWT Structure & Token Inspector</h3>
        </div>
        <div className="token-countdown-pill" title="Time remaining before token expires">
          <span className="pulse-dot" />
          <span>Expires in: </span>
          <strong>{secondsRemaining > 0 ? timeFormatted : 'Expired'}</strong>
        </div>
      </div>

      <p className="card-desc">
        A JSON Web Token (RFC 7519) is a compact, URL-safe means of representing claims to be
        transferred between two parties. It is composed of three dot-separated Base64URL parts:
      </p>

      {/* Color-coded Raw Token Display */}
      <div className="raw-token-box">
        <div className="raw-token-header">
          <span className="raw-label">Encoded JWT (from sessionStorage):</span>
          <span className="token-legend">
            <span className="legend-dot header-dot" /> Header
            <span className="legend-dot payload-dot" /> Payload
            <span className="legend-dot signature-dot" /> Signature
          </span>
        </div>

        <div className="token-string-container" title="Dot-separated segments: Header (red), Payload (purple), Signature (green)">
          <span className="token-part token-header">{rawParts.header}</span>
          <span className="token-dot">.</span>
          <span className="token-part token-payload">{rawParts.payload}</span>
          <span className="token-dot">.</span>
          <span className="token-part token-signature">{rawParts.signature}</span>
        </div>
      </div>

      {/* 3-Column Decoded Panels */}
      <div className="decoded-parts-grid">
        {/* 1. Header */}
        <div className="decoded-panel panel-header">
          <div className="panel-title-row">
            <span className="part-tag tag-header">PART 1: HEADER</span>
            <span className="part-meta">Algorithm & Type</span>
          </div>
          <pre className="json-code-block">{JSON.stringify(header, null, 2)}</pre>
          <p className="part-explanation">
            Specifies the signature algorithm (<strong>{header.alg}</strong>) and token format (<strong>{header.typ}</strong>).
          </p>
        </div>

        {/* 2. Payload */}
        <div className="decoded-panel panel-payload">
          <div className="panel-title-row">
            <span className="part-tag tag-payload">PART 2: PAYLOAD</span>
            <span className="part-meta">Claims & Identity</span>
          </div>
          <pre className="json-code-block">{JSON.stringify(payload, null, 2)}</pre>
          <div className="claims-legend-list">
            <div><code>sub</code>: Subject identifier (User ID)</div>
            <div><code>email</code>: Authenticated user email</div>
            <div><code>role</code>: Authorization role (RBAC)</div>
            <div><code>iat</code>: Issued At ({new Date(payload.iat * 1000).toLocaleTimeString()})</div>
            <div><code>exp</code>: Expires At ({new Date(payload.exp * 1000).toLocaleTimeString()})</div>
          </div>
        </div>

        {/* 3. Signature */}
        <div className="decoded-panel panel-signature">
          <div className="panel-title-row">
            <span className="part-tag tag-signature">PART 3: SIGNATURE</span>
            <span className="part-meta">Server-Side Verified</span>
          </div>
          <div className="signature-formula-box">
            <code>
              HMACSHA256(<br />
              &nbsp;&nbsp;base64UrlEncode(header) + "." +<br />
              &nbsp;&nbsp;base64UrlEncode(payload),<br />
              &nbsp;&nbsp;<span className="secret-highlight">JWT_SECRET [Hidden on Server]</span><br />
              )
            </code>
          </div>
          <p className="part-explanation">
            Guarantees message integrity. If an attacker modifies even a single character of the payload,
            the signature verification fails immediately on the server.
          </p>
        </div>
      </div>

      {/* Educational Security Callout */}
      <div className="security-notice-callout">
        <InfoIcon size={16} color="#38bdf8" />
        <p>
          <strong>Critical Educational Concept:</strong> Decoded JWT payload displayed above is for
          informational inspection only. <em>Never trust client-side decoded claims alone.</em> Authentic
          authorization is proven strictly when the Node server validates the cryptographic signature.
          The secret key (<code>JWT_SECRET</code>) is <strong>never</strong> transmitted to or stored on the browser.
        </p>
      </div>
    </div>
  );
}
