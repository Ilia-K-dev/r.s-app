// Note: This needs to be run with the Firebase emulator
import { auth } from '../../src/core/config/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import {
  getReceipts,
  getReceiptById,
  createReceipt,
  updateReceipt,
  deleteReceipt
} from '../../src/features/receipts/services/receipts';

describe('Receipt Management Integration', () => {
  // Test user credentials - should match a user in the emulator
  const testEmail = 'test@example.com';
  const testPassword = 'password123';
  let testUserId;
  let createdReceiptId;

  // Setup - sign in before tests
  beforeAll(async () => {
    // Sign in to get authenticated user
    const userCredential = await signInWithEmailAndPassword(auth, testEmail, testPassword);
    testUserId = userCredential.user.uid;
  });

  it('should create, read, update, and delete a receipt', async () => {
    // 1. Create a new receipt
    const newReceipt = {
      userId: testUserId,
      merchant: 'Test Store',
      total: 42.99,
      date: new Date(),
      category: 'testing'
    };

    const createResult = await createReceipt(newReceipt);
    expect(createResult).toHaveProperty('id');
    createdReceiptId = createResult.id;

    // 2. Verify it can be retrieved by ID
    const retrievedReceipt = await getReceiptById(createdReceiptId);
    expect(retrievedReceipt.merchant).toBe('Test Store');
    expect(retrievedReceipt.total).toBe(42.99);

    // 3. Update the receipt
    const updateData = {
      merchant: 'Updated Store',
      total: 50.00
    };
    await updateReceipt(createdReceiptId, updateData);

    // 4. Verify the update
    const updatedReceipt = await getReceiptById(createdReceiptId);
    expect(updatedReceipt.merchant).toBe('Updated Store');
    expect(updatedReceipt.total).toBe(50.00);

    // 5. Delete the receipt
    await deleteReceipt(createdReceiptId);

    // 6. Verify deletion
    try {
      await getReceiptById(createdReceiptId);
      fail('Receipt should have been deleted');
    } catch (error) {
      expect(error.message).toContain('not found');
    }
  });

  it('should list all receipts for the user', async () => {
    // Create a few test receipts first
    const testReceipts = [
      { userId: testUserId, merchant: 'Store A', total: 10.00, date: new Date(), category: 'food' },
      { userId: testUserId, merchant: 'Store B', total: 20.00, date: new Date(), category: 'transport' }
    ];

    // Create each test receipt
    const createdIds = [];
    for (const receipt of testReceipts) {
      const result = await createReceipt(receipt);
      createdIds.push(result.id);
    }

    // Get all receipts
    const allReceipts = await getReceipts(testUserId);

    // Verify receipts exist
    expect(allReceipts.length).toBeGreaterThanOrEqual(testReceipts.length);

    // Cleanup - delete test receipts
    for (const id of createdIds) {
      await deleteReceipt(id);
    }
  });
});
