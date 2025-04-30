import { collection, query, where, getDocs, orderBy } from 'firebase/firestore'; //correct

import { db } from '../../../core/config/firebase'; //correct

export const reportsApi = {
  getSpendingByCategory: async (userId, startDate, endDate) => {
    try {
      const receiptsRef = collection(db, 'receipts');
      const q = query(
        receiptsRef,
        where('userId', '==', userId),
        where('date', '>=', startDate),
        where('date', '<=', endDate),
        orderBy('date', 'desc')
      );

      const snapshot = await getDocs(q);
      const receipts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Group and sum by category
      const categoryTotals = receipts.reduce((acc, receipt) => {
        const { category, total } = receipt;
        acc[category] = (acc[category] || 0) + total;
        return acc;
      }, {});

      return Object.entries(categoryTotals).map(([category, total]) => ({
        category,
        total,
      }));
    } catch (error) {
      throw new Error('Failed to fetch spending by category');
    }
  },

  getMonthlySpending: async (userId, year) => {
    try {
      const startDate = new Date(year, 0, 1).toISOString();
      const endDate = new Date(year, 11, 31).toISOString();

      const receiptsRef = collection(db, 'receipts');
      const q = query(
        receiptsRef,
        where('userId', '==', userId),
        where('date', '>=', startDate),
        where('date', '<=', endDate),
        orderBy('date', 'asc')
      );

      const snapshot = await getDocs(q);
      const receipts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Group by month
      const monthlyTotals = receipts.reduce((acc, receipt) => {
        const month = new Date(receipt.date).getMonth();
        acc[month] = (acc[month] || 0) + receipt.total;
        return acc;
      }, {});

      // Fill in missing months with 0
      const months = Array.from({ length: 12 }, (_, i) => ({
          month: new Date(year, i).toLocaleString('default', { month: 'short' }),
          total: monthlyTotals[i] || 0,
        }));

      return months;
    } catch (error) {
      throw new Error('Failed to fetch monthly spending');
    }
  },

  getBudgetProgress: async userId => {
    try {
      // Get categories with budgets
      const categoriesRef = collection(db, 'categories');
      const categoriesSnapshot = await getDocs(query(categoriesRef, where('userId', '==', userId)));
      const categories = categoriesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Get current month's receipts
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const receiptsRef = collection(db, 'receipts');
      const receiptsSnapshot = await getDocs(
        query(
          receiptsRef,
          where('userId', '==', userId),
          where('date', '>=', startOfMonth.toISOString())
        )
      );

      const receipts = receiptsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Calculate spending by category
      const spending = receipts.reduce((acc, receipt) => {
        acc[receipt.category] = (acc[receipt.category] || 0) + receipt.total;
        return acc;
      }, {});

      // Combine budget and spending data
      return categories.map(category => ({
        id: category.id,
        name: category.name,
        budget: category.budget || 0,
        spent: spending[category.name] || 0,
      }));
    } catch (error) {
      throw new Error('Failed to fetch budget progress');
    }
  },
};
