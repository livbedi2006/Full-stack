import express from 'express';
import { verifyAuth } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/authorize.js';
import { findUserById, getAllUsersSanitized } from '../data/users.js';
import { getPosts, createPost, updatePost, deletePost } from '../data/posts.js';

const router = express.Router();

/**
 * ============================================================================
 * PROTECTED API ROUTES (Experiment 3: JWT Verification & RBAC Module)
 * ============================================================================
 * Concepts:
 * 1. Authentication Check (verifyAuth): Validates incoming JWT signature and expiry.
 * 2. Authorization Check (authorizeRoles): Enforces role-based permissions (admin, editor, viewer).
 * 3. HTTP 403 vs 401: Proper separation of unauthenticated vs unauthorized status.
 */

// All routes require an authenticated session
router.use(verifyAuth);

/**
 * GET /api/protected/dashboard
 * Allowed: admin, editor, viewer
 * Returns role-tailored dashboard stats.
 */
router.get('/dashboard', authorizeRoles('admin', 'editor', 'viewer', 'student'), (req, res) => {
  const role = req.user.role.toLowerCase();
  const allPosts = getPosts();

  let roleSummary = {};
  if (role === 'admin') {
    roleSummary = {
      level: 'Full Administrative Authority',
      totalUsers: getAllUsersSanitized().length,
      totalPosts: allPosts.length,
      pendingApprovals: 1,
      systemHealth: '100% Operational',
      auditCapabilities: 'Enabled'
    };
  } else if (role === 'editor') {
    roleSummary = {
      level: 'Editorial & Content Publishing Authority',
      totalPosts: allPosts.length,
      publishedPosts: allPosts.filter((p) => p.status === 'published').length,
      draftPosts: allPosts.filter((p) => p.status === 'draft').length,
      canPublish: true,
      canDelete: false
    };
  } else {
    // viewer
    roleSummary = {
      level: 'Read-Only Viewer Access',
      availablePosts: allPosts.filter((p) => p.status === 'published').length,
      canPublish: false,
      canDelete: false,
      note: 'Viewer privileges permit reading content without authoring or configuration controls.'
    };
  }

  return res.status(200).json({
    success: true,
    message: `Dashboard data loaded for role: ${req.user.role.toUpperCase()}`,
    user: req.user,
    roleSummary
  });
});

/**
 * GET /api/protected/posts
 * Allowed: admin, editor, viewer
 */
router.get('/posts', authorizeRoles('admin', 'editor', 'viewer', 'student'), (req, res) => {
  const postsList = getPosts();
  return res.status(200).json({
    success: true,
    total: postsList.length,
    posts: postsList,
    userRole: req.user.role
  });
});

/**
 * POST /api/protected/posts
 * Allowed: admin, editor
 * Viewer calling this endpoint receives HTTP 403 Forbidden!
 */
router.post('/posts', authorizeRoles('admin', 'editor'), (req, res) => {
  const { title, content, status } = req.body || {};

  if (!title || !title.trim() || !content || !content.trim()) {
    return res.status(400).json({
      success: false,
      error: 'Post title and content are required fields.'
    });
  }

  const newPost = createPost({
    title,
    content,
    status: status || 'published',
    author: req.user.name,
    authorRole: req.user.role
  });

  return res.status(201).json({
    success: true,
    message: 'Post created successfully via authorized role.',
    post: newPost
  });
});

/**
 * PUT /api/protected/posts/:id
 * Allowed: admin, editor
 */
router.put('/posts/:id', authorizeRoles('admin', 'editor'), (req, res) => {
  const { id } = req.params;
  const { title, content, status } = req.body || {};

  const updated = updatePost(id, {
    ...(title ? { title: title.trim() } : {}),
    ...(content ? { content: content.trim() } : {}),
    ...(status ? { status } : {})
  });

  if (!updated) {
    return res.status(404).json({
      success: false,
      error: `Post with ID "${id}" was not found.`
    });
  }

  return res.status(200).json({
    success: true,
    message: 'Post updated successfully.',
    post: updated
  });
});

/**
 * DELETE /api/protected/posts/:id
 * Allowed: admin ONLY!
 * Editor and Viewer calling this endpoint receive HTTP 403 Forbidden!
 */
router.delete('/posts/:id', authorizeRoles('admin'), (req, res) => {
  const { id } = req.params;
  const success = deletePost(id);

  if (!success) {
    return res.status(404).json({
      success: false,
      error: `Post with ID "${id}" was not found.`
    });
  }

  return res.status(200).json({
    success: true,
    message: `Post "${id}" permanently deleted by Admin authority.`,
    deletedId: id
  });
});

/**
 * GET /api/protected/analytics
 * Allowed: admin, editor
 * Viewer receives HTTP 403 Forbidden!
 */
router.get('/analytics', authorizeRoles('admin', 'editor'), (req, res) => {
  const allPosts = getPosts();

  return res.status(200).json({
    success: true,
    message: 'Analytics resource accessed by authorized role.',
    analytics: {
      totalPosts: allPosts.length,
      publishedPosts: allPosts.filter((p) => p.status === 'published').length,
      draftPosts: allPosts.filter((p) => p.status === 'draft').length,
      totalViews: 14820,
      monthlyEngagementRate: '18.4%',
      platformDistribution: {
        twitter: 8,
        linkedin: 12,
        instagram: 6,
        facebook: 4
      }
    },
    authorizedRole: req.user.role
  });
});

/**
 * GET /api/protected/users
 * Allowed: admin ONLY!
 * Editor and Viewer receive HTTP 403 Forbidden!
 */
router.get('/users', authorizeRoles('admin'), (req, res) => {
  const userList = getAllUsersSanitized();

  return res.status(200).json({
    success: true,
    message: 'Administrative user management roster retrieved.',
    totalUsers: userList.length,
    users: userList
  });
});

/**
 * GET /api/protected/settings
 * Allowed: admin ONLY!
 * Editor and Viewer receive HTTP 403 Forbidden!
 */
router.get('/settings', authorizeRoles('admin'), (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'System Security Configuration loaded for Admin.',
    settings: {
      rbacPolicy: 'Strict Least Privilege',
      jwtAlgorithm: 'HS256',
      tokenExpiryDuration: '15 Minutes',
      sessionStorageAllowed: true,
      cookieFallback: 'HttpOnly Secure SameSite=Strict',
      rateLimiting: '100 requests per 15 minutes',
      auditLogging: 'Active',
      corsWhitelist: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175']
    }
  });
});

/**
 * Existing Endpoints (Preserved for Backward Compatibility)
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
      department: fullUser?.department || 'Engineering'
    },
    tokenClaims: {
      issuedAt: new Date(req.user.tokenIssuedAt * 1000).toLocaleString(),
      expiresAt: new Date(req.user.tokenExpiresAt * 1000).toLocaleString(),
      timeRemainingSeconds: Math.max(0, req.user.tokenExpiresAt - Math.floor(Date.now() / 1000))
    }
  });
});

router.get('/student', authorizeRoles('student', 'admin', 'editor'), (req, res) => {
  const fullUser = findUserById(req.user.id);

  return res.status(200).json({
    success: true,
    message: 'Student Academic Portal: Authorization Granted.',
    academicData: {
      studentId: `STU-2026-${String(req.user.id).padStart(4, '0')}`,
      gpa: '3.92',
      enrolledCourses: fullUser?.enrolledCourses || ['Full Stack Web Architecture', 'Network Security'],
      advisor: 'Dr. Alan Turing, Professor of Computer Science',
      libraryClearance: 'Verified Active'
    },
    authorizedUser: req.user.name,
    role: req.user.role
  });
});

router.get('/admin', authorizeRoles('admin'), (req, res) => {
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
