import { useState, useEffect, useMemo } from 'react'; //correct

import { useAuth } from '../../../features/auth/hooks/useAuth'; //correct
import { useToast } from '../../../shared/hooks/useToast'; //correct
import api from '../../../shared/services/api'; //correct
import { localCache } from '../../../shared/services/storage'; // Assuming localCache is a simple key-value store with get/set/remove
import { formatDate } from '../../../shared/utils/date'; //correct
import { logger } from '../../../shared/utils/logger'; //correct

/**
 * @typedef {object} ReportData
 * @property {Array<object>} spending - Spending data points.
 * @property {Array<object>} categories - Category breakdown data.
 * @property {Array<object>} trends - Trend data points.
 * // Add other relevant report data properties here
 */

/**
 * @typedef {object} ReportFilters
 * @property {string} startDate - Start date for reports (yyyy-MM-dd).
 * @property {string} endDate - End date for reports (yyyy-MM-dd).
 * @property {string} category - Filter by category ('all' or category ID).
 * @property {string} groupBy - Grouping for trends ('day', 'week', 'month', etc.).
 * // Add other relevant filter properties here
 */

/**
 * @typedef {object} ReportSummaries
 * @property {number} totalSpent - Total spending in the period.
 * @property {number} avgPerDay - Average spending per day.
 * @property {number} maxSpending - Maximum spending on a single day.
 * @property {number} minSpending - Minimum spending on a single day.
 * @property {number} transactionCount - Number of transactions.
 * // Add other relevant summary properties here
 */

/**
 * @typedef {object} CategoryAnalysis
 * @property {string} name - Category name.
 * @property {number} total - Total spent in the category.
 * @property {number} percentage - Percentage of total spending in this category.
 * // Add other relevant category analysis properties here
 */

/**
 * @typedef {object} TrendAnalysis
 * @property {Array<object>} data - Trend data points.
 * @property {number} growth - Growth rate percentage.
 * @property {Array<object>} forecast - Forecasted data points.
 * // Add other relevant trend analysis properties here
 */

/**
 * @typedef {object} UseReportsReturn
 * @property {boolean} loading - Loading state.
 * @property {string|null} error - Error message if fetching failed.
 * @property {ReportData} reports - Fetched report data.
 * @property {ReportFilters} filters - Current filter state.
 * @property {ReportSummaries|null} summaries - Calculated report summaries.
 * @property {CategoryAnalysis[]|null} categoryAnalysis - Calculated category analysis.
 * @property {TrendAnalysis|null} trendAnalysis - Calculated trend analysis.
 * @property {function(object): void} updateFilters - Function to update filter state.
 * @property {function(): Promise<void>} fetchReports - Function to manually refetch reports.
 * @property {function(string): Promise<void>} exportReport - Function to export report data.
 */


// Helper function to calculate growth rate
/**
 * @desc Calculates the growth rate percentage from a series of data points.
 * @param {Array<object>} data - Array of data points with an 'amount' field.
 * @returns {number} - Growth rate percentage.
 */
const calculateGrowthRate = data => {
  if (!data || data.length < 2) return 0;
  const firstValue = data[0].amount;
  const lastValue = data[data.length - 1].amount;
  if (firstValue === 0) return lastValue > 0 ? 100 : 0; // Handle division by zero
  return ((lastValue - firstValue) / firstValue) * 100;
};

// Helper function to generate simple forecast
/**
 * @desc Generates a simple linear forecast based on historical data.
 * @param {Array<object>} data - Array of historical data points with 'date' and 'amount' fields.
 * @returns {Array<object>} - Array of forecasted data points.
 */
const generateForecast = data => {
  if (!data || data.length < 2) return [];

  // Simple linear regression
  const xValues = data.map((_, i) => i);
  const yValues = data.map(item => item.amount);

  const n = data.length;
  const sumX = xValues.reduce((a, b) => a + b, 0);
  const sumY = yValues.reduce((a, b) => a + b, 0);
  const sumXY = xValues.reduce((a, b, i) => a + b * yValues[i], 0);
  const sumXX = xValues.reduce((a, b) => a + b * b, 0);

  const denominator = (n * sumXX - sumX * sumX);
  if (denominator === 0) {
      // Cannot calculate slope, return a flat forecast based on the last value
      const lastAmount = data[data.length - 1].amount;
      return Array.from({ length: 7 }, (_, i) => ({
          date: new Date(data[data.length - 1].date).setDate(
              new Date(data[data.length - 1].date).getDate() + i + 1
          ),
          amount: lastAmount,
      }));
  }

  const slope = (n * sumXY - sumX * sumY) / denominator;
  const intercept = (sumY - slope * sumX) / n;

  // Generate next 7 points
  return Array.from({ length: 7 }, (_, i) => ({
    date: new Date(data[data.length - 1].date).setDate(
      new Date(data[data.length - 1].date).getDate() + i + 1
    ),
    amount: slope * (data.length + i) + intercept,
  }));
};

/**
 * @desc Custom hook for fetching and analyzing analytics reports.
 * Manages loading, error, report data, filters, and calculated summaries/analysis.
 * @param {object} [initialFilters={}] - Initial filter values.
 * @returns {UseReportsReturn} - Object containing report data, state, and functions.
 */
export const useReports = (initialFilters = {}) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reports, setReports] = useState({
    spending: null,
    categories: null,
    trends: null,
  });
  const [filters, setFilters] = useState({
    startDate: formatDate(new Date(new Date().setDate(1)), 'yyyy-MM-dd'),
    endDate: formatDate(new Date(), 'yyyy-MM-dd'),
    category: 'all',
    groupBy: 'day',
    ...initialFilters,
  });

  // Summaries calculation
  const summaries = useMemo(() => {
    if (!reports.spending) return null;

    const totalSpent = reports.spending.reduce((sum, item) => sum + item.amount, 0);
    const avgPerDay = reports.spending.length > 0 ? totalSpent / reports.spending.length : 0;
    const maxSpending =
      reports.spending.length > 0 ? Math.max(...reports.spending.map(item => item.amount)) : 0;
    const minSpending =
      reports.spending.length > 0 ? Math.min(...reports.spending.map(item => item.amount)) : 0;

    return {
      totalSpent,
      avgPerDay,
      maxSpending,
      minSpending,
      transactionCount: reports.spending.length,
    };
  }, [reports.spending]);

  // Category analysis
  const categoryAnalysis = useMemo(() => {
    if (!reports.categories || !summaries) return null;

    return reports.categories.map(category => ({
      ...category,
      percentage: summaries.totalSpent > 0 ? (category.total / summaries.totalSpent) * 100 : 0,
    }));
  }, [reports.categories, summaries]);

  // Trend analysis
  const trendAnalysis = useMemo(() => {
    if (!reports.trends) return null;

    return {
      data: reports.trends,
      growth: calculateGrowthRate(reports.trends),
      forecast: generateForecast(reports.trends),
    };
  }, [reports.trends]);

  // Fetch reports data
  /**
   * @desc Fetches report data from the backend API based on current filters.
   * Updates local state with fetched data or error. Uses caching.
   * @returns {Promise<void>}
   */
  const fetchReports = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      // Check cache first
      const cacheKey = `reports_${user.uid}_${filters.startDate}_${filters.endDate}`;
      const cachedData = localCache.get(cacheKey);

      if (cachedData) {
        setReports(cachedData);
        logger.debug(`Reports loaded from cache for user ${user.uid}`);
        return;
      }

      // Fetch spending data
      // Assuming api.reports has methods like getSpendingReport, getCategoryReport, getTrendsReport
      const [spendingRes, categoriesRes, trendsRes] = await Promise.all([
        api.reports.getSpendingReport(filters),
        api.reports.getCategoryReport(filters),
        api.reports.getTrendsReport(filters),
      ]);

      const newReports = {
        spending: spendingRes.data,
        categories: categoriesRes.data,
        trends: trendsRes.data,
      };

      setReports(newReports);

      // Cache the results
      localCache.set(cacheKey, newReports, 5 * 60 * 1000); // Cache for 5 minutes
      logger.debug(`Reports cached for user ${user.uid}`);

    } catch (err) {
      const message = err.response?.data?.message || 'Failed to fetch reports';
      setError(message);
      showToast(message, 'error');
      logger.error('Error fetching reports:', err);
    } finally {
      setLoading(false);
    }
  };

  // Update filters
  /**
   * @desc Updates the filter state and triggers a refetch of reports.
   * @param {object} newFilters - Object containing the new filter values to merge.
   * @returns {void}
   */
  const updateFilters = newFilters => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
    }));
  };

  // Export report data
  /**
   * @desc Exports the current report data in the specified format.
   * Calls the backend export API and triggers a file download.
   * @param {string} [format='csv'] - The export format ('csv', 'pdf', 'json').
   * @returns {Promise<void>}
   */
  const exportReport = async (format = 'csv') => {
    try {
      // Assuming api.reports.exportReport exists and handles the backend call
      const response = await api.reports.exportReport({
        ...filters,
        format,
      });

      // Assuming the backend returns the file data directly or a download URL
      // This implementation assumes the backend returns the file data as a Blob
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `report_${formatDate(new Date(), 'yyyy-MM-dd')}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url); // Clean up the object URL

      showToast('Report exported successfully', 'success');

    } catch (err) {
      const message = err.response?.data?.message || 'Failed to export report';
      showToast(message, 'error');
      logger.error('Error exporting report:', err);
    }
  };

  // Fetch reports when filters change
  useEffect(() => {
    if (user) {
      fetchReports();
    }
  }, [user, filters]); // Dependencies for useEffect

  return {
    loading,
    error,
    reports,
    filters,
    summaries,
    categoryAnalysis,
    trendAnalysis,
    updateFilters,
    fetchReports,
    exportReport,
  };
};

export default useReports;
