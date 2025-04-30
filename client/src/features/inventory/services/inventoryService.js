import { api } from '../../../shared/services/api'; // Use shared API helper
import { logger } from '../../../shared/utils/logger'; // Assuming logger exists

// Base path for inventory API endpoints
const API_BASE_PATH = '/inventory';

export const inventoryService = {
  /**
   * Fetches the user's inventory items from the backend.
   * @param {string} userId - The user's ID (Backend should verify against authenticated user).
   * @param {object} filters - Optional filters (e.g., search term, category).
   * @returns {Promise<Array>} - A promise that resolves to an array of inventory items.
   */
  async getInventory(userId, filters = {}) {
    // Filters would be passed as query parameters
    const response = await api.get(API_BASE_PATH, { params: { userId, ...filters } });
    return response.data; // Assuming backend returns the array directly
  },

  /**
   * Adds a new inventory item via the backend API.
   * @param {string} userId - The user's ID (Backend should verify).
   * @param {object} itemData - The data for the new item.
   * @returns {Promise<object>} - A promise that resolves to the newly created item.
   */
  async addItem(userId, itemData) {
    // userId might be redundant if backend uses auth token, but include if API expects it
    const response = await api.post(API_BASE_PATH, { ...itemData, userId });
    return response.data; // Assuming backend returns the created item with ID
  },

  /**
   * Updates an existing inventory item via the backend API.
   * @param {string} itemId - The ID of the item to update.
   * @param {object} updateData - The data to update.
   * @returns {Promise<object>} - A promise that resolves to the updated item data.
   */
  async updateItem(itemId, updateData) {
    const response = await api.put(`${API_BASE_PATH}/${itemId}`, updateData);
    return response.data; // Assuming backend returns the updated item
  },

  /**
   * Deletes an inventory item via the backend API.
   * @param {string} itemId - The ID of the item to delete.
   * @returns {Promise<boolean>} - A promise that resolves to true if successful.
   */
  async deleteItem(itemId) {
    await api.delete(`${API_BASE_PATH}/${itemId}`);
    return true;
  },

  /**
   * Updates the stock quantity of an item via the backend API.
   * @param {string} itemId - The ID of the item.
   * @param {number} quantity - The new quantity.
   * @returns {Promise<boolean>} - A promise that resolves to true if successful.
   */
  async updateStock(itemId, quantity) {
    // Assuming a dedicated endpoint for stock updates
    await api.put(`${API_BASE_PATH}/${itemId}/stock`, { quantity });
    return true;
  },

  /**
   * Checks for low stock items via the backend API.
   * @param {string} userId - The user's ID (Backend should verify).
   * @returns {Promise<Array>} - A promise that resolves to an array of low stock items.
   */
  async checkLowStock(userId) {
    // Assuming an endpoint for low stock checks
    const response = await api.get(`${API_BASE_PATH}/low-stock`, { params: { userId } });
    return response.data;
  },

  /**
   * Fetches stock movement history for an item via the backend API.
   * @param {string} itemId - The ID of the item.
   * @returns {Promise<Array>} - A promise that resolves to an array of stock movements.
   */
  async getStockMovements(itemId) {
    const response = await api.get(`${API_BASE_PATH}/${itemId}/movements`);
    return response.data;
  },

  /**
   * Adds a stock movement record via the backend API.
   * @param {string} itemId - The ID of the item.
   * @param {number} quantity - The quantity changed.
   * @param {string} type - The type of movement (e.g., 'purchase', 'sale', 'adjustment').
   * @param {string} reason - Optional reason for the movement.
   * @returns {Promise<object>} - A promise that resolves to the created stock movement record.
   */
  async addStockMovement(itemId, quantity, type, reason) {
    // Assuming a dedicated endpoint for adding movements
    const response = await api.post(`${API_BASE_PATH}/movements`, {
      itemId,
      quantity,
      movementType: type,
      reason,
    });
    return response.data; // Assuming backend returns the created movement
  },
};
