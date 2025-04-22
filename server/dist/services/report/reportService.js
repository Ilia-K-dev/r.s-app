"use strict";
const { db } = require('../../../config/firebase'); //good
const { AppError } = require('../../utils/error/AppError'); //good
class ReportService {
    async generateSpendingReport(userId, startDate, endDate) {
        try {
            const snapshot = await db.collection('receipts')
                .where('userId', '==', userId)
                .where('date', '>=', startDate)
                .where('date', '<=', endDate)
                .get();
            const receipts = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            // Calculate total spending
            const totalSpending = receipts.reduce((sum, receipt) => sum + receipt.total, 0);
            // Calculate spending by category
            const spendingByCategory = receipts.reduce((acc, receipt) => {
                const category = receipt.category || 'Uncategorized';
                acc[category] = (acc[category] || 0) + receipt.total;
                return acc;
            }, {});
            // Calculate spending by store
            const spendingByStore = receipts.reduce((acc, receipt) => {
                const store = receipt.storeName || 'Unknown';
                acc[store] = (acc[store] || 0) + receipt.total;
                return acc;
            }, {});
            return {
                totalSpending,
                spendingByCategory,
                spendingByStore,
                receiptCount: receipts.length,
                startDate,
                endDate
            };
        }
        catch (error) {
            throw new AppError('Error generating report', 500);
        }
    }
}
module.exports = new ReportService();
