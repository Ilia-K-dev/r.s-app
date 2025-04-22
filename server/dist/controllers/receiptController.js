"use strict";
const { AppError } = require('../utils/error/AppError'); //good
const documentScanner = require('../services/document/DocumentProcessingService'); //good
const { preprocessImage } = require('../services/preprocessing'); //good
const { extractText } = require('../services/document/DocumentProcessingService'); //good
const receiptParser = require('../services/receipts/ReceiptProcessingService'); //good
const logger = require('../utils/logger'); //good
const Receipt = require('../models/Receipt'); //good
const receiptController = {
    async uploadReceipt(req, res, next) {
        try {
            if (!req.file) {
                throw new AppError('No file uploaded', 400);
            }
            logger.info('Starting receipt processing', {
                filename: req.file.originalname,
                filesize: req.file.size
            });
            // 1. Process image for optimal OCR
            const processedImage = await imageProcessor.processImage(req.file.buffer);
            logger.info('Image processed successfully');
            // 2. Extract text from image
            const extractedText = await textExtractor.extractText(processedImage);
            if (!extractedText) {
                throw new AppError('No text could be extracted from image', 400);
            }
            logger.info('Text extracted successfully', { confidence: extractedText.confidence });
            // 3. Classify document
            const documentType = await documentScanner.classifyDocument(extractedText);
            if (documentType.type !== 'receipt') {
                logger.warn('Document appears to not be a receipt', { detectedType: documentType.type });
            }
            // 4. Parse receipt data
            const receiptData = await documentScanner.parseReceipt(extractedText);
            logger.info('Receipt parsed successfully', {
                vendor: receiptData.vendor,
                itemCount: receiptData.items.length
            });
            // 5. Save receipt to database
            const receipt = new Receipt({
                userId: req.user.uid,
                ...receiptData,
                originalText: extractedText.fullText,
                confidence: extractedText.confidence,
                documentType: documentType.type,
                metadata: {
                    originalFileName: req.file.originalname,
                    processedAt: new Date(),
                    textLayout: extractedText.layout
                }
            });
            await receipt.save();
            logger.info('Receipt saved to database', { receiptId: receipt.id });
            // 6. Upload processed image
            const imageUrl = await documentScanner.uploadImage(processedImage, req.user.uid, receipt.id);
            // 7. Update receipt with image URL
            receipt.imageUrl = imageUrl;
            await receipt.save();
            res.status(201).json({
                status: 'success',
                data: {
                    receipt: receipt,
                    warnings: documentType.type !== 'receipt' ? [{
                            type: 'document_type',
                            message: `Document appears to be a ${documentType.type} rather than a receipt`
                        }] : []
                }
            });
        }
        catch (error) {
            logger.error('Receipt upload failed:', error);
            next(new AppError(error.message, error.statusCode || 500));
        }
    },
    async uploadBulkReceipts(req, res, next) {
        try {
            if (!req.files || !req.files.length) {
                throw new AppError('No files uploaded', 400);
            }
            const results = await Promise.all(req.files.map(async (file) => {
                try {
                    const result = await documentScanner.processDocument(file, req.user.uid);
                    return {
                        filename: file.originalname,
                        status: 'success',
                        data: result
                    };
                }
                catch (error) {
                    return {
                        filename: file.originalname,
                        status: 'error',
                        error: error.message
                    };
                }
            }));
            res.status(201).json({
                status: 'success',
                data: results
            });
        }
        catch (error) {
            logger.error('Bulk upload failed:', error);
            next(new AppError(error.message, error.statusCode || 500));
        }
    },
    async getReceipts(req, res, next) {
        try {
            const { startDate, endDate, category, vendor, minAmount, maxAmount, sortBy = 'date', sortOrder = 'desc', page = 1, limit = 10 } = req.query;
            const filters = {
                userId: req.user.uid,
                ...(startDate && { date: { $gte: new Date(startDate) } }),
                ...(endDate && { date: { $lte: new Date(endDate) } }),
                ...(category && { category }),
                ...(vendor && { vendor: new RegExp(vendor, 'i') }),
                ...(minAmount && { total: { $gte: parseFloat(minAmount) } }),
                ...(maxAmount && { total: { $lte: parseFloat(maxAmount) } })
            };
            const total = await Receipt.countDocuments(filters);
            const receipts = await Receipt.find(filters)
                .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
                .skip((page - 1) * limit)
                .limit(limit);
            res.status(200).json({
                status: 'success',
                data: {
                    receipts,
                    pagination: {
                        total,
                        page: parseInt(page),
                        pages: Math.ceil(total / limit)
                    }
                }
            });
        }
        catch (error) {
            logger.error('Error fetching receipts:', error);
            next(new AppError(error.message, 500));
        }
    },
    async getReceiptById(req, res, next) {
        try {
            const receipt = await Receipt.findOne({
                _id: req.params.id,
                userId: req.user.uid
            });
            if (!receipt) {
                throw new AppError('Receipt not found', 404);
            }
            res.status(200).json({
                status: 'success',
                data: { receipt }
            });
        }
        catch (error) {
            logger.error('Error fetching receipt:', error);
            next(new AppError(error.message, error.statusCode || 500));
        }
    },
    async updateReceipt(req, res, next) {
        try {
            const receipt = await Receipt.findOne({
                _id: req.params.id,
                userId: req.user.uid
            });
            if (!receipt) {
                throw new AppError('Receipt not found', 404);
            }
            const allowedUpdates = [
                'vendor',
                'date',
                'category',
                'items',
                'notes',
                'total'
            ];
            Object.keys(req.body).forEach(key => {
                if (allowedUpdates.includes(key)) {
                    receipt[key] = req.body[key];
                }
            });
            receipt.metadata.lastModified = new Date();
            await receipt.save();
            res.status(200).json({
                status: 'success',
                data: { receipt }
            });
        }
        catch (error) {
            logger.error('Error updating receipt:', error);
            next(new AppError(error.message, error.statusCode || 500));
        }
    },
    async deleteReceipt(req, res, next) {
        try {
            const receipt = await Receipt.findOne({
                _id: req.params.id,
                userId: req.user.uid
            });
            if (!receipt) {
                throw new AppError('Receipt not found', 404);
            }
            if (receipt.imageUrl) {
                await documentScanner.deleteImage(receipt.imageUrl);
            }
            await receipt.remove();
            res.status(200).json({
                status: 'success',
                data: null
            });
        }
        catch (error) {
            logger.error('Error deleting receipt:', error);
            next(new AppError(error.message, error.statusCode || 500));
        }
    },
    // Process scanned text
    async processScannedText(req, res, next) {
        try {
            const { text } = req.body;
            if (!text) {
                throw new AppError('No text provided', 400);
            }
            const result = await documentScanner.processText(text);
            res.status(200).json({ status: 'success', data: result });
        }
        catch (error) {
            next(error);
        }
    },
    // Analyze receipt
    async getReceiptAnalysis(req, res, next) {
        try {
            const analysis = await documentScanner.analyzeReceipt(req.params.id);
            res.status(200).json({ status: 'success', data: analysis });
        }
        catch (error) {
            next(error);
        }
    },
    // Additional methods implementation...
    async exportReceipts(req, res, next) {
        try {
            const exported = await documentScanner.exportReceipts(req.body);
            res.status(200).json({ status: 'success', data: exported });
        }
        catch (error) {
            next(error);
        }
    },
    async getCategoriesSummary(req, res, next) {
        try {
            const summary = await Receipt.getCategoriesSummary(req.user.uid);
            res.status(200).json({ status: 'success', data: summary });
        }
        catch (error) {
            next(error);
        }
    },
    async getSpendingTrends(req, res, next) {
        try {
            const trends = await Receipt.getSpendingTrends(req.user.uid);
            res.status(200).json({ status: 'success', data: trends });
        }
        catch (error) {
            next(error);
        }
    },
    async comparePrices(req, res, next) {
        try {
            const comparison = await Receipt.comparePrices(req.body.items);
            res.status(200).json({ status: 'success', data: comparison });
        }
        catch (error) {
            logger.error('Error comparing prices:', error);
            next(new AppError(error.message, 500));
        }
    },
    async getSimilarReceipts(req, res, next) {
        try {
            const similar = await Receipt.findSimilar(req.params.id);
            res.status(200).json({ status: 'success', data: similar });
        }
        catch (error) {
            logger.error('Error finding similar receipts:', error);
            next(new AppError(error.message, 500));
        }
    }
};
module.exports = receiptController;
