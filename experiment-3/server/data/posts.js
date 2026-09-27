/**
 * In-Memory Mock Posts Data for RBAC Demonstration
 */
export let posts = [
  {
    id: 'post-101',
    title: 'Stateless Authentication with JWT',
    content: 'JSON Web Tokens provide cryptographically signed claims without requiring centralized session state in databases.',
    author: 'Admin User',
    authorRole: 'admin',
    status: 'published',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString()
  },
  {
    id: 'post-102',
    title: 'Role-Based Access Control Design Patterns',
    content: 'Decoupling roles from concrete permissions allows applications to evolve access levels flexibly without rewiring route guards.',
    author: 'Editor User',
    authorRole: 'editor',
    status: 'published',
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString()
  },
  {
    id: 'post-103',
    title: 'Cryptographic Integrity in Modern Web APIs',
    content: 'HMAC-SHA256 ensures payload tampering is detected immediately during server-side signature verification.',
    author: 'Editor User',
    authorRole: 'editor',
    status: 'draft',
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString()
  }
];

export function getPosts() {
  return [...posts];
}

export function createPost({ title, content, author, authorRole, status = 'published' }) {
  const newPost = {
    id: `post-${Date.now()}`,
    title: title.trim(),
    content: content.trim(),
    author: author || 'Authorized User',
    authorRole: authorRole || 'editor',
    status,
    createdAt: new Date().toISOString()
  };
  posts = [newPost, ...posts];
  return newPost;
}

export function updatePost(id, updates) {
  const index = posts.findIndex((p) => p.id === id);
  if (index === -1) return null;
  posts[index] = {
    ...posts[index],
    ...updates,
    id,
    updatedAt: new Date().toISOString()
  };
  return posts[index];
}

export function deletePost(id) {
  const index = posts.findIndex((p) => p.id === id);
  if (index === -1) return false;
  posts = posts.filter((p) => p.id !== id);
  return true;
}
