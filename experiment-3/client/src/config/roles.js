/**
 * ============================================================================
 * CENTRALIZED RBAC PERMISSIONS CONFIGURATION (Experiment 3: RBAC Module)
 * ============================================================================
 * Concepts:
 * 1. Decoupled Permissions:
 *    Instead of hardcoding `if (user.role === 'admin')` throughout components,
 *    we map roles to granular permissions. This makes the security policy
 *    scalable and easily configurable.
 * 2. Least Privilege Principle:
 *    Users only receive permissions strictly required for their operational scope:
 *    - Admin: Full system control (Read, Write, Update, Delete, Users, Settings)
 *    - Editor: Content publishing & Analytics (Read, Create, Update, Analytics)
 *    - Viewer: Read-only access (View Dashboard, View Posts)
 */

export const PERMISSIONS = {
  VIEW_DASHBOARD: 'view_dashboard',
  VIEW_POSTS: 'view_posts',
  CREATE_POST: 'create_post',
  EDIT_POST: 'edit_post',
  DELETE_POST: 'delete_post',
  VIEW_ANALYTICS: 'view_analytics',
  MANAGE_USERS: 'manage_users',
  MANAGE_SETTINGS: 'manage_settings'
};

export const ROLE_PERMISSIONS = {
  admin: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_POSTS,
    PERMISSIONS.CREATE_POST,
    PERMISSIONS.EDIT_POST,
    PERMISSIONS.DELETE_POST,
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.MANAGE_USERS,
    PERMISSIONS.MANAGE_SETTINGS
  ],
  editor: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_POSTS,
    PERMISSIONS.CREATE_POST,
    PERMISSIONS.EDIT_POST,
    PERMISSIONS.VIEW_ANALYTICS
  ],
  viewer: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_POSTS
  ],
  student: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_POSTS
  ]
};

export const ROLE_METADATA = {
  admin: {
    label: 'Admin',
    badgeClass: 'role-admin',
    description: 'Full administrative rights: user management, content deletion, and security configuration.'
  },
  editor: {
    label: 'Editor',
    badgeClass: 'role-editor',
    description: 'Content authoring and publishing rights: create, edit, and view analytics.'
  },
  viewer: {
    label: 'Viewer',
    badgeClass: 'role-viewer',
    description: 'Read-only access: view published articles and dashboard summaries.'
  },
  student: {
    label: 'Student',
    badgeClass: 'role-student',
    description: 'Academic student access: view courses, grades, and read posts.'
  }
};

/**
 * Reusable permission evaluation helper
 * @param {string} role User's active role
 * @param {string} permission Specific permission string
 * @returns {boolean}
 */
export function hasPermission(role, permission) {
  if (!role || !permission) return false;
  const normalizedRole = role.toLowerCase();
  const permissionsList = ROLE_PERMISSIONS[normalizedRole] || [];
  return permissionsList.includes(permission);
}

/**
 * Check if a role can access one of the allowed roles
 * @param {string} userRole
 * @param {string[]} allowedRoles
 * @returns {boolean}
 */
export function isRoleAllowed(userRole, allowedRoles = []) {
  if (!userRole) return false;
  const normalizedUserRole = userRole.toLowerCase();
  const normalizedAllowed = allowedRoles.map((r) => r.toLowerCase());
  return normalizedAllowed.includes(normalizedUserRole);
}
