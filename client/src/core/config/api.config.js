import axios from 'axios'; //correct

import { auth } from './firebase'; //correct

// API Configuration
export const API_CONFIG = {
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000', // Default to local if environment variable is not set
  timeout: parseInt(process.env.REACT_APP_API_TIMEOUT || '30000'),
  headers: {
    'Content-Type': 'application/json',
  },
  endpoints: {
    auth: {
      login: '/auth/login',
      register: '/auth/register',
      resetPassword: '/auth/reset-password',
      verifyToken: '/auth/verify-token',
    },
    receipts: {
      base: '/receipts',
      upload: '/receipts/upload',
      getById: id => `/receipts/${id}`,
      update: id => `/receipts/${id}`,
      delete: id => `/receipts/${id}`,
    },
    reports: {
      spending: '/reports/spending',
      categories: '/reports/categories',
      monthly: '/reports/monthly',
    },
    categories: {
      base: '/categories',
      getById: id => `/categories/${id}`,
      update: id => `/categories/${id}`,
      delete: id => `/categories/${id}`,
    },
  },
};

// Create axios instance
const api = axios.create({
  baseURL: API_CONFIG.baseURL,
  timeout: API_CONFIG.timeout,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  async config => {
    // Get current user token
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  response => response.data,
  async error => {
    const originalRequest = error.config;

    if (error.response) {
      // Handle different error status codes
      switch (error.response.status) {
        case 401:
          // Token expired or invalid
          if (!originalRequest._retry) {
            originalRequest._retry = true;
            const user = auth.currentUser;
            if (user) {
              // Force token refresh
              await auth.currentUser.getIdToken(true);
              return api(originalRequest);
            }
          }
          // Redirect to login if token refresh fails
          auth.signOut();
          window.location.href = '/login';
          break;

        case 403:
          // Permission denied
          throw new Error('You do not have permission to perform this action');

        case 404:
          // Resource not found
          throw new Error('Requested resource was not found');

        case 422:
          // Validation error
          throw new Error(error.response.data.message || 'Validation failed');

        case 429:
          // Rate limit exceeded
          throw new Error('Too many requests. Please try again later');

        case 500:
          // Server error
          throw new Error('Internal server error. Please try again later');

        default:
          throw new Error('An unexpected error occurred');
      }
    }

    return Promise.reject(error);
  }
);

export default api;
