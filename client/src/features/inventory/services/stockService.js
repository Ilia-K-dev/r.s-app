import { db } from '../../../core/config/firebase';//correct

export const getStockMovements = async (itemId) => {
  try {
    const movementsRef = db.collection('stockMovements')
      .where('itemId', '==', itemId)
      .orderBy('timestamp', 'desc');

    const snapshot = await movementsRef.get();
    const movements = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    }));

    return movements;
  } catch (error) {
    console.error('Error getting stock movements:', error);
    throw error;
  }
};

export const addStockMovement = async (itemId, quantity, type, reason) => {
  try {
    const movementRef = await db.collection('stockMovements').add({
      itemId,
      quantity,
      movementType: type,
      reason,
      timestamp: new Date().toISOString()
    });

    return {
      id: movementRef.id,
      itemId,
      quantity,
      movementType: type,
      reason,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error adding stock movement:', error);
    throw error;
  }
};