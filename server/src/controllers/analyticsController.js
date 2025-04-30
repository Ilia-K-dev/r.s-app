const analyticsService = require('../services/analytics/analyticsService'); //good
const { AppError } = require('../utils/error/AppError'); //good
const logger = require('../utils/logger'); //good

const analyticsController = {
  // Price Analytics

  /**
   * @desc Get price analytics and history for a specific product.
   * @route GET /api/analytics/price/:productId
   * @access Private (Authenticated User)
   * @param {object} req - Express request object
   * @param {object} req.params - Route parameters
   * @param {string} req.params.productId - The ID of the product.
   * @param {object} req.query - Query parameters for filtering by date range.
   * @param {string} [req.query.startDate] - Start date for the price history (ISO 8601).
   * @param {string} [req.query.endDate] - End date for the price history (ISO 8601).
   * @param {object} res - Express response object
   * @param {function} next - Express next middleware function
   */
  async getPriceAnalytics(req, res, next) {
    try {
      const { productId } = req.params;
      const { startDate, endDate } = req.query;

      const priceHistory = await analyticsService.getPriceHistory(
        productId,
        startDate ? new Date(startDate) : null,
        endDate ? new Date(endDate) : null
      );

      const analysis = {
        history: priceHistory,
        statistics: {
          minPrice: Math.min(...priceHistory.map(p => p.newPrice)),
          maxPrice: Math.max(...priceHistory.map(p => p.newPrice)),
          averagePrice: priceHistory.reduce((sum, p) => sum + p.newPrice, 0) / priceHistory.length,
          priceChanges: priceHistory.length - 1,
          lastUpdate: priceHistory[priceHistory.length - 1]?.date
        }
      };

      res.status(200).json({ status: 'success', data: analysis });
    } catch (error) {
      logger.error('Error getting price analytics:', error);
      next(new AppError(error.message, 400));
    }
  },

  // Spending Analysis

  /**
   * @desc Get spending analysis for the authenticated user within a date range.
   * @route GET /api/analytics/spending
   * @access Private (Authenticated User)
   * @param {object} req - Express request object
   * @param {object} req.query - Query parameters for date range and grouping.
   * @param {string} req.query.startDate - Start date for the analysis (ISO 8601).
   * @param {string} req.query.endDate - End date for the analysis (ISO 8601).
   * @param {string} [req.query.groupBy='category'] - Field to group spending by ('category', 'vendor', 'month', etc.).
   * @param {object} res - Express response object
   * @param {function} next - Express next middleware function
   */
  async getSpendingAnalysis(req, res, next) {
    try {
      const { startDate, endDate, groupBy = 'category' } = req.query;
      const analysis = await analyticsService.getSpendingAnalysis(
        req.user.uid,
        new Date(startDate),
        new Date(endDate)
      );

      const predictions = await analyticsService.predictSpending(analysis.trends);
      analysis.predictions = predictions;

      const summary = {
        totalSpent: analysis.totalSpent,
        averagePerMonth: analysis.totalSpent / Object.keys(analysis.byMonth).length,
        topCategory: Object.entries(analysis.byCategory).sort((a, b) => b[1] - a[1])[0],
        topVendor: Object.entries(analysis.byVendor).sort((a, b) => b[1] - a[1])[0]
      };

      res.status(200).json({ status: 'success', data: { analysis, summary } });
    } catch (error) {
      logger.error('Error getting spending analysis:', error);
      next(new AppError(error.message, 400));
    }
  },

  // Vendor Analysis

  /**
   * @desc Get vendor analysis, including price comparison and performance.
   * @route GET /api/analytics/vendors
   * @access Private (Authenticated User)
   * @param {object} req - Express request object
   * @param {object} req.query - Query parameters for filtering vendors/products.
   * @param {string} [req.query.vendorIds] - Comma-separated list of vendor IDs to include.
   * @param {string} [req.query.productIds] - Comma-separated list of product IDs for comparison.
   * @param {object} res - Express response object
   * @param {function} next - Express next middleware function
   */
  async getVendorAnalysis(req, res, next) {
    try {
      const { vendorIds, productIds } = req.query;
      const comparison = await analyticsService.getVendorComparison(
        productIds ? productIds.split(',') : []
      );

      const performance = await analyticsService.calculateVendorPerformance(
        vendorIds ? vendorIds.split(',') : []
      );

      const recommendations = performance.map(vendor => ({
        vendorId: vendor.id,
        name: vendor.name,
        recommendedProducts: vendor.bestPrices,
        potentialSavings: vendor.potentialSavings
      }));

      res.status(200).json({
        status: 'success',
        data: { comparison, performance, recommendations }
      });
    } catch (error) {
      logger.error('Error getting vendor analysis:', error);
      next(new AppError(error.message, 400));
    }
  },

  // Inventory Analytics

  /**
   * @desc Get inventory analytics for the authenticated user.
   * @route GET /api/analytics/inventory
   * @access Private (Authenticated User)
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   * @param {function} next - Express next middleware function
   */
  async getInventoryAnalytics(req, res, next) {
    try {
      const analytics = await analyticsService.getInventoryAnalytics(req.user.uid);
      const roi = await analyticsService.calculateInventoryROI(analytics);
      const recommendations = await analyticsService.getOptimizationRecommendations(analytics);

      const summary = {
        totalValue: analytics.totalValue,
        stockHealth: analytics.stockHealth,
        topCategories: Object.entries(analytics.categorySummary)
          .sort((a, b) => b[1].value - a[1].value)
          .slice(0, 5),
        highTurnover: Object.entries(analytics.turnoverRate)
          .sort((a, b) => b[1].rate - a[1].rate)
          .slice(0, 5)
      };

      res.status(200).json({
        status: 'success',
        data: { analytics, roi, recommendations, summary }
      });
    } catch (error) {
      logger.error('Error getting inventory analytics:', error);
      next(new AppError(error.message, 400));
    }
  },

  // Category Analysis

  /**
   * @desc Get analysis for a specific category for the authenticated user.
   * @route GET /api/analytics/categories/:categoryId
   * @access Private (Authenticated User)
   * @param {object} req - Express request object
   * @param {object} req.params - Route parameters
   * @param {string} req.params.categoryId - The ID of the category.
   * @param {object} req.query - Query parameters for filtering by date range.
   * @param {string} [req.query.startDate] - Start date for the analysis (ISO 8601).
   * @param {string} [req.query.endDate] - End date for the analysis (ISO 8601).
   * @param {object} res - Express response object
   * @param {function} next - Express next middleware function
   */
  async getCategoryAnalysis(req, res, next) {
    try {
      const { categoryId } = req.params;
      const { startDate, endDate } = req.query;

      const analysis = await analyticsService.getCategoryAnalysis(
        req.user.uid,
        categoryId,
        startDate ? new Date(startDate) : null,
        endDate ? new Date(endDate) : null
      );

      const performance = {
        growth: analysis.growth,
        profitMargin: analysis.profitMargin,
        turnoverRate: analysis.turnoverRate
      };

      res.status(200).json({
        status: 'success',
        data: { analysis, trends: analysis.trends, topProducts: analysis.topProducts, performance }
      });
    } catch (error) {
      logger.error('Error getting category analysis:', error);
      next(new AppError(error.message, 400));
    }
  },

  // Dashboard Analytics

  /**
   * @desc Get aggregated analytics data for the user dashboard.
   * @route GET /api/analytics/dashboard
   * @access Private (Authenticated User)
   * @param {object} req - Express request object
   * @param {object} req.query - Query parameters for time period.
   * @param {string} [req.query.period='30d'] - Time period for analysis ('7d', '30d', '90d', '1y').
   * @param {object} res - Express response object
   * @param {function} next - Express next middleware function
   */
  async getDashboardAnalytics(req, res, next) {
    try {
      const { period = '30d' } = req.query;
      const endDate = new Date();
      const startDate = new Date();

      switch (period) {
        case '7d': startDate.setDate(startDate.getDate() - 7); break;
        case '30d': startDate.setDate(startDate.getDate() - 30); break;
        case '90d': startDate.setDate(startDate.getDate() - 90); break;
        case '1y': startDate.setFullYear(startDate.getFullYear() - 1); break;
      }

      const [spending, inventory, vendors] = await Promise.all([
        analyticsService.getSpendingAnalysis(req.user.uid, startDate, endDate),
        analyticsService.getInventoryAnalytics(req.user.uid),
        analyticsService.getVendorPerformanceSummary(req.user.uid)
      ]);

      res.status(200).json({
        status: 'success',
        data: {
          spending: {
            total: spending.totalSpent,
            byCategory: spending.byCategory,
            trend: spending.trends[spending.trends.length - 1]
          },
          inventory: {
            value: inventory.totalValue,
            health: inventory.stockHealth,
            topTurnover: inventory.turnoverRate
          },
          vendors: {
            performance: vendors.performance,
            savings: vendors.potentialSavings
          },
          alerts: {
            lowStock: inventory.stockHealth.critical,
            priceChanges: vendors.significantPriceChanges,
            reorderNeeded: inventory.stockHealth.warning
          }
        }
      });
    } catch (error) {
      logger.error('Error getting dashboard analytics:', error);
      next(new AppError(error.message, 400));
    }
  },

  // Advanced Analytics Methods

  /**
   * @desc Generates a price comparison report for specified products.
   * @route GET /api/analytics/reports/price-comparison
   * @access Private (Authenticated User)
   * @param {object} req - Express request object
   * @param {object} req.query - Query parameters for products and timeframe.
   * @param {string} req.query.productIds - Comma-separated list of product IDs to compare.
   * @param {number} req.query.timeframe - Timeframe in days for analysis.
   * @param {object} res - Express response object
   * @param {function} next - Express next middleware function
   */
  async getPriceComparisonReport(req, res, next) {
    try {
      const { productIds, timeframe } = req.query;
      const productIdArray = productIds.split(',');

      const comparisons = await Promise.all(
        productIdArray.map(async productId => {
          const elasticity = await analyticsService.analyzePriceElasticity( // Corrected service call
            req.user.uid,
            productId,
            parseInt(timeframe)
          );
          return { productId, ...elasticity };
        })
      );

      const summary = {
        averageElasticity: comparisons.reduce((sum, c) => sum + c.elasticity, 0) / comparisons.length,
        priceRanges: comparisons.map(c => c.priceRange),
        recommendations: comparisons.map(c => c.recommendations)
      };

      res.status(200).json({ status: 'success', data: { comparisons, summary } });
    } catch (error) {
      logger.error('Error generating price comparison report:', error);
      next(new AppError(error.message, 400));
    }
  },

  // Helper Methods

  /**
   * @desc Calculates the moving average for a dataset.
   * @param {Array<object>} data - Array of data points with an 'amount' field.
   * @param {number} window - The window size for the moving average.
   * @returns {Array<object>} - Array of data points with calculated moving average.
   */
  _calculateMovingAverage(data, window) {
    const result = [];
    for (let i = window - 1; i < data.length; i++) {
      const sum = data
        .slice(i - window + 1, i + 1)
        .reduce((acc, val) => acc + val.amount, 0);
      result.push({
        month: data[i].month,
        amount: sum / window
      });
    }
    return result;
  },

  /**
   * @desc Calculates the trend line (slope and intercept) for a dataset using linear regression.
   * @param {Array<object>} data - Array of data points with an 'amount' field.
   * @returns {object} - Object containing the slope and intercept of the trend line.
   */
  _calculateTrend(data) {
    const n = data.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;

    data.forEach((point, index) => {
      sumX += index;
      sumY += point.amount;
      sumXY += index * point.amount;
      sumXX += index * index;
    });

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    return { slope, intercept };
  },

  /**
   * @desc Calculates a confidence score for a prediction based on historical data.
   * @param {Array<object>} historical - Array of historical data points with an 'amount' field.
   * @param {number} predictedValue - The predicted value.
   * @returns {number} - Confidence score between 0 and 1.
   */
  _calculatePredictionConfidence(historical, predictedValue) {
    const values = historical.map(h => h.amount);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);

    const zScore = Math.abs(predictedValue - mean) / stdDev;
    return Math.max(0, 1 - (zScore / 3));
  },

  /**
   * @desc Gets budget progress data for the authenticated user.
   * @route GET /api/analytics/budget
   * @access Private (Authenticated User)
   * @param {object} req - Express request object
   * @param {object} req.query - Query parameters for filtering by period and category.
   * @param {string} [req.query.period='month'] - Budget period ('month', 'year', etc.).
   * @param {string} [req.query.categoryId] - Filter by category ID.
   * @param {object} res - Express response object
   * @param {function} next - Express next middleware function
   */
  async getBudgetProgress(req, res, next) {
    try {
      const userId = req.user.uid;
      const { period = 'month', categoryId } = req.query; // Allow filtering by period and category

      const budgetProgress = await analyticsService.getBudgetProgress(userId, period, categoryId);

      res.status(200).json({
        status: 'success',
        data: { budgetProgress }
      });
    } catch (error) {
      logger.error('Error getting budget progress:', error);
      next(new AppError(error.message, 400));
    }
  }
};

module.exports = analyticsController;
