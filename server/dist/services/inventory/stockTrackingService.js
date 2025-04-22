"use strict";
const { db } = require('../../../config/firebase'); //good
const logger = require('../../utils/logger'); //good
const { AppError } = require('../../utils/error/AppError'); //good
class StockTrackingService {
    async trackStockMovement(data) {
        try {
            const { productId, type, quantity, reason, reference, location, userId } = data;
            // Get current stock level
            const product = await this.getCurrentStock(productId);
            const previousStock = product.currentStock;
            // Calculate new stock level
            let newStock = previousStock;
            switch (type) {
                case 'add':
                    newStock += quantity;
                    break;
                case 'remove':
                    if (previousStock < quantity) {
                        throw new AppError('Insufficient stock', 400);
                    }
                    newStock -= quantity;
                    break;
                case 'adjust':
                    newStock = quantity;
                    break;
                default:
                    throw new AppError('Invalid movement type', 400);
            }
            // Create movement record
            const movement = {
                productId,
                type,
                quantity,
                previousStock,
                newStock,
                reason,
                reference,
                location,
                userId,
                timestamp: new Date(),
                batchNumber: await this._generateBatchNumber()
            };
            // Record movement in database
            await db.collection('stockMovements').add(movement);
            // Update current stock
            await this._updateCurrentStock(productId, newStock);
            // Check stock levels and trigger alerts if needed
            await this._checkStockLevels(productId, newStock);
            return movement;
        }
        catch (error) {
            logger.error('Error tracking stock movement:', error);
            throw error;
        }
    }
    async getCurrentStock(productId) {
        try {
            const product = await db.collection('products').doc(productId).get();
            if (!product.exists) {
                throw new AppError('Product not found', 404);
            }
            return product.data();
        }
        catch (error) {
            logger.error('Error getting current stock:', error);
            throw error;
        }
    }
    async _updateCurrentStock(productId, newStock) {
        try {
            await db.collection('products').doc(productId).update({
                currentStock: newStock,
                lastStockUpdate: new Date()
            });
        }
        catch (error) {
            logger.error('Error updating current stock:', error);
            throw error;
        }
    }
    async getStockHistory(productId, options = {}) {
        try {
            let query = db.collection('stockMovements')
                .where('productId', '==', productId)
                .orderBy('timestamp', 'desc');
            if (options.startDate) {
                query = query.where('timestamp', '>=', options.startDate);
            }
            if (options.endDate) {
                query = query.where('timestamp', '<=', options.endDate);
            }
            if (options.limit) {
                query = query.limit(options.limit);
            }
            const snapshot = await query.get();
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        }
        catch (error) {
            logger.error('Error getting stock history:', error);
            throw error;
        }
    }
    async getStockByLocation(locationId) {
        try {
            const snapshot = await db.collection('products')
                .where('location', '==', locationId)
                .get();
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        }
        catch (error) {
            logger.error('Error getting stock by location:', error);
            throw error;
        }
    }
    async stockAudit(productId) {
        try {
            // Get all movements for the product
            const movements = await this.getStockHistory(productId);
            const currentStock = await this.getCurrentStock(productId);
            // Calculate expected stock based on movements
            const calculatedStock = movements.reduce((total, movement) => {
                switch (movement.type) {
                    case 'add':
                        return total + movement.quantity;
                    case 'remove':
                        return total - movement.quantity;
                    case 'adjust':
                        return movement.quantity;
                    default:
                        return total;
                }
            }, 0);
            // Compare with actual stock
            const discrepancy = currentStock.currentStock - calculatedStock;
            const auditResult = {
                productId,
                timestamp: new Date(),
                calculatedStock,
                actualStock: currentStock.currentStock,
                discrepancy,
                movements: movements.length,
                status: discrepancy === 0 ? 'matched' : 'discrepancy'
            };
            // Record audit result
            await db.collection('stockAudits').add(auditResult);
            return auditResult;
        }
        catch (error) {
            logger.error('Error performing stock audit:', error);
            throw error;
        }
    }
    async _checkStockLevels(productId, currentStock) {
        try {
            const product = await this.getCurrentStock(productId);
            const alerts = [];
            // Check minimum stock level
            if (currentStock <= product.minStockLevel) {
                alerts.push({
                    type: 'low_stock',
                    level: 'warning',
                    message: `Stock level (${currentStock}) is below minimum (${product.minStockLevel})`
                });
            }
            // Check reorder point
            if (currentStock <= product.reorderPoint) {
                alerts.push({
                    type: 'reorder',
                    level: 'alert',
                    message: `Stock level (${currentStock}) has reached reorder point (${product.reorderPoint})`
                });
            }
            // Check overstock
            if (product.maxStockLevel && currentStock > product.maxStockLevel) {
                alerts.push({
                    type: 'overstock',
                    level: 'warning',
                    message: `Stock level (${currentStock}) exceeds maximum (${product.maxStockLevel})`
                });
            }
            // Record alerts if any
            if (alerts.length > 0) {
                const batch = db.batch();
                alerts.forEach(alert => {
                    const alertRef = db.collection('stockAlerts').doc();
                    batch.set(alertRef, {
                        ...alert,
                        productId,
                        currentStock,
                        timestamp: new Date(),
                        status: 'new'
                    });
                });
                await batch.commit();
            }
            return alerts;
        }
        catch (error) {
            logger.error('Error checking stock levels:', error);
            throw error;
        }
    }
    async _generateBatchNumber() {
        const prefix = new Date().getFullYear().toString().slice(-2);
        const timestamp = Date.now().toString().slice(-6);
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        return `${prefix}${timestamp}${random}`;
    }
}
module.exports = new StockTrackingService();
