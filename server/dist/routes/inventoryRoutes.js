"use strict";
const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/auth/auth'); //good
const inventoryController = require('../controllers/inventoryController'); //good 
const { validate } = require('../middleware/validation/validation'); //good
// Apply authentication to all routes
router.use(authenticateUser);
// Product Management Routes
router.post('/products', validate({
    body: {
        name: { type: 'string', required: true },
        category: { type: 'string', required: true },
        unitPrice: { type: 'number', required: true },
        currentStock: { type: 'number', required: true },
        minStockLevel: { type: 'number', optional: true },
        reorderPoint: { type: 'number', optional: true }
    }
}), inventoryController.createProduct);
router.get('/products', validate({
    query: {
        category: { type: 'string', optional: true },
        status: { type: 'string', optional: true },
        stockLevel: { type: 'string', optional: true },
        search: { type: 'string', optional: true },
        sortBy: { type: 'string', optional: true },
        sortOrder: { type: 'string', optional: true }
    }
}), inventoryController.getProducts);
router.put('/products/:id', validate({
    params: {
        id: { type: 'string', required: true }
    },
    body: {
        name: { type: 'string', optional: true },
        category: { type: 'string', optional: true },
        unitPrice: { type: 'number', optional: true },
        minStockLevel: { type: 'number', optional: true },
        reorderPoint: { type: 'number', optional: true },
        status: { type: 'string', optional: true }
    }
}), inventoryController.updateProduct);
// Stock Management Routes
router.post('/products/:id/stock', validate({
    params: {
        id: { type: 'string', required: true }
    },
    body: {
        quantity: { type: 'number', required: true },
        type: { type: 'string', required: true, enum: ['add', 'subtract', 'set'] },
        reason: { type: 'string', required: true }
    }
}), inventoryController.updateStock);
router.get('/stock-movements', validate({
    query: {
        startDate: { type: 'date', optional: true },
        endDate: { type: 'date', optional: true },
        type: { type: 'string', optional: true }
    }
}), inventoryController.getStockMovements);
// Alert Management Routes
router.get('/alerts', validate({
    query: {
        status: { type: 'string', optional: true },
        level: { type: 'string', optional: true }
    }
}), inventoryController.getAlerts);
router.post('/alerts/:id/resolve', validate({
    params: {
        id: { type: 'string', required: true }
    },
    body: {
        notes: { type: 'string', optional: true }
    }
}), inventoryController.resolveAlert);
// Inventory Analysis Routes
router.get('/status', inventoryController.getInventoryStatus);
router.get('/reports/low-stock', validate({
    query: {
        threshold: { type: 'number', optional: true }
    }
}), inventoryController.getLowStockReport);
router.get('/reports/stock-value', validate({
    query: {
        category: { type: 'string', optional: true },
        startDate: { type: 'date', optional: true },
        endDate: { type: 'date', optional: true }
    }
}), inventoryController.getStockValueReport);
router.get('/reports/movements', validate({
    query: {
        startDate: { type: 'date', required: true },
        endDate: { type: 'date', required: true },
        type: { type: 'string', optional: true },
        category: { type: 'string', optional: true }
    }
}), inventoryController.getMovementsReport);
// Batch Operations
router.post('/batch/update-stock', validate({
    body: {
        updates: {
            type: 'array',
            items: {
                productId: { type: 'string', required: true },
                quantity: { type: 'number', required: true },
                type: { type: 'string', required: true }
            }
        }
    }
}), inventoryController.batchUpdateStock);
router.post('/import', validate({
    body: {
        products: {
            type: 'array',
            items: {
                name: { type: 'string', required: true },
                category: { type: 'string', required: true },
                currentStock: { type: 'number', required: true },
                unitPrice: { type: 'number', required: true }
            }
        }
    }
}), inventoryController.importProducts);
module.exports = router;
