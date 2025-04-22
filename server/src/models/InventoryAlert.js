const { db } = require('../../config/firebase'); //good
const { AppError } = require('../utils/error/AppError'); //good
const logger = require('../utils/logger'); //good

class InventoryAlert {
  constructor(data) {
    this.id = data.id;
    this.userId = data.userId;
    this.productId = data.productId;
    this.type = data.type; // 'low_stock', 'reorder', 'expiry', 'price_change'
    this.message = data.message;
    this.level = data.level; // 'info', 'warning', 'alert', 'critical'
    this.status = data.status || 'new'; // 'new', 'read', 'resolved', 'dismissed'
    this.suggestedAction = data.suggestedAction;
    this.actionData = data.actionData || {};
    this.createdAt = data.createdAt || new Date();
    this.resolvedAt = data.resolvedAt;
    this.resolvedBy = data.resolvedBy;
    this.metadata = {
      currentStock: data.metadata?.currentStock,
      threshold: data.metadata?.threshold,
      triggerValue: data.metadata?.triggerValue,
      previousPrice: data.metadata?.previousPrice,
      newPrice: data.metadata?.newPrice
    };
  }

  static async findActiveAlerts(userId) {
    try {
      const query = db.collection('alerts')
        .where('userId', '==', userId)
        .where('status', 'in', ['new', 'read'])
        .orderBy('createdAt', 'desc');

      const snapshot = await query.get();
      return snapshot.docs.map(doc => new InventoryAlert({ id: doc.id, ...doc.data() }));
    } catch (error) {
      logger.error('Error finding active alerts:', error);
      throw new AppError('Failed to fetch alerts', 500);
    }
  }

  static async findByProduct(productId) {
    try {
      const query = db.collection('alerts')
        .where('productId', '==', productId)
        .orderBy('createdAt', 'desc');

      const snapshot = await query.get();
      return snapshot.docs.map(doc => new InventoryAlert({ id: doc.id, ...doc.data() }));
    } catch (error) {
      logger.error('Error finding product alerts:', error);
      throw new AppError('Failed to fetch product alerts', 500);
    }
  }

  static async findCriticalAlerts(userId) {
    try {
      const query = db.collection('alerts')
        .where('userId', '==', userId)
        .where('level', '==', 'critical')
        .where('status', 'in', ['new', 'read'])
        .orderBy('createdAt', 'desc');

      const snapshot = await query.get();
      return snapshot.docs.map(doc => new InventoryAlert({ id: doc.id, ...doc.data() }));
    } catch (error) {
      logger.error('Error finding critical alerts:', error);
      throw new AppError('Failed to fetch critical alerts', 500);
    }
  }

  async save() {
    try {
      const alertRef = this.id ? 
        db.collection('alerts').doc(this.id) :
        db.collection('alerts').doc();

      this.id = alertRef.id;

      const validationErrors = this.validate();
      if (validationErrors.length > 0) {
        throw new AppError(`Validation failed: ${validationErrors.join(', ')}`, 400);
      }

      await alertRef.set(this.toJSON());
      return this;
    } catch (error) {
      logger.error('Error saving alert:', error);
      throw error;
    }
  }

  async resolve(userId, notes = '') {
    try {
      this.status = 'resolved';
      this.resolvedAt = new Date();
      this.resolvedBy = userId;
      if (notes) {
        this.actionData.resolutionNotes = notes;
      }
      await this.save();
    } catch (error) {
      logger.error('Error resolving alert:', error);
      throw error;
    }
  }

  async dismiss(userId, reason = '') {
    try {
      this.status = 'dismissed';
      this.resolvedAt = new Date();
      this.resolvedBy = userId;
      if (reason) {
        this.actionData.dismissReason = reason;
      }
      await this.save();
    } catch (error) {
      logger.error('Error dismissing alert:', error);
      throw error;
    }
  }

  validate() {
    const errors = [];

    if (!this.userId) errors.push('User ID is required');
    if (!this.productId) errors.push('Product ID is required');
    if (!this.type) errors.push('Alert type is required');
    if (!this.message) errors.push('Alert message is required');
    if (!['info', 'warning', 'alert', 'critical'].includes(this.level)) {
      errors.push('Invalid alert level');
    }
    if (!['new', 'read', 'resolved', 'dismissed'].includes(this.status)) {
      errors.push('Invalid alert status');
    }

    return errors;
  }

  toJSON() {
    return {
      userId: this.userId,
      productId: this.productId,
      type: this.type,
      message: this.message,
      level: this.level,
      status: this.status,
      suggestedAction: this.suggestedAction,
      actionData: this.actionData,
      createdAt: this.createdAt,
      resolvedAt: this.resolvedAt,
      resolvedBy: this.resolvedBy,
      metadata: this.metadata
    };
  }
}

module.exports = InventoryAlert;