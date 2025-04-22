const { db } = require('../../config/firebase');//good

class Inventory {
  constructor(data) {
    this.id = data.id;
    this.userId = data.userId;
    this.productId = data.productId;
    this.quantity = data.quantity || 0;
    this.unit = data.unit || 'piece';
    this.location = data.location || 'default';
    this.reorderPoint = data.reorderPoint || 0;
    this.maxStock = data.maxStock || null;
    this.lastStockUpdate = data.lastStockUpdate || new Date().toISOString();
    this.status = this.calculateStatus();
    this.batchInfo = data.batchInfo || {};
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = new Date().toISOString();
  }

  static async findByUserId(userId, filters = {}) {
    try {
      let query = db.collection('inventory').where('userId', '==', userId);
      
      if (filters.status) {
        query = query.where('status', '==', filters.status);
      }
      
      if (filters.productId) {
        query = query.where('productId', '==', filters.productId);
      }
      
      const snapshot = await query.get();
      
      return snapshot.docs.map(doc => new Inventory({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error finding inventory items:', error);
      throw error;
    }
  }

  async save() {
    try {
      const inventoryRef = this.id 
        ? db.collection('inventory').doc(this.id)
        : db.collection('inventory').doc();
      
      this.id = inventoryRef.id;
      this.status = this.calculateStatus();
      this.updatedAt = new Date().toISOString();
      
      await inventoryRef.set(this.toJSON(), { merge: true });
      return this;
    } catch (error) {
      console.error('Error saving inventory:', error);
      throw error;
    }
  }

  toJSON() {
    return {
      userId: this.userId,
      productId: this.productId,
      quantity: this.quantity,
      unit: this.unit,
      location: this.location,
      reorderPoint: this.reorderPoint,
      maxStock: this.maxStock,
      lastStockUpdate: this.lastStockUpdate,
      status: this.status,
      batchInfo: this.batchInfo,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  calculateStatus() {
    if (this.quantity <= 0) return 'out_of_stock';
    if (this.quantity <= this.reorderPoint) return 'low_stock';
    if (this.maxStock && this.quantity >= this.maxStock) return 'overstocked';
    return 'in_stock';
  }

  // Method to update stock quantity
  updateQuantity(change, batchInfo = {}) {
    this.quantity += change;
    this.lastStockUpdate = new Date().toISOString();
    this.batchInfo = { ...this.batchInfo, ...batchInfo };
    this.status = this.calculateStatus();
    return this;
  }

  // Method to set reorder point
  setReorderPoint(point) {
    this.reorderPoint = point;
    this.status = this.calculateStatus();
    return this;
  }
}

module.exports = Inventory;