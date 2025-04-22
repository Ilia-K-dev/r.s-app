"use strict";
const { db } = require('../../config/firebase'); //good
const { AppError } = require('../utils/error/AppError'); //good
const logger = require('../utils/logger'); //good
class Product {
    constructor(data) {
        this.id = data.id;
        this.userId = data.userId;
        this.name = data.name;
        this.category = data.category;
        this.description = data.description || '';
        this.sku = data.sku;
        this.barcode = data.barcode;
        this.currentStock = data.currentStock || 0;
        this.unit = data.unit || 'pc';
        this.unitPrice = data.unitPrice;
        this.minStockLevel = data.minStockLevel || 0;
        this.maxStockLevel = data.maxStockLevel;
        this.reorderPoint = data.reorderPoint;
        this.reorderQuantity = data.reorderQuantity;
        this.vendors = data.vendors || [];
        this.location = data.location;
        this.tags = data.tags || [];
        this.status = data.status || 'active';
        this.priceHistory = data.priceHistory || [];
        this.metadata = {
            createdAt: data.metadata?.createdAt || new Date(),
            lastModified: data.metadata?.lastModified || new Date(),
            lastStockUpdate: data.metadata?.lastStockUpdate,
            lastPriceUpdate: data.metadata?.lastPriceUpdate
        };
    }
    static async findById(id) {
        try {
            const doc = await db.collection('products').doc(id).get();
            if (!doc.exists) {
                return null;
            }
            return new Product({ id: doc.id, ...doc.data() });
        }
        catch (error) {
            logger.error('Error finding product:', error);
            throw new AppError('Failed to fetch product', 500);
        }
    }
    static async findByBarcode(userId, barcode) {
        try {
            const snapshot = await db.collection('products')
                .where('userId', '==', userId)
                .where('barcode', '==', barcode)
                .limit(1)
                .get();
            if (snapshot.empty) {
                return null;
            }
            const doc = snapshot.docs[0];
            return new Product({ id: doc.id, ...doc.data() });
        }
        catch (error) {
            logger.error('Error finding product by barcode:', error);
            throw new AppError('Failed to fetch product by barcode', 500);
        }
    }
    static async findByUser(userId, filters = {}) {
        try {
            let query = db.collection('products').where('userId', '==', userId);
            // Apply filters
            if (filters.category) {
                query = query.where('category', '==', filters.category);
            }
            if (filters.status) {
                query = query.where('status', '==', filters.status);
            }
            if (filters.stockLevel === 'low') {
                query = query.where('currentStock', '<=', 'minStockLevel');
            }
            const snapshot = await query.get();
            return snapshot.docs.map(doc => new Product({ id: doc.id, ...doc.data() }));
        }
        catch (error) {
            logger.error('Error finding products:', error);
            throw new AppError('Failed to fetch products', 500);
        }
    }
    async save() {
        try {
            const productRef = this.id ?
                db.collection('products').doc(this.id) :
                db.collection('products').doc();
            this.id = productRef.id;
            this.metadata.lastModified = new Date();
            // Validate before saving
            const validationErrors = this.validate();
            if (validationErrors.length > 0) {
                throw new AppError(`Validation failed: ${validationErrors.join(', ')}`, 400);
            }
            await productRef.set(this.toJSON(), { merge: true });
            return this;
        }
        catch (error) {
            logger.error('Error saving product:', error);
            throw error;
        }
    }
    async updateStock(quantity, type = 'add', reason = '') {
        try {
            let newStock = this.currentStock;
            switch (type) {
                case 'add':
                    newStock += quantity;
                    break;
                case 'subtract':
                    newStock -= quantity;
                    if (newStock < 0) {
                        throw new AppError('Stock cannot be negative', 400);
                    }
                    break;
                case 'set':
                    newStock = quantity;
                    break;
                default:
                    throw new AppError('Invalid stock update type', 400);
            }
            // Create stock movement record
            const movement = {
                date: new Date(),
                type,
                quantity,
                previousStock: this.currentStock,
                newStock,
                reason
            };
            // Update product
            this.currentStock = newStock;
            this.metadata.lastStockUpdate = new Date();
            // Save to database
            await this.save();
            // Log stock movement
            await db.collection('stockMovements').add({
                productId: this.id,
                userId: this.userId,
                ...movement
            });
            // Check if we need to trigger alerts
            await this.checkStockAlerts();
            return movement;
        }
        catch (error) {
            logger.error('Error updating stock:', error);
            throw error;
        }
    }
    async updatePrice(newPrice, reason = '') {
        try {
            // Add to price history
            this.priceHistory.push({
                date: new Date(),
                oldPrice: this.unitPrice,
                newPrice,
                reason
            });
            this.unitPrice = newPrice;
            this.metadata.lastPriceUpdate = new Date();
            await this.save();
        }
        catch (error) {
            logger.error('Error updating price:', error);
            throw error;
        }
    }
    async checkStockAlerts() {
        try {
            const alerts = [];
            // Check minimum stock level
            if (this.currentStock <= this.minStockLevel) {
                alerts.push({
                    type: 'low_stock',
                    message: `Product ${this.name} has reached minimum stock level`,
                    level: 'warning'
                });
            }
            // Check reorder point
            if (this.currentStock <= this.reorderPoint) {
                alerts.push({
                    type: 'reorder',
                    message: `Product ${this.name} needs to be reordered`,
                    level: 'alert',
                    suggestedQuantity: this.reorderQuantity
                });
            }
            // If there are alerts, save them to the alerts collection
            if (alerts.length > 0) {
                const batch = db.batch();
                alerts.forEach(alert => {
                    const alertRef = db.collection('alerts').doc();
                    batch.set(alertRef, {
                        userId: this.userId,
                        productId: this.id,
                        ...alert,
                        status: 'new',
                        createdAt: new Date()
                    });
                });
                await batch.commit();
            }
            return alerts;
        }
        catch (error) {
            logger.error('Error checking stock alerts:', error);
            throw error;
        }
    }
    validate() {
        const errors = [];
        if (!this.userId)
            errors.push('User ID is required');
        if (!this.name)
            errors.push('Product name is required');
        if (!this.category)
            errors.push('Category is required');
        if (typeof this.currentStock !== 'number')
            errors.push('Current stock must be a number');
        if (this.currentStock < 0)
            errors.push('Stock cannot be negative');
        if (typeof this.unitPrice !== 'number')
            errors.push('Unit price must be a number');
        if (this.unitPrice < 0)
            errors.push('Unit price cannot be negative');
        return errors;
    }
    toJSON() {
        return {
            userId: this.userId,
            name: this.name,
            category: this.category,
            description: this.description,
            sku: this.sku,
            barcode: this.barcode,
            currentStock: this.currentStock,
            unit: this.unit,
            unitPrice: this.unitPrice,
            minStockLevel: this.minStockLevel,
            maxStockLevel: this.maxStockLevel,
            reorderPoint: this.reorderPoint,
            reorderQuantity: this.reorderQuantity,
            vendors: this.vendors,
            location: this.location,
            tags: this.tags,
            status: this.status,
            priceHistory: this.priceHistory,
            metadata: this.metadata
        };
    }
}
module.exports = Product;
