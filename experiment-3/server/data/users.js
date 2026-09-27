import bcrypt from 'bcryptjs';

/**
 * ============================================================================
 * MOCK DATABASE / IN-MEMORY USER STORE (Experiment 3: JWT Authentication)
 * ============================================================================
 * Concepts Demonstrated:
 * 1. Secure Password Storage: Passwords are NEVER stored as plain text.
 *    Bcrypt generates a 60-character salted hash with 10 salt rounds.
 * 2. Role-Based Identity: Users carry specific roles ('student', 'admin')
 *    encoded as claims in the generated JWT.
 */

// Generate bcrypt salt hashes for demo credentials
const studentPasswordHash = bcrypt.hashSync('student123', 10);
const adminPasswordHash = bcrypt.hashSync('admin123', 10);

export const users = [
  {
    id: '1',
    name: 'Demo Student',
    email: 'student@example.com',
    passwordHash: studentPasswordHash,
    role: 'student',
    enrolledCourses: ['CS-401 Full Stack Engineering', 'CS-405 Network Security', 'CS-408 Distributed Systems'],
    semester: '6th Semester',
    department: 'Computer Science & Engineering'
  },
  {
    id: '2',
    name: 'Faculty Admin',
    email: 'admin@example.com',
    passwordHash: adminPasswordHash,
    role: 'admin',
    department: 'Department of Computer Science',
    permissions: ['all_access', 'manage_users', 'audit_logs']
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
