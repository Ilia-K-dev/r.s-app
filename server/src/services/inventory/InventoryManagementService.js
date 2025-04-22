const { db } = require('../../../config/firebase'); //good
const logger = require('../../utils/logger'); //good
const { AppError } = require('../../utils/error/AppError'); //good
const { calculateUnitPrice } = require('../../utils/misc/priceCalculator'); //good
const analyticsService = require('../analytics/analyticsService'); //good
const notificationService = require('../notification/NotificationService'); //good

class InventoryManagementService {
  constructor() {
    this.alertThresholds = {
      lowStock: 0.2,  // 20% of max stock
      criticalStock: 0.1,  // 10% of max stock
      overstock: 0.9   // 90% of max stock
    };

    this.stockMovementTypes = {
      ADD: 'add',
      REMOVE: 'remove',
      ADJUST: 'adjust',
      TRANSFER: 'transfer'
    };
  }

  async updateStock(productId, quantity, type, metadata = {}) {
    try {
      const productRef = db.collection('products').doc(productId);
      const product = await productRef.get();

      if (!product.exists) {
        throw new AppError('Product not found', 404);
      }

      const currentStock = product.data().currentStock;
      let newStock = this._calculateNewStock(currentStock, quantity, type);

      // Create stock movement record
      const movement = {
        productId,
        type,
        quantity,
        previousStock: currentStock,
        newStock,
        date: new Date(),
        metadata,
        userId: product.data().userId
      };

      // Update product and create movement record
      await db.runTransaction(async (transaction) => {
        // Update product stock
        transaction.update(productRef, {
          currentStock: newStock,
          lastUpdated: new Date(),
          ...this._calculateStockMetrics(newStock, product.data())
        });

        // Create movement record
        const movementRef = db.collection('stockMovements').doc();
        transaction.set(movementRef, movement);

        // Check and create alerts if needed
        const alerts = await this._checkStockLevels(product.data(), newStock);
        if (alerts.length > 0) {
          await this._createAlerts(alerts, productId);
        }
      });

      // Update analytics after successful stock update
      await analyticsService.updateInventoryMetrics(productId);

      return {
        success: true,
        currentStock: newStock,
        movement
      };
    } catch (error) {
      logger.error('Stock update error:', error);
      throw new AppError(error.message, 500);
    }
  }

  async getInventoryStatus(userId, options = {}) {
    try {
      const products = await this._getProducts(userId, options);
      const stockStatus = this._calculateStockStatus(products);
      const valueMetrics = this._calculateValueMetrics(products);
      const turnoverMetrics = await this._calculateTurnoverMetrics(products);

      return {
        summary: {
          totalProducts: products.length,
          totalValue: valueMetrics.totalValue,
          averageValue: valueMetrics.averageValue
        },
        stockStatus,
        valueMetrics,
        turnoverMetrics,
        alerts: await this._getActiveAlerts(userId)
      };
    } catch (error) {
      logger.error('Inventory status error:', error);
      throw new AppError('Failed to get inventory status', 500);
    }
  }

  async transferStock(fromProductId, toProductId, quantity, metadata = {}) {
    try {
      if (fromProductId === toProductId) {
        throw new AppError('Cannot transfer to same product', 400);
      }

      await db.runTransaction(async (transaction) => {
        // Remove from source
        await this.updateStock(fromProductId, quantity, 'remove', {
          ...metadata,
          transferTo: toProductId
        });

        // Add to destination
        await this.updateStock(toProductId, quantity, 'add', {
          ...metadata,
          transferFrom: fromProductId
        });
      });

      return true;
    } catch (error) {
      logger.error('Stock transfer error:', error);
      throw new AppError('Failed to transfer stock', 500);
    }
  }

  async adjustStockLevels(productId, adjustments) {
    try {
      const { minStockLevel, maxStockLevel, reorderPoint, reorderQuantity } = adjustments;
      
      const productRef = db.collection('products').doc(productId);
      const product = await productRef.get();

      if (!product.exists) {
        throw new AppError('Product not found', 404);
      }

      await productRef.update({
        minStockLevel: minStockLevel ?? product.data().minStockLevel,
        maxStockLevel: maxStockLevel ?? product.data().maxStockLevel,
        reorderPoint: reorderPoint ?? product.data().reorderPoint,
        reorderQuantity: reorderQuantity ?? product.data().reorderQuantity,
        lastUpdated: new Date()
      });

      // Check stock levels after adjustment
      const alerts = await this._checkStockLevels(
        { ...product.data(), ...adjustments },
        product.data().currentStock
      );

      if (alerts.length > 0) {
        await this._createAlerts(alerts, productId);
      }

      return {
        success: true,
        productId,
        updates: adjustments
      };
    } catch (error) {
      logger.error('Stock level adjustment error:', error);
      throw new AppError('Failed to adjust stock levels', 500);
    }
  }

  // Private helper methods
  async _checkStockLevels(product, newStock) {
    const alerts = [];
    const maxStock = product.maxStockLevel || Infinity;
    const minStock = product.minStockLevel || 0;
    const reorderPoint = product.reorderPoint || minStock;

    // Check critical stock
    if (newStock <= minStock * this.alertThresholds.criticalStock) {
      alerts.push({
        type: 'critical_stock',
        level: 'critical',
        message: `Critical stock level for ${product.name}`,
        threshold: minStock * this.alertThresholds.criticalStock,
        currentStock: newStock
      });
    }
    // Check low stock
    else if (newStock <= reorderPoint) {
      alerts.push({
        type: 'low_stock',
        level: 'warning',
        message: `Low stock level for ${product.name}`,
        threshold: reorderPoint,
        currentStock: newStock
      });
    }

    // Check overstock
    if (maxStock !== Infinity && newStock >= maxStock * this.alertThresholds.overstock) {
      alerts.push({
        type: 'overstock',
        level: 'warning',
        message: `Overstock alert for ${product.name}`,
        threshold: maxStock * this.alertThresholds.overstock,
        currentStock: newStock
      });
    }

    return alerts;
  }

  _calculateNewStock(currentStock, quantity, type) {
    switch (type) {
      case this.stockMovementTypes.ADD:
        return currentStock + quantity;
      case this.stockMovementTypes.REMOVE:
        if (currentStock < quantity) {
          throw new AppError('Insufficient stock', 400);
        }
        return currentStock - quantity;
      case this.stockMovementTypes.ADJUST:
        return quantity;
      default:
        throw new AppError('Invalid stock movement type', 400);
    }
  }

  async _createAlerts(alerts, productId) {
    const batch = db.batch();
    
    alerts.forEach(alert => {
      const alertRef = db.collection('inventoryAlerts').doc();
      batch.set(alertRef, {
        ...alert,
        productId,
        createdAt: new Date(),
        status: 'active'
      });
    });

    await batch.commit();

    // Send notifications for alerts
    alerts.forEach(alert => {
      notificationService.sendAlertNotification(alert);
    });
  }

  _calculateStockMetrics(currentStock, product) {
    return {
      daysOfStock: this._calculateDaysOfStock(currentStock, product),
      stockValue: currentStock * (product.unitPrice || 0),
      turnoverRate: this._calculateTurnoverRate(product),
      lastStockUpdate: new Date()
    };
  }

  _calculateDaysOfStock(currentStock, product) {
    const dailyUsage = product.averageDailyUsage || 1;
    return Math.round(currentStock / dailyUsage);
  }

  _calculateTurnoverRate(product) {
    const salesValue = product.totalSales || 0;
    const averageInventoryValue = 
      ((product.currentStock * product.unitPrice) + 
       (product.previousStock * product.unitPrice)) / 2;
    
    return averageInventoryValue > 0 ? salesValue / averageInventoryValue : 0;
  }
}

module.exports = new InventoryManagementService();