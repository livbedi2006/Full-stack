import express from 'express';
import bcrypt from 'bcryptjs';
import { findUserByEmail } from '../data/users.js';
import { generateToken } from '../utils/token.js';
import { verifyAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * ============================================================================
 * AUTHENTICATION ROUTES (Experiment 3: JWT)
 * ============================================================================
 */

/**
 * POST /api/auth/login
 * Public endpoint to authenticate user and issue signed JWT.
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};

    // 1. Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Both email and password are required to log in.',
        code: 'MISSING_CREDENTIALS'
      });
    }

    // 2. Find user by email
    const user = findUserByEmail(email);

    // 3. Security best practice: Constant-time generic error
    // Do NOT reveal whether email or password specifically was invalid!
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials. Please verify your email and password.',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // 4. Compare bcrypt password hash
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials. Please verify your email and password.',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // 5. Generate signed JWT token
    const token = generateToken(user);

    // 6. Return success response (never expose passwordHash or secret)
    return res.status(200).json({
      success: true,
      message: 'Authentication successful. JWT token issued.',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        department: user.department
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({
      success: false,
      error: 'An internal server error occurred while processing authentication.',
      code: 'SERVER_ERROR'
    });
  }
});

/**
 * GET /api/auth/me
 * Protected verification endpoint to validate an active session token.
 */
router.get('/me', verifyAuth, (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'Token verified successfully. Active session confirmed.',
    user: req.user
  });
});

export default router;
