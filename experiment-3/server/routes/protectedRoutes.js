import express from 'express';
import { verifyAuth, requireRole } from '../middleware/authMiddleware.js';
import { findUserById } from '../data/users.js';

const router = express.Router();

/**
 * ============================================================================
 * PROTECTED API ROUTES (Experiment 3: JWT Verification & RBAC)
 * ============================================================================
 * Concepts:
 * 1. Stateless Verification:
 *    The server does not store active session IDs in a centralized cache or DB.
 *    Identity is verified purely through the cryptographic signature of the token.
 * 2. Role-Based Access Control (RBAC):
 *    Ensures endpoints are restricted to specific authorized roles.
 */

// All routes in this router require authentication via verifyAuth middleware
router.use(verifyAuth);

/**
 * GET /api/protected/profile
 * Requires valid JWT. Demonstrates stateless authenticated access.
 */
router.get('/profile', (req, res) => {
  const fullUser = findUserById(req.user.id);

  return res.status(200).json({
    success: true,
    message: 'Protected resource accessed successfully via valid JWT token.',
    accessTimestamp: new Date().toISOString(),
    authMechanism: 'Stateless JWT (HMAC-SHA256)',
    user: {
      id: req.user.id,
      email: req.user.email,
      name: req.user.name,
      role: req.user.role,
      department: fullUser?.department || 'Engineering',
      semester: fullUser?.semester || null
    },
    tokenClaims: {
      issuedAt: new Date(req.user.tokenIssuedAt * 1000).toLocaleString(),
      expiresAt: new Date(req.user.tokenExpiresAt * 1000).toLocaleString(),
      timeRemainingSeconds: Math.max(0, req.user.tokenExpiresAt - Math.floor(Date.now() / 1000))
    }
  });
});

/**
 * GET /api/protected/student
 * Requires authenticated user with 'student' or 'admin' role.
 */
router.get('/student', requireRole(['student', 'admin']), (req, res) => {
  const fullUser = findUserById(req.user.id);

  return res.status(200).json({
    success: true,
    message: 'Student Academic Portal: Authorization Granted.',
    academicData: {
      studentId: `STU-2026-${req.user.id.padStart(4, '0')}`,
      gpa: '3.92',
      enrolledCourses: fullUser?.enrolledCourses || ['Full Stack Web Architecture', 'Cryptography & Network Security'],
      advisor: 'Dr. Alan Turing, Professor of Computer Science',
      libraryClearance: 'Verified Active'
    },
    authorizedUser: req.user.name,
    role: req.user.role
  });
});

/**
 * GET /api/protected/admin
 * Requires authenticated user with 'admin' role.
 * If a 'student' attempts access, returns HTTP 403 Forbidden!
 */
router.get('/admin', requireRole(['admin']), (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'Faculty Administration Console: Administrative Privileges Confirmed.',
    securityAudit: {
      activeTokensCount: 28,
      jwtAlgorithm: 'HS256',
      tokenExpiryPolicy: '15 Minutes Rolling',
      corsPolicy: 'Strict Origin Whitelist',
      passwordEncryption: 'Bcrypt with 10 Salt Rounds',
      serverUptime: `${Math.round(process.uptime())} seconds`
    },
    authorizedAdmin: req.user.name
  });
});

export default router;
