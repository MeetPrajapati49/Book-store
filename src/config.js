// Environment-aware configuration
// This module handles API base URL initialization with environment safety

const API_BASE_URL = (() => {
  // In development, allow fallback to localhost
  if (import.meta.env.DEV) {
    const url = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/'
    if (!import.meta.env.VITE_API_BASE_URL) {
      console.warn('VITE_API_BASE_URL environment variable is not set. Using fallback: http://localhost:5000/api/')
    }
    console.log('[Config] API_BASE =', url)
    return url
  }
  
  // In production, require VITE_API_BASE_URL to be set
  if (import.meta.env.PROD) {
    if (!import.meta.env.VITE_API_BASE_URL) {
      const errorMsg = 'VITE_API_BASE_URL environment variable is required for production builds'
      console.error(errorMsg)
      throw new Error(errorMsg)
    }
    return import.meta.env.VITE_API_BASE_URL
  }

  // Fallback (should not reach here)
  return 'http://localhost:5000/api/'
})()

export const API_BASE = API_BASE_URL
