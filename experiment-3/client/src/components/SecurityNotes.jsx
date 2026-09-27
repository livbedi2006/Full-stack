import { LockIcon } from './Icons';

/**
 * SecurityNotes Component (Experiment 3: JWT Security Lab Notes)
 */
export default function SecurityNotes() {
  const notes = [
    {
      title: 'Signed, Not Encrypted (Base64URL)',
      summary: 'JWTs are signed to guarantee authenticity and integrity, but they are NOT encrypted. Anyone who intercepts the token can decode and read the payload. Never store passwords, API keys, or PII inside claims!'
    },
    {
      title: 'Server-Side Signature Verification',
      summary: 'Frontend decoding (via atob or jwt-decode) is strictly for UI presentation. Never treat client-side claims as authorization proof; only the server can verify the HMAC-SHA256 signature.'
    },
    {
      title: 'Token Storage Trade-offs',
      summary: 'In this lab, sessionStorage is used to isolate tokens to the active tab. In production, HttpOnly, Secure, SameSite cookies are preferred for web apps to protect against Cross-Site Scripting (XSS) token theft.'
    },
    {
      title: 'Secret Key Protection',
      summary: 'JWT_SECRET must live strictly in server environment variables (server/.env) and never be bundled into client-side JS or checked into version control. A compromised secret allows attackers to forge tokens.'
    },
    {
      title: 'Short Expiration Lifetimes',
      summary: 'Because JWTs are stateless and cannot be revoked without maintaining blacklists, tokens must be short-lived (e.g., 15 minutes) to minimize the replay window in case of token leakage.'
    },
    {
      title: 'Transport Layer Security (HTTPS)',
      summary: 'JWT tokens are passed in the HTTP Authorization header. In production, HTTPS/TLS encryption is mandatory to prevent man-in-the-middle (MITM) network eavesdropping.'
    }
  ];

  return (
    <div className="security-notes-card">
      <div className="title-with-icon">
        <LockIcon size={18} color="#f43f5e" />
        <h3 className="section-heading">Security Considerations & Best Practices</h3>
      </div>

      <p className="card-desc">
        Essential security guidelines for engineering production-grade token authentication systems:
      </p>

      <div className="security-notes-grid">
        {notes.map((item, idx) => (
          <div key={idx} className="security-note-item">
            <div className="note-title-row">
              <span className="note-index">0{idx + 1}</span>
              <h4 className="note-title">{item.title}</h4>
            </div>
            <p className="note-body">{item.summary}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
