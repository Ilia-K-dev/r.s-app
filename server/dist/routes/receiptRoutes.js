"use strict";
const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/auth/auth');
const receiptController = require('../controllers/receiptController');
const { upload } = require('../middleware/upload');
const { validate } = require('../middleware/validation/validation');
const { validateReceipt } = require('../utils/validation/validators'); // good
const DocumentValidation = require('../middleware/validation/documentValidation');
const AppError = require('../utils/error/AppError'); // Ensure AppError is imported
// Apply authentication middleware to all routes
router.use(authenticateUser);
// Upload and process document
router.post('/upload', upload.single('document'), DocumentValidation.getValidationMiddleware({
    validateDimensions: true,
    validateOptions: true
}), receiptController.uploadReceipt);
// Bulk upload documents
router.post('/upload/bulk', upload.array('documents', 10), DocumentValidation.getValidationMiddleware({
    validateDimensions: true,
    validateOptions: true,
    validateBatch: true
}), receiptController.uploadBulkReceipts);
// Get receipts with filtering and pagination
router.get('/', validate({
    query: {
        startDate: { type: 'date', optional: true },
        endDate: { type: 'date', optional: true },
        category: { type: 'string', optional: true },
        vendor: { type: 'string', optional: true },
        minAmount: { type: 'number', optional: true },
        maxAmount: { type: 'number', optional: true },
        sortBy: { type: 'string', optional: true },
        sortOrder: { type: 'string', optional: true },
        page: { type: 'number', optional: true },
        limit: { type: 'number', optional: true }
    }
}), (req, res, next) => {
    const { startDate, endDate, minAmount, maxAmount, page, limit } = req.query;
    if (startDate && isNaN(Date.parse(startDate))) {
        return next(new AppError('Invalid start date', 400));
    }
    if (endDate && isNaN(Date.parse(endDate))) {
        return next(new AppError('Invalid end date', 400));
    }
    if (minAmount && isNaN(minAmount)) {
        return next(new AppError('Invalid minimum amount', 400));
    }
    if (maxAmount && isNaN(maxAmount)) {
        return next(new AppError('Invalid maximum amount', 400));
    }
    if (page && (isNaN(page) || page < 1)) {
        return next(new AppError('Invalid page number', 400));
    }
    if (limit && (isNaN(limit) || limit < 1)) {
        return next(new AppError('Invalid limit', 400));
    }
    next();
}, receiptController.getReceipts);
// Get receipt by ID
router.get('/:id', validate({
    params: {
        id: { type: 'string', required: true }
    }
}), receiptController.getReceiptById);
// Update receipt
router.put('/:id', validate({
    params: {
        id: { type: 'string', required: true }
    }
}), (req, res, next) => {
    validateReceipt(req.body);
    next();
}, receiptController.updateReceipt);
// Delete receipt
router.delete('/:id', validate({
    params: {
        id: { type: 'string', required: true }
    }
}), receiptController.deleteReceipt);
// Process scanned text
router.post('/process-text', express.json(), validate({
    body: {
        text: { type: 'string', required: true }
    }
}), receiptController.processScannedText);
// Get receipt analysis
router.get('/:id/analysis', validate({
    params: {
        id: { type: 'string', required: true }
    }
}), receiptController.getReceiptAnalysis);
// Export receipts
router.post('/export', validate({
    body: {
        format: { type: 'string', enum: ['pdf', 'csv', 'excel'], required: true },
        receipts: { type: 'array', optional: true },
        filters: { type: 'object', optional: true }
    }
}), receiptController.exportReceipts);
// Get receipt categories summary
router.get('/categories/summary', validate({
    query: {
        startDate: { type: 'date', optional: true },
        endDate: { type: 'date', optional: true }
    }
}), receiptController.getCategoriesSummary);
// Get spending trends
router.get('/trends', validate({
    query: {
        startDate: { type: 'date', optional: true },
        endDate: { type: 'date', optional: true },
        groupBy: { type: 'string', enum: ['day', 'week', 'month'], optional: true }
    }
}), receiptController.getSpendingTrends);
// Compare prices across vendors
router.post('/compare-prices', validate({
    body: {
        items: { type: 'array', required: true },
        dateRange: { type: 'object', optional: true }
    }
}), receiptController.comparePrices);
// Get similar receipts
router.get('/:id/similar', validate({
    params: {
        id: { type: 'string', required: true }
    },
    query: {
        limit: { type: 'number', optional: true }
    }
}), receiptController.getSimilarReceipts);
// Define receiptController functions as middleware
const receiptMiddleware = {
    uploadReceipt: receiptController.uploadReceipt.bind(receiptController),
    uploadBulkReceipts: receiptController.uploadBulkReceipts.bind(receiptController),
    getReceipts: receiptController.getReceipts.bind(receiptController),
    getReceiptById: receiptController.getReceiptById.bind(receiptController),
    updateReceipt: receiptController.updateReceipt.bind(receiptController),
    deleteReceipt: receiptController.deleteReceipt.bind(receiptController),
    processScannedText: receiptController.processScannedText.bind(receiptController),
    getReceiptAnalysis: receiptController.getReceiptAnalysis.bind(receiptController),
    exportReceipts: receiptController.exportReceipts.bind(receiptController),
    getCategoriesSummary: receiptController.getCategoriesSummary.bind(receiptController),
    getSpendingTrends: receiptController.getSpendingTrends.bind(receiptController),
    comparePrices: receiptController.comparePrices.bind(receiptController),
    getSimilarReceipts: receiptController.getSimilarReceipts.bind(receiptController)
};
module.exports = router;
