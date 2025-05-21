// File: server/tests/security/storage.test.js
// Date: 2025-05-18
// Description: Comprehensive Storage security rules tests verifying user authorization, file restrictions, and cross-service validations, using withSecurityRulesDisabled for data setup.
// Reasoning: Ensures all Storage security rules are thoroughly tested to protect user files and allow legitimate operations, with reliable data setup.

/**
 * Issues in Storage Test File (server/tests/security/storage.test.js)
 *
 * 1. Similar issues to the Firestore test file
 * 2. Additional complexities:
 *    - Creating and uploading files
 *    - Cross-service validation with Firestore
 *    - Storage emulator connection details
 *
 * Fix approach would be similar to Firestore test file, but with additional
 * considerations for Storage-specific testing.
 */

// Increase timeout for Storage tests as file operations can take longer
jest.setTimeout(120000); // 2 minutes

const {
  setupTestEnv,
  cleanupTestEnv,
  assertFails,
  assertSucceeds,
  PROJECT_ID,
  clearFirestore // Import clearFirestore for cross-service tests
} = require('./helpers/setup');
const {
  getAuthenticatedStorage,
  getUnauthenticatedStorage
} = require('./helpers/auth');
const {
  createTestUser, // Import createTestUser for cross-service tests
  createTestInventory // Import createTestInventory for cross-service tests
} = require('./helpers/data'); // Import data creation helpers

describe('Storage Security Rules', () => {
  let aliceId, bobId;
  let aliceStorage, bobStorage, unauthenticatedStorage;

  // Helper function to create a buffer of a specific size
  const createBuffer = (sizeInBytes) => Buffer.alloc(sizeInBytes, 'x');

  beforeAll(async () => {
    await setupTestEnv(PROJECT_ID);
    aliceId = 'alice';
    bobId = 'bob';
    aliceStorage = await getAuthenticatedStorage(aliceId);
    bobStorage = await getAuthenticatedStorage(bobId);
    unauthenticatedStorage = await getUnauthenticatedStorage();

    // Create test users in Firestore for auth context, with rules disabled
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const adminDb = context.firestore();
      await adminDb.collection('users').doc(aliceId).set({ userId: aliceId, email: `${aliceId}@example.com`, createdAt: new Date() });
      await adminDb.collection('users').doc(bobId).set({ userId: bobId, email: `${bobId}@example.com`, createdAt: new Date() });
    });
  });

  afterAll(async () => {
    await cleanupTestEnv();
  });

  beforeEach(async () => {
    // Clear Firestore data between tests for cross-service validation tests
    await clearFirestore();
    // Re-create users after clearing Firestore, with rules disabled
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const adminDb = context.firestore();
      await adminDb.collection('users').doc(aliceId).set({ userId: aliceId, email: `${aliceId}@example.com`, createdAt: new Date() });
      await adminDb.collection('users').doc(bobId).set({ userId: bobId, email: `${bobId}@example.com`, createdAt: new Date() });
    });
    // Note: Clearing Storage is not directly supported by the emulator API,
    // so tests should be designed to not rely on a clean storage state or
    // use unique file paths for each test.
  });

  // --- /profiles/{userId}/{fileName} Tests ---
  describe('Storage path: /profiles/{userId}/{fileName}', () => {
    const path = (userId, fileName) => `profiles/${userId}/${fileName}`;
    const validImage = createBuffer(10 * 1024); // 10KB
    const oversizedImage = createBuffer(2.1 * 1024 * 1024); // > 2MB
    const invalidTypeFile = createBuffer(10 * 1024);
    const validMetadata = { contentType: 'image/jpeg' };
    const invalidMetadata = { contentType: 'application/pdf' };

    /**
     * Tests read access for profile images.
     */
    describe('Read', () => {
      it('authenticated users can read their own profile images', async () => {
        const filePath = path(aliceId, 'my-profile-read.jpg');
        // Upload file with rules disabled for setup
        await testEnv.withSecurityRulesDisabled(async (context) => {
          const adminStorage = context.storage();
          await adminStorage.ref(filePath).put(validImage, validMetadata);
        });
        // Test read with rules enabled
        await assertSucceeds(aliceStorage.ref(filePath).getDownloadURL());
      });

      it('authenticated users cannot read other users profile images', async () => {
        const filePath = path(bobId, 'bob-profile-read.jpg');
        // Upload file with rules disabled for setup
        await testEnv.withSecurityRulesDisabled(async (context) => {
          const adminStorage = context.storage();
          await adminStorage.ref(filePath).put(validImage, validMetadata);
        });
        // Test read with rules enabled
        await assertFails(aliceStorage.ref(filePath).getDownloadURL());
      });

      it('unauthenticated users cannot read any profile image', async () => {
        const filePath = path(aliceId, 'my-profile-unauth-read.jpg');
        // Upload file with rules disabled for setup
        await testEnv.withSecurityRulesDisabled(async (context) => {
          const adminStorage = context.storage();
          await adminStorage.ref(filePath).put(validImage, validMetadata);
        });
        // Test read with rules enabled
        await assertFails(unauthenticatedStorage.ref(filePath).getDownloadURL());
      });
    });

    /**
     * Tests create/update access for profile images.
     */
    describe('Create/Update', () => {
      it('authenticated users can upload valid profile images to their own path', async () => {
        await assertSucceeds(aliceStorage.ref(path(aliceId, 'my-profile.jpg')).put(validImage, validMetadata));
      });

      it('authenticated users cannot upload profile images to another user\'s path', async () => {
        await assertFails(aliceStorage.ref(path(bobId, 'my-profile.jpg')).put(validImage, validMetadata));
      });

      it('authenticated users cannot upload oversized profile images', async () => {
        await assertFails(aliceStorage.ref(path(aliceId, 'large-profile.jpg')).put(oversizedImage, validMetadata));
      });

      it('authenticated users cannot upload profile images with invalid content types', async () => {
        await assertFails(aliceStorage.ref(path(aliceId, 'invalid-profile.js')).put(invalidTypeFile, invalidMetadata));
      });

      it('unauthenticated users cannot upload any profile image', async () => {
        await assertFails(unauthenticatedStorage.ref(path(aliceId, 'unauthenticated.jpg')).put(validImage, validMetadata));
      });
    });

    /**
     * Tests delete access for profile images.
     */
    describe('Delete', () => {
      it('authenticated users can delete their own profile images', async () => {
        const filePath = path(aliceId, 'to-delete.jpg');
        // Upload file with rules disabled for setup
        await testEnv.withSecurityRulesDisabled(async (context) => {
          const adminStorage = context.storage();
          await adminStorage.ref(filePath).put(validImage, validMetadata);
        });
        // Test delete with rules enabled
        await assertSucceeds(aliceStorage.ref(filePath).delete());
      });

      it('authenticated users cannot delete other users profile images', async () => {
        const filePath = path(bobId, 'bob-to-delete.jpg');
        // Upload file with rules disabled for setup
        await testEnv.withSecurityRulesDisabled(async (context) => {
          const adminStorage = context.storage();
          await adminStorage.ref(filePath).put(validImage, validMetadata);
        });
        // Test delete with rules enabled
        await assertFails(aliceStorage.ref(filePath).delete());
      });

      it('unauthenticated users cannot delete any profile image', async () => {
        const filePath = path(aliceId, 'to-delete-unauth.jpg');
        // Upload file with rules disabled for setup
        await testEnv.withSecurityRulesDisabled(async (context) => {
          const adminStorage = context.storage();
          await adminStorage.ref(filePath).put(validImage, validMetadata);
        });
        // Test delete with rules enabled
        await assertFails(unauthenticatedStorage.ref(filePath).delete());
      });
    });
  });

  // --- /documents/{userId}/{fileName} Tests ---
  describe('Storage path: /documents/{userId}/{fileName}', () => {
    const path = (userId, fileName) => `documents/${userId}/${fileName}`;
    const validFile = createBuffer(1 * 1024 * 1024); // 1MB
    const oversizedFile = createBuffer(10.1 * 1024 * 1024); // > 10MB
    const validImageMetadata = { contentType: 'image/jpeg' };
    const validPdfMetadata = { contentType: 'application/pdf' };
    const invalidTypeMetadata = { contentType: 'text/plain' };

    /**
     * Tests read access for documents.
     */
    describe('Read', () => {
      it('authenticated users can read their own documents', async () => {
        const filePath = path(aliceId, 'my-document-read.jpg');
        // Upload file with rules disabled for setup
        await testEnv.withSecurityRulesDisabled(async (context) => {
          const adminStorage = context.storage();
          await adminStorage.ref(filePath).put(validFile, validImageMetadata);
        });
        // Test read with rules enabled
        await assertSucceeds(aliceStorage.ref(filePath).getDownloadURL());
      });

      it('authenticated users cannot read other users documents', async () => {
        const filePath = path(bobId, 'bob-document-read.jpg');
        // Upload file with rules disabled for setup
        await testEnv.withSecurityRulesDisabled(async (context) => {
          const adminStorage = context.storage();
          await adminStorage.ref(filePath).put(validFile, validImageMetadata);
        });
        // Test read with rules enabled
        await assertFails(aliceStorage.ref(filePath).getDownloadURL());
      });

      it('unauthenticated users cannot read any document', async () => {
        const filePath = path(aliceId, 'my-document-unauth-read.jpg');
        // Upload file with rules disabled for setup
        await testEnv.withSecurityRulesDisabled(async (context) => {
          const adminStorage = context.storage();
          await adminStorage.ref(filePath).put(validFile, validImageMetadata);
        });
        // Test read with rules enabled
        await assertFails(unauthenticatedStorage.ref(filePath).getDownloadURL());
      });
    });

    /**
     * Tests create/update access for documents.
     */
    describe('Create/Update', () => {
      it('authenticated users can upload valid documents (image) to their own path', async () => {
        await assertSucceeds(aliceStorage.ref(path(aliceId, 'my-document.jpg')).put(validFile, validImageMetadata));
      });

      it('authenticated users can upload valid documents (pdf) to their own path', async () => {
        await assertSucceeds(aliceStorage.ref(path(aliceId, 'my-document.pdf')).put(validFile, validPdfMetadata));
      });

      it('authenticated users cannot upload documents to another user\'s path', async () => {
        await assertFails(aliceStorage.ref(path(bobId, 'my-document.jpg')).put(validFile, validImageMetadata));
      });

      it('authenticated users cannot upload oversized documents', async () => {
        await assertFails(aliceStorage.ref(path(aliceId, 'large-document.pdf')).put(oversizedFile, validPdfMetadata));
      });

      it('authenticated users cannot upload documents with invalid content types', async () => {
        await assertFails(aliceStorage.ref(path(aliceId, 'invalid-document.txt')).put(validFile, invalidTypeMetadata));
      });

      it('unauthenticated users cannot upload any document', async () => {
        await assertFails(unauthenticatedStorage.ref(path(aliceId, 'unauthenticated.pdf')).put(validFile, validPdfMetadata));
      });
    });

    /**
     * Tests delete access for documents.
     */
    describe('Delete', () => {
      it('authenticated users can delete their own documents', async () => {
        const filePath = path(aliceId, 'to-delete-document.jpg');
        // Upload file with rules disabled for setup
        await testEnv.withSecurityRulesDisabled(async (context) => {
          const adminStorage = context.storage();
          await adminStorage.ref(filePath).put(validFile, validImageMetadata);
        });
        // Test delete with rules enabled
        await assertSucceeds(aliceStorage.ref(filePath).delete());
      });

      it('authenticated users cannot delete other users documents', async () => {
        const filePath = path(bobId, 'bob-to-delete-document.jpg');
        // Upload file with rules disabled for setup
        await testEnv.withSecurityRulesDisabled(async (context) => {
          const adminStorage = context.storage();
          await adminStorage.ref(filePath).put(validFile, validImageMetadata);
        });
        // Test delete with rules enabled
        await assertFails(aliceStorage.ref(filePath).delete());
      });

      it('unauthenticated users cannot delete any document', async () => {
        const filePath = path(aliceId, 'to-delete-document-unauth.jpg');
        // Upload file with rules disabled for setup
        await testEnv.withSecurityRulesDisabled(async (context) => {
          const adminStorage = context.storage();
          await adminStorage.ref(filePath).put(validFile, validImageMetadata);
        });
        // Test delete with rules enabled
        await assertFails(unauthenticatedStorage.ref(filePath).delete());
      });
    });
  });

  // --- /receipts/{userId}/{fileName} Tests ---
  describe('Storage path: /receipts/{userId}/{fileName}', () => {
    const path = (userId, fileName) => `receipts/${userId}/${fileName}`;
    const validImage = createBuffer(1 * 1024 * 1024); // 1MB
    const oversizedImage = createBuffer(5.1 * 1024 * 1024); // > 5MB
    const invalidTypeFile = createBuffer(10 * 1024);
    const validMetadata = { contentType: 'image/jpeg' };
    const invalidMetadata = { contentType: 'application/pdf' };

    /**
     * Tests read access for receipt images.
     */
    describe('Read', () => {
      it('authenticated users can read their own receipt images', async () => {
        const filePath = path(aliceId, 'my-receipt-read.jpg');
        // Upload file with rules disabled for setup
        await testEnv.withSecurityRulesDisabled(async (context) => {
          const adminStorage = context.storage();
          await adminStorage.ref(filePath).put(validImage, validMetadata);
        });
        // Test read with rules enabled
        await assertSucceeds(aliceStorage.ref(filePath).getDownloadURL());
      });

      it('authenticated users cannot read other users receipt images', async () => {
        const filePath = path(bobId, 'bob-receipt-read.jpg');
        // Upload file with rules disabled for setup
        await testEnv.withSecurityRulesDisabled(async (context) => {
          const adminStorage = context.storage();
          await adminStorage.ref(filePath).put(validImage, validMetadata);
        });
        // Test read with rules enabled
        await assertFails(aliceStorage.ref(filePath).getDownloadURL());
      });

      it('unauthenticated users cannot read any receipt image', async () => {
        const filePath = path(aliceId, 'my-receipt-unauth-read.jpg');
        // Upload file with rules disabled for setup
        await testEnv.withSecurityRulesDisabled(async (context) => {
          const adminStorage = context.storage();
          await adminStorage.ref(filePath).put(validImage, validMetadata);
        });
        // Test read with rules enabled
        await assertFails(unauthenticatedStorage.ref(filePath).getDownloadURL());
      });
    });

    /**
     * Tests create/update access for receipt images.
     */
    describe('Create/Update', () => {
      it('authenticated users can upload valid receipt images to their own path', async () => {
        await assertSucceeds(aliceStorage.ref(path(aliceId, 'my-receipt.jpg')).put(validImage, validMetadata));
      });

      it('authenticated users cannot upload receipt images to another user\'s path', async () => {
        await assertFails(aliceStorage.ref(path(bobId, 'my-receipt.jpg')).put(validImage, validMetadata));
      });

      it('authenticated users cannot upload oversized receipt images', async () => {
        await assertFails(aliceStorage.ref(path(aliceId, 'large-receipt.jpg')).put(oversizedImage, validMetadata));
      });

      it('authenticated users cannot upload receipt images with invalid content types', async () => {
        await assertFails(aliceStorage.ref(path(aliceId, 'invalid-receipt.pdf')).put(invalidTypeFile, invalidMetadata));
      });

      it('unauthenticated users cannot upload any receipt image', async () => {
        await assertFails(unauthenticatedStorage.ref(path(aliceId, 'unauthenticated.jpg')).put(validImage, validMetadata));
      });
    });

    /**
     * Tests delete access for receipt images.
     */
    describe('Delete', () => {
      it('authenticated users can delete their own receipt images', async () => {
        const filePath = path(aliceId, 'to-delete-receipt.jpg');
        // Upload file with rules disabled for setup
        await testEnv.withSecurityRulesDisabled(async (context) => {
          const adminStorage = context.storage();
          await adminStorage.ref(filePath).put(validImage, validMetadata);
        });
        // Test delete with rules enabled
        await assertSucceeds(aliceStorage.ref(filePath).delete());
      });

      it('authenticated users cannot delete other users receipt images', async () => {
        const filePath = path(bobId, 'bob-to-delete-receipt.jpg');
        // Upload file with rules disabled for setup
        await testEnv.withSecurityRulesDisabled(async (context) => {
          const adminStorage = context.storage();
          await adminStorage.ref(filePath).put(validImage, validMetadata);
        });
        // Test delete with rules enabled
        await assertFails(aliceStorage.ref(filePath).delete());
      });

      it('unauthenticated users cannot delete any receipt image', async () => {
        const filePath = path(aliceId, 'to-delete-receipt-unauth.jpg');
        // Upload file with rules disabled for setup
        await testEnv.withSecurityRulesDisabled(async (context) => {
          const adminStorage = context.storage();
          await adminStorage.ref(filePath).put(validImage, validMetadata);
        });
        // Test delete with rules enabled
        await assertFails(unauthenticatedStorage.ref(filePath).delete());
      });
    });
  });

  // --- /inventory/{userId}/{productId}/images/{imageId} Tests ---
  describe('Storage path: /inventory/{userId}/{productId}/images/{imageId}', () => {
    const path = (userId, productId, imageId) => `inventory/${userId}/${productId}/images/${imageId}`;
    const validImage = createBuffer(10 * 1024); // 10KB
    const oversizedImage = createBuffer(5.1 * 1024 * 1024); // > 5MB
    const invalidTypeFile = createBuffer(10 * 1024);
    const validMetadata = { contentType: 'image/jpeg' };
    const invalidMetadata = { contentType: 'application/pdf' };
    let aliceProductId;

    beforeEach(async () => {
      // Create a product and inventory item in Firestore for cross-service validation, with rules disabled
      aliceProductId = 'alice-product-for-storage';
      const aliceInventoryId = 'alice-inventory-for-storage';
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const adminDb = context.firestore();
        await adminDb.collection('products').doc(aliceProductId).set({ userId: aliceId, name: 'Alice Product for Storage', unitPrice: 10.00, createdAt: new Date() });
        await adminDb.collection('inventory').doc(aliceInventoryId).set({ userId: aliceId, name: 'Alice Inventory for Storage', productId: aliceProductId, quantity: 10, createdAt: new Date(), updatedAt: new Date() });
      });
    });

    /**
     * Tests read access for inventory item images.
     */
    describe('Read', () => {
      it('authenticated users can read their own inventory item images', async () => {
        const filePath = path(aliceId, aliceProductId, 'my-inventory-image-read.jpg');
        // Upload file with rules disabled for setup
        await testEnv.withSecurityRulesDisabled(async (context) => {
          const adminStorage = context.storage();
          await adminStorage.ref(filePath).put(validImage, validMetadata);
        });
        // Test read with rules enabled
        await assertSucceeds(aliceStorage.ref(filePath).getDownloadURL());
      });

      it('authenticated users cannot read other users inventory item images', async () => {
        const bobProductId = 'bob-product-for-storage-read';
        const bobInventoryId = 'bob-inventory-for-storage-read';
        const filePath = path(bobId, bobProductId, 'bob-inventory-image-read.jpg');
        // Create product and inventory for bob, with rules disabled
        await testEnv.withSecurityRulesDisabled(async (context) => {
          const adminDb = context.firestore();
          await adminDb.collection('products').doc(bobProductId).set({ userId: bobId, name: 'Bob Product for Storage Read', unitPrice: 20.00, createdAt: new Date() });
          await adminDb.collection('inventory').doc(bobInventoryId).set({ userId: bobId, name: 'Bob Inventory for Storage Read', productId: bobProductId, quantity: 20, createdAt: new Date(), updatedAt: new Date() });
          const adminStorage = context.storage();
          await adminStorage.ref(filePath).put(validImage, validMetadata);
        });
        // Test read with rules enabled
        await assertFails(aliceStorage.ref(filePath).getDownloadURL());
      });

      it('unauthenticated users cannot read any inventory item image', async () => {
        const filePath = path(aliceId, aliceProductId, 'my-inventory-image-unauth-read.jpg');
        // Upload file with rules disabled for setup
        await testEnv.withSecurityRulesDisabled(async (context) => {
          const adminStorage = context.storage();
          await adminStorage.ref(filePath).put(validImage, validMetadata);
        });
        // Test read with rules enabled
        await assertFails(unauthenticatedStorage.ref(filePath).getDownloadURL());
      });
    });

    /**
     * Tests create/update access for inventory item images.
     */
    describe('Create/Update', () => {
      it('authenticated users can upload valid inventory item images to their own path referencing an owned inventory item', async () => {
        await assertSucceeds(aliceStorage.ref(path(aliceId, aliceProductId, 'my-inventory-image.jpg')).put(validImage, validMetadata));
      });

      it('authenticated users cannot upload inventory item images to another user\'s path', async () => {
        await assertFails(aliceStorage.ref(path(bobId, aliceProductId, 'my-inventory-image.jpg')).put(validImage, validMetadata));
      });

      it('authenticated users cannot upload inventory item images referencing a non-existent inventory item', async () => {
        await assertFails(aliceStorage.ref(path(aliceId, 'non-existent-product', 'my-inventory-image.jpg')).put(validImage, validMetadata));
      });

      it('authenticated users cannot upload inventory item images referencing an inventory item owned by another user', async () => {
        const bobProductId = 'bob-product-for-storage';
        const bobInventoryId = 'bob-inventory-for-storage';
        // Create product and inventory for bob, with rules disabled
        await testEnv.withSecurityRulesDisabled(async (context) => {
          const adminDb = context.firestore();
          await adminDb.collection('products').doc(bobProductId).set({ userId: bobId, name: 'Bob Product for Storage', unitPrice: 20.00, createdAt: new Date() });
          await adminDb.collection('inventory').doc(bobInventoryId).set({ userId: bobId, name: 'Bob Inventory for Storage', productId: bobProductId, quantity: 20, createdAt: new Date(), updatedAt: new Date() });
        });
        await assertFails(aliceStorage.ref(path(aliceId, bobProductId, 'my-inventory-image.jpg')).put(validImage, validMetadata));
      });

      it('authenticated users cannot upload oversized inventory item images', async () => {
        await assertFails(aliceStorage.ref(path(aliceId, aliceProductId, 'large-inventory-image.jpg')).put(oversizedImage, validMetadata));
      });

      it('authenticated users cannot upload inventory item images with invalid content types', async () => {
        await assertFails(aliceStorage.ref(path(aliceId, aliceProductId, 'invalid-inventory-image.pdf')).put(invalidTypeFile, invalidMetadata));
      });

      it('unauthenticated users cannot upload any inventory item image', async () => {
        await assertFails(unauthenticatedStorage.ref(path(aliceId, aliceProductId, 'unauthenticated.jpg')).put(validImage, validMetadata));
      });
    });

    /**
     * Tests delete access for inventory item images.
     */
    describe('Delete', () => {
      it('authenticated users can delete their own inventory item images referencing an owned inventory item', async () => {
        const filePath = path(aliceId, aliceProductId, 'to-delete-inventory-image.jpg');
        // Upload file with rules disabled for setup
        await testEnv.withSecurityRulesDisabled(async (context) => {
          const adminStorage = context.storage();
          await adminStorage.ref(filePath).put(validImage, validMetadata);
        });
        // Test delete with rules enabled
        await assertSucceeds(aliceStorage.ref(filePath).delete());
      });

      it('authenticated users cannot delete inventory item images from another user\'s path', async () => {
        const bobProductId = 'bob-product-for-storage-delete';
        const bobInventoryId = 'bob-inventory-for-storage-delete';
        const filePath = path(bobId, bobProductId, 'bob-to-delete-inventory-image.jpg');
        // Create product and inventory for bob, with rules disabled
        await testEnv.withSecurityRulesDisabled(async (context) => {
          const adminDb = context.firestore();
          await adminDb.collection('products').doc(bobProductId).set({ userId: bobId, name: 'Bob Product for Storage Delete', unitPrice: 20.00, createdAt: new Date() });
          await adminDb.collection('inventory').doc(bobInventoryId).set({ userId: bobId, name: 'Bob Inventory for Storage Delete', productId: bobProductId, quantity: 20, createdAt: new Date(), updatedAt: new Date() });
          const adminStorage = context.storage();
          await adminStorage.ref(filePath).put(validImage, validMetadata);
        });
        // Test delete with rules enabled
        await assertFails(aliceStorage.ref(filePath).delete());
      });

      it('authenticated users cannot delete inventory item images referencing a non-existent inventory item', async () => {
        const filePath = path(aliceId, 'non-existent-product-delete', 'to-delete-inventory-image.jpg');
        // Upload file with rules disabled for setup
        await testEnv.withSecurityRulesDisabled(async (context) => {
          const adminStorage = context.storage();
          await adminStorage.ref(filePath).put(validImage, validMetadata);
        });
        // Test delete with rules enabled
        await assertFails(aliceStorage.ref(filePath).delete());
      });

      it('authenticated users cannot delete inventory item images referencing an inventory item owned by another user', async () => {
        const bobProductId = 'bob-product-for-storage-delete-cross';
        const bobInventoryId = 'bob-inventory-for-storage-delete-cross';
        const filePath = path(aliceId, bobProductId, 'to-delete-inventory-image.jpg'); // Alice trying to delete a file under Bob's product ID path
        // Create product and inventory for bob, with rules disabled
        await testEnv.withSecurityRulesDisabled(async (context) => {
          const adminDb = context.firestore();
          await adminDb.collection('products').doc(bobProductId).set({ userId: bobId, name: 'Bob Product for Storage Delete Cross', unitPrice: 20.00, createdAt: new Date() });
          await adminDb.collection('inventory').doc(bobInventoryId).set({ userId: bobId, name: 'Bob Inventory for Storage Delete Cross', productId: bobProductId, quantity: 20, createdAt: new Date(), updatedAt: new Date() });
          const adminStorage = context.storage();
          await adminStorage.ref(filePath).put(validImage, validMetadata);
        });
        // Test delete with rules enabled
        await assertFails(aliceStorage.ref(filePath).delete());
      });

      it('unauthenticated users cannot delete any inventory item image', async () => {
        const filePath = path(aliceId, aliceProductId, 'to-delete-inventory-image-unauth.jpg');
        // Upload file with rules disabled for setup
        await testEnv.withSecurityRulesDisabled(async (context) => {
          const adminStorage = context.storage();
          await adminStorage.ref(filePath).put(validImage, validMetadata);
        });
        // Test delete with rules enabled
        await assertFails(unauthenticatedStorage.ref(filePath).delete());
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
        const filePath = path(aliceId, 'my-export-read.csv');
        // Upload file with rules disabled for setup
        await testEnv.withSecurityRulesDisabled(async (context) => {
          const adminStorage = context.storage();
          await adminStorage.ref(filePath).put(testFile, validMetadata);
        });
        // Test read with rules enabled
        await assertSucceeds(aliceStorage.ref(filePath).getDownloadURL());
      });

      it('authenticated users cannot read other users exports', async () => {
        const filePath = path(bobId, 'bob-export-read.csv');
        // Upload file with rules disabled for setup
        await testEnv.withSecurityRulesDisabled(async (context) => {
          const adminStorage = context.storage();
          await adminStorage.ref(filePath).put(testFile, validMetadata);
        });
        // Test read with rules enabled
        await assertFails(aliceStorage.ref(filePath).getDownloadURL());
      });

      it('unauthenticated users cannot read any export', async () => {
        const filePath = path(aliceId, 'my-export-unauth-read.csv');
        // Upload file with rules disabled for setup
        await testEnv.withSecurityRulesDisabled(async (context) => {
          const adminStorage = context.storage();
          await adminStorage.ref(filePath).put(testFile, validMetadata);
        });
        // Test read with rules enabled
        await assertFails(unauthenticatedStorage.ref(filePath).getDownloadURL());
      });
    });

    /**
     * Tests create/update access for exports (should be denied for clients).
     */
    describe('Create/Update', () => {
      it('authenticated users cannot upload exports', async () => {
        await assertFails(aliceStorage.ref(path(aliceId, 'my-export.csv')).put(testFile, validMetadata));
      });

      it('unauthenticated users cannot upload exports', async () => {
        await assertFails(unauthenticatedStorage.ref(path(aliceId, 'unauthenticated-export.csv')).put(testFile, validMetadata));
      });
    });

    /**
     * Tests delete access for exports.
     */
    describe('Delete', () => {
      it('authenticated users can delete their own exports', async () => {
        const filePath = path(aliceId, 'to-delete-export.csv');
        // Upload file with rules disabled for setup
        await testEnv.withSecurityRulesDisabled(async (context) => {
          const adminStorage = context.storage();
          await adminStorage.ref(filePath).put(testFile, validMetadata);
        });
        // Test delete with rules enabled
        await assertSucceeds(aliceStorage.ref(filePath).delete());
      });

      it('authenticated users cannot delete other users exports', async () => {
        const filePath = path(bobId, 'bob-to-delete-export.csv');
        // Upload file with rules disabled for setup
        await testEnv.withSecurityRulesDisabled(async (context) => {
          const adminStorage = context.storage();
          await adminStorage.ref(filePath).put(testFile, validMetadata);
        });
        // Test delete with rules enabled
        await assertFails(aliceStorage.ref(filePath).delete());
      });

      it('unauthenticated users cannot delete any export', async () => {
        const filePath = path(aliceId, 'to-delete-export-unauth.csv');
        // Upload file with rules disabled for setup
        await testEnv.withSecurityRulesDisabled(async (context) => {
          const adminStorage = context.storage();
          await adminStorage.ref(filePath).put(testFile, validMetadata);
        });
        // Test delete with rules enabled
        await assertFails(unauthenticatedStorage.ref(filePath).delete());
      });
    });
  });
});
