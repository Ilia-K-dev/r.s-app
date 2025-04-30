const firebase = require('@firebase/testing');
const fs = require('fs');

/*
 * ============================================================
 *             Firebase Storage Security Rules Tests
 * ============================================================
 *
 * These tests validate the Firebase Storage security rules defined in
 * storage.rules using the Firebase Emulator Suite.
 *
 * To run these tests:
 * 1. Make sure you have the Firebase CLI installed (`npm install -g firebase-tools`).
 * 2. Start the Storage emulator: `firebase emulators:start --only storage`
 * 3. Run the tests: `npm test` or `npm run test:storage` (if configured in package.json)
 */

const projectId = 'receipt-scanner-test'; // Use the same test project ID as Firestore tests
const rules = fs.readFileSync('storage.rules', 'utf8');

/**
 * Creates a new authenticated context for testing Storage rules.
 * @param {string} uid - The user ID.
 * @param {object} [auth] - Optional authentication claims.
 * @returns {firebase.storage.Storage} - An authenticated Storage instance.
 */
const authedApp = (uid, auth) => {
  return firebase.initializeTestApp({ projectId, auth: { uid, ...auth } }).storage();
};

/**
 * Creates a new unauthenticated context for testing Storage rules.
 * @returns {firebase.storage.Storage} - An unauthenticated Storage instance.
 */
const unauthedApp = () => {
  return firebase.initializeTestApp({ projectId }).storage();
};

// Before running tests, load the security rules
beforeAll(async () => {
  await firebase.loadStorageRules({ projectId, rules });
});

// Before each test, clear the storage data
beforeEach(async () => {
  // Note: Clearing Storage data via the emulator API is not directly supported
  // You might need to manually clear the emulator's storage directory between test runs
  // or rely on tests being independent. For this example, we assume independence.
});

// After all tests, clean up Firebase apps
afterAll(async () => {
  await Promise.all(firebase.apps().map(app => app.delete()));
});

describe('Receipt Scanner Storage Security Rules', () => {

  // Test data for a specific user
  const aliceId = 'user_alice';
  const bobId = 'user_bob';
  const testFile = Buffer.from('This is a test file.'); // Sample file content
  const largeFile = Buffer.alloc(2 * 1024 * 1024 + 1, 'a'); // File larger than 2MB (assuming a 2MB limit)

  // Helper function to get a Storage reference for a specific user and path
  const getFileRef = (storage, userId, filePath) => {
    return storage.ref(`${filePath}`);
  };


  // ============================================================
  //                   Authentication Tests
  // ============================================================

  test('should deny read access to unauthenticated users for user files', async () => {
    const unauthedStorage = unauthedApp();
    const filePath = `receipts/${aliceId}/test_receipt.jpg`;
    await firebase.assertFails(getFileRef(unauthedStorage, aliceId, filePath).getDownloadURL());
  });

  test('should deny write access to unauthenticated users for user files', async () => {
    const unauthedStorage = unauthedApp();
    const filePath = `receipts/${aliceId}/test_receipt.jpg`;
    await firebase.assertFails(getFileRef(unauthedStorage, aliceId, filePath).put(testFile));
  });

  // ============================================================
  //                   Data Ownership Tests
  // ============================================================

  test('should allow authenticated users to read their own files', async () => {
    const aliceStorage = authedApp(aliceId);
    const bobStorage = authedApp(bobId);
    const aliceFilePath = `receipts/${aliceId}/alice_receipt.jpg`;
    const bobFilePath = `receipts/${bobId}/bob_receipt.jpg`;

    // Upload files owned by Alice and Bob (assuming server write or initial setup)
    // In a real scenario, you might need a server context to write initial files for testing read access
    // For this test, we'll assume the files exist and test read permissions.
    // await firebase.assertSucceeds(getFileRef(authedApp(aliceId), aliceId, aliceFilePath).put(testFile));
    // await firebase.assertSucceeds(getFileRef(authedApp(bobId), bobId, bobFilePath).put(testFile));


    // Alice should be able to read her own file
    await firebase.assertSucceeds(getFileRef(aliceStorage, aliceId, aliceFilePath).getDownloadURL());

    // Alice should NOT be able to read Bob's file
    await firebase.assertFails(getFileRef(aliceStorage, bobId, bobFilePath).getDownloadURL());
  });

  test('should allow authenticated users to write their own files', async () => {
    const aliceStorage = authedApp(aliceId);
    const bobStorage = authedApp(bobId);
    const aliceFilePath = `receipts/${aliceId}/new_receipt.jpg`;
    const bobFilePath = `receipts/${bobId}/new_receipt.jpg`;

    // Alice should be able to write her own file
    await firebase.assertSucceeds(getFileRef(aliceStorage, aliceId, aliceFilePath).put(testFile));

    // Alice should NOT be able to write Bob's file
    await firebase.assertFails(getFileRef(aliceStorage, bobId, bobFilePath).put(testFile));
  });

  test('should allow authenticated users to delete their own files', async () => {
    const aliceStorage = authedApp(aliceId);
    const aliceFilePath = `receipts/${aliceId}/receipt_to_delete.jpg`;

    // Upload a file for Alice to delete
    await firebase.assertSucceeds(getFileRef(authedApp(aliceId), aliceId, aliceFilePath).put(testFile));

    // Alice should be able to delete her own file
    await firebase.assertSucceeds(getFileRef(aliceStorage, aliceId, aliceFilePath).delete());
  });

  test('should deny authenticated users from deleting other users\' files', async () => {
    const aliceStorage = authedApp(aliceId);
    const bobFilePath = `receipts/${bobId}/bob_receipt_to_delete.jpg`;

    // Upload a file for Bob (Alice should not be able to delete it)
    await firebase.assertSucceeds(getFileRef(authedApp(bobId), bobId, bobFilePath).put(testFile));

    // Alice should NOT be able to delete Bob's file
    await firebase.assertFails(getFileRef(aliceStorage, bobId, bobFilePath).delete());
  });


  // ============================================================
  //                   Validation Tests
  // ============================================================

  test('should deny uploading files larger than the allowed size', async () => {
    const aliceStorage = authedApp(aliceId);
    const filePath = `receipts/${aliceId}/large_file.jpg`; // Assuming .jpg is allowed type

    // This test assumes a size limit is defined in storage.rules (e.g., allow write: if request.resource.size < 2 * 1024 * 1024;)
    await firebase.assertFails(getFileRef(aliceStorage, aliceId, filePath).put(largeFile));
  });

  test('should deny uploading files with disallowed content types', async () => {
    const aliceStorage = authedApp(aliceId);
    const filePath = `receipts/${aliceId}/malicious_script.sh`; // Assuming .sh is disallowed

    // This test assumes content type restrictions are defined (e.g., allow write: if request.resource.contentType.matches('image/.*');)
    await firebase.assertFails(getFileRef(aliceStorage, aliceId, filePath).put(testFile, { contentType: 'application/x-sh' }));
  });

  // Add more specific tests for different paths and validation rules as defined in storage.rules

});
