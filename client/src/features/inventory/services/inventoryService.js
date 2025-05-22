import { db } from '../../../core/config/firebase'; // Import Firestore instance
import { collection, query, where, getDocs } from 'firebase/firestore'; // Import Firestore functions
import { logger } from '../../../shared/utils/logger'; // Assuming logger exists

// Base path for inventory API endpoints (no longer needed for direct Firestore access)
// const API_BASE_PATH = '/inventory';

export const inventoryService = {
  /**
   * Fetches the user's inventory items from Firestore.
   * @param {string} userId - The user's ID.
   * @param {object} filters - Optional filters (e.g., search term, category).
   * @returns {Promise<Array>} - A promise that resolves to an array of inventory items.
   */
  async getInventory(userId, filters = {}) {
    try {
      // Create a query against the 'inventory' collection, filtered by userId
      let inventoryQuery = query(collection(db, 'inventory'), where('userId', '==', userId));

      // Apply additional filters if provided
      if (filters.searchTerm) {
        // Note: Full-text search is limited in Firestore. This would require
        // a more advanced solution like a dedicated search service (e.g., Algolia, ElasticSearch)
        // or a different data structure/query approach for robust search.
        // For simplicity, we'll skip applying searchTerm filter directly in Firestore query here.
        logger.warn("Search term filtering is not fully implemented for direct Firestore access.");
      }

      if (filters.category) {
        inventoryQuery = query(inventoryQuery, where('category', '==', filters.category));
      }

      // Execute the query
      const querySnapshot = await getDocs(inventoryQuery);

      // Map the results to an array of inventory items
      const inventoryItems = querySnapshot.docs.map(doc => ({
        id: doc.id, // Include document ID as item ID
        ...doc.data(),
      }));

      logger.info(`Fetched ${inventoryItems.length} inventory items for user ${userId}`);
      return inventoryItems;

    } catch (error) {
      logger.error(`Error fetching inventory for user ${userId}:`, error);
      // Re-throw the error or return a specific error object/value
      throw new Error(`Failed to fetch inventory: ${error.message}`);
    }
  },

  /**
   * Adds a new inventory item to Firestore.
   * @param {string} userId - The user's ID.
   * @param {object} itemData - The data for the new item.
   * @returns {Promise<object>} - A promise that resolves to the newly created item with its ID.
   */
  async addItem(userId, itemData) {
    try {
      // Add a new document to the 'inventory' collection
      const docRef = await addDoc(collection(db, 'inventory'), {
        ...itemData,
        userId, // Ensure userId is included for security rules
        createdAt: new Date(), // Add a timestamp
        updatedAt: new Date(), // Add a timestamp
      });

      logger.info(`Added new inventory item with ID: ${docRef.id} for user ${userId}`);

      // Return the newly created item data including its ID
      const newItemSnapshot = await getDocs(query(collection(db, 'inventory'), where('__name__', '==', docRef.id)));
      const newItem = newItemSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))[0];

      return newItem;

    } catch (error) {
      logger.error(`Error adding inventory item for user ${userId}:`, error);
      // Re-throw the error or return a specific error object/value
      throw new Error(`Failed to add inventory item: ${error.message}`);
    }
  },

  /**
   * Updates an existing inventory item in Firestore.
   * @param {string} itemId - The ID of the item to update.
   * @param {object} updateData - The data to update.
   * @returns {Promise<boolean>} - A promise that resolves to true if successful.
   */
  async updateItem(itemId, updateData) {
    try {
      // Get a reference to the document
      const itemRef = doc(db, 'inventory', itemId);

      // Update the document
      await updateDoc(itemRef, {
        ...updateData,
        updatedAt: new Date(), // Update timestamp
      });

      logger.info(`Updated inventory item with ID: ${itemId}`);
      return true; // Indicate success

    } catch (error) {
      logger.error(`Error updating inventory item ${itemId}:`, error);
      // Re-throw the error or return a specific error object/value
      throw new Error(`Failed to update inventory item: ${error.message}`);
    }
  },

  /**
   * Deletes an inventory item from Firestore.
   * @param {string} itemId - The ID of the item to delete.
   * @returns {Promise<boolean>} - A promise that resolves to true if successful.
   */
  async deleteItem(itemId) {
    try {
      // Get a reference to the document
      const itemRef = doc(db, 'inventory', itemId);

      // Delete the document
      await deleteDoc(itemRef);

      logger.info(`Deleted inventory item with ID: ${itemId}`);
      return true; // Indicate success

    } catch (error) {
      logger.error(`Error deleting inventory item ${itemId}:`, error);
      // Re-throw the error or return a specific error object/value
      throw new Error(`Failed to delete inventory item: ${error.message}`);
    }
  },

  /**
   * Updates the stock quantity of an item in Firestore.
   * @param {string} itemId - The ID of the item.
   * @param {number} quantity - The new quantity.
   * @returns {Promise<boolean>} - A promise that resolves to true if successful.
   */
  async updateStock(itemId, quantity) {
    try {
      // Get a reference to the document
      const itemRef = doc(db, 'inventory', itemId);

      // Update the document with the new quantity
      await updateDoc(itemRef, {
        quantity: quantity,
        updatedAt: new Date(), // Update timestamp
      });

      logger.info(`Updated stock for item with ID: ${itemId} to quantity ${quantity}`);
      return true; // Indicate success

    } catch (error) {
      logger.error(`Error updating stock for item ${itemId}:`, error);
      // Re-throw the error or return a specific error object/value
      throw new Error(`Failed to update stock: ${error.message}`);
    }
  },

  /**
   * Checks for low stock items in Firestore.
   * @param {string} userId - The user's ID.
   * @returns {Promise<Array>} - A promise that resolves to an array of low stock items.
   */
  async checkLowStock(userId) {
    try {
      // Define a low stock threshold (can be made configurable later)
      const LOW_STOCK_THRESHOLD = 10; // Example threshold

      // Create a query against the 'inventory' collection, filtered by userId and low quantity
      const lowStockQuery = query(
        collection(db, 'inventory'),
        where('userId', '==', userId),
        where('quantity', '<', LOW_STOCK_THRESHOLD)
      );

      // Execute the query
      const querySnapshot = await getDocs(lowStockQuery);

      // Map the results to an array of inventory items
      const lowStockItems = querySnapshot.docs.map(doc => ({
        id: doc.id, // Include document ID as item ID
        ...doc.data(),
      }));

      logger.info(`Found ${lowStockItems.length} low stock items for user ${userId}`);
      return lowStockItems;

    } catch (error) {
      logger.error(`Error checking low stock for user ${userId}:`, error);
      // Re-throw the error or return a specific error object/value
      throw new Error(`Failed to check low stock: ${error.message}`);
    }
  },

  /**
   * Fetches stock movement history for an item from Firestore.
   * @param {string} itemId - The ID of the item.
   * @returns {Promise<Array>} - A promise that resolves to an array of stock movements.
   */
  async getStockMovements(itemId) {
    try {
      // Create a query against the 'stockMovements' collection, filtered by itemId and ordered by timestamp
      const movementsQuery = query(
        collection(db, 'stockMovements'), // Assuming a 'stockMovements' collection
        where('itemId', '==', itemId),
        orderBy('timestamp', 'asc') // Assuming a 'timestamp' field
      );

      // Execute the query
      const querySnapshot = await getDocs(movementsQuery);

      // Map the results to an array of stock movements
      const stockMovements = querySnapshot.docs.map(doc => ({
        id: doc.id, // Include document ID
        ...doc.data(),
      }));

      logger.info(`Fetched ${stockMovements.length} stock movements for item ${itemId}`);
      return stockMovements;

    } catch (error) {
      logger.error(`Error fetching stock movements for item ${itemId}:`, error);
      // Re-throw the error or return a specific error object/value
      throw new Error(`Failed to fetch stock movements: ${error.message}`);
    }
  },

  /**
   * Adds a stock movement record to Firestore.
   * @param {string} itemId - The ID of the item.
   * @param {number} quantity - The quantity changed.
   * @param {string} type - The type of movement (e.g., 'purchase', 'sale', 'adjustment').
   * @param {string} reason - Optional reason for the movement.
   * @returns {Promise<object>} - A promise that resolves to the created stock movement record with its ID.
   */
  async addStockMovement(itemId, quantity, type, reason) {
    try {
      // Add a new document to the 'stockMovements' collection
      const docRef = await addDoc(collection(db, 'stockMovements'), {
        itemId,
        quantity,
        type, // Use 'type' field as per function parameter
        reason,
        timestamp: new Date(), // Add a timestamp
      });

      logger.info(`Added new stock movement record with ID: ${docRef.id} for item ${itemId}`);

      // Return the newly created movement data including its ID
      const newMovementSnapshot = await getDocs(query(collection(db, 'stockMovements'), where('__name__', '==', docRef.id)));
      const newMovement = newMovementSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))[0];

      return newMovement;

    } catch (error) {
      logger.error(`Error adding stock movement for item ${itemId}:`, error);
      // Re-throw the error or return a specific error object/value
      throw new Error(`Failed to add stock movement: ${error.message}`);
    }
  },
};
