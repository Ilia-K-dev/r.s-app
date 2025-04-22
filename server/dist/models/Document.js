"use strict";
const { db } = require('../../config/firebase'); //good
class Document {
    constructor(data) {
        this.id = data.id;
        this.userId = data.userId;
        this.type = data.type || 'unknown'; // receipt, invoice, warranty, etc.
        this.source = data.source || null; // upload, scan, email, etc.
        this.metadata = data.metadata || {};
        this.extractedText = data.extractedText || '';
        this.processedData = data.processedData || {};
        this.tags = data.tags || [];
        this.confidence = data.confidence || 0;
        this.status = data.status || 'pending'; // pending, processed, error
        this.fileUrl = data.fileUrl || null;
        this.createdAt = data.createdAt || new Date().toISOString();
        this.processedAt = data.processedAt || null;
    }
    static async findByUserId(userId, filters = {}) {
        try {
            let query = db.collection('documents').where('userId', '==', userId);
            if (filters.type) {
                query = query.where('type', '==', filters.type);
            }
            if (filters.status) {
                query = query.where('status', '==', filters.status);
            }
            const snapshot = await query.orderBy('createdAt', 'desc').get();
            return snapshot.docs.map(doc => new Document({ id: doc.id, ...doc.data() }));
        }
        catch (error) {
            console.error('Error finding documents:', error);
            throw error;
        }
    }
    async save() {
        try {
            const documentRef = this.id
                ? db.collection('documents').doc(this.id)
                : db.collection('documents').doc();
            this.id = documentRef.id;
            this.processedAt = new Date().toISOString();
            await documentRef.set(this.toJSON(), { merge: true });
            return this;
        }
        catch (error) {
            console.error('Error saving document:', error);
            throw error;
        }
    }
    toJSON() {
        return {
            userId: this.userId,
            type: this.type,
            source: this.source,
            metadata: this.metadata,
            extractedText: this.extractedText,
            processedData: this.processedData,
            tags: this.tags,
            confidence: this.confidence,
            status: this.status,
            fileUrl: this.fileUrl,
            createdAt: this.createdAt,
            processedAt: this.processedAt
        };
    }
    // Method to add tags for better categorization
    addTags(newTags) {
        this.tags = [...new Set([...this.tags, ...newTags])];
        return this;
    }
    // Method to update processing status
    updateProcessingStatus(status, processedData = {}) {
        this.status = status;
        this.processedData = { ...this.processedData, ...processedData };
        this.processedAt = new Date().toISOString();
        return this;
    }
}
module.exports = Document;
