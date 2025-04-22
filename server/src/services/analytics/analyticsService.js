const { db } = require('../../../config/firebase'); //good
const logger = require('../../utils/logger'); //good
const { AppError } = require('../../utils/error/AppError'); //good
const _ = require('lodash');

class AnalyticsService {
  constructor() {
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    this.cache = new Map();
  }

  // Price Analytics Methods
  async analyzePrices(userId, productId, options = {}) {
    try {
      const cacheKey = `price_${userId}_${productId}`;
      const cached = this._getFromCache(cacheKey);
      if (cached) return cached;

      const priceHistory = await this._getPriceHistory(productId, options);
      const elasticity = await this._calculatePriceElasticity(productId);
      const trends = this._analyzePriceTrends(priceHistory);
      const predictions = this._predictPrices(priceHistory);

      const analysis = {
        history: priceHistory,
        elasticity,
        trends,
        predictions,
        statistics: this._calculatePriceStatistics(priceHistory)
      };

      this._setCache(cacheKey, analysis);
      return analysis;
    } catch (error) {
      logger.error('Price analysis error:', error);
      throw new AppError('Failed to analyze prices', 500);
    }
  }

  // Spending Analysis Methods
  async analyzeSpending(userId, startDate, endDate, options = {}) {
    try {
      const cacheKey = `spending_${userId}_${startDate}_${endDate}`;
      const cached = this._getFromCache(cacheKey);
      if (cached) return cached;

      const receipts = await this._getReceipts(userId, startDate, endDate);
      const categories = this._categorizeSpending(receipts);
      const trends = this._analyzeSpendingTrends(receipts);
      const predictions = this._predictSpending(trends);

      const analysis = {
        total: this._calculateTotal(receipts),
        byCategory: categories,
        byVendor: this._groupByVendor(receipts),
        trends,
        predictions
      };

      this._setCache(cacheKey, analysis);
      return analysis;
    } catch (error) {
      logger.error('Spending analysis error:', error);
      throw new AppError('Failed to analyze spending', 500);
    }
  }

  // Inventory Analytics Methods
  async analyzeInventory(userId) {
    try {
      const cacheKey = `inventory_${userId}`;
      const cached = this._getFromCache(cacheKey);
      if (cached) return cached;

      const products = await this._getProducts(userId);
      const stockLevels = this._analyzeStockLevels(products);
      const turnover = await this._calculateTurnoverRates(products);
      const optimization = this._generateOptimizationRecommendations(products);

      const analysis = {
        stockLevels,
        turnover,
        optimization,
        value: this._calculateInventoryValue(products),
        metrics: this._calculateInventoryMetrics(products)
      };

      this._setCache(cacheKey, analysis);
      return analysis;
    } catch (error) {
      logger.error('Inventory analysis error:', error);
      throw new AppError('Failed to analyze inventory', 500);
    }
  }

  // Vendor Analysis Methods
  async analyzeVendors(userId, options = {}) {
    try {
      const cacheKey = `vendors_${userId}`;
      const cached = this._getFromCache(cacheKey);
      if (cached) return cached;

      const vendors = await this._getVendorData(userId);
      const performance = this._calculateVendorPerformance(vendors);
      const comparison = this._compareVendorPrices(vendors);
      const recommendations = this._generateVendorRecommendations(vendors);

      const analysis = {
        performance,
        comparison,
        recommendations,
        metrics: this._calculateVendorMetrics(vendors)
      };

      this._setCache(cacheKey, analysis);
      return analysis;
    } catch (error) {
      logger.error('Vendor analysis error:', error);
      throw new AppError('Failed to analyze vendors', 500);
    }
  }

  // Predictive Analytics Methods
  async predictStockNeeds(userId, productId) {
    try {
      const movements = await this._getStockMovements(productId);
      const seasonality = this._calculateSeasonality(movements);
      const dailyUsage = this._calculateDailyUsageRate(movements);

      return {
        dailyUsage,
        seasonalityFactor: seasonality,
        recommendedStock: dailyUsage * 30 * seasonality,
        reorderPoint: dailyUsage * 7 * seasonality,
        confidence: this._calculatePredictionConfidence(movements)
      };
    } catch (error) {
      logger.error('Stock prediction error:', error);
      throw new AppError('Failed to predict stock needs', 500);
    }
  }

  // Private Helper Methods
  async _getPriceHistory(productId, options = {}) {
    const snapshot = await db.collection('priceHistory')
      .where('productId', '==', productId)
      .orderBy('date', 'desc')
      .get();

    return snapshot.docs.map(doc => ({
      date: doc.data().date.toDate(),
      price: doc.data().price,
      change: doc.data().change
    }));
  }

  _calculatePriceStatistics(priceHistory) {
    const prices = priceHistory.map(p => p.price);
    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
      average: _.mean(prices),
      median: _.sortBy(prices)[Math.floor(prices.length / 2)],
      volatility: this._calculateVolatility(prices)
    };
  }

  _calculateVolatility(prices) {
    const changes = [];
    for (let i = 1; i < prices.length; i++) {
      changes.push((prices[i] - prices[i-1]) / prices[i-1]);
    }
    return _.std(changes) * Math.sqrt(365);
  }

  async _getReceipts(userId, startDate, endDate) {
    const snapshot = await db.collection('receipts')
      .where('userId', '==', userId)
      .where('date', '>=', startDate)
      .where('date', '<=', endDate)
      .get();

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  }

  _categorizeSpending(receipts) {
    return _.groupBy(receipts, 'category');
  }

  _analyzeSpendingTrends(receipts) {
    const dailySpending = _.groupBy(receipts, r => 
      r.date.toISOString().split('T')[0]
    );

    const trends = Object.entries(dailySpending).map(([date, receipts]) => ({
      date,
      total: _.sumBy(receipts, 'total'),
      count: receipts.length,
      averageTransaction: _.meanBy(receipts, 'total')
    }));

    return {
      daily: trends,
      weekly: this._aggregateByWeek(trends),
      monthly: this._aggregateByMonth(trends)
    };
  }

  _aggregateByWeek(dailyTrends) {
    return _(dailyTrends)
      .groupBy(t => {
        const date = new Date(t.date);
        const startOfWeek = new Date(date);
        startOfWeek.setDate(date.getDate() - date.getDay());
        return startOfWeek.toISOString().split('T')[0];
      })
      .map((week, startDate) => ({
        startDate,
        total: _.sumBy(week, 'total'),
        count: _.sumBy(week, 'count'),
        averageDaily: _.meanBy(week, 'total')
      }))
      .value();
  }

  _aggregateByMonth(dailyTrends) {
    return _(dailyTrends)
      .groupBy(t => t.date.substring(0, 7))
      .map((month, yearMonth) => ({
        yearMonth,
        total: _.sumBy(month, 'total'),
        count: _.sumBy(month, 'count'),
        averageDaily: _.meanBy(month, 'total')
      }))
      .value();
  }

  _predictSpending(trends) {
    const monthlyData = trends.monthly;
    const recentMonths = monthlyData.slice(-6);
    
    // Calculate trend
    const xValues = _.range(recentMonths.length);
    const yValues = recentMonths.map(m => m.total);
    
    const { slope, intercept } = this._calculateLinearRegression(xValues, yValues);
    
    // Predict next 3 months
    return _.range(1, 4).map(i => ({
      month: i,
      predictedTotal: slope * (xValues.length + i) + intercept,
      confidence: this._calculatePredictionConfidence(recentMonths)
    }));
  }

  _calculateLinearRegression(x, y) {
    const n = x.length;
    const sumX = _.sum(x);
    const sumY = _.sum(y);
    const sumXY = _.sum(x.map((xi, i) => xi * y[i]));
    const sumXX = _.sum(x.map(xi => xi * xi));
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    return { slope, intercept };
  }

  _calculatePredictionConfidence(data) {
    const values = data.map(d => d.total);
    const mean = _.mean(values);
    const stdDev = Math.sqrt(_.sumBy(values, v => Math.pow(v - mean, 2)) / values.length);
    
    // Calculate coefficient of variation
    const cv = stdDev / mean;
    
    // Convert to confidence score (0-1)
    return Math.max(0, 1 - cv);
  }

  // Cache Management
  _getFromCache(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }

  _setCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  // Additional helper methods would go here...
}