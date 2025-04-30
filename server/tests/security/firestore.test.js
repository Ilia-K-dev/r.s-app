const firebase = require('@firebase/testing');
const fs = require('fs');

/*
 * ============================================================
 *             Firestore Security Rules Tests
 * ============================================================
 *
 * These tests validate the Firestore security rules defined in
 * firestore.rules using the Firebase Emulator Suite.
 *
 * To run these tests:
 * 1. Make sure you have the Firebase CLI installed (`npm install -g firebase-tools`).
 * 2. Start the Firestore emulator: `firebase emulators:start --only firestore`
 * 3. Run the tests: `npm test` or `npm run test:firestore` (if configured in package.json)
 */

const projectId = 'receipt-scanner-test'; // Use a consistent test project ID
const rules = fs.readFileSync('firestore.rules', 'utf8');

/**
 * Creates a new authenticated context for testing Firestore rules.
 * @param {string} uid - The user ID.
 * @param {object} [auth] - Optional authentication claims.
 * @returns {firebase.firestore.Firestore} - An authenticated Firestore instance.
 */
const authedApp = (uid, auth) => {
  return firebase.initializeTestApp({ projectId, auth: { uid, ...auth } }).firestore();
};

/**
 * Creates a new unauthenticated context for testing Firestore rules.
 * @returns {firebase.firestore.Firestore} - An unauthenticated Firestore instance.
 */
const unauthedApp = () => {
  return firebase.initializeTestApp({ projectId }).firestore();
};

// Before running tests, load the security rules
beforeAll(async () => {
  await firebase.loadFirestoreRules({ projectId, rules });
});

// Before each test, clear the database
beforeEach(async () => {
  await firebase.clearFirestoreData({ projectId });
});

// After all tests, clean up Firebase apps
afterAll(async () => {
  await Promise.all(firebase.apps().map(app => app.delete()));
});

describe('Receipt Scanner Firestore Security Rules', () => {

  // Test data for a specific user
  const aliceId = 'user_alice';
  const bobId = 'user_bob';
  const aliceData = {
    userId: aliceId,
    // Add other relevant fields for different collections
    name: 'Alice\'s Item',
    category: 'Groceries',
    total: 100,
    date: new Date(),
    status: 'active',
    currentStock: 10,
    minStockLevel: 5,
    reorderPoint: 7,
    type: 'add',
    quantity: 5,
    previousStock: 5,
    newStock: 10,
    reason: 'purchase',
    level: 'warning',
    message: 'Low stock alert',
    period: 'month',
    amount: 500
  };

  // Helper function to get a document reference for a specific user and collection
  const getDocRef = (db, userId, collection, docId = 'test_doc') => {
    return db.collection(collection).doc(docId);
  };

  // Helper function to get a collection reference for a specific user and collection
  const getCollectionRef = (db, userId, collection) => {
    return db.collection(collection).where('userId', '==', userId);
  };


  // ============================================================
  //                   Authentication Tests
  // ============================================================

  test('should deny read access to unauthenticated users for all collections', async () => {
    const db = unauthedApp();
    const collections = ['users', 'receipts', 'products', 'stockMovements', 'alerts', 'budgets', 'exports', 'categories', 'vendors', 'notifications', 'notificationPreferences']; // List all user-specific collections

    for (const collection of collections) {
      await firebase.assertFails(getCollectionRef(db, aliceId, collection).get());
      await firebase.assertFails(getDocRef(db, aliceId, collection).get());
    }
  });

  test('should deny write access to unauthenticated users for all collections', async () => {
    const db = unauthedApp();
    const collections = ['users', 'receipts', 'products', 'stockMovements', 'alerts', 'budgets', 'exports', 'categories', 'vendors', 'notifications', 'notificationPreferences']; // List all user-specific collections

    for (const collection of collections) {
      await firebase.assertFails(getDocRef(db, aliceId, collection).set(aliceData));
      await firebase.assertFails(getDocRef(db, aliceId, collection).update(aliceData));
      await firebase.assertFails(getDocRef(db, aliceId, collection).delete());
    }
  });

  // ============================================================
  //                   Data Ownership Tests
  // ============================================================

  test('should allow authenticated users to read their own data', async () => {
    const aliceDb = authedApp(aliceId);
    const bobDb = authedApp(bobId);

    // Set up data owned by Alice and Bob
    await firebase.assertSucceeds(getDocRef(authedApp(aliceId), aliceId, 'receipts', 'receipt_1').set({ ...aliceData, userId: aliceId }));
    await firebase.assertSucceeds(getDocRef(authedApp(bobId), bobId, 'receipts', 'receipt_2').set({ ...aliceData, userId: bobId }));

    // Alice should be able to read her own data
    await firebase.assertSucceeds(getDocRef(aliceDb, aliceId, 'receipts', 'receipt_1').get());
    await firebase.assertSucceeds(getCollectionRef(aliceDb, aliceId, 'receipts').get());

    // Alice should NOT be able to read Bob's data
    await firebase.assertFails(getDocRef(aliceDb, bobId, 'receipts', 'receipt_2').get());
    await firebase.assertFails(getCollectionRef(aliceDb, bobId, 'receipts').get());
  });

  test('should allow authenticated users to write their own data', async () => {
    const aliceDb = authedApp(aliceId);
    const bobDb = authedApp(bobId);

    // Alice should be able to create, update, and delete her own data
    await firebase.assertSucceeds(getDocRef(aliceDb, aliceId, 'products', 'product_1').set({ ...aliceData, userId: aliceId }));
    await firebase.assertSucceeds(getDocRef(aliceDb, aliceId, 'products', 'product_1').update({ name: 'Updated Item' }));
    await firebase.assertSucceeds(getDocRef(aliceDb, aliceId, 'products', 'product_1').delete());

    // Alice should NOT be able to create, update, or delete Bob's data
    await firebase.assertFails(getDocRef(aliceDb, bobId, 'products', 'product_2').set({ ...aliceData, userId: bobId }));
    await firebase.assertFails(getDocRef(aliceDb, bobId, 'products', 'product_2').update({ name: 'Updated Item' }));
    await firebase.assertFails(getDocRef(aliceDb, bobId, 'products', 'product_2').delete());
  });

  // Add more specific tests for each collection based on your firestore.rules
  // For example, test validation rules, immutable fields, server-only writes, etc.

  // Example: Test validation for 'products' collection
  test('should deny creating a product with missing required fields', async () => {
    const aliceDb = authedApp(aliceId);
    const invalidProductData = { userId: aliceId, category: 'Electronics', unitPrice: 50 }; // Missing 'name'
    await firebase.assertFails(getDocRef(aliceDb, aliceId, 'products', 'invalid_product').set(invalidProductData));
  });

  test('should deny updating a product with invalid data', async () => {
    const aliceDb = authedApp(aliceId);
    await firebase.assertSucceeds(getDocRef(authedApp(aliceId), aliceId, 'products', 'product_to_update').set({ ...aliceData, userId: aliceId }));
    const invalidUpdateData = { currentStock: -10 }; // Invalid stock level
    await firebase.assertFails(getDocRef(aliceDb, aliceId, 'products', 'product_to_update').update(invalidUpdateData));
  });

  // Example: Test immutable fields (if any) - e.g., userId should not be changeable
  test('should deny changing the userId of a document', async () => {
    const aliceDb = authedApp(aliceId);
    await firebase.assertSucceeds(getDocRef(authedApp(aliceId), aliceId, 'receipts', 'receipt_to_update').set({ ...aliceData, userId: aliceId }));
    await firebase.assertFails(getDocRef(aliceDb, aliceId, 'receipts', 'receipt_to_update').update({ userId: bobId }));
  });

  // Example: Test server-only writes (if any) - e.g., alerts might only be created by server
  // This requires setting up a test context that simulates a server write, which is more complex
  // For basic tests, ensure clients cannot write to server-only collections
  test('should deny client write access to server-only collections (e.g., alerts)', async () => {
    const aliceDb = authedApp(aliceId);
    await firebase.assertFails(getDocRef(aliceDb, aliceId, 'alerts', 'new_alert').set({ ...aliceData, userId: aliceId }));
  });

});
