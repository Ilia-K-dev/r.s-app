const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/auth/auth');
const inventoryController = require('../controllers/inventoryController');
const { validate } = require('../middleware/validation/validation');

// Apply authentication to all routes
router.use(authenticateUser);

// Inventory Item Management Routes (/api/inventory)
router.post('/',
  validate({
    body: {
      name: { type: 'string', required: true },
      category: { type: 'string', required: true },
      unitPrice: { type: 'number', required: true },
      currentStock: { type: 'number', required: true },
      minStockLevel: { type: 'number', optional: true },
      reorderPoint: { type: 'number', optional: true }
    }
  }),
  inventoryController.createProduct // Corresponds to POST /api/inventory
);

router.get('/',
  validate({
    query: {
      category: { type: 'string', optional: true },
      status: { type: 'string', optional: true },
      stockLevel: { type: 'string', optional: true },
      search: { type: 'string', optional: true },
      sortBy: { type: 'string', optional: true },
      sortOrder: { type: 'string', optional: true },
      limit: { type: 'number', required: true },
      startAfter: { type: 'string', optional: true }
    }
  }),
  inventoryController.getProducts // Corresponds to GET /api/inventory
);

router.get('/:id',
  validate({
    params: {
      id: { type: 'string', required: true }
    }
  }),
  inventoryController.getProductById // Corresponds to GET /api/inventory/:id
);

router.put('/:id',
  validate({
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
  }),
  inventoryController.updateProduct // Corresponds to PUT /api/inventory/:id
);

router.delete('/:id',
  validate({
    params: {
      id: { type: 'string', required: true }
    }
  }),
  inventoryController.deleteProduct // Corresponds to DELETE /api/inventory/:id
);

// Stock Management Routes (/api/inventory)
router.put('/:id/stock', // Changed from POST to PUT
  validate({
    params: {
      id: { type: 'string', required: true }
    },
    body: {
      quantity: { type: 'number', required: true },
      type: { type: 'string', required: true, enum: ['add', 'subtract', 'set'] },
      reason: { type: 'string', required: true }
    }
  }),
  inventoryController.updateStock // Corresponds to PUT /api/inventory/:id/stock
);

router.post('/movements',
  validate({
    body: {
      productId: { type: 'string', required: true },
      quantity: { type: 'number', required: true },
      type: { type: 'string', required: true, enum: ['add', 'subtract', 'set'] },
      reason: { type: 'string', required: true },
      timestamp: { type: 'date', optional: true }
    }
  }),
  inventoryController.createStockMovement // Corresponds to POST /api/inventory/movements
);


router.get('/movements',
  validate({
    query: {
      startDate: { type: 'date', optional: true },
      endDate: { type: 'date', optional: true },
      type: { type: 'string', optional: true }
    }
  }),
  inventoryController.getStockMovements // Corresponds to GET /api/inventory/movements
);

// Alert Management Routes (/api/inventory)
router.get('/low-stock',
  inventoryController.getLowStockAlerts // Corresponds to GET /api/inventory/low-stock
);

// The following routes were in the original file but are not explicitly requested in Prompt 1.
// I will keep them for now but note that they might need review based on client needs.
// router.get('/alerts', inventoryController.getAlerts);
// router.post('/alerts/:id/resolve', inventoryController.resolveAlert);
// router.get('/status', inventoryController.getInventoryStatus);
// router.get('/reports/low-stock', inventoryController.getLowStockReport); // Redundant with /low-stock?
// router.get('/reports/stock-value', inventoryController.getStockValueReport);
// router.get('/reports/movements', inventoryController.getMovementsReport);
// router.post('/batch/update-stock', inventoryController.batchUpdateStock);
// router.post('/import', inventoryController.importProducts);


module.exports = router;
