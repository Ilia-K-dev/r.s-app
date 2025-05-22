import { useState, useEffect } from 'react';

import { getSpendingAnalytics, getInventoryAnalytics } from '../services/analyticsService';
import errorHandler from '../../../shared/utils/errorHandler'; // Import the error handler utility

/**
 * @typedef {object} SpendingAnalytics
 * @property {number} total - Total spending.
 * @property {object} byCategory - Spending broken down by category.
 * @property {object} byVendor - Spending broken down by vendor.
 * @property {object} trends - Spending trends (daily, weekly, monthly).
 * @property {object} predictions - Predicted future spending.
 * // Add other relevant spending analytics properties here
 */

/**
 * @typedef {object} InventoryAnalytics
 * @property {object} stockLevels - Analysis of stock levels.
 * @property {object} turnover - Inventory turnover rates.
 * @property {object} optimization - Optimization recommendations.
 * @property {number} value - Total inventory value.
 * @property {object} metrics - Other inventory metrics.
 * // Add other relevant inventory analytics properties here
 */

/**
 * @typedef {object} UseAnalyticsReturn
 * @property {SpendingAnalytics|null} spendingAnalytics - Spending analytics data.
 * @property {InventoryAnalytics|null} inventoryAnalytics - Inventory analytics data.
 * @property {boolean} loading - Loading state.
 * @property {string|null} error - Error message if fetching failed.
 */

/**
 * @desc Custom hook for fetching spending and inventory analytics data for a user within a date range.
 * Manages loading and error states.
 * @param {string} userId - The ID of the user.
 * @param {Date} startDate - Start date for spending analysis.
 * @param {Date} endDate - End date for spending analysis.
 * @returns {UseAnalyticsReturn} - Object containing analytics data, state, and functions.
 */
export const useAnalytics = (userId, startDate, endDate) => {
  const [spendingAnalytics, setSpendingAnalytics] = useState(null);
  const [inventoryAnalytics, setInventoryAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    /**
     * @desc Fetches spending and inventory analytics data from the backend services.
     * Updates local state with fetched data or error.
     * @returns {Promise<void>}
     */
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);

        const spendingData = await getSpendingAnalytics(userId, startDate, endDate);
        const inventoryData = await getInventoryAnalytics(userId);

        setSpendingAnalytics(spendingData);
        setInventoryAnalytics(inventoryData);
      } catch (err) {
        const userFriendlyMessage = errorHandler(err, 'Failed to fetch analytics.');
        setError(userFriendlyMessage);
      } finally {
        setLoading(false);
      }
    };

    // Fetch analytics when userId, startDate, or endDate change
    if (userId && startDate && endDate) {
        fetchAnalytics();
    } else {
        // Reset state if required parameters are missing
        setSpendingAnalytics(null);
        setInventoryAnalytics(null);
        setLoading(false);
        setError(null);
    }
  }, [userId, startDate, endDate]); // Dependencies for useEffect

  return {
    spendingAnalytics,
    inventoryAnalytics,
    loading,
    error,
  };
};

export default useAnalytics;
