import { db } from '../../../core/config/firebase'; //correct

export const getSpendingAnalytics = async (userId, startDate, endDate) => {
  try {
    const receiptsRef = db
      .collection('receipts')
      .where('userId', '==', userId)
      .where('date', '>=', startDate)
      .where('date', '<=', endDate);

    const snapshot = await receiptsRef.get();
    const receipts = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    const totalSpending = receipts.reduce((sum, receipt) => sum + receipt.totalAmount, 0);
    const categoryBreakdown = receipts.reduce((breakdown, receipt) => {
      receipt.items.forEach(item => {
        const category = item.category;
        breakdown[category] = (breakdown[category] || 0) + item.totalPrice;
      });
      return breakdown;
    }, {});

    return {
      totalSpending,
      categoryBreakdown,
      receipts,
    };
  } catch (error) {
    console.error('Error getting spending analytics:', error);
    throw error;
  }
};

export const getInventoryAnalytics = async userId => {
  try {
    const inventoryRef = db.collection('inventory').where('userId', '==', userId);

    const snapshot = await inventoryRef.get();
    const inventory = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    const totalValue = inventory.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    const lowStockItems = inventory.filter(item => item.quantity <= item.reorderPoint);
    const categoryBreakdown = inventory.reduce((breakdown, item) => {
      const category = item.category;
      breakdown[category] = (breakdown[category] || 0) + item.quantity * item.unitPrice;
      return breakdown;
    }, {});

    return {
      totalValue,
      lowStockItems,
      categoryBreakdown,
      inventory,
    };
  } catch (error) {
    console.error('Error getting inventory analytics:', error);
    throw error;
  }
};
