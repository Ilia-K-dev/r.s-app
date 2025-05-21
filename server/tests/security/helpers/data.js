// File: server/tests/security/helpers/data.js
// Date: 2025-05-17 04:59:08
// Description: Helper functions for creating test data in Firestore with rules disabled.
// Reasoning: Provides reusable functions to set up test data for various collections, simplifying test file content and ensuring data is created regardless of security rules.

const { setupTestEnv } = require('./setup');

/**
 * Create test user data in Firestore with rules disabled
 */
async function createTestUser(env, userId, userData = {}) {

  await env.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();

    await db.collection('users').doc(userId).set({
      userId: userId,
      email: userData.email || `${userId}@example.com`,
      createdAt: userData.createdAt || new Date(),
      ...userData
    });

    console.log(`Created test user: ${userId}`);
  });
}

/**
 * Generates valid user data matching the isValidUserDoc requirements
 * @param {string} userId - Owner user ID
 * @param {object} options - Optional overrides for default values
 * @returns {object} Valid user data
 */
function generateValidUserData(userId, options = {}) {
  return {
    userId: userId,
    email: options.email || `${userId}@example.com`,
    createdAt: options.createdAt || new Date(),
    ...options
  };
}

/**
 * Generates invalid user data violating isValidUserDoc requirements
 * @param {string} userId - Owner user ID
 * @param {string} violationType - Type of violation ('missingEmail', 'invalidEmail', 'missingCreatedAt', etc.)
 * @param {object} options - Optional overrides for default values
 * @returns {object} Invalid user data
 */
function generateInvalidUserData(userId, violationType, options = {}) {
  const baseData = generateValidUserData(userId, options);
  switch (violationType) {
    case 'missingEmail':
      delete baseData.email;
      break;
    case 'invalidEmail':
      baseData.email = 123; // Invalid type
      break;
    case 'missingCreatedAt':
      delete baseData.createdAt;
      break;
    // Add more violation types as needed based on isValidUserDoc
  }
  return baseData;
}


/**
 * Create test receipt data in Firestore with rules disabled
 */
async function createTestReceipt(env, userId, receiptId, receiptData = {}) {

  await env.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();

    await db.collection('receipts').doc(receiptId || `receipt-${Date.now()}`).set({
      userId: userId,
      title: receiptData.title || 'Test Receipt',
      merchant: receiptData.merchant || 'Test Store',
      date: receiptData.date || new Date(),
      total: receiptData.total || 100.00,
      createdAt: receiptData.createdAt || new Date(),
      ...receiptData
    });

    console.log(`Created test receipt for user: ${userId}`);
  });
}

/**
 * Generates valid receipt data matching the isValidReceipt requirements
 * @param {string} userId - Owner user ID
 * @param {object} options - Optional overrides for default values
 * @returns {object} Valid receipt data
 */
function generateValidReceiptData(userId, options = {}) {
  return {
    userId: userId,
    title: options.title || 'Valid Receipt Title',
    merchant: options.merchant || 'Valid Merchant Name',
    date: options.date || new Date(),
    total: options.total || 50.00,
    createdAt: options.createdAt || new Date(),
    ...options
  };
}

/**
 * Generates invalid receipt data violating isValidReceipt requirements
 * @param {string} userId - Owner user ID
 * @param {string} violationType - Type of violation ('missingTitle', 'invalidTotal', 'wrongOwner', etc.)
 * @param {object} options - Optional overrides for default values
 * @returns {object} Invalid receipt data
 */
function generateInvalidReceiptData(userId, violationType, options = {}) {
  const baseData = generateValidReceiptData(userId, options);
  switch (violationType) {
    case 'missingTitle':
      delete baseData.title;
      break;
    case 'invalidTotal':
      baseData.total = 'not a number';
      break;
    case 'wrongOwner':
      baseData.userId = 'anotherUserId';
      break;
    case 'invalidDate':
      baseData.date = 'not a date';
      break;
    case 'totalTooLow':
      baseData.total = 0;
      break;
    case 'titleTooLong':
      baseData.title = 'a'.repeat(201);
      break;
    // Add more violation types as needed based on isValidReceipt
  }
  return baseData;
}


/**
 * Create test category data in Firestore with rules disabled
 */
async function createTestCategory(env, userId, categoryId, categoryData = {}) {

  await env.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();

    await db.collection('categories').doc(categoryId || `category-${Date.now()}`).set({
      userId: userId,
      name: categoryData.name || 'Test Category',
      color: categoryData.color || '#FF0000',
      ...categoryData
    });

    console.log(`Created test category for user: ${userId}`);
  });
}

/**
 * Generates valid category data matching the isValidCategory requirements
 * @param {string} userId - Owner user ID
 * @param {object} options - Optional overrides for default values
 * @returns {object} Valid category data
 */
function generateValidCategoryData(userId, options = {}) {
  return {
    userId: userId,
    name: options.name || 'Valid Category Name',
    ...options
  };
}

/**
 * Generates invalid category data violating isValidCategory requirements
 * @param {string} userId - Owner user ID
 * @param {string} violationType - Type of violation ('missingName', 'invalidColor', etc.)
 * @param {object} options - Optional overrides for default values
 * @returns {object} Invalid category data
 */
function generateInvalidCategoryData(userId, violationType, options = {}) {
  const baseData = generateValidCategoryData(userId, options);
  switch (violationType) {
    case 'missingName':
      delete baseData.name;
      break;
    case 'invalidColor':
      baseData.color = 'not a color';
      break;
    case 'invalidBudget':
      baseData.budget = 'not a number';
      break;
    // Add more violation types as needed based on isValidCategory
  }
  return baseData;
}


/**
 * Create test inventory data in Firestore with rules disabled
 */
async function createTestInventory(env, userId, inventoryId, inventoryData = {}) {

  await env.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();

    await db.collection('inventory').doc(inventoryId || `inventory-${Date.now()}`).set({
      userId: userId,
      name: inventoryData.name || 'Test Inventory Item',
      category: inventoryData.category || 'Test Category',
      productId: inventoryData.productId || 'test-product-id',
      quantity: inventoryData.quantity || 10,
      ...inventoryData
    });

    console.log(`Created test inventory item for user: ${userId}`);
  });
}

/**
 * Generates valid inventory item data matching the isValidInventory requirements
 * @param {string} userId - Owner user ID
 * @param {string} productId - Associated product ID (must exist in Firestore)
 * @param {object} options - Optional overrides for default values
 * @returns {object} Valid inventory item data
 */
function generateValidInventoryData(userId, productId, options = {}) {
  return {
    userId: userId,
    name: options.name || 'Valid Inventory Item',
    category: options.category || 'Valid Category',
    productId: productId || 'valid-product-id',
    quantity: options.quantity || 10,
    ...options
  };
}

/**
 * Generates invalid inventory data violating isValidInventory requirements
 * @param {string} userId - Owner user ID
 * @param {string} violationType - Type of violation ('missingName', 'invalidQuantity', etc.)
 * @param {string} productId - Associated product ID
 * @param {object} options - Optional overrides for default values
 * @returns {object} Invalid inventory data
 */
function generateInvalidInventoryData(userId, violationType, productId, options = {}) {
  const baseData = generateValidInventoryData(userId, productId, options);
  switch (violationType) {
    case 'missingName':
      delete baseData.name;
      break;
    case 'invalidQuantity':
      baseData.quantity = 'not a number';
      break;
    case 'negativeQuantityWithoutFlag':
      baseData.quantity = -5;
      if (baseData.allowNegativeStock !== true) {
         baseData.allowNegativeStock = false; // Ensure flag is false or missing
      }
      break;
    case 'missingProductId':
      delete baseData.productId;
      break;
    // Add more violation types as needed based on isValidInventory
  }
  return baseData;
}


/**
 * Create test product data in Firestore with rules disabled
 */
async function createTestProduct(env, userId, productId, productData = {}) {

  await env.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();

    await db.collection('products').doc(productId || `product-${Date.now()}`).set({
      userId: userId,
      name: productData.name || 'Test Product',
      unitPrice: productData.unitPrice || 19.99,
      ...productData
    });

    console.log(`Created test product for user: ${userId}`);
  });
}

/**
 * Generates valid product data matching the isValidProduct requirements
 * @param {string} userId - Owner user ID
 * @param {object} options - Optional overrides for default values
 * @returns {object} Valid product data
 */
function generateValidProductData(userId, options = {}) {
  return {
    userId: userId,
    name: options.name || 'Valid Product Name',
    unitPrice: options.unitPrice || 10.00,
    ...options
  };
}

/**
 * Generates invalid product data violating isValidProduct requirements
 * @param {string} userId - Owner user ID
 * @param {string} violationType - Type of violation ('missingName', 'invalidUnitPrice', etc.)
 * @param {object} options - Optional overrides for default values
 * @returns {object} Invalid product data
 */
function generateInvalidProductData(userId, violationType, options = {}) {
  const baseData = generateValidProductData(userId, options);
  switch (violationType) {
    case 'missingName':
      delete baseData.name;
      break;
    case 'invalidUnitPrice':
      baseData.unitPrice = 'not a number';
      break;
    case 'unitPriceTooLow':
      baseData.unitPrice = -1;
      break;
    // Add more violation types as needed based on isValidProduct
  }
  return baseData;
}


/**
 * Create test stock movement data in Firestore with rules disabled
 */
async function createTestStockMovement(env, userId, stockMovementId, stockMovementData = {}) {

  await env.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();

    await db.collection('stockMovements').doc(stockMovementId || `stockMovement-${Date.now()}`).set({
      userId: userId,
      itemId: stockMovementData.itemId || 'test-item-id',
      quantity: stockMovementData.quantity || 1,
      movementType: stockMovementData.movementType || 'adjustment',
      timestamp: stockMovementData.timestamp || new Date(),
      ...stockMovementData
    });

    console.log(`Created test stock movement for user: ${userId}`);
  });
}

/**
 * Generates valid stock movement data matching the isValidStockMovement requirements
 * @param {string} userId - Owner user ID
 * @param {string} itemId - Associated inventory/product ID (must exist and be owned)
 * @param {object} options - Optional overrides for default values
 * @returns {object} Valid stock movement data
 */
function generateValidStockMovementData(userId, itemId, options = {}) {
  return {
    userId: userId,
    itemId: itemId || 'valid-item-id',
    quantity: options.quantity || 1,
    movementType: options.movementType || 'adjustment',
    timestamp: options.timestamp || new Date(),
    ...options
  };
}

/**
 * Generates invalid stock movement data violating isValidStockMovement requirements
 * @param {string} userId - Owner user ID
 * @param {string} violationType - Type of violation ('missingItemId', 'invalidQuantity', etc.)
 * @param {string} itemId - Associated inventory/product ID
 * @param {object} options - Optional overrides for default values
 * @returns {object} Invalid stock movement data
 */
function generateInvalidStockMovementData(userId, violationType, itemId, options = {}) {
  const baseData = generateValidStockMovementData(userId, itemId, options);
  switch (violationType) {
    case 'missingItemId':
      delete baseData.itemId;
      break;
    case 'invalidQuantity':
      baseData.quantity = 'not a number';
      break;
    case 'missingMovementType':
      delete baseData.movementType;
      break;
    case 'invalidTimestamp':
      baseData.timestamp = 'not a timestamp';
      break;
    // Add more violation types as needed based on isValidStockMovement
  }
  return baseData;
}


/**
 * Create test alert data in Firestore with rules disabled
 */
async function createTestAlert(env, userId, alertId, alertData = {}) {

  await env.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();

    await db.collection('alerts').doc(alertId || `alert-${Date.now()}`).set({
      userId: userId,
      itemId: alertData.itemId || 'test-item-id',
      message: alertData.message || 'Test Alert Message',
      isRead: alertData.isRead || false,
      createdAt: alertData.createdAt || new Date(),
      ...alertData
    });

    console.log(`Created test alert for user: ${userId}`);
  });
}

/**
 * Generates valid alert data matching the isValidAlert requirements
 * @param {string} userId - Owner user ID
 * @param {string} itemId - Associated inventory/product ID
 * @param {object} options - Optional overrides for default values
 * @returns {object} Valid alert data
 */
function generateValidAlertData(userId, itemId, options = {}) {
  return {
    userId: userId,
    itemId: itemId || 'valid-item-id',
    message: options.message || 'Valid alert message.',
    isRead: options.isRead || false,
    createdAt: options.createdAt || new Date(),
    ...options
  };
}

/**
 * Generates invalid alert data violating isValidAlert requirements
 * @param {string} userId - Owner user ID
 * @param {string} violationType - Type of violation ('missingItemId', 'invalidIsRead', etc.)
 * @param {string} itemId - Associated inventory/product ID
 * @param {object} options - Optional overrides for default values
 * @returns {object} Invalid alert data
 */
function generateInvalidAlertData(userId, violationType, itemId, options = {}) {
  const baseData = generateValidAlertData(userId, itemId, options);
  switch (violationType) {
    case 'missingItemId':
      delete baseData.itemId;
      break;
    case 'invalidIsRead':
      baseData.isRead = 'not a boolean';
      break;
    case 'missingMessage':
      delete baseData.message;
      break;
    case 'invalidCreatedAt':
      baseData.createdAt = 'not a timestamp';
      break;
    // Add more violation types as needed based on isValidAlert
  }
  return baseData;
}


/**
 * Create test vendor data in Firestore with rules disabled
 */
async function createTestVendor(env, userId, vendorId, vendorData = {}) {

  await env.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();

    await db.collection('vendors').doc(vendorId || `vendor-${Date.now()}`).set({
      userId: userId,
      name: vendorData.name || 'Test Vendor',
      ...vendorData
    });

    console.log(`Created test vendor for user: ${userId}`);
  });
}

/**
 * Generates valid vendor data matching the isValidVendor requirements
 * @param {string} userId - Owner user ID
 * @param {object} options - Optional overrides for default values
 * @returns {object} Valid vendor data
 */
function generateValidVendorData(userId, options = {}) {
  return {
    userId: userId,
    name: options.name || 'Valid Vendor Name',
    ...options
  };
}

/**
 * Generates invalid vendor data violating isValidVendor requirements
 * @param {string} userId - Owner user ID
 * @param {string} violationType - Type of violation ('missingName', 'invalidPhone', etc.)
 * @param {object} options - Optional overrides for default values
 * @returns {object} Invalid vendor data
 */
function generateInvalidVendorData(userId, violationType, options = {}) {
  const baseData = generateValidVendorData(userId, options);
  switch (violationType) {
    case 'missingName':
      delete baseData.name;
      break;
    case 'invalidPhone':
      baseData.phone = 12345; // Should be string
      break;
    case 'invalidContactEmail':
      baseData.contactEmail = 123; // Should be string
      break;
    // Add more violation types as needed based on isValidVendor
  }
  return baseData;
}


/**
 * Create test document data in Firestore with rules disabled
 */
async function createTestDocument(env, userId, documentId, documentData = {}) {

  await env.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();

    await db.collection('documents').doc(documentId || `document-${Date.now()}`).set({
      userId: userId,
      fileName: documentData.fileName || 'test-document.pdf',
      imageUrl: documentData.imageUrl || 'gs://test-bucket/test-image.jpg',
      gcsUri: documentData.gcsUri || 'gs://test-bucket/test-document.pdf',
      classification: documentData.classification || { type: 'other' },
      createdAt: documentData.createdAt || new Date(),
      ...documentData
    });

    console.log(`Created test document for user: ${userId}`);
  });
}

/**
 * Generates valid document data matching the isValidDocument requirements
 * @param {string} userId - Owner user ID
 * @param {object} options - Optional overrides for default values
 * @returns {object} Valid document data
 */
function generateValidDocumentData(userId, options = {}) {
  return {
    userId: userId,
    fileName: options.fileName || 'valid-document.pdf',
    imageUrl: options.imageUrl || 'gs://test-bucket/valid-image.jpg',
    gcsUri: options.gcsUri || 'gs://test-bucket/valid-document.pdf',
    classification: options.classification || { type: 'receipt' },
    createdAt: options.createdAt || new Date(),
    ...options
  };
}

/**
 * Generates invalid document data violating isValidDocument requirements
 * @param {string} userId - Owner user ID
 * @param {string} violationType - Type of violation ('missingFileName', 'invalidClassification', etc.)
 * @param {object} options - Optional overrides for default values
 * @returns {object} Invalid document data
 */
function generateInvalidDocumentData(userId, violationType, options = {}) {
  const baseData = generateValidDocumentData(userId, options);
  switch (violationType) {
    case 'missingFileName':
      delete baseData.fileName;
      break;
    case 'invalidClassification':
      baseData.classification = 'not a map';
      break;
    case 'missingImageUrl':
      delete baseData.imageUrl;
      break;
    case 'missingGcsUri':
      delete baseData.gcsUri;
      break;
    case 'invalidCreatedAt':
      baseData.createdAt = 'not a timestamp';
      break;
    case 'emptyFileName':
      baseData.fileName = '';
      break;
    case 'fileNameTooLong':
      baseData.fileName = 'a'.repeat(1025);
      break;
    // Add more violation types as needed based on isValidDocument
  }
  return baseData;
}


/**
 * Create test notification data in Firestore with rules disabled
 */
async function createTestNotification(env, userId, notificationId, notificationData = {}) {

  await env.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();

    await db.collection('notifications').doc(notificationId || `notification-${Date.now()}`).set({
      userId: userId,
      message: notificationData.message || 'Test Notification Message',
      isRead: notificationData.isRead || false,
      createdAt: notificationData.createdAt || new Date(),
      ...notificationData
    });

    console.log(`Created test notification for user: ${userId}`);
  });
}

/**
 * Generates valid notification data matching the isValidNotification requirements
 * @param {string} userId - Owner user ID
 * @param {object} options - Optional overrides for default values
 * @returns {object} Valid notification data
 */
function generateValidNotificationData(userId, options = {}) {
  return {
    userId: userId,
    message: options.message || 'Valid notification message.',
    isRead: options.isRead || false,
    createdAt: options.createdAt || new Date(),
    ...options
  };
}

/**
 * Generates invalid notification data violating isValidNotification requirements
 * @param {string} userId - Owner user ID
 * @param {string} violationType - Type of violation ('missingMessage', 'invalidIsRead', etc.)
 * @param {object} options - Optional overrides for default values
 * @returns {object} Invalid notification data
 */
function generateInvalidNotificationData(userId, violationType, options = {}) {
  const baseData = generateValidNotificationData(userId, options);
  switch (violationType) {
    case 'missingMessage':
      delete baseData.message;
      break;
    case 'invalidIsRead':
      baseData.isRead = 'not a boolean';
      break;
    case 'invalidCreatedAt':
      baseData.createdAt = 'not a timestamp';
      break;
    // Add more violation types as needed based on isValidNotification
  }
  return baseData;
}


/**
 * Create test notification preferences data in Firestore with rules disabled
 */
async function createTestNotificationPreferences(env, userId, prefsId, prefsData = {}) {

  await env.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();

    await db.collection('notificationPreferences').doc(prefsId || userId).set({ // Assuming doc ID is userId
      userId: userId,
      preferences: prefsData.preferences || {},
      ...prefsData
    });

    console.log(`Created test notification preferences for user: ${userId}`);
  });
}

/**
 * Generates valid notification preferences data matching the isValidNotificationPreferences requirements
 * @param {string} userId - Owner user ID
 * @param {object} options - Optional overrides for default values
 * @returns {object} Valid notification preferences data
 */
function generateValidNotificationPreferencesData(userId, options = {}) {
  return {
    userId: userId,
    preferences: options.preferences || { email: true, push: false },
    ...options
  };
}

/**
 * Generates invalid notification preferences data violating isValidNotificationPreferences requirements
 * @param {string} userId - Owner user ID
 * @param {string} violationType - Type of violation ('missingPreferences', 'invalidPreferences', etc.)
 * @param {object} options - Optional overrides for default values
 * @returns {object} Invalid notification preferences data
 */
function generateInvalidNotificationPreferencesData(userId, violationType, options = {}) {
  const baseData = generateValidNotificationPreferencesData(userId, options);
  switch (violationType) {
    case 'missingPreferences':
      delete baseData.preferences;
      break;
    case 'invalidPreferences':
      baseData.preferences = 'not a map';
      break;
    // Add more violation types as needed based on isValidNotificationPreferences
  }
  return baseData;
}


module.exports = {
  createTestUser,
  generateValidUserData,
  generateInvalidUserData,
  createTestReceipt,
  generateValidReceiptData,
  generateInvalidReceiptData,
  createTestCategory,
  generateValidCategoryData,
  generateInvalidCategoryData,
  createTestInventory,
  generateValidInventoryData,
  generateInvalidInventoryData,
  createTestProduct,
  generateValidProductData,
  generateInvalidProductData,
  createTestStockMovement,
  generateValidStockMovementData,
  generateInvalidStockMovementData,
  createTestAlert,
  generateValidAlertData,
  generateInvalidAlertData,
  createTestVendor,
  generateValidVendorData,
  generateInvalidVendorData,
  createTestDocument,
  generateValidDocumentData,
  generateInvalidDocumentData,
  createTestNotification,
  generateValidNotificationData,
  generateInvalidNotificationData,
  createTestNotificationPreferences,
  generateValidNotificationPreferencesData,
  generateInvalidNotificationPreferencesData,
};
