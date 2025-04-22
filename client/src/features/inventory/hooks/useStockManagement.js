import { useState } from 'react';//correct
import { db } from '../../../core/config/firebase';//correct

export const useStockManagement = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const updateStock = async (itemId, quantity, action) => {
    try {
      setLoading(true);
      setError(null);

      const itemRef = db.collection('inventory').doc(itemId);
      const itemDoc = await itemRef.get();

      if (!itemDoc.exists) {
        throw new Error('Item not found');
      }

      const currentStock = itemDoc.data().quantity;
      const newStock = action === 'add' ? currentStock + quantity : currentStock - quantity;

      if (newStock < 0) {
        throw new Error('Stock quantity cannot be negative');
      }

      await itemRef.update({ quantity: newStock });
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    updateStock
  };
};