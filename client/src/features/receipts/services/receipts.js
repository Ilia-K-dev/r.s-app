import api from '../../../shared/services/api'; // Assuming shared API service
import axios from 'axios'; // Import axios for direct use in createReceipt/updateReceipt if needed for FormData
import { auth } from '../../../core/config/firebase'; // Assuming Firebase auth for token

const API_BASE_PATH = '/api/receipts';

// Get authentication token (can be moved to a shared utility if used elsewhere)
const getAuthToken = async () => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('User not authenticated');
  }
  return await user.getIdToken();
};


export const receiptApi = {
  /**
   * Uploads a new receipt.
   * @param {object} receiptData - The form data for the receipt (excluding image file).
   * @param {File} [imageFile] - The image file to upload.
   * @returns {Promise<object>} - The API response data.
   */
  createReceipt: async (receiptData, imageFile = null) => {
    const token = await getAuthToken();

    if (imageFile) {
      const formData = new FormData();
      formData.append('document', imageFile); // 'document' should match the field name in server upload middleware
      formData.append('data', JSON.stringify(receiptData)); // Add receipt data as JSON field
      formData.append('documentType', 'receipt'); // Specify document type

      const response = await api.post(`${API_BASE_PATH}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } else {
      // No image, just send JSON data (if server supports creating receipt without image)
      const response = await api.post(API_BASE_PATH, receiptData, {
         headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    }
  },

  /**
   * Fetches receipts with filtering and pagination.
   * @param {object} [options] - Options for filtering and pagination (category, dateRange, limit, startAfter, etc.).
   * @returns {Promise<object>} - Paginated list of receipts and pagination info.
   */
  getReceipts: async (options = {}) => {
    try {
      // Pass filters and pagination options as query parameters
      const response = await api.get(API_BASE_PATH, {
        params: {
          ...options
        }
      });
      return response.data; // Assuming response.data contains { receipts: [...], pagination: {...} }
    } catch (error) {
      // The API interceptor should have already processed and logged the error
      throw error; // Re-throw the error caught by the interceptor
    }
  },

  /**
   * Gets a single receipt by ID.
   * @param {string} id - The ID of the receipt.
   * @returns {Promise<object>} - The receipt data.
   */
  getReceiptById: async (id) => {
    const response = await api.get(`${API_BASE_PATH}/${id}`);
    return response.data;
  },

  /**
   * Updates an existing receipt.
   * @param {string} receiptId - The ID of the receipt to update.
   * @param {object} updateData - The update data for the receipt (excluding new image file).
   * @param {File} [newImageFile] - A new image file to upload for the receipt.
   * @returns {Promise<object>} - The API response data.
   */
  updateReceipt: async (receiptId, updateData, newImageFile = null) => {
    const token = await getAuthToken();

    if (newImageFile) {
      const formData = new FormData();
      formData.append('document', newImageFile); // 'document' should match the field name in server upload middleware
      formData.append('data', JSON.stringify(updateData)); // Add receipt data as JSON field
      formData.append('documentType', 'receipt'); // Specify document type

      const response = await api.put(`${API_BASE_PATH}/${receiptId}/upload`, formData, {
         headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } else {
      // No new image, just send JSON data
      const response = await api.put(`${API_BASE_PATH}/${receiptId}`, updateData, {
         headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    }
  },

  /**
   * Deletes a receipt by ID.
   * @param {string} receiptId - The ID of the receipt to delete.
   * @returns {Promise<object>} - The API response data.
   */
  deleteReceipt: async (receiptId) => {
    const response = await api.delete(`${API_BASE_PATH}/${receiptId}`);
    return response.data;
  },

  /**
   * Submits corrected data for a receipt.
   * @param {string} receiptId - The ID of the receipt to correct.
   * @param {object} correctedData - The corrected data.
   * @returns {Promise<object>} - The API response data.
   */
  correctReceipt: async (receiptId, correctedData) => {
    const response = await api.put(`${API_BASE_PATH}/correct/${receiptId}`, correctedData);
    return response.data;
  }
};

export default receiptApi;
