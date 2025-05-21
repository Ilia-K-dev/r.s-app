import axios from 'axios';
import { API_URL } from '../../../core/config/api.config';
import { isFeatureEnabled } from '../../../core/config/featureFlags';
import { errorHandler } from '../../../utils/errorHandler';
import { getCache, setCache, clearCache } from '../../../utils/indexedDbCache'; // Import IndexedDB cache functions
import {
  fetchUserReceipts,
  fetchReceiptsByYear,
  fetchUserInventory,
  fetchStockMovements
} from '../utils/dataFetchers';
import {
  calculateSpendingByCategory,
  calculateMonthlySpending,
  calculateTopMerchants,
  calculateInventoryValueTrend,
  calculateInventoryTurnover
} from '../utils/calculators';

// Helper to generate cache keys
const getCacheKey = (userId, period, year, limit, type) => {
  return `${userId}_${type}_${period || 'default'}_${year || 'default'}_${limit || 'default'}`;
};

// Helper to clear cache for a specific user
export const clearUserCache = async (userId) => {
  // Clear cache from IndexedDB for the specific user
  // Note: Clearing all keys starting with userId_ might be inefficient for large caches.
  // A more sophisticated approach might involve storing user-specific data in a separate object store or using indexes.
  // For now, we'll iterate and delete.
  const cacheTypes = ['spendingByCategory', 'monthlySpending', 'topMerchants', 'inventoryValueTrend', 'inventoryTurnover'];
  const cacheKeysToClear = cacheTypes.map(type => getCacheKey(userId, null, null, null, type));

  // Clear from IndexedDB
  for (const key of cacheKeysToClear) {
    await clearCache(key);
  }
};

// Implementation with feature toggle and IndexedDB caching
export const getSpendingByCategory = async (userId, period = 'month') => {
  try {
    // Check if feature is enabled
    if (isFeatureEnabled('firebaseDirectIntegration')) {
      const cacheKey = getCacheKey(userId, period, null, null, 'spendingByCategory'); // Include type in key
      // Check IndexedDB cache first
      const cachedData = await getCache(cacheKey);
      if (cachedData) {
        console.log(`Cache hit for ${cacheKey}`);
        return cachedData;
      }
      console.log(`Cache miss for ${cacheKey}. Fetching from Firestore.`);

      const startTime = performance.now(); // Start timing
      // Fetch data directly from Firestore
      const receipts = await fetchUserReceipts(userId, period);
      const fetchEndTime = performance.now(); // End fetch timing
      const result = calculateSpendingByCategory(receipts);
      const calcEndTime = performance.now(); // End calculation timing

      console.log(`Performance - ${cacheKey}: Fetch time: ${fetchEndTime - startTime}ms, Calculation time: ${calcEndTime - fetchEndTime}ms`);

      // Store result in IndexedDB cache
      await setCache(cacheKey, result);

      return result;
    } else {
      // Fall back to API implementation
      const response = await axios.get(`${API_URL}/api/analytics/spending-by-category`, {
        params: { userId, period },
      });
      return response.data;
    }
  } catch (error) {
    // Handle error and potentially fall back to API
    if (isFeatureEnabled('firebaseDirectIntegration')) {
      try {
        console.warn('Falling back to API for spending by category due to error:', error);
        const response = await axios.get(`${API_URL}/api/analytics/spending-by-category`, {
          params: { userId, period },
        });
        return response.data;
      } catch (fallbackError) {
        throw errorHandler(fallbackError, 'Error getting spending by category');
      }
    } else {
      throw errorHandler(error, 'Error getting spending by category');
    }
  }
};

export const getMonthlySpending = async (userId, year = new Date().getFullYear()) => {
  try {
    if (isFeatureEnabled('firebaseDirectIntegration')) {
      const cacheKey = getCacheKey(userId, null, year, null, 'monthlySpending'); // Include type in key
      const cachedData = await getCache(cacheKey);
      if (cachedData) {
        console.log(`Cache hit for ${cacheKey}`);
        return cachedData;
      }
      console.log(`Cache miss for ${cacheKey}. Fetching from Firestore.`);

      const startTime = performance.now(); // Start timing
      const receipts = await fetchReceiptsByYear(userId, year);
      const fetchEndTime = performance.now(); // End fetch timing
      const result = calculateMonthlySpending(receipts);
      const calcEndTime = performance.now(); // End calculation timing

      console.log(`Performance - ${cacheKey}: Fetch time: ${fetchEndTime - startTime}ms, Calculation time: ${calcEndTime - fetchEndTime}ms`);

      await setCache(cacheKey, result);

      return result;
    } else {
      const response = await axios.get(`${API_URL}/api/analytics/monthly-spending`, {
        params: { userId, year },
      });
      return response.data;
    }
  } catch (error) {
    if (isFeatureEnabled('firebaseDirectIntegration')) {
      try {
        console.warn('Falling back to API for monthly spending due to error:', error);
        const response = await axios.get(`${API_URL}/api/analytics/monthly-spending`, {
          params: { userId, year },
        });
        return response.data;
      } catch (fallbackError) {
        throw errorHandler(fallbackError, 'Error getting monthly spending');
      }
    } else {
      throw errorHandler(error, 'Error getting monthly spending');
    }
  }
};

export const getTopMerchants = async (userId, limit = 5, period = 'month') => {
  try {
    if (isFeatureEnabled('firebaseDirectIntegration')) {
      const cacheKey = getCacheKey(userId, period, null, limit, 'topMerchants'); // Include type in key
      const cachedData = await getCache(cacheKey);
      if (cachedData) {
        console.log(`Cache hit for ${cacheKey}`);
        return cachedData;
      }
      console.log(`Cache miss for ${cacheKey}. Fetching from Firestore.`);

      const startTime = performance.now(); // Start timing
      const receipts = await fetchUserReceipts(userId, period);
      const fetchEndTime = performance.now(); // End fetch timing
      const result = calculateTopMerchants(receipts, limit);
      const calcEndTime = performance.now(); // End calculation timing

      console.log(`Performance - ${cacheKey}: Fetch time: ${fetchEndTime - startTime}ms, Calculation time: ${calcEndTime - fetchEndTime}ms`);

      await setCache(cacheKey, result);

      return result;
    } else {
      const response = await axios.get(`${API_URL}/api/analytics/top-merchants`, {
        params: { userId, limit, period },
      });
      return response.data;
    }
  } catch (error) {
    if (isFeatureEnabled('firebaseDirectIntegration')) {
      try {
        console.warn('Falling back to API for top merchants due to error:', error);
        const response = await axios.get(`${API_URL}/api/analytics/top-merchants`, {
          params: { userId, limit, period },
        });
        return response.data;
      } catch (fallbackError) {
        throw errorHandler(fallbackError, 'Error getting top merchants');
      }
    } else {
      throw errorHandler(error, 'Error getting top merchants');
    }
  }
};

export const getInventoryValueTrend = async (userId, period = 'month') => {
  try {
    if (isFeatureEnabled('firebaseDirectIntegration')) {
      const cacheKey = getCacheKey(userId, period, null, null, 'inventoryValueTrend'); // Include type in key
      const cachedData = await getCache(cacheKey);
      if (cachedData) {
        console.log(`Cache hit for ${cacheKey}`);
        return cachedData;
      }
      console.log(`Cache miss for ${cacheKey}. Fetching from Firestore.`);

      const startTime = performance.now(); // Start timing
      const inventory = await fetchUserInventory(userId);
      const stockMovements = await fetchStockMovements(userId, period);
      const fetchEndTime = performance.now(); // End fetch timing
      const result = calculateInventoryValueTrend(inventory, stockMovements);
      const calcEndTime = performance.now(); // End calculation timing

      console.log(`Performance - ${cacheKey}: Fetch time: ${fetchEndTime - startTime}ms, Calculation time: ${calcEndTime - fetchEndTime}ms`);

      await setCache(cacheKey, result);

      return result;
    } else {
      const response = await axios.get(`${API_URL}/api/analytics/inventory-value-trend`, {
        params: { userId, period },
      });
      return response.data;
    }
  } catch (error) {
    if (isFeatureEnabled('firebaseDirectIntegration')) {
      try {
        console.warn('Falling back to API for inventory value trend due to error:', error);
        const response = await axios.get(`${API_URL}/api/analytics/inventory-value-trend`, {
          params: { userId, period },
        });
        return response.data;
      } catch (fallbackError) {
        throw errorHandler(fallbackError, 'Error getting inventory value trend');
      }
    } else {
      throw errorHandler(error, 'Error getting inventory value trend');
    }
  }
};

export const getInventoryTurnover = async (userId) => {
  try {
    if (isFeatureEnabled('firebaseDirectIntegration')) {
      const cacheKey = getCacheKey(userId, null, null, null, 'inventoryTurnover'); // Include type in key
      const cachedData = await getCache(cacheKey);
      if (cachedData) {
        console.log(`Cache hit for ${cacheKey}`);
        return cachedData;
      }
      console.log(`Cache miss for ${cacheKey}. Fetching from Firestore.`);

      const startTime = performance.now(); // Start timing
      const inventory = await fetchUserInventory(userId);
      const stockMovements = await fetchStockMovements(userId, 'year'); // Use a full year for turnover
      const fetchEndTime = performance.now(); // End fetch timing
      const result = calculateInventoryTurnover(inventory, stockMovements);
      const calcEndTime = performance.now(); // End calculation timing

      console.log(`Performance - ${cacheKey}: Fetch time: ${fetchEndTime - startTime}ms, Calculation time: ${calcEndTime - fetchEndTime}ms`);

      await setCache(cacheKey, result);

      return result;
    } else {
      const response = await axios.get(`${API_URL}/api/analytics/inventory-turnover`, {
        params: { userId },
      });
      return response.data;
    }
  } catch (error) {
    if (isFeatureEnabled('firebaseDirectIntegration')) {
      try {
        console.warn('Falling back to API for inventory turnover due to error:', error);
        const response = await axios.get(`${API_URL}/api/analytics/inventory-turnover`, {
          params: { userId },
        });
        return response.data;
      } catch (fallbackError) {
        throw errorHandler(fallbackError, 'Error getting inventory turnover');
      }
    } else {
      throw errorHandler(error, 'Error getting inventory turnover');
    }
  }
};

export const generateReport = async (userId, reportType, options = {}) => {
  try {
    // Report generation still uses the API regardless of the feature flag
    const response = await axios.post(`${API_URL}/api/analytics/generate-report`, {
      userId,
      reportType,
      options,
    });
    return response.data;
  } catch (error) {
    throw errorHandler(error, 'Error generating report');
  }
};
