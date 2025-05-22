// File: client/src/features/inventory/hooks/useInventory.js
import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../../auth/hooks/useAuth';
import * as inventoryService from '../services/inventoryService';

/**
 * Hook for inventory management operations
 * @returns {Object} Inventory methods and state
 */
export const useInventory = () => {
  const { user } = useAuth();
  const [inventoryItems, setInventoryItems] = useState([]);
  const [currentItem, setCurrentItem] = useState(null);
  const [stockMovements, setStockMovements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({});

  // Reset error state
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Load user inventory
  const loadInventory = useCallback(async (newFilters = {}) => {
    if (!user) return;

    setLoading(true);
    setError(null);

    // Merge with existing filters or replace completely if resetFilters is true
    const mergedFilters = newFilters.resetFilters
      ? { ...newFilters }
      : { ...filters, ...newFilters };

    // Remove the resetFilters property if it exists
    if (mergedFilters.resetFilters) {
      delete mergedFilters.resetFilters;
    }

    try {
      const items = await inventoryService.getUserInventory(user.uid, mergedFilters);
      setInventoryItems(items);
      setFilters(mergedFilters);
    } catch (err) {
      setError(err.message || 'Failed to load inventory');
      console.error('Error loading inventory:', err);
    } finally {
      setLoading(false);
    }
  }, [user, filters]);

  // Get a specific inventory item
  const getItem = useCallback(async (itemId) => {
    setLoading(true);
    setError(null);

    try {
      const item = await inventoryService.getInventoryItem(itemId);
      setCurrentItem(item);
      return item;
    } catch (err) {
      setError(err.message || 'Failed to get inventory item');
      console.error('Error getting inventory item:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create a new inventory item
  const createItem = useCallback(async (itemData) => {
    if (!user) {
      setError('User not authenticated');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      // Ensure userId is set
      const newItemData = {
        ...itemData,
        userId: user.uid
      };

      const newItem = await inventoryService.createInventoryItem(newItemData);

      // Update inventory list
      setInventoryItems(prevItems => [newItem, ...prevItems]);
      setCurrentItem(newItem);

      return newItem;
    } catch (err) {
      setError(err.message || 'Failed to create inventory item');
      console.error('Error creating inventory item:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Update an inventory item
  const updateItem = useCallback(async (itemId, updateData) => {
    setLoading(true);
    setError(null);

    try {
      const updatedItem = await inventoryService.updateInventoryItem(itemId, updateData);

      // Update item in state
      setInventoryItems(prevItems => prevItems.map(item =>
        item.id === itemId ? updatedItem : item
      ));

      // Update current item if it's the one being updated
      if (currentItem && currentItem.id === itemId) {
        setCurrentItem(updatedItem);
      }

      return updatedItem;
    } catch (err) {
      setError(err.message || 'Failed to update inventory item');
      console.error('Error updating inventory item:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [currentItem]);

  // Delete an inventory item
  const deleteItem = useCallback(async (itemId) => {
    setLoading(true);
    setError(null);

    try {
      await inventoryService.deleteInventoryItem(itemId);

      // Remove item from state
      setInventoryItems(prevItems => prevItems.filter(item => item.id !== itemId));

      // Clear current item if it's the one being deleted
      if (currentItem && currentItem.id === itemId) {
        setCurrentItem(null);
      }

      return true;
    } catch (err) {
      setError(err.message || 'Failed to delete inventory item');
      console.error('Error deleting inventory item:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [currentItem]);

  // Update stock quantity
  const updateStock = useCallback(async (itemId, quantity, reason, metadata = {}) => {
    setLoading(true);
    setError(null);

    try {
      const updatedItem = await inventoryService.updateStockQuantity(itemId, quantity, reason, metadata);

      // Update item in state
      setInventoryItems(prevItems => prevItems.map(item =>
        item.id === itemId ? updatedItem : item
      ));

      // Update current item if it's the one being updated
      if (currentItem && currentItem.id === itemId) {
        setCurrentItem(updatedItem);
      }

      return updatedItem;
    } catch (err) {
      setError(err.message || 'Failed to update stock');
      console.error('Error updating stock:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [currentItem]);

  // Get stock movements
  const loadStockMovements = useCallback(async (itemId, options = {}) => {
    setLoading(true);
    setError(null);

    try {
      const movements = await inventoryService.getStockMovements(itemId, options);
      setStockMovements(movements);
      return movements;
    } catch (err) {
      setError(err.message || 'Failed to load stock movements');
      console.error('Error loading stock movements:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Get items with low stock
  const getLowStockItems = useCallback(async () => {
    return loadInventory({ lowStock: true });
  }, [loadInventory]);

  // Load inventory when the user changes
  useEffect(() => {
    if (user) {
      loadInventory();
    } else {
      setInventoryItems([]);
      setCurrentItem(null);
    }
  }, [user, loadInventory]);

  return {
    // State
    inventoryItems,
    currentItem,
    stockMovements,
    loading,
    error,
    filters,

    // Methods
    loadInventory,
    getItem,
    createItem,
    updateItem,
    deleteItem,
    updateStock,
    loadStockMovements,
    getLowStockItems,
    clearError
  };
};

// Export the hook
export default useInventory;
