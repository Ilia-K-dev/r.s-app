import { useState, useEffect, useMemo } from 'react';//correct
import { useAuth } from '../../../features/auth/hooks/useAuth';//correct
import { useToast } from '../../../shared/hooks/useToast';//correct
import { formatDate } from '../../../shared/utils/date';//correct
import { localCache } from '../../../shared/services/storage';//correct
import { logger } from '../../../shared/utils/logger';//correct
import api from '../../../shared/services/api';//correct

// Helper function to calculate growth rate
const calculateGrowthRate = (data) => {
  if (!data || data.length < 2) return 0;
  const firstValue = data[0].amount;
  const lastValue = data[data.length - 1].amount;
  return ((lastValue - firstValue) / firstValue) * 100;
};

// Helper function to generate simple forecast
const generateForecast = (data) => {
  if (!data || data.length < 2) return [];
  
  // Simple linear regression
  const xValues = data.map((_, i) => i);
  const yValues = data.map(item => item.amount);
  
  const n = data.length;
  const sumX = xValues.reduce((a, b) => a + b, 0);
  const sumY = yValues.reduce((a, b) => a + b, 0);
  const sumXY = xValues.reduce((a, b, i) => a + b * yValues[i], 0);
  const sumXX = xValues.reduce((a, b) => a + b * b, 0);
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  
  // Generate next 7 points
  return Array.from({ length: 7 }, (_, i) => ({
    date: new Date(data[data.length - 1].date).setDate(
      new Date(data[data.length - 1].date).getDate() + i + 1
    ),
    amount: slope * (data.length + i) + intercept
  }));
};

export const useReports = (initialFilters = {}) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reports, setReports] = useState({
    spending: null,
    categories: null,
    trends: null
  });
  const [filters, setFilters] = useState({
    startDate: formatDate(new Date(new Date().setDate(1)), 'yyyy-MM-dd'),
    endDate: formatDate(new Date(), 'yyyy-MM-dd'),
    category: 'all',
    groupBy: 'day',
    ...initialFilters
  });

  // Summaries calculation
  const summaries = useMemo(() => {
    if (!reports.spending) return null;

    const totalSpent = reports.spending.reduce((sum, item) => sum + item.amount, 0);
    const avgPerDay = reports.spending.length > 0 
      ? totalSpent / reports.spending.length 
      : 0;
    const maxSpending = reports.spending.length > 0
      ? Math.max(...reports.spending.map(item => item.amount))
      : 0;
    const minSpending = reports.spending.length > 0
      ? Math.min(...reports.spending.map(item => item.amount))
      : 0;

    return {
      totalSpent,
      avgPerDay,
      maxSpending,
      minSpending,
      transactionCount: reports.spending.length
    };
  }, [reports.spending]);

  // Category analysis
  const categoryAnalysis = useMemo(() => {
    if (!reports.categories || !summaries) return null;

    return reports.categories.map(category => ({
      ...category,
      percentage: summaries.totalSpent > 0 
        ? (category.total / summaries.totalSpent) * 100 
        : 0
    }));
  }, [reports.categories, summaries]);

  // Trend analysis
  const trendAnalysis = useMemo(() => {
    if (!reports.trends) return null;

    return {
      data: reports.trends,
      growth: calculateGrowthRate(reports.trends),
      forecast: generateForecast(reports.trends)
    };
  }, [reports.trends]);

  // Fetch reports data
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
        return;
      }

      // Fetch spending data
      const [spendingRes, categoriesRes, trendsRes] = await Promise.all([
        api.reports.getSpendingReport(filters),
        api.reports.getCategoryReport(filters),
        api.reports.getTrendsReport(filters)
      ]);

      const newReports = {
        spending: spendingRes.data,
        categories: categoriesRes.data,
        trends: trendsRes.data
      };

      setReports(newReports);
      
      // Cache the results
      localCache.set(cacheKey, newReports, 5 * 60 * 1000); // Cache for 5 minutes
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
  const updateFilters = (newFilters) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters
    }));
  };

  // Export report data
  const exportReport = async (format = 'csv') => {
    try {
      const response = await api.reports.exportReport({
        ...filters,
        format
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `report_${formatDate(new Date(), 'yyyy-MM-dd')}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      showToast('Failed to export report', 'error');
      logger.error('Error exporting report:', err);
    }
  };

  // Fetch reports when filters change
  useEffect(() => {
    if (user) {
      fetchReports();
    }
  }, [user, filters]);

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
    exportReport
  };
};

export default useReports;