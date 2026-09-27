import { ShieldIcon } from './Icons';

/**
 * AuthFlowVisualizer Component (Experiment 3: JWT Architecture Flow)
 */
export default function AuthFlowVisualizer() {
  const steps = [
    {
      num: 1,
      actor: 'CLIENT',
      title: 'User Login Submission',
      desc: 'User enters credentials in LoginForm. Submits POST /api/auth/login with email & password over HTTPS.'
    },
    {
      num: 2,
      actor: 'SERVER',
      title: 'Credential Validation',
      desc: 'Node backend looks up user and compares password using bcrypt.compare() against salted hash.'
    },
    {
      num: 3,
      actor: 'SERVER',
      title: 'JWT Token Generation',
      desc: 'jwt.sign() bundles user claims (sub, email, role) with expiresIn: "15m", signed with server JWT_SECRET.'
    },
    {
      num: 4,
      actor: 'CLIENT',
      title: 'Token Storage',
      desc: 'Client receives JWT and persists it to sessionStorage. User session is hydrated without cookies.'
    },
    {
      num: 5,
      actor: 'CLIENT',
      title: 'Protected API Request',
      desc: 'Client dispatches request to /api/protected/* attaching header: Authorization: Bearer <token>.'
    },
    {
      num: 6,
      actor: 'SERVER',
      title: 'Cryptographic Verification',
      desc: 'authMiddleware extracts token, verifies HMAC-SHA256 signature using JWT_SECRET, and checks expiration.'
    },
    {
      num: 7,
      actor: 'SERVER',
      title: 'Authorized Resource Delivery',
      desc: 'Decoded user is bound to req.user. Endpoint returns protected JSON payload with HTTP 200 OK.'
    },
    {
      num: 8,
      actor: 'CLIENT',
      title: 'Stateless Session Termination',
      desc: 'On Logout, sessionStorage.removeItem("auth_token") destroys the token on client. Server remains stateless!'
    }
  ];

  return (
    <div className="flow-visualizer-card">
      <div className="title-with-icon">
        <ShieldIcon size={18} color="#6366f1" />
        <h3 className="section-heading">JWT Stateless Authentication Lifecycle</h3>
      </div>

      <p className="card-desc">
        Unlike traditional session authentication which requires server-side session databases or Redis stores,
        JWT authentication is <strong>stateless</strong>: the token itself carries all verification data.
      </p>

      <div className="flow-steps-grid">
        {steps.map((step) => (
          <div key={step.num} className="flow-step-card">
            <div className="step-header">
              <span className="step-number">{step.num}</span>
              <span className={`actor-pill actor-${step.actor.toLowerCase()}`}>
                {step.actor}
              </span>
            </div>
            <h4 className="step-title">{step.title}</h4>
            <p className="step-desc">{step.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
