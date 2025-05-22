import { useState, useEffect, useCallback } from 'react'; // Add useCallback
import { useAuth } from '../../../features/auth/hooks/useAuth';
import { categoriesApi } from '../../../features/categories/services/categories'; // Assuming categoriesApi exists
import { getCache, setCache, invalidateCache } from '../../../shared/utils/cache'; // Import cache utility
import logger from '../../../shared/utils/logger'; // Assuming a shared logger utility

/**
 * @typedef {object} Category
 * @property {string} id - The category ID.
 * @property {string} userId - The ID of the user who owns the category.
 * @property {string} name - The category name.
 * @property {number} [budget] - Optional budget for the category.
 * @property {string} [color] - Optional color for the category (hex code).
 * // Add other relevant category properties here
 */

/**
 * @typedef {object} UseCategoriesReturn
 * @property {Category[]} categories - Array of fetched categories.
 * @property {boolean} loading - Loading state.
 * @property {string|null} error - Error message if fetching/mutating failed.
 * @property {function(): Promise<void>} fetchCategories - Function to fetch categories.
 * @property {function(object): Promise<object>} addCategory - Function to add a new category.
 * @property {function(string, object): Promise<void>} updateCategory - Function to update an existing category.
 * @property {function(string): Promise<void>} deleteCategory - Function to delete a category.
 */

/**
 * @desc Custom hook for fetching, adding, updating, and deleting user categories.
 * Manages loading, error, and categories state. Uses client-side caching.
 * @returns {UseCategoriesReturn} - Object containing categories data, state, and functions.
 */
export const useCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  /**
   * @desc Fetches categories from the backend API or cache.
   * Updates categories state.
   * @returns {Promise<void>}
   */
  const fetchCategories = useCallback(async () => { // Wrap in useCallback
    try {
      setLoading(true);
      setError(null); // Reset error state

      if (!user) {
        setCategories([]); // Clear categories if user is not authenticated
        setLoading(false);
        return;
      }

      const cacheKey = `categories-${user.uid}`;
      const cachedData = getCache(cacheKey);

      if (cachedData) {
        setCategories(cachedData);
        setLoading(false);
        logger.info(`Fetched categories from cache for user ${user.uid}`); // Add logging
        return;
      }

      logger.info(`Fetching categories from API for user ${user.uid}`); // Add logging
      // Assuming categoriesApi.getCategories exists and fetches categories for a user
      const data = await categoriesApi.getCategories(user.uid);
      setCategories(data);
      setError(null);
      setCache(cacheKey, data, 5 * 60 * 1000); // Cache for 5 minutes

    } catch (err) {
      setError(err.message);
      logger.error(`Error fetching categories for user ${user.uid}: ${err.message}`); // Add logging
    } finally {
      setLoading(false);
    }
  }, [user]); // Dependency on user

  /**
   * @desc Adds a new category via the backend API.
   * Adds the new category to the local state and invalidates the cache.
   * @param {object} categoryData - The data for the new category.
   * @returns {Promise<object>} - A promise that resolves with the created category data.
   * @throws {Error} - Throws an error if the API request fails.
   */
  const addCategory = useCallback(async categoryData => { // Wrap in useCallback
    try {
      if (!user) throw new Error('User not authenticated'); // Add auth check
      // Assuming categoriesApi.addCategory exists and adds a category for a user
      const newCategory = await categoriesApi.addCategory(user.uid, categoryData);
      setCategories(prev => [...prev, newCategory]);
      invalidateCache(`categories-${user.uid}`); // Invalidate cache
      return newCategory;
    } catch (err) {
      logger.error(`Error adding category for user ${user.uid}: ${err.message}`); // Add logging
      throw new Error('Failed to add category');
    }
  }, [user]); // Dependency on user

  /**
   * @desc Updates an existing category via the backend API.
   * Updates the category in the local state and invalidates the cache.
   * @param {string} id - The ID of the category to update.
   * @param {object} categoryData - The data to update the category with.
   * @returns {Promise<void>} - A promise that resolves when the update is complete.
   * @throws {Error} - Throws an error if the API request fails.
   */
  const updateCategory = useCallback(async (id, categoryData) => { // Wrap in useCallback
    try {
      if (!user) throw new Error('User not authenticated'); // Add auth check
      // Assuming categoriesApi.updateCategory exists and updates a category
      await categoriesApi.updateCategory(id, categoryData);
      setCategories(prev => prev.map(cat => (cat.id === id ? { ...cat, ...categoryData } : cat)));
      invalidateCache(`categories-${user.uid}`); // Invalidate cache
    } catch (err) {
      logger.error(`Error updating category ${id} for user ${user.uid}: ${err.message}`); // Add logging
      throw new Error('Failed to update category');
    }
  }, [user]); // Dependency on user

  /**
   * @desc Deletes a category via the backend API.
   * Removes the category from the local state and invalidates the cache.
   * @param {string} id - The ID of the category to delete.
   * @returns {Promise<void>} - A promise that resolves when the deletion is complete.
   * @throws {Error} - Throws an error if the API request fails.
   */
  const deleteCategory = useCallback(async id => { // Wrap in useCallback
    try {
      if (!user) throw new Error('User not authenticated'); // Add auth check
      // Assuming categoriesApi.deleteCategory exists and deletes a category
      await categoriesApi.deleteCategory(id);
      setCategories(prev => prev.filter(cat => cat.id !== id));
      invalidateCache(`categories-${user.uid}`); // Invalidate cache
    } catch (err) {
      logger.error(`Error deleting category ${id} for user ${user.uid}: ${err.message}`); // Add logging
      throw new Error('Failed to delete category');
    }
  }, [user]); // Dependency on user

  // Fetch categories when user changes
  useEffect(() => {
    if (user) {
      fetchCategories();
    } else {
      setCategories([]); // Clear categories if user logs out
    }
  }, [user, fetchCategories]); // Dependency on user and fetchCategories

  return {
    categories,
    loading,
    error,
    fetchCategories,
    addCategory,
    updateCategory,
    deleteCategory,
  };
};
