"use strict";
const { db } = require('../../config/firebase'); //good
const { AppError } = require('../utils/error/AppError'); //good
const logger = require('../utils/logger'); //good
class StockMovement {
    constructor(data) {
        this.id = data.id;
        this.userId = data.userId;
        this.productId = data.productId;
        this.type = data.type; // 'add', 'subtract', 'adjust', 'transfer'
        this.quantity = data.quantity;
        this.previousStock = data.previousStock;
        this.newStock = data.newStock;
        this.reason = data.reason || '';
        this.reference = data.reference || null; // e.g., receipt ID, order ID
        this.date = data.date || new Date();
        this.location = data.location;
        this.cost = data.cost;
        this.notes = data.notes || '';
        this.metadata = {
            createdAt: data.metadata?.createdAt || new Date(),
            createdBy: data.metadata?.createdBy,
            documentType: data.metadata?.documentType,
            documentId: data.metadata?.documentId
        };
    }
    static async findByProduct(productId, options = {}) {
        try {
            let query = db.collection('stockMovements')
                .where('productId', '==', productId)
                .orderBy('date', 'desc');
            if (options.limit) {
                query = query.limit(options.limit);
            }
            const snapshot = await query.get();
            return snapshot.docs.map(doc => new StockMovement({ id: doc.id, ...doc.data() }));
        }
        catch (error) {
            logger.error('Error finding stock movements:', error);
            throw new AppError('Failed to fetch stock movements', 500);
        }
    }
    static async findByDateRange(userId, startDate, endDate) {
        try {
            const query = db.collection('stockMovements')
                .where('userId', '==', userId)
                .where('date', '>=', startDate)
                .where('date', '<=', endDate)
                .orderBy('date', 'desc');
            const snapshot = await query.get();
            return snapshot.docs.map(doc => new StockMovement({ id: doc.id, ...doc.data() }));
        }
        catch (error) {
            logger.error('Error finding stock movements by date range:', error);
            throw new AppError('Failed to fetch stock movements', 500);
        }
    }
    async save() {
        try {
            const movementRef = this.id ?
                db.collection('stockMovements').doc(this.id) :
                db.collection('stockMovements').doc();
            this.id = movementRef.id;
            // Validate before saving
            const validationErrors = this.validate();
            if (validationErrors.length > 0) {
                throw new AppError(`Validation failed: ${validationErrors.join(', ')}`, 400);
            }
            await movementRef.set(this.toJSON());
            return this;
        }
        catch (error) {
            logger.error('Error saving stock movement:', error);
            throw error;
        }
    }
    validate() {
        const errors = [];
        if (!this.userId)
            errors.push('User ID is required');
        if (!this.productId)
            errors.push('Product ID is required');
        if (!this.type)
            errors.push('Movement type is required');
        if (!['add', 'subtract', 'adjust', 'transfer'].includes(this.type)) {
            errors.push('Invalid movement type');
        }
        if (typeof this.quantity !== 'number')
            errors.push('Quantity must be a number');
        if (this.quantity <= 0)
            errors.push('Quantity must be positive');
        if (typeof this.previousStock !== 'number')
            errors.push('Previous stock must be a number');
        if (typeof this.newStock !== 'number')
            errors.push('New stock must be a number');
        if (this.newStock < 0)
            errors.push('New stock cannot be negative');
        return errors;
    }
    toJSON() {
        return {
            userId: this.userId,
            productId: this.productId,
            type: this.type,
            quantity: this.quantity,
            previousStock: this.previousStock,
            newStock: this.newStock,
            reason: this.reason,
            reference: this.reference,
            date: this.date,
            location: this.location,
            cost: this.cost,
            notes: this.notes,
            metadata: this.metadata
        };
    }
}
module.exports = StockMovement;
