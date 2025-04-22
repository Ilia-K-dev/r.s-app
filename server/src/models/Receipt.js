const { db } = require('../../config/firebase'); //good

class Receipt {
  constructor(data) {
    this.id = data.id;
    this.userId = data.userId;
    this.documentType = data.documentType || 'receipt';
    this.vendor = data.vendor;
    this.date = data.date;
    this.total = data.total;
    this.subtotal = data.subtotal;
    this.tax = data.tax;
    this.category = data.category;
    this.items = data.items || [];
    this.imageUrl = data.imageUrl;
    this.originalText = data.originalText;
    this.confidence = data.confidence;
    this.status = data.status || 'active';
    this.notes = data.notes || '';
    this.metadata = {
      createdAt: data.metadata?.createdAt || new Date(),
      lastModified: data.metadata?.lastModified || new Date(),
      originalFileName: data.metadata?.originalFileName,
      processedAt: data.metadata?.processedAt,
      textLayout: data.metadata?.textLayout || {},
      processingDetails: data.metadata?.processingDetails || {}
    };
    this.paymentMethod = data.paymentMethod;
    this.location = data.location || null;
  }

  static async findById(id) {
    try {
      const doc = await db.collection('receipts').doc(id).get();
      if (!doc.exists) {
        return null;
      }
      return new Receipt({ id: doc.id, ...doc.data() });
    } catch (error) {
      throw new Error(`Failed to fetch receipt: ${error.message}`);
    }
  }

  static async find(filters = {}, options = {}) {
    try {
      let query = db.collection('receipts');

      // Apply filters
      if (filters.userId) {
        query = query.where('userId', '==', filters.userId);
      }
      if (filters.category) {
        query = query.where('category', '==', filters.category);
      }
      if (filters.vendor) {
        query = query.where('vendor', '==', filters.vendor);
      }
      if (filters.date && filters.date.$gte) {
        query = query.where('date', '>=', filters.date.$gte);
      }
      if (filters.date && filters.date.$lte) {
        query = query.where('date', '<=', filters.date.$lte);
      }
      if (filters.total && filters.total.$gte) {
        query = query.where('total', '>=', filters.total.$gte);
      }
      if (filters.total && filters.total.$lte) {
        query = query.where('total', '<=', filters.total.$lte);
      }

      // Apply sorting
      if (options.sort) {
        const [field, order] = Object.entries(options.sort)[0];
        query = query.orderBy(field, order === -1 ? 'desc' : 'asc');
      }

      // Apply pagination
      if (options.skip) {
        // Get the last document from the previous page
        const snapshot = await query.limit(options.skip).get();
        const lastDoc = snapshot.docs[snapshot.docs.length - 1];
        query = query.startAfter(lastDoc);
      }
      if (options.limit) {
        query = query.limit(options.limit);
      }

      const snapshot = await query.get();
      return snapshot.docs.map(doc => new Receipt({ id: doc.id, ...doc.data() }));
    } catch (error) {
      throw new Error(`Failed to fetch receipts: ${error.message}`);
    }
  }

  static async countDocuments(filters = {}) {
    try {
      let query = db.collection('receipts');

      // Apply filters
      if (filters.userId) {
        query = query.where('userId', '==', filters.userId);
      }
      if (filters.category) {
        query = query.where('category', '==', filters.category);
      }

      const snapshot = await query.count().get();
      return snapshot.data().count;
    } catch (error) {
      throw new Error(`Failed to count receipts: ${error.message}`);
    }
  }

  async save() {
    try {
      const receiptRef = this.id ? 
        db.collection('receipts').doc(this.id) :
        db.collection('receipts').doc();

      this.id = receiptRef.id;
      this.metadata.lastModified = new Date();

      await receiptRef.set(this.toJSON(), { merge: true });
      return this;
    } catch (error) {
      throw new Error(`Failed to save receipt: ${error.message}`);
    }
  }

  async remove() {
    try {
      if (!this.id) {
        throw new Error('Cannot delete receipt without ID');
      }
      await db.collection('receipts').doc(this.id).delete();
    } catch (error) {
      throw new Error(`Failed to delete receipt: ${error.message}`);
    }
  }

  toJSON() {
    return {
      userId: this.userId,
      documentType: this.documentType,
      vendor: this.vendor,
      date: this.date,
      total: this.total,
      subtotal: this.subtotal,
      tax: this.tax,
      category: this.category,
      items: this.items.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        total: item.total,
        category: item.category,
        unitPrice: item.unitPrice
      })),
      imageUrl: this.imageUrl,
      originalText: this.originalText,
      confidence: this.confidence,
      status: this.status,
      notes: this.notes,
      metadata: this.metadata,
      paymentMethod: this.paymentMethod,
      location: this.location
    };
  }

  validate() {
    const errors = [];

    if (!this.userId) errors.push('User ID is required');
    if (!this.vendor) errors.push('Vendor is required');
    if (!this.date) errors.push('Date is required');
    if (typeof this.total !== 'number') errors.push('Total must be a number');
    if (this.items && !Array.isArray(this.items)) errors.push('Items must be an array');

    if (this.items) {
      this.items.forEach((item, index) => {
        if (!item.name) errors.push(`Item ${index + 1} name is required`);
        if (typeof item.price !== 'number') errors.push(`Item ${index + 1} price must be a number`);
        if (typeof item.quantity !== 'number') errors.push(`Item ${index + 1} quantity must be a number`);
      });
    }

    return errors;
  }
}

module.exports = Receipt;