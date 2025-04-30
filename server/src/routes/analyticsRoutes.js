const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/auth/auth');
const analyticsController = require('../controllers/analyticsController');
const { validate } = require('../middleware/validation/validation');

// Apply authentication to all routes
router.use(authenticateUser);

// Analytics Routes (/api/analytics)

// Price Analytics
router.get('/prices/:productId',
  validate({
    params: {
      productId: { type: 'string', required: true }
    },
    query: {
      startDate: { type: 'date', optional: true },
      endDate: { type: 'date', optional: true }
    }
  }),
  analyticsController.getPriceAnalytics
);

// Spending Analysis
router.get('/spending',
  validate({
    query: {
      startDate: { type: 'date', required: true },
      endDate: { type: 'date', required: true },
      groupBy: { type: 'string', optional: true, enum: ['category', 'vendor', 'month'] }
    }
  }),
  analyticsController.getSpendingAnalysis
);

// Vendor Analysis
router.get('/vendors',
  validate({
    query: {
      vendorIds: { type: 'string', optional: true },
      productIds: { type: 'string', optional: true }
    }
  }),
  analyticsController.getVendorAnalysis
);

// Inventory Analytics
router.get('/inventory',
  analyticsController.getInventoryAnalytics
);

// Category Analysis
router.get('/categories/:categoryId',
  validate({
    params: {
      categoryId: { type: 'string', required: true }
    },
    query: {
      startDate: { type: 'date', optional: true },
      endDate: { type: 'date', optional: true }
    }
  }),
  analyticsController.getCategoryAnalysis
);

// Dashboard Analytics
router.get('/dashboard',
  validate({
    query: {
      period: { type: 'string', optional: true, enum: ['7d', '30d', '90d', '1y'] }
    }
  }),
  analyticsController.getDashboardAnalytics
);

// Budget Analytics
router.get('/budget',
  validate({
    query: {
      period: { type: 'string', optional: true, enum: ['month', 'year', 'all'] }, // Assuming budget can be viewed by month/year/all
      categoryId: { type: 'string', optional: true } // Allow filtering by category
    }
  }),
  analyticsController.getBudgetProgress
);


// Reports Routes (Keeping existing report routes for now, assuming they are needed)
router.get('/reports/price-comparison',
  validate({
    query: {
      productIds: { type: 'string', required: true },
      timeframe: { type: 'string', optional: true }
    }
  }),
  analyticsController.getPriceComparisonReport
);

router.get('/reports/vendor-performance',
  validate({
    query: {
      vendorIds: { type: 'string', optional: true },
      startDate: { type: 'date', optional: true },
      endDate: { type: 'date', optional: true }
    }
  }),
  analyticsController.getVendorPerformanceReport
);

router.get('/reports/inventory-turnover',
  validate({
    query: {
      categoryId: { type: 'string', optional: true },
      period: { type: 'string', optional: true }
    }
  }),
  analyticsController.getInventoryTurnoverReport
);

router.get('/reports/spending-trends',
  validate({
    query: {
      startDate: { type: 'date', required: true },
      endDate: { type: 'date', required: true },
      groupBy: { type: 'string', optional: true }
    }
  }),
  analyticsController.getSpendingTrendsReport
);

// Export Routes (Keeping existing export route for now)
router.post('/export',
  validate({
    body: {
      reportType: { type: 'string', required: true },
      format: { type: 'string', required: true, enum: ['pdf', 'csv', 'excel'] },
      filters: { type: 'object', optional: true }
    }
  }),
  analyticsController.exportAnalytics
);

// Custom Analysis Routes (Keeping existing custom route for now)
router.post('/custom',
  validate({
    body: {
      metrics: { type: 'array', required: true },
      filters: { type: 'object', optional: true },
      groupBy: { type: 'string', optional: true },
      timeframe: { type: 'object', optional: true }
    }
  }),
  analyticsController.getCustomAnalytics
);


module.exports = router;
