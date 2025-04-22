"use strict";
const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/auth/auth'); //good
const analyticsController = require('../controllers/analyticsController'); //good
const { validate } = require('../middleware/validation/validation'); //good
// Apply authentication to all routes
router.use(authenticateUser);
// Price Analytics Routes
router.get('/prices/:productId', validate({
    params: {
        productId: { type: 'string', required: true }
    },
    query: {
        startDate: { type: 'date', optional: true },
        endDate: { type: 'date', optional: true }
    }
}), analyticsController.getPriceAnalytics);
// Spending Analysis Routes
router.get('/spending', validate({
    query: {
        startDate: { type: 'date', required: true },
        endDate: { type: 'date', required: true },
        groupBy: { type: 'string', optional: true, enum: ['category', 'vendor', 'month'] }
    }
}), analyticsController.getSpendingAnalysis);
// Vendor Analysis Routes
router.get('/vendors', validate({
    query: {
        vendorIds: { type: 'string', optional: true },
        productIds: { type: 'string', optional: true }
    }
}), analyticsController.getVendorAnalysis);
// Inventory Analytics Routes
router.get('/inventory', analyticsController.getInventoryAnalytics);
// Category Analysis Routes
router.get('/categories/:categoryId', validate({
    params: {
        categoryId: { type: 'string', required: true }
    },
    query: {
        startDate: { type: 'date', optional: true },
        endDate: { type: 'date', optional: true }
    }
}), analyticsController.getCategoryAnalysis);
// Dashboard Analytics Route
router.get('/dashboard', validate({
    query: {
        period: { type: 'string', optional: true, enum: ['7d', '30d', '90d', '1y'] }
    }
}), analyticsController.getDashboardAnalytics);
// Reports Routes
router.get('/reports/price-comparison', validate({
    query: {
        productIds: { type: 'string', required: true },
        timeframe: { type: 'string', optional: true }
    }
}), analyticsController.getPriceComparisonReport);
router.get('/reports/vendor-performance', validate({
    query: {
        vendorIds: { type: 'string', optional: true },
        startDate: { type: 'date', optional: true },
        endDate: { type: 'date', optional: true }
    }
}), analyticsController.getVendorPerformanceReport);
router.get('/reports/inventory-turnover', validate({
    query: {
        categoryId: { type: 'string', optional: true },
        period: { type: 'string', optional: true }
    }
}), analyticsController.getInventoryTurnoverReport);
router.get('/reports/spending-trends', validate({
    query: {
        startDate: { type: 'date', required: true },
        endDate: { type: 'date', required: true },
        groupBy: { type: 'string', optional: true }
    }
}), analyticsController.getSpendingTrendsReport);
// Export Routes
router.post('/export', validate({
    body: {
        reportType: { type: 'string', required: true },
        format: { type: 'string', required: true, enum: ['pdf', 'csv', 'excel'] },
        filters: { type: 'object', optional: true }
    }
}), analyticsController.exportAnalytics);
// Custom Analysis Routes
router.post('/custom', validate({
    body: {
        metrics: { type: 'array', required: true },
        filters: { type: 'object', optional: true },
        groupBy: { type: 'string', optional: true },
        timeframe: { type: 'object', optional: true }
    }
}), analyticsController.getCustomAnalytics);
module.exports = router;
