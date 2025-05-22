// Import Firebase mocks explicitly
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
} from '../../client/src/__mocks__/firebaseMocks'; // Import from mocks

import {
  getFirestore,
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
} from '../../client/src/__mocks__/firebaseMocks'; // Import from mocks


// Import the actual service being tested
import receiptsService from '../../client/src/features/receipts/services/receipts'; // Adjust path if necessary

// Get Firebase instances using the mocked functions
const auth = getAuth();
const db = getFirestore();


describe('Receipt Management Integration', () => {
  const testEmail = 'testuser@example.com';
  const testPassword = 'password123';
  let testUserId;

  // Assuming setup and teardown involve Firebase operations
  beforeAll(async () => {
    // Sign in to get authenticated user
    // Use the directly imported function
    const userCredential = await signInWithEmailAndPassword(auth, testEmail, testPassword);
    testUserId = userCredential.user.uid;
  });

  afterAll(async () => {
    // Clean up test data
    // Use directly imported Firestore functions
    const receiptsCollection = collection(db, 'receipts');
    const userReceiptsQuery = query(receiptsCollection, where('userId', '==', testUserId));
    const userReceiptsSnapshot = await getDocs(userReceiptsQuery);

    const deletePromises = userReceiptsSnapshot.docs.map(d => deleteDoc(doc(db, 'receipts', d.id)));
    await Promise.all(deletePromises);

    // Sign out
    await signOut(auth);
  });

  // Add your integration test cases here based on the original file's tests
  // Example test cases:

  it('should create, read, update, and delete a receipt', async () => {
    const initialReceiptData = {
      date: new Date(),
      store: 'Test Store',
      amount: 100,
      category: 'Groceries',
    };

    // Create receipt
    const createdReceipt = await receiptsService.createReceipt(testUserId, initialReceiptData, null);
    expect(createdReceipt).toHaveProperty('id');
    const receiptId = createdReceipt.id;

    // Read receipt
    const readReceipt = await receiptsService.getReceiptById(testUserId, receiptId);
    expect(readReceipt).toEqual(expect.objectContaining(initialReceiptData));
    expect(readReceipt.id).toBe(receiptId);

    // Update receipt
    const updateData = { amount: 150, category: 'Supplies' };
    await receiptsService.updateReceipt(testUserId, receiptId, updateData, null);
    const updatedReceipt = await receiptsService.getReceiptById(testUserId, receiptId);
    expect(updatedReceipt).toEqual(expect.objectContaining({ ...initialReceiptData, ...updateData }));
    expect(updatedReceipt.id).toBe(receiptId);

    // Delete receipt
    await receiptsService.deleteReceipt(testUserId, receiptId);
    const deletedReceipt = await receiptsService.getReceiptById(testUserId, receiptId);
    expect(deletedReceipt).toBeNull();
  });

  it('should list all receipts for the user', async () => {
    // Create multiple receipts
    const receipt1Data = { date: new Date('2023-01-01'), store: 'Store A', amount: 50 };
    const receipt2Data = { date: new Date('2023-01-02'), store: 'Store B', amount: 75 };
    await receiptsService.createReceipt(testUserId, receipt1Data, null);
    await receiptsService.createReceipt(testUserId, receipt2Data, null);

    // List receipts
    const result = await receiptsService.getReceipts(testUserId, {});
    expect(result.receipts.length).toBeGreaterThanOrEqual(2); // Should include the ones just created
    // Add more specific assertions about the listed receipts if needed
  });

  // Add other integration tests as needed
});
