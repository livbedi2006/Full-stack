import jwt from 'jsonwebtoken';

/**
 * ============================================================================
 * JWT TOKEN UTILITIES (Experiment 3: JWT Authentication)
 * ============================================================================
 * Concepts:
 * 1. Token Creation: Signs minimal payload with secret key using HMAC-SHA256 (HS256).
 * 2. Claims Structure:
 *    - sub: Subject (user id)
 *    - email: user email
 *    - role: user role for RBAC
 * 3. Expiration: Sets an explicit expiry (15m default) to prevent replay attacks.
 */

export function generateToken(user, customExpiresIn = null) {
  const secret = process.env.JWT_SECRET || 'dev_jwt_secret_key_change_in_prod';
  const expiresIn = customExpiresIn || process.env.JWT_EXPIRES_IN || '15m';

  const payload = {
    sub: String(user.id),
    email: user.email,
    name: user.name,
    role: user.role
  };

  return jwt.sign(payload, secret, {
    expiresIn,
    algorithm: 'HS256'
  });
}

export function verifyToken(token) {
  const secret = process.env.JWT_SECRET || 'dev_jwt_secret_key_change_in_prod';
  return jwt.verify(token, secret, { algorithms: ['HS256'] });
}

export function decodeToken(token) {
  return jwt.decode(token, { complete: true });
}
