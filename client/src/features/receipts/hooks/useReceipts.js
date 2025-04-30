import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../auth/hooks/useAuth';
import { receiptApi } from '../services/receipts';
import errorHandler from '../../../shared/utils/errorHandler'; // Import the error handler utility

/**
 * @typedef {object} Receipt
 * @property {string} id - The receipt ID.
 * @property {string} userId - The ID of the user who owns the receipt.
 * @property {string} merchant - The merchant name.
 * @property {Date} date - The date of the receipt.
 * @property {number} total - The total amount of the receipt.
 * // Add other relevant receipt properties here
 */

/**
 * @typedef {object} PaginationInfo
 * @property {number} limit - The number of items per page.
 * @property {string|null} startAfter - The ID of the last item from the previous page (for cursor-based pagination).
 * @property {boolean} hasNextPage - Indicates if there are more pages.
 */

/**
 * @typedef {object} ReceiptFilters
 * @property {string} [category] - Filter by category.
 * @property {string} [merchant] - Filter by merchant name.
 * @property {string} [startDate] - Filter by start date (ISO 8601).
 * @property {string} [endDate] - Filter by end date (ISO 8601).
 * // Add other relevant filter properties here
 */

/**
 * @typedef {object} UseReceiptsReturn
 * @property {Receipt[]} receipts - Array of fetched receipts.
 * @property {boolean} loading - Loading state.
 * @property {string|null} error - Error message if fetching/mutating failed.
 * @property {PaginationInfo} pagination - Pagination information.
 * @property {function(PaginationInfo): void} setPagination - Function to update pagination state.
 * @property {ReceiptFilters} filters - Current filter state.
 * @property {function(ReceiptFilters): void} setFilters - Function to update filter state.
 * @property {function(object): Promise<void>} fetchReceipts - Function to fetch receipts with optional filters/pagination.
 * @property {function(object, File): Promise<object>} addReceipt - Function to add a new receipt.
 * @property {function(string, object, File): Promise<object>} updateReceipt - Function to update an existing receipt.
 * @property {function(string): Promise<void>} deleteReceipt - Function to delete a receipt.
 */

/**
 * @desc Custom hook for fetching, adding, updating, and deleting user receipts.
 * Manages loading, error, pagination, and filter states.
 * @returns {UseReceiptsReturn} - Object containing receipts data, state, and functions.
 */
export const useReceipts = () => {
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ limit: 10, startAfter: null, hasNextPage: true }); // Add pagination state
  const [filters, setFilters] = useState({}); // Add filters state
  const { user } = useAuth();

  /**
   * @desc Fetches receipts from the backend API with specified options.
   * Updates receipts and pagination state.
   * @param {object} [options] - Options to override current filters and pagination (e.g., { limit: 20, startAfter: 'abc', category: 'food' }).
   * @returns {Promise<void>}
   */
  const fetchReceipts = useCallback(async (options = {}) => { // Accept options for filtering/pagination
    try {
      setLoading(true);
      setError(null);

      if (!user) {
        throw new Error('User not authenticated');
      }

      // Merge default pagination and current filters with provided options
      const fetchOptions = {
          limit: pagination.limit,
          startAfter: pagination.startAfter,
          ...filters, // Include current filters
          ...options // Allow overriding filters/pagination
      };

      const response = await receiptApi.getReceipts(fetchOptions);
      setReceipts(response.data.receipts || []); // Assuming response structure is { receipts: [...], pagination: {...} }
      setPagination(prev => ({ // Update pagination state from response
          ...prev,
          startAfter: response.data.pagination.lastVisible,
          hasNextPage: response.data.pagination.hasNextPage
      }));

    } catch (err) {
      const userFriendlyMessage = errorHandler(err, 'Failed to fetch receipts.');
      setError(userFriendlyMessage);
    } finally {
      setLoading(false);
    }
  }, [user, pagination.limit, pagination.startAfter, filters]); // Add pagination and filters dependencies

  /**
   * @desc Adds a new receipt via the backend API.
   * Refreshes the receipt list after successful addition.
   * @param {object} receiptData - The data for the new receipt.
   * @param {File} [imageFile=null] - Optional image file to upload with the receipt.
   * @returns {Promise<object>} - A promise that resolves with the result from the API.
   * @throws {Error} - Throws an error if the API request fails.
   */
  const addReceipt = useCallback(async (receiptData, imageFile = null) => {
    try {
      setLoading(true);
      setError(null);

      if (!user) {
        throw new Error('User not authenticated');
      }

      const result = await receiptApi.createReceipt(receiptData, imageFile);

      // Refresh receipts list (go back to the first page to see the new receipt)
      await fetchReceipts({ startAfter: null });

      // errorHandler handles the toast internally
      // showToast('Receipt added successfully', 'success');
      return result;
    } catch (err) {
      const userFriendlyMessage = errorHandler(err, 'Failed to add receipt.');
      setError(userFriendlyMessage);
      throw err; // Re-throw for components that might need to catch
    } finally {
      setLoading(false);
    }
  }, [user, fetchReceipts]); // Add dependencies

  /**
   * @desc Updates an existing receipt via the backend API.
   * Refreshes the receipt list after successful update.
   * @param {string} receiptId - The ID of the receipt to update.
   * @param {object} receiptData - The updated data for the receipt.
   * @param {File} [imageFile=null] - Optional new image file to upload.
   * @returns {Promise<object>} - A promise that resolves with the result from the API.
   * @throws {Error} - Throws an error if the API request fails.
   */
  const updateReceipt = useCallback(async (receiptId, receiptData, imageFile = null) => {
    try {
      setLoading(true);
      setError(null);

      if (!user) {
        throw new Error('User not authenticated');
      }

      const result = await receiptApi.updateReceipt(receiptId, receiptData, imageFile);

      // Refresh receipts list (stay on the current page)
      await fetchReceipts();

      // showToast('Receipt updated successfully', 'success');
      return result;
    } catch (err) {
      const userFriendlyMessage = errorHandler(err, 'Failed to update receipt.');
      setError(userFriendlyMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user, fetchReceipts]); // Add dependencies

  /**
   * @desc Deletes a receipt via the backend API.
   * Refreshes the receipt list after successful deletion.
   * @param {string} receiptId - The ID of the receipt to delete.
   * @returns {Promise<void>} - A promise that resolves when the deletion is complete.
   * @throws {Error} - Throws an error if the API request fails.
   */
  const deleteReceipt = useCallback(async (receiptId) => {
    try {
      setLoading(true);
      setError(null);

      if (!user) {
        throw new Error('User not authenticated');
      }

      await receiptApi.deleteReceipt(receiptId);

      // Refresh receipts list (go back to the first page as the current page might be incomplete)
      await fetchReceipts({ startAfter: null });

      // showToast('Receipt deleted successfully', 'success');
    } catch (err) {
      const userFriendlyMessage = errorHandler(err, 'Failed to delete receipt.');
      setError(userFriendlyMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user, fetchReceipts]); // Add dependencies

  // Fetch receipts when user changes or pagination/filters change
  useEffect(() => {
    if (user) {
      fetchReceipts();
    } else {
      setReceipts([]);
    }
  }, [user, fetchReceipts]); // Add fetchReceipts as a dependency

  return {
    receipts,
    loading,
    error,
    pagination, // Return pagination state
    setPagination, // Return setPagination to allow components to control pagination
    filters, // Return filters state
    setFilters, // Return setFilters to allow components to control filters
    fetchReceipts, // Keep fetchReceipts for manual refetching with options
    addReceipt,
    updateReceipt,
    deleteReceipt
  };
};

export default useReceipts;
