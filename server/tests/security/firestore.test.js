// File: server/tests/security/firestore.test.js
// Date: 2025-05-18
// Description: Comprehensive Firestore security rules tests verifying user authorization, data validation, collection-specific rules, and cross-collection validations, using withSecurityRulesDisabled for data setup.
// Reasoning: Ensures all Firestore security rules are thoroughly tested to protect user data and allow legitimate operations, with reliable data setup.

/**
 * Issues in Main Firestore Test File (server/tests/security/firestore.test.js)
 *
 * 1. Helper Functions:
 *    The file uses getAuthenticatedFirestore and getUnauthenticatedFirestore from
 *    ./helpers/auth.js, which aren't using the environment variable approach.
 *
 * 2. Test Data Creation:
 *    The file uses createTestUser, createTestReceipt, etc. from ./helpers/data.js,
 *    which aren't using withSecurityRulesDisabled for test data creation.
 *
 * 3. Test Execution:
 *    Test execution flow doesn't properly initialize testEnv:
 *    - beforeAll: setupTestEnv but doesn't store result properly
 *    - beforeEach: calls clearFirestore without testEnv
 *    - afterAll: calls cleanupTestEnv without testEnv
 *
 * 4. Timestamp Handling:
 *    The file uses a mix of approaches for timestamps, some of which aren't compatible.
 *
 * Fix approach would require:
 * - Rewriting ./helpers/auth.js with environment variable approach
 * - Rewriting ./helpers/data.js with withSecurityRulesDisabled
 * - Fixing test execution flow
 * - Standardizing timestamp handling
 *
 * This would be a significant refactoring effort, better handled incrementally.
 */

const {
  initializeTestEnvironment, // Import initializeTestEnvironment
  setupTestEnv, // Keep setupTestEnv for consistency, though initializeTestEnvironment is used directly
  cleanupTestEnv,
  clearFirestore,
  assertFails,
  assertSucceeds,
  PROJECT_ID
} = require('./helpers/setup');
const {
  getAuthenticatedFirestore,
  getUnauthenticatedFirestore
} = require('./helpers/auth');
const {
  generateValidUserData,
  generateInvalidUserData,
  generateValidReceiptData,
  generateInvalidReceiptData,
  generateValidCategoryData,
  generateInvalidCategoryData,
  generateValidInventoryData,
  generateInvalidInventoryData,
  generateValidProductData,
  generateInvalidProductData,
  generateValidStockMovementData,
  generateInvalidStockMovementData,
  generateValidAlertData,
  generateInvalidAlertData,
  generateValidVendorData,
  generateInvalidVendorData,
  generateValidDocumentData,
  generateInvalidDocumentData,
  generateValidNotificationData,
  generateInvalidNotificationData,
  generateValidNotificationPreferencesData,
  generateInvalidNotificationPreferencesData,
} = require('./helpers/data');

describe('Firestore Security Rules', () => {
  let testEnv; // Declare testEnv here
  let aliceId, bobId;
  let aliceDb, bobDb, unauthenticatedDb;

  beforeAll(async () => {
    testEnv = await initializeTestEnvironment({ // Initialize testEnv directly
      projectId: PROJECT_ID,
      firestore: {
        rules: require('fs').readFileSync('./firestore.rules', 'utf8'),
        host: 'localhost',
        port: 8081,
      },
      storage: {
        rules: require('fs').readFileSync('../../storage.rules', 'utf8'),
        host: 'localhost',
        port: 9199,
      },
      // Add other emulators if needed
    });

    aliceId = 'alice';
    bobId = 'bob';
    aliceDb = testEnv.authenticatedContext(aliceId).firestore(); // Get contexts directly from testEnv
    bobDb = testEnv.authenticatedContext(bobId).firestore();
    unauthenticatedDb = testEnv.unauthenticatedContext().firestore();

    // Create test users with rules disabled for setup
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const adminDb = context.firestore();
      await adminDb.collection('users').doc(aliceId).set({ userId: aliceId, email: `${aliceId}@example.com`, createdAt: new Date() });
      await adminDb.collection('users').doc(bobId).set({ userId: bobId, email: `${bobId}@example.com`, createdAt: new Date() });
    });
  });

  afterAll(async () => {
    await cleanupTestEnv(testEnv);
  });

  beforeEach(async () => {
    await clearFirestore(testEnv);
    // Re-create users after clearing Firestore, with rules disabled
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const adminDb = context.firestore();
      await adminDb.collection('users').doc(aliceId).set({ userId: aliceId, email: `${aliceId}@example.com`, createdAt: new Date() });
      await adminDb.collection('users').doc(bobId).set({ userId: bobId, email: `${bobId}@example.com`, createdAt: new Date() });
    });
  });

  // --- Users Collection Tests ---
  describe('Collection: users', () => {
    /**
     * Tests read access for the users collection.
     * Verifies that only the owner can read their own user document.
     */
    describe('Read', () => {
      it('unauthenticated users cannot read any user document', async () => {
        await assertFails(unauthenticatedDb.collection('users').get());
        await assertFails(unauthenticatedDb.collection('users').doc(aliceId).get());
      });

      it('authenticated users can read their own user document', async () => {
        await assertSucceeds(aliceDb.collection('users').doc(aliceId).get());
      });

      it('authenticated users cannot read other users documents', async () => {
        await assertFails(aliceDb.collection('users').doc(bobId).get());
      });
    });

    /**
     * Tests create access for the users collection.
     * Verifies that users can only create their own user document with valid data.
     */
    describe('Create', () => {
      it('authenticated users can create their own user document with valid data', async () => {
        const newUserId = 'new-user';
        const newUserDb = testEnv.authenticatedContext(newUserId).firestore(); // Get context directly
        const validData = generateValidUserData(newUserId);
        await assertSucceeds(newUserDb.collection('users').doc(newUserId).set(validData));
      });

      it('authenticated users cannot create a user document for another user', async () => {
        const validData = generateValidUserData(bobId);
        await assertFails(aliceDb.collection('users').doc(bobId).set(validData));
      });

      it('authenticated users cannot create their own user document with invalid data', async () => {
        const newUserId = 'new-user-invalid';
        const newUserDb = testEnv.authenticatedContext(newUserId).firestore(); // Get context directly
        const invalidData = generateInvalidUserData(newUserId, 'missingEmail');
        await assertFails(newUserDb.collection('users').doc(newUserId).set(invalidData));
      });

      it('unauthenticated users cannot create any user document', async () => {
        const validData = generateValidUserData('some-user');
        await assertFails(unauthenticatedDb.collection('users').doc('some-user').set(validData));
      });
    });

    /**
     * Tests update access for the users collection.
     * Verifies that users can only update their own user document.
     */
    describe('Update', () => {
      it('authenticated users can update their own user document', async () => {
        // Data setup with rules disabled
        await testEnv.withSecurityRulesDisabled(async (context) => {
          const adminDb = context.firestore();
          await adminDb.collection('users').doc(aliceId).set({ userId: aliceId, displayName: 'Alice Original', email: `${aliceId}@example.com`, createdAt: new Date() });
        });
        await assertSucceeds(aliceDb.collection('users').doc(aliceId).update({ displayName: 'Alice Updated' }));
      });

      it('authenticated users cannot update other users documents', async () => {
        // Data setup with rules disabled
        await testEnv.withSecurityRulesDisabled(async (context) => {
          const adminDb = context.firestore();
          await adminDb.collection('users').doc(bobId).set({ userId: bobId, displayName: 'Bob Original', email: `${bobId}@example.com`, createdAt: new Date() });
        });
        await assertFails(aliceDb.collection('users').doc(bobId).update({ displayName: 'Bob Hacked' }));
      });

      it('authenticated users cannot change their userId during update', async () => {
        // Data setup with rules disabled
        await testEnv.withSecurityRulesDisabled(async (context) => {
          const adminDb = context.firestore();
          await adminDb.collection('users').doc(aliceId).set({ userId: aliceId, email: `${aliceId}@example.com`, createdAt: new Date() });
        });
        await assertFails(aliceDb.collection('users').doc(aliceId).update({ userId: bobId }));
      });

      it('unauthenticated users cannot update any user document', async () => {
        // Data setup with rules disabled
        await testEnv.withSecurityRulesDisabled(async (context) => {
          const adminDb = context.firestore();
          await adminDb.collection('users').doc(aliceId).set({ userId: aliceId, email: `${aliceId}@example.com`, createdAt: new Date() });
        });
        await assertFails(unauthenticatedDb.collection('users').doc(aliceId).update({ displayName: 'Hacked' }));
      });
    });

    /**
     * Tests delete access for the users collection.
     * Verifies that users can only delete their own user document.
     */
    describe('Delete', () => {
      it('authenticated users can delete their own user document', async () => {
        // Need to create a user specifically for deletion test as beforeEach recreates
        const userToDeleteId = 'user-to-delete';
        // Data setup with rules disabled
        await testEnv.withSecurityRulesDisabled(async (context) => {
          const adminDb = context.firestore();
          await adminDb.collection('users').doc(userToDeleteId).set({ userId: userToDeleteId, email: `${userToDeleteId}@example.com`, createdAt: new Date() });
        });
        const userToDeleteDb = testEnv.authenticatedContext(userToDeleteId).firestore(); // Get context directly
        await assertSucceeds(userToDeleteDb.collection('users').doc(userToDeleteId).delete());
      });

      it('authenticated users cannot delete other users documents', async () => {
        // Data setup with rules disabled
        await testEnv.withSecurityRulesDisabled(async (context) => {
          const adminDb = context.firestore();
          await adminDb.collection('users').doc(bobId).set({ userId: bobId, email: `${bobId}@example.com`, createdAt: new Date() });
        });
        await assertFails(aliceDb.collection('users').doc(bobId).delete());
      });

      it('unauthenticated users cannot delete any user document', async () => {
        // Data setup with rules disabled
        await testEnv.withSecurityRulesDisabled(async (context) => {
          const adminDb = context.firestore();
          await adminDb.collection('users').doc(aliceId).set({ userId: aliceId, email: `${aliceId}@example.com`, createdAt: new Date() });
        });
        await assertFails(unauthenticatedDb.collection('users').doc(aliceId).delete());
      });
    });
  });

  // --- Receipts Collection Tests ---
  describe('Collection: receipts', () => {
    let aliceReceiptId, bobReceiptId;

    beforeEach(async () => {
      aliceReceiptId = 'alice-receipt-1';
      bobReceiptId = 'bob-receipt-1';
      // Data setup with rules disabled
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const adminDb = context.firestore();
        await adminDb.collection('receipts').doc(aliceReceiptId).set({ userId: aliceId, title: 'Alice Receipt', merchant: 'Store A', date: new Date(), total: 50.00, createdAt: new Date() });
        await adminDb.collection('receipts').doc(bobReceiptId).set({ userId: bobId, title: 'Bob Receipt', merchant: 'Store B', date: new Date(), total: 70.00, createdAt: new Date() });
      });
    });

    /**
     * Tests read access for the receipts collection.
     * Verifies that users can only read their own receipts.
     */
    describe('Read', () => {
      it('unauthenticated users cannot read any receipt', async () => {
        await assertFails(unauthenticatedDb.collection('receipts').get());
        await assertFails(unauthenticatedDb.collection('receipts').doc(aliceReceiptId).get());
      });

      it('authenticated users can read their own receipts', async () => {
        await assertSucceeds(aliceDb.collection('receipts').doc(aliceReceiptId).get());
      });

      it('authenticated users cannot read other users receipts', async () => {
        await assertFails(aliceDb.collection('receipts').doc(bobReceiptId).get());
      });

      it('authenticated users can list their own receipts', async () => {
        // Listing requires a query constrained by userId
        await assertSucceeds(aliceDb.collection('receipts').where('userId', '==', aliceId).get());
      });

      it('authenticated users cannot list all receipts (unconstrained query)', async () => {
        await assertFails(aliceDb.collection('receipts').get());
      });
    });

    /**
     * Tests create access for the receipts collection.
     * Verifies that users can only create receipts with their own userId and valid data.
     */
    describe('Create', () => {
      it('authenticated users can create receipts with their own userId and valid data', async () => {
        const validData = generateValidReceiptData(aliceId);
        await assertSucceeds(aliceDb.collection('receipts').add(validData));
      });

      it('authenticated users cannot create receipts with another userId', async () => {
        const invalidData = generateInvalidReceiptData(aliceId, 'wrongOwner');
        await assertFails(aliceDb.collection('receipts').add(invalidData));
      });

      it('authenticated users cannot create receipts with invalid data (missing field)', async () => {
        const invalidData = generateInvalidReceiptData(aliceId, 'missingTitle');
        await assertFails(aliceDb.collection('receipts').add(invalidData));
      });

      it('authenticated users cannot create receipts with invalid data (invalid type)', async () => {
        const invalidData = generateInvalidReceiptData(aliceId, 'invalidTotal');
        await assertFails(aliceDb.collection('receipts').add(invalidData));
      });

      it('authenticated users cannot create receipts with invalid data (value constraint)', async () => {
        const invalidData = generateInvalidReceiptData(aliceId, 'totalTooLow');
        await assertFails(aliceDb.collection('receipts').add(invalidData));
      });

      it('unauthenticated users cannot create any receipt', async () => {
        const validData = generateValidReceiptData('some-user');
        await assertFails(unauthenticatedDb.collection('receipts').add(validData));
      });
    });

    /**
     * Tests update access for the receipts collection.
     * Verifies that users can only update their own receipts with valid data and cannot change userId.
     */
    describe('Update', () => {
      it('authenticated users can update their own receipts with valid data', async () => {
        // Data setup with rules disabled
        await testEnv.withSecurityRulesDisabled(async (context) => {
          const adminDb = context.firestore();
          await adminDb.collection('receipts').doc(aliceReceiptId).set({ userId: aliceId, title: 'Alice Receipt', merchant: 'Store A', date: new Date(), total: 50.00, createdAt: new Date() });
        });
        await assertSucceeds(aliceDb.collection('receipts').doc(aliceReceiptId).update({ total: 75.00 }));
      });

      it('authenticated users cannot update other users receipts', async () => {
        // Data setup with rules disabled
        await testEnv.withSecurityRulesDisabled(async (context) => {
          const adminDb = context.firestore();
          await adminDb.collection('receipts').doc(bobReceiptId).set({ userId: bobId, title: 'Bob Receipt', merchant: 'Store B', date: new Date(), total: 70.00, createdAt: new Date() });
        });
        await assertFails(aliceDb.collection('receipts').doc(bobReceiptId).update({ total: 75.00 }));
      });

      it('authenticated users cannot change the userId field during update', async () => {
        // Data setup with rules disabled
        await testEnv.withSecurityRulesDisabled(async (context) => {
          const adminDb = context.firestore();
          await adminDb.collection('receipts').doc(aliceReceiptId).set({ userId: aliceId, title: 'Alice Receipt', merchant: 'Store A', date: new Date(), total: 50.00, createdAt: new Date() });
        });
        await assertFails(aliceDb.collection('receipts').doc(aliceReceiptId).update({ userId: bobId }));
      });

      it('authenticated users cannot update their own receipts with invalid data', async () => {
        // Data setup with rules disabled
        await testEnv.withSecurityRulesDisabled(async (context) => {
          const adminDb = context.firestore();
          await adminDb.collection('receipts').doc(aliceReceiptId).set({ userId: aliceId, title: 'Alice Receipt', merchant: 'Store A', date: new Date(), total: 50.00, createdAt: new Date() });
        });
        const invalidData = generateInvalidReceiptData(aliceId, 'invalidTotal');
        await assertFails(aliceDb.collection('receipts').doc(aliceReceiptId).update(invalidData));
      });

      it('unauthenticated users cannot update any receipt', async () => {
        // Data setup with rules disabled
        await testEnv.withSecurityRulesDisabled(async (context) => {
          const adminDb = context.firestore();
          await adminDb.collection('receipts').doc(aliceReceiptId).set({ userId: aliceId, title: 'Alice Receipt', merchant: 'Store A', date: new Date(), total: 50.00, createdAt: new Date() });
        });
        await assertFails(unauthenticatedDb.collection('receipts').doc(aliceReceiptId).update({ total: 1000 }));
      });
    });

    /**
     * Tests delete access for the receipts collection.
     * Verifies that users can only delete their own receipts.
     */
    describe('Delete', () => {
      it('authenticated users can delete their own receipts', async () => {
        // Need to create a receipt specifically for deletion test as beforeEach recreates
        const receiptToDeleteId = 'receipt-to-delete';
        // Data setup with rules disabled
        await testEnv.withSecurityRulesDisabled(async (context) => {
          const adminDb = context.firestore();
          await adminDb.collection('receipts').doc(receiptToDeleteId).set({ userId: aliceId, title: 'Receipt to Delete', merchant: 'Store C', date: new Date(), total: 10.00, createdAt: new Date() });
        });
        await assertSucceeds(aliceDb.collection('receipts').doc(receiptToDeleteId).delete());
      });

      it('authenticated users cannot delete other users receipts', async () => {
        // Data setup with rules disabled
        await testEnv.withSecurityRulesDisabled(async (context) => {
          const adminDb = context.firestore();
          await adminDb.collection('receipts').doc(bobReceiptId).set({ userId: bobId, title: 'Bob Receipt', merchant: 'Store B', date: new Date(), total: 70.00, createdAt: new Date() });
        });
        await assertFails(aliceDb.collection('receipts').doc(bobReceiptId).delete());
      });

      it('unauthenticated users cannot delete any receipt', async () => {
        // Data setup with rules disabled
        await testEnv.withSecurityRulesDisabled(async (context) => {
          const adminDb = context.firestore();
          await adminDb.collection('receipts').doc(aliceReceiptId).set({ userId: aliceId, title: 'Alice Receipt', merchant: 'Store A', date: new Date(), total: 50.00, createdAt: new Date() });
        });
        await assertFails(unauthenticatedDb.collection('receipts').doc(aliceReceiptId).delete());
      });
    });
  });

  // --- Categories Collection Tests ---
  describe('Collection: categories', () => {
    let aliceCategoryId, bobCategoryId;

    beforeEach(async () => {
      aliceCategoryId = 'alice-category-1';
      bobCategoryId = 'bob-category-1';
      // Data setup with rules disabled
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const adminDb = context.firestore();
        await adminDb.collection('categories').doc(aliceCategoryId).set({ userId: aliceId, name: 'Alice Category', createdAt: new Date() });
        await adminDb.collection('categories').doc(bobCategoryId).set({ userId: bobId, name: 'Bob Category', createdAt: new Date() });
      });
    });

    /**
     * Tests read access for the categories collection.
     */
    describe('Read', () => {
      it('unauthenticated users cannot read any category', async () => {
        await assertFails(unauthenticatedDb.collection('categories').get());
        await assertFails(unauthenticatedDb.collection('categories').doc(aliceCategoryId).get());
      });

      it('authenticated users can read their own categories', async () => {
        await assertSucceeds(aliceDb.collection('categories').doc(aliceCategoryId).get());
      });

      it('authenticated users cannot read other users categories', async () => {
        await assertFails(aliceDb.collection('categories').doc(bobCategoryId).get());
      });

      it('authenticated users can list their own categories', async () => {
        await assertSucceeds(aliceDb.collection('categories').where('userId', '==', aliceId).get());
      });
    });

    /**
     * Tests create access for the categories collection.
     */
    describe('Create', () => {
      it('authenticated users can create categories with their own userId and valid data', async () => {
        const validData = generateValidCategoryData(aliceId);
        await assertSucceeds(aliceDb.collection('categories').add(validData));
      });

      it('authenticated users cannot create categories with another userId', async () => {
        const invalidData = generateInvalidCategoryData(aliceId, 'wrongOwner');
        await assertFails(aliceDb.collection('categories').add(invalidData));
      });

      it('authenticated users cannot create categories with invalid data', async () => {
        const invalidData = generateInvalidCategoryData(aliceId, 'missingName');
        await assertFails(aliceDb.collection('categories').add(invalidData));
      });
    });

    /**
     * Tests update access for the categories collection.
     */
    describe('Update', () => {
      it('authenticated users can update their own categories with valid data', async () => {
        // Data setup with rules disabled
        await testEnv.withSecurityRulesDisabled(async (context) => {
          const adminDb = context.firestore();
          await adminDb.collection('categories').doc(aliceCategoryId).set({ userId: aliceId, name: 'Alice Category', createdAt: new Date() });
        });
        await assertSucceeds(aliceDb.collection('categories').doc(aliceCategoryId).update({ name: 'Updated Category' }));
      });

      it('authenticated users cannot update other users categories', async () => {
        // Data setup with rules disabled
        await testEnv.withSecurityRulesDisabled(async (context) => {
          const adminDb = context.firestore();
          await adminDb.collection('categories').doc(bobCategoryId).set({ userId: bobId, name: 'Bob Category', createdAt: new Date() });
        });
        await assertFails(aliceDb.collection('categories').doc(bobCategoryId).update({ name: 'Hacked Category' }));
      });

      it('authenticated users cannot change the userId field during update', async () => {
        // Data setup with rules disabled
        await testEnv.withSecurityRulesDisabled(async (context) => {
          const adminDb = context.firestore();
          await adminDb.collection('categories').doc(aliceCategoryId).set({ userId: aliceId, name: 'Alice Category', createdAt: new Date() });
        });
        await assertFails(aliceDb.collection('categories').doc(aliceCategoryId).update({ userId: bobId }));
      });

      it('authenticated users cannot update their own categories with invalid data', async () => {
        // Data setup with rules disabled
        await testEnv.withSecurityRulesDisabled(async (context) => {
          const adminDb = context.firestore();
          await adminDb.collection('categories').doc(aliceCategoryId).set({ userId: aliceId, name: 'Alice Category', createdAt: new Date() });
        });
        const invalidData = generateInvalidCategoryData(aliceId, 'invalidColor');
        await assertFails(aliceDb.collection('categories').doc(aliceCategoryId).update(invalidData));
      });
    });

    /**
     * Tests delete access for the categories collection.
     */
    describe('Delete', () => {
      it('authenticated users can delete their own categories', async () => {
        const categoryToDeleteId = 'category-to-delete';
        // Data setup with rules disabled
        await testEnv.withSecurityRulesDisabled(async (context) => {
          const adminDb = context.firestore();
          await adminDb.collection('categories').doc(categoryToDeleteId).set({ userId: aliceId, name: 'Category to Delete', createdAt: new Date() });
        });
        await assertSucceeds(aliceDb.collection('categories').doc(categoryToDeleteId).delete());
      });

      it('authenticated users cannot delete other users categories', async () => {
        // Data setup with rules disabled
        await testEnv.withSecurityRulesDisabled(async (context) => {
          const adminDb = context.firestore();
          await adminDb.collection('categories').doc(bobCategoryId).set({ userId: bobId, name: 'Bob Category', createdAt: new Date() });
        });
        await assertFails(aliceDb.collection('categories').doc(bobCategoryId).delete());
      });
    });
  });

  // --- Products Collection Tests ---
  describe('Collection: products', () => {
    let aliceProductId, bobProductId;

    beforeEach(async () => {
      aliceProductId = 'alice-product-1';
      bobProductId = 'bob-product-1';
      // Data setup with rules disabled
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const adminDb = context.firestore();
        await adminDb.collection('products').doc(aliceProductId).set({ userId: aliceId, name: 'Alice Product', unitPrice: 10.00, createdAt: new Date() });
        await adminDb.collection('products').doc(bobProductId).set({ userId: bobId, name: 'Bob Product', unitPrice: 20.00, createdAt: new Date() });
      });
    });

    /**
     * Tests read access for the products collection.
     */
    describe('Read', () => {
      it('unauthenticated users cannot read any product', async () => {
        await assertFails(unauthenticatedDb.collection('products').get());
        await assertFails(unauthenticatedDb.collection('products').doc(aliceProductId).get());
      });

      it('authenticated users can read their own products', async () => {
        await assertSucceeds(aliceDb.collection('products').doc(aliceProductId).get());
      });

      it('authenticated users cannot read other users products', async () => {
        await assertFails(aliceDb.collection('products').doc(bobProductId).get());
      });

      it('authenticated users can list their own products', async () => {
        await assertSucceeds(aliceDb.collection('products').where('userId', '==', aliceId).get());
      });
    });

    /**
     * Tests create access for the products collection.
     */
    describe('Create', () => {
      it('authenticated users can create products with their own userId and valid data', async () => {
        const validData = generateValidProductData(aliceId);
        await assertSucceeds(aliceDb.collection('products').add(validData));
      });

      it('authenticated users cannot create products with another userId', async () => {
        const invalidData = generateInvalidProductData(aliceId, 'wrongOwner');
        await assertFails(aliceDb.collection('products').add(invalidData));
      });

      it('authenticated users cannot create products with invalid data', async () => {
        const invalidData = generateInvalidProductData(aliceId, 'missingName');
        await assertFails(aliceDb.collection('products').add(invalidData));
      });
    });

    /**
     * Tests update access for the products collection.
     */
    describe('Update', () => {
      it('authenticated users can update their own products with valid data', async () => {
        // Data setup with rules disabled
        await testEnv.withSecurityRulesDisabled(async (context) => {
          const adminDb = context.firestore();
          await adminDb.collection('products').doc(aliceProductId).set({ userId: aliceId, name: 'Alice Product', unitPrice: 10.00, createdAt: new Date() });
        });
        await assertSucceeds(aliceDb.collection('products').doc(aliceProductId).update({ unitPrice: 25.00 }));
      });

      it('authenticated users cannot update other users products', async () => {
        // Data setup with rules disabled
        await testEnv.withSecurityRulesDisabled(async (context) => {
          const adminDb = context.firestore();
          await adminDb.collection('products').doc(bobProductId).set({ userId: bobId, name: 'Bob Product', unitPrice: 20.00, createdAt: new Date() });
        });
        await assertFails(aliceDb.collection('products').doc(bobProductId).update({ unitPrice: 25.00 }));
      });

      it('authenticated users cannot change the userId field during update', async () => {
        // Data setup with rules disabled
        await testEnv.withSecurityRulesDisabled(async (context) => {
          const adminDb = context.firestore();
          await adminDb.collection('products').doc(aliceProductId).set({ userId: aliceId, name: 'Alice Product', unitPrice: 10.00, createdAt: new Date() });
        });
        await assertFails(aliceDb.collection('products').doc(aliceProductId).update({ userId: bobId }));
      });

      it('authenticated users cannot update their own products with invalid data', async () => {
        // Data setup with rules disabled
        await testEnv.withSecurityRulesDisabled(async (context) => {
          const adminDb = context.firestore();
          await adminDb.collection('products').doc(aliceProductId).set({ userId: aliceId, name: 'Alice Product', unitPrice: 10.00, createdAt: new Date() });
        });
        const invalidData = generateInvalidProductData(aliceId, 'invalidUnitPrice');
        await assertFails(aliceDb.collection('products').doc(aliceProductId).update(invalidData));
      });
    });

    /**
     * Tests delete access for the products collection.
     */
    describe('Delete', () => {
      it('authenticated users can delete their own products', async () => {
        const productToDeleteId = 'product-to-delete';
        // Data setup with rules disabled
        await testEnv.withSecurityRulesDisabled(async (context) => {
          const adminDb = context.firestore();
          await adminDb.collection('products').doc(productToDeleteId).set({ userId: aliceId, name: 'Product to Delete', unitPrice: 5.00, createdAt: new Date() });
        });
        await assertSucceeds(aliceDb.collection('products').doc(productToDeleteId).delete());
      });

      it('authenticated users cannot delete other users products', async () => {
        // Data setup with rules disabled
        await testEnv.withSecurityRulesDisabled(async (context) => {
          const adminDb = context.firestore();
          await adminDb.collection('products').doc(bobProductId).set({ userId: bobId, name: 'Bob Product', unitPrice: 20.00, createdAt: new Date() });
        });
        await assertFails(aliceDb.collection('products').doc(bobProductId).delete());
      });
    });
  });

  // --- Inventory Collection Tests ---
  describe('Collection: inventory', () => {
    let aliceInventoryId, bobInventoryId, aliceProductId;

    beforeEach(async () => {
      aliceProductId = 'alice-product-for-inventory';
      // Data setup with rules disabled
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const adminDb = context.firestore();
        await adminDb.collection('products').doc(aliceProductId).set({ userId: aliceId, name: 'Alice Product for Inventory', unitPrice: 10.00, createdAt: new Date() }); // Create a product for cross-reference
        aliceInventoryId = 'alice-inventory-1';
        bobInventoryId = 'bob-inventory-1';
        await adminDb.collection('inventory').doc(aliceInventoryId).set({ userId: aliceId, name: 'Alice Inventory', productId: aliceProductId, quantity: 10, createdAt: new Date(), updatedAt: new Date() });
        await adminDb.collection('inventory').doc(bobInventoryId).set({ userId: bobId, name: 'Bob Inventory', productId: 'bob-product-id', quantity: 20, createdAt: new Date(), updatedAt: new Date() });
      });
    });

    /**
     * Tests read access for the inventory collection.
     */
    describe('Read', () => {
      it('unauthenticated users cannot read any inventory item', async () => {
        await assertFails(unauthenticatedDb.collection('inventory').get());
        await assertFails(unauthenticatedDb.collection('inventory').doc(aliceInventoryId).get());
      });

      it('authenticated users can read their own inventory items', async () => {
        await assertSucceeds(aliceDb.collection('inventory').doc(aliceInventoryId).get());
      });

      it('authenticated users cannot read other users inventory items', async () => {
        await assertFails(aliceDb.collection('inventory').doc(bobInventoryId).get());
      });

      it('authenticated users can list their own inventory items', async () => {
        await assertSucceeds(aliceDb.collection('inventory').where('userId', '==', aliceId).get());
      });
    });

    /**
     * Tests create access for the inventory collection.
     */
    describe('Create', () => {
      it('authenticated users can create inventory items with their own userId and valid data', async () => {
        const validData = generateValidInventoryData(aliceId, aliceProductId);
        await assertSucceeds(aliceDb.collection('inventory').add(validData));
      });

      it('authenticated users cannot create inventory items with another userId', async () => {
        const invalidData = generateInvalidInventoryData(aliceId, 'wrongOwner', aliceProductId);
        await assertFails(aliceDb.collection('inventory').add(invalidData));
      });

      it('authenticated users cannot create inventory items with invalid data', async () => {
        const invalidData = generateInvalidInventoryData(aliceId, 'missingName', aliceProductId);
        await assertFails(aliceDb.collection('inventory').add(invalidData));
      });
    });

    /**
     * Tests update access for the inventory collection.
     */
    describe('Update', () => {
      it('authenticated users can update their own inventory items with valid data', async () => {
        // Data setup with rules disabled
        await testEnv.withSecurityRulesDisabled(async (context) => {
          const adminDb = context.firestore();
          await adminDb.collection('inventory').doc(aliceInventoryId).set({ userId: aliceId, name: 'Alice Inventory', productId: aliceProductId, quantity: 10, createdAt: new Date(), updatedAt: new Date() });
        });
        await assertSucceeds(aliceDb.collection('inventory').doc(aliceInventoryId).update({ quantity: 15, updatedAt: new Date() }));
      });

      it('authenticated users cannot update other users inventory items', async () => {
        // Data setup with rules disabled
        await testEnv.withSecurityRulesDisabled(async (context) => {
          const adminDb = context.firestore();
          await adminDb.collection('inventory').doc(bobInventoryId).set({ userId: bobId, name: 'Bob Inventory', productId: 'bob-product-id', quantity: 20, createdAt: new Date(), updatedAt: new Date() });
        });
        await assertFails(aliceDb.collection('inventory').doc(bobInventoryId).update({ quantity: 15, updatedAt: new Date() }));
      });

      it('authenticated users cannot change the userId field during update', async () => {
        // Data setup with rules disabled
        await testEnv.withSecurityRulesDisabled(async (context) => {
          const adminDb = context.firestore();
          await adminDb.collection('inventory').doc(aliceInventoryId).set({ userId: aliceId, name: 'Alice Inventory', productId: aliceProductId, quantity: 10, createdAt: new Date(), updatedAt: new Date() });
        });
        await assertFails(aliceDb.collection('inventory').doc(aliceInventoryId).update({ userId: bobId, updatedAt: new Date() }));
      });

      it('authenticated users cannot update their own inventory items with invalid data', async () => {
        // Data setup with rules disabled
        await testEnv.withSecurityRulesDisabled(async (context) => {
          const adminDb = context.firestore();
          await adminDb.collection('inventory').doc(aliceInventoryId).set({ userId: aliceId, name: 'Alice Inventory', productId: aliceProductId, quantity: 10, createdAt: new Date(), updatedAt: new Date() });
        });
        const invalidData = generateInvalidInventoryData(aliceId, 'invalidQuantity', aliceProductId);
        await assertFails(aliceDb.collection('inventory').doc(aliceInventoryId).update({ ...invalidData, updatedAt: new Date() }));
      });

      it('authenticated users cannot set negative quantity unless allowNegativeStock is true', async () => {
        // Data setup with rules disabled
        await testEnv.withSecurityRulesDisabled(async (context) => {
          const adminDb = context.firestore();
          await adminDb.collection('inventory').doc(aliceInventoryId).set({ userId: aliceId, name: 'Alice Inventory', productId: aliceProductId, quantity: 10, createdAt: new Date(), updatedAt: new Date() });
        });
        await assertFails(aliceDb.collection('inventory').doc(aliceInventoryId).update({ quantity: -5, allowNegativeStock: false, updatedAt: new Date() }));
        await assertFails(aliceDb.collection('inventory').doc(aliceInventoryId).update({ quantity: -5, updatedAt: new Date() })); // allowNegativeStock defaults to false
      });

      it('authenticated users can set negative quantity if allowNegativeStock is true', async () => {
        // Data setup with rules disabled
        await testEnv.withSecurityRulesDisabled(async (context) => {
          const adminDb = context.firestore();
          await adminDb.collection('inventory').doc(aliceInventoryId).set({ userId: aliceId, name: 'Alice Inventory', productId: aliceProductId, quantity: 10, createdAt: new Date(), updatedAt: new Date() });
        });
        await assertSucceeds(aliceDb.collection('inventory').doc(aliceInventoryId).update({ quantity: -5, allowNegativeStock: true, updatedAt: new Date() }));
      });

      it('authenticated users cannot update without setting updatedAt to server time', async () => {
         // Data setup with rules disabled
        await testEnv.withSecurityRulesDisabled(async (context) => {
          const adminDb = context.firestore();
          await adminDb.collection('inventory').doc(aliceInventoryId).set({ userId: aliceId, name: 'Alice Inventory', productId: aliceProductId, quantity: 10, createdAt: new Date(), updatedAt: new Date() });
        });
         await assertFails(aliceDb.collection('inventory').doc(aliceInventoryId).update({ quantity: 20 })); // Missing updatedAt
         await assertFails(aliceDb.collection('inventory').doc(aliceInventoryId).update({ quantity: 20, updatedAt: 'not a timestamp' })); // Invalid updatedAt
      });
    });

    /**
     * Tests delete access for the inventory collection.
     */
    describe('Delete', () => {
      it('authenticated users can delete their own inventory items', async () => {
        const inventoryToDeleteId = 'inventory-to-delete';
        // Data setup with rules disabled
        await testEnv.withSecurityRulesDisabled(async (context) => {
          const adminDb = context.firestore();
          await adminDb.collection('inventory').doc(inventoryToDeleteId).set({ userId: aliceId, name: 'Inventory to Delete', productId: aliceProductId, quantity: 5, createdAt: new Date(), updatedAt: new Date() });
        });
        await assertSucceeds(aliceDb.collection('inventory').doc(inventoryToDeleteId).delete());
      });

      it('authenticated users cannot delete other users inventory items', async () => {
        // Data setup with rules disabled
        await testEnv.withSecurityRulesDisabled(async (context) => {
          const adminDb = context.firestore();
          await adminDb.collection('inventory').doc(bobInventoryId).set({ userId: bobId, name: 'Bob Inventory', productId: 'bob-product-id', quantity: 20, createdAt: new Date(), updatedAt: new Date() });
        });
        await assertFails(aliceDb.collection('inventory').doc(bobInventoryId).delete());
      });
    });
  });

  // --- StockMovements Collection Tests ---
  describe('Collection: stockMovements', () => {
    let aliceInventoryId, aliceStockMovementId;

    beforeEach(async () => {
      aliceInventoryId = 'alice-inventory-for-movement';
      // Data setup with rules disabled
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const adminDb = context.firestore();
        await adminDb.collection('inventory').doc(aliceInventoryId).set({ userId: aliceId, name: 'Alice Inventory for Movement', productId: 'product-id', quantity: 10, createdAt: new Date(), updatedAt: new Date() }); // Create inventory for cross-reference
        aliceStockMovementId = 'alice-movement-1';
      });
      // Stock movements are immutable after creation, so we only test create
    });

    /**
     * Tests create access for the stockMovements collection.
     */
    describe('Create', () => {
      it('authenticated users can create stock movements with their own userId and valid data referencing an owned inventory item', async () => {
        const validData = generateValidStockMovementData(aliceId, aliceInventoryId);
        await assertSucceeds(aliceDb.collection('stockMovements').add(validData));
      });

      it('authenticated users cannot create stock movements with another userId', async () => {
        const invalidData = generateInvalidStockMovementData(aliceId, 'wrongOwner', aliceInventoryId);
        await assertFails(aliceDb.collection('stockMovements').add(invalidData));
      });

      it('authenticated users cannot create stock movements with invalid data', async () => {
        const invalidData = generateInvalidStockMovementData(aliceId, 'missingItemId', aliceInventoryId);
        await assertFails(aliceDb.collection('stockMovements').add(invalidData));
      });

      it('authenticated users cannot create stock movements referencing a non-existent inventory item', async () => {
        const validData = generateValidStockMovementData(aliceId, 'non-existent-item');
        await assertFails(aliceDb.collection('stockMovements').add(validData));
      });

      it('authenticated users cannot create stock movements referencing an inventory item owned by another user', async () => {
        const bobInventoryId = 'bob-inventory-for-movement';
        // Data setup with rules disabled
        await testEnv.withSecurityRulesDisabled(async (context) => {
          const adminDb = context.firestore();
          await adminDb.collection('inventory').doc(bobInventoryId).set({ userId: bobId, name: 'Bob Inventory for Movement', productId: 'product-id', quantity: 20, createdAt: new Date(), updatedAt: new Date() });
        });
        const validData = generateValidStockMovementData(aliceId, bobInventoryId);
        await assertFails(aliceDb.collection('stockMovements').add(validData));
      });
    });

    /**
     * Tests read access for the stockMovements collection.
     */
    describe('Read', () => {
      it('unauthenticated users cannot read any stock movement', async () => {
        // Data setup with rules disabled
        await testEnv.withSecurityRulesDisabled(async (context) => {
          const adminDb = context.firestore();
          await adminDb.collection('stockMovements').doc(aliceStockMovementId).set({ userId: aliceId, itemId: aliceInventoryId, quantity: 1, movementType: 'adjustment', timestamp: new Date() });
        });
        await assertFails(unauthenticatedDb.collection('stockMovements').get());
        await assertFails(unauthenticatedDb.collection('stockMovements').doc(aliceStockMovementId).get());
      });

      it('authenticated users can read their own stock movements', async () => {
        // Data setup with rules disabled
        await testEnv.withSecurityRulesDisabled(async (context) => {
          const adminDb = context.firestore();
          await adminDb.collection('stockMovements').doc(aliceStockMovementId).set({ userId: aliceId, itemId: aliceInventoryId, quantity: 1, movementType: 'adjustment', timestamp: new Date() });
        });
        await assertSucceeds(aliceDb.collection('stockMovements').doc(aliceStockMovementId).get());
      });

      it('authenticated users cannot read other users stock movements', async () => {
        const bobStockMovementId = 'bob-movement-1';
        const bobInventoryId = 'bob-inventory-for-movement-read';
        // Data setup with rules disabled
        await testEnv.withSecurityRulesDisabled(async (context) => {
          const adminDb = context.firestore();
          await adminDb.collection('inventory').doc(bobInventoryId).set({ userId: bobId, name: 'Bob Inventory for Movement Read', productId: 'product-id', quantity: 20, createdAt: new Date(), updatedAt: new Date() });
          await adminDb.collection('stockMovements').doc(bobStockMovementId).set({ userId: bobId, itemId: bobInventoryId, quantity: 1, movementType: 'adjustment', timestamp: new Date() });
        });
        await assertFails(aliceDb.collection('stockMovements').doc(bobStockMovementId).get());
      });

      it('authenticated users can list their own stock movements', async () => {
        // Data setup with rules disabled
        await testEnv.withSecurityRulesDisabled(async (context) => {
          const adminDb = context.firestore();
          await adminDb.collection('stockMovements').doc(aliceStockMovementId).set({ userId: aliceId, itemId: aliceInventoryId, quantity: 1, movementType: 'adjustment', timestamp: new Date() });
        });
        await assertSucceeds(aliceDb.collection('stockMovements').where('userId', '==', aliceId).get());
      });
    });

    /**
     * Tests update access for the stockMovements collection (should be denied).
     */
    describe('Update', () => {
      it('authenticated users cannot update stock movements', async () => {
        // Data setup with rules disabled
        await testEnv.withSecurityRulesDisabled(async (context) => {
          const adminDb = context.firestore();
          await adminDb.collection('stockMovements').doc(aliceStockMovementId).set({ userId: aliceId, itemId: aliceInventoryId, quantity: 1, movementType: 'adjustment', timestamp: new Date() });
        });
        await assertFails(aliceDb.collection('stockMovements').doc(aliceStockMovementId).update({ quantity: 10 }));
      });
    });

    /**
     * Tests delete access for the stockMovements collection (should be denied).
     */
    describe('Delete', () => {
      it('authenticated users cannot delete stock movements', async () => {
        // Data setup with rules disabled
        await testEnv.withSecurityRulesDisabled(async (context) => {
          const adminDb = context.firestore();
          await adminDb.collection('stockMovements').doc(aliceStockMovementId).set({ userId: aliceId, itemId: aliceInventoryId, quantity: 1, movementType: 'adjustment', timestamp: new Date() });
        });
        await assertFails(aliceDb.collection('stockMovements').doc(aliceStockMovementId).delete());
      });
    });
  });

  // --- Alerts Collection Tests ---
  describe('Collection: alerts', () => {
    let aliceAlertId, bobAlertId;

    beforeEach(async () => {
      aliceAlertId = 'alice-alert-1';
      bobAlertId = 'bob-alert-1';
      // Data setup with rules disabled
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const adminDb = context.firestore();
        await adminDb.collection('alerts').doc(aliceAlertId).set({ userId: aliceId, itemId: 'alice-item-id', message: 'Alice Alert', isRead: false, createdAt: new Date() });
        await adminDb.collection('alerts').doc(bobAlertId).set({ userId: bobId, itemId: 'bob-item-id', message: 'Bob Alert', isRead: false, createdAt: new Date() });
      });
    });

    /**
     * Tests read access for the alerts collection.
     */
    describe('Read', () => {
      it('unauthenticated users cannot read any alert', async () => {
        await assertFails(unauthenticatedDb.collection('alerts').get());
        await assertFails(unauthenticatedDb.collection('alerts').doc(aliceAlertId).get());
      });

      it('authenticated users can read their own alerts', async () => {
        await assertSucceeds(aliceDb.collection('alerts').doc(aliceAlertId).get());
      });

      it('authenticated users cannot read other users alerts', async () => {
        await assertFails(aliceDb.collection('alerts').doc(bobAlertId).get());
      });

      it('authenticated users can list their own alerts', async () => {
        await assertSucceeds(aliceDb.collection('alerts').where('userId', '==', aliceId).get());
      });
    });

    /**
     * Tests create access for the alerts collection.
     * Note: Rules allow client creation, but typically alerts are server-generated.
     * We test based on the current rules.
     */
    describe('Create', () => {
      it('authenticated users can create alerts with their own userId and valid data', async () => {
        const validData = generateValidAlertData(aliceId, 'alice-item-id-new');
        await assertSucceeds(aliceDb.collection('alerts').add(validData));
      });

      it('authenticated users cannot create alerts with another userId', async () => {
        const invalidData = generateInvalidAlertData(aliceId, 'wrongOwner', 'alice-item-id-new');
        await assertFails(aliceDb.collection('alerts').add(invalidData));
      });

      it('authenticated users cannot create alerts with invalid data', async () => {
        const invalidData = generateInvalidAlertData(aliceId, 'missingMessage', 'alice-item-id-new');
        await assertFails(aliceDb.collection('alerts').add(invalidData));
      });
    });

    /**
     * Tests update access for the alerts collection.
     * Rules allow updating if the user is the owner and the data is valid.
     * Specifically testing updating `isRead`.
     */
    describe('Update', () => {
      it('authenticated users can update their own alerts (e.g., isRead status)', async () => {
        // Data setup with rules disabled
        await testEnv.withSecurityRulesDisabled(async (context) => {
          const adminDb = context.firestore();
          await adminDb.collection('alerts').doc(aliceAlertId).set({ userId: aliceId, itemId: 'alice-item-id', message: 'Alice Alert', isRead: false, createdAt: new Date() });
        });
        await assertSucceeds(aliceDb.collection('alerts').doc(aliceAlertId).update({ isRead: true }));
      });

      it('authenticated users cannot update other users alerts', async () => {
        // Data setup with rules disabled
        await testEnv.withSecurityRulesDisabled(async (context) => {
          const adminDb = context.firestore();
          await adminDb.collection('alerts').doc(bobAlertId).set({ userId: bobId, itemId: 'bob-item-id', message: 'Bob Alert', isRead: false, createdAt: new Date() });
        });
        await assertFails(aliceDb.collection('alerts').doc(bobAlertId).update({ isRead: true }));
      });

      it('authenticated users cannot change the userId field during update', async () => {
        // Data setup with rules disabled
        await testEnv.withSecurityRulesDisabled(async (context) => {
          const adminDb = context.firestore();
          await adminDb.collection('alerts').doc(aliceAlertId).set({ userId: aliceId, itemId: 'alice-item-id', message: 'Alice Alert', isRead: false, createdAt: new Date() });
        });
        await assertFails(aliceDb.collection('alerts').doc(aliceAlertId).update({ userId: bobId }));
      });

      it('authenticated users cannot update their own alerts with invalid data (e.g., invalid isRead type)', async () => {
        // Data setup with rules disabled
        await testEnv.withSecurityRulesDisabled(async (context) => {
          const adminDb = context.firestore();
          await adminDb.collection('alerts').doc(aliceAlertId).set({ userId: aliceId, itemId: 'alice-item-id', message: 'Alice Alert', isRead: false, createdAt: new Date() });
        });
        await assertFails(aliceDb.collection('alerts').doc(aliceAlertId).update({ isRead: 'not a boolean' }));
      });

      it('authenticated users cannot update fields other than isRead (based on rule)', async () => {
         // Data setup with rules disabled
        await testEnv.withSecurityRulesDisabled(async (context) => {
          const adminDb = context.firestore();
          await adminDb.collection('alerts').doc(aliceAlertId).set({ userId: aliceId, itemId: 'alice-item-id', message: 'Alice Alert', isRead: false, createdAt: new Date() });
        });
         // The rule `request.resource.data.isRead is bool` implies only `isRead` can be updated.
         // Test attempting to update another field.
         await assertFails(aliceDb.collection('alerts').doc(aliceAlertId).update({ message: 'Updated message' }));
      });
    });

    /**
     * Tests delete access for the alerts collection.
     */
    describe('Delete', () => {
      it('authenticated users can delete their own alerts', async () => {
        const alertToDeleteId = 'alert-to-delete';
        // Data setup with rules disabled
        await testEnv.withSecurityRulesDisabled(async (context) => {
          const adminDb = context.firestore();
          await adminDb.collection('alerts').doc(alertToDeleteId).set({ userId: aliceId, itemId: 'item-id', message: 'Alert to Delete', isRead: false, createdAt: new Date() });
        });
        await assertSucceeds(aliceDb.collection('alerts').doc(alertToDeleteId).delete());
      });

      it('authenticated users cannot delete other users alerts', async () => {
        // Data setup with rules disabled
        await testEnv.withSecurityRulesDisabled(async (context) => {
          const adminDb = context.firestore();
          await adminDb.collection('alerts').doc(bobAlertId).set({ userId: bobId, itemId: 'bob-item-id', message: 'Bob Alert', isRead: false, createdAt: new Date() });
        });
        await assertFails(aliceDb.collection('alerts').doc(bobAlertId).delete());
      });
    });
  });

  // --- Vendors Collection Tests ---
  describe('Collection: vendors', () => {
    let aliceVendorId, bobVendorId;

    beforeEach(async () => {
      aliceVendorId = 'alice-vendor-1';
      bobVendorId = 'bob-vendor-1';
      // Data setup with rules disabled
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const adminDb = context.firestore();
        await adminDb.collection('vendors').doc(aliceVendorId).set({ userId: aliceId, name: 'Alice Vendor', createdAt: new Date() });
        await adminDb.collection('vendors').doc(bobVendorId).set({ userId: bobId, name: 'Bob Vendor', createdAt: new Date() });
      });
    });

    /**
     * Tests read access for the vendors collection.
     */
    describe('Read', () => {
      it('unauthenticated users cannot read any vendor', async () => {
        await assertFails(unauthenticatedDb.collection('vendors').get());
        await assertFails(unauthenticatedDb.collection('vendors').doc(aliceVendorId).get());
      });

      it('authenticated users can read their own vendors', async () => {
        await assertSucceeds(aliceDb.collection('vendors').doc(aliceVendorId).get());
      });

      it('authenticated users cannot read other users vendors', async () => {
        await assertFails(aliceDb.collection('vendors').doc(bobVendorId).get());
      });

      it('authenticated users can list their own vendors', async () => {
        await assertSucceeds(aliceDb.collection('vendors').where('userId', '==', aliceId).get());
      });
    });

    /**
     * Tests create access for the vendors collection.
     */
    describe('Create', () => {
      it('authenticated users can create vendors with their own userId and valid data', async () => {
        const validData = generateValidVendorData(aliceId);
        await assertSucceeds(aliceDb.collection('vendors').add(validData));
      });

      it('authenticated users cannot create vendors with another userId', async () => {
        const invalidData = generateInvalidVendorData(aliceId, 'wrongOwner');
        await assertFails(aliceDb.collection('vendors').add(invalidData));
      });

      it('authenticated users cannot create vendors with invalid data', async () => {
        const invalidData = generateInvalidVendorData(aliceId, 'missingName');
        await assertFails(aliceDb.collection('vendors').add(invalidData));
      });
    });

    /**
     * Tests update access for the vendors collection.
     */
    describe('Update', () => {
      it('authenticated users can update their own vendors with valid data', async () => {
        // Data setup with rules disabled
        await testEnv.withSecurityRulesDisabled(async (context) => {
          const adminDb = context.firestore();
          await adminDb.collection('vendors').doc(aliceVendorId).set({ userId: aliceId, name: 'Alice Vendor', createdAt: new Date() });
        });
        await assertSucceeds(aliceDb.collection('vendors').doc(aliceVendorId).update({ contactEmail: 'alice@example.com' }));
      });

      it('authenticated users cannot update other users vendors', async () => {
        // Data setup with rules disabled
        await testEnv.withSecurityRulesDisabled(async (context) => {
          const adminDb = context.firestore();
          await adminDb.collection('vendors').doc(bobVendorId).set({ userId: bobId, name: 'Bob Vendor', createdAt: new Date() });
        });
        await assertFails(aliceDb.collection('vendors').doc(bobVendorId).update({ contactEmail: 'bob@example.com' }));
      });

      it('authenticated users cannot change the userId field during update', async () => {
        // Data setup with rules disabled
        await testEnv.withSecurityRulesDisabled(async (context) => {
          const adminDb = context.firestore();
          await adminDb.collection('vendors').doc(aliceVendorId).set({ userId: aliceId, name: 'Alice Vendor', createdAt: new Date() });
        });
        await assertFails(aliceDb.collection('vendors').doc(aliceVendorId).update({ userId: bobId }));
      });

      it('authenticated users cannot update their own vendors with invalid data', async () => {
        // Data setup with rules disabled
        await testEnv.withSecurityRulesDisabled(async (context) => {
          const adminDb = context.firestore();
          await adminDb.collection('vendors').doc(aliceVendorId).set({ userId: aliceId, name: 'Alice Vendor', createdAt: new Date() });
        });
        const invalidData = generateInvalidVendorData(aliceId, 'invalidPhone');
        await assertFails(aliceDb.collection('vendors').doc(aliceVendorId).update(invalidData));
      });
    });

    /**
     * Tests delete access for the vendors collection.
     */
    describe('Delete', () => {
      it('authenticated users can delete their own vendors', async () => {
        const vendorToDeleteId = 'vendor-to-delete';
        // Data setup with rules disabled
        await testEnv.withSecurityRulesDisabled(async (context) => {
          const adminDb = context.firestore();
          await adminDb.collection('vendors').doc(vendorToDeleteId).set({ userId: aliceId, name: 'Vendor to Delete', createdAt: new Date() });
        });
        await assertSucceeds(aliceDb.collection('vendors').doc(vendorToDeleteId).delete());
      });

      it('authenticated users cannot delete other users vendors', async () => {
        // Data setup with rules disabled
        await testEnv.withSecurityRulesDisabled(async (context) => {
          const adminDb = context.firestore();
          await adminDb.collection('vendors').doc(bobVendorId).set({ userId: bobId, name: 'Bob Vendor', createdAt: new Date() });
        });
        await assertFails(aliceDb.collection('vendors').doc(bobVendorId).delete());
      });
    });
  });

  // --- Documents Collection Tests ---
  describe('Collection: documents', () => {
    let aliceDocumentId, bobDocumentId;

    beforeEach(async () => {
      aliceDocumentId = 'alice-document-1';
      bobDocumentId = 'bob-document-1';
      // Data setup with rules disabled
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const adminDb = context.firestore();
        await adminDb.collection('documents').doc(aliceDocumentId).set({ userId: aliceId, fileName: 'alice-doc.pdf', imageUrl: 'gs://bucket/alice.jpg', gcsUri: 'gs://bucket/alice.pdf', classification: { type: 'receipt' }, createdAt: new Date() });
        await adminDb.collection('documents').doc(bobDocumentId).set({ userId: bobId, fileName: 'bob-doc.pdf', imageUrl: 'gs://bucket/bob.jpg', gcsUri: 'gs://bucket/bob.pdf', classification: { type: 'receipt' }, createdAt: new Date() });
      });
    });

    /**
     * Tests read access for the documents collection.
     */
    describe('Read', () => {
      it('unauthenticated users cannot read any document', async () => {
        await assertFails(unauthenticatedDb.collection('documents').get());
        await assertFails(unauthenticatedDb.collection('documents').doc(aliceDocumentId).get());
      });

      it('authenticated users can read their own documents', async () => {
        await assertSucceeds(aliceDb.collection('documents').doc(aliceDocumentId).get());
      });

      it('authenticated users cannot read other users documents', async () => {
        await assertFails(aliceDb.collection('documents').doc(bobDocumentId).get());
      });

      it('authenticated users can list their own documents', async () => {
        await assertSucceeds(aliceDb.collection('documents').where('userId', '==', aliceId).get());
      });
    });

    /**
     * Tests create access for the documents collection.
     */
    describe('Create', () => {
      it('authenticated users can create documents with their own userId and valid data', async () => {
        const validData = generateValidDocumentData(aliceId);
        await assertSucceeds(aliceDb.collection('documents').add(validData));
      });

      it('authenticated users cannot create documents with another userId', async () => {
        const invalidData = generateInvalidDocumentData(aliceId, 'wrongOwner');
        await assertFails(aliceDb.collection('documents').add(invalidData));
      });

      it('authenticated users cannot create documents with invalid data', async () => {
        const invalidData = generateInvalidDocumentData(aliceId, 'missingFileName');
        await assertFails(aliceDb.collection('documents').add(invalidData));
      });

      it('authenticated users cannot create documents with empty fileName', async () => {
        const invalidData = generateInvalidDocumentData(aliceId, 'emptyFileName');
        await assertFails(aliceDb.collection('documents').add(invalidData));
      });

      it('authenticated users cannot create documents with fileName too long', async () => {
        const invalidData = generateInvalidDocumentData(aliceId, 'fileNameTooLong');
        await assertFails(aliceDb.collection('documents').add(invalidData));
      });
    });

    /**
     * Tests update access for the documents collection.
     */
    describe('Update', () => {
      it('authenticated users can update their own documents with valid data', async () => {
        // Data setup with rules disabled
        await testEnv.withSecurityRulesDisabled(async (context) => {
          const adminDb = context.firestore();
          await adminDb.collection('documents').doc(aliceDocumentId).set({ userId: aliceId, fileName: 'alice-doc.pdf', imageUrl: 'gs://bucket/alice.jpg', gcsUri: 'gs://bucket/alice.pdf', classification: { type: 'receipt' }, createdAt: new Date() });
        });
        await assertSucceeds(aliceDb.collection('documents').doc(aliceDocumentId).update({ classification: { type: 'invoice' } }));
      });

      it('authenticated users cannot update other users documents', async () => {
        // Data setup with rules disabled
        await testEnv.withSecurityRulesDisabled(async (context) => {
          const adminDb = context.firestore();
          await adminDb.collection('documents').doc(bobDocumentId).set({ userId: bobId, fileName: 'bob-doc.pdf', imageUrl: 'gs://bucket/bob.jpg', gcsUri: 'gs://bucket/bob.pdf', classification: { type: 'receipt' }, createdAt: new Date() });
        });
        await assertFails(aliceDb.collection('documents').doc(bobDocumentId).update({ classification: { type: 'invoice' } }));
      });

      it('authenticated users cannot change the userId field during update', async () => {
        // Data setup with rules disabled
        await testEnv.withSecurityRulesDisabled(async (context) => {
          const adminDb = context.firestore();
          await adminDb.collection('documents').doc(aliceDocumentId).set({ userId: aliceId, fileName: 'alice-doc.pdf', imageUrl: 'gs://bucket/alice.jpg', gcsUri: 'gs://bucket/alice.pdf', classification: { type: 'receipt' }, createdAt: new Date() });
        });
        await assertFails(aliceDb.collection('documents').doc(aliceDocumentId).update({ userId: bobId }));
      });

      it('authenticated users cannot update their own documents with invalid data', async () => {
        // Data setup with rules disabled
        await testEnv.withSecurityRulesDisabled(async (context) => {
          const adminDb = context.firestore();
          await adminDb.collection('documents').doc(aliceDocumentId).set({ userId: aliceId, fileName: 'alice-doc.pdf', imageUrl: 'gs://bucket/alice.jpg', gcsUri: 'gs://bucket/alice.pdf', classification: { type: 'receipt' }, createdAt: new Date() });
        });
        const invalidData = generateInvalidDocumentData(aliceId, 'invalidClassification');
        await assertFails(aliceDb.collection('documents').doc(aliceDocumentId).update(invalidData));
      });
    });

    /**
     * Tests delete access for the documents collection.
     */
    describe('Delete', () => {
      it('authenticated users can delete their own documents', async () => {
        const documentToDeleteId = 'document-to-delete';
        // Data setup with rules disabled
        await testEnv.withSecurityRulesDisabled(async (context) => {
          const adminDb = context.firestore();
          await adminDb.collection('documents').doc(documentToDeleteId).set({ userId: aliceId, fileName: 'doc-to-delete.pdf', imageUrl: 'gs://bucket/delete.jpg', gcsUri: 'gs://bucket/delete.pdf', classification: { type: 'receipt' }, createdAt: new Date() });
        });
        await assertSucceeds(aliceDb.collection('documents').doc(documentToDeleteId).delete());
      });

      it('authenticated users cannot delete other users documents', async () => {
        // Data setup with rules disabled
        await testEnv.withSecurityRulesDisabled(async (context) => {
          const adminDb = context.firestore();
          await adminDb.collection('documents').doc(bobDocumentId).set({ userId: bobId, fileName: 'bob-doc.pdf', imageUrl: 'gs://bucket/bob.jpg', gcsUri: 'gs://bucket/bob.pdf', classification: { type: 'receipt' }, createdAt: new Date() });
        });
        await assertFails(aliceDb.collection('documents').doc(bobDocumentId).delete());
      });
    });
  });

  // --- Notifications Collection Tests ---
  describe('Collection: notifications', () => {
    let aliceNotificationId, bobNotificationId;

    beforeEach(async () => {
      aliceNotificationId = 'alice-notification-1';
      bobNotificationId = 'bob-notification-1';
      // Data setup with rules disabled
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const adminDb = context.firestore();
        await adminDb.collection('notifications').doc(aliceNotificationId).set({ userId: aliceId, message: 'Alice Notification', isRead: false, createdAt: new Date() });
        await adminDb.collection('notifications').doc(bobNotificationId).set({ userId: bobId, message: 'Bob Notification', isRead: false, createdAt: new Date() });
      });
    });

    /**
     * Tests read access for the notifications collection.
     */
    describe('Read', () => {
      it('unauthenticated users cannot read any notification', async () => {
        await assertFails(unauthenticatedDb.collection('notifications').get());
        await assertFails(unauthenticatedDb.collection('notifications').doc(aliceNotificationId).get());
      });

      it('authenticated users can read their own notifications', async () => {
        await assertSucceeds(aliceDb.collection('notifications').doc(aliceNotificationId).get());
      });

      it('authenticated users cannot read other users notifications', async () => {
        await assertFails(aliceDb.collection('notifications').doc(bobNotificationId).get());
      });

      it('authenticated users can list their own notifications', async () => {
        await assertSucceeds(aliceDb.collection('notifications').where('userId', '==', aliceId).get());
      });
    });

    /**
     * Tests create access for the notifications collection (should be denied for clients).
     */
    describe('Create', () => {
      it('authenticated users cannot create notifications', async () => {
        const validData = generateValidNotificationData(aliceId);
        await assertFails(aliceDb.collection('notifications').add(validData));
      });
    });

    /**
     * Tests update access for the notifications collection.
     * Rules allow updating only the `isRead` field.
     */
    describe('Update', () => {
      it('authenticated users can update the isRead status of their own notifications', async () => {
        // Data setup with rules disabled
        await testEnv.withSecurityRulesDisabled(async (context) => {
          const adminDb = context.firestore();
          await adminDb.collection('notifications').doc(aliceNotificationId).set({ userId: aliceId, message: 'Alice Notification', isRead: false, createdAt: new Date() });
        });
        await assertSucceeds(aliceDb.collection('notifications').doc(aliceNotificationId).update({ isRead: true }));
      });

      it('authenticated users cannot update other fields of their own notifications', async () => {
        // Data setup with rules disabled
        await testEnv.withSecurityRulesDisabled(async (context) => {
          const adminDb = context.firestore();
          await adminDb.collection('notifications').doc(aliceNotificationId).set({ userId: aliceId, message: 'Alice Notification', isRead: false, createdAt: new Date() });
        });
        await assertFails(aliceDb.collection('notifications').doc(aliceNotificationId).update({ message: 'Updated message' }));
      });

      it('authenticated users cannot update other users notifications', async () => {
        // Data setup with rules disabled
        await testEnv.withSecurityRulesDisabled(async (context) => {
          const adminDb = context.firestore();
          await adminDb.collection('notifications').doc(bobNotificationId).set({ userId: bobId, message: 'Bob Notification', isRead: false, createdAt: new Date() });
        });
        await assertFails(aliceDb.collection('notifications').doc(bobNotificationId).update({ isRead: true }));
      });

      it('authenticated users cannot change the userId field during update', async () => {
        // Data setup with rules disabled
        await testEnv.withSecurityRulesDisabled(async (context) => {
          const adminDb = context.firestore();
          await adminDb.collection('notifications').doc(aliceNotificationId).set({ userId: aliceId, message: 'Alice Notification', isRead: false, createdAt: new Date() });
        });
        await assertFails(aliceDb.collection('notifications').doc(aliceNotificationId).update({ userId: bobId }));
      });

      it('authenticated users cannot update their own notifications with invalid data (e.g., invalid isRead type)', async () => {
        // Data setup with rules disabled
        await testEnv.withSecurityRulesDisabled(async (context) => {
          const adminDb = context.firestore();
          await adminDb.collection('notifications').doc(aliceNotificationId).set({ userId: aliceId, message: 'Alice Notification', isRead: false, createdAt: new Date() });
        });
        await assertFails(aliceDb.collection('notifications').doc(aliceNotificationId).update({ isRead: 'not a boolean' }));
      });
    });

    /**
     * Tests delete access for the notifications collection.
     */
    describe('Delete', () => {
      it('authenticated users can delete their own notifications', async () => {
        const notificationToDeleteId = 'notification-to-delete';
        // Data setup with rules disabled
        await testEnv.withSecurityRulesDisabled(async (context) => {
          const adminDb = context.firestore();
          await adminDb.collection('notifications').doc(notificationToDeleteId).set({ userId: aliceId, message: 'Notification to Delete', isRead: false, createdAt: new Date() });
        });
        await assertSucceeds(aliceDb.collection('notifications').doc(notificationToDeleteId).delete());
      });

      it('authenticated users cannot delete other users notifications', async () => {
        // Data setup with rules disabled
        await testEnv.withSecurityRulesDisabled(async (context) => {
          const adminDb = context.firestore();
          await adminDb.collection('notifications').doc(bobNotificationId).set({ userId: bobId, message: 'Bob Notification', isRead: false, createdAt: new Date() });
        });
        await assertFails(aliceDb.collection('notifications').doc(bobNotificationId).delete());
      });
    });
  });

  // --- NotificationPreferences Collection Tests ---
  describe('Collection: notificationPreferences', () => {
    let alicePrefsId, bobPrefsId;

    beforeEach(async () => {
      alicePrefsId = aliceId; // Assuming doc ID is userId
      bobPrefsId = bobId; // Assuming doc ID is userId
      // Data setup with rules disabled
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const adminDb = context.firestore();
        await adminDb.collection('notificationPreferences').doc(alicePrefsId).set({ userId: aliceId, preferences: { email: true, push: false }, createdAt: new Date() });
        await adminDb.collection('notificationPreferences').doc(bobPrefsId).set({ userId: bobId, preferences: { email: true, push: false }, createdAt: new Date() });
      });
    });

    /**
     * Tests read access for the notificationPreferences collection.
     */
    describe('Read', () => {
      it('unauthenticated users cannot read any notification preferences', async () => {
        await assertFails(unauthenticatedDb.collection('notificationPreferences').get());
        await assertFails(unauthenticatedDb.collection('notificationPreferences').doc(alicePrefsId).get());
      });

      it('authenticated users can read their own notification preferences', async () => {
        await assertSucceeds(aliceDb.collection('notificationPreferences').doc(alicePrefsId).get());
      });

      it('authenticated users cannot read other users notification preferences', async () => {
        await assertFails(aliceDb.collection('notificationPreferences').doc(bobPrefsId).get());
      });

      // Note: Listing might not be relevant if there's only one doc per user with ID = userId
    });

    /**
     * Tests create access for the notificationPreferences collection.
     */
    describe('Create', () => {
      it('authenticated users can create their own notification preferences document with valid data', async () => {
        const newUserId = 'new-prefs-user';
        const newUserDb = testEnv.authenticatedContext(newUserId).firestore(); // Get context directly
        const validData = generateValidNotificationPreferencesData(newUserId);
        await assertSucceeds(newUserDb.collection('notificationPreferences').doc(newUserId).set(validData));
      });

      it('authenticated users cannot create a notification preferences document for another user', async () => {
        const validData = generateValidNotificationPreferencesData(bobId);
        await assertFails(aliceDb.collection('notificationPreferences').doc(bobId).set(validData));
      });

      it('authenticated users cannot create their own notification preferences document with invalid data', async () => {
        const newUserId = 'new-prefs-user-invalid';
        const newUserDb = testEnv.authenticatedContext(newUserId).firestore(); // Get context directly
        const invalidData = generateInvalidNotificationPreferencesData(newUserId, 'invalidPreferences');
        await assertFails(newUserDb.collection('notificationPreferences').doc(newUserId).set(invalidData));
      });

      it('unauthenticated users cannot create any notification preferences document', async () => {
        const validData = generateValidNotificationPreferencesData('some-user');
        await assertFails(unauthenticatedDb.collection('notificationPreferences').doc('some-user').set(validData));
      });
    });

    /**
     * Tests update access for the notificationPreferences collection.
     */
    describe('Update', () => {
      it('authenticated users can update their own notification preferences with valid data', async () => {
        // Data setup with rules disabled
        await testEnv.withSecurityRulesDisabled(async (context) => {
          const adminDb = context.firestore();
          await adminDb.collection('notificationPreferences').doc(alicePrefsId).set({ userId: aliceId, preferences: { email: true, push: false }, createdAt: new Date() });
        });
        await assertSucceeds(aliceDb.collection('notificationPreferences').doc(alicePrefsId).update({ 'preferences.email': false }));
      });

      it('authenticated users cannot update other users notification preferences', async () => {
        // Data setup with rules disabled
        await testEnv.withSecurityRulesDisabled(async (context) => {
          const adminDb = context.firestore();
          await adminDb.collection('notificationPreferences').doc(bobPrefsId).set({ userId: bobId, preferences: { email: true, push: false }, createdAt: new Date() });
        });
        await assertFails(aliceDb.collection('notificationPreferences').doc(bobPrefsId).update({ 'preferences.email': false }));
      });

      it('authenticated users cannot change the userId field during update', async () => {
        // Data setup with rules disabled
        await testEnv.withSecurityRulesDisabled(async (context) => {
          const adminDb = context.firestore();
          await adminDb.collection('notificationPreferences').doc(alicePrefsId).set({ userId: aliceId, preferences: { email: true, push: false }, createdAt: new Date() });
        });
        await assertFails(aliceDb.collection('notificationPreferences').doc(alicePrefsId).update({ userId: bobId }));
      });

      it('authenticated users cannot update their own notification preferences with invalid data', async () => {
        // Data setup with rules disabled
        await testEnv.withSecurityRulesDisabled(async (context) => {
          const adminDb = context.firestore();
          await adminDb.collection('notificationPreferences').doc(alicePrefsId).set({ userId: aliceId, preferences: { email: true, push: false }, createdAt: new Date() });
        });
        const invalidData = generateInvalidNotificationPreferencesData(aliceId, 'invalidPreferences');
        await assertFails(aliceDb.collection('notificationPreferences').doc(alicePrefsId).update(invalidData));
      });
    });

    /**
     * Tests delete access for the notificationPreferences collection.
     */
    describe('Delete', () => {
      it('authenticated users can delete their own notification preferences', async () => {
        // Need to create a prefs doc specifically for deletion test as beforeEach recreates
        const prefsToDeleteId = 'prefs-to-delete';
        // Data setup with rules disabled
        await testEnv.withSecurityRulesDisabled(async (context) => {
          const adminDb = context.firestore();
          await adminDb.collection('notificationPreferences').doc(prefsToDeleteId).set({ userId: prefsToDeleteId, preferences: { email: true, push: false }, createdAt: new Date() });
        });
        const prefsToDeleteDb = testEnv.authenticatedContext(prefsToDeleteId).firestore(); // Get context directly
        await assertSucceeds(prefsToDeleteDb.collection('notificationPreferences').doc(prefsToDeleteId).delete());
      });

      it('authenticated users cannot delete other users notification preferences', async () => {
        // Data setup with rules disabled
        await testEnv.withSecurityRulesDisabled(async (context) => {
          const adminDb = context.firestore();
          await adminDb.collection('notificationPreferences').doc(bobPrefsId).set({ userId: bobId, preferences: { email: true, push: false }, createdAt: new Date() });
        });
        await assertFails(aliceDb.collection('notificationPreferences').doc(bobPrefsId).delete());
      });

      it('unauthenticated users cannot delete any notification preferences', async () => {
        // Data setup with rules disabled
        await testEnv.withSecurityRulesDisabled(async (context) => {
          const adminDb = context.firestore();
          await adminDb.collection('notificationPreferences').doc(alicePrefsId).set({ userId: aliceId, preferences: { email: true, push: false }, createdAt: new Date() });
        });
        await assertFails(unauthenticatedDb.collection('notificationPreferences').doc(alicePrefsId).delete());
      });
    });
  });

  // --- Helper Function Tests (Implicitly covered by collection tests, but can add explicit ones if needed) ---
  // Example: Test isValidString
  // describe('Helper Function: isValidString', () => {
  //   it('should return true for valid strings', () => {
  //     // This requires a different testing approach, possibly unit tests for rules functions
  //     // or specific rule test cases that isolate the function.
  //   });
  // });

});
