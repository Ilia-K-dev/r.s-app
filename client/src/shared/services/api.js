import axios from 'axios'; //correct

import { auth } from '../../core/config/firebase';
import logger from './logger'; // Assuming logger utility exists

/**
 * @desc Centralized Axios instance for making API calls to the backend.
 * Configured with a base URL and default timeout.
 */
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3000/api',
  timeout: 10000, // Set a default timeout of 10 seconds
});

/**
 * @desc Axios request interceptor to automatically attach the Firebase Auth token to outgoing requests.
 */
api.interceptors.request.use(async config => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  // Log request in development
  if (process.env.NODE_ENV === 'development') {
      logger.info(`API Request: ${config.method.toUpperCase()} ${config.url}`, { params: config.params, data: config.data });
  }
  return config;
}, error => {
  if (process.env.NODE_ENV === 'development') {
    logger.error('API Request Error:', error.message, { config: error.config });
  }
  return Promise.reject(error);
});

/**
 * @desc Axios response interceptor for standardized error handling and token refresh.
 * Extracts user-friendly messages, logs errors, and retries requests on 401 errors after token refresh.
 */
api.interceptors.response.use(
  response => {
    // Log successful response in development
    if (process.env.NODE_ENV === 'development') {
        logger.info(`API Response: ${response.config.method.toUpperCase()} ${response.config.url} ${response.status}`, { data: response.data });
    }
    return response;
  },
  async error => { // Make the error handler async
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

    // Extract user-friendly message from server response (existing logic)
    const message = error.response?.data?.message || error.message || 'An unexpected error occurred.';
    // Log the full error for debugging (existing logic)
    if (process.env.NODE_ENV === 'development') {
        logger.error('API Error:', error.response?.data || error.message, { status: error.response?.status, config: error.config });
    }
    // Create a new Error object with the user-friendly message (existing logic)
    const clientError = new Error(message);
    // Optionally attach original error details for further handling in hooks/components (existing logic)
    clientError.originalError = error;

    return Promise.reject(clientError);
  }
);


/**
 * @desc API service methods specifically for Receipt operations.
 */
export const receiptApi = {
  /**
   * @desc Uploads a receipt document via the backend API.
   * @param {FormData} formData - FormData containing the document file and type.
   * @returns {Promise<object>} - A promise that resolves with the API response data.
   * @throws {Error} - Throws an error if the API request fails.
   */
  uploadReceipt: async formData => {
    try {
      const response = await api.post('/receipts', formData);
      return response.data;
    } catch (error) {
      throw error; // Rethrow the error caught by the interceptor
    }
  },
  /**
   * @desc Fetches receipts with filtering and pagination via the backend API.
   * @param {object} [filters] - Filters and pagination options.
   * @returns {Promise<object>} - A promise that resolves with the API response data.
   * @throws {Error} - Throws an error if the API request fails.
   */
  getReceipts: async filters => {
    try {
      const response = await api.get('/receipts', { params: filters });
      return response.data;
    } catch (error) {
      throw error; // Rethrow the error caught by the interceptor
    }
  },
  /**
   * @desc Fetches a single receipt by ID via the backend API.
   * @param {string} id - The ID of the receipt.
   * @returns {Promise<object>} - A promise that resolves with the API response data.
   * @throws {Error} - Throws an error if the API request fails.
   */
  getReceiptById: async id => {
    try {
      const response = await api.get(`/receipts/${id}`);
      return response.data;
    } catch (error) {
      throw error; // Rethrow the error caught by the interceptor
    }
  },
  // Add other receipt-related API methods here (create, update, delete, correct)
  /**
   * @desc Creates a new receipt via the backend API.
   * @param {object} receiptData - The data for the new receipt.
   * @returns {Promise<object>} - A promise that resolves with the API response data.
   * @throws {Error} - Throws an error if the API request fails.
   */
  createReceipt: async receiptData => {
    try {
      const response = await api.post('/receipts', receiptData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
   /**
   * @desc Updates an existing receipt via the backend API.
   * @param {string} id - The ID of the receipt to update.
   * @param {object} receiptData - The updated data for the receipt.
   * @returns {Promise<object>} - A promise that resolves with the API response data.
   * @throws {Error} - Throws an error if the API request fails.
   */
  updateReceipt: async (id, receiptData) => {
    try {
      const response = await api.put(`/receipts/${id}`, receiptData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
   /**
   * @desc Deletes a receipt via the backend API.
   * @param {string} id - The ID of the receipt to delete.
   * @returns {Promise<void>} - A promise that resolves when the deletion is complete.
   * @throws {Error} - Throws an error if the API request fails.
   */
  deleteReceipt: async id => {
    try {
      const response = await api.delete(`/receipts/${id}`);
      return response.data; // Or response.status if backend returns 204
    } catch (error) {
      throw error;
    }
  },
   /**
   * @desc Submits corrected receipt data via the backend API.
   * @param {string} id - The ID of the receipt to correct.
   * @param {object} correctedData - The corrected data.
   * @returns {Promise<object>} - A promise that resolves with the API response data.
   * @throws {Error} - Throws an error if the API request fails.
   */
  correctReceipt: async (id, correctedData) => {
    try {
      const response = await api.put(`/receipts/${id}/correct`, correctedData); // Assuming /correct endpoint
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

/**
 * @desc API service methods specifically for Category operations.
 */
export const categoryApi = {
  /**
   * @desc Fetches categories via the backend API.
   * @returns {Promise<object>} - A promise that resolves with the API response data.
   * @throws {Error} - Throws an error if the API request fails.
   */
  getCategories: async () => {
    try {
      const response = await api.get('/categories');
      return response.data;
    } catch (error) {
      throw error; // Rethrow the error caught by the interceptor
    }
  },
  /**
   * @desc Creates a new category via the backend API.
   * @param {object} data - The data for the new category.
   * @returns {Promise<object>} - A promise that resolves with the API response data.
   * @throws {Error} - Throws an error if the API request fails.
   */
  createCategory: async data => {
    try {
      const response = await api.post('/categories', data);
      return response.data;
    } catch (error) {
      throw error; // Rethrow the error caught by the interceptor
    }
  },
  // Add other category-related API methods here (update, delete)
   /**
   * @desc Updates an existing category via the backend API.
   * @param {string} id - The ID of the category to update.
   * @param {object} data - The updated data for the category.
   * @returns {Promise<object>} - A promise that resolves with the API response data.
   * @throws {Error} - Throws an error if the API request fails.
   */
  updateCategory: async (id, data) => {
    try {
      const response = await api.put(`/categories/${id}`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
   /**
   * @desc Deletes a category via the backend API.
   * @param {string} id - The ID of the category to delete.
   * @returns {Promise<void>} - A promise that resolves when the deletion is complete.
   * @throws {Error} - Throws an error if the API request fails.
   */
  deleteCategory: async id => {
    try {
      const response = await api.delete(`/categories/${id}`);
      return response.data; // Or response.status if backend returns 204
    } catch (error) {
      throw error;
    }
  },
};

// Add other API service definitions here (inventoryApi, analyticsApi, exportApi, etc.)
/**
 * @desc API service methods specifically for Inventory operations.
 */
export const inventoryApi = {
  /**
   * @desc Fetches inventory items with filtering and pagination via the backend API.
   * @param {object} [filters] - Filters and pagination options.
   * @returns {Promise<object>} - A promise that resolves with the API response data.
   * @throws {Error} - Throws an error if the API request fails.
   */
  getInventory: async filters => {
    try {
      const response = await api.get('/inventory', { params: filters });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  /**
   * @desc Adds a new inventory item via the backend API.
   * @param {object} itemData - The data for the new item.
   * @returns {Promise<object>} - A promise that resolves with the API response data.
   * @throws {Error} - Throws an error if the API request fails.
   */
  addItem: async itemData => {
    try {
      const response = await api.post('/inventory', itemData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  /**
   * @desc Updates an existing inventory item via the backend API.
   * @param {string} id - The ID of the item to update.
   * @param {object} updateData - The data to update the item with.
   * @returns {Promise<object>} - A promise that resolves with the API response data.
   * @throws {Error} - Throws an error if the API request fails.
   */
  updateItem: async (id, updateData) => {
    try {
      const response = await api.put(`/inventory/${id}`, updateData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  /**
   * @desc Deletes an inventory item via the backend API.
   * @param {string} id - The ID of the item to delete.
   * @returns {Promise<void>} - A promise that resolves when the deletion is complete.
   * @throws {Error} - Throws an error if the API request fails.
   */
  deleteItem: async id => {
    try {
      const response = await api.delete(`/inventory/${id}`);
      return response.data; // Or response.status if backend returns 204
    } catch (error) {
      throw error;
    }
  },
  /**
   * @desc Updates the stock level for an inventory item via the backend API.
   * @param {string} id - The ID of the item to update stock for.
   * @param {object} updateData - The stock update data (e.g., { quantity: 10, type: 'purchase' }).
   * @returns {Promise<object>} - A promise that resolves with the API response data.
   * @throws {Error} - Throws an error if the API request fails.
   */
  updateStock: async (id, updateData) => {
    try {
      const response = await api.put(`/inventory/${id}/stock`, updateData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  /**
   * @desc Fetches stock movement history for a user via the backend API.
   * @param {object} [filters] - Filters for stock movements.
   * @returns {Promise<object>} - A promise that resolves with the API response data.
   * @throws {Error} - Throws an error if the API request fails.
   */
  getStockMovements: async filters => {
    try {
      const response = await api.get('/inventory/movements', { params: filters });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  /**
   * @desc Creates a new stock movement record via the backend API.
   * @param {object} movementData - The data for the new stock movement.
   * @returns {Promise<object>} - A promise that resolves with the API response data.
   * @throws {Error} - Throws an error if the API request fails.
   */
  createStockMovement: async movementData => {
    try {
      const response = await api.post('/inventory/movements', movementData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  /**
   * @desc Fetches low stock alerts for a user via the backend API.
   * @returns {Promise<object>} - A promise that resolves with the API response data.
   * @throws {Error} - Throws an error if the API request fails.
   */
  getLowStockAlerts: async () => {
    try {
      const response = await api.get('/inventory/low-stock');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

/**
 * @desc API service methods specifically for Analytics operations.
 */
export const analyticsApi = {
  /**
   * @desc Fetches spending analytics data via the backend API.
   * @param {object} [filters] - Filters for spending analysis (startDate, endDate, groupBy).
   * @returns {Promise<object>} - A promise that resolves with the API response data.
   * @throws {Error} - Throws an error if the API request fails.
   */
  getSpendingAnalytics: async filters => {
    try {
      const response = await api.get('/analytics/spending', { params: filters });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  /**
   * @desc Fetches inventory analytics data via the backend API.
   * @returns {Promise<object>} - A promise that resolves with the API response data.
   * @throws {Error} - Throws an error if the API request fails.
   */
  getInventoryAnalytics: async () => {
    try {
      const response = await api.get('/analytics/inventory');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  /**
   * @desc Fetches budget progress data via the backend API.
   * @param {object} [filters] - Filters for budget progress (period, categoryId).
   * @returns {Promise<object>} - A promise that resolves with the API response data.
   * @throws {Error} - Throws an error if the API request fails.
   */
  getBudgetProgress: async filters => {
    try {
      const response = await api.get('/analytics/budget', { params: filters });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  // Add other analytics-related API methods here (price, vendor, category, dashboard, reports)
   /**
   * @desc Fetches price analytics for a product via the backend API.
   * @param {string} productId - The ID of the product.
   * @param {object} [filters] - Filters for price history (startDate, endDate).
   * @returns {Promise<object>} - A promise that resolves with the API response data.
   * @throws {Error} - Throws an error if the API request fails.
   */
  getPriceAnalytics: async (productId, filters) => {
    try {
      const response = await api.get(`/analytics/price/${productId}`, { params: filters });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
   /**
   * @desc Fetches vendor analysis data via the backend API.
   * @param {object} [filters] - Filters for vendor analysis (vendorIds, productIds).
   * @returns {Promise<object>} - A promise that resolves with the API response data.
   * @throws {Error} - Throws an error if the API request fails.
   */
  getVendorAnalysis: async filters => {
    try {
      const response = await api.get('/analytics/vendors', { params: filters });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
   /**
   * @desc Fetches category analysis data via the backend API.
   * @param {string} categoryId - The ID of the category.
   * @param {object} [filters] - Filters for category analysis (startDate, endDate).
   * @returns {Promise<object>} - A promise that resolves with the API response data.
   * @throws {Error} - Throws an error if the API request fails.
   */
  getCategoryAnalysis: async (categoryId, filters) => {
    try {
      const response = await api.get(`/analytics/categories/${categoryId}`, { params: filters });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
   /**
   * @desc Fetches dashboard analytics data via the backend API.
   * @param {object} [filters] - Filters for dashboard analytics (period).
   * @returns {Promise<object>} - A promise that resolves with the API response data.
   * @throws {Error} - Throws an error if the API request fails.
   */
  getDashboardAnalytics: async filters => {
    try {
      const response = await api.get('/analytics/dashboard', { params: filters });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
   /**
   * @desc Fetches a price comparison report via the backend API.
   * @param {object} [filters] - Filters for the report (productIds, timeframe).
   * @returns {Promise<object>} - A promise that resolves with the API response data.
   * @throws {Error} - Throws an error if the API request fails.
   */
  getPriceComparisonReport: async filters => {
    try {
      const response = await api.get('/analytics/reports/price-comparison', { params: filters });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

/**
 * @desc API service methods specifically for Export operations.
 */
export const exportApi = {
  /**
   * @desc Initiates the generation of a data export file via the backend API.
   * @param {object} exportOptions - Options for the export (reportType, format, filters).
   * @returns {Promise<object>} - A promise that resolves with the API response data (including exportId and downloadUrl).
   * @throws {Error} - Throws an error if the API request fails.
   */
  generateExport: async exportOptions => {
    try {
      const response = await api.post('/exports', exportOptions);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  /**
   * @desc Downloads a previously generated export file via the backend API.
   * @param {string} exportId - The ID of the export record.
   * @returns {Promise<object>} - A promise that resolves with the file data (Blob).
   * @throws {Error} - Throws an error if the API request fails.
   */
  downloadExport: async exportId => {
    try {
      // Assuming the backend returns the file data directly
      const response = await api.get(`/exports/${exportId}`, { responseType: 'blob' }); // Request as Blob
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};


export default api;
