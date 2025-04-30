const api = require('../../shared/services/api'); // Assuming shared API service

const API_BASE_PATH = '/api/inventory';

const inventoryService = {
  /**
   * @desc Fetches inventory items for a user with filtering and pagination from the backend API.
   * @param {string} userId - The ID of the user.
   * @param {object} [options] - Options for filtering and pagination (category, status, search, limit, startAfter).
   * @returns {Promise<object>} - A promise that resolves with the paginated list of inventory items and pagination info.
   * @throws {Error} - Throws an error if the API request fails.
   */
  async getInventory(userId, options = {}) {
    try {
      // Pass userId and options as query parameters
      const response = await api.get(API_BASE_PATH, {
        params: {
          userId,
          ...options
        }
      });
      return response.data; // Assuming response.data contains { products: [...], pagination: {...} }
    } catch (error) {
      // Re-throw the error caught by the API interceptor
      throw error;
    }
  },

  /**
   * @desc Adds a new inventory item via the backend API.
   * @param {string} userId - The ID of the user.
   * @param {object} itemData - The data for the new inventory item.
   * @returns {Promise<object>} - A promise that resolves with the created item data.
   * @throws {Error} - Throws an error if the API request fails.
   */
  async addItem(userId, itemData) {
    try {
      const response = await api.post(API_BASE_PATH, { userId, ...itemData });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * @desc Updates an existing inventory item via the backend API.
   * @param {string} itemId - The ID of the item to update.
   * @param {object} updateData - The data to update the item with.
   * @returns {Promise<object>} - A promise that resolves with the updated item data.
   * @throws {Error} - Throws an error if the API request fails.
   */
  async updateItem(itemId, updateData) {
    try {
      const response = await api.put(`${API_BASE_PATH}/${itemId}`, updateData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * @desc Deletes an inventory item via the backend API.
   * @param {string} itemId - The ID of the item to delete.
   * @returns {Promise<object>} - A promise that resolves when the item is deleted.
   * @throws {Error} - Throws an error if the API request fails.
   */
  async deleteItem(itemId) {
    try {
      const response = await api.delete(`${API_BASE_PATH}/${itemId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * @desc Updates the stock level for an inventory item via the backend API.
   * @param {string} itemId - The ID of the item to update stock for.
   * @param {object} updateData - The stock update data (e.g., { quantity: 10, type: 'purchase' }).
   * @returns {Promise<object>} - A promise that resolves with the updated item data and stock movement.
   * @throws {Error} - Throws an error if the API request fails.
   */
  async updateStock(itemId, updateData) {
    try {
      const response = await api.put(`${API_BASE_PATH}/${itemId}/stock`, updateData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * @desc Fetches stock movement history for a user via the backend API.
   * @param {string} userId - The ID of the user.
   * @param {object} [options] - Options for filtering (startDate, endDate, type).
   * @returns {Promise<object>} - A promise that resolves with the list of stock movements.
   * @throws {Error} - Throws an error if the API request fails.
   */
  async getStockMovements(userId, options = {}) {
    try {
      const response = await api.get(`${API_BASE_PATH}/movements`, {
        params: {
          userId,
          ...options
        }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * @desc Creates a new stock movement record via the backend API.
   * @param {string} userId - The ID of the user.
   * @param {object} movementData - The data for the new stock movement.
   * @returns {Promise<object>} - A promise that resolves with the created stock movement data.
   * @throws {Error} - Throws an error if the API request fails.
   */
  async createStockMovement(userId, movementData) {
    try {
      const response = await api.post(`${API_BASE_PATH}/movements`, { userId, ...movementData });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * @desc Fetches low stock alerts for a user via the backend API.
   * @param {string} userId - The ID of the user.
   * @returns {Promise<object>} - A promise that resolves with the list of low stock alerts.
   * @throws {Error} - Throws an error if the API request fails.
   */
  async getLowStockAlerts(userId) {
    try {
      const response = await api.get(`${API_BASE_PATH}/low-stock`, {
        params: { userId }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

module.exports = inventoryService;
