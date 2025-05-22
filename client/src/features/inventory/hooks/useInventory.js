import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../auth/hooks/useAuth';
import { inventoryService } from '../services/inventoryService';
import errorHandler from '../../../shared/utils/errorHandler'; // Import the error handler utility

/**
 * @typedef {object} InventoryItem
 * @property {string} id - The item ID.
 * @property {string} userId - The ID of the user who owns the item.
 * @property {string} name - The item name.
 * @property {number} unitPrice - The unit price of the item.
 * @property {number} currentStock - The current stock quantity.
 * @property {string} category - The item category.
 * @property {string} [description] - Item description (optional).
 * @property {string} [location] - Item location (optional).
 * // Add other relevant inventory item properties here
 */

/**
 * @typedef {object} PaginationInfo
 * @property {number} limit - The number of items per page.
 * @property {string|null} startAfter - The ID of the last item from the previous page (for cursor-based pagination).
 * @property {boolean} hasNextPage - Indicates if there are more pages.
 */

/**
 * @typedef {object} UseInventoryReturn
 * @property {InventoryItem[]} inventory - Array of fetched inventory items.
 * @property {boolean} loading - Loading state.
 * @property {string|null} error - Error message if fetching/mutating failed.
 * @property {PaginationInfo} pagination - Pagination information.
 * @property {function(PaginationInfo): void} setPagination - Function to update pagination state.
 * @property {function(object): Promise<void>} fetchInventory - Function to fetch inventory items with optional filters/pagination.
 * @property {function(object): Promise<object>} addItem - Function to add a new inventory item.
 * @property {function(string, object): Promise<void>} updateItem - Function to update an existing inventory item.
 * @property {function(string): Promise<void>} deleteItem - Function to delete an inventory item.
 */

/**
 * @desc Custom hook for fetching, adding, updating, and deleting user inventory items.
 * Manages loading, error, and pagination states.
 * @returns {UseInventoryReturn} - Object containing inventory data, state, and functions.
 */
export const useInventory = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ limit: 10, startAfter: null, hasNextPage: true }); // Add pagination state
  const { user } = useAuth();

  /**
   * @desc Fetches inventory items from the backend API with specified options.
   * Updates inventory and pagination state.
   * @param {object} [options] - Options to override current pagination (e.g., { limit: 20, startAfter: 'abc' }).
   * @returns {Promise<void>}
   */
  const fetchInventory = useCallback(async (options = {}) => { // Accept options for filtering/pagination
    try {
      setLoading(true);
      setError(null);

      if (!user) {
        throw new Error('User not authenticated');
      }

      // Merge default pagination options with provided options
      const fetchOptions = {
          limit: pagination.limit,
          startAfter: pagination.startAfter,
          ...options
      };

      const response = await inventoryService.getInventory(user.uid, fetchOptions);
      setInventory(response.data.products || []);
      setPagination(prev => ({ // Update pagination state from response
          ...prev,
          startAfter: response.data.pagination.lastVisible,
          hasNextPage: response.data.pagination.hasNextPage
      }));

    } catch (err) {
      const userFriendlyMessage = errorHandler(err, 'Failed to fetch inventory.');
      setError(userFriendlyMessage);
    } finally {
      setLoading(false);
    }
  }, [user, pagination.limit, pagination.startAfter]); // Add pagination dependencies

  /**
   * @desc Adds a new inventory item via the backend API.
   * Adds the new item to the local state.
   * @param {object} itemData - The data for the new inventory item.
   * @returns {Promise<object>} - A promise that resolves with the created item data.
   * @throws {Error} - Throws an error if the API request fails.
   */
  const addItem = async (itemData) => {
    try {
      setLoading(true);
      setError(null);

      if (!user) {
        throw new Error('User not authenticated');
      }

      const newItem = await inventoryService.addItem(user.uid, itemData);
      setInventory(prev => [...prev, newItem]);

      // errorHandler handles the toast internally
      // showToast('Inventory item added successfully', 'success');
      return newItem;
    } catch (err) {
      const userFriendlyMessage = errorHandler(err, 'Failed to add inventory item.');
      setError(userFriendlyMessage);
      throw err; // Re-throw for components that might need to catch
    } finally {
      setLoading(false);
    }
  };

  /**
   * @desc Updates an existing inventory item via the backend API.
   * Updates the item in the local state.
   * @param {string} itemId - The ID of the item to update.
   * @param {object} updateData - The data to update the item with.
   * @returns {Promise<void>} - A promise that resolves when the update is complete.
   * @throws {Error} - Throws an error if the API request fails.
   */
  const updateItem = async (itemId, updateData) => {
    try {
      setLoading(true);
      setError(null);

      if (!user) {
        throw new Error('User not authenticated');
      }

      await inventoryService.updateItem(itemId, updateData);

      setInventory(prev =>
        prev.map(item =>
          item.id === itemId ? { ...item, ...updateData } : item
        )
      );

      // showToast('Inventory item updated successfully', 'success');
    } catch (err) {
      const userFriendlyMessage = errorHandler(err, 'Failed to update inventory item.');
      setError(userFriendlyMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * @desc Deletes an inventory item via the backend API.
   * Removes the item from the local state.
   * @param {string} itemId - The ID of the item to delete.
   * @returns {Promise<void>} - A promise that resolves when the deletion is complete.
   * @throws {Error} - Throws an error if the API request fails.
   */
  const deleteItem = async (itemId) => {
    try {
      setLoading(true);
      setError(null);

      if (!user) {
        throw new Error('User not authenticated');
      }

      await inventoryService.deleteItem(itemId);

      setInventory(prev => prev.filter(item => item.id !== itemId));

      // showToast('Inventory item deleted successfully', 'success');
    } catch (err) {
      const userFriendlyMessage = errorHandler(err, 'Failed to delete inventory item.');
      setError(userFriendlyMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Fetch inventory when user changes or pagination/filters change
  useEffect(() => {
    if (user) {
      fetchInventory();
    } else {
      setInventory([]);
    }
  }, [user, fetchInventory]); // Add fetchInventory as a dependency

  return {
    inventory,
    loading,
    error,
    pagination, // Return pagination state
    setPagination, // Return setPagination to allow components to control pagination
    fetchInventory, // Keep fetchInventory for manual refetching with options
    addItem,
    updateItem,
    deleteItem
  };
};

export default useInventory;
