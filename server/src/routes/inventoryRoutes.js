const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const { authenticate } = require('../middleware/auth/auth'); // Assuming auth middleware location

// Apply authentication middleware to all inventory routes
router.use(authenticate);

// GET /api/inventory - List all inventory items for a user
router.get('/', inventoryController.listInventory);

// GET /api/inventory/:id - Get a specific inventory item
router.get('/:id', inventoryController.getInventoryItem);

// POST /api/inventory - Create a new inventory item
router.post('/', inventoryController.createInventoryItem);

// PUT /api/inventory/:id - Update an inventory item
router.put('/:id', inventoryController.updateInventoryItem);

// DELETE /api/inventory/:id - Delete an inventory item
router.delete('/:id', inventoryController.deleteInventoryItem);

// PUT /api/inventory/:id/stock - Update stock levels
router.put('/:id/stock', inventoryController.updateStock);

// GET /api/inventory/movements - Get stock movement history
router.get('/movements', inventoryController.getStockMovements);

// POST /api/inventory/movements - Create a stock movement record
router.post('/movements', inventoryController.createStockMovement);

// GET /api/inventory/low-stock - Get low stock alerts
router.get('/low-stock', inventoryController.getLowStockAlerts);

module.exports = router;
