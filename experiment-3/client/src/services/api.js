/**
 * ============================================================================
 * API SERVICE LAYER (Experiment 3: JWT Authentication)
 * ============================================================================
 * Concepts:
 * 1. Automatic Authorization Header:
 *    Reads the JWT from sessionStorage and attaches `Authorization: Bearer <token>`.
 * 2. HTTP Status Code Handling:
 *    - 200: OK / Resource Granted
 *    - 401: Unauthorized (Missing, invalid, or expired token)
 *    - 403: Forbidden (Authenticated, but insufficient role permissions)
 *    - 500: Internal Server Error
 * 3. Event-Driven Expiry:
 *    Dispatches a custom event when a 401 TOKEN_EXPIRED is detected,
 *    allowing the AuthContext to terminate the session smoothly.
 */

const API_BASE_URL = '/api';

/**
 * Core HTTP Request Wrapper
 */
async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  // If token is provided in options, use it; otherwise read from sessionStorage
  let token = options.token;
  if (token === undefined) {
    token = sessionStorage.getItem('auth_token');
  }

  // Automatically attach Bearer token if present
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const startTime = performance.now();

  try {
    const response = await fetch(url, {
      ...options,
      headers
    });

    const duration = Math.round(performance.now() - startTime);
    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = { message: await response.text() };
    }

    // Handle 401 Unauthorized (Expired or Invalid Token)
    if (response.status === 401) {
      if (data.code === 'TOKEN_EXPIRED') {
        window.dispatchEvent(
          new CustomEvent('auth:expired', {
            detail: { message: data.error || 'Your session has expired. Please log in again.' }
          })
        );
      }
    }

    return {
      ok: response.ok,
      status: response.status,
      statusText: response.statusText,
      data,
      duration
    };
  } catch (err) {
    const duration = Math.round(performance.now() - startTime);
    return {
      ok: false,
      status: 0,
      statusText: 'Network Error',
      data: {
        success: false,
        error: err.message || 'Failed to communicate with backend server. Check if server is running on port 5000.',
        code: 'NETWORK_ERROR'
      },
      duration
    };
  }
}

/**
 * Public Authentication API
 */
export async function loginApi(email, password) {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
    token: null // Public route does not send auth header
  });
}

/**
 * Token Verification API (GET /api/auth/me)
 */
export async function verifySessionApi(token) {
  return request('/auth/me', {
    method: 'GET',
    token
  });
}

/**
 * Protected Endpoints
 */
export async function fetchProfileApi(customToken) {
  return request('/protected/profile', {
    method: 'GET',
    ...(customToken !== undefined ? { token: customToken } : {})
  });
}

export async function fetchStudentPortalApi(customToken) {
  return request('/protected/student', {
    method: 'GET',
    ...(customToken !== undefined ? { token: customToken } : {})
  });
}

export async function fetchAdminConsoleApi(customToken) {
  return request('/protected/admin', {
    method: 'GET',
    ...(customToken !== undefined ? { token: customToken } : {})
  });
}

/**
 * RBAC Module Endpoints
 */
export async function fetchDashboardApi(customToken) {
  return request('/protected/dashboard', {
    method: 'GET',
    ...(customToken !== undefined ? { token: customToken } : {})
  });
}

export async function fetchPostsApi(customToken) {
  return request('/protected/posts', {
    method: 'GET',
    ...(customToken !== undefined ? { token: customToken } : {})
  });
}

export async function createPostApi(postData, customToken) {
  return request('/protected/posts', {
    method: 'POST',
    body: JSON.stringify(postData),
    ...(customToken !== undefined ? { token: customToken } : {})
  });
}

export async function updatePostApi(id, postData, customToken) {
  return request(`/protected/posts/${id}`, {
    method: 'PUT',
    body: JSON.stringify(postData),
    ...(customToken !== undefined ? { token: customToken } : {})
  });
}

export async function deletePostApi(id, customToken) {
  return request(`/protected/posts/${id}`, {
    method: 'DELETE',
    ...(customToken !== undefined ? { token: customToken } : {})
  });
}

export async function fetchAnalyticsApi(customToken) {
  return request('/protected/analytics', {
    method: 'GET',
    ...(customToken !== undefined ? { token: customToken } : {})
  });
}

export async function fetchUsersApi(customToken) {
  return request('/protected/users', {
    method: 'GET',
    ...(customToken !== undefined ? { token: customToken } : {})
  });
}

export async function fetchSettingsApi(customToken) {
  return request('/protected/settings', {
    method: 'GET',
    ...(customToken !== undefined ? { token: customToken } : {})
  });
}

