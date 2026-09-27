import bcrypt from 'bcryptjs';

/**
 * ============================================================================
 * MOCK DATABASE / IN-MEMORY USER STORE (Experiment 3: JWT + RBAC)
 * ============================================================================
 * Concepts Demonstrated:
 * 1. Secure Password Storage: Passwords are NEVER stored as plain text.
 *    Bcrypt generates a 60-character salted hash with 10 salt rounds.
 * 2. Role-Based Identity: Users carry specific roles ('admin', 'editor', 'viewer')
 *    encoded as claims in the generated JWT.
 */

// Generate bcrypt salt hashes for demo credentials
const adminPasswordHash = bcrypt.hashSync('admin123', 10);
const editorPasswordHash = bcrypt.hashSync('editor123', 10);
const viewerPasswordHash = bcrypt.hashSync('viewer123', 10);
const studentPasswordHash = bcrypt.hashSync('student123', 10);

export const users = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@example.com',
    passwordHash: adminPasswordHash,
    role: 'admin',
    department: 'System Architecture & Security',
    status: 'active',
    lastLogin: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Editor User',
    email: 'editor@example.com',
    passwordHash: editorPasswordHash,
    role: 'editor',
    department: 'Content & Publishing Team',
    status: 'active',
    lastLogin: new Date().toISOString()
  },
  {
    id: '3',
    name: 'Viewer User',
    email: 'viewer@example.com',
    passwordHash: viewerPasswordHash,
    role: 'viewer',
    department: 'General Audience / Research',
    status: 'active',
    lastLogin: new Date().toISOString()
  },
  // Backward compatibility user
  {
    id: '4',
    name: 'Demo Student',
    email: 'student@example.com',
    passwordHash: studentPasswordHash,
    role: 'student',
    department: 'Computer Science & Engineering',
    status: 'active',
    enrolledCourses: ['CS-401 Full Stack Engineering', 'CS-405 Network Security'],
    lastLogin: new Date().toISOString()
  }
];

export function findUserByEmail(email) {
  if (!email) return null;
  return users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim()) || null;
}

export function findUserById(id) {
  if (!id) return null;
  return users.find((u) => String(u.id) === String(id)) || null;
}

export function getAllUsersSanitized() {
  return users.map(({ id, name, email, role, department, status, lastLogin }) => ({
    id,
    name,
    email,
    role,
    department,
    status,
    lastLogin
  }));
}
