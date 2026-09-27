import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { loginApi, verifySessionApi } from '../services/api';

/**
 * ============================================================================
 * AUTHENTICATION CONTEXT (Experiment 3: JWT Authentication)
 * ============================================================================
 * Concepts:
 * 1. Global Authentication State:
 *    Centralizes user identity, JWT token, and login/logout handlers without prop drilling.
 * 2. Token Storage with sessionStorage:
 *    Keeps the token isolated to the current browser tab session.
 * 3. Token Hydration & Server-Side Verification:
 *    Restores session on reload, but checks validity against GET /api/auth/me!
 */

const AuthContext = createContext(null);

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

/**
 * Lightweight Client-Side JWT Parser (For Display Only)
 * NOTE: Decoding does NOT verify the signature. Verification happens on the server.
 */
export function parseJwt(token) {
  if (!token || typeof token !== 'string') return null;
  try {
    const segments = token.split('.');
    if (segments.length !== 3) return null;

    const base64Decode = (str) => {
      const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
      const pad = base64.length % 4;
      const padded = pad ? base64 + '='.repeat(4 - pad) : base64;
      return decodeURIComponent(
        atob(padded)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
    };

    const header = JSON.parse(base64Decode(segments[0]));
    const payload = JSON.parse(base64Decode(segments[1]));
    const signature = segments[2];

    return {
      header,
      payload,
      signature,
      rawParts: {
        header: segments[0],
        payload: segments[1],
        signature: segments[2]
      }
    };
  } catch (err) {
    console.warn('Failed to decode JWT string:', err);
    return null;
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => sessionStorage.getItem(TOKEN_KEY) || null);
  const [user, setUser] = useState(() => {
    try {
      const stored = sessionStorage.getItem(USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState(true);
  const [sessionNotice, setSessionNotice] = useState(null);

  // Logout handler
  const logout = useCallback((reason = null) => {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
    if (reason) {
      setSessionNotice(reason);
    }
  }, []);

  // Listen for automatic token expiration events from api.js
  useEffect(() => {
    const handleAuthExpired = (event) => {
      logout(event.detail?.message || 'Your session has expired. Please log in again.');
    };

    window.addEventListener('auth:expired', handleAuthExpired);
    return () => window.removeEventListener('auth:expired', handleAuthExpired);
  }, [logout]);

  // Session Hydration: Verify stored token on initial mount
  useEffect(() => {
    async function restoreSession() {
      const storedToken = sessionStorage.getItem(TOKEN_KEY);
      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      // 1. Client-side sanity check: is token structure valid?
      const parsed = parseJwt(storedToken);
      if (!parsed) {
        logout('Invalid session token detected. Please log in again.');
        setIsLoading(false);
        return;
      }

      // 2. Check if expired according to claims
      if (parsed.payload?.exp && parsed.payload.exp * 1000 < Date.now()) {
        logout('Session token has expired. Please log in again.');
        setIsLoading(false);
        return;
      }

      // 3. Contact backend to perform actual cryptographic signature verification!
      try {
        const response = await verifySessionApi(storedToken);
        if (response.ok && response.data?.user) {
          setUser(response.data.user);
          setToken(storedToken);
        } else {
          logout('Session verification failed on server. Please log in again.');
        }
      } catch (err) {
        console.error('Session restoration error:', err);
      } finally {
        setIsLoading(false);
      }
    }

    restoreSession();
  }, [logout]);

  // Login handler
  const login = async (email, password) => {
    setSessionNotice(null);
    const result = await loginApi(email, password);

    if (result.ok && result.data?.token) {
      const { token: newToken, user: newUser } = result.data;

      // Store in sessionStorage (Session persistence for this browser tab)
      sessionStorage.setItem(TOKEN_KEY, newToken);
      sessionStorage.setItem(USER_KEY, JSON.stringify(newUser));

      setToken(newToken);
      setUser(newUser);

      return { success: true, user: newUser };
    }

    return {
      success: false,
      error: result.data?.error || 'Authentication failed. Please check credentials.',
      code: result.data?.code || 'AUTH_FAILED'
    };
  };

  // Helper to clear any session expiry banner
  const clearSessionNotice = () => setSessionNotice(null);

  const value = {
    user,
    token,
    decodedToken: parseJwt(token),
    isAuthenticated: Boolean(token && user),
    isLoading,
    sessionNotice,
    clearSessionNotice,
    login,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an <AuthProvider>');
  }
  return context;
}
