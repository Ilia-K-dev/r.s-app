const inventoryService = require('../services/inventory/inventoryService'); // Assuming service location
const { handleError } = require('../utils/errorHandler'); // Assuming error handler utility
const { logInfo } = require('../utils/logger'); // Assuming logger utility

// GET /api/inventory - List all inventory items for a user
exports.listInventory = async (req, res) => {
  try {
    const userId = req.user.uid; // Assuming user ID is available from authentication middleware
    logInfo(`User ${userId} requesting inventory list.`);
    const inventory = await inventoryService.listInventory(userId);
    res.status(200).json(inventory);
  } catch (error) {
    handleError(res, error);
  }
};

// GET /api/inventory/:id - Get a specific inventory item
exports.getInventoryItem = async (req, res) => {
  try {
    const userId = req.user.uid;
    const itemId = req.params.id;
    logInfo(`User ${userId} requesting inventory item: ${itemId}`);
    const item = await inventoryService.getInventoryItem(userId, itemId);
    if (!item) {
      return res.status(404).json({ message: 'Inventory item not found.' });
    }
    res.status(200).json(item);
  } catch (error) {
    handleError(res, error);
  }
};

// POST /api/inventory - Create a new inventory item
exports.createInventoryItem = async (req, res) => {
  try {
    const userId = req.user.uid;
    const itemData = req.body;
    logInfo(`User ${userId} creating inventory item with data:`, itemData);
    const newItem = await inventoryService.createInventoryItem(userId, itemData);
    res.status(201).json(newItem);
  } catch (error) {
    handleError(res, error);
  }
};

// PUT /api/inventory/:id - Update an inventory item
exports.updateInventoryItem = async (req, res) => {
  try {
    const userId = req.user.uid;
    const itemId = req.params.id;
    const updateData = req.body;
    logInfo(`User ${userId} updating inventory item ${itemId} with data:`, updateData);
    const updatedItem = await inventoryService.updateInventoryItem(userId, itemId, updateData);
    if (!updatedItem) {
      return res.status(404).json({ message: 'Inventory item not found.' });
    }
    res.status(200).json(updatedItem);
  } catch (error) {
    handleError(res, error);
  }
};

// DELETE /api/inventory/:id - Delete an inventory item
exports.deleteInventoryItem = async (req, res) => {
  try {
    const userId = req.user.uid;
    const itemId = req.params.id;
    logInfo(`User ${userId} deleting inventory item: ${itemId}`);
    await inventoryService.deleteInventoryItem(userId, itemId);
    res.status(204).send(); // No content on successful deletion
  } catch (error) {
    handleError(res, error);
  }
};

// PUT /api/inventory/:id/stock - Update stock levels
exports.updateStock = async (req, res) => {
  try {
    const userId = req.user.uid;
    const itemId = req.params.id;
    const { quantityChange, movementType } = req.body; // Assuming these fields are in the request body
    logInfo(`User ${userId} updating stock for item ${itemId} by ${quantityChange} (${movementType})`);
    const updatedItem = await inventoryService.updateStock(userId, itemId, quantityChange, movementType);
     if (!updatedItem) {
      return res.status(404).json({ message: 'Inventory item not found.' });
    }
    res.status(200).json(updatedItem);
  } catch (error) {
    handleError(res, error);
  }
};

// GET /api/inventory/movements - Get stock movement history
exports.getStockMovements = async (req, res) => {
  try {
    const userId = req.user.uid;
    // Add filtering/pagination options from req.query if needed
    logInfo(`User ${userId} requesting stock movement history.`);
    const movements = await inventoryService.getStockMovements(userId, req.query);
    res.status(200).json(movements);
  } catch (error) {
    handleError(res, error);
  }
};

// POST /api/inventory/movements - Create a stock movement record
// This might be handled internally by updateStock, but including for completeness if needed
exports.createStockMovement = async (req, res) => {
   try {
    const userId = req.user.uid;
    const movementData = req.body;
    logInfo(`User ${userId} creating stock movement record:`, movementData);
    const newMovement = await inventoryService.createStockMovement(userId, movementData);
    res.status(201).json(newMovement);
  } catch (error) {
    handleError(res, error);
  }
};


// GET /api/inventory/low-stock - Get low stock alerts
exports.getLowStockAlerts = async (req, res) => {
  try {
    const userId = req.user.uid;
    logInfo(`User ${userId} requesting low stock alerts.`);
    const alerts = await inventoryService.getLowStockAlerts(userId);
    res.status(200).json(alerts);
  } catch (error) {
    handleError(res, error);
  }
};
