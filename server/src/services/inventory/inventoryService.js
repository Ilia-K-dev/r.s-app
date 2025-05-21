const admin = require('firebase-admin');
const db = admin.firestore();
const { logInfo, logError } = require('../../utils/logger'); // Assuming logger utility
const { AppError } = require('../../utils/errorHandler'); // Assuming error handler utility

// Reference to the 'inventory' collection
const inventoryCollection = db.collection('inventory');
const stockMovementsCollection = db.collection('stockMovements');

/**
 * Lists all inventory items for a given user.
 * @param {string} userId The ID of the user.
 * @returns {Promise<Array<Object>>} A promise that resolves with an array of inventory items.
 */
exports.listInventory = async (userId) => {
  try {
    logInfo(`Fetching inventory for user: ${userId}`);
    const snapshot = await inventoryCollection.where('userId', '==', userId).get();
    const inventory = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    logInfo(`Found ${inventory.length} inventory items for user: ${userId}`);
    return inventory;
  } catch (error) {
    logError(`Error listing inventory for user ${userId}:`, error);
    throw new AppError('Failed to fetch inventory.', 500, error.message);
  }
};

/**
 * Gets a specific inventory item by ID for a given user.
 * @param {string} userId The ID of the user.
 * @param {string} itemId The ID of the inventory item.
 * @returns {Promise<Object|null>} A promise that resolves with the inventory item data or null if not found.
 */
exports.getInventoryItem = async (userId, itemId) => {
  try {
    logInfo(`Fetching inventory item ${itemId} for user: ${userId}`);
    const doc = await inventoryCollection.doc(itemId).get();
    if (!doc.exists || doc.data().userId !== userId) {
      logInfo(`Inventory item ${itemId} not found or does not belong to user ${userId}.`);
      return null;
    }
    logInfo(`Found inventory item: ${itemId}`);
    return { id: doc.id, ...doc.data() };
  } catch (error) {
    logError(`Error getting inventory item ${itemId} for user ${userId}:`, error);
    throw new AppError('Failed to fetch inventory item.', 500, error.message);
  }
};

/**
 * Creates a new inventory item for a given user.
 * @param {string} userId The ID of the user.
 * @param {Object} itemData The data for the new inventory item.
 * @returns {Promise<Object>} A promise that resolves with the created inventory item data.
 */
exports.createInventoryItem = async (userId, itemData) => {
  try {
    logInfo(`Creating inventory item for user: ${userId}`);
    // Add validation for itemData here if not handled by Firestore rules
    const newItem = {
      ...itemData,
      userId: userId,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    const docRef = await inventoryCollection.add(newItem);
    logInfo(`Inventory item created with ID: ${docRef.id}`);
    return { id: docRef.id, ...newItem };
  } catch (error) {
    logError(`Error creating inventory item for user ${userId}:`, error);
    throw new AppError('Failed to create inventory item.', 500, error.message);
  }
};

/**
 * Updates an existing inventory item for a given user.
 * @param {string} userId The ID of the user.
 * @param {string} itemId The ID of the inventory item to update.
 * @param {Object} updateData The data to update the inventory item with.
 * @returns {Promise<Object|null>} A promise that resolves with the updated inventory item data or null if not found.
 */
exports.updateInventoryItem = async (userId, itemId, updateData) => {
  try {
    logInfo(`Updating inventory item ${itemId} for user: ${userId}`);
    const itemRef = inventoryCollection.doc(itemId);
    const doc = await itemRef.get();

    if (!doc.exists || doc.data().userId !== userId) {
      logInfo(`Inventory item ${itemId} not found or does not belong to user ${userId}.`);
      return null;
    }

    // Prevent changing userId
    if (updateData.userId && updateData.userId !== userId) {
        logError(`Attempted to change userId for inventory item ${itemId} by user ${userId}.`);
        throw new AppError('Cannot change ownership of inventory item.', 403);
    }

    const updatedData = {
        ...updateData,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await itemRef.update(updatedData);
    logInfo(`Inventory item ${itemId} updated.`);
    // Fetch the updated document to return the latest data
    const updatedDoc = await itemRef.get();
    return { id: updatedDoc.id, ...updatedDoc.data() };

  } catch (error) {
    logError(`Error updating inventory item ${itemId} for user ${userId}:`, error);
     if (error instanceof AppError) throw error; // Re-throw known AppErrors
    throw new AppError('Failed to update inventory item.', 500, error.message);
  }
};

/**
 * Deletes an inventory item for a given user.
 * @param {string} userId The ID of the user.
 * @param {string} itemId The ID of the inventory item to delete.
 * @returns {Promise<void>} A promise that resolves when the item is deleted.
 */
exports.deleteInventoryItem = async (userId, itemId) => {
  try {
    logInfo(`Deleting inventory item ${itemId} for user: ${userId}`);
    const itemRef = inventoryCollection.doc(itemId);
    const doc = await itemRef.get();

    if (!doc.exists || doc.data().userId !== userId) {
      logInfo(`Inventory item ${itemId} not found or does not belong to user ${userId}.`);
      throw new AppError('Inventory item not found or unauthorized.', 404);
    }

    await itemRef.delete();
    logInfo(`Inventory item ${itemId} deleted.`);
  } catch (error) {
    logError(`Error deleting inventory item ${itemId} for user ${userId}:`, error);
     if (error instanceof AppError) throw error;
    throw new AppError('Failed to delete inventory item.', 500, error.message);
  }
};

/**
 * Updates the stock level of an inventory item and records a stock movement.
 * @param {string} userId The ID of the user.
 * @param {string} itemId The ID of the inventory item.
 * @param {number} quantityChange The amount to change the stock by (can be positive or negative).
 * @param {string} movementType The type of stock movement (e.g., 'purchase', 'sale', 'adjustment').
 * @returns {Promise<Object|null>} A promise that resolves with the updated inventory item data or null if not found.
 */
exports.updateStock = async (userId, itemId, quantityChange, movementType) => {
  const transaction = db.runTransaction(async (t) => {
    const itemRef = inventoryCollection.doc(itemId);
    const doc = await t.get(itemRef);

    if (!doc.exists || doc.data().userId !== userId) {
      logInfo(`Inventory item ${itemId} not found or does not belong to user ${userId} during stock update.`);
      throw new AppError('Inventory item not found or unauthorized.', 404);
    }

    const currentQuantity = doc.data().quantity || 0;
    const newQuantity = currentQuantity + quantityChange;

    // Update the inventory item's quantity
    t.update(itemRef, {
      quantity: newQuantity,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Create a stock movement record
    const newMovementRef = stockMovementsCollection.doc();
    t.set(newMovementRef, {
      userId: userId,
      itemId: itemId,
      quantity: quantityChange, // Record the change amount
      movementType: movementType,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    logInfo(`Stock updated for item ${itemId} by ${quantityChange}. New quantity: ${newQuantity}. Movement type: ${movementType}`);

    // Return the updated item data (optimistically or fetch after commit)
    // For simplicity, returning the new quantity here. A real app might refetch.
    return { id: doc.id, ...doc.data(), quantity: newQuantity };
  });

  try {
    return await transaction;
  } catch (error) {
    logError(`Error updating stock for item ${itemId} for user ${userId}:`, error);
     if (error instanceof AppError) throw error;
    throw new AppError('Failed to update stock.', 500, error.message);
  }
};

/**
 * Gets stock movement history for a given user.
 * @param {string} userId The ID of the user.
 * @param {Object} filters Optional filters for the query (e.g., itemId, movementType, date range).
 * @returns {Promise<Array<Object>>} A promise that resolves with an array of stock movement records.
 */
exports.getStockMovements = async (userId, filters = {}) => {
  try {
    logInfo(`Fetching stock movements for user: ${userId} with filters:`, filters);
    let query = stockMovementsCollection.where('userId', '==', userId);

    // Apply filters
    if (filters.itemId) {
      query = query.where('itemId', '==', filters.itemId);
    }
    if (filters.movementType) {
      query = query.where('movementType', '==', filters.movementType);
    }
    // Add date range filtering if needed

    query = query.orderBy('timestamp', 'desc'); // Order by timestamp

    const snapshot = await query.get();
    const movements = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    logInfo(`Found ${movements.length} stock movements for user: ${userId}`);
    return movements;
  } catch (error) {
    logError(`Error getting stock movements for user ${userId}:`, error);
    throw new AppError('Failed to fetch stock movements.', 500, error.message);
  }
};

/**
 * Creates a stock movement record.
 * Note: This might be redundant if stock movements are only created via updateStock.
 * Included for completeness based on prompt.
 * @param {string} userId The ID of the user.
 * @param {Object} movementData The data for the stock movement record.
 * @returns {Promise<Object>} A promise that resolves with the created stock movement data.
 */
exports.createStockMovement = async (userId, movementData) => {
   try {
    logInfo(`Creating stock movement record for user: ${userId}`);
    // Add validation for movementData here
    const newMovement = {
      ...movementData,
      userId: userId,
      timestamp: admin.firestore.FieldValue.serverTimestamp(), // Ensure server timestamp
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    const docRef = await stockMovementsCollection.add(newMovement);
    logInfo(`Stock movement record created with ID: ${docRef.id}`);
    return { id: docRef.id, ...newMovement };
  } catch (error) {
    logError(`Error creating stock movement record for user ${userId}:`, error);
    throw new AppError('Failed to create stock movement record.', 500, error.message);
  }
};


/**
 * Gets low stock alerts for a given user.
 * @param {string} userId The ID of the user.
 * @returns {Promise<Array<Object>>} A promise that resolves with an array of low stock alerts.
 */
exports.getLowStockAlerts = async (userId) => {
  try {
    logInfo(`Fetching low stock alerts for user: ${userId}`);
    // This requires defining what constitutes a "low stock alert" and how they are stored.
    // Assuming 'alerts' collection with a 'type' field or similar.
    // This is a placeholder implementation.
    const alertsCollection = db.collection('alerts'); // Assuming an 'alerts' collection
    const snapshot = await alertsCollection
        .where('userId', '==', userId)
        .where('type', '==', 'low_stock') // Assuming a 'type' field
        .where('isRead', '==', false) // Assuming an 'isRead' field
        .orderBy('createdAt', 'desc')
        .get();

    const alerts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    logInfo(`Found ${alerts.length} low stock alerts for user: ${userId}`);
    return alerts;
  } catch (error) {
    logError(`Error getting low stock alerts for user ${userId}:`, error);
    throw new AppError('Failed to fetch low stock alerts.', 500, error.message);
  }
};
