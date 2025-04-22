const analyticsService = require('../services/analytics/analyticsService'); //good
const { AppError } = require('../utils/error/AppError'); //good
const logger = require('../utils/logger'); //good

const analyticsController = {
  // Price Analytics
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
  async getPriceComparisonReport(req, res, next) {
    try {
      const { productIds, timeframe } = req.query;
      const productIdArray = productIds.split(',');

      const comparisons = await Promise.all(
        productIdArray.map(async productId => {
          const elasticity = await advancedAnalyticsService.analyzePriceElasticity(
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

  _calculatePredictionConfidence(historical, predictedValue) {
    const values = historical.map(h => h.amount);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);

    const zScore = Math.abs(predictedValue - mean) / stdDev;
    return Math.max(0, 1 - (zScore / 3));
  }
};

module.exports = analyticsController;