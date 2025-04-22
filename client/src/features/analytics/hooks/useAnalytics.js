import { useState, useEffect } from 'react';//correct
import { getSpendingAnalytics, getInventoryAnalytics } from '../services/analyticsService';//correct

export const useAnalytics = (userId, startDate, endDate) => {
  const [spendingAnalytics, setSpendingAnalytics] = useState(null);
  const [inventoryAnalytics, setInventoryAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const spendingData = await getSpendingAnalytics(userId, startDate, endDate);
        const inventoryData = await getInventoryAnalytics(userId);

        setSpendingAnalytics(spendingData);
        setInventoryAnalytics(inventoryData);
        setLoading(false);
      } catch (error) {
        setError('Error fetching analytics: ' + error.message);
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [userId, startDate, endDate]);

  return {
    spendingAnalytics,
    inventoryAnalytics,
    loading,
    error
  };
};