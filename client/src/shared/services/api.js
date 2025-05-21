/**
 * api.js
 * Last Modified: 2025-05-21 05:07:53
 * Modified By: Cline
 *
 * Purpose: Centralized API client with connection reliability
 * Changes Made: Added fallback mechanism for API URL
 */

import axios from 'axios';
import { getReliableApiUrl } from '../utils/apiConnectionTest';
import { logger } from '../utils/logger';
import { auth } from '../../core/config/firebase'; // Assuming Firebase auth is still used

// Create axios instance with reliable base URL
const api = axios.create({
  baseURL: getReliableApiUrl(),
  timeout: 10000, // Default timeout
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor
api.interceptors.request.use(
  async config => {
    // Add Firebase Auth token if user is logged in
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log requests in development
    if (process.env.NODE_ENV === 'development') {
      logger.debug(`API Request: ${config.method.toUpperCase()} ${config.url}`, { params: config.params, data: config.data });
    }
    return config;
  },
  error => {
    logger.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor
api.interceptors.response.use(
  response => {
    // Log successful response in development
    if (process.env.NODE_ENV === 'development') {
        logger.debug(`API Response: ${response.config.method.toUpperCase()} ${response.config.url} ${response.status}`, { data: response.data });
    }
    return response;
  },
  async error => {
    const originalRequest = error.config;

    // Check for 401 Unauthorized response and if it's not a retry attempt
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // Mark as retry attempt

      try {
        // Attempt to refresh the token
        const user = auth.currentUser;
        if (user) {
          const newToken = await user.getIdToken(true); // Force token refresh
          // Update the Authorization header for the original request
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          // Retry the original request with the new token
          logger.info(`Token refreshed, retrying original request: ${originalRequest.method.toUpperCase()} ${originalRequest.url}`);
          return api(originalRequest);
        }
      } catch (refreshError) {
        // If token refresh fails, log out the user or handle appropriately
        logger.error('Token refresh failed:', refreshError);
        // Optionally dispatch a logout action here
        // store.dispatch(logoutUser());
      }
    }

    // Handle connection errors with helpful messages
    if (!error.response) {
      logger.error('API Connection Error:', error.message);
      // Show a more helpful error message based on environment
      const customError = new Error(
        process.env.NODE_ENV === 'production'
          ? 'Network error. Please check your connection and try again.'
          : `API Connection Error: ${error.message}. Make sure Firebase Emulators are running.`
      );
      customError.isConnectionError = true;
      return Promise.reject(customError);
    }

    // Extract user-friendly message from server response
    const message = error.response?.data?.message || error.message || 'An unexpected error occurred.';
    // Log the full error for debugging
    logger.error('API Error:', error.response?.data || error.message, { status: error.response?.status, config: error.config });

    // Create a new Error object with the user-friendly message
    const clientError = new Error(message);
    // Optionally attach original error details for further handling in hooks/components
    clientError.originalError = error;

    return Promise.reject(clientError);
  }
);

// Export the configured axios instance
export default api;

// Note: The original api.js file contained separate exports for receiptApi, categoryApi, etc.
// This new version centralizes the axios instance. You may need to refactor
// components/hooks that used those specific exports to use the default 'api' instance
// and append the specific endpoints (e.g., api.get('/receipts')).
// Alternatively, you could re-add those specific export objects here,
// using the 'api' instance internally.
