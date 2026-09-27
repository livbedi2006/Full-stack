# Experiment 3: Secure Authentication Using JSON Web Tokens (JWT)

## Aim
To design and implement a secure, stateless authentication and authorization system using **JSON Web Tokens (JWT)** for user login, session management, and role-based access control (RBAC) across React and Node.js.

---

## Objectives
1. **Understand Authentication & Authorization**: Differentiate between verifying identity (who the user is) and enforcing permissions (what the user can access).
2. **Implement Token-Based Authentication**: Generate cryptographically signed JSON Web Tokens using HMAC-SHA256 (`HS256`).
3. **Stateless Architecture**: Eliminate server-side session databases and centralized state lookups; verify user identity on-the-fly from incoming token signatures.
4. **Token Storage & Hygiene**: Persist tokens safely in `sessionStorage` for tab-level isolation, and explore production trade-offs with `HttpOnly` `Secure` `SameSite` cookies.
5. **Protect Frontend Routes & Backend APIs**: Use React Router wrappers (`ProtectedRoute.jsx`) and Express middleware (`authMiddleware.js`) to guard private resources.
6. **Master JWT Lifecycle & Structure**: Decode and inspect the three dot-separated segments (**Header**, **Payload**, **Signature**) and handle token expiration gracefully.

---

## Technologies Used

### Frontend
- **Framework**: React.js 19 (Functional Components & React Hooks)
- **Routing**: React Router DOM v7 (`BrowserRouter`, `Routes`, `Route`, `Navigate`)
- **State Management**: React Context API (`AuthContext`)
- **Styling**: Vanilla CSS (Custom Design System with Glassmorphism & Dark Mode)
- **Build Tool**: Vite 8.3

### Backend
- **Runtime**: Node.js (v18+)
- **Server Framework**: Express.js 4.x
- **JWT Engine**: `jsonwebtoken` v9.x
- **Password Hashing**: `bcryptjs` v2.x (Salt rounds: 10)
- **CORS Handling**: `cors`
- **Environment Config**: `dotenv`

---

## Theory & Core Concepts

### 1. Authentication vs. Authorization
- **Authentication**: The process of validating that a user is who they claim to be (e.g., verifying email and password against a salted bcrypt hash).
- **Authorization**: The process of determining whether an authenticated user has permission to access a specific resource (e.g., verifying whether role `student` can access `/api/protected/admin`).

### 2. Stateful vs. Stateless Authentication
| Feature | Stateful (Session Cookies) | Stateless (JWT) |
| :--- | :--- | :--- |
| **Session Storage** | Server memory, Redis, or DB | Client (`sessionStorage` or cookie) |
| **Scalability** | Requires sticky sessions or shared session cache | Horizontally scalable across infinite servers |
| **Verification** | DB/cache query on every request | Instant cryptographic signature check ($O(1)$) |
| **Payload Size** | Minimal (Session ID string) | Larger (carries encoded claims) |

### 3. JWT Structure (`Header.Payload.Signature`)
A JSON Web Token consists of three parts separated by periods (`.`):
```text
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiZW1haWwiOiJzdHVkZW50QGV4YW1wbGUuY29tIiwicm9sZSI6InN0dWRlbnQiLCJpYXQiOjE3MDAsImV4cCI6MTcwMH0.signature_hash_here
 └─── PART 1: HEADER (Red) ───┘  └─── PART 2: PAYLOAD (Purple) ───┘  └─── PART 3: SIGNATURE (Green) ───┘
```

#### Part 1: Header
Identifies the signing algorithm and token type:
```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

#### Part 2: Payload (Claims)
Contains claims about the user identity and token lifecycle. Note: Base64URL is **not** encryption!
```json
{
  "sub": "1",
  "email": "student@example.com",
  "role": "student",
  "iat": 1774720000,
  "exp": 1774720900
}
```

#### Part 3: Signature
Calculated by hashing the Base64URL-encoded header and payload with a server secret:
```text
HMACSHA256(
  base64UrlEncode(header) + "." + base64UrlEncode(payload),
  JWT_SECRET
)
```
If an attacker tampers with the payload on the client, the signature will not match on the backend and verification will fail immediately.

---

## Authentication Flow Diagram

```text
┌──────────────┐                               ┌──────────────┐
│ React Client │                               │ Node Server  │
└──────────────┘                               └──────────────┘
       │                                              │
       │─── 1. POST /api/auth/login (email, pwd) ────>│
       │                                              │
       │                                              │── 2. Look up user by email
       │                                              │── 3. bcrypt.compare(pwd, hash)
       │                                              │── 4. jwt.sign(claims, SECRET)
       │                                              │
       │<── 5. HTTP 200 OK + { token, user } ─────────│
       │                                              │
       │── 6. Persist token in sessionStorage         │
       │── 7. Hydrate AuthContext                     │
       │                                              │
       │─── 8. GET /api/protected/profile ───────────>│
       │       [Authorization: Bearer <token>]        │
       │                                              │── 9. authMiddleware checks Bearer
       │                                              │── 10. jwt.verify(token, SECRET)
       │                                              │── 11. req.user = decoded
       │                                              │
       │<── 12. HTTP 200 OK + Protected Resource ─────│
       │                                              │
       │── 13. User clicks Logout                     │
       │── 14. sessionStorage.removeItem(token)       │
       │                                              │
```

---

## Project Structure

```text
experiment-3/
├── package.json                 # Root script runner (start / install:all)
├── README.md                    # Detailed documentation and lab manual
│
├── server/                      # Node.js + Express Backend
│   ├── package.json             # Backend dependencies (express, jsonwebtoken, bcryptjs, cors, dotenv)
│   ├── .env.example             # Template for environment configuration
│   ├── .env                     # Local environment file (ignored by git)
│   ├── server.js                # Express app initialization, CORS, and middleware mounting
│   ├── data/
│   │   └── users.js             # Mock database with bcrypt-hashed passwords
│   ├── middleware/
│   │   └── authMiddleware.js    # verifyAuth and requireRole RBAC middleware
│   ├── routes/
│   │   ├── authRoutes.js        # POST /api/auth/login, GET /api/auth/me
│   │   └── protectedRoutes.js   # GET /api/protected/profile, student, admin
│   └── utils/
│       └── token.js             # jwt.sign and jwt.verify helper utilities
│
└── client/                      # React.js Frontend
    ├── package.json             # Frontend dependencies (react, react-router-dom, vite)
    ├── vite.config.js           # Vite dev server with /api proxy to localhost:5000
    ├── index.html               # Web root with Inter & JetBrains Mono fonts
    └── src/
        ├── main.jsx             # Entry point wrapping App in BrowserRouter
        ├── App.jsx              # Route orchestrator & AuthProvider wrapper
        ├── index.css            # Dark mode glassmorphic styling system
        ├── context/
        │   └── AuthContext.jsx  # Global auth state, session hydration, and JWT parser
        ├── services/
        │   └── api.js           # Reusable fetch helper injecting Authorization header
        ├── components/
        │   ├── Navbar.jsx       # Global header with live auth state and logout action
        │   ├── LoginForm.jsx    # Controlled login form with demo credentials filler
        │   ├── ProtectedRoute.jsx# Route guard redirecting unauthenticated users to /login
        │   ├── UserProfile.jsx  # Card displaying active identity and session storage info
        │   ├── TokenInfo.jsx    # Visual 3-part color-coded JWT inspector with countdown
        │   ├── ApiConsole.jsx   # Interactive terminal testing 200, 401, and 403 endpoints
        │   ├── AuthFlowVisualizer.jsx # 8-step visual walkthrough of JWT lifecycle
        │   ├── SecurityNotes.jsx# Academic guidelines for production token security
        │   └── Icons.jsx        # Lightweight SVG icon collection
        └── pages/
            ├── Login.jsx        # Public authentication gateway
            ├── Dashboard.jsx    # Protected administrative and student control center
            └── Unauthorized.jsx # HTTP 403 Forbidden demonstration page
```

---

## Demo Credentials (Lab Demo Only)

| Role | Email | Password | Allowed Endpoints |
| :--- | :--- | :--- | :--- |
| **Student** | `student@example.com` | `student123` | `/profile`, `/student` (Receives 403 on `/admin`) |
| **Admin** | `admin@example.com` | `admin123` | `/profile`, `/student`, `/admin` (All privileges) |

> [!NOTE]
> For security demonstration, plain-text passwords are **never** stored in the backend. They are hashed using `bcrypt` with 10 salt rounds upon startup.

---

## Installation & Setup

### Option A: Run Both Services from the Root
```bash
# 1. Navigate to experiment-3
cd experiment-3

# 2. Install dependencies for both server and client
npm run install:all
```

### Option B: Install Individually

#### 1. Backend Setup
```bash
cd experiment-3/server
npm install
```

Ensure `server/.env` exists (copied from `.env.example`):
```env
PORT=5000
JWT_SECRET=super_secret_jwt_lab_key_change_in_production_2026
JWT_EXPIRES_IN=15m
CLIENT_ORIGIN=http://localhost:5175
```

Start the backend:
```bash
npm run dev
# Server starts at http://localhost:5000
```

#### 2. Frontend Setup
In a new terminal window:
```bash
cd experiment-3/client
npm install
npm run dev
# Client starts at http://localhost:5175 (or http://localhost:5173)
```

---

## API Endpoints Specification

### 1. Public Authentication Endpoints
- `POST /api/auth/login`
  - **Body**: `{ "email": "student@example.com", "password": "student123" }`
  - **Success (200)**: `{ "success": true, "token": "<JWT>", "user": { ... } }`
  - **Failure (401)**: `{ "success": false, "error": "Invalid credentials", "code": "INVALID_CREDENTIALS" }`

### 2. Protected Endpoints (Requires `Authorization: Bearer <token>`)
- `GET /api/auth/me`: Verifies active session token with backend signature validator.
- `GET /api/protected/profile`: Returns authenticated user profile and token claims.
- `GET /api/protected/student`: Restricted to roles `student` and `admin`.
- `GET /api/protected/admin`: Restricted to role `admin`. Returns HTTP 403 if accessed by student!

---

## Token Storage Considerations

In this academic experiment:
- **`sessionStorage`** is used:
  - Persists across page reloads in the current browser tab.
  - Automatically destroyed when the tab or browser window is closed.
  - Does not leak across different browser tabs.

### Production Comparison
1. **`localStorage`**:
   - Persists indefinitely across tabs and restarts.
   - **Vulnerability**: Vulnerable to Cross-Site Scripting (XSS). Any malicious script injected into the page can execute `localStorage.getItem('auth_token')`.
2. **`sessionStorage`**:
   - Limits exposure to a single tab. Still accessible by malicious scripts running within that tab.
3. **`HttpOnly`, `Secure`, `SameSite` Cookies** *(Industry Best Practice)*:
   - Inaccessible to client-side JavaScript (`document.cookie` cannot read it), mitigating XSS token theft.
   - Sent automatically by the browser with requests.
   - Must be paired with CSRF protection (e.g., SameSite=Strict or anti-CSRF tokens).

---

## Security Best Practices Demonstrated

1. **Passwords are Hashed**: `bcryptjs` with 10 salt rounds ensures brute-force resistance.
2. **Generic Error Messages**: Invalid logins return a generic message without confirming if the email exists.
3. **Server Secret Stays on Server**: `process.env.JWT_SECRET` is never sent to the browser.
4. **Token Expiration Enforced**: Expired tokens trigger automatic 401 rejection and client logout.
5. **Role-Based Access Control**: Backend checks `req.user.role` independently of client assertions.
6. **Integrity Validation**: Tampered tokens fail cryptographic verification with HTTP 401.

---

## Expected Outcome

1. **Unauthenticated Redirects**: Navigating directly to `/dashboard` redirects immediately to `/login`.
2. **Seamless Login**: Entering valid credentials signs a JWT and redirects to the dashboard.
3. **Live Token Inspection**: The decoded header and payload are visible with a live countdown timer.
4. **Tampering Detection**: The "Test Tampered Signature" button demonstrates immediate server rejection (401 Unauthorized).
5. **RBAC Enforcement**: The "Test Admin Console" button demonstrates HTTP 403 Forbidden for students and HTTP 200 OK for faculty admins.
6. **Clean Logout**: Clicking Logout purges `sessionStorage` and returns the application to the login screen.
