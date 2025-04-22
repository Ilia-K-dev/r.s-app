"use strict";
const { db } = require('../../../config/firebase'); //good
const { AppError } = require('../../utils/error/AppError'); //good
const logger = require('../../utils/logger'); //good
const vision = require('@google-cloud/vision');
const { formatCurrency } = require('../../utils/misc/priceCalculator'); //good
class ReceiptProcessingService {
    constructor() {
        this.visionClient = new vision.ImageAnnotatorClient({
            keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS
        });
        this.collection = db.collection('receipts');
        // Common category patterns
        this.categories = {
            food: ['milk', 'bread', 'cheese', 'meat', 'fish', 'vegetable', 'fruit', 'cereal', 'snack'],
            beverages: ['water', 'soda', 'juice', 'coffee', 'tea', 'drink'],
            household: ['paper', 'cleaning', 'detergent', 'soap', 'tissue'],
            electronics: ['battery', 'charger', 'cable', 'phone', 'computer'],
            clothing: ['shirt', 'pants', 'dress', 'shoe', 'jacket'],
            health: ['medicine', 'vitamin', 'pharmacy', 'drug'],
            beauty: ['shampoo', 'cosmetic', 'lotion', 'makeup']
        };
    }
    // Main Processing Method
    async processReceipt(imageFile, userId) {
        try {
            logger.info('Starting receipt processing', {
                filename: imageFile.originalname,
                filesize: imageFile.size
            });
            // 1. Upload image and get URL
            const imageUrl = await this._uploadImage(imageFile, userId);
            logger.info('Image uploaded successfully');
            // 2. Extract text using Vision API
            const extractedText = await this._extractText(imageFile.buffer);
            if (!extractedText) {
                throw new AppError('No text could be extracted from image', 400);
            }
            logger.info('Text extracted successfully', { confidence: extractedText.confidence });
            // 3. Parse receipt data
            const receiptData = await this._parseReceiptData(extractedText);
            logger.info('Receipt parsed successfully', {
                vendor: receiptData.merchant,
                itemCount: receiptData.items.length
            });
            // 4. Save to database
            const receipt = await this._saveToDatabase({
                ...receiptData,
                userId,
                imageUrl,
                originalText: extractedText.fullText,
                confidence: extractedText.confidence,
                createdAt: new Date(),
                updatedAt: new Date()
            });
            return receipt;
        }
        catch (error) {
            logger.error('Receipt processing error:', error);
            throw new AppError(error.message, error.statusCode || 500);
        }
    }
    // Text Extraction Methods
    async _extractText(imageBuffer) {
        try {
            const [result] = await this.visionClient.textDetection(imageBuffer);
            const detections = result.textAnnotations;
            if (!detections || detections.length === 0) {
                return null;
            }
            return {
                fullText: detections[0].description,
                blocks: this._processTextBlocks(result.fullTextAnnotation?.pages?.[0]?.blocks || []),
                confidence: result.fullTextAnnotation?.confidence || 0
            };
        }
        catch (error) {
            logger.error('Text extraction error:', error);
            throw new AppError('Failed to extract text from image', 500);
        }
    }
    _processTextBlocks(blocks) {
        return blocks.map(block => ({
            text: block.paragraphs
                ?.map(p => p.words?.map(w => w.symbols?.map(s => s.text).join('')).join(' '))
                .join('\n'),
            confidence: block.confidence,
            boundingBox: block.boundingBox
        }));
    }
    // Data Parsing Methods
    async _parseReceiptData(extractedText) {
        try {
            const receiptData = {
                storeName: null,
                merchant: null,
                date: null,
                items: [],
                totals: {
                    subtotal: null,
                    tax: null,
                    total: null
                },
                paymentMethod: null,
                rawText: extractedText.fullText
            };
            const lines = extractedText.fullText.split('\n').map(line => line.trim());
            // Extract store name and merchant
            receiptData.storeName = this._extractStoreName(lines);
            receiptData.merchant = receiptData.storeName;
            // Extract date
            receiptData.date = this._extractDate(lines);
            // Extract items and prices
            receiptData.items = this._extractItems(lines);
            // Extract totals
            receiptData.totals = this._extractTotals(lines);
            // Extract payment method
            receiptData.paymentMethod = this._extractPaymentMethod(extractedText.fullText);
            // Validate and clean the data
            return this._validateAndClean(receiptData);
        }
        catch (error) {
            logger.error('Error parsing receipt data:', error);
            throw new AppError('Failed to parse receipt data', 500);
        }
    }
    _extractStoreName(lines) {
        for (let i = 0; i < Math.min(5, lines.length); i++) {
            const line = lines[i];
            if (line.length > 3 &&
                !line.match(/^\d/) &&
                !line.match(/^(AM|PM)/) &&
                !line.match(/^\$/) &&
                !line.match(/^(sun|mon|tue|wed|thu|fri|sat)/i)) {
                return line;
            }
        }
        return 'Unknown Store';
    }
    _extractDate(lines) {
        const datePatterns = [
            /(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})/, // mm/dd/yyyy or dd/mm/yyyy
            /(\d{4})[/-](\d{1,2})[/-](\d{1,2})/, // yyyy/mm/dd
            /(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]* (\d{1,2}),? (\d{4})/i // Month DD, YYYY
        ];
        for (const line of lines) {
            for (const pattern of datePatterns) {
                const match = line.match(pattern);
                if (match) {
                    try {
                        const date = new Date(match[0]);
                        if (!isNaN(date.getTime())) {
                            return date;
                        }
                    }
                    catch (e) {
                        continue;
                    }
                }
            }
        }
        return new Date();
    }
    _extractItems(lines) {
        const items = [];
        const itemPattern = /(.+?)\s+\$?\s*(\d+[.,]\d{2})\s*$/;
        const quantityPattern = /(\d+)\s*@\s*\$?\s*(\d+[.,]\d{2})/;
        for (const line of lines) {
            if (this._isNonItemLine(line))
                continue;
            const itemMatch = line.match(itemPattern);
            if (itemMatch) {
                const [, name, price] = itemMatch;
                const item = {
                    name: name.trim(),
                    price: parseFloat(price.replace(',', '.')),
                    quantity: 1,
                    category: this._categorizeItem(name.trim())
                };
                const quantityMatch = name.match(quantityPattern);
                if (quantityMatch) {
                    item.quantity = parseInt(quantityMatch[1]);
                    item.unitPrice = parseFloat(quantityMatch[2].replace(',', '.'));
                }
                items.push(item);
            }
        }
        return items;
    }
    _isNonItemLine(line) {
        return line.match(/subtotal|total|tax|date|time|store|tel|fax|receipt|^\s*$/i) ||
            line.match(/^\d{1,2}[/-]\d{1,2}[/-]\d{2,4}$/);
    }
    _extractTotals(lines) {
        const totals = {
            subtotal: null,
            tax: null,
            total: null
        };
        const totalPatterns = {
            subtotal: /subtotal\s*[:\$]?\s*(\d+[.,]\d{2})/i,
            tax: /tax\s*[:\$]?\s*(\d+[.,]\d{2})/i,
            total: [
                /total\s*[:\$]?\s*(\d+[.,]\d{2})/i,
                /(?:sum|amount)\s*[:\$]?\s*(\d+[.,]\d{2})/i,
                /\btotal\b.*?\$?\s*(\d+[.,]\d{2})/i,
                /\$\s*(\d+[.,]\d{2})\s*$/
            ]
        };
        // Extract subtotal and tax
        for (const line of lines) {
            const subtotalMatch = line.match(totalPatterns.subtotal);
            if (subtotalMatch) {
                totals.subtotal = parseFloat(subtotalMatch[1].replace(',', '.'));
            }
            const taxMatch = line.match(totalPatterns.tax);
            if (taxMatch) {
                totals.tax = parseFloat(taxMatch[1].replace(',', '.'));
            }
        }
        // Extract total (search from bottom up)
        for (let i = lines.length - 1; i >= 0; i--) {
            const line = lines[i];
            for (const pattern of totalPatterns.total) {
                const match = line.match(pattern);
                if (match && !line.toLowerCase().includes('subtotal')) {
                    totals.total = parseFloat(match[1].replace(',', '.'));
                    break;
                }
            }
            if (totals.total)
                break;
        }
        return totals;
    }
    _extractPaymentMethod(text) {
        const paymentMethods = {
            card: /credit|debit|visa|mastercard|amex|card/i,
            cash: /cash|money|paid/i,
            check: /check|cheque/i,
            other: /gift card|voucher|coupon/i
        };
        for (const [method, pattern] of Object.entries(paymentMethods)) {
            if (text.match(pattern)) {
                return method;
            }
        }
        return 'unknown';
    }
    _categorizeItem(name) {
        name = name.toLowerCase();
        for (const [category, keywords] of Object.entries(this.categories)) {
            if (keywords.some(keyword => name.includes(keyword))) {
                return category;
            }
        }
        return 'other';
    }
    // Storage Methods
    async _uploadImage(file, userId) {
        try {
            const timestamp = Date.now();
            const fileName = `receipts/${userId}/${timestamp}-${file.originalname}`;
            const fileRef = storage.ref().child(fileName);
            await fileRef.put(file.buffer, {
                contentType: file.mimetype
            });
            return await fileRef.getDownloadURL();
        }
        catch (error) {
            logger.error('Image upload error:', error);
            throw new AppError('Failed to upload image', 500);
        }
    }
    async _saveToDatabase(receiptData) {
        try {
            const docRef = await this.collection.add(receiptData);
            return {
                id: docRef.id,
                ...receiptData
            };
        }
        catch (error) {
            logger.error('Database save error:', error);
            throw new AppError('Failed to save receipt', 500);
        }
    }
    // Validation Methods
    _validateAndClean(receiptData) {
        // Validate required fields
        if (!receiptData.storeName) {
            receiptData.storeName = 'Unknown Store';
        }
        if (!receiptData.merchant) {
            receiptData.merchant = receiptData.storeName;
        }
        if (!receiptData.date) {
            receiptData.date = new Date();
        }
        // Validate totals
        if (receiptData.totals.total === null) {
            receiptData.totals.total = receiptData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        }
        // Validate items
        receiptData.items = receiptData.items.filter(item => item.name &&
            !isNaN(item.price) &&
            item.price > 0 &&
            !isNaN(item.quantity) &&
            item.quantity > 0);
        // Validate total matches sum of items
        if (receiptData.totals.total && receiptData.items.length > 0) {
            const itemsSum = receiptData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            if (Math.abs(itemsSum - receiptData.totals.total) / receiptData.totals.total > 0.2) {
                logger.warn('Total validation failed:', {
                    calculated: itemsSum,
                    actual: receiptData.totals.total
                });
            }
        }
        return receiptData;
    }
    // Utility Methods
    calculateUnitPrice(price, quantity, unit = null) {
        if (!price || !quantity || quantity === 0) {
            return null;
        }
        return {
            price: price / quantity,
            unit: unit || 'unit'
        };
    }
    categorizePurchase(items) {
        const categoryTotals = {};
        let topCategory = null;
        let topAmount = 0;
        items.forEach(item => {
            const category = item.category || 'other';
            const amount = item.price * (item.quantity || 1);
            categoryTotals[category] = (categoryTotals[category] || 0) + amount;
            if (categoryTotals[category] > topAmount) {
                topAmount = categoryTotals[category];
                topCategory = category;
            }
        });
        return {
            categoryTotals,
            topCategory,
            topAmount
        };
    }
    formatReceiptData(receiptData) {
        return {
            ...receiptData,
            date: receiptData.date?.toISOString(),
            createdAt: receiptData.createdAt?.toISOString(),
            updatedAt: receiptData.updatedAt?.toISOString(),
            totals: {
                ...receiptData.totals,
                subtotal: formatCurrency(receiptData.totals.subtotal),
                tax: formatCurrency(receiptData.totals.tax),
                total: formatCurrency(receiptData.totals.total)
            },
            items: receiptData.items.map(item => ({
                ...item,
                price: formatCurrency(item.price),
                unitPrice: item.unitPrice ? formatCurrency(item.unitPrice) : null
            }))
        };
    }
    // CRUD Operations
    async getReceipts(userId, filters = {}) {
        try {
            let query = this.collection.where('userId', '==', userId);
            // Apply filters
            if (filters.startDate) {
                query = query.where('date', '>=', new Date(filters.startDate));
            }
            if (filters.endDate) {
                query = query.where('date', '<=', new Date(filters.endDate));
            }
            if (filters.merchant) {
                query = query.where('merchant', '==', filters.merchant);
            }
            if (filters.category) {
                query = query.where('items.category', '==', filters.category);
            }
            if (filters.minAmount) {
                query = query.where('totals.total', '>=', parseFloat(filters.minAmount));
            }
            if (filters.maxAmount) {
                query = query.where('totals.total', '<=', parseFloat(filters.maxAmount));
            }
            const snapshot = await query.get();
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        }
        catch (error) {
            logger.error('Error fetching receipts:', error);
            throw new AppError('Failed to fetch receipts', 500);
        }
    }
    async getReceiptById(id, userId) {
        try {
            const doc = await this.collection.doc(id).get();
            if (!doc.exists || doc.data().userId !== userId) {
                throw new AppError('Receipt not found', 404);
            }
            return {
                id: doc.id,
                ...doc.data()
            };
        }
        catch (error) {
            logger.error('Error fetching receipt:', error);
            throw new AppError('Failed to fetch receipt', 500);
        }
    }
    async updateReceipt(id, userId, updateData) {
        try {
            const doc = await this.collection.doc(id).get();
            if (!doc.exists || doc.data().userId !== userId) {
                throw new AppError('Receipt not found', 404);
            }
            await this.collection.doc(id).update({
                ...updateData,
                updatedAt: new Date()
            });
            return {
                id,
                ...doc.data(),
                ...updateData
            };
        }
        catch (error) {
            logger.error('Error updating receipt:', error);
            throw new AppError('Failed to update receipt', 500);
        }
    }
    async deleteReceipt(id, userId) {
        try {
            const doc = await this.collection.doc(id).get();
            if (!doc.exists || doc.data().userId !== userId) {
                throw new AppError('Receipt not found', 404);
            }
            // Delete associated image
            if (doc.data().imageUrl) {
                const imageRef = storage.refFromURL(doc.data().imageUrl);
                await imageRef.delete();
            }
            await this.collection.doc(id).delete();
            return true;
        }
        catch (error) {
            logger.error('Error deleting receipt:', error);
            throw new AppError('Failed to delete receipt', 500);
        }
    }
    // Analytics Methods
    async generateReceiptSummary(receiptId, userId) {
        const receipt = await this.getReceiptById(receiptId, userId);
        const categorization = this.categorizePurchase(receipt.items);
        return {
            id: receipt.id,
            merchant: receipt.merchant,
            date: receipt.date,
            totalAmount: receipt.totals.total,
            itemCount: receipt.items.length,
            categories: categorization.categoryTotals,
            primaryCategory: categorization.topCategory,
            averageItemPrice: receipt.items.length > 0
                ? receipt.totals.total / receipt.items.length
                : 0
        };
    }
    async getReceiptStatistics(userId, timeframe = '30d') {
        try {
            const startDate = new Date();
            switch (timeframe) {
                case '7d':
                    startDate.setDate(startDate.getDate() - 7);
                    break;
                case '30d':
                    startDate.setDate(startDate.getDate() - 30);
                    break;
                case '90d':
                    startDate.setDate(startDate.getDate() - 90);
                    break;
                case '1y':
                    startDate.setFullYear(startDate.getFullYear() - 1);
                    break;
                default:
                    startDate.setDate(startDate.getDate() - 30);
            }
            const receipts = await this.getReceipts(userId, { startDate });
            const stats = {
                totalSpent: 0,
                receiptCount: receipts.length,
                categoryTotals: {},
                averageReceiptAmount: 0,
                topMerchants: {},
                itemCount: 0
            };
            receipts.forEach(receipt => {
                stats.totalSpent += receipt.totals.total || 0;
                stats.itemCount += receipt.items.length;
                // Category totals
                receipt.items.forEach(item => {
                    const category = item.category || 'other';
                    stats.categoryTotals[category] = (stats.categoryTotals[category] || 0) +
                        (item.price * (item.quantity || 1));
                });
                // Merchant frequency
                const merchant = receipt.merchant || 'Unknown';
                stats.topMerchants[merchant] = (stats.topMerchants[merchant] || 0) + 1;
            });
            stats.averageReceiptAmount = stats.receiptCount > 0
                ? stats.totalSpent / stats.receiptCount
                : 0;
            return stats;
        }
        catch (error) {
            logger.error('Error generating receipt statistics:', error);
            throw new AppError('Failed to generate receipt statistics', 500);
        }
    }
    async searchReceipts(userId, searchParams) {
        try {
            let query = this.collection.where('userId', '==', userId);
            // Handle text search
            if (searchParams.text) {
                const searchText = searchParams.text.toLowerCase();
                const snapshot = await query.get();
                return snapshot.docs
                    .map(doc => ({ id: doc.id, ...doc.data() }))
                    .filter(receipt => receipt.merchant?.toLowerCase().includes(searchText) ||
                    receipt.items.some(item => item.name.toLowerCase().includes(searchText)));
            }
            // Apply other filters
            if (searchParams.minAmount) {
                query = query.where('totals.total', '>=', parseFloat(searchParams.minAmount));
            }
            if (searchParams.maxAmount) {
                query = query.where('totals.total', '<=', parseFloat(searchParams.maxAmount));
            }
            if (searchParams.category) {
                query = query.where('items.category', '==', searchParams.category);
            }
            const snapshot = await query.get();
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        }
        catch (error) {
            logger.error('Error searching receipts:', error);
            throw new AppError('Failed to search receipts', 500);
        }
    }
}
// Export singleton instance
module.exports = new ReceiptProcessingService();
