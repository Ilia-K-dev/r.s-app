const firebase = require('@firebase/rules-unit-testing');
const fs = require('fs');
const path = require('path');

// Project ID for the emulator
const PROJECT_ID = 'project-reciept-reader-id'; // Replace with your Firebase project ID

// Path to your Firestore rules file (needed for test environment setup)
const rules = fs.readFileSync(path.resolve(__dirname, '../security/firestore.rules'), 'utf8');

describe('Firestore Index Verification', () => {
  let env;
  let db;

  // Before all tests, load the rules and create a test environment
  beforeAll(async () => {
    env = await firebase.initializeTestEnvironment({
      projectId: PROJECT_ID,
      firestore: { rules: rules },
    });
    db = env.authenticated({ uid: 'testUser' }).firestore(); // Use an authenticated context for queries
  });

  // After each test, clear the database
  afterEach(async () => {
    await env.clearFirestore();
  });

  // After all tests, clean up the test environment
  afterAll(async () => {
    await env.cleanup();
  });

  // Test Case: Verify index for receipts by userId and date
  test('should allow querying receipts by userId and date', async () => {
    const userId = 'testUser';
    const receiptsCollection = db.collection('users').doc(userId).collection('receipts');

    // Add some dummy data that requires the index
    await db.collection('users').doc(userId).collection('receipts').add({
      userId: userId,
      date: firebase.firestore.Timestamp.fromDate(new Date('2023-01-15')),
      merchant: 'Store A',
      total: 100,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
     await db.collection('users').doc(userId).collection('receipts').add({
      userId: userId,
      date: firebase.firestore.Timestamp.fromDate(new Date('2023-01-20')),
      merchant: 'Store B',
      total: 50,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    });


    // Perform a query that uses the index
    const query = receiptsCollection.where('userId', '==', userId).orderBy('date', 'desc');

    // Assert that the query succeeds (doesn't throw an error related to missing index)
    // Note: This test primarily verifies that the index *exists* and the query is *valid*.
    // It doesn't verify the correctness of the query results themselves.
    await firebase.assertSucceeds(query.get());
  });

  // Test Case: Verify index for receipts by userId, category, and date
   test('should allow querying receipts by userId, category, and date', async () => {
    const userId = 'testUser';
    const receiptsCollection = db.collection('users').doc(userId).collection('receipts');

    // Add some dummy data
    await db.collection('users').doc(userId).collection('receipts').add({
      userId: userId,
      category: 'Groceries',
      date: firebase.firestore.Timestamp.fromDate(new Date('2023-02-01')),
      merchant: 'Store C',
      total: 75,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    });

    // Perform a query that uses the index
    const query = receiptsCollection
      .where('userId', '==', userId)
      .where('category', '==', 'Groceries')
      .orderBy('date', 'desc');

    await firebase.assertSucceeds(query.get());
  });


  // Add more tests for other indexes defined in firestore.indexes.json
  // e.g., inventory by userId and quantity, stockMovements by userId and timestamp, etc.
});
