import { verifyToken } from '../utils/token.js';
import { findUserById } from '../data/users.js';

/**
 * ============================================================================
 * AUTHENTICATION & AUTHORIZATION MIDDLEWARE (Experiment 3)
 * ============================================================================
 * Concepts:
 * 1. Bearer Token Extraction: Parses the standard HTTP `Authorization` header.
 * 2. Cryptographic Verification: Validates HMAC-SHA256 signature using JWT_SECRET.
 * 3. Expiration Handling: Detects `TokenExpiredError` and signals client.
 * 4. Role-Based Access Control (RBAC): Enforces granular route permissions.
 */

export function verifyAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  // 1. Check presence of Authorization header
  if (!authHeader) {
    return res.status(401).json({
      success: false,
      error: 'Authorization header is missing. Expected: Authorization: Bearer <token>',
      code: 'AUTH_HEADER_MISSING'
    });
  }

  // 2. Validate Bearer scheme format
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({
      success: false,
      error: 'Malformed authorization header. Expected format: Bearer <token>',
      code: 'AUTH_HEADER_MALFORMED'
    });
  }

  const token = parts[1];

  // 3. Cryptographically verify token
  try {
    const decoded = verifyToken(token);

    // Verify user still exists in database
    const user = findUserById(decoded.sub);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'The user account associated with this token no longer exists.',
        code: 'USER_NOT_FOUND'
      });
    }

    // Attach decoded identity and database user object to request
    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      tokenIssuedAt: decoded.iat,
      tokenExpiresAt: decoded.exp
    };

    next();
  } catch (err) {
    // 4. Handle expired token
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Your session token has expired. Please log in again.',
        code: 'TOKEN_EXPIRED',
        expiredAt: err.expiredAt
      });
    }

    // 5. Handle invalid signature / tampering
    return res.status(401).json({
      success: false,
      error: 'Invalid token signature or malformed payload. Verification failed.',
      code: 'TOKEN_INVALID'
    });
  }
}

/**
 * Role-Based Authorization Middleware (RBAC)
 * Verifies that the authenticated user possesses one of the allowed roles.
 */
export function requireRole(allowedRoles = []) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required prior to role verification.',
        code: 'UNAUTHENTICATED'
      });
    }

    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `Access Forbidden: Required role [${roles.join(', ')}], but your role is '${req.user.role}'.`,
        code: 'FORBIDDEN_INSUFFICIENT_ROLE',
        userRole: req.user.role,
        requiredRoles: roles
      });
    }

    next();
  };
}
