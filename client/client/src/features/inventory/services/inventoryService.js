// File: client/src/features/inventory/services/inventoryService.js
import { collection, doc, addDoc, updateDoc, getDoc, getDocs, query, where, deleteDoc, increment, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../core/config/firebase';
import { isFeatureEnabled } from '../../../core/config/featureFlags';
import { handleFirestoreError } from '../../../utils/errorHandler';
import api from '../../../shared/services/api';

/**
 * Create a new inventory item
 * @param {Object} itemData - The inventory item data
 * @param {string} itemData.name - Item name
 * @param {string} itemData.category - Item category
 * @param {number} itemData.stockQuantity - Initial stock quantity
 * @param {number} itemData.reorderLevel - Level at which to reorder
 * @param {string} itemData.userId - The user ID who owns this item
 * @param {Object} itemData.metadata - Additional metadata
 * @returns {Promise<Object>} Created inventory item
 */
export const createInventoryItem = async (itemData) => {
  try {
    // Check if Firebase direct integration is enabled
    if (isFeatureEnabled('inventoryDirectIntegration')) {
      // Prepare item data with timestamps
      const newItem = {
        ...itemData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastStockUpdate: serverTimestamp()
      };

      // Add item to Firestore
      const docRef = await addDoc(collection(db, 'inventory'), newItem);

      // Get the created document
      const itemSnapshot = await getDoc(docRef);

      // Return item with ID
      return {
        id: docRef.id,
        ...itemSnapshot.data()
      };
    } else {
      // Fallback to API call
      console.log('[Inventory Service] Using API fallback for item creation');
      const response = await api.post('/inventory', itemData);
      return response.data;
    }
  } catch (error) {
    // Handle errors
    return handleFirestoreError(error, 'Inventory Creation', 'inventoryDirectIntegration');
  }
};

/**
 * Update an inventory item
 * @param {string} itemId - The inventory item ID
 * @param {Object} updateData - The data to update
 * @returns {Promise<Object>} Updated inventory item
 */
export const updateInventoryItem = async (itemId, updateData) => {
  try {
    // Check if Firebase direct integration is enabled
    if (isFeatureEnabled('inventoryDirectIntegration')) {
      // Reference to the inventory item
      const itemRef = doc(db, 'inventory', itemId);

      // Get current item data to ensure it exists
      const itemSnapshot = await getDoc(itemRef);

      if (!itemSnapshot.exists()) {
        throw new Error('Inventory item not found');
      }

      // Prepare update data with timestamp
      const updates = {
        ...updateData,
        updatedAt: serverTimestamp()
      };

      // Update item in Firestore
      await updateDoc(itemRef, updates);

      // Get the updated document
      const updatedSnapshot = await getDoc(itemRef);

      // Return updated item
      return {
        id: itemId,
        ...updatedSnapshot.data()
      };
    } else {
      // Fallback to API call
      console.log('[Inventory Service] Using API fallback for item update');
      const response = await api.put(`/inventory/${itemId}`, updateData);
      return response.data;
    }
  } catch (error) {
    // Handle errors
    return handleFirestoreError(error, 'Inventory Update', 'inventoryDirectIntegration');
  }
};

/**
 * Get an inventory item by ID
 * @param {string} itemId - The inventory item ID
 * @returns {Promise<Object>} Inventory item data
 */
export const getInventoryItem = async (itemId) => {
  try {
    // Check if Firebase direct integration is enabled
    if (isFeatureEnabled('inventoryDirectIntegration')) {
      // Reference to the inventory item
      const itemRef = doc(db, 'inventory', itemId);

      // Get item data
      const itemSnapshot = await getDoc(itemRef);

      if (!itemSnapshot.exists()) {
        throw new Error('Inventory item not found');
      }

      // Return item with ID
      return {
        id: itemId,
        ...itemSnapshot.data()
      };
    } else {
      // Fallback to API call
      console.log('[Inventory Service] Using API fallback for item retrieval');
      const response = await api.get(`/inventory/${itemId}`);
      return response.data;
    }
  } catch (error) {
    // Handle errors
    return handleFirestoreError(error, 'Inventory Retrieval', 'inventoryDirectIntegration');
  }
};

/**
 * Get inventory items for a user
 * @param {string} userId - The user ID
 * @param {Object} filters - Filters to apply (category, search, etc.)
 * @returns {Promise<Array>} Array of inventory items
 */
export const getUserInventory = async (userId, filters = {}) => {
  try {
    // Check if Firebase direct integration is enabled
    if (isFeatureEnabled('inventoryDirectIntegration')) {
      // Create query for user inventory
      let q = query(
        collection(db, 'inventory'),
        where('userId', '==', userId)
      );

      // Apply category filter if provided
      if (filters.category) {
        q = query(q, where('category', '==', filters.category));
      }

      // Get inventory items
      const querySnapshot = await getDocs(q);

      // Map items to array
      let items = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Handle search filter client-side (Firestore doesn't support text search directly)
      if (filters.search && filters.search.trim() !== '') {
        const searchTerm = filters.search.toLowerCase().trim();
        items = items.filter(item =>
          item.name.toLowerCase().includes(searchTerm) ||
          (item.description && item.description.toLowerCase().includes(searchTerm))
        );
      }

      // Handle low stock filter
      if (filters.lowStock === true) {
        items = items.filter(item =>
          item.stockQuantity <= item.reorderLevel
        );
      }

      return items;
    } else {
      // Fallback to API call
      console.log('[Inventory Service] Using API fallback for inventory listing');
      const response = await api.get('/inventory', { params: { userId, ...filters } });
      return response.data;
    }
  } catch (error) {
    // Handle errors
    return handleFirestoreError(error, 'Inventory Listing', 'inventoryDirectIntegration');
  }
};

/**
 * Delete an inventory item
 * @param {string} itemId - The inventory item ID
 * @returns {Promise<boolean>} Success status
 */
export const deleteInventoryItem = async (itemId) => {
  try {
    // Check if Firebase direct integration is enabled
    if (isFeatureEnabled('inventoryDirectIntegration')) {
      // Reference to the inventory item
      const itemRef = doc(db, 'inventory', itemId);

      // Check if item exists
      const itemSnapshot = await getDoc(itemRef);

      if (!itemSnapshot.exists()) {
        throw new Error('Inventory item not found');
      }

      // Delete item from Firestore
      await deleteDoc(itemRef);

      return true;
    } else {
      // Fallback to API call
      console.log('[Inventory Service] Using API fallback for item deletion');
      await api.delete(`/inventory/${itemId}`);
      return true;
    }
  } catch (error) {
    // Handle errors
    return handleFirestoreError(error, 'Inventory Deletion', 'inventoryDirectIntegration');
  }
};

/**
 * Update stock quantity for an inventory item
 * @param {string} itemId - The inventory item ID
 * @param {number} quantity - The quantity to add (positive) or remove (negative)
 * @param {string} reason - The reason for the stock update
 * @param {Object} metadata - Additional metadata
 * @returns {Promise<Object>} Updated inventory item
 */
export const updateStockQuantity = async (itemId, quantity, reason, metadata = {}) => {
  try {
    // Check if Firebase direct integration is enabled
    if (isFeatureEnabled('inventoryDirectIntegration')) {
      // Reference to the inventory item
      const itemRef = doc(db, 'inventory', itemId);

      // Get current item data
      const itemSnapshot = await getDoc(itemRef);

      if (!itemSnapshot.exists()) {
        throw new Error('Inventory item not found');
      }

      const itemData = itemSnapshot.data();
      const newQuantity = itemData.stockQuantity + quantity;

      // Don't allow negative stock unless specifically allowed in metadata
      if (newQuantity < 0 && !metadata.allowNegativeStock) {
        throw new Error('Cannot reduce stock below zero');
      }

      // Update the stock quantity
      await updateDoc(itemRef, {
        stockQuantity: increment(quantity),
        lastStockUpdate: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // Create a stock movement record
      const movementData = {
        itemId,
        quantity,
        previousQuantity: itemData.stockQuantity,
        newQuantity,
        reason,
        timestamp: serverTimestamp(),
        metadata
      };

      await addDoc(collection(db, 'stockMovements'), movementData);

      // Get the updated item
      const updatedSnapshot = await getDoc(itemRef);

      return {
        id: itemId,
        ...updatedSnapshot.data()
      };
    } else {
      // Fallback to API call
      console.log('[Inventory Service] Using API fallback for stock update');
      const response = await api.post(`/inventory/${itemId}/stock`, {
        quantity,
        reason,
        metadata
      });
      return response.data;
    }
  } catch (error) {
    // Handle errors
    return handleFirestoreError(error, 'Stock Update', 'inventoryDirectIntegration');
  }
};

/**
 * Get stock movement history for an inventory item
 * @param {string} itemId - The inventory item ID
 * @param {Object} options - Options for filtering movements
 * @returns {Promise<Array>} Array of stock movements
 */
export const getStockMovements = async (itemId, options = {}) => {
  try {
    // Check if Firebase direct integration is enabled
    if (isFeatureEnabled('inventoryDirectIntegration')) {
      // Create query for item stock movements
      let q = query(
        collection(db, 'stockMovements'),
        where('itemId', '==', itemId)
      );

      // Get stock movements
      const querySnapshot = await getDocs(q);

      // Map movements to array and sort by timestamp
      const movements = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Sort movements by timestamp (most recent first)
      return movements.sort((a, b) => {
        // Handle Firestore timestamps
        const timestampA = a.timestamp?.toMillis ? a.timestamp.toMillis() : 0;
        const timestampB = b.timestamp?.toMillis ? b.timestamp.toMillis() : 0;
        return timestampB - timestampA;
      });
    } else {
      // Fallback to API call
      console.log('[Inventory Service] Using API fallback for stock movements');
      const response = await api.get(`/inventory/${itemId}/movements`, { params: options });
      return response.data;
    }
  } catch (error) {
    // Handle errors
    return handleFirestoreError(error, 'Stock Movements', 'inventoryDirectIntegration');
  }
};

// Export all functions
export {
  createInventoryItem,
  updateInventoryItem,
  getInventoryItem,
  getUserInventory,
  deleteInventoryItem,
  updateStockQuantity,
  getStockMovements
};

// Export default object for default imports
export default {
  createInventoryItem,
  updateInventoryItem,
  getInventoryItem,
  getUserInventory,
  deleteInventoryItem,
  updateStockQuantity,
  getStockMovements
};
