/**
 * Simplified Storage Security Rules Tests
 * Date: 2025-05-18
 *
 * A simplified test suite for verifying basic Storage security rules functionality.
 * Focuses on key storage paths and basic read/write/delete operations,
 * including size, type, and cross-service validation where applicable.
 */
const { setupTestEnv, cleanupTestEnv, PROJECT_ID } = require('./helpers/setup');
const { assertFails, assertSucceeds } = require('@firebase/rules-unit-testing');
const { doc, setDoc } = require('firebase/firestore');

let testEnv;

// Extend timeout to accommodate potential delays with emulator connections
jest.setTimeout(60000);

// Helper function to create a buffer of a specific size
const createBuffer = (sizeInBytes) => Buffer.alloc(sizeInBytes, 'x');

describe('Storage Security Rules', () => {
  beforeAll(async () => {
    console.log('Setting up simplified Storage test environment');
    testEnv = await setupTestEnv();

    // Create test users in Firestore for auth context, with rules disabled
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const adminDb = context.firestore();
      await adminDb.collection('users').doc('test-user-1').set({ userId: 'test-user-1', email: 'user1@example.com', createdAt: new Date() });
      await adminDb.collection('users').doc('test-user-2').set({ userId: 'test-user-2', email: 'user2@example.com', createdAt: new Date() });
    });

    console.log('Storage test environment initialized');
  });

  afterAll(async () => {
    await cleanupTestEnv(testEnv);
    console.log('Storage test environment cleaned up');
  });

  // Note: Clearing Storage data between tests is not directly supported by the emulator API,
  // so tests should use unique file paths or be designed to not rely on a clean state.

  // --- /profiles/{userId}/{fileName} Tests ---
  describe('Storage path: /profiles/{userId}/{fileName}', () => {
    const path = (userId, fileName) => `profiles/${userId}/${fileName}`;
    const validImage = createBuffer(10 * 1024); // 10KB (within 2MB limit)
    const oversizedImage = createBuffer(2 * 1024 * 1024 + 1); // 2MB + 1 byte
    const validMetadata = { contentType: 'image/jpeg' };
    const invalidMetadata = { contentType: 'text/plain' };

    /**
     * Tests read access for profile images.
     */
    describe('Read', () => {
      it('authenticated users can read their own profile images', async () => {
        const filePath = path('test-user-1', 'my-profile-read.jpg');
        // Upload file with rules disabled for setup
        await testEnv.withSecurityRulesDisabled(async (context) => {
          const adminStorage = context.storage();
          await adminStorage.ref(filePath).put(validImage, validMetadata);
        });
        // Test read with rules enabled
        const storage = testEnv.authenticatedContext('test-user-1').storage();
        await assertSucceeds(storage.ref(filePath).getDownloadURL());
      });

      it('authenticated users cannot read other users profile images', async () => {
        const filePath = path('test-user-2', 'bob-profile-read.jpg');
        // Upload file with rules disabled for setup
        await testEnv.withSecurityRulesDisabled(async (context) => {
          const adminStorage = context.storage();
          await adminStorage.ref(filePath).put(validImage, validMetadata);
        });
        // Test read with rules enabled
        const storage = testEnv.authenticatedContext('test-user-1').storage();
        await assertFails(storage.ref(filePath).getDownloadURL());
      });

      it('unauthenticated users cannot read any profile image', async () => {
        const filePath = path('test-user-1', 'my-profile-unauth-read.jpg');
        // Upload file with rules disabled for setup
        await testEnv.withSecurityRulesDisabled(async (context) => {
          const adminStorage = context.storage();
          await adminStorage.ref(filePath).put(validImage, validMetadata);
        });
        // Test read with rules enabled
        const storage = testEnv.unauthenticatedContext().storage();
        await assertFails(storage.ref(filePath).getDownloadURL());
      });
    });

    /**
     * Tests create/update access for profile images.
     */
    describe('Create/Update', () => {
      it('authenticated users can upload valid profile images to their own path', async () => {
        const storage = testEnv.authenticatedContext('test-user-1').storage();
        await assertSucceeds(storage.ref(path('test-user-1', 'my-profile.jpg')).put(validImage, validMetadata));
      });

      it('authenticated users cannot upload profile images to another user\'s path', async () => {
        const storage = testEnv.authenticatedContext('test-user-1').storage();
        await assertFails(storage.ref(path('test-user-2', 'my-profile.jpg')).put(validImage, validMetadata));
      });

      it('unauthenticated users cannot upload any profile image', async () => {
        const storage = testEnv.unauthenticatedContext().storage();
        await assertFails(storage.ref(path('test-user-1', 'unauthenticated.jpg')).put(validImage, validMetadata));
      });

      it('authenticated users cannot upload profile images exceeding the size limit', async () => {
        const storage = testEnv.authenticatedContext('test-user-1').storage();
        await assertFails(storage.ref(path('test-user-1', 'oversized-profile.jpg')).put(oversizedImage, validMetadata));
      });

      it('authenticated users cannot upload profile images with an invalid content type', async () => {
        const storage = testEnv.authenticatedContext('test-user-1').storage();
        await assertFails(storage.ref(path('test-user-1', 'invalid-type-profile.txt')).put(validImage, invalidMetadata));
      });
    });

    /**
     * Tests delete access for profile images.
     */
    describe('Delete', () => {
      it('authenticated users can delete their own profile images', async () => {
        const filePath = path('test-user-1', 'to-delete.jpg');
        // Upload file with rules disabled for setup
        await testEnv.withSecurityRulesDisabled(async (context) => {
          const adminStorage = context.storage();
          await adminStorage.ref(filePath).put(validImage, validMetadata);
        });
        // Test delete with rules enabled
        const storage = testEnv.authenticatedContext('test-user-1').storage();
        await assertSucceeds(storage.ref(filePath).delete());
      });

      it('authenticated users cannot delete other users profile images', async () => {
        const filePath = path('test-user-2', 'bob-to-delete.jpg');
        // Upload file with rules disabled for setup
        await testEnv.withSecurityRulesDisabled(async (context) => {
          const adminStorage = context.storage();
          await adminStorage.ref(filePath).put(validImage, validMetadata);
        });
        // Test delete with rules enabled
        const storage = testEnv.authenticatedContext('test-user-1').storage();
        await assertFails(storage.ref(filePath).delete());
      });

      it('unauthenticated users cannot delete any profile image', async () => {
        const filePath = path('test-user-1', 'to-delete-unauth.jpg');
        // Upload file with rules disabled for setup
        await testEnv.withSecurityRulesDisabled(async (context) => {
          const adminStorage = context.storage();
          await adminStorage.ref(filePath).put(validImage, validMetadata);
        });
        // Test delete with rules enabled
        const storage = testEnv.unauthenticatedContext().storage();
        await assertFails(storage.ref(filePath).delete());
      });
    });
  });

  // --- /receipts/{userId}/{fileName} Tests ---
  describe('Storage path: /receipts/{userId}/{fileName}', () => {
    const path = (userId, fileName) => `receipts/${userId}/${fileName}`;
    const validReceiptImage = createBuffer(1 * 1024 * 1024); // 1MB (within 5MB limit)
    const oversizedReceiptImage = createBuffer(5 * 1024 * 1024 + 1); // 5MB + 1 byte
    const validReceiptMetadata = { contentType: 'image/jpeg' };
    const invalidReceiptMetadata = { contentType: 'text/plain' };

    /**
     * Tests read access for receipt images.
     */
    describe('Read', () => {
      it('authenticated users can read their own receipt images', async () => {
        const filePath = path('test-user-1', 'my-receipt-read.jpg');
        // Upload file with rules disabled for setup
        await testEnv.withSecurityRulesDisabled(async (context) => {
          const adminStorage = context.storage();
          await adminStorage.ref(filePath).put(validReceiptImage, validReceiptMetadata);
        });
        // Test read with rules enabled
        const storage = testEnv.authenticatedContext('test-user-1').storage();
        await assertSucceeds(storage.ref(filePath).getDownloadURL());
      });

      it('authenticated users cannot read other users receipt images', async () => {
        const filePath = path('test-user-2', 'bob-receipt-read.jpg');
        // Upload file with rules disabled for setup
        await testEnv.withSecurityRulesDisabled(async (context) => {
          const adminStorage = context.storage();
          await adminStorage.ref(filePath).put(validReceiptImage, validReceiptMetadata);
        });
        // Test read with rules enabled
        const storage = testEnv.authenticatedContext('test-user-1').storage();
        await assertFails(storage.ref(filePath).getDownloadURL());
      });

      it('unauthenticated users cannot read any receipt image', async () => {
        const filePath = path('test-user-1', 'my-receipt-unauth-read.jpg');
        // Upload file with rules disabled for setup
        await testEnv.withSecurityRulesDisabled(async (context) => {
          const adminStorage = context.storage();
          await adminStorage.ref(filePath).put(validReceiptImage, validReceiptMetadata);
        });
        // Test read with rules enabled
        const storage = testEnv.unauthenticatedContext().storage();
        await assertFails(storage.ref(filePath).getDownloadURL());
      });
    });

    /**
     * Tests create/update access for receipt images.
     */
    describe('Create/Update', () => {
      it('authenticated users can upload valid receipt images to their own path', async () => {
        const storage = testEnv.authenticatedContext('test-user-1').storage();
        await assertSucceeds(storage.ref(path('test-user-1', 'my-receipt.jpg')).put(validReceiptImage, validReceiptMetadata));
      });

      it('authenticated users cannot upload receipt images to another user\'s path', async () => {
        const storage = testEnv.authenticatedContext('test-user-1').storage();
        await assertFails(storage.ref(path('test-user-2', 'my-receipt.jpg')).put(validReceiptImage, validReceiptMetadata));
      });

      it('unauthenticated users cannot upload any receipt image', async () => {
        const storage = testEnv.unauthenticatedContext().storage();
        await assertFails(storage.ref(path('test-user-1', 'unauthenticated.jpg')).put(validReceiptImage, validReceiptMetadata));
      });

      it('authenticated users cannot upload receipt images exceeding the size limit', async () => {
        const storage = testEnv.authenticatedContext('test-user-1').storage();
        await assertFails(storage.ref(path('test-user-1', 'oversized-receipt.jpg')).put(oversizedReceiptImage, validReceiptMetadata));
      });

      it('authenticated users cannot upload receipt images with an invalid content type', async () => {
        const storage = testEnv.authenticatedContext('test-user-1').storage();
        await assertFails(storage.ref(path('test-user-1', 'invalid-type-receipt.txt')).put(validReceiptImage, invalidReceiptMetadata));
      });
    });

    /**
     * Tests delete access for receipt images.
     */
    describe('Delete', () => {
      it('authenticated users can delete their own receipt images', async () => {
        const filePath = path('test-user-1', 'to-delete-receipt.jpg');
        // Upload file with rules disabled for setup
        await testEnv.withSecurityRulesDisabled(async (context) => {
          const adminStorage = context.storage();
          await adminStorage.ref(filePath).put(validReceiptImage, validReceiptMetadata);
        });
        // Test delete with rules enabled
        const storage = testEnv.authenticatedContext('test-user-1').storage();
        await assertSucceeds(storage.ref(filePath).delete());
      });

      it('authenticated users cannot delete other users receipt images', async () => {
        const filePath = path('test-user-2', 'bob-to-delete-receipt.jpg');
        // Upload file with rules disabled for setup
        await testEnv.withSecurityRulesDisabled(async (context) => {
          const adminStorage = context.storage();
          await adminStorage.ref(filePath).put(validReceiptImage, validReceiptMetadata);
        });
        // Test delete with rules enabled
        const storage = testEnv.authenticatedContext('test-user-1').storage();
        await assertFails(storage.ref(filePath).delete());
      });

      it('unauthenticated users cannot delete any receipt image', async () => {
        const filePath = path('test-user-1', 'to-delete-receipt-unauth.jpg');
        // Upload file with rules disabled for setup
        await testEnv.withSecurityRulesDisabled(async (context) => {
          const adminStorage = context.storage();
          await adminStorage.ref(filePath).put(validReceiptImage, validReceiptMetadata);
        });
        // Test delete with rules enabled
        const storage = testEnv.unauthenticatedContext().storage();
        await assertFails(storage.ref(filePath).delete());
      });
    });
  });

  // --- /documents/{userId}/{fileName} Tests ---
  describe('Storage path: /documents/{userId}/{fileName}', () => {
    const path = (userId, fileName) => `documents/${userId}/${fileName}`;
    const validDocument = createBuffer(1 * 1024 * 1024); // 1MB (within 10MB limit)
    const oversizedDocument = createBuffer(10 * 1024 * 1024 + 1); // 10MB + 1 byte
    const validImageMetadata = { contentType: 'image/jpeg' };
    const validPdfMetadata = { contentType: 'application/pdf' };
    const invalidMetadata = { contentType: 'text/plain' };

    /**
     * Tests read access for documents.
     */
    describe('Read', () => {
      it('authenticated users can read their own documents', async () => {
        const filePath = path('test-user-1', 'my-document-read.jpg');
        // Upload file with rules disabled for setup
        await testEnv.withSecurityRulesDisabled(async (context) => {
          const adminStorage = context.storage();
          await adminStorage.ref(filePath).put(validDocument, validImageMetadata);
        });
        // Test read with rules enabled
        const storage = testEnv.authenticatedContext('test-user-1').storage();
        await assertSucceeds(storage.ref(filePath).getDownloadURL());
      });

      it('authenticated users cannot read other users documents', async () => {
        const filePath = path('test-user-2', 'bob-document-read.jpg');
        // Upload file with rules disabled for setup
        await testEnv.withSecurityRulesDisabled(async (context) => {
          const adminStorage = context.storage();
          await adminStorage.ref(filePath).put(validDocument, validImageMetadata);
        });
        // Test read with rules enabled
        const storage = testEnv.authenticatedContext('test-user-1').storage();
        await assertFails(storage.ref(filePath).getDownloadURL());
      });

      it('unauthenticated users cannot read any document', async () => {
        const filePath = path('test-user-1', 'my-document-unauth-read.jpg');
        // Upload file with rules disabled for setup
        await testEnv.withSecurityRulesDisabled(async (context) => {
          const adminStorage = context.storage();
          await adminStorage.ref(filePath).put(validDocument, validImageMetadata);
        });
        // Test read with rules enabled
        const storage = testEnv.unauthenticatedContext().storage();
        await assertFails(storage.ref(filePath).getDownloadURL());
      });
    });

    /**
     * Tests create/update access for documents.
     */
    describe('Create/Update', () => {
      it('authenticated users can upload valid documents (image) to their own path', async () => {
        const storage = testEnv.authenticatedContext('test-user-1').storage();
        await assertSucceeds(storage.ref(path('test-user-1', 'my-document.jpg')).put(validDocument, validImageMetadata));
      });

      it('authenticated users can upload valid documents (pdf) to their own path', async () => {
        const storage = testEnv.authenticatedContext('test-user-1').storage();
        await assertSucceeds(storage.ref(path('test-user-1', 'my-document.pdf')).put(validDocument, validPdfMetadata));
      });

      it('authenticated users cannot upload documents to another user\'s path', async () => {
        const storage = testEnv.authenticatedContext('test-user-1').storage();
        await assertFails(storage.ref(path('test-user-2', 'my-document.jpg')).put(validDocument, validImageMetadata));
      });

      it('unauthenticated users cannot upload any document', async () => {
        const storage = testEnv.unauthenticatedContext().storage();
        await assertFails(storage.ref(path('test-user-1', 'unauthenticated.pdf')).put(validDocument, validPdfMetadata));
      });

      it('authenticated users cannot upload documents exceeding the size limit', async () => {
        const storage = testEnv.authenticatedContext('test-user-1').storage();
        await assertFails(storage.ref(path('test-user-1', 'oversized-document.jpg')).put(oversizedDocument, validImageMetadata));
      });

      it('authenticated users cannot upload documents with an invalid content type', async () => {
        const storage = testEnv.authenticatedContext('test-user-1').storage();
        await assertFails(storage.ref(path('test-user-1', 'invalid-type-document.txt')).put(validDocument, invalidMetadata));
      });
    });

    /**
     * Tests delete access for documents.
     */
    describe('Delete', () => {
      it('authenticated users can delete their own documents', async () => {
        const filePath = path('test-user-1', 'to-delete-document.jpg');
        // Upload file with rules disabled for setup
        await testEnv.withSecurityRulesDisabled(async (context) => {
          const adminStorage = context.storage();
          await adminStorage.ref(filePath).put(validDocument, validImageMetadata);
        });
        // Test delete with rules enabled
        const storage = testEnv.authenticatedContext('test-user-1').storage();
        await assertSucceeds(storage.ref(filePath).delete());
      });

      it('authenticated users cannot delete other users documents', async () => {
        const filePath = path('test-user-2', 'bob-to-delete-document.jpg');
        // Upload file with rules disabled for setup
        await testEnv.withSecurityRulesDisabled(async (context) => {
          const adminStorage = context.storage();
          await adminStorage.ref(filePath).put(validDocument, validImageMetadata);
        });
        // Test delete with rules enabled
        const storage = testEnv.authenticatedContext('test-user-1').storage();
        await assertFails(storage.ref(filePath).delete());
      });

      it('unauthenticated users cannot delete any document', async () => {
        const filePath = path('test-user-1', 'to-delete-document-unauth.jpg');
        // Upload file with rules disabled for setup
        await testEnv.withSecurityRulesDisabled(async (context) => {
          const adminStorage = context.storage();
          await adminStorage.ref(filePath).put(validDocument, validImageMetadata);
        });
        // Test delete with rules enabled
        const storage = testEnv.unauthenticatedContext().storage();
        await assertFails(storage.ref(filePath).delete());
      });
    });
  });

  // --- /inventory/{userId}/{productId}/images/{imageId} Tests ---
  describe('Storage path: /inventory/{userId}/{productId}/images/{imageId}', () => {
    const path = (userId, productId, imageId) => `inventory/${userId}/${productId}/images/${imageId}`;
    const validInventoryImage = createBuffer(10 * 1024); // 10KB (within 5MB limit)
    const oversizedInventoryImage = createBuffer(5 * 1024 * 1024 + 1); // 5MB + 1 byte
    const validInventoryMetadata = { contentType: 'image/jpeg' };
    const invalidInventoryMetadata = { contentType: 'text/plain' };
    let aliceProductId, aliceInventoryId;
    let bobProductId, bobInventoryId;

    beforeEach(async () => {
      aliceProductId = 'alice-product-for-storage';
      aliceInventoryId = 'alice-inventory-for-storage';
      bobProductId = 'bob-product-for-storage';
      bobInventoryId = 'bob-inventory-for-storage';

      // Create products and inventory items in Firestore for cross-service validation, with rules disabled
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const adminDb = context.firestore();
        await adminDb.collection('products').doc(aliceProductId).set({ userId: 'test-user-1', name: 'Alice Product for Storage', unitPrice: 10.00, createdAt: new Date() });
        await adminDb.collection('inventory').doc(aliceInventoryId).set({ userId: 'test-user-1', name: 'Alice Inventory for Storage', productId: aliceProductId, quantity: 10, createdAt: new Date(), updatedAt: new Date() });
        await adminDb.collection('products').doc(bobProductId).set({ userId: 'test-user-2', name: 'Bob Product for Storage', unitPrice: 20.00, createdAt: new Date() });
        await adminDb.collection('inventory').doc(bobInventoryId).set({ userId: 'test-user-2', name: 'Bob Inventory for Storage', productId: bobProductId, quantity: 20, createdAt: new Date(), updatedAt: new Date() });
      });
    });

    /**
     * Tests read access for inventory item images.
     */
    describe('Read', () => {
      it('authenticated users can read their own inventory item images', async () => {
        const filePath = path('test-user-1', aliceProductId, 'my-inventory-image-read.jpg');
        // Upload file with rules disabled for setup
        await testEnv.withSecurityRulesDisabled(async (context) => {
          const adminStorage = context.storage();
          await adminStorage.ref(filePath).put(validInventoryImage, validInventoryMetadata);
        });
        // Test read with rules enabled
        const storage = testEnv.authenticatedContext('test-user-1').storage();
        await assertSucceeds(storage.ref(filePath).getDownloadURL());
      });

      it('authenticated users cannot read other users inventory item images', async () => {
        const filePath = path('test-user-2', bobProductId, 'bob-inventory-image-read.jpg');
        // Upload file with rules disabled for setup
        await testEnv.withSecurityRulesDisabled(async (context) => {
          const adminStorage = context.storage();
          await adminStorage.ref(filePath).put(validInventoryImage, validInventoryMetadata);
        });
        // Test read with rules enabled
        const storage = testEnv.authenticatedContext('test-user-1').storage();
        await assertFails(storage.ref(filePath).getDownloadURL());
      });

      it('unauthenticated users cannot read any inventory item image', async () => {
        const filePath = path('test-user-1', aliceProductId, 'my-inventory-image-unauth-read.jpg');
        // Upload file with rules disabled for setup
        await testEnv.withSecurityRulesDisabled(async (context) => {
          const adminStorage = context.storage();
          await adminStorage.ref(filePath).put(validInventoryImage, validInventoryMetadata);
        });
        // Test read with rules enabled
        const storage = testEnv.unauthenticatedContext().storage();
        await assertFails(storage.ref(filePath).getDownloadURL());
      });
    });

    /**
     * Tests create/update access for inventory item images.
     */
    describe('Create/Update', () => {
      it('authenticated users can upload valid inventory item images to their own path referencing an owned inventory item', async () => {
        const storage = testEnv.authenticatedContext('test-user-1').storage();
        await assertSucceeds(storage.ref(path('test-user-1', aliceProductId, 'my-inventory-image.jpg')).put(validInventoryImage, validInventoryMetadata));
      });

      it('authenticated users cannot upload inventory item images to another user\'s path', async () => {
        const storage = testEnv.authenticatedContext('test-user-1').storage();
        await assertFails(storage.ref(path('test-user-2', aliceProductId, 'my-inventory-image.jpg')).put(validInventoryImage, validInventoryMetadata));
      });

      it('authenticated users cannot upload inventory item images referencing a non-existent product', async () => {
        const storage = testEnv.authenticatedContext('test-user-1').storage();
        await assertFails(storage.ref(path('test-user-1', 'non-existent-product', 'my-inventory-image.jpg')).put(validInventoryImage, validInventoryMetadata));
      });

      it('authenticated users cannot upload inventory item images referencing a product owned by another user', async () => {
        const storage = testEnv.authenticatedContext('test-user-1').storage();
        await assertFails(storage.ref(path('test-user-1', bobProductId, 'my-inventory-image.jpg')).put(validInventoryImage, validInventoryMetadata));
      });

      it('authenticated users cannot upload inventory item images exceeding the size limit', async () => {
        const storage = testEnv.authenticatedContext('test-user-1').storage();
        await assertFails(storage.ref(path('test-user-1', aliceProductId, 'oversized-inventory-image.jpg')).put(oversizedInventoryImage, validInventoryMetadata));
      });

      it('authenticated users cannot upload inventory item images with an invalid content type', async () => {
        const storage = testEnv.authenticatedContext('test-user-1').storage();
        await assertFails(storage.ref(path('test-user-1', aliceProductId, 'invalid-type-inventory-image.txt')).put(validInventoryImage, invalidInventoryMetadata));
      });
    });

    /**
     * Tests delete access for inventory item images.
     */
    describe('Delete', () => {
      it('authenticated users can delete their own inventory item images referencing an owned inventory item', async () => {
        const filePath = path('test-user-1', aliceProductId, 'to-delete-inventory-image.jpg');
        // Upload file with rules disabled for setup
        await testEnv.withSecurityRulesDisabled(async (context) => {
          const adminStorage = context.storage();
          await adminStorage.ref(filePath).put(validInventoryImage, validInventoryMetadata);
        });
        // Test delete with rules enabled
        const storage = testEnv.authenticatedContext('test-user-1').storage();
        await assertSucceeds(storage.ref(filePath).delete());
      });

      it('authenticated users cannot delete inventory item images from another user\'s path', async () => {
        const filePath = path('test-user-2', bobProductId, 'bob-to-delete-inventory-image.jpg');
        // Upload file with rules disabled for setup
        await testEnv.withSecurityRulesDisabled(async (context) => {
          const adminStorage = context.storage();
          await adminStorage.ref(filePath).put(validInventoryImage, validInventoryMetadata);
        });
        // Test delete with rules enabled
        const storage = testEnv.authenticatedContext('test-user-1').storage();
        await assertFails(storage.ref(filePath).delete());
      });

      it('authenticated users cannot delete inventory item images referencing a non-existent product', async () => {
        const filePath = path('test-user-1', 'non-existent-product-delete', 'to-delete-inventory-image.jpg');
        // Upload file with rules disabled for setup
        await testEnv.withSecurityRulesDisabled(async (context) => {
          const adminStorage = context.storage();
          await adminStorage.ref(filePath).put(validInventoryImage, validInventoryMetadata);
        });
        // Test delete with rules enabled
        const storage = testEnv.authenticatedContext('test-user-1').storage();
        await assertFails(storage.ref(filePath).delete());
      });

      it('authenticated users cannot delete inventory item images referencing a product owned by another user', async () => {
        const filePath = path('test-user-1', bobProductId, 'to-delete-inventory-image.jpg'); // Alice trying to delete a file under Bob's product ID path
        // Upload file with rules disabled for setup
        await testEnv.withSecurityRulesDisabled(async (context) => {
          const adminStorage = context.storage();
          await adminStorage.ref(filePath).put(validInventoryImage, validInventoryMetadata);
        });
        // Test delete with rules enabled
        const storage = testEnv.authenticatedContext('test-user-1').storage();
        await assertFails(storage.ref(filePath).delete());
      });

      it('unauthenticated users cannot delete any inventory item image', async () => {
        const filePath = path('test-user-1', aliceProductId, 'to-delete-inventory-image-unauth.jpg');
        // Upload file with rules disabled for setup
        await testEnv.withSecurityRulesDisabled(async (context) => {
          const adminStorage = context.storage();
          await adminStorage.ref(filePath).put(validInventoryImage, validInventoryMetadata);
        });
        // Test delete with rules enabled
        const storage = testEnv.unauthenticatedContext().storage();
        await assertFails(storage.ref(filePath).delete());
      });
    });
  });

  // --- /exports/{userId}/{fileName} Tests ---
  describe('Storage path: /exports/{userId}/{fileName}', () => {
    const path = (userId, fileName) => `exports/${userId}/${fileName}`;
    const testFile = createBuffer(10 * 1024); // 10KB
    const validMetadata = { contentType: 'text/csv' }; // Assuming exports are CSV

    /**
     * Tests read access for exports.
     */
    describe('Read', () => {
      it('authenticated users can read their own exports', async () => {
        const filePath = path('test-user-1', 'my-export-read.csv');
        // Upload file with rules disabled for setup
        await testEnv.withSecurityRulesDisabled(async (context) => {
          const adminStorage = context.storage();
          await adminStorage.ref(filePath).put(testFile, validMetadata);
        });
        // Test read with rules enabled
        const storage = testEnv.authenticatedContext('test-user-1').storage();
        await assertSucceeds(storage.ref(filePath).getDownloadURL());
      });

      it('authenticated users cannot read other users exports', async () => {
        const filePath = path('test-user-2', 'bob-export-read.csv');
        // Upload file with rules disabled for setup
        await testEnv.withSecurityRulesDisabled(async (context) => {
          const adminStorage = context.storage();
          await adminStorage.ref(filePath).put(testFile, validMetadata);
        });
        // Test read with rules enabled
        const storage = testEnv.authenticatedContext('test-user-1').storage();
        await assertFails(storage.ref(filePath).getDownloadURL());
      });

      it('unauthenticated users cannot read any export', async () => {
        const filePath = path('test-user-1', 'my-export-unauth-read.csv');
        // Upload file with rules disabled for setup
        await testEnv.withSecurityRulesDisabled(async (context) => {
          const adminStorage = context.storage();
          await adminStorage.ref(filePath).put(testFile, validMetadata);
        });
        // Test read with rules enabled
        const storage = testEnv.unauthenticatedContext().storage();
        await assertFails(storage.ref(filePath).getDownloadURL());
      });
    });

    /**
     * Tests create/update access for exports (should be denied for clients).
     */
    describe('Create/Update', () => {
      it('authenticated users cannot upload exports', async () => {
        const storage = testEnv.authenticatedContext('test-user-1').storage();
        await assertFails(storage.ref(path('test-user-1', 'my-export.csv')).put(testFile, validMetadata));
      });

      it('unauthenticated users cannot upload exports', async () => {
        const storage = testEnv.unauthenticatedContext().storage();
        await assertFails(storage.ref(path('test-user-1', 'unauthenticated-export.csv')).put(testFile, validMetadata));
      });
    });

    /**
     * Tests delete access for exports.
     */
    describe('Delete', () => {
      it('authenticated users can delete their own exports', async () => {
        const filePath = path('test-user-1', 'to-delete-export.csv');
        // Upload file with rules disabled for setup
        await testEnv.withSecurityRulesDisabled(async (context) => {
          const adminStorage = context.storage();
          await adminStorage.ref(filePath).put(testFile, validMetadata);
        });
        // Test delete with rules enabled
        const storage = testEnv.authenticatedContext('test-user-1').storage();
        await assertSucceeds(storage.ref(filePath).delete());
      });

      it('authenticated users cannot delete other users exports', async () => {
        const filePath = path('test-user-2', 'bob-to-delete-export.csv');
        // Upload file with rules disabled for setup
        await testEnv.withSecurityRulesDisabled(async (context) => {
          const adminStorage = context.storage();
          await adminStorage.ref(filePath).put(testFile, validMetadata);
        });
        // Test delete with rules enabled
        const storage = testEnv.authenticatedContext('test-user-1').storage();
        await assertFails(storage.ref(filePath).delete());
      });

      it('unauthenticated users cannot delete any export', async () => {
        const filePath = path('test-user-1', 'to-delete-export-unauth.csv');
        // Upload file with rules disabled for setup
        await testEnv.withSecurityRulesDisabled(async (context) => {
          const adminStorage = context.storage();
          await adminStorage.ref(filePath).put(testFile, validMetadata);
        });
        // Test delete with rules enabled
        const storage = testEnv.unauthenticatedContext().storage();
        await assertFails(storage.ref(filePath).delete());
      });
    });
  });
});
