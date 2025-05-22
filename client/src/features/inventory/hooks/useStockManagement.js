import { useState } from 'react';
import { inventoryService } from '../services/inventoryService';
import { useToast } from '../../../shared/hooks/useToast';

export const useStockManagement = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { showToast } = useToast();

  const updateStock = async (itemId, quantity, action) => {
    try {
      setLoading(true);
      setError(null);

      // Call the inventory service to update stock
      await inventoryService.updateStock(itemId, quantity);

      showToast('Stock updated successfully', 'success');
    } catch (error) {
      setError(error.message);
      showToast(error.message, 'error');
      console.error('Error updating stock:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    updateStock,
  };
};

export default useStockManagement;
