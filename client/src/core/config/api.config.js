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
