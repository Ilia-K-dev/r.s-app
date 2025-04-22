"use strict";
const Product = require('../models/Product'); //good
const StockMovement = require('../models/StockMovement'); //good
const InventoryAlert = require('../models/InventoryAlert'); //good
const { AppError } = require('../utils/error/AppError'); //good
const logger = require('../utils/logger'); //good
const inventoryController = {
    // Product Management
    async createProduct(req, res, next) {
        try {
            const productData = {
                ...req.body,
                userId: req.user.uid
            };
            const product = new Product(productData);
            await product.save();
            res.status(201).json({
                status: 'success',
                data: { product }
            });
        }
        catch (error) {
            logger.error('Error creating product:', error);
            next(new AppError(error.message, 400));
        }
    },
    async updateProduct(req, res, next) {
        try {
            const product = await Product.findById(req.params.id);
            if (!product || product.userId !== req.user.uid) {
                throw new AppError('Product not found', 404);
            }
            Object.assign(product, req.body);
            await product.save();
            res.status(200).json({
                status: 'success',
                data: { product }
            });
        }
        catch (error) {
            logger.error('Error updating product:', error);
            next(new AppError(error.message, 400));
        }
    },
    async getProducts(req, res, next) {
        try {
            const { category, status, stockLevel, search, sortBy = 'name', sortOrder = 'asc' } = req.query;
            const filters = {
                category,
                status,
                stockLevel
            };
            const products = await Product.findByUser(req.user.uid, filters);
            // Apply search filter if provided
            let filteredProducts = products;
            if (search) {
                const searchLower = search.toLowerCase();
                filteredProducts = products.filter(product => product.name.toLowerCase().includes(searchLower) ||
                    product.sku?.toLowerCase().includes(searchLower) ||
                    product.barcode?.toLowerCase().includes(searchLower));
            }
            // Apply sorting
            filteredProducts.sort((a, b) => {
                const aValue = a[sortBy];
                const bValue = b[sortBy];
                return sortOrder === 'asc' ?
                    (aValue > bValue ? 1 : -1) :
                    (aValue < bValue ? 1 : -1);
            });
            res.status(200).json({
                status: 'success',
                data: { products: filteredProducts }
            });
        }
        catch (error) {
            logger.error('Error fetching products:', error);
            next(new AppError(error.message, 400));
        }
    },
    // Stock Management
    async updateStock(req, res, next) {
        try {
            const { quantity, type, reason } = req.body;
            const product = await Product.findById(req.params.id);
            if (!product || product.userId !== req.user.uid) {
                throw new AppError('Product not found', 404);
            }
            const movement = await product.updateStock(quantity, type, reason);
            res.status(200).json({
                status: 'success',
                data: {
                    product,
                    movement
                }
            });
        }
        catch (error) {
            logger.error('Error updating stock:', error);
            next(new AppError(error.message, 400));
        }
    },
    async getStockMovements(req, res, next) {
        try {
            const { startDate, endDate, type } = req.query;
            const movements = await StockMovement.findByDateRange(req.user.uid, new Date(startDate), new Date(endDate));
            // Filter by type if provided
            const filteredMovements = type ?
                movements.filter(m => m.type === type) :
                movements;
            res.status(200).json({
                status: 'success',
                data: { movements: filteredMovements }
            });
        }
        catch (error) {
            logger.error('Error fetching stock movements:', error);
            next(new AppError(error.message, 400));
        }
    },
    // Alert Management
    async getAlerts(req, res, next) {
        try {
            const { status, level } = req.query;
            let alerts;
            if (level === 'critical') {
                alerts = await InventoryAlert.findCriticalAlerts(req.user.uid);
            }
            else {
                alerts = await InventoryAlert.findActiveAlerts(req.user.uid);
            }
            // Filter by status if provided
            if (status) {
                alerts = alerts.filter(alert => alert.status === status);
            }
            res.status(200).json({
                status: 'success',
                data: { alerts }
            });
        }
        catch (error) {
            logger.error('Error fetching alerts:', error);
            next(new AppError(error.message, 400));
        }
    },
    async resolveAlert(req, res, next) {
        try {
            const { notes } = req.body;
            const alert = await InventoryAlert.findById(req.params.id);
            if (!alert || alert.userId !== req.user.uid) {
                throw new AppError('Alert not found', 404);
            }
            await alert.resolve(req.user.uid, notes);
            res.status(200).json({
                status: 'success',
                data: { alert }
            });
        }
        catch (error) {
            logger.error('Error resolving alert:', error);
            next(new AppError(error.message, 400));
        }
    },
    // Inventory Analysis
    async getInventoryStatus(req, res, next) {
        try {
            const products = await Product.findByUser(req.user.uid);
            const status = {
                totalProducts: products.length,
                totalValue: products.reduce((sum, p) => sum + (p.currentStock * p.unitPrice), 0),
                lowStock: products.filter(p => p.currentStock <= p.minStockLevel).length,
                outOfStock: products.filter(p => p.currentStock === 0).length,
                needsReorder: products.filter(p => p.currentStock <= p.reorderPoint).length,
                categories: {}
            };
            // Calculate category statistics
            products.forEach(product => {
                if (!status.categories[product.category]) {
                    status.categories[product.category] = {
                        count: 0,
                        value: 0,
                        lowStock: 0
                    };
                }
                const cat = status.categories[product.category];
                cat.count++;
                cat.value += product.currentStock * product.unitPrice;
                if (product.currentStock <= product.minStockLevel) {
                    cat.lowStock++;
                }
            });
            res.status(200).json({
                status: 'success',
                data: { status }
            });
        }
        catch (error) {
            logger.error('Error getting inventory status:', error);
            next(new AppError(error.message, 400));
        }
    }
};
module.exports = inventoryController;
