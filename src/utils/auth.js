/**
 * Authentication utility module
 * Centralizes JWT token management and Authorization header generation
 */

/**
 * Retrieves the JWT token from localStorage
 * @returns {string|null} The JWT token or null if not found
 */
export function getAuthToken() {
  return localStorage.getItem('token');
}

/**
 * Returns an object containing Authorization header with Bearer token
 * @returns {object} Headers object with Authorization and Content-Type
 */
export function getAuthHeaders() {
  const token = getAuthToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

/**
 * Checks if a valid token exists in localStorage
 * @returns {boolean} True if authenticated, false otherwise
 */
export function isAuthenticated() {
  return getAuthToken() !== null;
}

/**
 * Clears authentication data from localStorage
 */
export function clearAuth() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}
