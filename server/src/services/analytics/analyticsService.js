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

  /**
   * @desc Analyzes price history and trends for a specific product.
   * @param {string} userId - The ID of the user.
   * @param {string} productId - The ID of the product.
   * @param {object} [options] - Options for filtering price history (startDate, endDate).
   * @returns {Promise<object>} - Price analysis data.
   * @throws {AppError} - If analysis fails.
   */
  async analyzePrices(userId, productId, options = {}) {
    try {
      const cacheKey = `price_${userId}_${productId}`;
      const cached = this._getFromCache(cacheKey);
      if (cached) return cached;

      const priceHistory = await this._getPriceHistory(productId, options);
      const elasticity = await this._calculatePriceElasticity(productId); // Assuming this method exists
      const trends = this._analyzePriceTrends(priceHistory); // Assuming this method exists
      const predictions = this._predictPrices(priceHistory); // Assuming this method exists

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

  /**
   * @desc Analyzes spending for the authenticated user within a date range.
   * @param {string} userId - The ID of the user.
   * @param {Date} startDate - Start date for the analysis.
   * @param {Date} endDate - End date for the analysis.
   * @param {object} [options] - Additional options (e.g., groupBy).
   * @returns {Promise<object>} - Spending analysis data.
   * @throws {AppError} - If analysis fails.
   */
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
        total: this._calculateTotal(receipts), // Assuming this method exists
        byCategory: categories,
        byVendor: this._groupByVendor(receipts), // Assuming this method exists
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

  /**
   * @desc Analyzes inventory data for the authenticated user.
   * @param {string} userId - The ID of the user.
   * @returns {Promise<object>} - Inventory analysis data.
   * @throws {AppError} - If analysis fails.
   */
  async analyzeInventory(userId) {
    try {
      const cacheKey = `inventory_${userId}`;
      const cached = this._getFromCache(cacheKey);
      if (cached) return cached;

      const products = await this._getProducts(userId); // Assuming this method exists
      const stockLevels = this._analyzeStockLevels(products); // Assuming this method exists
      const turnover = await this._calculateTurnoverRates(products); // Assuming this method exists
      const optimization = this._generateOptimizationRecommendations(products); // Assuming this method exists

      const analysis = {
        stockLevels,
        turnover,
        optimization,
        value: this._calculateInventoryValue(products), // Assuming this method exists
        metrics: this._calculateInventoryMetrics(products) // Assuming this method exists
      };

      this._setCache(cacheKey, analysis);
      return analysis;
    } catch (error) {
      logger.error('Inventory analysis error:', error);
      throw new AppError('Failed to analyze inventory', 500);
    }
  }

  // Vendor Analysis Methods

  /**
   * @desc Analyzes vendor data for the authenticated user.
   * @param {string} userId - The ID of the user.
   * @param {object} [options] - Additional options.
   * @returns {Promise<object>} - Vendor analysis data.
   * @throws {AppError} - If analysis fails.
   */
  async analyzeVendors(userId, options = {}) {
    try {
      const cacheKey = `vendors_${userId}`;
      const cached = this._getFromCache(cacheKey);
      if (cached) return cached;

      const vendors = await this._getVendorData(userId); // Assuming this method exists
      const performance = this._calculateVendorPerformance(vendors); // Assuming this method exists
      const comparison = this._compareVendorPrices(vendors); // Assuming this method exists
      const recommendations = this._generateVendorRecommendations(vendors); // Assuming this method exists

      const analysis = {
        performance,
        comparison,
        recommendations,
        metrics: this._calculateVendorMetrics(vendors) // Assuming this method exists
      };

      this._setCache(cacheKey, analysis);
      return analysis;
    } catch (error) {
      logger.error('Vendor analysis error:', error);
      throw new AppError('Failed to analyze vendors', 500);
    }
  }

  // Predictive Analytics Methods

  /**
   * @desc Predicts stock needs for a specific product based on historical movements.
   * @param {string} userId - The ID of the user.
   * @param {string} productId - The ID of the product.
   * @returns {Promise<object>} - Stock prediction data.
   * @throws {AppError} - If prediction fails.
   */
  async predictStockNeeds(userId, productId) {
    try {
      const movements = await this._getStockMovements(productId); // Assuming this method exists
      const seasonality = this._calculateSeasonality(movements); // Assuming this method exists
      const dailyUsage = this._calculateDailyUsageRate(movements); // Assuming this method exists

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

  /**
   * @desc Fetches price history for a product from Firestore.
   * @param {string} productId - The ID of the product.
   * @param {object} [options] - Options for filtering (startDate, endDate).
   * @returns {Promise<Array<object>>} - Array of price history data.
   */
  async _getPriceHistory(productId, options = {}) {
    let query = db.collection('priceHistory')
      .where('productId', '==', productId)
      .orderBy('date', 'desc');

    if (options.startDate) {
        query = query.where('date', '>=', options.startDate);
    }
    if (options.endDate) {
        query = query.where('date', '<=', options.endDate);
    }

    const snapshot = await query.get();

    return snapshot.docs.map(doc => ({
      date: doc.data().date.toDate(),
      price: doc.data().price,
      change: doc.data().change
    }));
  }

  /**
   * @desc Calculates various statistics from price history data.
   * @param {Array<object>} priceHistory - Array of price history data.
   * @returns {object} - Price statistics (min, max, average, median, volatility).
   */
  _calculatePriceStatistics(priceHistory) {
    const prices = priceHistory.map(p => p.price);
    if (prices.length === 0) {
        return { min: 0, max: 0, average: 0, median: 0, volatility: 0 };
    }
    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
      average: _.mean(prices),
      median: _.sortBy(prices)[Math.floor(prices.length / 2)],
      volatility: this._calculateVolatility(prices)
    };
  }

  /**
   * @desc Calculates the volatility of prices.
   * @param {Array<number>} prices - Array of price values.
   * @returns {number} - Price volatility.
   */
  _calculateVolatility(prices) {
    if (prices.length < 2) return 0;
    const changes = [];
    for (let i = 1; i < prices.length; i++) {
      changes.push((prices[i] - prices[i-1]) / prices[i-1]);
    }
    if (changes.length === 0) return 0;
    return _.std(changes) * Math.sqrt(365); // Annualized volatility (assuming daily data)
  }

  /**
   * @desc Fetches receipts for a user within a date range from Firestore.
   * @param {string} userId - The ID of the user.
   * @param {Date} startDate - Start date for fetching receipts.
   * @param {Date} endDate - End date for fetching receipts.
   * @returns {Promise<Array<object>>} - Array of receipt data.
   */
  async _getReceipts(userId, startDate, endDate) {
    let query = db.collection('receipts')
      .where('userId', '==', userId);

    if (startDate) {
        query = query.where('date', '>=', startDate);
    }
    if (endDate) {
        query = query.where('date', '<=', endDate);
    }

    const snapshot = await query.get();

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  }

  /**
   * @desc Categorizes spending based on receipts.
   * @param {Array<object>} receipts - Array of receipt data.
   * @returns {object} - Spending categorized by category.
   */
  _categorizeSpending(receipts) {
    // Assuming each receipt has a 'category' field
    return _.groupBy(receipts, 'category');
  }

  /**
   * @desc Analyzes spending trends from receipt data.
   * @param {Array<object>} receipts - Array of receipt data.
   * @returns {object} - Spending trends aggregated by day, week, and month.
   */
  _analyzeSpendingTrends(receipts) {
    // Group receipts by day
    const dailySpending = _.groupBy(receipts, r =>
      r.date.toISOString().split('T')[0] // Assuming 'date' is a Date object
    );

    // Calculate daily totals
    const dailyTrends = Object.entries(dailySpending).map(([date, receipts]) => ({
      date,
      total: _.sumBy(receipts, 'total'), // Assuming 'total' field exists
      count: receipts.length,
      averageTransaction: _.meanBy(receipts, 'total')
    }));

    // Sort daily trends by date
    dailyTrends.sort((a, b) => new Date(a.date) - new Date(b.date));

    return {
      daily: dailyTrends,
      weekly: this._aggregateByWeek(dailyTrends),
      monthly: this._aggregateByMonth(dailyTrends)
    };
  }

  /**
   * @desc Aggregates daily spending trends by week.
   * @param {Array<object>} dailyTrends - Array of daily spending trend data.
   * @returns {Array<object>} - Spending trends aggregated by week.
   */
  _aggregateByWeek(dailyTrends) {
    return _(dailyTrends)
      .groupBy(t => {
        const date = new Date(t.date);
        const startOfWeek = new Date(date);
        startOfWeek.setDate(date.getDate() - date.getDay()); // Get the start of the week (Sunday)
        return startOfWeek.toISOString().split('T')[0];
      })
      .map((week, startDate) => ({
        startDate,
        total: _.sumBy(week, 'total'),
        count: _.sumBy(week, 'count'),
        averageDaily: _.meanBy(week, 'total')
      }))
      .sortBy('startDate') // Sort by week start date
      .value();
  }

  /**
   * @desc Aggregates daily spending trends by month.
   * @param {Array<object>} dailyTrends - Array of daily spending trend data.
   * @returns {Array<object>} - Spending trends aggregated by month.
   */
  _aggregateByMonth(dailyTrends) {
    return _(dailyTrends)
      .groupBy(t => t.date.substring(0, 7)) // Group by 'YYYY-MM'
      .map((month, yearMonth) => ({
        yearMonth,
        total: _.sumBy(month, 'total'),
        count: _.sumBy(month, 'count'),
        averageDaily: _.meanBy(month, 'total')
      }))
      .sortBy('yearMonth') // Sort by year-month
      .value();
  }

  /**
   * @desc Predicts future spending based on historical trends.
   * @param {object} trends - Spending trends data (including monthly trends).
   * @returns {Array<object>} - Predicted spending for future periods with confidence scores.
   */
  _predictSpending(trends) {
    const monthlyData = trends.monthly;
    if (monthlyData.length < 2) {
        return []; // Need at least 2 data points for a trend
    }
    const recentMonths = monthlyData.slice(-6); // Use last 6 months for prediction
    
    // Calculate trend using linear regression
    const xValues = _.range(recentMonths.length); // 0, 1, 2, ...
    const yValues = recentMonths.map(m => m.total);
    
    const { slope, intercept } = this._calculateLinearRegression(xValues, yValues);
    
    // Predict next 3 months
    return _.range(1, 4).map(i => {
      const predictedTotal = slope * (xValues.length + i) + intercept;
      const confidence = this._calculatePredictionConfidence(recentMonths, predictedTotal);
      return {
        monthOffset: i, // Offset from the last historical month
        predictedTotal: Math.max(0, predictedTotal), // Ensure prediction is not negative
        confidence: confidence
      };
    });
  }

  /**
   * @desc Calculates the linear regression (slope and intercept) for two sets of data.
   * @param {Array<number>} x - Array of x-values.
   * @param {Array<number>} y - Array of y-values.
   * @returns {object} - Object containing the slope and intercept.
   */
  _calculateLinearRegression(x, y) {
    const n = x.length;
    const sumX = _.sum(x);
    const sumY = _.sum(y);
    const sumXY = _.sum(x.map((xi, i) => xi * y[i]));
    const sumXX = _.sum(x.map(xi => xi * xi));
    
    const denominator = (n * sumXX - sumX * sumX);
    if (denominator === 0) {
        return { slope: 0, intercept: _.mean(y) || 0 }; // Avoid division by zero
    }

    const slope = (n * sumXY - sumX * sumY) / denominator;
    const intercept = (sumY - slope * sumX) / n;
    
    return { slope, intercept };
  }

  /**
   * @desc Calculates a confidence score for a prediction based on historical data.
   * @param {Array<object>} historical - Array of historical data points with a 'total' field.
   * @param {number} predictedValue - The predicted value.
   * @returns {number} - Confidence score between 0 and 1.
   */
  _calculatePredictionConfidence(historical, predictedValue) {
    const values = historical.map(h => h.total);
    if (values.length < 2) return 0.5; // Cannot calculate std dev with less than 2 points
    const mean = _.mean(values);
    const stdDev = Math.sqrt(_.sumBy(values, v => Math.pow(v - mean, 2)) / values.length);
    
    if (stdDev === 0) return 1.0; // Perfect consistency
    
    // Calculate Z-score
    const zScore = Math.abs(predictedValue - mean) / stdDev;
    
    // Convert Z-score to a confidence score (higher Z-score means lower confidence)
    // Using a simple inverse relationship, capped at 1.0
    return Math.max(0, 1 - (zScore / 3)); // Assuming a normal distribution (approx 99.7% within 3 std dev)
  }

  // Cache Management

  /**
   * @desc Retrieves data from the in-memory cache.
   * @param {string} key - The cache key.
   * @returns {any | null} - Cached data if valid, otherwise null.
   */
  _getFromCache(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      logger.debug(`Cache hit for key: ${key}`);
      return cached.data;
    }
    logger.debug(`Cache miss for key: ${key}`);
    return null;
  }

  /**
   * @desc Stores data in the in-memory cache with a timestamp.
   * @param {string} key - The cache key.
   * @param {any} data - The data to cache.
   */
  _setCache(key, data) {
    logger.debug(`Setting cache for key: ${key}`);
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  // Additional helper methods would go here...

  /**
   * @desc Gets budget progress data for the authenticated user.
   * @param {string} userId - The authenticated user's ID.
   * @param {string} period - The budget period (e.g., 'month', 'year', 'all').
   * @param {string} [categoryId] - Optional category ID to filter by.
   * @returns {Promise<object>} - Budget progress data.
   * @throws {AppError} - If fetching data fails or invalid period is specified.
   */
  async getBudgetProgress(userId, period, categoryId) {
    try {
      // Determine date range based on period
      const endDate = new Date();
      let startDate = new Date();

      switch (period) {
        case 'month':
          startDate.setDate(1);
          break;
        case 'year':
          startDate.setMonth(0, 1);
          break;
        case 'all':
          // Fetch all time data - might be inefficient for large datasets
          startDate = null; // Indicate no start date filter
          break;
        default:
          throw new AppError('Invalid budget period specified.', 400);
      }

      // Fetch relevant budgets
      let budgetQuery = db.collection('budgets').where('userId', '==', userId).where('period', '==', period);
      if (categoryId) {
        budgetQuery = budgetQuery.where('categoryId', '==', categoryId);
      }
      const budgetSnapshot = await budgetQuery.get();
      const budgets = budgetSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      if (budgets.length === 0) {
          // No budget defined for this period/category
          return {
              budgets: [],
              spending: 0,
              progress: 0,
              remaining: 0,
              message: `No budget defined for this period${categoryId ? ' and category' : ''}.`
          };
      }

      // For simplicity, assuming a single budget per period/category for now
      const budget = budgets[0];

      // Fetch spending data for the same period and category (if applicable)
      let spendingQuery = db.collection('receipts').where('userId', '==', userId);
      if (startDate) {
          spendingQuery = spendingQuery.where('date', '>=', startDate);
      }
      // Assuming receipt date is indexed for range queries
      spendingQuery = spendingQuery.where('date', '<=', endDate);

      if (categoryId) {
          spendingQuery = spendingQuery.where('category', '==', categoryId);
      }

      const spendingSnapshot = await spendingQuery.get();
      const totalSpending = spendingSnapshot.docs.reduce((sum, doc) => sum + (doc.data().total || 0), 0);

      // Calculate progress
      const totalBudgetAmount = budget.amount || 0;
      const progress = totalBudgetAmount > 0 ? (totalSpending / totalBudgetAmount) * 100 : 0;
      const remaining = totalBudgetAmount - totalSpending;

      return {
        budgets: budgets, // Return all matching budgets
        spending: totalSpending,
        progress: Math.min(progress, 100), // Cap progress at 100%
        remaining: remaining,
        message: progress > 100 ? 'Budget exceeded!' : `${remaining >= 0 ? remaining : Math.abs(remaining)} ${remaining >= 0 ? 'remaining' : 'over budget'}`
      };

    } catch (error) {
      logger.error('Error calculating budget progress:', error);
      throw new AppError('Failed to get budget progress.', 500);
    }
  }
}
