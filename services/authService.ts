// services/authService.ts
// Handles Google OAuth 2.0 authentication with the backend

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

/**
 * Start Google OAuth login flow
 * Redirects user to backend OAuth endpoint
 */
export const initiateGoogleLogin = () => {
  window.location.href = `${BACKEND_URL}/auth/google`;
};

/**
 * Handle OAuth callback - Extract token from URL
 * Called after user is redirected from Google OAuth
 */
export const handleOAuthCallback = async (): Promise<User | null> => {
  try {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    if (token) {
      // Save token to localStorage
      localStorage.setItem(TOKEN_KEY, token);
      
      // Decode JWT to get user info
      const user = decodeToken(token);
      if (user) {
        localStorage.setItem(USER_KEY, JSON.stringify(user));
        return user;
      }
    }
    return null;
  } catch (error) {
    console.error('OAuth callback error:', error);
    return null;
  }
};

/**
 * Get current authenticated user
 */
export const getCurrentUser = (): User | null => {
  try {
    const userStr = localStorage.getItem(USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

/**
 * Get stored authentication token
 */
export const getAuthToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  return !!getAuthToken();
};

/**
 * Logout user
 * Clears stored credentials
 */
export const logout = async () => {
  try {
    const token = getAuthToken();
    if (token) {
      // Call backend logout endpoint
      await fetch(`${BACKEND_URL}/auth/logout`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    }
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    // Clear local storage regardless of backend response
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }
};

/**
 * Get current user from backend using stored token
 */
export const fetchCurrentUser = async (): Promise<User | null> => {
  try {
    const token = getAuthToken();
    if (!token) return null;

    const response = await fetch(`${BACKEND_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.ok) {
      const data = await response.json();
      const user = data.user;
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      return user;
    } else if (response.status === 401) {
      // Token expired or invalid
      logout();
    }
    return null;
  } catch (error) {
    console.error('Error fetching current user:', error);
    return null;
  }
};

/**
 * Decode JWT token to extract user info
 * Note: This is a simple decode (no verification)
 * Token verification should happen on backend
 */
const decodeToken = (token: string): User | null => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const decoded = JSON.parse(atob(parts[1]));
    return {
      id: decoded.id,
      email: decoded.email,
      name: decoded.name
    };
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

/**
 * Make authenticated API request to backend
 */
export const authenticatedFetch = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> => {
  const token = getAuthToken();
  if (!token) {
    throw new Error('No authentication token found');
  }

  const headers = {
    ...options.headers,
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  return fetch(`${BACKEND_URL}${endpoint}`, {
    ...options,
    headers
  });
};

export default {
  initiateGoogleLogin,
  handleOAuthCallback,
  getCurrentUser,
  getAuthToken,
  isAuthenticated,
  logout,
  fetchCurrentUser,
  authenticatedFetch
};
