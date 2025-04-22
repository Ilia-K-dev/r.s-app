"use strict";
const { db } = require('../../config/firebase'); //good
class Vendor {
    constructor(data) {
        this.id = data.id;
        this.name = data.name;
        this.userId = data.userId;
        this.address = data.address || null;
        this.contactInfo = data.contactInfo || {};
        this.tags = data.tags || [];
        this.productCategories = data.productCategories || [];
        this.performanceMetrics = {
            averagePrice: data.averagePrice || 0,
            totalPurchases: data.totalPurchases || 0,
            lastPurchaseDate: data.lastPurchaseDate || null
        };
        this.createdAt = data.createdAt || new Date().toISOString();
        this.updatedAt = new Date().toISOString();
    }
    static async findByUserId(userId) {
        try {
            const snapshot = await db.collection('vendors')
                .where('userId', '==', userId)
                .get();
            return snapshot.docs.map(doc => new Vendor({ id: doc.id, ...doc.data() }));
        }
        catch (error) {
            console.error('Error finding vendors:', error);
            throw error;
        }
    }
    async save() {
        try {
            const vendorRef = this.id
                ? db.collection('vendors').doc(this.id)
                : db.collection('vendors').doc();
            this.id = vendorRef.id;
            await vendorRef.set(this.toJSON(), { merge: true });
            return this;
        }
        catch (error) {
            console.error('Error saving vendor:', error);
            throw error;
        }
    }
    toJSON() {
        return {
            name: this.name,
            userId: this.userId,
            address: this.address,
            contactInfo: this.contactInfo,
            tags: this.tags,
            productCategories: this.productCategories,
            performanceMetrics: this.performanceMetrics,
            createdAt: this.createdAt,
            updatedAt: new Date().toISOString()
        };
    }
    // Method to update performance metrics
    updatePerformanceMetrics(purchaseData) {
        this.performanceMetrics.totalPurchases += purchaseData.total;
        this.performanceMetrics.lastPurchaseDate = new Date().toISOString();
        this.performanceMetrics.averagePrice =
            (this.performanceMetrics.averagePrice + purchaseData.unitPrice) / 2;
        return this;
    }
}
module.exports = Vendor;
