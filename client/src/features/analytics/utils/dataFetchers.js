import { db } from '../../../core/config/firebase';
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  Timestamp
} from 'firebase/firestore';
import { errorHandler } from '../../../utils/errorHandler';

// Helper to generate date ranges based on period
const getDateRange = (period) => {
  const now = new Date();
  let startDate;

  switch(period) {
    case 'week':
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 7);
      break;
    case 'month':
      startDate = new Date(now);
      startDate.setMonth(now.getMonth() - 1);
      break;
    case 'quarter':
      startDate = new Date(now);
      startDate.setMonth(now.getMonth() - 3);
      break;
    case 'year':
      startDate = new Date(now);
      startDate.setFullYear(now.getFullYear() - 1);
      break;
    default:
      startDate = new Date(now);
      startDate.setMonth(now.getMonth() - 1); // Default to month
  }

  return {
    start: Timestamp.fromDate(startDate),
    end: Timestamp.fromDate(now)
  };
};

// Fetch user receipts for analytics
export const fetchUserReceipts = async (userId, period = 'month') => {
  try {
    const receiptsRef = collection(db, 'receipts');
    const dateRange = getDateRange(period);

    const q = query(
      receiptsRef,
      where('userId', '==', userId),
      where('date', '>=', dateRange.start),
      where('date', '<=', dateRange.end),
      orderBy('date', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const receipts = [];

    querySnapshot.forEach((doc) => {
      receipts.push({ id: doc.id, ...doc.data() });
    });

    return receipts;
  } catch (error) {
    throw errorHandler(error, 'Error fetching user receipts for analytics');
  }
};

// Fetch user receipts by year
export const fetchReceiptsByYear = async (userId, year) => {
  try {
    const startDate = Timestamp.fromDate(new Date(`${year}-01-01`));
    const endDate = Timestamp.fromDate(new Date(`${year + 1}-01-01`));

    const receiptsRef = collection(db, 'receipts');
    const q = query(
      receiptsRef,
      where('userId', '==', userId),
      where('date', '>=', startDate),
      where('date', '<', endDate),
      orderBy('date', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const receipts = [];

    querySnapshot.forEach((doc) => {
      receipts.push({ id: doc.id, ...doc.data() });
    });

    return receipts;
  } catch (error) {
    throw errorHandler(error, 'Error fetching receipts by year');
  }
};

// Fetch user inventory items
export const fetchUserInventory = async (userId) => {
  try {
    const inventoryRef = collection(db, 'inventory');
    const q = query(
      inventoryRef,
      where('userId', '==', userId)
    );

    const querySnapshot = await getDocs(q);
    const inventoryItems = [];

    querySnapshot.forEach((doc) => {
      inventoryItems.push({ id: doc.id, ...doc.data() });
    });

    return inventoryItems;
  } catch (error) {
    throw errorHandler(error, 'Error fetching user inventory for analytics');
  }
};

// Fetch stock movements for inventory analytics
export const fetchStockMovements = async (userId, period = 'month') => {
  try {
    const dateRange = getDateRange(period);
    const movementsRef = collection(db, 'stockMovements');

    const q = query(
      movementsRef,
      where('userId', '==', userId),
      where('timestamp', '>=', dateRange.start),
      where('timestamp', '<=', dateRange.end),
      orderBy('timestamp', 'desc')
      // Select only necessary fields for analytics calculations
      // .select('inventoryId', 'quantity', 'type', 'timestamp') // Firestore Web SDK does not support select() in query()
    );

    const querySnapshot = await getDocs(q);
    const movements = [];

    querySnapshot.forEach((doc) => {
      // Manually select fields as select() is not supported in query() for Web SDK
      const data = doc.data();
      movements.push({
        id: doc.id,
        inventoryId: data.inventoryId,
        quantity: data.quantity,
        type: data.type,
        timestamp: data.timestamp,
      });
    });

    return movements;
  } catch (error) {
    throw errorHandler(error, 'Error fetching stock movements for analytics');
  }
};
