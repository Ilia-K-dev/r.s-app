// Import fetch polyfill for ESM
import fetch from 'node-fetch';
globalThis.fetch = fetch;
globalThis.Request = fetch.Request;
globalThis.Response = fetch.Response;
globalThis.Headers = fetch.Headers;

// Import Firebase testing libraries using ESM syntax
import { initializeTestEnvironment, assertFails, assertSucceeds } from '@firebase/rules-unit-testing';

// Basic security rules tests to verify functionality
async function runBasicSecurityTests() {
  try {
    console.log("Setting up test environment...");
    const testEnv = await initializeTestEnvironment({
      projectId: "project-reciept-reader-id",
      firestore: {
        host: "127.0.0.1",
        port: 8081,
        rules: `
          rules_version = '2';
          service cloud.firestore {
            match /databases/{database}/documents {
              match /users/{userId} {
                allow read, write: if request.auth != null && request.auth.uid == userId;
              }

              match /receipts/{receiptId} {
                allow read: if request.auth != null && resource.data.userId == request.auth.uid;
                allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
                allow update, delete: if request.auth != null && resource.data.userId == request.auth.uid;
              }

              match /documents/{documentId} {
                allow read: if request.auth != null && resource.data.userId == request.auth.uid;
                allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
                allow update, delete: if request.auth != null && resource.data.userId == request.auth.uid;
              }

              match /inventory/{itemId} {
                allow read: if request.auth != null && resource.data.userId == request.auth.uid;
                allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
                allow update, delete: if request.auth != null && resource.data.userId == request.auth.uid;
              }
            }
          }
        `
      }
    });

    console.log("Testing security rules...");

    // Test 1: Unauthenticated user cannot read documents
    {
      const db = testEnv.unauthenticatedContext().firestore();
      console.log("Test 1: Unauthenticated user cannot read documents");
      await assertFails(db.collection("documents").doc("doc1").get());
      console.log("✓ Test 1 passed");
    }

    // Test 2: User can read their own documents
    {
      const db = testEnv.authenticatedContext("user1").firestore();

      // Set up test document
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const admin = context.firestore();
        await admin.collection("documents").doc("doc1").set({
          userId: "user1",
          title: "Test Document"
        });
      });

      console.log("Test 2: User can read their own documents");
      await assertSucceeds(db.collection("documents").doc("doc1").get());
      console.log("✓ Test 2 passed");
    }

    // Test 3: User cannot read another user's documents
    {
      const db = testEnv.authenticatedContext("user2").firestore();
      console.log("Test 3: User cannot read another user's documents");
      await assertFails(db.collection("documents").doc("doc1").get());
      console.log("✓ Test 3 passed");
    }

    // Test 4: User can create a document with their userId
    {
      const db = testEnv.authenticatedContext("user1").firestore();
      console.log("Test 4: User can create a document with their userId");
      await assertSucceeds(db.collection("documents").doc("doc2").set({
        userId: "user1",
        title: "New Document"
      }));
      console.log("✓ Test 4 passed");
    }

    // Test 5: User cannot create a document with another userId
    {
      const db = testEnv.authenticatedContext("user1").firestore();
      console.log("Test 5: User cannot create a document with another userId");
      await assertFails(db.collection("documents").doc("doc3").set({
        userId: "user2",
        title: "Invalid Document"
      }));
      console.log("✓ Test 5 passed");
    }

    // Test 6: Basic inventory rule test
    {
      // Set up test inventory item
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const admin = context.firestore();
        await admin.collection("inventory").doc("item1").set({
          userId: "user1",
          name: "Test Item",
          quantity: 10
        });
      });

      console.log("Test 6: User can read their own inventory");
      const db = testEnv.authenticatedContext("user1").firestore();
      await assertSucceeds(db.collection("inventory").doc("item1").get());
      console.log("✓ Test 6 passed");
    }

    // Cleanup
    await testEnv.cleanup();
    console.log("All tests completed successfully!");

  } catch (error) {
    console.error("Test failed:", error);
    process.exitCode = 1;
  }
}

// Run the tests
runBasicSecurityTests();
