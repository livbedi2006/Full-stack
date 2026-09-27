/**
 * ============================================================================
 * BACKEND ROLE AUTHORIZATION MIDDLEWARE (Experiment 3: RBAC Module)
 * ============================================================================
 * Concepts:
 * 1. Authentication vs Authorization:
 *    - verifyAuth ensures the user has a valid signature and identity.
 *    - authorizeRoles ensures the authenticated user's role has permission
 *      to access the requested resource.
 * 2. HTTP 403 Forbidden:
 *    Returns 403 (never 401) when identity is known but privileges are insufficient.
 */

export function authorizeRoles(...allowedRoles) {
  // Support both authorizeRoles('admin', 'editor') and authorizeRoles(['admin', 'editor'])
  const roles = allowedRoles.flat();

  return (req, res, next) => {
    // 1. Confirm user is authenticated
    if (!req.user || !req.user.role) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized: Authentication required before authorization.',
        code: 'UNAUTHENTICATED'
      });
    }

    // Normalize roles to lowercase
    const userRole = req.user.role.toLowerCase();
    const normalizedAllowed = roles.map((r) => r.toLowerCase());

    // 2. Check if user's role is allowed
    if (!normalizedAllowed.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You do not have permission to perform this action.',
        error: `Forbidden: Required role [${roles.join(', ')}], but your role is '${req.user.role}'.`,
        code: 'FORBIDDEN',
        userRole: req.user.role,
        requiredRoles: roles
      });
    }

    // 3. User is authorized
    next();
  };
}

export default authorizeRoles;
